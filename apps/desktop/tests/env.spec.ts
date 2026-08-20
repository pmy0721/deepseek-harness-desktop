import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveDesktopEnv } from '../src/env.ts'

const roots: string[] = []

function fixtureRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'dsh-desktop-env-'))
  roots.push(root)
  return root
}

function touch(path: string): void {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, '')
}

afterEach(() => {
  vi.unstubAllEnvs()
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('resolveDesktopEnv', () => {
  it('disables the CLI browser handoff for the development Host', () => {
    vi.stubEnv('DSH_DESKTOP_DSH_BIN', '')
    const resourceRoot = fixtureRoot()

    const { launch } = resolveDesktopEnv(resourceRoot)

    expect(launch.command).toBe('node')
    expect(launch.args).toEqual([
      join(resourceRoot, '..', '..', 'apps', 'cli', 'lib', 'bin.js'),
      'web',
      '--no-open',
      '--port',
      '0',
    ])
  })

  it('disables the CLI browser handoff for an explicit launcher', () => {
    vi.stubEnv('DSH_DESKTOP_DSH_BIN', '/opt/dsh/bin/dsh')
    vi.stubEnv('DSH_DESKTOP_PORT', '4310')

    const { launch } = resolveDesktopEnv(fixtureRoot())

    expect(launch).toEqual({
      command: '/opt/dsh/bin/dsh',
      args: ['web', '--no-open', '--port', '4310'],
    })
  })

  it('disables the CLI browser handoff for the packaged runtime', () => {
    vi.stubEnv('DSH_DESKTOP_PORT', '5120')
    const resourceRoot = fixtureRoot()
    const platform = process.platform === 'darwin' ? 'darwin' : 'win32'
    const arch = process.arch === 'arm64' ? 'arm64' : 'x64'
    const runtimeRoot = join(resourceRoot, 'runtime', `${platform}-${arch}`)
    const node = process.platform === 'win32' ? join(runtimeRoot, 'node.exe') : join(runtimeRoot, 'bin', 'node')
    const dshBin = join(resourceRoot, 'harness', 'lib', 'bin.js')
    touch(node)
    touch(dshBin)

    const { launch } = resolveDesktopEnv(resourceRoot)

    expect(launch).toEqual({
      command: node,
      args: [dshBin, 'web', '--no-open', '--port', '5120'],
    })
  })
})
