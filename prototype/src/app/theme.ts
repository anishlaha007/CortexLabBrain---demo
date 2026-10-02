export type Theme = 'light' | 'dark' | 'mocha'

export const THEMES: { id: Theme; label: string; swatch: string }[] = [
  { id: 'light', label: 'Light · Oatmeal', swatch: '#F3EDE2' },
  { id: 'dark', label: 'Dark · Ink', swatch: '#2B2B2B' },
  { id: 'mocha', label: 'Mocha', swatch: '#6E473B' },
]

const KEY = 'cortex.theme'

function isTheme(v: unknown): v is Theme {
  return v === 'light' || v === 'dark' || v === 'mocha'
}

/** URL (?theme=) wins, then the viewer's last choice, then light. */
export function initialTheme(): Theme {
  const fromUrl = new URLSearchParams(window.location.search).get('theme')
  if (isTheme(fromUrl)) return fromUrl
  try {
    const saved = window.localStorage.getItem(KEY)
    if (isTheme(saved)) return saved
  } catch {
    // Storage can be blocked (private windows, previews). Light is fine.
  }
  return 'light'
}

export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t
  try {
    window.localStorage.setItem(KEY, t)
  } catch {
    // Not critical: the theme just won't be remembered.
  }
}
