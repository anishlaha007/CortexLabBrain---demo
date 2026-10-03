import { type HubId } from '../lab/content'
import { PEOPLE, type PersonId, type Presence } from '../lab/people'
import {
  appendMsg, chatTitle, clock, createChat, getChat, nextId, notify, pulses, pushFeed, readFromFor, stream, toast,
  trayItemFor, trayOf,
} from './actions'
import { getState, setState, type LiveActivity, type Msg, type SourceRef } from './store'
import { addEdge, addMemoryDot, hasEdge } from './world'

// The lab carries on without you: teammates type, ask, branch, pull things in and merge,
// and the Lab AI links findings. Every beat is scripted and plays in order, so a demo
// looks the same each time. Kofi stays in the demo chat for the tour.

/** Typing speed for live drafts, in characters per second. */
export const CPS = 16

type Step =
  | { do: 'ask'; chat: string; q: string; a: string; src?: SourceRef[] }
  /** Post the question they were already typing when you arrived. */
  | { do: 'finish'; chat: string; a: string; src?: SourceRef[] }
  | { do: 'branch'; from: string; title: string; q: string; a: string; src?: SourceRef[] }
  | { do: 'pull'; chat: string; ref: string }
  | { do: 'merge'; from: string; into: string }
  | { do: 'view'; chat: string }
  | { do: 'arrive' }

