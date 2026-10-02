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
import { getState, setState } from './engine/store'
import { CHATS } from './lab/content'

applyTheme(getState().theme)

// ?chat=<id> opens straight into a chat (shared links, screenshots).
const linked = new URLSearchParams(window.location.search).get('chat')
if (linked && CHATS.some((c) => c.id === linked)) setState({ openChat: linked })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Read-only hook for the click-test script: where a brain node is on screen.
import { screenOf } from './engine/world'
;(window as unknown as { __cortex: object }).__cortex = { screenOf: (id: string) => screenOf(id) }
