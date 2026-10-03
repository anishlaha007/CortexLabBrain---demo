import { CHATS, HUBS, type Chat, type HubId } from '../lab/content'
import { PEOPLE, nameify, type PersonId } from '../lab/people'
import { DEFAULT_TRAY, SUGGESTIONS, THREADS } from '../lab/threads'
import { matchBank, notFound } from './bank'
import { getState, setState, type Msg, type SourceRef, type TrayItem } from './store'
import {
  addChatNode, addEdge, addMemoryDot, graph, hasEdge, removeEdge, renameNode, screenOf, setLayoutMode,
} from './world'

let uid = 0
export const nextId = (p: string) => `${p}${++uid}`
export const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// ───────── Lookups ─────────

export function getChat(id: string): Chat | undefined {
  return CHATS.find((c) => c.id === id) ?? getState().extraChats.find((c) => c.id === id)
}

export function chatTitle(id: string) {
  return nameify(getState().renamed[id] ?? getChat(id)?.title ?? 'Untitled chat')
}

/** Someone (not you) working in this chat right now: typing in it, or its owner reading it. */
export function liveOwner(chatId: string): PersonId | null {
  const here = getState().active.filter((a) => a.chat === chatId && a.who !== 'you')
  const typing = here.find((a) => a.doing === 'typing')
  if (typing) return typing.who
  const by = getChat(chatId)?.by
  return here.find((a) => a.who === by)?.who ?? null
}

export function trayOf(chatId: string): TrayItem[] {
  return getState().tray[chatId] ?? DEFAULT_TRAY[chatId] ?? []
}

export function messagesOf(chatId: string): Msg[] {
  return [...(THREADS[chatId] ?? []), ...(getState().messages[chatId] ?? [])]
}

function hubLabel(hub: HubId) {
  return HUBS.find((h) => h.id === hub)?.label ?? ''
}

// ───────── Small things ─────────

let toastId = 0
export function toast(text: string, opts: { who?: PersonId; tone?: 'plain' | 'live' } = {}) {
  const t = { id: ++toastId, text, ...opts }
  setState((s) => ({ toasts: [...s.toasts.slice(-2), t] }))
  window.setTimeout(() => setState((s) => ({ toasts: s.toasts.filter((x) => x.id !== t.id) })), 3800)
}

/** Newest first. Whoever is typing right now stays in the feed however busy it gets. */
export function pushFeed(who: PersonId | 'ai', verb: string, target: string, chat?: string, live = false) {
  setState((s) => {
    const all = [{ id: nextId('f'), who, verb, target, chat, when: 'now', at: Date.now(), live }, ...s.feed]
    const room = Math.max(4, 9 - all.filter((f) => f.live).length)
    const keep = new Set(all.filter((f) => !f.live).slice(0, room))
    return { feed: all.filter((f) => f.live || keep.has(f)) }
  })
}

export function notify(who: PersonId | 'ai', text: string, chat?: string) {
  setState((s) => ({ notices: [{ id: nextId('n'), who, text, chat, when: 'now', unread: true }, ...s.notices] }))
}

export function markNoticeRead(id: string) {
  setState((s) => ({ notices: s.notices.map((n) => (n.id === id ? { ...n, unread: false } : n)) }))
}

export function markAllRead() {
  setState((s) => ({ notices: s.notices.map((n) => ({ ...n, unread: false })) }))
}

export function openChat(id: string | null) {
  setState({ openChat: id, branchFrom: null, viewer: null, following: null })
}

export function focusNode(node: string, k = 1.7) {
  setState((s) => ({ camera: { node, k, n: (s.camera?.n ?? 0) + 1 }, following: null }))
}

export function follow(who: PersonId | null) {
  setState({ following: who })
  if (who) toast(`Following ${PEOPLE[who].short}. Move the brain to stop.`, { who, tone: 'live' })
}

export function setLayout(layout: 'brain' | 'lineage') {
  setLayoutMode(layout)
  setState({ layout })
}

export function setSearch(search: string) {
  setState({ search })
}

export function rate(msgId: string, v: 'up' | 'down') {
  const was = getState().ratings[msgId]
  setState((s) => {
    const ratings = { ...s.ratings }
    if (was === v) delete ratings[msgId]
    else ratings[msgId] = v
    return { ratings }
  })
  if (was !== v) {
    toast(v === 'up' ? 'Marked useful. It counts toward the lab’s usage page.' : 'Marked not useful. Open a citation to flag the one that’s wrong.')
  }
}

