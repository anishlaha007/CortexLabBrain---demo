import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force'
import { CHATS, FILES, HUBS, RELATED, type ChatKind, type HubId, type SourceKind } from '../lab/content'
import type { PersonId } from '../lab/people'

export type NodeType = 'hub' | 'chat' | 'file' | 'data' | 'chunk'

export interface GNode extends SimulationNodeDatum {
  id: string
  type: NodeType
  label: string
  hub: HubId
  r: number
  by?: PersonId
  kind?: ChatKind
  source?: SourceKind
  cite?: string
  /** Number of chats in a hub, used for sizing and the Topics list. */
  weight?: number
}

export type EdgeType = 'member' | 'cites' | 'branch' | 'merge' | 'pull' | 'data' | 'related' | 'chunk'

export interface GLink extends SimulationLinkDatum<GNode> {
  type: EdgeType
  source: GNode
  target: GNode
}

export interface Graph {
  nodes: GNode[]
  links: GLink[]
  byId: Map<string, GNode>
  neighbours: Map<string, Set<string>>
}

/** Illustrative raw data per hub: the small, quiet dots that make the brain feel full. */
const DATA_PATTERNS: Record<HubId, (i: number) => string> = {
  core: (i) => `lab-photos/2025/rig_${String(i + 1).padStart(2, '0')}.jpg`,
  sand: (i) => `xray/2025-08/run_${String(i + 1).padStart(2, '0')}.mp4`,
  dunes: (i) => `sidewinder/2025-06/trial_${String(i + 1).padStart(2, '0')}.mp4`,
  posts: (i) => `trackway/posts_run${i + 1}.csv`,
  wiggle: (i) => `limbless/rubble_${String(i + 1).padStart(2, '0')}.mp4`,
  maths: (i) => `gait/modes/snake_${String(i + 1).padStart(2, '0')}.npy`,
  legs: (i) => `centipede/trials/legs_${(i % 6) * 2 + 4}_run${i + 1}.csv`,
  ants: (i) => `ants/2025-09/tunnel_cam${(i % 3) + 1}_${i + 1}.mp4`,
  smarticles: (i) => `smarticles/ring_trials/trial_${i + 1}.csv`,
  soft: (i) => `c_leg_robot/poppy_${i + 1}.mp4`,
  land: (i) => `mudskipper/clip_${String(i + 1).padStart(2, '0')}.mp4`,
  rovers: (i) => `rover/slope_${20 + (i % 6)}deg_run${i + 1}.csv`,
}