const SCRIPTS: Partial<Record<PersonId, Step[]>> = {
  jonah: [
    {
      do: 'finish', chat: 'c-traffic',
      a: 'Digging should hold up. In the 2018 clog study, tunnels flowed best when a few workers did most of the digging and the rest kept out of the way [1]. Your tunnel_flux.py runs with 5 robots point the same way, but there are only 3 runs so far [2].',
      src: [{ node: 'p-clog', where: 'Abstract' }, { node: 'f-flux', where: 'runs 1–3' }],
    },
    {
      do: 'ask', chat: 'c-idle', q: 'How many ants were idle in this week’s tunnel cam clips?',
      a: 'Most of them. In the clips tagged this week, about 7 in 10 ants did little or no digging [1]. That fits the uneven workloads in the clog paper [2].',
      src: [{ node: 'f-ant-vid', where: 'tagged clips, 22–26 Sep' }, { node: 'p-clog', where: 'Abstract' }],
    },
    { do: 'merge', from: 'c-4robots', into: 'c-antmerge' },
    {
      do: 'ask', chat: 'c-falls', q: 'Is there a tunnel width where ants stop catching their falls?',
      a: 'The 2013 study found that ants use their antennae to catch themselves, and that tunnel width compared with body size shapes how they climb and fall [1]. Our fall clips aren’t tagged by width yet, so I can’t give you the lab’s own cut-off [2].',
      src: [{ node: 'p-antjam', where: 'Abstract' }, { node: 'f-ant-vid', where: 'not tagged by width' }],
    },
  ],
  priya: [
    {
      do: 'ask', chat: 'c-slopelegs', q: 'Do extra leg pairs still help once the slope passes 20°?',
      a: 'Up to a point. In your leg-pair sweep, slip keeps falling until about 6 pairs, then levels off [1]. The 2023 multilegged paper explains why: more legs make the robot robust on rough, noisy ground [2].',
      src: [{ node: 'f-legs-csv', where: 'slope runs, 20–24°' }, { node: 'p-multileg', where: 'Abstract' }],
    },
    { do: 'pull', chat: 'c-lift', ref: 'p-slip' },
    {
      do: 'branch', from: 'c-pairs', title: 'Five leg pairs for the farm robot?',
      q: 'Could the blueberry-row robot get by with five leg pairs?',
      a: 'Probably on flat rows. The sweep shows returns flattening after about 6 pairs [1], and the blueberry mockup chat notes rougher ground between rows, so keep a margin [2].',
      src: [{ node: 'f-legs-csv', where: 'pairs 2–12' }, { chat: 'c-blueberry', where: 'Priya Raman · last week' }],
    },
    {
      do: 'ask', chat: 'c-legfail', q: 'If one middle leg fails, how much slower does it get?',
      a: 'A little. In the 12 runs with one leg switched off, the robot kept going at about nine tenths of its usual speed [1]. That is the spatial redundancy the grant draft leans on [2].',
      src: [{ node: 'f-legs-csv', where: 'disabled-leg runs' }, { node: 'f-grant', where: 'Section 2' }],
    },
  ],
  ava: [
    {
      do: 'ask', chat: 'c-lightblob', q: 'Which light trials actually moved toward the lamp?',
      a: 'Seven of the twelve runs in light_trials.csv end closer to the lamp than they start [1]. The 2021 blobs paper describes robot blobs heading toward light by changing how the robots move together [2].',
      src: [{ node: 'f-blob-log', where: '12 runs' }, { node: 'p-blobs', where: 'Abstract' }],
    },
    { do: 'pull', chat: 'c-five', ref: 'c-drift' },
    {
      do: 'ask', chat: 'c-five', q: 'Does the ring drift less with six smarticles than five?',
      a: 'Slightly, in this month’s runs [1]. The 2019 smarticle paper shows the ring moves because of collisions among its members, and that switching one smarticle off steers it [2].',
      src: [{ chat: 'c-drift', where: 'Ava Okonkwo · this month' }, { node: 'p-smarticle', where: 'Abstract' }],
    },
    { do: 'view', chat: 'c-openhouse' },
  ],
  mei: [
    { do: 'pull', chat: 'c-ourphase', ref: 'p-geophase' },
    {
      do: 'ask', chat: 'c-wet', q: 'Does RFT still hold if the sand is a little wet?',
      a: 'Not as it stands. The coefficients in rft/forces.py were fit on dry glass beads [1], and wet sand sticks together in a way the model leaves out. The notebook has no wet trials yet [2].',
      src: [{ node: 'f-rft', where: 'coefficients' }, { node: 'f-rft-nb', where: 'trials list' }],
    },
    {
      do: 'branch', from: 'c-tailtime', title: 'MuddyBot’s tail on wet sand',
      q: 'Would the tail still help MuddyBot on wet sand?',
      a: 'Probably, but nobody here has tested it. The 2016 tail paper found that using the tail helped on soft, sandy slopes [1]. Wet sand is firmer, so the benefit may shrink. tail_timing.py could run the comparison [2].',
      src: [{ node: 'p-tail', where: 'Abstract' }, { node: 'f-muddy', where: 'tail_timing.py' }],
    },
  ],
  lucas: [
    { do: 'arrive' },
    {
      do: 'ask', chat: 'c-stuck', q: 'Did the rover get stuck before or after Noor’s recalibration?',
      a: 'After. Every stuck run in the log is from after 14 June, when the bed was re-levelled [1]. Compare against Noor’s new calibration, not the older trials [2].',
      src: [{ node: 'f-calib', where: '14 June entry' }, { chat: 'c-recal', where: 'Noor Haddad (alumna) · June' }],
    },
    {
      do: 'branch', from: 'c-pedal', title: 'Pedaling on lunar simulant',
      q: 'Would pedaling still help on lunar regolith simulant?',
      a: 'Possibly, but it hasn’t been tried here. The rover paper shows its pedaling gait climbs loose slopes by reshaping the sand ahead of it [1]. The regolith chat lists which simulant you’d need [2].',
      src: [{ node: 'p-rover', where: 'Abstract' }, { chat: 'c-regolith', where: 'Lucas Ferreira · last month' }],
    },
  ],
  elena: [
    { do: 'arrive' },
    {
      do: 'ask', chat: 'c-grant', q: 'Which three results should lead the renewal?',
      a: 'Going by what the lab cited most this term: robustness from many legs [1], mechanical intelligence in limbless robots [2], and collective clog control in ants and robots [3].',
      src: [{ node: 'p-multileg', where: 'cited in 9 chats' }, { node: 'p-mechint', where: 'cited in 7 chats' }, { node: 'p-clog', where: 'cited in 6 chats' }],
    },
    { do: 'view', chat: 'c-agenda' },
  ],
  sam: [
    { do: 'arrive' },
    { do: 'view', chat: 'c-servo' },
    {
      do: 'ask', chat: 'c-current', q: 'When did the cable 2 current spikes start?',
      a: 'On 18 September, the same day cable 2 was re-tensioned [1]. Kofi’s tension chat has the new settings [2].',
      src: [{ node: 'f-cable', where: 'commit, 18 Sep' }, { chat: 'c-tension', where: 'Dr. Kofi Mensah · 18 Sep' }],
    },
  ],
}

/** Who takes a turn, in order. Away teammates come online partway through. */
const ORDER: PersonId[] = ['jonah', 'priya', 'ava', 'mei', 'lucas', 'priya', 'jonah', 'elena', 'ava', 'mei', 'sam']

/** Findings the Lab AI links across chats as the lab works. */
const LINKS: [string, string][] = [
  ['c-wet', 'c-regolith'],
  ['c-legfail', 'c-redund'],
  ['c-falls', 'c-fps'],
  ['c-turn', 'c-spacing'],
  ['c-stuck', 'c-wheelslip'],
  ['c-idle', 'c-five'],
]

/** Whose turf a topic is, for picking who notices your chats. */
const HUB_PERSON: Partial<Record<HubId, PersonId>> = {
  sand: 'mei', maths: 'mei', land: 'mei', legs: 'priya', soft: 'priya', ants: 'jonah', smarticles: 'ava', rovers: 'lucas',
}
/** Somewhere their own to pull your chat into. */
const HOME_CHAT: Partial<Record<PersonId, string>> = {
  priya: 'c-slopelegs', jonah: 'c-antmerge', ava: 'c-lightblob', mei: 'c-ourphase', lucas: 'c-stuck', elena: 'c-onboard', sam: 'c-safety',
}

