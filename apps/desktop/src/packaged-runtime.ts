import { access } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { Arch, type AfterPackContext } from 'electron-builder'

const execFileAsync = promisify(execFile)

interface RequiredRuntimeFile {
  readonly label: string
  readonly segments: readonly string[]
}

function architecture(arch: AfterPackContext['arch']): 'arm64' | 'x64' {
  if (arch === Arch.x64) return 'x64'
  if (arch === Arch.arm64) return 'arm64'
  throw new Error(`desktop packaging does not stage a runtime for electron-builder architecture ${arch}`)
}

function requiredFiles(context: AfterPackContext): readonly [
  RequiredRuntimeFile,
  RequiredRuntimeFile,
  RequiredRuntimeFile,
] {
  const arch = architecture(context.arch)
  const platform = context.electronPlatformName === 'darwin' ? 'darwin' : 'win32'
  const nodeSegments = platform === 'darwin'
    ? ['runtime', `${platform}-${arch}`, 'bin', 'node']
    : ['runtime', `${platform}-${arch}`, 'node.exe']
  return [
    { label: 'bundled Node executable', segments: nodeSegments },
    { label: 'dsh CLI entry', segments: ['harness', 'lib', 'bin.js'] },
    {
      label: 'Web frontend entry',
      segments: ['harness', 'node_modules', '@deepseek-ai', 'dsh-web-frontend', 'dist', 'index.html'],
    },
  ]
}

/**
 * Reject a packaged shell that omitted a runtime file needed at launch.
 * @param context - Electron Builder's completed application directory.
 * @returns A promise that resolves only when every launch entry exists.
 */
export async function afterPack(context: AfterPackContext): Promise<void> {
  const resources = context.electronPlatformName === 'darwin'
    ? join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`, 'Contents', 'Resources')
    : join(context.appOutDir, 'resources')
  const runtimeFiles = requiredFiles(context)
  const missing: string[] = []
  for (const file of runtimeFiles) {
    const path = join(resources, ...file.segments)
    try {
      await access(path)
    } catch {
      // `access` is the only operation in this try; every failure means this
      // required path cannot be read from the completed application bundle.
      missing.push(`${file.label}: ${path}`)
    }
  }
  if (missing.length > 0) {
    throw new Error(`packaged desktop runtime is incomplete:\n- ${missing.join('\n- ')}`)
  }

  const node = join(resources, ...runtimeFiles[0].segments)
  const cli = join(resources, ...runtimeFiles[1].segments)
  try {
    await execFileAsync(node, [cli, '--version'], { timeout: 30_000, windowsHide: true })
  } catch (error) {
    throw new Error('packaged desktop runtime cannot execute dsh --version', { cause: error })
  }
}