export function toggleEarlier(chatId: string) {
  setState((s) => ({ showEarlier: { ...s.showEarlier, [chatId]: !s.showEarlier[chatId] } }))
}

export function setFilter(key: 'source' | 'type' | 'date', value: string) {
  setState((s) => ({ filters: { ...s.filters, [key]: value } }))
}

export function setComposer(chatId: string, text: string) {
  setState((s) => ({ composer: { ...s.composer, [chatId]: text } }))
}

export function setBranchFrom(chatId: string | null, label = '') {
  setState((s) => ({ branchFrom: chatId ? { chat: chatId, label } : null, focusComposer: s.focusComposer + 1 }))
}

// ───────── Viewer panels ─────────

export function openSource(ref: SourceRef, chat: string | null) {
  setState({ viewer: { kind: 'source', ref, chat } })
  if (ref.node) focusPulse(ref.node)
}

export function openManifest(chat: string, msg: string) {
  setState({ viewer: { kind: 'manifest', chat, msg } })
}

export function closeViewer() {
  setState({ viewer: null })
}

/** Light up a node on the brain without moving the camera. */
export const pulses = new Map<string, number>()
function focusPulse(node: string) {
  pulses.set(node, performance.now())
}

// ───────── Context tray ─────────

export function trayItemFor(ref: string): TrayItem | null {
  const n = graph.byId.get(ref)
  if (!n) return null
  if (n.type === 'chat') return { ref, kind: 'chat', label: n.label, tokens: 3.1, by: n.by }
  if (n.type === 'hub') return { ref, kind: 'hub', label: `Topic: ${n.label}`, tokens: 4.2 }
  if (n.type === 'chunk') return { ref, kind: 'node', label: n.label, tokens: 0.6, by: n.by }
  return { ref, kind: 'node', label: n.label.split('/').pop() ?? n.label, tokens: n.source === 'paper' ? 1.8 : 1.2 }
}

export function addToTray(chatId: string, ref: string) {
  if (ref === chatId) {
    toast('That’s this chat. It’s always in context.')
    return false
  }
  const item = trayItemFor(ref)
  if (!item) return false
  if (trayOf(chatId).some((t) => t.ref === ref)) {
    toast('Already in this chat’s context.')
    return false
  }
  const fresh = { ...item, fresh: Date.now() }
  setState((s) => ({ tray: { ...s.tray, [chatId]: [...trayOf(chatId), fresh] } }))
  addEdge(ref, chatId, 'pull')
  pulses.set(ref, performance.now())
  pulses.set(chatId, performance.now())
  appendMsg(chatId, {
    id: nextId('m'), who: 'you', kind: 'note', noteIcon: 'pull', time: clock(),
    text: `You pulled *${item.label}* into this chat`,
  })
  pushFeed('you', 'pulled', `${item.label} → ${chatTitle(chatId)}`, chatId)
  return true
}

export function removeFromTray(chatId: string, ref: string) {
  setState((s) => ({ tray: { ...s.tray, [chatId]: trayOf(chatId).filter((t) => t.ref !== ref) } }))
  if (hasEdge(ref, chatId, 'pull')) removeEdge(ref, chatId, 'pull')
}

export function suggestionFor(chatId: string) {
  return SUGGESTIONS[chatId] ?? null
}

export function pullSuggestion(chatId: string) {
  const s = SUGGESTIONS[chatId]
  if (!s) return
  if (addToTray(chatId, s.chat)) toast(`${PEOPLE[s.who].short}’s chat is now in this chat’s context.`, { who: s.who })
  setState((st) => ({ suggest: { ...st.suggest, [chatId]: 'pulled' } }))
}

export function dismissSuggestion(chatId: string) {
  setState((s) => ({ suggest: { ...s.suggest, [chatId]: 'dismissed' } }))
}

// ───────── Drag from the brain ─────────

let flightId = 0

/** Where a dropped card should fly to: the end of the context tray. */
function traySlot() {
  const el = document.querySelector('[data-tray-slot]')
  if (!el) return null
  const r = el.getBoundingClientRect()
  return { x: r.left + 18, y: r.top + r.height / 2 }
}