// ───────── Runner ─────────

let started = false
let tick = 0
let turn = 0
let linkAt = 0
const step: Partial<Record<PersonId, number>> = {}
const busy = new Set<PersonId>()
const noticed = new Set<string>()
let seed = 7

function rand() {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}

function later(ms: number, fn: () => void) {
  window.setTimeout(fn, ms)
}

export function startAmbient() {
  if (started) return
  started = true
  later(2400, loop)
}

function loop() {
  const st = getState()
  const mode = st.setup.ambient
  if (mode !== 'off' && !st.drag && !document.hidden) beat()
  const base = mode === 'busy' ? 3600 : 8200
  later(mode === 'off' ? 1500 : base * (0.8 + rand() * 0.4), loop)
}

function beat() {
  tick++
  // Your own chats get noticed first: that’s the part that concerns you.
  if (getState().tour === null && noticeYours()) return
  if (tick % 4 === 0 && linkNext()) return
  for (let tries = 0; tries < ORDER.length; tries++) {
    const who = ORDER[turn++ % ORDER.length]
    if (busy.has(who)) continue
    const script = SCRIPTS[who] ?? []
    const i = step[who] ?? 0
    if (i < script.length) {
      step[who] = i + 1
      run(who, script[i])
      return
    }
  }
  // Everyone’s script is done: drift between chats, and keep linking.
  if (!linkNext()) wander()
}

function run(who: PersonId, s: Step) {
  switch (s.do) {
    case 'ask': return askLive(who, s.chat, s.q, s.a, s.src)
    case 'finish': {
      const a = getState().active.find((x) => x.who === who && x.chat === s.chat)
      const q = a?.draft ?? ''
      const left = a ? Math.max(0, (q.length / CPS) * 1000 - (Date.now() - a.since)) : 0
      busy.add(who)
      return later(left + 700, () => post(who, s.chat, q, s.a, s.src))
    }
    case 'branch': return branchLive(who, s.from, s.title, s.q, s.a, s.src)
    case 'pull': return pullLive(who, s.chat, s.ref)
    case 'merge': return mergeLive(who, s.from, s.into)
    case 'view': return setActivity(who, { who, chat: s.chat, doing: 'viewing', since: Date.now() })
    case 'arrive': return arrive(who)
  }
}

// ───────── Beats ─────────

function setActivity(who: PersonId, a: LiveActivity | null) {
  setState((s) => ({ active: [...s.active.filter((x) => x.who !== who), ...(a ? [a] : [])] }))
  if (a) pulses.set(a.chat, performance.now())
}

function setPresence(who: PersonId, p: Presence, status: string) {
  PEOPLE[who].presence = p
  PEOPLE[who].status = status
  setState((s) => ({ presence: { ...s.presence, [who]: p } }))
}

function arrive(who: PersonId) {
  if (getState().presence[who] === 'live') return
  setPresence(who, 'live', 'Just came online')
  pushFeed(who, 'came online', '')
}

function clearLiveFeed(who: PersonId) {
  setState((s) => ({ feed: s.feed.filter((f) => !(f.live && f.who === who)) }))
}

function askLive(who: PersonId, chat: string, q: string, a: string, src?: SourceRef[]) {
  if (!getChat(chat)) return
  busy.add(who)
  setActivity(who, { who, chat, doing: 'typing', draft: q, since: Date.now() })
  clearLiveFeed(who)
  pushFeed(who, 'is typing in', chatTitle(chat), chat, true)
  later((q.length / CPS) * 1000 + 700, () => post(who, chat, q, a, src))
}

/** The question lands, the Lab AI answers it, and a memory dot joins the chat on the brain. */
function post(who: PersonId, chat: string, q: string, a: string, src?: SourceRef[]) {
  const asked = nextId('m')
  appendMsg(chat, { id: asked, who, text: q, time: clock() })
  setActivity(who, { who, chat, doing: 'viewing', since: Date.now() })
  clearLiveFeed(who)
  pushFeed(who, 'asked the Lab AI in', chatTitle(chat), chat)
  const answer: Msg = { id: nextId('m'), who: 'ai', time: clock(), text: a, sources: src, readFrom: readFromFor(src) }
  stream(chat, answer, () => {
    addMemoryDot(chat, who, { text: q, file: src?.find((x) => x.node)?.node ?? src?.[0]?.chat, msg: asked })
    busy.delete(who)
  })
}

