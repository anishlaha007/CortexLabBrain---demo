import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/hanken-grotesk/latin-400.css'
import '@fontsource/hanken-grotesk/latin-500.css'
import '@fontsource/hanken-grotesk/latin-600.css'
import '@fontsource/hanken-grotesk/latin-700.css'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/instrument-serif/latin-400-italic.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import './styles/tokens.css'
import './styles/app.css'
import { App } from './app/App'
import { applyTheme } from './app/theme'
import { startAmbient } from './engine/ambient'
import { loadSetup } from './engine/setup'
import { getState, setState } from './engine/store'
import { CHATS } from './lab/content'

applyTheme(getState().theme)

const params = new URLSearchParams(window.location.search)

// ?chat=<id> opens straight into a chat (shared links, screenshots).
const linked = params.get('chat')
if (linked && CHATS.some((c) => c.id === linked)) setState({ openChat: linked })

// The presenter's setup: a shared ?setup=… link, or what this browser saved.
loadSetup()

// ?ambient=off|calm|busy sets how much the lab does on its own (for this visit only).
const ambient = params.get('ambient')
if (ambient === 'off' || ambient === 'calm' || ambient === 'busy') setState((s) => ({ setup: { ...s.setup, ambient } }))
startAmbient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Read-only hooks for the click-test script: where things are on screen, and how questions match.
import { BANK, matchBank } from './engine/bank'
import { promptHits, screenOf } from './engine/world'
;(window as unknown as { __cortex: object }).__cortex = {
  screenOf: (id: string) => screenOf(id),
  promptHits: () => promptHits(),
  bank: () => BANK.map((b) => ({ id: b.id, q: b.q })),
  match: (q: string) => matchBank(q)?.id ?? null,
}
