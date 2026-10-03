import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ask, chatTitle, copyLink, getChat, dismissSuggestion, exportChat, focusNode, liveOwner, openChat, pullSuggestion,
  removeFromTray, setBranchFrom, setComposer, setFilter, suggestionFor, toggleEarlier,
} from '../engine/actions'
import { CPS } from '../engine/ambient'
import { suggestionsFor } from '../engine/bank'
import { EMPTY, setState, useStore, type LiveActivity, type Msg, type TrayItem } from '../engine/store'
import { CHATS, HUBS } from '../lab/content'
import { PEOPLE, nameify, type PersonId } from '../lab/people'
import { DEFAULT_TRAY, THREADS } from '../lab/threads'
import { Avatar } from '../ui/Avatar'
import { Icon, type IconName } from '../ui/Icons'
import { Message } from './Message'

interface Props {
  chatId: string
}

/** Chats without a written conversation open on their memory card. */
function memoryCard(chatId: string): Msg[] {
  const c = CHATS.find((x) => x.id === chatId)
  if (!c) return []
  const hub = HUBS.find((h) => h.id === c.hub)!
  return [{
    id: `card-${chatId}`, who: 'ai', time: 'memory card',
    text: `**${PEOPLE[c.by].name}’s chat** in *${hub.label}*. The topic’s big question: ${hub.question}`,
    sources: (c.cites ?? []).map((id) => ({ node: id, where: 'cited in this chat' })),
    memoryNote: 'A rolling summary saved as lab memory. Ask below to add to this chat.',
  }]
}

