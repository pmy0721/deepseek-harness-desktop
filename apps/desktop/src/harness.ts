import { spawn, type ChildProcess } from 'node:child_process'
import { createWriteStream, mkdirSync, type WriteStream } from 'node:fs'
import { dirname } from 'node:path'
import { EventEmitter } from 'node:events'

/**
 * The web app prints one tokenized `dsh web: http://127.0.0.1:<port>/?...`
 * line (optionally followed by ` (LAN: ...)`) once its Loader tree has settled;
 * that line is the documented readiness signal (`packages/bundle/web-app`), so
 * the supervisor treats it as the moment the window may load the authenticated
 * URL. Matching the line also gives the real port when the invocation used
 * `--port 0`.
 */
const READINESS_PREFIX = 'dsh web: '
const STARTUP_OUTPUT_LIMIT = 32_768

/** Incremental parser for the Web Host's canonical readiness line. */
export interface ReadinessParser {
  /**
   * Consume one stdout chunk.
   * @param chunk - Text emitted by the Host.
   * @returns The authenticated loopback URL once a complete readiness line is observed.
   */
  push(chunk: string): string | undefined
  /**
   * Finish the stream and require a readiness line.
   * @returns The parsed authenticated loopback URL.
   */
  finalize(): string
}

/**
 * Assert one readiness line as a root loopback HTTP URL with an explicit port.
 * The query carries the Host's process token and must reach the renderer
 * unchanged. A trailing ` (LAN: ...)` candidate is ignored: only the first
 * whitespace-delimited token is the canonical URL.
 */