export function dropNode(ref: string, at: { x: number; y: number }, target: 'chat' | 'new-chat') {
  const n = graph.byId.get(ref)
  if (!n) return
  const st = getState()
  let chatId = st.openChat
  if (target === 'new-chat' || !chatId) chatId = newChat(n.type === 'hub' ? (n.id as HubId) : n.hub)
  const land = () => {
    const to = traySlot() ?? at
    const f = {
      id: ++flightId, label: trayItemFor(ref)?.label ?? n.label, kind: n.type === 'chat' ? 'chat' : n.type === 'hub' ? 'hub' : n.source ?? 'file',
      color: n.by ? PEOPLE[n.by].color : undefined, from: at, to,
    }
    setState((s) => ({ flights: [...s.flights, f] }))
    window.setTimeout(() => {
      setState((s) => ({ flights: s.flights.filter((x) => x.id !== f.id) }))
      addToTray(chatId!, ref)
    }, 560)
  }
  // A brand-new chat needs a frame to mount before the card can fly into it.
  if (target === 'new-chat' || !st.openChat) window.setTimeout(land, 420)
  else land()
}

export function cancelDrop(ref: string, at: { x: number; y: number }) {
  const n = graph.byId.get(ref)
  const home = screenOf(ref)
  if (!n || !home) return
  const f = { id: ++flightId, label: n.label, kind: n.type, color: n.by ? PEOPLE[n.by].color : undefined, from: at, to: home, back: true }
  setState((s) => ({ flights: [...s.flights, f] }))
  window.setTimeout(() => setState((s) => ({ flights: s.flights.filter((x) => x.id !== f.id) })), 460)
}

// ───────── Chats: new, branch, ask, merge ─────────

export function appendMsg(chatId: string, msg: Msg) {
  setState((s) => ({ messages: { ...s.messages, [chatId]: [...(s.messages[chatId] ?? []), msg] } }))
}

function patchMsg(chatId: string, id: string, patch: Partial<Msg>) {
  setState((s) => ({
    messages: { ...s.messages, [chatId]: (s.messages[chatId] ?? []).map((m) => (m.id === id ? { ...m, ...patch } : m)) },
  }))
}

function titleFrom(text: string) {
  const t = text.trim().replace(/\?+$/, '')
  const cap = t.charAt(0).toUpperCase() + t.slice(1)
  return cap.length > 54 ? cap.slice(0, 52).trimEnd() + '…' : cap
}

export function createChat(c: Omit<Chat, 'id'>) {
  const id = nextId(c.by === 'you' ? 'c-you-' : `c-${c.by}-`)
  const chat: Chat = { id, ...c }
  setState((s) => ({ extraChats: [...s.extraChats, chat] }))
  addChatNode(chat)
  return id
}

/** “+ New chat”: an empty chat you can drag context into before asking. */
export function newChat(hub: HubId = 'core') {
  const id = createChat({ hub, by: 'you', title: 'New chat' })
  openChat(id)
  setState((s) => ({ focusComposer: s.focusComposer + 1 }))
  pushFeed('you', 'started a new chat in', hubLabel(hub), id)
  return id
}

/** A new chat moves to the topic its first question is about. */
function rehome(chatId: string, hub: HubId) {
  const chat = getChat(chatId)
  const node = graph.byId.get(chatId)
  if (!chat || !node || chat.hub === hub || chat.from?.length) return
  removeEdge(chatId, chat.hub, 'member')
  chat.hub = hub
  node.hub = hub
  addEdge(chatId, hub, 'member')
}

export function readFromFor(sources: SourceRef[] | undefined, files?: { node: string }[]) {
  const kinds = new Set<string>()
  const names: Record<string, string> = { paper: 'Papers', github: 'GitHub', drive: 'Drive', onedrive: 'OneDrive', labpc: 'Lab PC', web: 'Web', robot: 'Papers' }
  ;[...(sources ?? []), ...(files ?? [])].forEach((s) => {
    if ('chat' in s && s.chat) kinds.add('Lab memory')
    const node = 'node' in s && s.node ? graph.byId.get(s.node) : null
    if (node?.source) kinds.add(names[node.source] ?? 'Lab PC')
  })
  return [...kinds]
}