export function ChatPanel({ chatId }: Props) {
  const extra = useStore((s) => s.extraChats)
  const renamed = useStore((s) => s.renamed[chatId])
  const dynamic = useStore((s) => s.messages[chatId])
  const showEarlier = useStore((s) => s.showEarlier[chatId])
  const chat = CHATS.find((c) => c.id === chatId) ?? extra.find((c) => c.id === chatId)
  const active = useStore((s) => s.active)
  const ambientOff = useStore((s) => s.setup.ambient === 'off')
  const scrollRef = useRef<HTMLDivElement>(null)

  const all = useMemo(
    () => [...(THREADS[chatId] ?? (CHATS.some((c) => c.id === chatId) ? memoryCard(chatId) : [])), ...(dynamic ?? [])],
    [chatId, dynamic],
  )
  const earlierCount = all.filter((m) => m.earlier).length
  const shown = all.filter((m) => showEarlier || !m.earlier)
  const last = all[all.length - 1]
  const lastLen = last ? last.shown ?? last.text.length : 0

  // Zoomed-in prompt clicked on the brain: scroll to that message and flash it.
  const focus = useStore((s) => s.focusMsg)
  useEffect(() => {
    if (!focus || focus.chat !== chatId) return
    if (all.find((m) => m.id === focus.msg)?.earlier) setState((s) => ({ showEarlier: { ...s.showEarlier, [chatId]: true } }))
    // The message may still be rendering (a freshly opened chat, or one behind “show earlier”), so look a few times.
    let tries = 0
    let t = 0
    const find = () => {
      const el = scrollRef.current?.querySelector(`[data-msg="${focus.msg}"]`)
      if (!el) {
        if (++tries < 10) t = window.setTimeout(find, 120)
        return
      }
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el.classList.add('is-flash')
      window.setTimeout(() => el.classList.remove('is-flash'), 1900)
    }
    t = window.setTimeout(find, 160)
    return () => window.clearTimeout(t)
  }, [focus?.n])

  // Opening a chat with new activity (a merge, your question) starts at the newest message.
  useEffect(() => {
    const el = scrollRef.current
    if (el && dynamic?.some((m) => m.kind === 'merge' || m.who === 'you')) el.scrollTop = el.scrollHeight
  }, [])

  // Keep the newest message in view as it streams in.
  useEffect(() => {
    const el = scrollRef.current
    if (el && dynamic?.length) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [dynamic?.length, lastLen])

  if (!chat) return null
  const hub = HUBS.find((h) => h.id === chat.hub)!
  const owner = PEOPLE[chat.by]
  const live = liveOwner(chatId)
  const prompts = all.filter((m) => m.who !== 'ai' && !m.kind).length
  const here = active.filter((a) => a.chat === chatId)
  const viewers: { id: PersonId; label: string }[] = [
    ...here.map((a) => ({ id: a.who, label: a.doing })),
    { id: 'you', label: 'you' },
  ]
  const typing = here.find((a) => a.doing === 'typing' && a.draft)
  // Follow-up questions wait until the latest answer has finished writing.
  const settled = !last || last.who !== 'ai' || !last.phase || last.phase === 'done'
  const answered = all.some((m) => m.who === 'ai' && !m.kind && m.phase === 'done')
  const asked = all.filter((m) => m.who !== 'ai' && !m.kind).map((m) => m.text)
  const isNew = !CHATS.some((c) => c.id === chatId)
  const empty = isNew && chat.by === 'you' && !dynamic?.some((m) => !m.kind)
  let aiIndex = -1

  return (
    <aside className="chat" aria-label={`Chat: ${renamed ?? chat.title}`} data-dropzone="chat">
      <header className="chat__head">
        <div className="chat__crumbs">
          <button type="button" className="icon-btn icon-btn--sm" onClick={() => openChat(null)} aria-label="Back to the whole lab" title="Back to the whole lab (Esc)">
            <Icon name="arrowLeft" size={15} />
          </button>
          <button type="button" className="crumb" onClick={() => focusNode(chat.hub, 1.6)} title="Show this topic on the brain">{hub.label}</button>
          <span className="crumb-sep">/</span>
          <span className={`kind kind--${chat.kind ?? 'chat'}`}>{(chat.kind ?? 'chat').toUpperCase()}</span>
          {chat.from?.length ? (
            <button type="button" className="crumb-from" onClick={() => openChat(chat.from![0])} title="Open the chat this came from">
              <Icon name={chat.kind === 'merge' ? 'merge' : 'branch'} size={12} /> from {chatTitle(chat.from[0])}
            </button>
          ) : null}
          <HeaderActions chatId={chatId} />
        </div>
        <h1 className="chat__title">{chatTitle(chatId)}</h1>
        <div className="chat__meta">
          <Avatar id={chat.by} size={20} />
          <span>Started by <b>{owner.id === 'you' ? 'you' : owner.name}</b> · {isNew ? 'just now' : '2 days ago'} · {prompts} prompt{prompts === 1 ? '' : 's'}</span>
          <span className="viewers">
            {viewers.map((v) => (
              <span key={v.id} className="viewer" title={`${PEOPLE[v.id].name} · ${v.label}`} style={{ ['--ring' as string]: PEOPLE[v.id].color }}>
                <Avatar id={v.id} size={22} ring={v.id !== 'you'} />
                {v.label === 'typing' && <i className="viewer__typing" />}
              </span>
            ))}
          </span>
        </div>
      </header>

      <div className="chat__body" ref={scrollRef}>
        {empty ? (
          <EmptyChat chatId={chatId} notes={dynamic ?? EMPTY} />
        ) : (
          <div className="thread">
            {earlierCount > 0 && (
              <p className="thread__earlier">
                {earlierCount} earlier messages ·{' '}
                <button type="button" className="link link--quiet" onClick={() => toggleEarlier(chatId)}>{showEarlier ? 'hide' : 'show'}</button>
              </p>
            )}
            {shown.map((m) => {
              const isAnswer = m.who === 'ai' && !m.kind && !m.earlier
              if (isAnswer) aiIndex++
              return <Message key={m.id} msg={m} chatId={chatId} index={isAnswer ? aiIndex : -1} />
            })}
            {typing && <LiveDraft key={`${typing.who}-${typing.since}`} act={typing} loop={!!typing.loop || ambientOff} />}
            {!THREADS[chatId] && !typing && settled && (!isNew || answered) && <TryAsking chatId={chatId} asked={asked} />}
          </div>
        )}
      </div>

      <footer className="chat__foot">
        <Suggestion chatId={chatId} />
        <Tray chatId={chatId} />
        <Composer chatId={chatId} live={live} />
      </footer>
    </aside>
  )
}

function HeaderActions({ chatId }: { chatId: string }) {
  const [menu, setMenu] = useState(false)
  return (
    <div className="chat__actions">
      <button type="button" className="icon-btn icon-btn--sm" aria-label="Branch from this chat" title="Branch from this chat" onClick={() => setBranchFrom(chatId, 'the latest answer')}>
        <Icon name="branch" size={15} />
      </button>
      <button type="button" className="icon-btn icon-btn--sm" aria-label="Export as markdown" title="Export as markdown" onClick={() => exportChat(chatId)}>
        <Icon name="export" size={15} />
      </button>
      <div className="menu-wrap">
        <button type="button" className="icon-btn icon-btn--sm" aria-label="More" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
          <Icon name="more" size={15} />
        </button>
        {menu && (
          <>
            <button type="button" className="scrim" aria-label="Close menu" onClick={() => setMenu(false)} />
            <div className="popover menu" role="menu">
              <MenuItem icon="pull" label="Copy link to this chat" onClick={() => { copyLink(chatId); setMenu(false) }} />
              <MenuItem icon="compass" label="Show it on the brain" onClick={() => { focusNode(chatId, 3.1); setMenu(false) }} />
              <MenuItem icon="file" label="Download memory card (.md)" onClick={() => { exportChat(chatId, true); setMenu(false) }} />
              <MenuItem icon="branch" label="Branch from this chat" onClick={() => { setBranchFrom(chatId, 'the latest answer'); setMenu(false) }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MenuItem({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button type="button" role="menuitem" className="menu__item" onClick={onClick}>
      <Icon name={icon} size={14} /> {label}
    </button>
  )
}

/** Watching a teammate type, Google Docs style. */
/** A teammate's question as they type it. Kofi's draft in the demo chat loops so the tour can always show it. */
function LiveDraft({ act, loop }: { act: LiveActivity; loop: boolean }) {
  const text = act.draft ?? ''
  const who = act.who
  const typed = () => Math.min(text.length, Math.floor(((Date.now() - act.since) / 1000) * CPS))
  const [n, setN] = useState(() => (loop ? 18 : typed()))
  useEffect(() => {
    if (!loop) {
      const t = window.setInterval(() => setN(typed()), 60)
      return () => window.clearInterval(t)
    }
    let i = 18
    let hold = 0
    const t = window.setInterval(() => {
      if (i >= text.length) {
        hold++
        if (hold > 26) {
          i = 18
          hold = 0
        }
      } else i += Math.random() < 0.15 ? 0 : 1
      setN(i)
    }, 85)
    return () => window.clearInterval(t)
  }, [text, loop])
  const p = PEOPLE[who]
  return (
    <div className="live-draft" style={{ ['--who' as string]: p.color }} data-tour="live-draft">
      <span className="port port--live" aria-hidden="true" />
      <div className="msg__head"><Avatar id={who} size={22} /><b>{p.short}</b><span className="live-draft__label">is typing</span></div>
      <p className="live-draft__text">
        {nameify(text.slice(0, n))}
        <span className="caret"><span className="caret__flag">{p.short}</span></span>
      </p>
    </div>
  )
}

function TryAsking({ chatId, asked }: { chatId: string; asked: string[] }) {
  const qs = suggestionsFor(getChat(chatId)?.hub ?? null, 3, asked)
  if (!qs.length) return null
  return (
    <div className="try">
      <span className="eyebrow">{asked.length ? 'Ask next' : 'Try asking'}</span>
      <div className="try__list">
        {qs.map((q) => (
          <button key={q.id} type="button" className="try__q" onClick={() => ask(chatId, q.q)}>{q.q}</button>
        ))}
      </div>
    </div>
  )
}

function EmptyChat({ chatId, notes }: { chatId: string; notes: Msg[] }) {
  const over = useStore((s) => s.drag?.over === 'chat')
  const qs = suggestionsFor(null, 4)
  const pulled = notes.filter((m) => m.kind === 'note')
  return (
    <div className={`empty ${over ? 'is-over' : ''}`}>
      <div className="empty__drop">
        <span className="empty__orbit" aria-hidden="true"><i /><i /><i /></span>
        <h2>{pulled.length ? `${pulled.length} thing${pulled.length > 1 ? 's' : ''} pulled in. Drop more, or ask.` : 'Drag anything from the brain into this chat'}</h2>
        <p>Chats, papers, robots, files or a whole topic. Everything you drop becomes context for your first question.</p>
      </div>
      {pulled.length > 0 && (
        <div className="thread thread--notes">
          {pulled.map((m, i) => <Message key={m.id} msg={m} chatId={chatId} index={-1 - i} />)}
        </div>
      )}
      <div className="try">
        <span className="eyebrow">Or just ask</span>
        <div className="try__list">
          {qs.map((q) => (
            <button key={q.id} type="button" className="try__q" onClick={() => ask(chatId, q.q)}>{q.q}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Suggestion({ chatId }: { chatId: string }) {
  const state = useStore((s) => s.suggest[chatId])
  const s = suggestionFor(chatId)
  if (!s || state === 'pulled' || state === 'dismissed') return null
  const p = PEOPLE[s.who]
  return (
    <div className="suggest" role="note" data-tour="suggest">
      <Avatar id={s.who} size={24} />
      <p>
        <b>{p.short}</b> was also working on this: <button type="button" className="link" onClick={() => openChat(s.chat)}>{chatTitle(s.chat)}</button>
      </p>
      <button type="button" className="btn btn--sm" onClick={() => pullSuggestion(chatId)}>Pull it in</button>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => dismissSuggestion(chatId)}>Not now</button>
    </div>
  )
}

const BASE_TOKENS = 4.6

function Tray({ chatId }: { chatId: string }) {
  const stored = useStore((s) => s.tray[chatId])
  const over = useStore((s) => s.drag?.over === 'chat')
  const dragging = useStore((s) => !!s.drag)
  const items: TrayItem[] = stored ?? DEFAULT_TRAY[chatId] ?? EMPTY
  const total = BASE_TOKENS + items.reduce((a, t) => a + t.tokens, 0)
  const newest = items[items.length - 1]
  const isFresh = (t?: TrayItem) => !!t?.fresh && Date.now() - t.fresh < 1600
  const chipsRef = useRef<HTMLDivElement>(null)
  const [, settle] = useState(0)
  // A new chip scrolls into view as it pops in, then loses its highlight.
  useEffect(() => {
    if (!isFresh(newest)) return
    chipsRef.current?.scrollTo({ left: chipsRef.current.scrollWidth, behavior: 'smooth' })
    const t = window.setTimeout(() => settle((n) => n + 1), 1700)
    return () => window.clearTimeout(t)
  }, [newest?.ref, newest?.fresh])
  return (
    <div className={`tray ${over ? 'is-over' : ''} ${dragging ? 'is-dragging' : ''}`} aria-label="Context for the next question" data-tour="tray">
      <div className="tray__head">
        <span className="eyebrow">{over ? 'Drop to pull into this chat' : 'Context for the next question'}</span>
        <span className="tray__budget">
          {isFresh(newest) ? <span key={newest.fresh} className="tray__delta">+{newest.tokens.toFixed(1)}k</span> : null}
          <span className="budget"><i style={{ width: `${Math.min(100, (total / 24) * 100)}%` }} /></span>
          {total.toFixed(1)}k of 24k
        </span>
      </div>
      <div className="tray__chips" ref={chipsRef}>
        <span className="ctx ctx--locked"><Icon name="chat" size={12} />This chat</span>
        {items.map((t) => (
          <span key={t.ref} className={`ctx ${isFresh(t) ? 'is-fresh' : ''}`} title={t.label}>
            {t.kind === 'chat' && t.by ? <i className="ctx__dot" style={{ background: PEOPLE[t.by].color }} /> : <Icon name={t.kind === 'hub' ? 'compass' : 'file'} size={12} />}
            <span className="ctx__label">{t.label}</span>
            <button type="button" aria-label={`Remove ${t.label}`} onClick={() => removeFromTray(chatId, t.ref)}><Icon name="close" size={11} /></button>
          </span>
        ))}
        <span className="ctx ctx--drop" data-tray-slot><Icon name="plus" size={12} />{over ? 'Drop here' : 'Drag anything from the brain'}</span>
      </div>
    </div>
  )
}

const FILTERS = {
  source: ['All 6 sources', 'Papers only', 'GitHub', 'Google Drive', 'OneDrive', 'Lab PCs', 'Lab memory'],
  type: ['Any type', 'Papers', 'Code and notebooks', 'Data and video', 'Docs and slides'],
  date: ['Any date', 'This week', 'This month', 'Since June 2025', 'Before 2020'],
}

function Composer({ chatId, live }: { chatId: string; live: PersonId | null }) {
  const text = useStore((s) => s.composer[chatId] ?? '')
  const branchFrom = useStore((s) => s.branchFrom)
  const filters = useStore((s) => s.filters)
  const focus = useStore((s) => s.focusComposer)
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (focus) ref.current?.focus()
  }, [focus])
  const branching = !!branchFrom || !!live
  const send = () => ask(chatId, text)
  return (
    <div className="composer" data-tour="composer">
      {branchFrom ? (
        <div className="composer__note">
          <Icon name="branch" size={14} />
          <span><b>Branching from {branchFrom.label}.</b> Your question starts a new chat. This one stays as it is.</span>
          <button type="button" className="icon-btn icon-btn--xs" aria-label="Cancel branch" onClick={() => setBranchFrom(null)}><Icon name="close" size={12} /></button>
        </div>
      ) : live ? (
        <div className="composer__note">
          <Avatar id={live} size={18} />
          <span><b>{PEOPLE[live].short} is working in this chat.</b> Your question will start a branch, so you won’t interrupt them.</span>
        </div>
      ) : null}
      <div className="composer__row">
        <textarea
          ref={ref}
          rows={1}
          value={text}
          placeholder={branching ? 'Ask in a branch…' : 'Ask the Lab AI…'}
          aria-label="Your question"
          onChange={(e) => setComposer(chatId, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button type="button" className="btn btn--primary" onClick={send} disabled={!text.trim()}>
          {branching ? <><Icon name="branch" size={14} /> Branch &amp; ask</> : <><Icon name="send" size={14} /> Ask</>}
        </button>
      </div>
      <div className="composer__filters">
        {(Object.keys(FILTERS) as (keyof typeof FILTERS)[]).map((k) => (
          <label key={k} className="filter">
            <span className="sr">{k === 'source' ? 'Sources' : k === 'type' ? 'File type' : 'Date range'}</span>
            <select value={filters[k]} onChange={(e) => setFilter(k, e.target.value)}>
              {FILTERS[k].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  )
}
