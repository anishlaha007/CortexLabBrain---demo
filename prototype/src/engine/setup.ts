import { ACTIVE } from '../lab/content'
import { DEFAULT_PEOPLE, PEOPLE, TEAM_ORDER, initialsOf, refreshRenames, type PersonId, type Presence } from '../lab/people'
import { LIVE_DRAFTS } from '../lab/threads'
import { DEFAULT_SETUP, getState, setState, type Ambient, type Setup } from './store'

// Presenter setup: rename the lab and the team, recolour people, set who's around and how busy
// the lab is. Saved in this browser, and shareable as a link so a whole room sees the same lab.

const KEY = 'cortex.setup'

const STATUS: Record<Presence, string> = {
  live: 'Exploring the brain',
  away: 'Away',
  offline: 'Offline',
  alumni: 'Alumni',
}

/** Dark or light text, whichever reads on top of a person's colour. */
function onColorFor(hex: string) {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.32 ? '#1C1410' : '#FFFFFF'
}

const isAmbient = (v: unknown): v is Ambient => v === 'off' || v === 'calm' || v === 'busy'
const isPresence = (v: unknown): v is Presence => v === 'live' || v === 'away' || v === 'offline' || v === 'alumni'

/** Keep only what a setup can hold, so an old or hand-edited link can't break the app. */
function clean(raw: unknown): Setup {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')
  const people: Setup['people'] = {}
  const rp = (r.people && typeof r.people === 'object' ? r.people : {}) as Record<string, Record<string, unknown>>
  for (const id of TEAM_ORDER) {
    const p = rp[id]
    if (!p || typeof p !== 'object') continue
    const d = DEFAULT_PEOPLE[id]
    const color = typeof p.color === 'string' && /^#[0-9a-f]{6}$/i.test(p.color) ? p.color : d.color
    people[id] = {
      name: str(p.name, 40).trim() || d.name,
      short: str(p.short, 20).trim() || d.short,
      role: str(p.role, 40).trim() || d.role,
      color,
      presence: isPresence(p.presence) ? p.presence : d.presence,
    }
  }
  return {
    labName: str(r.labName, 48).trim() || DEFAULT_SETUP.labName,
    youName: str(r.youName, 40).trim(),
    people,
    ambient: isAmbient(r.ambient) ? r.ambient : DEFAULT_SETUP.ambient,
    cursor: typeof r.cursor === 'boolean' ? r.cursor : DEFAULT_SETUP.cursor,
    demoChip: typeof r.demoChip === 'boolean' ? r.demoChip : DEFAULT_SETUP.demoChip,
  }
}

function encode(setup: Setup) {
  const bytes = new TextEncoder().encode(JSON.stringify(setup))
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decode(s: string): Setup | null {
  try {
    const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return clean(JSON.parse(new TextDecoder().decode(bytes)))
  } catch {
    return null
  }
}

/** Apply a setup everywhere: names, colours, presence, the lab's name, the live activity. */
export function applySetup(next: Setup, save = true, restore = false) {
  const setup = clean(next)
  const presence = { ...getState().presence }
  for (const id of TEAM_ORDER) {
    const d = DEFAULT_PEOPLE[id]
    const o = setup.people[id]
    const p = PEOPLE[id]
    p.name = o?.name ?? d.name
    p.short = o?.short ?? d.short
    p.role = o?.role ?? d.role
    p.color = o?.color ?? d.color
    p.onColor = o?.color ? onColorFor(o.color) : d.onColor
    p.initials = o?.name ? initialsOf(o.name) : d.initials
    // Without an override, whoever came online or left during the demo stays that way (unless resetting).
    const want = o?.presence ?? (restore ? d.presence : presence[id])
    if (want !== presence[id]) {
      p.presence = want
      p.status = want === d.presence ? d.status : STATUS[want]
      presence[id] = want
    }
    document.documentElement.style.setProperty(`--p-${id}`, p.color)
  }
  PEOPLE.you.initials = setup.youName ? initialsOf(setup.youName) : DEFAULT_PEOPLE.you.initials
  refreshRenames(setup.labName)
  setState((s) => {
    // Anyone no longer around stops typing and leaves their chat. Kofi picks his draft back up when he returns.
    const active = s.active.filter((a) => presence[a.who] === 'live')
    const kofi = ACTIVE.find((a) => a.who === 'kofi')
    if (kofi && presence.kofi === 'live' && !active.some((a) => a.who === 'kofi')) {
      active.unshift({ ...kofi, since: Date.now(), draft: LIVE_DRAFTS[kofi.chat], loop: true })
    }
    return {
      setup,
      presence,
      active,
      following: s.following && presence[s.following] === 'live' ? s.following : null,
      setupVersion: s.setupVersion + 1,
    }
  })
  if (save) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(setup))
    } catch {
      // Storage can be blocked. The setup still applies for this visit.
    }
  }
}

/** Patch one part of the setup, as the presenter types. */
export function updateSetup(patch: Partial<Setup>) {
  applySetup({ ...getState().setup, ...patch })
}

export function updatePerson(id: PersonId, patch: Partial<NonNullable<Setup['people'][PersonId]>>) {
  const d = DEFAULT_PEOPLE[id]
  const cur = getState().setup.people[id] ?? { name: d.name, short: d.short, role: d.role, color: d.color, presence: getState().presence[id] }
  updateSetup({ people: { ...getState().setup.people, [id]: { ...cur, ...patch } } })
}

export function resetSetup() {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // Nothing saved to remove.
  }
  applySetup(DEFAULT_SETUP, false, true)
}

export function setupLink() {
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set('setup', encode(getState().setup))
  return url.toString()
}

export function openSetup(open = true) {
  setState({ setupOpen: open })
}

/** On load: a shared ?setup=… link wins, then this browser's saved setup. A bare ?setup opens the panel. */
export function loadSetup() {
  const param = new URLSearchParams(window.location.search).get('setup')
  if (param) {
    const shared = decode(param)
    if (shared) return applySetup(shared)
  }
  if (param !== null && !param) openSetup()
  try {
    const saved = window.localStorage.getItem(KEY)
    if (saved) applySetup(clean(JSON.parse(saved)), false)
  } catch {
    // A broken or blocked save just means the default lab.
  }
}
