import { describe, expect, it } from 'vitest'
import { shortBuildVersion } from '../src/client/SidebarRoot.tsx'

describe('shortBuildVersion', () => {
  it.each([
    ['1.2.3', 'v1.2.3'],
    ['1.2.3-alpha.4', 'v1.2.3-a4'],
    ['1.2.3-beta.2', 'v1.2.3-b2'],
    ['1.2.3-rc.4', 'v1.2.3-rc4'],
    ['1.2.3-preview.5', 'v1.2.3-preview.5'],
  ])('formats %s as %s', (version, expected) => {
    expect(shortBuildVersion(version)).toBe(expected)
  })
})