const DATA_COUNT: Record<HubId, number> = {
  core: 12, sand: 24, dunes: 30, posts: 18, wiggle: 22, maths: 14,
  legs: 30, ants: 28, smarticles: 20, soft: 18, land: 14, rovers: 20,
}

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export function buildGraph(): Graph {
  const rand = seeded(7)
  const nodes: GNode[] = []
  const links: GLink[] = []
  const byId = new Map<string, GNode>()
  const add = (n: GNode) => {
    nodes.push(n)
    byId.set(n.id, n)
    return n
  }
  const link = (a: string, b: string, type: EdgeType) => {
    const s = byId.get(a)
    const t = byId.get(b)
    if (s && t) links.push({ source: s, target: t, type })
  }

  // Hubs sit on a ring around the lab's centre so topics form clear clusters.
  const ring = HUBS.filter((h) => h.id !== 'core')
  HUBS.forEach((h) => {
    const chats = CHATS.filter((c) => c.hub === h.id).length
    const i = ring.findIndex((r) => r.id === h.id)
    const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2
    const R = h.id === 'core' ? 0 : 440
    add({
      id: h.id, type: 'hub', label: h.label, hub: h.id, weight: chats,
      r: h.id === 'core' ? 15 : 9 + Math.sqrt(chats) * 2.1,
      x: Math.cos(a) * R * 1.05, y: Math.sin(a) * R * 0.92,
    })
  })

  FILES.forEach((f) => {
    const hub = byId.get(f.hub)!
    add({
      id: f.id, type: 'file', label: f.name, hub: f.hub, source: f.kind, cite: f.cite,
      r: f.kind === 'paper' ? 3.6 : f.kind === 'robot' ? 3.4 : 2.7,
      x: (hub.x ?? 0) + (rand() - 0.5) * 120, y: (hub.y ?? 0) + (rand() - 0.5) * 120,
    })
    link(f.id, f.hub, 'member')
  })

  CHATS.forEach((c) => {
    const hub = byId.get(c.hub)!
    add({
      id: c.id, type: 'chat', label: c.title, hub: c.hub, by: c.by, kind: c.kind ?? 'chat',
      r: 5.4, x: (hub.x ?? 0) + (rand() - 0.5) * 100, y: (hub.y ?? 0) + (rand() - 0.5) * 100,
    })
  })

  CHATS.forEach((c) => {
    if (c.from?.length) c.from.forEach((p) => link(p, c.id, c.kind === 'merge' ? 'merge' : 'branch'))
    else link(c.id, c.hub, 'member')
    c.cites?.forEach((f) => link(c.id, f, 'cites'))
    c.pulls?.forEach((p) => link(p, c.id, 'pull'))
  })
  RELATED.forEach(([a, b]) => link(a, b, 'related'))

  // Raw data: quiet dots around each topic, some attached to the chats that used them.
  HUBS.forEach((h) => {
    const hub = byId.get(h.id)!
    const chats = CHATS.filter((c) => c.hub === h.id)
    for (let i = 0; i < DATA_COUNT[h.id]; i++) {
      const id = `d-${h.id}-${i}`
      add({
        id, type: 'data', label: DATA_PATTERNS[h.id](i), hub: h.id, source: 'labpc', r: 1.9,
        x: (hub.x ?? 0) + (rand() - 0.5) * 180, y: (hub.y ?? 0) + (rand() - 0.5) * 180,
      })
      const files = FILES.filter((f) => f.hub === h.id && f.kind !== 'paper')
      const roll = rand()
      if (roll < 0.45 && chats.length) link(chats[Math.floor(rand() * chats.length)].id, id, 'data')
      else if (roll < 0.8 && files.length) link(files[Math.floor(rand() * files.length)].id, id, 'data')
      else link(id, h.id, 'data')
    }
  })

  // Lab memory: every saved question and answer is a small dot in the asker's colour.
  // Zooming into a chat (step 3) opens these into its prompt chain.
  CHATS.forEach((c) => {
    const chat = byId.get(c.id)!
    const count = 2 + Math.floor(rand() * 4)
    for (let i = 0; i < count; i++) {
      const id = `m-${c.id}-${i}`
      add({
        id, type: 'chunk', label: `Answer ${i + 1} · ${c.title}`, hub: c.hub, by: c.by, r: 1.25,
        x: (chat.x ?? 0) + (rand() - 0.5) * 30, y: (chat.y ?? 0) + (rand() - 0.5) * 30,
      })
      link(c.id, id, 'chunk')
    }
  })

  const neighbours = new Map<string, Set<string>>()
  nodes.forEach((n) => neighbours.set(n.id, new Set()))
  links.forEach((l) => {
    neighbours.get(l.source.id)!.add(l.target.id)
    neighbours.get(l.target.id)!.add(l.source.id)
  })

  return { nodes, links, byId, neighbours }
}

const LINK_DISTANCE: Record<EdgeType, number> = {
  member: 92, cites: 140, branch: 38, merge: 42, pull: 100, data: 26, related: 170, chunk: 13,
}
const LINK_STRENGTH: Record<EdgeType, number> = {
  member: 0.5, cites: 0.03, branch: 0.6, merge: 0.5, pull: 0.06, data: 0.35, related: 0.02, chunk: 0.8,
}
const CHARGE: Record<NodeType, number> = { hub: -700, chat: -100, file: -55, data: -14, chunk: -5 }

/** Settles the layout before first paint. The brain then stays still until someone touches it. */
export function layoutGraph(g: Graph) {
  const sim = forceSimulation<GNode>(g.nodes)
    .force(
      'link',
      forceLink<GNode, GLink>(g.links)
        .distance((l) => LINK_DISTANCE[l.type])
        .strength((l) => LINK_STRENGTH[l.type]),
    )
    .force('charge', forceManyBody<GNode>().strength((n) => CHARGE[n.type]).distanceMax(520))
    .force('collide', forceCollide<GNode>().radius((n) => n.r + (n.type === 'hub' ? 16 : n.type === 'chunk' ? 1 : 3)))
    .force('x', forceX<GNode>(0).strength(0.022))
    .force('y', forceY<GNode>(0).strength(0.03))
    .stop()
  for (let i = 0; i < 420; i++) sim.tick()
  sim.alpha(0)
  return sim
}
