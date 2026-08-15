import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
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
  const paths = [
    platform === 'darwin'
      ? join(root, 'runtime', 'darwin-arm64', 'bin', 'node')
      : join(root, 'runtime', 'win32-x64', 'node.exe'),
    join(root, 'harness', 'lib', 'bin.js'),
    join(root, 'harness', 'node_modules', '@deepseek-ai', 'dsh-web-frontend', 'dist', 'index.html'),
  ]
  for (const path of paths) {
    await mkdir(join(path, '..'), { recursive: true })
    await writeFile(path, '')
  }
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
})
