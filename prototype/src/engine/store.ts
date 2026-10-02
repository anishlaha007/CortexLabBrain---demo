import { useSyncExternalStore } from 'react'
import { FEED, type Chat, type FeedItem, type HubId } from '../lab/content'
import type { PersonId } from '../lab/people'
import { initialTheme, type Theme } from '../app/theme'

// A tiny store: one state object, plain actions, React reads it with useStore(selector).
// Selectors must return values that already live in the state (no new arrays or objects).

export interface SourceRef {
  /** A brain node: paper, robot, file, raw data. */
  node?: string
  /** A chat cited as lab memory. */
  chat?: string
  where: string
}

export type Phase = 'searching' | 'writing' | 'done'

export interface Msg {
  id: string
  who: PersonId | 'ai'
  text: string
  time: string
  sources?: SourceRef[]
  /** File-finding answers list files instead of prose. */
  files?: { node: string; why: string }[]
  phase?: Phase
  shown?: number
  background?: boolean
  notFound?: boolean
  /** Small system lines in the thread: branched, pulled in, merged. */
  kind?: 'note' | 'merge'
  noteIcon?: 'branch' | 'pull' | 'merge'
  suggest?: { chat: string; who: PersonId }
  readFrom?: string[]
  /** Hidden behind “show earlier messages”. */
  earlier?: boolean
  /** An output drawn inside the answer. */
  chart?: 'slip'
  /** A teammate branched from this exact answer. */
  branchMark?: { chat: string; who: PersonId }
  memoryNote?: string
}

export interface TrayItem {
  ref: string
  kind: 'chat' | 'node' | 'hub'
  label: string
  tokens: number
  by?: PersonId
  /** Set for items that just arrived, so they pop in. */
  fresh?: number
}

export interface Notice {
  id: string
  who: PersonId | 'ai'
  text: string
  chat?: string
  when: string
  unread: boolean
}

export interface Toast {
  id: number
  text: string
  tone?: 'plain' | 'live'
  who?: PersonId
}

export type Viewer =
  | { kind: 'source'; ref: SourceRef; chat: string | null }
  | { kind: 'manifest'; chat: string; msg: string }
  | null

export interface Drag {
  node: string
  label: string
  kind: string
  color?: string
  x: number
  y: number
  over: 'chat' | 'new-chat' | null
}

export interface Flight {
  id: number
  label: string
  kind: string
  color?: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  back?: boolean
}

export interface LiveFeedItem extends FeedItem {
  id: string
  chat?: string
}

export interface State {
  theme: Theme
  openChat: string | null
  layout: 'brain' | 'lineage'
  extraChats: Chat[]
  renamed: Record<string, string>
  messages: Record<string, Msg[]>
  tray: Record<string, TrayItem[]>
  suggest: Record<string, 'open' | 'pulled' | 'dismissed'>
  ratings: Record<string, 'up' | 'down'>
  notices: Notice[]
  toasts: Toast[]
  following: PersonId | null
  viewer: Viewer
  branchFrom: { chat: string; label: string } | null
  tour: number | null
  search: string
  camera: { node: string; k: number; n: number } | null
  drag: Drag | null
  flights: Flight[]
  showEarlier: Record<string, boolean>
  feed: LiveFeedItem[]
  filters: { source: string; type: string; date: string }
  composer: Record<string, string>
  focusComposer: number
  hubOfNewChat: HubId | null
}

const initial: State = {
  theme: initialTheme(),
  openChat: null,
  layout: 'brain',
  extraChats: [],
  renamed: {},
  messages: {},
  tray: {},
  suggest: {},
  ratings: {},
  notices: [
    { id: 'n1', who: 'ai', text: 'Welcome to Robophysics Lab. Take the tour to see everything Cortex does.', when: 'now', unread: true },
    { id: 'n2', who: 'priya', text: 'Priya branched from an answer in “Sidewinder robot keeps slipping on steep sand”.', chat: 'c-pitch', when: '4 min', unread: true },
    { id: 'n3', who: 'jonah', text: 'Jonah merged 2 chats into “Traffic rules: ants and robots together”.', chat: 'c-antmerge', when: '31 min', unread: false },
    { id: 'n4', who: 'ai', text: 'Lab AI linked a finding in “How many leg pairs before returns flatten out?” to the topic Many legs.', chat: 'c-pairs', when: '1 h', unread: false },
  ],
  toasts: [],
  following: null,
  viewer: null,
  branchFrom: null,
  tour: null,
  search: '',
  camera: null,
  drag: null,
  flights: [],
  showEarlier: {},
  feed: FEED.map((f, i) => ({ ...f, id: `f${i}` })),
  filters: { source: 'All 6 sources', type: 'Any type', date: 'Any date' },
  composer: {},
  focusComposer: 0,
  hubOfNewChat: null,
}

let state: State = initial
const listeners = new Set<() => void>()

export function getState() {
  return state
}

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state))
}

export const EMPTY: never[] = []
