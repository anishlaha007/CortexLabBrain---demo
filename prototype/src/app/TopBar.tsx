import { useMemo, useRef, useState } from 'react'
import {
  ask, follow, focusNode, markAllRead, markNoticeRead, openChat, openSource, setSearch, setTheme, startTour,
} from '../engine/actions'
import { BANK } from '../engine/bank'
import { openSetup } from '../engine/setup'
import { useStore } from '../engine/store'
import { graph } from '../engine/world'
import { HUBS } from '../lab/content'
import { PEOPLE, TEAM_ORDER, nameify, type PersonId } from '../lab/people'
import { AiMark, Avatar, CortexGlyph } from '../ui/Avatar'
import { Icon } from '../ui/Icons'
import { THEMES } from './theme'

/** A spread of question types for the empty search: new member, new idea, meeting prep, finding files, background. */
const TRY = ['onboard', 'pivot', 'open-questions', 'disagree', 'find-ant-video', 'granular']

export function TopBar() {
  const theme = useStore((s) => s.theme)
  const split = useStore((s) => !!s.openChat)
  const [pop, setPop] = useState<'credits' | 'notices' | 'you' | null>(null)
  const presence = useStore((s) => s.presence)
  const labName = useStore((s) => s.setup.labName)
  const youName = useStore((s) => s.setup.youName)
  const demoChip = useStore((s) => s.setup.demoChip)
  const live = TEAM_ORDER.filter((id) => presence[id] === 'live')
  const toggle = (p: typeof pop) => setPop((cur) => (cur === p ? null : p))

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button type="button" className="brand" onClick={() => openChat(null)} aria-label="Cortex home: the whole lab">
          <CortexGlyph size={24} />
          <span className="brand__name">Cortex</span>
        </button>
        <span className="topbar__slash" aria-hidden="true">/</span>
        <div className="workspace">
          <span className="workspace__name">{labName}</span>
          {demoChip && (
            <button type="button" className="demo-chip" onClick={() => toggle('credits')} aria-expanded={pop === 'credits'}>
              Demo lab
            </button>
          )}
          {pop === 'credits' && <Credits onClose={() => setPop(null)} />}
        </div>
      </div>

      <SearchBox split={split} />

      <div className="topbar__right">
        <div className="live-stack" role="group" aria-label="People live now. Click to follow.">
          {live.map((id) => (
            <button key={id} type="button" className="live-stack__btn" onClick={() => follow(id)} title={`Follow ${PEOPLE[id].short}`} aria-label={`Follow ${PEOPLE[id].short}`}>
              <Avatar id={id} size={26} ring />
            </button>
          ))}
          <span className="live-stack__count"><i className="live-dot" />{live.length} live</span>
        </div>
        <button type="button" className="btn btn--ghost" onClick={startTour}>
          <Icon name="compass" size={15} /> Take the tour
        </button>
        <div className="theme-switch" role="radiogroup" aria-label="Theme" data-tour="themes">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme === t.id}
              aria-label={t.label}
              title={t.label}
              className={`theme-switch__opt ${theme === t.id ? 'is-on' : ''}`}
              onClick={() => setTheme(t.id)}
            >
              <i style={{ background: t.swatch }} />
            </button>
          ))}
        </div>
        <Notices open={pop === 'notices'} onToggle={() => toggle('notices')} onClose={() => setPop(null)} />
        <div className="menu-wrap">
          <button type="button" className="you-btn" onClick={() => toggle('you')} aria-expanded={pop === 'you'} aria-label="Your menu">
            <Avatar id="you" size={30} title={youName ? `${youName} (you)` : 'You (guest)'} />
          </button>
          {pop === 'you' && (
            <>
              <button type="button" className="scrim" aria-label="Close menu" onClick={() => setPop(null)} />
              <div className="popover menu menu--right" role="menu">
                <div className="menu__who">
                  <Avatar id="you" size={30} />
                  <span><b>{youName || 'You'}</b><span>Guest in {labName}</span></span>
                </div>
                <button type="button" role="menuitem" className="menu__item" onClick={() => { setPop(null); startTour() }}><Icon name="compass" size={14} /> Take the tour</button>
                <button type="button" role="menuitem" className="menu__item" onClick={() => { setPop(null); openSetup() }}><Icon name="sliders" size={14} /> Presenter setup <kbd className="menu__kbd">,</kbd></button>
                <button type="button" role="menuitem" className="menu__item" onClick={() => setPop('credits')}><Icon name="paper" size={14} /> About this demo lab</button>
                <button type="button" role="menuitem" className="menu__item" onClick={() => { window.location.href = window.location.pathname }}><Icon name="arrowLeft" size={14} /> Restart the demo</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function Credits({ onClose }: { onClose: () => void }) {
  return (
    <>
      <button type="button" className="scrim" aria-label="Close" onClick={onClose} />
      <div className="popover credits" role="dialog" aria-label="About this demo lab">
        <p className="credits__lead">Research from the public work of Georgia Tech’s <b>CRAB Lab</b> (Prof. Dan Goldman, School of Physics).</p>
        <p>Papers, robots and press are real and credited, with links in each citation. The teammates, their chats, everyday lab files and every number are illustrative. Not affiliated with the lab.</p>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>Close</button>
      </div>
    </>
  )
}

function Notices({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  const notices = useStore((s) => s.notices)
  const unread = notices.filter((n) => n.unread).length
  return (
    <div className="menu-wrap">
      <button type="button" className="icon-btn" aria-label={`Notifications${unread ? `, ${unread} new` : ''}`} aria-expanded={open} onClick={onToggle}>
        <Icon name="bell" size={17} />
        {unread > 0 && <i className="icon-btn__badge" />}
      </button>
      {open && (
        <>
          <button type="button" className="scrim" aria-label="Close" onClick={onClose} />
          <div className="popover notices" role="dialog" aria-label="Notifications">
            <header className="notices__head">
              <span className="eyebrow">Notifications</span>
              <button type="button" className="link link--quiet" onClick={markAllRead}>Mark all read</button>
            </header>
            <ul className="notices__list">
              {notices.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`notice ${n.unread ? 'is-unread' : ''}`}
                    onClick={() => {
                      markNoticeRead(n.id)
                      if (n.chat) openChat(n.chat)
                      else if (n.id === 'n1') startTour()
                      onClose()
                    }}
                  >
                    {n.who === 'ai' ? <AiMark size={26} /> : <Avatar id={n.who} size={26} />}
                    <span className="notice__text">{nameify(n.text)}</span>
                    <span className="notice__when">{n.when}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

/** Search the whole lab: matches light up on the brain as you type, Enter asks the Lab AI. */
function SearchBox({ split }: { split: boolean }) {
  const q = useStore((s) => s.search)
  const chats = useStore((s) => s.extraChats)
  const [focus, setFocus] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter((w) => w.length > 1)
    if (!words.length) return null
    const hit = (s: string) => words.every((w) => s.toLowerCase().includes(w))
    return {
      topics: HUBS.filter((h) => hit(`${h.label} ${h.question}`)).slice(0, 3),
      chats: graph.nodes.filter((n) => n.type === 'chat' && hit(n.label)).slice(0, 4),
      files: graph.nodes.filter((n) => n.type === 'file' && hit(`${n.label} ${n.cite ?? ''}`)).slice(0, 4),
      people: (Object.keys(PEOPLE) as PersonId[]).filter((id) => id !== 'you' && hit(`${PEOPLE[id].name} ${PEOPLE[id].focus}`)).slice(0, 3),
      questions: BANK.filter((b) => hit(`${b.q} ${b.title}`)).slice(0, 3),
    }
    // extraChats is a dependency so new chats show up in results.
  }, [q, chats])

  const done = () => {
    setSearch('')
    setFocus(false)
    inputRef.current?.blur()
  }
  const submit = () => {
    if (!q.trim()) return
    ask(null, q)
    done()
  }

  return (
    <div className="search-wrap" data-tour="search">
      <label className="search">
        <Icon name="search" size={16} />
        <input
          ref={inputRef}
          type="search"
          value={q}
          placeholder={split ? 'Search or ask the whole lab' : 'Search or ask the whole lab: papers, chats, data, people…'}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => window.setTimeout(() => setFocus(false), 160)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
            if (e.key === 'Escape') done()
          }}
          aria-label="Search or ask the whole lab"
        />
        <kbd>⌘K</kbd>
      </label>
      {focus && (
        <div className="popover search-pop" role="listbox" aria-label="Search results">
          {q.trim() ? (
            <>
              <button type="button" className="search-pop__ask" onMouseDown={(e) => e.preventDefault()} onClick={submit}>
                <AiMark size={24} />
                <span>Ask the Lab AI: <b>“{q.trim()}”</b></span>
                <kbd>Enter</kbd>
              </button>
              {results && (
                <>
                  <Group title="Questions the Lab AI can answer" show={results.questions.length > 0}>
                    {results.questions.map((b) => (
                      <Row key={b.id} icon={<Icon name="sparkle" size={14} />} label={b.q} onPick={() => { ask(null, b.q); done() }} />
                    ))}
                  </Group>
                  <Group title="Topics" show={results.topics.length > 0}>
                    {results.topics.map((h) => (
                      <Row key={h.id} icon={<Icon name="compass" size={14} />} label={h.label} meta={h.question} onPick={() => { focusNode(h.id, 1.9); done() }} />
                    ))}
                  </Group>
                  <Group title="Chats" show={results.chats.length > 0}>
                    {results.chats.map((n) => (
                      <Row key={n.id} icon={<i className="search-pop__dot" style={{ background: PEOPLE[n.by!].color }} />} label={n.label} meta={PEOPLE[n.by!].name} onPick={() => { openChat(n.id); done() }} />
                    ))}
                  </Group>
                  <Group title="Papers and files" show={results.files.length > 0}>
                    {results.files.map((n) => (
                      <Row key={n.id} icon={<Icon name={n.source === 'paper' ? 'paper' : n.source === 'robot' ? 'robot' : n.source === 'web' ? 'web' : 'file'} size={14} />} label={n.label} meta={n.cite ?? 'Lab file'} onPick={() => { openSource({ node: n.id, where: 'search result' }, null); done() }} />
                    ))}
                  </Group>
                  <Group title="People" show={results.people.length > 0}>
                    {results.people.map((id) => (
                      <Row key={id} icon={<Avatar id={id} size={20} />} label={PEOPLE[id].name} meta={PEOPLE[id].focus} onPick={() => { follow(id); done() }} />
                    ))}
                  </Group>
                </>
              )}
            </>
          ) : (
            <Group title="Try asking" show>
              {TRY.map((id) => BANK.find((b) => b.id === id)!).map((b) => (
                <Row key={b.id} icon={<Icon name="sparkle" size={14} />} label={b.q} onPick={() => { ask(null, b.q); done() }} />
              ))}
            </Group>
          )}
        </div>
      )}
    </div>
  )
}

function Group({ title, show, children }: { title: string; show: boolean; children: React.ReactNode }) {
  if (!show) return null
  return (
    <div className="search-pop__group">
      <span className="eyebrow">{title}</span>
      {children}
    </div>
  )
}

function Row({ icon, label, meta, onPick }: { icon: React.ReactNode; label: string; meta?: string; onPick: () => void }) {
  return (
    <button type="button" className="search-pop__row" role="option" aria-selected="false" onMouseDown={(e) => e.preventDefault()} onClick={onPick}>
      <span className="search-pop__icon">{icon}</span>
      <span className="search-pop__label">{label}</span>
      {meta && <span className="search-pop__meta">{meta}</span>}
    </button>
  )
}