function parseReadinessLine(line: string): string | undefined {
  if (!line.startsWith(READINESS_PREFIX)) return undefined
  const token = line.slice(READINESS_PREFIX.length).split(/\s/u, 1)[0]
  if (token === undefined) throw new Error(`desktop Host readiness line has no URL: ${line}`)

  let url: URL
  try {
    url = new URL(token)
  } catch {
    throw new Error(`desktop Host readiness URL is invalid: ${token}`)
  }
  const port = Number(url.port)
  if (url.protocol !== 'http:'
    || (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost')
    || url.pathname !== '/'
    || url.hash !== ''
    || !Number.isInteger(port)
    || port < 1
    || port > 65_535) {
    throw new Error(`desktop Host readiness URL must be loopback HTTP with an explicit port: ${token}`)
  }
  return url.search === '' ? url.origin : url.href
}

/**
 * Create a line parser whose result is stable after readiness.
 * @returns A fresh incremental parser.
 */
export function createReadinessParser(): ReadinessParser {
  let pending = ''
  let readyUrl: string | undefined

  const accept = (line: string): string | undefined => {
    const parsed = parseReadinessLine(line.replace(/\r$/u, ''))
    if (parsed === undefined) return undefined
    if (readyUrl !== undefined && parsed !== readyUrl) {
      throw new Error(`desktop Host emitted conflicting readiness URLs: ${readyUrl} and ${parsed}`)
    }
    readyUrl = parsed
    return readyUrl
  }

  return {
    push(chunk) {
      pending += chunk
      for (;;) {
        const newline = pending.indexOf('\n')
        if (newline === -1) return readyUrl
        const line = pending.slice(0, newline)
        pending = pending.slice(newline + 1)
        const parsed = accept(line)
        if (parsed !== undefined) return parsed
      }
    },
    finalize() {
      if (pending !== '') accept(pending)
      if (readyUrl === undefined) throw new Error('desktop Host exited before emitting its readiness URL')
      return readyUrl
    },
  }
}

/** A single child exit, as observed by the supervisor. */
interface HarnessExit {
  code: number | null
  signal: NodeJS.Signals | null
  /** True only during {@link HarnessSupervisor.stop}. */
  expected: boolean
}

/** Events emitted by {@link HarnessSupervisor}. */
export interface HarnessSupervisorEvents {
  /** The harness served a Web GUI; carries the authenticated loopback URL. */
  ready: [url: string]
  /** The child process exited. */
  exit: [exit: HarnessExit]
  /** A restart is scheduled after an unexpected exit. */
  restart: [detail: { attempt: number; delayMs: number }]
  /** Startup failed; the diagnostic and recent output were appended to the log. */
  diagnostic: [detail: { message: string; logFile: string }]
}

/** Timing and log destinations for one supervised Host process. */
export interface HarnessSupervisorOptions {
  /** Combined child stdout/stderr log file. */
  logFile: string
  /** Maximum time to wait for the canonical readiness line. */
  readinessTimeoutMs: number
  /** Base delay for exponential restart backoff. */
  restartDelayMs: number
  /** Maximum restart delay. */
  maxRestartDelayMs: number
  /** Grace period before escalating a failed or stopping child to SIGKILL. */
  killTimeoutMs: number
}

/**
 * Spawn and supervise the harness as a child process: start it, observe its
 * readiness line, restart it on unexpected exit with exponential backoff, and
 * stop it gracefully on request. One supervisor owns one child at a time.
 */
export class HarnessSupervisor extends EventEmitter<HarnessSupervisorEvents> {
  private readonly command: string
  private readonly args: readonly string[]
  private readonly options: HarnessSupervisorOptions
  private readonly logStream: WriteStream
  private child: ChildProcess | null = null
  private stopping = false
  private stopPromise: Promise<void> | null = null
  private restartTimer: ReturnType<typeof setTimeout> | null = null
  private readinessTimer: ReturnType<typeof setTimeout> | null = null
  private failureKillTimer: ReturnType<typeof setTimeout> | null = null
  private restartAttempt = 0
  private parser: ReadinessParser = createReadinessParser()
  private servedUrl: string | null = null
  private startupOutput = ''
  private startupFailureReported = false

  constructor(command: string, args: readonly string[], options: HarnessSupervisorOptions) {
    super()
    this.command = command
    this.args = args
    this.options = options
    mkdirSync(dirname(options.logFile), { recursive: true })
    this.logStream = createWriteStream(options.logFile, { flags: 'a' })
  }

  /** The authenticated loopback URL once observed; `null` before the first ready. */
  get url(): string | null {
    return this.servedUrl
  }

  /** Begin supervising: spawn the first child. */
  start(): void {
    this.stopping = false
    this.spawn()
  }

  /**
   * Gracefully stop the child (SIGTERM, then SIGKILL after the timeout) and
   * suppress restart. Resolves after the child has exited.
   */
  stop(): Promise<void> {
    if (this.stopPromise !== null) return this.stopPromise
    this.stopping = true
    this.clearReadinessTimer()
    if (this.failureKillTimer !== null) {
      clearTimeout(this.failureKillTimer)
      this.failureKillTimer = null
    }
    if (this.restartTimer !== null) {
      clearTimeout(this.restartTimer)
      this.restartTimer = null
    }
    const child = this.child
    if (child === null) {
      this.stopPromise = new Promise((resolve) => { this.logStream.end(resolve) })
      return this.stopPromise
    }
    this.stopPromise = new Promise((resolve) => {
      const killTimer = setTimeout(() => child.kill('SIGKILL'), this.options.killTimeoutMs)
      child.once('close', () => {
        clearTimeout(killTimer)
        this.logStream.end(resolve)
      })
      child.kill('SIGTERM')
    })
    return this.stopPromise
  }

  private spawn(): void {
    this.parser = createReadinessParser()
    this.startupOutput = ''
    this.startupFailureReported = false
    const child = spawn(this.command, [...this.args], { stdio: ['ignore', 'pipe', 'pipe'] })
    this.child = child
    this.readinessTimer = setTimeout(() => {
      this.failStartup(child, `desktop Host readiness timed out after ${this.options.readinessTimeoutMs} ms`)
    }, this.options.readinessTimeoutMs)
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => { this.onStdout(child, chunk) })
    child.stderr.on('data', (chunk: string) => {
      this.logStream.write(`[stderr] ${chunk}`)
      if (this.servedUrl === null && !this.startupFailureReported) {
        this.captureStartupOutput(`[stderr] ${chunk}`)
      }
    })
    child.on('error', (error: Error) => {
      this.logStream.write(`[spawn error] ${error.message}\n`)
      this.reportStartupFailure(`desktop Host could not be spawned: ${error.message}`)
    })
    // `close` also follows a failed spawn and waits for stdio to close, so one
    // terminal event covers launch failure, ordinary exit and complete log
    // drainage before a replacement child starts.
    child.on('close', (code, signal) => { this.onExit(code, signal) })
  }

  private onStdout(child: ChildProcess, chunk: string): void {
    this.logStream.write(chunk)
    if (this.servedUrl !== null || this.startupFailureReported) return
    this.captureStartupOutput(chunk)
    let url: string | undefined
    try {
      url = this.parser.push(chunk)
    } catch (error) {
      this.failStartup(child, error instanceof Error ? error.message : String(error))
      return
    }
    if (url === undefined) return
    this.clearReadinessTimer()
    this.servedUrl = url
    this.startupOutput = ''
    this.restartAttempt = 0
    this.emit('ready', url)
  }

  private onExit(code: number | null, signal: NodeJS.Signals | null): void {
    this.clearReadinessTimer()
    if (this.failureKillTimer !== null) {
      clearTimeout(this.failureKillTimer)
      this.failureKillTimer = null
    }
    if (!this.stopping && this.servedUrl === null && !this.startupFailureReported) {
      let message: string
      try {
        this.parser.finalize()
        message = 'desktop Host exited before the window could load its origin'
      } catch (error) {
        message = error instanceof Error ? error.message : String(error)
      }
      this.reportStartupFailure(message)
    }
    this.child = null
    this.servedUrl = null
    this.emit('exit', { code, signal, expected: this.stopping })
    if (!this.stopping) this.scheduleRestart()
  }

  private captureStartupOutput(chunk: string): void {
    this.startupOutput = `${this.startupOutput}${chunk}`.slice(-STARTUP_OUTPUT_LIMIT)
  }

  private clearReadinessTimer(): void {
    if (this.readinessTimer === null) return
    clearTimeout(this.readinessTimer)
    this.readinessTimer = null
  }

  private reportStartupFailure(message: string): void {
    if (this.startupFailureReported) return
    this.startupFailureReported = true
    const recentOutput = this.startupOutput.trimEnd()
    this.logStream.write(`\n[startup diagnostic] ${message}\n`)
    if (recentOutput !== '') this.logStream.write(`[recent startup output]\n${recentOutput}\n`)
    this.emit('diagnostic', { message, logFile: this.options.logFile })
  }

  private failStartup(child: ChildProcess, message: string): void {
    if (this.stopping || this.startupFailureReported || this.child !== child) return
    this.clearReadinessTimer()
    this.reportStartupFailure(message)
    child.kill('SIGTERM')
    this.failureKillTimer = setTimeout(() => child.kill('SIGKILL'), this.options.killTimeoutMs)
  }

  private scheduleRestart(): void {
    this.restartAttempt += 1
    const delayMs = Math.min(
      this.options.restartDelayMs * 2 ** (this.restartAttempt - 1),
      this.options.maxRestartDelayMs,
    )
    this.restartTimer = setTimeout(() => {
      this.restartTimer = null
      if (!this.stopping) this.spawn()
    }, delayMs)
    this.emit('restart', { attempt: this.restartAttempt, delayMs })
  }
}
