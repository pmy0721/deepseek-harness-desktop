/** Frameless desktop header hit regions remain separate from Web presentation. */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  fileURLToPath(new URL('../src/client/skeleton/ConversationRoot.module.css', import.meta.url)),
  'utf8',
)

describe('conversation desktop header', () => {
  it('limits the extra drag seat to pages without a Session header', () => {
    expect(css).toMatch(/\.desktopTitlebarDragRegion\s*\{[^}]*display: none;/s)
    expect(css).toMatch(
      /:global\(html\[data-dsh-desktop='true'\]\) \.desktopTitlebarDragRegion\s*\{[^}]*z-index: 1;[^}]*-webkit-app-region: drag;/s,
    )
    const component = readFileSync(new URL('../src/client/skeleton/ConversationRoot.tsx', import.meta.url), 'utf8')
    expect(component).toMatch(/sessionId === undefined && \(\s*<div className=\{css\.desktopTitlebarDragRegion\}/s)
  })

  it('composes the Windows caption controls into the title row', () => {
    expect(css).toContain('--dsh-windows-caption-controls-width: 138px;')
    expect(css).toContain('right: var(--dsh-windows-caption-controls-width);')
    expect(css).toContain('padding-right: calc(var(--dsh-windows-caption-controls-width) + 20px);')
    expect(css).toContain('-webkit-app-region: drag;')
  })

  it.each([
    'button:not(:disabled)', 'a', 'input', 'select', 'textarea',
    "[role='button']", "[role='link']", "[role='tab']", "[contenteditable='true']",
  ])('keeps header %s interactions outside the drag region', (selector) => {
    expect(css).toContain(`:global(html[data-dsh-desktop='true']) .header ${selector}`)
    expect(css).toMatch(/-webkit-app-region: no-drag;/)
  })
})
