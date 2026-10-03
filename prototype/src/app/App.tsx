import { useEffect } from 'react'
import { Brain } from '../brain/Brain'
import { ChatPanel } from '../chat/ChatPanel'
import { closeViewer, openChat, setTourStep } from '../engine/actions'
import { openSetup } from '../engine/setup'
import { getState, setState, useStore } from '../engine/store'
import { PEOPLE } from '../lab/people'
import { DragLayer, Toasts } from './DragLayer'
import { Setup } from './Setup'
import { LiveRail } from './LiveRail'
import { PeopleRail } from './PeopleRail'
import { TopBar } from './TopBar'
import { Tour } from './Tour'
import { Viewer } from './Viewer'
import { applyTheme } from './theme'

export function App() {
  const theme = useStore((s) => s.theme)
  const openChat_ = useStore((s) => s.openChat)
  // Presenter setup renames and recolours people: re-render everything that shows them.
  useStore((s) => s.setupVersion)

  useEffect(() => applyTheme(theme), [theme])

  // Person colours as CSS variables, for toasts and anything styled by who did it. Setup updates them too.
  useEffect(() => {
    const root = document.documentElement
    Object.values(PEOPLE).forEach((p) => root.style.setProperty(`--p-${p.id}`, p.color))
  }, [])

  // Esc backs out one layer at a time: setup, an open panel, a drag, the tour, then the chat.
  // The comma key opens presenter setup, unless you're typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable]')
      if (e.key === ',' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        openSetup(!getState().setupOpen)
        return
      }
      if (e.key !== 'Escape') return
      const s = getState()
      if (s.setupOpen) openSetup(false)
      else if (s.viewer) closeViewer()
      else if (s.drag) setState({ drag: null })
      else if (s.tour !== null) setTourStep(null)
      else if (s.openChat) openChat(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={`app ${openChat_ ? 'app--split' : ''}`}>
      <TopBar />
      <main className="stage">
        <div className="stage__left" aria-hidden={!!openChat_}>
          <LiveRail />
        </div>
        <Brain theme={theme} />
        <div className="stage__right">
          {openChat_ ? <ChatPanel key={openChat_} chatId={openChat_} /> : <PeopleRail />}
        </div>
      </main>
      <Viewer />
      <DragLayer />
      <Toasts />
      <Tour />
      <Setup />
    </div>
  )
}
