import { PEOPLE, type PersonId } from '../lab/people'

interface Props {
  id: PersonId
  size?: number
  ring?: boolean
  live?: boolean
  title?: string
}

/** One person, one colour: the avatar is filled with it. */
export function Avatar({ id, size = 28, ring, live, title }: Props) {
  const p = PEOPLE[id]
  const faded = p.presence === 'alumni' || p.presence === 'offline'
  return (
    <span
      className={`avatar ${ring ? 'avatar--ring' : ''} ${faded ? 'avatar--faded' : ''} ${id === 'you' ? 'avatar--you' : ''}`}
      style={{ width: size, height: size, background: p.color, color: p.onColor, fontSize: size * 0.38, ['--ring' as string]: p.color }}
      title={title ?? p.name}
    >
      {p.initials}
      {live && <i className="avatar__live" />}
    </span>
  )
}

export function AiMark({ size = 28 }: { size?: number }) {
  return (
    <span className="ai-mark" style={{ width: size, height: size }} aria-label="Lab AI">
      <CortexGlyph size={size * 0.56} />
    </span>
  )
}

/** The Cortex mark: four linked nodes, one of them lit. */
export function CortexGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 7.5 12 4l6 3.5M6 7.5v8.5l6 4 6-4V7.5M12 4v7.5m0 0L6 16m6-4.5 6 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" opacity=".55" />
      <circle cx="12" cy="4" r="2" fill="currentColor" />
      <circle cx="6" cy="7.5" r="1.7" fill="currentColor" />
      <circle cx="18" cy="7.5" r="1.7" fill="currentColor" />
      <circle cx="6" cy="16" r="1.7" fill="currentColor" />
      <circle cx="18" cy="16" r="1.7" fill="currentColor" />
      <circle cx="12" cy="20" r="1.7" fill="currentColor" />
      <circle cx="12" cy="11.5" r="2.4" fill="var(--accent)" />
    </svg>
  )
}
