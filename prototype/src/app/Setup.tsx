import { useEffect, useRef, useState } from 'react'
import { setTheme, toast } from '../engine/actions'
import { openSetup, resetSetup, setupLink, updatePerson, updateSetup } from '../engine/setup'
import { useStore, type Ambient } from '../engine/store'
import { PEOPLE, TEAM_ORDER, type PersonId, type Presence } from '../lab/people'
import { Avatar } from '../ui/Avatar'
import { Icon } from '../ui/Icons'
import { THEMES } from './theme'

const AMBIENT: { id: Ambient; label: string; hint: string }[] = [
  { id: 'off', label: 'Off', hint: 'Nothing moves unless you do' },
  { id: 'calm', label: 'Calm', hint: 'Something happens every 8 seconds or so' },
  { id: 'busy', label: 'Busy', hint: 'A lab in full swing, every few seconds' },
]

const PRESENCE: { id: Presence; label: string }[] = [
  { id: 'live', label: 'Live now' },
  { id: 'away', label: 'Away' },
  { id: 'offline', label: 'Offline' },
  { id: 'alumni', label: 'Alumni' },
]

/** Presenter setup: make the demo lab yours before you show it. Changes apply live. */
export function Setup() {
  const open = useStore((s) => s.setupOpen)
  const setup = useStore((s) => s.setup)
  const presence = useStore((s) => s.presence)
  const theme = useStore((s) => s.theme)
  const first = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) first.current?.focus()
  }, [open])

  if (!open) return null

  const copy = async () => {
    const url = setupLink()
    try {
      await navigator.clipboard.writeText(url)
      toast('Setup link copied. Anyone who opens it sees this lab, set up like this.')
    } catch {
      toast(`Setup link: ${url}`)
    }
  }

  return (
    <>
      <button type="button" className="scrim scrim--dim" aria-label="Close presenter setup" onClick={() => openSetup(false)} />
      <aside className="setup" role="dialog" aria-modal="true" aria-labelledby="setup-title">
        <header className="setup__head">
          <span className="setup__kind"><Icon name="sliders" size={14} /> Presenter setup</span>
          <button type="button" className="icon-btn icon-btn--sm" aria-label="Close presenter setup" onClick={() => openSetup(false)}>
            <Icon name="close" size={14} />
          </button>
        </header>

        <div className="setup__body">
          <div>
            <h2 className="setup__title" id="setup-title">Make the demo yours</h2>
            <p className="setup__lead">Rename the lab and the team, recolour people and choose how lively the lab is. Changes show straight away and are saved in this browser.</p>
          </div>

          <section className="setup__sec" aria-labelledby="setup-lab">
            <h3 id="setup-lab">The lab</h3>
            <div className="setup__grid">
              <Field label="Lab name" value={setup.labName} onCommit={(v) => updateSetup({ labName: v })} inputRef={first} />
              <Field label="Your name" hint="Shown for you, the guest" value={setup.youName} placeholder="Guest" allowEmpty onCommit={(v) => updateSetup({ youName: v })} />
            </div>
            <Toggle
              label="Show the “Demo lab” chip"
              hint="Links to the credits for the real research behind this demo"
              on={setup.demoChip}
              onChange={(v) => updateSetup({ demoChip: v })}
            />
          </section>

          <section className="setup__sec" aria-labelledby="setup-live">
            <h3 id="setup-live">The lab, live</h3>
            <p className="setup__hint">How much teammates do on their own while you present: typing, asking, branching, pulling things in and merging.</p>
            <div className="setup__seg" role="radiogroup" aria-label="How lively the lab is">
              {AMBIENT.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={setup.ambient === a.id}
                  className={setup.ambient === a.id ? 'is-on' : ''}
                  onClick={() => updateSetup({ ambient: a.id })}
                >
                  <b>{a.label}</b>
                  <span>{a.hint}</span>
                </button>
              ))}
            </div>
            <Toggle
              label={`Show ${PEOPLE.mei.short}’s cursor exploring the brain`}
              on={setup.cursor}
              onChange={(v) => updateSetup({ cursor: v })}
            />
          </section>

          <section className="setup__sec" aria-labelledby="setup-team">
            <h3 id="setup-team">Teammates</h3>
            <p className="setup__hint">Click a colour to change it. Names change everywhere, including inside answers and notes.</p>
            <ul className="setup__people">
              {TEAM_ORDER.map((id) => (
                <PersonRow key={id} id={id} presence={presence[id]} />
              ))}
            </ul>
          </section>

          <section className="setup__sec" aria-labelledby="setup-look">
            <h3 id="setup-look">Look</h3>
            <div className="setup__themes" role="radiogroup" aria-label="Theme">
              {THEMES.map((t) => (
                <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} className={theme === t.id ? 'is-on' : ''} onClick={() => setTheme(t.id)}>
                  <i style={{ background: t.swatch }} />
                  {t.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="setup__foot">
          <button type="button" className="btn btn--ghost btn--sm" onClick={copy}><Icon name="link" size={14} /> Copy setup link</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { resetSetup(); toast('Back to the original demo lab.') }}>Reset</button>
          <button type="button" className="btn btn--primary btn--sm setup__done" onClick={() => openSetup(false)}>Done</button>
        </footer>
      </aside>
    </>
  )
}

