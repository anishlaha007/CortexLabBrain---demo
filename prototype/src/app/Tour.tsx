import { useEffect, useLayoutEffect, useState } from 'react'
import {
  ask, closeViewer, demoDrag, focusNode, follow, openChat, openManifest, openSource, pullSuggestion, setLayout, setSearch,
  setTheme, setTourStep,
} from '../engine/actions'
import { getState, useStore } from '../engine/store'
import { HERO_CHAT } from '../lab/content'
import { nameify } from '../lab/people'

interface Step {
  target: string
  title: string
  body: string
  view?: 'home' | 'hero'
  show?: { label: string; run: () => void }
}

const STEPS: Step[] = [
  {
    target: 'brain', view: 'home', title: 'This is your lab’s brain',
    body: 'Every dot is something the lab made or asked: 11 research topics, chats, real papers and robots, files, raw data, and every saved question and answer. Hover to explore, scroll to zoom, drag to move things.',
  },
  {
    target: 'people', view: 'home', title: 'Colour always means a person',
    body: 'Each teammate has one colour everywhere: their chats on the brain, their cursor, their avatar. Rings pulse wherever someone is working right now.',
    show: { label: 'Follow Kofi', run: () => follow('kofi') },
  },
  {
    target: 'live', view: 'home', title: 'The lab, live',
    body: 'Branches, merges and pulls appear here as they happen. Click any of them to jump straight in.',
  },
  {
    target: 'sources', view: 'home', title: 'Where Cortex reads from',
    body: 'GitHub, Google Drive, OneDrive, lab PCs, papers and the web. Read-only, and files never leave the lab’s server.',
  },
  {
    target: 'search', view: 'home', title: 'Search or ask the whole lab',
    body: 'Type and matching chats, papers and files light up on the brain. Press Enter to ask the Lab AI a question.',
    show: { label: 'Search “snake”', run: () => setSearch('snake') },
  },
  {
    target: 'answer', view: 'hero', title: 'Answers cite the exact source',
    body: 'Every claim has a numbered citation. Click one to see the paper, file or old chat it came from.',
    show: { label: 'Open citation 1', run: () => openSource({ node: 'p-sidewind', where: 'Abstract' }, HERO_CHAT) },
  },
  {
    target: 'manifest', view: 'hero', title: 'What did the AI see?',
    body: 'See exactly what went into an answer, and what left the server.',
    show: { label: 'Show me', run: () => openManifest(HERO_CHAT, 'h6') },
  },
  {
    target: 'live-draft', view: 'hero', title: 'Watch a teammate, live',
    body: 'Kofi is typing in this chat right now. You see his draft as he writes, like a shared document.',
  },
  {
    target: 'brain', view: 'hero', title: 'Zoom into a chat',
    body: 'Scroll in on any chat, or double-click it, and it unfolds into its prompts in order, each with the file it used. Click a prompt to jump to that exact moment in the chat.',
    show: { label: 'Zoom in for me', run: () => focusNode(HERO_CHAT, 3.1) },
  },
  {
    target: 'brain', view: 'hero', title: 'Drag anything into the chat',
    body: 'Grab any dot on the brain, whether a chat, a paper, a robot or a whole topic, and drop it into the chat. It flies into the context tray and joins the next question.',
    show: { label: 'Drag one in for me', run: () => demoDrag('c-contact') },
  },
  {
    target: 'suggest', view: 'hero', title: 'Cortex suggests context',
    body: 'When a teammate has worked on something related, Cortex offers to pull it in.',
    show: { label: 'Pull it in', run: () => pullSuggestion(HERO_CHAT) },
  },
  {
    target: 'composer', view: 'hero', title: 'Branch to collaborate',
    body: 'Kofi is working here, so your question starts a branch instead of interrupting him. He’s notified, and can merge your findings back into his chat.',
    show: { label: 'Ask in a branch', run: () => ask(HERO_CHAT, 'What should we try next to stop the snake robot slipping?') },
  },
  {
    target: 'lineage', title: 'See how ideas grew',
    body: 'Lineage lays every chat out by topic and time, with branches and merges flowing to the right.',
    show: { label: 'Switch to Lineage', run: () => setLayout('lineage') },
  },
  {
    target: 'themes', title: 'Make it yours',
    body: 'Light, dark or mocha. Presenting? Press the comma key for presenter setup: rename the lab and teammates, recolour them, and set how busy the lab is. That’s the tour.',
    show: { label: 'Try mocha', run: () => setTheme('mocha') },
  },
]

