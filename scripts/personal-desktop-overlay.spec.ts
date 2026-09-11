import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(import.meta.dirname, '..')

describe('personal Desktop documentation overlay', () => {
  it.each([
    ['README.md', ['## Desktop distribution', '### Desktop version updates', 'not an official DeepSeek distribution']],
    ['README.zh.md', ['## 桌面发行版', '### 桌面版本更新', '不是 DeepSeek 官方发行版']],
  ])('retains the downstream distribution and update history in %s', (path, markers) => {
    const source = readFileSync(resolve(ROOT, path), 'utf8')
    for (const marker of markers) expect(source).toContain(marker)
  })
})
