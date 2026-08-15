/** Desktop surface selectors keep native material inside the sidebar. */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(fileURLToPath(new URL('../src/client/AppFrame.module.css', import.meta.url)), 'utf8')

describe('AppFrame desktop surfaces', () => {
  it('pins each content surface to its grid track', () => {
    expect(css).toMatch(/\.sidebarCol\s*\{[^}]*grid-column: 1;[^}]*grid-row: 1;/s)
    expect(css).toMatch(/\.centerCol\s*\{[^}]*grid-column: 2;[^}]*grid-row: 1;/s)
    expect(css).toMatch(/\.detailsCol\s*\{[^}]*grid-column: 3;[^}]*grid-row: 1;/s)
  })

  it.each(['darwin', 'win32'])('admits %s material through the sidebar only', (platform) => {
    const marker = `:global(html[data-dsh-desktop-platform='${platform}'])`
    expect(css).toContain(`${marker} .frame`)
    expect(css).toContain(`${marker} .sidebarCol`)
    expect(css).toContain(`${marker} .centerCol`)
    expect(css).toContain(`${marker} .detailsCol`)
  })

  it('keeps Linux opaque while reserving its native title-bar overlay', () => {
    const marker = ":global(html[data-dsh-desktop-platform='linux'])"
    expect(css).not.toContain(`${marker} .frame`)
    expect(css).not.toContain(`${marker} .sidebarCol`)
    expect(css).toContain(`${marker} .centerCol`)
    expect(css).toContain(`${marker} .detailsCol`)
    expect(css).toContain('padding-top: var(--dsh-desktop-titlebar-inset, 44px);')
    expect(css).toContain('box-sizing: border-box;')
  })

  it('uses theme tokens for native and opaque desktop surfaces', () => {
    expect(css).toContain(
      'background: color-mix(in srgb, var(--dsw-specific-sidebar-fill) 72%, transparent);',
    )
    expect(css).toContain('background: var(--dsw-alias-bg-base);')
  })
})