function firstName(name: string) {
  return name.replace(/^(Prof\.|Dr\.)\s+/, '').split(/\s+/)[0] ?? name
}

function PersonRow({ id, presence }: { id: PersonId; presence: Presence }) {
  const p = PEOPLE[id]
  const rename = (name: string) => {
    // Keep the short name in step when it was just the first name.
    const short = p.short === firstName(p.name) ? firstName(name) : p.short
    updatePerson(id, { name, short })
  }
  return (
    <li className="setup__person" style={{ ['--who' as string]: p.color }}>
      <label className="setup__colour" title={`Change ${p.short}’s colour`}>
        <Avatar id={id} size={34} />
        <input type="color" value={p.color} aria-label={`${p.short}’s colour`} onChange={(e) => updatePerson(id, { color: e.target.value })} />
      </label>
      <div className="setup__person-fields">
        <Field label="Name" value={p.name} onCommit={rename} compact />
        <Field label="Short" value={p.short} onCommit={(v) => updatePerson(id, { short: v })} compact />
        <Field label="Role" value={p.role} onCommit={(v) => updatePerson(id, { role: v })} compact />
        <label className="field field--compact">
          <span>Status</span>
          <select value={presence} onChange={(e) => updatePerson(id, { presence: e.target.value as Presence })}>
            {PRESENCE.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </label>
      </div>
    </li>
  )
}

/** A text field that applies as you type, but never applies an empty name. */
function Field({ label, hint, value, placeholder, allowEmpty, compact, onCommit, inputRef }: {
  label: string
  hint?: string
  value: string
  placeholder?: string
  allowEmpty?: boolean
  compact?: boolean
  onCommit: (v: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}) {
  const [draft, setDraft] = useState(value)
  const own = useRef<HTMLInputElement>(null)
  const ref = inputRef ?? own
  // Follow outside changes (Reset), but not while you're typing here.
  useEffect(() => {
    if (document.activeElement !== ref.current) setDraft(value)
  }, [value, ref])
  return (
    <label className={`field ${compact ? 'field--compact' : ''}`}>
      <span>{label}{hint && <i> · {hint}</i>}</span>
      <input
        ref={ref}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          setDraft(e.target.value)
          if (allowEmpty || e.target.value.trim()) onCommit(e.target.value)
        }}
        onBlur={() => setDraft(value)}
      />
    </label>
  )
}

function Toggle({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle__track" aria-hidden="true"><i /></span>
      <span className="toggle__text">
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  )
}
