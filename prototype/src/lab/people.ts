// The fictional team. Real CRAB Lab authors only ever appear in citations.
// One person, one colour, used everywhere: brain dots, rings, avatars, cursors, carets.

export type PersonId =
  | 'elena'
  | 'kofi'
  | 'priya'
  | 'jonah'
  | 'mei'
  | 'lucas'
  | 'ava'
  | 'sam'
  | 'noor'
  | 'you'

export type Presence = 'live' | 'away' | 'offline' | 'alumni'

export interface Person {
  id: PersonId
  name: string
  short: string
  initials: string
  role: string
  focus: string
  color: string
  /** Text colour that reads on top of `color` (avatars, name tags). */
  onColor: string
  presence: Presence
  /** What they're doing right now, shown in the People rail. */
  status?: string
}

export const PEOPLE: Record<PersonId, Person> = {
  kofi: {
    id: 'kofi', name: 'Dr. Kofi Mensah', short: 'Kofi', initials: 'KM', role: 'Postdoc',
    focus: 'Robots that wiggle, snakes', color: '#3B6FE0', onColor: '#FFFFFF',
    presence: 'live', status: 'Typing in “Sidewinder robot keeps slipping”',
  },
  priya: {
    id: 'priya', name: 'Priya Raman', short: 'Priya', initials: 'PR', role: 'PhD · year 4',
    focus: 'Many legs, centipede robots', color: '#E2674A', onColor: '#1C1410',
    presence: 'live', status: 'In “Do more legs help on loose slopes?”',
  },
  jonah: {
    id: 'jonah', name: 'Jonah Kim', short: 'Jonah', initials: 'JK', role: 'PhD · year 3',
    focus: 'Fire ant tunnels', color: '#23A47A', onColor: '#0E1A14',
    presence: 'live', status: 'Typing in “Ant traffic at 5 diggers”',
  },
  mei: {
    id: 'mei', name: 'Mei Tanaka', short: 'Mei', initials: 'MT', role: 'PhD · year 2',
    focus: 'Swimming in sand', color: '#E3A21A', onColor: '#1F1503',
    presence: 'live', status: 'Exploring the brain',
  },
  ava: {
    id: 'ava', name: 'Ava Okonkwo', short: 'Ava', initials: 'AO', role: 'Undergrad',
    focus: 'Robots made of robots', color: '#E0508C', onColor: '#FFFFFF',
    presence: 'live', status: 'In “Light-following robot blob”',
  },
  elena: {
    id: 'elena', name: 'Prof. Elena Ruiz', short: 'Elena', initials: 'ER', role: 'PI',
    focus: 'Everything, grants, reading group', color: '#8E5BE8', onColor: '#FFFFFF',
    presence: 'away', status: 'Away · 20 min',
  },
  lucas: {
    id: 'lucas', name: 'Lucas Ferreira', short: 'Lucas', initials: 'LF', role: 'MS',
    focus: 'Rovers on other planets', color: '#1C9FB0', onColor: '#06181B',
    presence: 'away', status: 'Away · 1 h',
  },
  sam: {
    id: 'sam', name: 'Sam Whitfield', short: 'Sam', initials: 'SW', role: 'Research engineer',
    focus: 'Rigs, CAD, fabrication', color: '#7FA82E', onColor: '#141B06',
    presence: 'offline', status: 'Last seen yesterday',
  },
  noor: {
    id: 'noor', name: 'Noor Haddad', short: 'Noor', initials: 'NH', role: 'Alumna · 2025',
    focus: 'Built the sidewinding trackway', color: '#8C857B', onColor: '#FFFFFF',
    presence: 'alumni', status: 'Graduated 2025 · 41 chats still answering',
  },
  you: {
    id: 'you', name: 'You', short: 'You', initials: 'YO', role: 'Guest',
    focus: '', color: '#E6D9C6', onColor: '#2B2B2B', presence: 'live', status: 'Exploring the brain',
  },
}

export const TEAM_ORDER: PersonId[] = [
  'kofi', 'priya', 'jonah', 'mei', 'ava', 'elena', 'lucas', 'sam', 'noor',
]

// ───────── Presenter renames ─────────
// Scripted text uses the default names. nameify() swaps in whatever the presenter set.

const ORIGINAL: Record<string, { name: string; short: string }> = Object.fromEntries(
  Object.values(PEOPLE).map((p) => [p.id, { name: p.name, short: p.short }]),
)

export const DEFAULT_PEOPLE: Record<PersonId, Person> = JSON.parse(JSON.stringify(PEOPLE))

const LAB_NAME = 'Robophysics Lab'
let swap: Map<string, string> = new Map()
let pattern: RegExp | null = null

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Call after PEOPLE or the lab name changes, so nameify() knows what to swap. */
export function refreshRenames(labName = LAB_NAME) {
  swap = new Map()
  for (const id of Object.keys(ORIGINAL) as PersonId[]) {
    if (id === 'you') continue
    const was = ORIGINAL[id]
    const now = PEOPLE[id]
    if (was.name !== now.name) swap.set(was.name, now.name)
    if (was.short !== now.short) swap.set(was.short, now.short)
  }
  if (labName && labName !== LAB_NAME) swap.set(LAB_NAME, labName)
  // One pass with the longest names first, so swapped names never get swapped twice.
  const keys = [...swap.keys()].sort((a, b) => b.length - a.length)
  pattern = keys.length ? new RegExp(`\\b(${keys.map(esc).join('|')})\\b`, 'g') : null
}

export function nameify(text: string) {
  return pattern ? text.replace(pattern, (m) => swap.get(m) ?? m) : text
}

export function initialsOf(name: string) {
  const parts = name.replace(/^(Prof\.|Dr\.)\s+/, '').split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? '')).toUpperCase()
}