interface Rect { x: number; y: number; w: number; h: number }

export function Tour() {
  const step = useStore((s) => s.tour)
  const [rect, setRect] = useState<Rect | null>(null)
  const s = step === null ? null : STEPS[step]

  // Put the app in the right view for this step.
  useEffect(() => {
    if (!s) return
    setSearch('')
    if (s.view === 'home' && getState().openChat) openChat(null)
    if (s.view === 'hero' && getState().openChat !== HERO_CHAT) openChat(HERO_CHAT)
    if (s.view && getState().layout !== 'brain') setLayout('brain')
    closeViewer()
  }, [step])

  // Follow the target as the layout settles.
  useLayoutEffect(() => {
    if (!s) return
    // Only move when the target really moved, so the card holds still while you read it.
    const measure = () => {
      const el = document.querySelector(`[data-tour="${s.target}"]`)
      if (!el) return setRect(null)
      const r = el.getBoundingClientRect()
      setRect((old) => {
        const next = { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }
        if (old && Math.abs(old.x - next.x) < 6 && Math.abs(old.y - next.y) < 6 && Math.abs(old.w - next.w) < 6 && Math.abs(old.h - next.h) < 6) return old
        return next
      })
    }
    measure()
    const iv = window.setInterval(measure, 400)
    return () => window.clearInterval(iv)
  }, [step])

  if (!s || step === null) return null
  const pad = 8
  const vw = window.innerWidth
  const vh = window.innerHeight
  const card = { w: 340, h: 210 }
  let pos = { x: vw / 2 - card.w / 2, y: vh / 2 - card.h / 2 }
  if (rect) {
    const right = vw - (rect.x + rect.w)
    const left = rect.x
    const below = vh - (rect.y + rect.h)
    if (rect.w > vw * 0.45 && rect.h > vh * 0.5) pos = { x: rect.x + rect.w / 2 - card.w / 2, y: rect.y + rect.h - card.h - 24 }
    else if (right > card.w + 24) pos = { x: rect.x + rect.w + 16, y: rect.y }
    else if (left > card.w + 24) pos = { x: rect.x - card.w - 16, y: rect.y }
    else if (below > card.h + 24) pos = { x: rect.x, y: rect.y + rect.h + 14 }
    else pos = { x: rect.x, y: rect.y - card.h - 14 }
    pos.x = Math.max(12, Math.min(vw - card.w - 12, pos.x))
    pos.y = Math.max(12, Math.min(vh - card.h - 12, pos.y))
  }
  const last = step === STEPS.length - 1

  return (
    <div className="tour" role="dialog" aria-modal="false" aria-label={`Tour step ${step + 1} of ${STEPS.length}: ${s.title}`}>
      {rect && (
        <div
          className="tour__spot"
          style={{ left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2 }}
          aria-hidden="true"
        />
      )}
      <div className="tour__card" style={{ left: pos.x, top: pos.y, width: card.w }}>
        <span className="tour__count">{step + 1} of {STEPS.length}</span>
        <h2 className="tour__title">{nameify(s.title)}</h2>
        <p className="tour__body">{nameify(s.body)}</p>
        <div className="tour__actions">
          {s.show && <button type="button" className="btn btn--sm" onClick={s.show.run}>{nameify(s.show.label)}</button>}
          <span className="tour__nav">
            {step > 0 && <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTourStep(step - 1)}>Back</button>}
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setTourStep(last ? null : step + 1)}>{last ? 'Done' : 'Next'}</button>
          </span>
        </div>
        <button type="button" className="tour__close icon-btn icon-btn--xs" aria-label="End the tour" onClick={() => setTourStep(null)}>×</button>
      </div>
    </div>
  )
}