function branchLive(who: PersonId, from: string, title: string, q: string, a: string, src?: SourceRef[]) {
  const parent = getChat(from)
  if (!parent) return
  busy.add(who)
  const id = createChat({ hub: parent.hub, by: who, kind: 'branch', from: [from], title })
  appendMsg(id, {
    id: nextId('m'), who: 'ai', kind: 'note', noteIcon: 'branch', time: clock(),
    text: `${PEOPLE[who].short} branched from *${chatTitle(from)}*. The original chat stays as it is.`,
  })
  pushFeed(who, 'branched', title, id)
  if (parent.by === 'you') {
    notify(who, `${PEOPLE[who].short} branched from your chat “${chatTitle(from)}”.`, id)
    toast(`${PEOPLE[who].short} branched from your chat.`, { who, tone: 'live' })
  }
  later(1100, () => askLive(who, id, q, a, src))
}

function pullLive(who: PersonId, chat: string, ref: string) {
  const item = trayItemFor(ref)
  if (!item || !getChat(chat) || trayOf(chat).some((t) => t.ref === ref)) return
  setActivity(who, { who, chat, doing: 'viewing', since: Date.now() })
  setState((s) => ({ tray: { ...s.tray, [chat]: [...trayOf(chat), item] } }))
  addEdge(ref, chat, 'pull')
  pulses.set(ref, performance.now())
  appendMsg(chat, {
    id: nextId('m'), who, kind: 'note', noteIcon: 'pull', time: clock(),
    text: `${PEOPLE[who].short} pulled *${item.label}* into this chat`,
  })
  pushFeed(who, `pulled “${item.label}” into`, chatTitle(chat), chat)
  if (getChat(ref)?.by === 'you') {
    notify(who, `${PEOPLE[who].short} pulled your chat “${chatTitle(ref)}” into “${chatTitle(chat)}”.`, chat)
    toast(`${PEOPLE[who].short} pulled your chat into “${chatTitle(chat)}”.`, { who, tone: 'live' })
  }
}

function mergeLive(who: PersonId, from: string, into: string) {
  if (!getChat(from) || !getChat(into) || hasEdge(from, into, 'merge')) return
  setActivity(who, { who, chat: into, doing: 'viewing', since: Date.now() })
  addEdge(from, into, 'merge')
  pulses.set(from, performance.now())
  appendMsg(into, {
    id: nextId('m'), who, kind: 'merge', noteIcon: 'merge', time: clock(),
    text: `${PEOPLE[who].short} merged *${chatTitle(from)}* into this chat.`,
  })
  pushFeed(who, `merged “${chatTitle(from)}” into`, chatTitle(into), into)
}

function linkNext() {
  while (linkAt < LINKS.length) {
    const [a, b] = LINKS[linkAt++]
    if (hasEdge(a, b, 'related') || hasEdge(b, a, 'related')) continue
    addEdge(a, b, 'related')
    pulses.set(a, performance.now())
    pulses.set(b, performance.now())
    pushFeed('ai', `linked “${chatTitle(a)}” to`, chatTitle(b), b)
    return true
  }
  return false
}

/** A teammate finds a chat you made, reads it, then pulls it into their own work. */
function noticeYours() {
  const st = getState()
  const yours = st.extraChats.filter((c) => c.by === 'you' && !noticed.has(c.id))
  const chat = yours.find((c) => (st.messages[c.id] ?? []).some((m) => m.who === 'ai' && !m.kind && m.phase === 'done'))
  if (!chat) return false
  const pick = [HUB_PERSON[chat.hub], 'elena', 'priya', 'jonah', 'ava'].find(
    (p): p is PersonId => !!p && st.presence[p as PersonId] === 'live' && !busy.has(p as PersonId),
  )
  if (!pick) return false
  noticed.add(chat.id)
  busy.add(pick)
  const title = chatTitle(chat.id)
  setActivity(pick, { who: pick, chat: chat.id, doing: 'viewing', since: Date.now() })
  notify(pick, `${PEOPLE[pick].short} opened your chat “${title}”.`, chat.id)
  toast(`${PEOPLE[pick].short} is reading your chat “${title}”.`, { who: pick, tone: 'live' })
  later(5600, () => {
    const home = HOME_CHAT[pick]
    if (home) pullLive(pick, home, chat.id)
    busy.delete(pick)
  })
  return true
}

/** Between scripted beats, someone moves to another chat in their topic. */
function wander() {
  const st = getState()
  const idle = (Object.keys(SCRIPTS) as PersonId[]).filter((p) => st.presence[p] === 'live' && !busy.has(p))
  if (!idle.length) return
  const who = idle[Math.floor(rand() * idle.length)]
  const own = [...(SCRIPTS[who] ?? [])].flatMap((s) => ('chat' in s ? [s.chat] : 'from' in s ? [s.from] : []))
  const chat = own[Math.floor(rand() * own.length)]
  if (chat) setActivity(who, { who, chat, doing: 'viewing', since: Date.now() })
}
