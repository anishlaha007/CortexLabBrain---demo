import { useCallback, useEffect, useMemo, useState } from 'react'
import { Brain } from '../brain/Brain'
import { buildGraph, layoutGraph } from '../brain/graph'
import { ChatPanel } from '../chat/ChatPanel'
import { CHATS, type HubId } from '../lab/content'
import { LiveRail } from './LiveRail'
import { PeopleRail } from './PeopleRail'
import { TopBar } from './TopBar'
import { applyTheme, initialTheme, type Theme } from './theme'

function initialChat(): string | null {
  const id = new URLSearchParams(window.location.search).get('chat')
  return id && CHATS.some((c) => c.id === id) ? id : null
}

export function App() {
  const graph = useMemo(() => buildGraph(), [])
  const sim = useMemo(() => layoutGraph(graph), [graph])
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [openChat, setOpenChat] = useState<string | null>(initialChat)
  const [focusHub, setFocusHub] = useState<{ id: HubId; n: number } | null>(null)

  useEffect(() => applyTheme(theme), [theme])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenChat(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onOpenChat = useCallback((id: string) => setOpenChat(id), [])
  const onFocusHub = useCallback((id: HubId) => setFocusHub((f) => ({ id, n: (f?.n ?? 0) + 1 })), [])

  return (
    <div className={`app ${openChat ? 'app--split' : ''}`}>
      <TopBar theme={theme} onTheme={setTheme} split={!!openChat} onHome={() => setOpenChat(null)} />
      <main className="stage">
        <div className="stage__left" aria-hidden={!!openChat}>
          <LiveRail onOpenChat={onOpenChat} onFocusHub={onFocusHub} />
        </div>
        <Brain graph={graph} sim={sim} theme={theme} openChat={openChat} onOpenChat={onOpenChat} focusHub={focusHub} />
        <div className="stage__right">
          {openChat ? <ChatPanel key={openChat} chatId={openChat} onClose={() => setOpenChat(null)} onOpenChat={onOpenChat} /> : <PeopleRail />}
        </div>
      </main>
    </div>
  )
}