export function ask(chatId: string | null, raw: string) {
  const text = raw.trim()
  if (!text) return
  const entry = matchBank(text, chatId ? getChat(chatId)?.hub : null)
  const st = getState()
  let target = chatId
  let mergeTo: { parent: string; owner: PersonId } | null = null

  if (!target) {
    target = createChat({ hub: entry?.hub ?? 'core', by: 'you', title: entry?.title ?? titleFrom(text) })
    openChat(target)
    pushFeed('you', 'asked the lab', entry?.title ?? titleFrom(text), target)
  } else {
    const owner = liveOwner(target)
    const branchFrom = st.branchFrom
    if (branchFrom || owner) {
      const parent = branchFrom?.chat ?? target
      const parentChat = getChat(parent)!
      const parentOwner = PEOPLE[parentChat.by]
      const id = createChat({ hub: parentChat.hub, by: 'you', kind: 'branch', from: [parent], title: entry?.title ?? titleFrom(text) })
      setState((s) => ({ tray: { ...s.tray, [id]: trayOf(parent).map((t) => ({ ...t, fresh: undefined })) } }))
      appendMsg(id, {
        id: nextId('m'), who: 'ai', kind: 'note', noteIcon: 'branch', time: clock(),
        text: `Branched from *${chatTitle(parent)}*${branchFrom?.label ? `, at ${branchFrom.label}` : ''}. I have ${parentOwner.short === 'You' ? 'your' : `${parentOwner.short}’s`} messages and ${trayOf(parent).length} context items. The original chat stays as it is.`,
      })
      openChat(id)
      pushFeed('you', 'branched', chatTitle(id), id)
      const live = liveOwner(parent)
      if (live) {
        toast(`${PEOPLE[live].short} was notified that you branched from their chat.`, { who: live, tone: 'live' })
        mergeTo = { parent, owner: live }
      }
      target = id
    } else if (getChat(target)?.title === 'New chat' && !st.renamed[target]) {
      const title = entry?.title ?? titleFrom(text)
      setState((s) => ({ renamed: { ...s.renamed, [target!]: title } }))
      renameNode(target, title)
      if (entry) rehome(target, entry.hub)
    }
  }

  const chat = target
  appendMsg(chat, { id: nextId('m'), who: 'you', text, time: clock() })
  setState((s) => ({ composer: { ...s.composer, [chat]: '', ...(chatId ? { [chatId]: '' } : {}) }, branchFrom: null }))

  const nf = entry ? null : notFound(text)
  const answer: Msg = {
    id: nextId('m'), who: 'ai', time: clock(),
    text: entry?.text ?? nf!.text,
    sources: entry?.sources,
    files: entry?.files ?? nf?.files,
    background: entry?.background,
    notFound: !entry,
    suggest: entry?.suggest,
    readFrom: readFromFor(entry?.sources, entry?.files ?? nf?.files),
  }
  const askedId = getState().messages[chat]?.at(-1)?.id
  stream(chat, answer, () => {
    addMemoryDot(chat, 'you', { text, file: answer.sources?.find((s) => s.node)?.node ?? answer.files?.[0]?.node, msg: askedId })
    if (mergeTo) scheduleMerge(chat, mergeTo.parent, mergeTo.owner, answer)
  })
}

/** The answer streams in: a moment of searching, then the words. */
export function stream(chatId: string, msg: Msg, done?: () => void) {
  appendMsg(chatId, { ...msg, phase: 'searching', shown: 0 })
  pulses.set(chatId, performance.now())
  ;(msg.sources ?? []).forEach((s) => s.node && pulses.set(s.node, performance.now()))
  window.setTimeout(() => {
    patchMsg(chatId, msg.id, { phase: 'writing' })
    let shown = 0
    const iv = window.setInterval(() => {
      shown += 5
      if (shown >= msg.text.length) {
        window.clearInterval(iv)
        patchMsg(chatId, msg.id, { phase: 'done', shown: msg.text.length })
        done?.()
      } else patchMsg(chatId, msg.id, { shown })
    }, 18)
  }, 1250)
}

/** The teammate whose chat you branched reads it, then merges your findings back. */
function scheduleMerge(branch: string, parent: string, owner: PersonId, answer: Msg) {
  const name = PEOPLE[owner].short
  window.setTimeout(() => {
    toast(`${name} is reading your branch.`, { who: owner, tone: 'live' })
    pulses.set(branch, performance.now())
  }, 2200)
  window.setTimeout(() => {
    addEdge(branch, parent, 'merge')
    pulses.set(parent, performance.now())
    appendMsg(parent, {
      id: nextId('m'), who: owner, kind: 'merge', noteIcon: 'merge', time: clock(),
      text: `${name} merged your branch *${chatTitle(branch)}* into this chat.`,
      sources: answer.sources?.slice(0, 2),
    })
    notify(owner, `${name} merged your branch “${chatTitle(branch)}” into “${chatTitle(parent)}”.`, parent)
    pushFeed(owner, 'merged your branch into', chatTitle(parent), parent)
    toast(`${name} merged your branch into “${chatTitle(parent)}”.`, { who: owner, tone: 'live' })
  }, 6200)
}

// ───────── Export ─────────

