import type { ForceLink } from 'd3-force'
import { buildGraph, layoutGraph, type EdgeType, type GLink, type GNode } from '../brain/graph'
import { HUBS, type Chat } from '../lab/content'

// The lab's brain lives here once, so actions can grow it and the canvas can draw it.
export const graph = buildGraph()
export const sim = layoutGraph(graph)

/** When nodes and edges were born, so the canvas can sprout and draw them on. */
export const births = new Map<string, number>()

export const edgeKey = (a: string, b: string, type: EdgeType) => `${a}>${b}:${type}`

function refreshSim(heat = 0.12) {
  sim.nodes(graph.nodes)
  ;(sim.force('link') as ForceLink<GNode, GLink>).links(graph.links)
  sim.alpha(Math.max(sim.alpha(), heat))
}

export function addEdge(a: string, b: string, type: EdgeType) {
  const s = graph.byId.get(a)
  const t = graph.byId.get(b)
  if (!s || !t || hasEdge(a, b, type)) return
  graph.links.push({ source: s, target: t, type })
  graph.neighbours.get(a)?.add(b)
  graph.neighbours.get(b)?.add(a)
  births.set(edgeKey(a, b, type), performance.now())
  if (layoutMode !== 'lineage') refreshSim(0.06)
}

export function hasEdge(a: string, b: string, type: EdgeType) {
  return graph.links.some((l) => l.source.id === a && l.target.id === b && l.type === type)
}

export function removeEdge(a: string, b: string, type: EdgeType) {
  const i = graph.links.findIndex((l) => l.source.id === a && l.target.id === b && l.type === type)
  if (i < 0) return
  graph.links.splice(i, 1)
  const stillLinked = graph.links.some(
    (l) => (l.source.id === a && l.target.id === b) || (l.source.id === b && l.target.id === a),
  )
  if (!stillLinked) {
    graph.neighbours.get(a)?.delete(b)
    graph.neighbours.get(b)?.delete(a)
  }
  if (layoutMode !== 'lineage') refreshSim(0.04)
}

/** A new chat sprouts next to its parent (or its topic) and settles into the brain. */
export function addChatNode(chat: Chat) {
  if (graph.byId.has(chat.id)) return
  const parent = graph.byId.get(chat.from?.[0] ?? '') ?? graph.byId.get(chat.hub)!
  const a = Math.random() * Math.PI * 2
  const node: GNode = {
    id: chat.id, type: 'chat', label: chat.title, hub: chat.hub, by: chat.by, kind: chat.kind ?? 'chat', r: 5.4,
    x: (parent.x ?? 0) + Math.cos(a) * 26, y: (parent.y ?? 0) + Math.sin(a) * 26, vx: 0, vy: 0,
  }
  graph.nodes.push(node)
  graph.byId.set(node.id, node)
  graph.neighbours.set(node.id, new Set())
  births.set(node.id, performance.now())
  if (chat.from?.length) chat.from.forEach((p) => addEdge(p, chat.id, chat.kind === 'merge' ? 'merge' : 'branch'))
  else addEdge(chat.id, chat.hub, 'member')
  if (layoutMode === 'lineage') {
    const pos = lineagePositions().get(node.id)
    if (pos) {
      node.x = pos.x
      node.y = pos.y
    }
  } else refreshSim(0.16)
}

export function renameNode(id: string, label: string) {
  const n = graph.byId.get(id)
  if (n) n.label = label
}

/** Every saved answer adds a small memory dot in the asker's colour: one more prompt in the chain. */
export function addMemoryDot(chatId: string, by: GNode['by'], prompt?: { text: string; file?: string; msg?: string }) {
  const chat = graph.byId.get(chatId)
  if (!chat) return
  const idx = chunksOf(chatId).length
  const id = `m-${chatId}-live-${idx}-${Math.random().toString(36).slice(2, 6)}`
  graph.nodes.push({
    id, type: 'chunk', label: prompt?.text ?? `Answer · ${chat.label}`, hub: chat.hub, by, r: 1.25,
    idx, file: prompt?.file, msg: prompt?.msg,
    x: (chat.x ?? 0) + (Math.random() - 0.5) * 12, y: (chat.y ?? 0) + (Math.random() - 0.5) * 12,
  })
  graph.byId.set(id, graph.nodes[graph.nodes.length - 1])
  graph.neighbours.set(id, new Set())
  births.set(id, performance.now())
  addEdge(chatId, id, 'chunk')
}

/** A chat's prompts in order, for zooming in. */
export function chunksOf(chatId: string) {
  return graph.links
    .filter((l) => l.source.id === chatId && l.type === 'chunk')
    .map((l) => l.target)
    .sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0))
}

// ───────── Lineage layout: topics as rows, time left to right, branches and merges to the right ─────────

let layoutMode: 'brain' | 'lineage' = 'brain'
export function setLayoutMode(m: 'brain' | 'lineage') {
  layoutMode = m
  if (m === 'lineage') sim.alpha(0)
}
export function getLayoutMode() {
  return layoutMode
}

export const LINEAGE = { row: 120, col: 210, child: 118, drop: 44 }

export function lineagePositions() {
  const out = new Map<string, { x: number; y: number }>()
  HUBS.forEach((h, row) => {
    const y = row * LINEAGE.row
    out.set(h.id, { x: 0, y })
    const chats = graph.nodes.filter((n) => n.type === 'chat' && n.hub === h.id)
    let col = 0
    const kids = new Map<string, number>()
    chats.forEach((c) => {
      const parents = graph.links
        .filter((l) => l.target.id === c.id && (l.type === 'branch' || l.type === 'merge'))
        .map((l) => out.get(l.source.id))
        .filter(Boolean) as { x: number; y: number }[]
      if (parents.length) {
        const px = Math.max(...parents.map((p) => p.x))
        const py = Math.min(...parents.map((p) => p.y))
        const key = `${px},${py}`
        const k = kids.get(key) ?? 0
        kids.set(key, k + 1)
        out.set(c.id, { x: px + LINEAGE.child, y: py + LINEAGE.drop * (k + 1) * 0.62 })
      } else {
        out.set(c.id, { x: 150 + col * LINEAGE.col, y })
        col++
      }
    })
  })
  // Everything else tucks into its topic so the lineage stays readable.
  graph.nodes.forEach((n) => {
    if (out.has(n.id)) return
    const owner = n.type === 'chunk' ? out.get(n.id.split('-').slice(1, -1).join('-')) : null
    out.set(n.id, owner ?? out.get(n.hub) ?? { x: 0, y: 0 })
  })
  return out
}

/** Screen position of a node, set by the canvas so overlays can draw tethers to it. */
export let screenOf: (id: string) => { x: number; y: number } | null = () => null
export function setScreenOf(fn: typeof screenOf) {
  screenOf = fn
}

/** Clickable parts of a zoomed-in chat card, in screen coordinates (for the click-test). */
export let promptHits: () => { x: number; y: number; kind: 'row' | 'file' }[] = () => []
export function setPromptHits(fn: typeof promptHits) {
  promptHits = fn
}
