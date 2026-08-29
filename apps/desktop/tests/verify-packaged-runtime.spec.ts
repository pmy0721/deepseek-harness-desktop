import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { afterPack } from '../src/packaged-runtime.ts'

function context(appOutDir: string, electronPlatformName: 'darwin' | 'win32') {
  return {
    appOutDir,
    arch: electronPlatformName === 'darwin' ? 3 : 1,
    electronPlatformName,
    packager: { appInfo: { productFilename: 'DeepSeek Harness' } },
  } as Parameters<typeof afterPack>[0]
}

function resources(appOutDir: string, platform: 'darwin' | 'win32'): string {
  return platform === 'darwin'
    ? join(appOutDir, 'DeepSeek Harness.app', 'Contents', 'Resources')
    : join(appOutDir, 'resources')
}

async function materializeRuntime(appOutDir: string, platform: 'darwin' | 'win32'): Promise<void> {
  const root = resources(appOutDir, platform)
  const node = platform === 'darwin'
    ? join(root, 'runtime', 'darwin-arm64', 'bin', 'node')
    : join(root, 'runtime', 'win32-x64', 'node.exe')
  const cli = join(root, 'harness', 'lib', 'bin.js')
  const frontend = join(root, 'harness', 'node_modules', '@deepseek-ai', 'dsh-web-frontend', 'dist', 'index.html')
  for (const path of [node, cli, frontend]) {
    await mkdir(join(path, '..'), { recursive: true })
  }
  await symlink(process.execPath, node)
  await writeFile(cli, "process.stdout.write('0.1.2-test\\n')\n")
  await writeFile(frontend, '')
}

describe('packaged desktop runtime verification', () => {
  it.each(['darwin', 'win32'] as const)('accepts a complete %s runtime', async (platform) => {
    const appOutDir = await mkdtemp(join(tmpdir(), 'dsh-packaged-runtime-'))
    try {
      await materializeRuntime(appOutDir, platform)

      await expect(afterPack(context(appOutDir, platform))).resolves.toBeUndefined()
    } finally {
      await rm(appOutDir, { recursive: true, force: true })
    }
  })

  it('reports every missing launch entry in one failure', async () => {
    const appOutDir = await mkdtemp(join(tmpdir(), 'dsh-packaged-runtime-'))
    try {
      await expect(afterPack(context(appOutDir, 'darwin'))).rejects.toThrow(
        /bundled Node executable[\s\S]*dsh CLI entry[\s\S]*Web frontend entry/iu,
      )
    } finally {
      await rm(appOutDir, { recursive: true, force: true })
    }
  })

  it('rejects a runtime whose dsh entry cannot execute', async () => {
    const appOutDir = await mkdtemp(join(tmpdir(), 'dsh-packaged-runtime-'))
    try {
      await materializeRuntime(appOutDir, 'darwin')
      await writeFile(
        join(resources(appOutDir, 'darwin'), 'harness', 'lib', 'bin.js'),
        "throw new Error('broken staged closure')\n",
      )

      await expect(afterPack(context(appOutDir, 'darwin'))).rejects.toThrow(
        'packaged desktop runtime cannot execute dsh --version',
      )
    } finally {
      await rm(appOutDir, { recursive: true, force: true })
    }
  })
})
