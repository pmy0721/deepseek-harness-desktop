import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

interface BuilderConfiguration {
  readonly afterPack: string
  readonly extraResources: readonly { readonly from: string; readonly to: string }[]
  readonly mac: {
    readonly hardenedRuntime: boolean
    readonly identity: null
    readonly notarize: boolean
  }
}

interface DesktopPackage {
  readonly scripts: Readonly<Record<string, string>>
}

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configuration = load(
  readFileSync(resolve(desktopRoot, 'electron-builder.yml'), 'utf8'),
) as BuilderConfiguration
const desktopPackage = JSON.parse(
  readFileSync(resolve(desktopRoot, 'package.json'), 'utf8'),
) as DesktopPackage

describe('desktop packaging configuration', () => {
  it('runs the packaged-runtime verifier after copying all runtime roots', () => {
    expect(configuration.afterPack).toBe('scripts/verify-packaged-runtime.mjs')
    expect(configuration.extraResources).toEqual(expect.arrayContaining([
      { from: 'vendor/runtime', to: 'runtime' },
      { from: 'vendor/harness', to: 'harness' },
    ]))
  })

  it('builds and stages the runtime before electron-builder invokes afterPack', () => {
    for (const name of ['dist', 'dist:mac', 'dist:win']) {
      const command = desktopPackage.scripts[name]
      expect(command).toContain('tsc -p .')
      expect(command).toContain('scripts/prepare-runtime.mjs')
      expect(command).toContain('electron-builder')
      expect(command?.indexOf('tsc -p .')).toBeLessThan(command?.indexOf('scripts/prepare-runtime.mjs') ?? -1)
      expect(command?.indexOf('scripts/prepare-runtime.mjs')).toBeLessThan(command?.indexOf('electron-builder') ?? -1)
    }
  })

  it('keeps personal macOS artifacts unsigned and unnotarized', () => {
    expect(configuration.mac).toMatchObject({
      hardenedRuntime: true,
      identity: null,
      notarize: false,
    })
  })
})