function download(name: string, text: string) {
  const blob = new Blob([text], { type: 'text/markdown' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)

function refLabel(r: SourceRef) {
  if (r.chat) return `Chat: ${chatTitle(r.chat)}`
  const n = r.node ? graph.byId.get(r.node) : null
  return n ? (n.cite ? `${n.label} (${n.cite})` : n.label) : r.where
}

export function exportChat(chatId: string, memoryOnly = false) {
  const chat = getChat(chatId)!
  const title = chatTitle(chatId)
  const people = new Set<string>([PEOPLE[chat.by].name])
  const msgs = messagesOf(chatId)
  msgs.forEach((m) => m.who !== 'ai' && people.add(PEOPLE[m.who].name))
  const lines = [
    '---',
    `title: "${title}"`,
    `topic: "${hubLabel(chat.hub)}"`,
    `started_by: "${PEOPLE[chat.by].name}"`,
    `people: [${[...people].map((p) => `"${p}"`).join(', ')}]`,
    chat.from?.length ? `built_on: [${chat.from.map((f) => `"${chatTitle(f)}"`).join(', ')}]` : null,
    `context: [${trayOf(chatId).map((t) => `"${t.label}"`).join(', ')}]`,
    `exported: "${new Date().toISOString().slice(0, 10)}"`,
    `source: "Cortex prototype · ${getState().setup.labName} demo (illustrative)"`,
    '---',
    '',
    `# ${title}`,
    '',
  ].filter((l) => l !== null) as string[]
  if (memoryOnly) {
    const answers = msgs.filter((m) => m.who === 'ai' && !m.kind)
    lines.push('## Memory card', '', `${PEOPLE[chat.by].name}’s chat in ${hubLabel(chat.hub)}. ${answers.length} answers saved as lab memory.`, '')
    const refs = answers.flatMap((m) => m.sources ?? [])
    if (refs.length) lines.push('### Key sources', '', ...refs.map((r) => `- ${refLabel(r)}`), '')
  } else {
    msgs.forEach((m) => {
      const who = m.who === 'ai' ? 'Lab AI' : PEOPLE[m.who].name
      if (m.kind) {
        lines.push(`> ${m.text.replace(/\*/g, '_')}`, '')
        return
      }
      lines.push(`**${who}** · ${m.time}`, '', m.text, '')
      if (m.files?.length) lines.push(...m.files.map((f) => `- ${graph.byId.get(f.node)?.label ?? f.node}: ${f.why}`), '')
      if (m.sources?.length) lines.push(...m.sources.map((s, i) => `[${i + 1}] ${refLabel(s)} · ${s.where}`), '')
    })
  }
  download(`${slug(title)}${memoryOnly ? '.memory' : ''}.md`, lines.join('\n'))
  toast(memoryOnly ? 'Memory card downloaded as markdown.' : 'Chat exported as markdown, with citations as links.')
}

export async function copyLink(chatId: string) {
  const url = `${window.location.origin}${window.location.pathname}?chat=${chatId}`
  try {
    await navigator.clipboard.writeText(url)
    toast('Link copied. Anyone in the lab can open this chat.')
  } catch {
    toast(`Link: ${url}`)
  }
}

// ───────── Tour ─────────

export function startTour() {
  setState({ tour: 0, viewer: null })
}

export function setTourStep(step: number | null) {
  setState({ tour: step })
}

// ───────── Theme and the guided “drag one in for me” ─────────

export function setTheme(theme: import('../app/theme').Theme) {
  setState({ theme })
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** The tour (and later the auto demo) drags a node into the open chat, with the full animation. */
export function demoDrag(ref: string) {
  const n = graph.byId.get(ref)
  const from = screenOf(ref)
  const slot = traySlot()
  if (!n || !from || !slot) return
  const label = n.type === 'hub' ? `Topic: ${n.label}` : n.label.split('/').pop() ?? n.label
  const color = n.by ? PEOPLE[n.by].color : undefined
  const kind = n.type === 'file' ? n.source ?? 'file' : n.type
  const t0 = performance.now()
  const dur = 1300
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / dur)
    const e = easeInOut(p)
    const x = from.x + (slot.x - from.x) * e
    const y = from.y + (slot.y - from.y) * e - Math.sin(p * Math.PI) * 70
    setState({ drag: { node: ref, label, kind, color, x, y, over: p > 0.62 ? 'chat' : null } })
    if (p < 1) requestAnimationFrame(step)
    else {
      window.setTimeout(() => {
        setState({ drag: null })
        dropNode(ref, { x, y }, 'chat')
      }, 220)
    }
  }
  requestAnimationFrame(step)
}
