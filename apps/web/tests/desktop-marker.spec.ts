import { describe, expect, it } from 'vitest'
import { applyDesktopPresentationMarker } from '../src/desktop-marker.ts'

function root(): HTMLElement {
  return { dataset: {} } as HTMLElement
}

describe('desktop presentation marker', () => {
  it('marks a recognized desktop platform', () => {
    const element = root()

    applyDesktopPresentationMarker('http://127.0.0.1:3080/?dsh-desktop-platform=darwin', element)

    expect(element.dataset).toEqual({ dshDesktop: 'true', dshDesktopPlatform: 'darwin' })
  })

  it('reads the presentation marker from a redirect-preserved fragment', () => {
    const element = root()

    applyDesktopPresentationMarker('http://127.0.0.1:3080/#dsh-desktop-platform=darwin', element)

    expect(element.dataset).toEqual({ dshDesktop: 'true', dshDesktopPlatform: 'darwin' })
  })

  it('ignores absent and unrecognized platform values', () => {
    for (const href of [
      'http://127.0.0.1:3080/',
      'http://127.0.0.1:3080/?dsh-desktop-platform=unknown',
    ]) {
      const element = root()
      applyDesktopPresentationMarker(href, element)
      expect(element.dataset).toEqual({})
    }
  })
})
