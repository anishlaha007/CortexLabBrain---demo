import { useState } from 'react'
import { PEOPLE, TEAM_ORDER } from '../lab/people'
import { Avatar, CortexGlyph } from '../ui/Avatar'
import { Icon } from '../ui/Icons'
import { THEMES, type Theme } from './theme'

interface Props {
  theme: Theme
  onTheme: (t: Theme) => void
  split: boolean
  onHome: () => void
}

export function TopBar({ theme, onTheme, split, onHome }: Props) {
  const [credits, setCredits] = useState(false)
  const live = TEAM_ORDER.filter((id) => PEOPLE[id].presence === 'live')

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button type="button" className="brand" onClick={onHome} aria-label="Cortex home">
          <CortexGlyph size={24} />
          <span className="brand__name">Cortex</span>
        </button>
        <span className="topbar__slash" aria-hidden="true">/</span>
        <div className="workspace">
          <span className="workspace__name">Robophysics Lab</span>
          <button type="button" className="demo-chip" onClick={() => setCredits((v) => !v)} aria-expanded={credits}>
            Demo lab
          </button>
          {credits && (
            <div className="popover credits" role="dialog" aria-label="About this demo lab">
              <p className="credits__lead">Research from the public work of Georgia Tech’s <b>CRAB Lab</b> (Prof. Dan Goldman, School of Physics).</p>
              <p>Papers, robots and press are real and credited. The teammates, their chats, everyday lab files and every number are illustrative. Not affiliated with the lab.</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCredits(false)}>Close</button>
            </div>
          )}
        </div>
      </div>

      <label className="search">
        <Icon name="search" size={16} />
        <input type="search" placeholder={split ? 'Search or ask the whole lab' : 'Search or ask the whole lab: papers, chats, data, people…'} />
        <kbd>⌘K</kbd>
      </label>

      <div className="topbar__right">
        <div className="live-stack" title={`${live.length} people live`}>
          {live.map((id) => (
            <Avatar key={id} id={id} size={26} ring />
          ))}
          <span className="live-stack__count"><i className="live-dot" />{live.length} live</span>
        </div>
        <button type="button" className="btn btn--ghost">
          <Icon name="compass" size={15} /> Take the tour
        </button>
        <div className="theme-switch" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme === t.id}
              aria-label={t.label}
              title={t.label}
              className={`theme-switch__opt ${theme === t.id ? 'is-on' : ''}`}
              onClick={() => onTheme(t.id)}
            >
              <i style={{ background: t.swatch }} />
            </button>
          ))}
        </div>
        <button type="button" className="icon-btn" aria-label="Notifications, 2 new">
          <Icon name="bell" size={17} />
          <i className="icon-btn__badge" />
        </button>
        <Avatar id="you" size={30} title="You (guest)" />
      </div>
    </header>
  )
}
