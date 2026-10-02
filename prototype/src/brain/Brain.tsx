import { useEffect, useMemo, useRef, useState } from 'react'
import { cancelDrop, dropNode, follow, newChat, openChat, pulses, setLayout } from '../engine/actions'
import { getState, setState, useStore } from '../engine/store'
import { births, edgeKey, graph, lineagePositions, setScreenOf, sim } from '../engine/world'
import { ACTIVE, HUBS, type Activity } from '../lab/content'
import { PEOPLE, type PersonId } from '../lab/people'
import type { GNode } from './graph'
import { Cursor } from '../ui/Cursor'
import { Icon } from '../ui/Icons'
import type { Theme } from '../app/theme'

interface View { x: number; y: number; k: number }

interface Palette {
  text: string
  text2: string
  edge: string
  file: string
  hub: string
  slate2: string
  slate: string
}

const SOURCE_LABEL: Record<string, string> = {
  paper: 'Paper', robot: 'Robot', github: 'GitHub', drive: 'Google Drive',
  onedrive: 'OneDrive', labpc: 'Lab PC', web: 'Web clipping',
}

function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement)
  const v = (n: string) => s.getPropertyValue(n).trim()
  return {
    text: v('--slate-text'), text2: v('--slate-text-2'), edge: v('--slate-edge'),
    file: v('--slate-file'), hub: v('--slate-hub'), slate2: v('--slate-2'), slate: v('--slate'),
  }
}

function withAlpha(hex: string, a: number) {
  if (hex.startsWith('rgba')) return hex
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

/** Smallest on-screen radius per node type, so the zoomed-out brain still reads. */
const MIN_PX: Record<GNode['type'], number> = { hub: 7, chat: 3.9, file: 2.3, data: 1.4, chunk: 1.15 }

const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const springOut = (t: number) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2)

/** Mei is wandering the brain: a Figma-style cursor gliding between topics. */
const WANDER: string[] = ['sand', 'maths', 'posts', 'wiggle', 'maths']
const SEG = 5200

export function Brain({ theme }: { theme: Theme }) {
  const openChat_ = useStore((s) => s.openChat)
  const layout = useStore((s) => s.layout)
  const search = useStore((s) => s.search)
  const camera = useStore((s) => s.camera)
  const following = useStore((s) => s.following)
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const view = useRef<View>({ x: 0, y: 0, k: 1 })
  const tween = useRef<{ from: View; to: View; t0: number; dur: number } | null>(null)
  const hoverRef = useRef<GNode | null>(null)
  const palette = useRef<Palette | null>(null)
  const size = useRef({ w: 0, h: 0 })
  const fitted = useRef(false)
  const [tip, setTip] = useState<{ node: GNode; x: number; y: number } | null>(null)
  const [showFiles, setShowFiles] = useState(true)
  const [zoomPct, setZoomPct] = useState(100)
  const [dropHint, setDropHint] = useState(false)
  const showFilesRef = useRef(showFiles)
  showFilesRef.current = showFiles
  const openRef = useRef(openChat_)
  openRef.current = openChat_
  const followRef = useRef<PersonId | null>(following)
  followRef.current = following
  const meiAt = useRef({ x: 0, y: 0 })
  const dropTarget = useRef<string | null>(null)

  // Lineage transition: every node glides between its brain and lineage positions.
  const brainPos = useRef(new Map<string, { x: number; y: number }>())
  const morph = useRef<{ from: Map<string, { x: number; y: number }>; to: Map<string, { x: number; y: number }>; t0: number; toLineage: boolean } | null>(null)
  const fade = useRef(1)

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (q.length < 2) return null
    const words = q.split(/\s+/).filter((w) => w.length > 1)
    return new Set(graph.nodes.filter((n) => n.type !== 'chunk' && words.every((w) => n.label.toLowerCase().includes(w))).map((n) => n.id))
  }, [search])
  const matchRef = useRef(matches)
  matchRef.current = matches

  const activeByChat = useMemo(() => {
    const m = new Map<string, Activity[]>()
    ACTIVE.forEach((a) => m.set(a.chat, [...(m.get(a.chat) ?? []), a]))
    return m
  }, [])

  useEffect(() => {
    palette.current = readPalette()
  }, [theme])

  // Let overlays (the drag tether) find nodes on screen.
  useEffect(() => {
    setScreenOf((id) => {
      const n = graph.byId.get(id)
      const c = canvasRef.current
      if (!n || !c) return null
      const r = c.getBoundingClientRect()
      const v = view.current
      return { x: r.left + n.x! * v.k + v.x, y: r.top + n.y! * v.k + v.y }
    })
  }, [])

  const boundsView = (pts: { x: number; y: number }[], pad = 34, maxK = 1.6): View => {
    const { w, h } = size.current
    const xs = pts.map((p) => p.x)
    const ys = pts.map((p) => p.y)
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const k = Math.min((w - pad * 2) / Math.max(1, maxX - minX), (h - pad * 2) / Math.max(1, maxY - minY), maxK)
    return { k, x: w / 2 - ((minX + maxX) / 2) * k, y: h / 2 - ((minY + maxY) / 2) * k }
  }

  const fitView = (): View => {
    if (getState().layout === 'lineage') {
      return boundsView(graph.nodes.filter((n) => n.type === 'hub' || n.type === 'chat').map((n) => ({ x: n.x!, y: n.y! })), 60, 1)
    }
    return boundsView(graph.nodes.map((n) => ({ x: n.x ?? 0, y: n.y ?? 0 })))
  }

  const flyTo = (to: View, dur = 900) => {
    tween.current = { from: { ...view.current }, to, t0: performance.now(), dur }
    setZoomPct(Math.round(to.k * 100))
  }

  const centreOn = (x: number, y: number, k: number): View => {
    const { w, h } = size.current
    return { k, x: w / 2 - x * k, y: h / 2 - y * k }
  }

  /** Where the camera should be: the open chat's neighbourhood, or the whole lab. */
  const cameraFor = (chatId: string | null): View => {
    const n = chatId ? graph.byId.get(chatId) : null
    const hub = n ? graph.byId.get(n.hub) : null
    if (!n || !hub) return fitView()
    if (getState().layout === 'lineage') return centreOn(n.x!, n.y!, 1.1)
    return centreOn((n.x ?? 0) * 0.6 + (hub.x ?? 0) * 0.4, (n.y ?? 0) * 0.6 + (hub.y ?? 0) * 0.4, 1.2)
  }

  useEffect(() => {
    if (!fitted.current) return
    // A brand-new chat needs a moment to settle before the camera finds it.
    const fresh = !!openChat_ && births.has(openChat_)
    const t = window.setTimeout(() => flyTo(cameraFor(openChat_), 1100), fresh ? 350 : 0)
    return () => window.clearTimeout(t)
  }, [openChat_])

  useEffect(() => {
    if (!camera || !fitted.current) return
    const n = graph.byId.get(camera.node)
    if (n) flyTo(centreOn(n.x!, n.y!, camera.k), 900)
  }, [camera])

  // Brain ↔ Lineage
  useEffect(() => {
    if (!fitted.current) return
    const from = new Map(graph.nodes.map((n) => [n.id, { x: n.x!, y: n.y! }]))
    let to: Map<string, { x: number; y: number }>
    if (layout === 'lineage') {
      brainPos.current = from
      to = lineagePositions()
    } else {
      to = new Map(graph.nodes.map((n) => [n.id, brainPos.current.get(n.id) ?? { x: n.x!, y: n.y! }]))
    }
    morph.current = { from, to, t0: performance.now(), toLineage: layout === 'lineage' }
    // Fit to where things are going, not where they are.
    const pts = graph.nodes.filter((n) => layout === 'brain' || n.type === 'hub' || n.type === 'chat').map((n) => to.get(n.id)!)
    const openPos = openRef.current ? to.get(openRef.current) : null
    const target = openPos
      ? centreOn(openPos.x, openPos.y, layout === 'lineage' ? 1.1 : 1.2)
      : boundsView(pts, layout === 'lineage' ? 60 : 34, layout === 'lineage' ? 1 : 1.6)
    flyTo(target, 1200)
  }, [layout])

  // Canvas size follows its container.
  useEffect(() => {
    const wrap = wrapRef.current!
    const canvas = canvasRef.current!
    const ro = new ResizeObserver(() => {
      const r = wrap.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      size.current = { w: r.width, h: r.height }
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      canvas.style.width = `${r.width}px`
      canvas.style.height = `${r.height}px`
      if (r.width === 0) return
      const to = cameraFor(openRef.current)
      if (!fitted.current) {
        view.current = to
        fitted.current = true
        setZoomPct(Math.round(to.k * 100))
      } else if (!followRef.current) {
        flyTo(to, 700)
      }
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  // The draw loop.
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let raf = 0
    const t0 = performance.now()

    const draw = (frameTime: number) => {
      raf = requestAnimationFrame(draw)
      // rAF timestamps can be slightly earlier than t0 on the first frame.
      const now = Math.max(frameTime, t0)
      const pal = palette.current ?? readPalette()
      const dpr = canvas.width / Math.max(1, size.current.w)

      // Lineage morph
      const mo = morph.current
      if (mo) {
        const p = Math.min(1, (now - mo.t0) / 1150)
        const e = easeInOut(p)
        for (const n of graph.nodes) {
          const a = mo.from.get(n.id) ?? { x: n.x!, y: n.y! }
          const b = mo.to.get(n.id) ?? a
          n.x = a.x + (b.x - a.x) * e
          n.y = a.y + (b.y - a.y) * e
          n.vx = 0
          n.vy = 0
        }
        fade.current = mo.toLineage ? 1 - e : e
        if (p >= 1) morph.current = null
      } else if (getState().layout === 'brain' && sim.alpha() > 0.004) {
        sim.tick()
      }

      if (tween.current) {
        const tw = tween.current
        const p = Math.min(1, (now - tw.t0) / tw.dur)
        const e = easeInOut(p)
        view.current = {
          k: tw.from.k + (tw.to.k - tw.from.k) * e,
          x: tw.from.x + (tw.to.x - tw.from.x) * e,
          y: tw.from.y + (tw.to.y - tw.from.y) * e,
        }
        if (p >= 1) tween.current = null
      }

      // Follow mode: the camera glides after a teammate.
      const who = followRef.current
      if (who && !tween.current) {
        let target: { x: number; y: number } | null = null
        if (who === 'mei') target = meiAt.current
        else {
          const act = ACTIVE.find((a) => a.who === who)
          const n = act ? graph.byId.get(act.chat) : null
          if (n) target = { x: n.x!, y: n.y! }
        }
        if (target) {
          const v = view.current
          const k = v.k + (1.9 - v.k) * 0.04
          const want = centreOn(target.x, target.y, k)
          view.current = { k, x: v.x + (want.x - v.x) * 0.06, y: v.y + (want.y - v.y) * 0.06 }
        }
      }

      const v = view.current
      const open = openRef.current
      const hover = hoverRef.current
      const files = showFilesRef.current
      const lineage = getState().layout === 'lineage' || !!mo
      const fd = fade.current
      const match = matchRef.current
      const focusId = hover?.id ?? null
      const focus = focusId ? new Set([focusId, ...(graph.neighbours.get(focusId) ?? [])]) : null
      const openSet = open ? new Set([open, ...(graph.neighbours.get(open) ?? [])]) : null
      const isMinor = (n: GNode) => n.type === 'file' || n.type === 'data' || n.type === 'chunk'
      const visible = (n: GNode) => (files || !isMinor(n)) && !(isMinor(n) && fd < 0.02)
      const lit = (n: GNode) => (focus ? focus.has(n.id) : match ? match.has(n.id) : true)
      const born = (id: string) => {
        const b = births.get(id)
        return b === undefined ? 1 : Math.max(0, Math.min(1, (now - b) / 650))
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, size.current.w, size.current.h)
      ctx.save()
      ctx.translate(v.x, v.y)
      ctx.scale(v.k, v.k)

      // Edges
      const lw = 0.8 / v.k
      for (const l of graph.links) {
        const s = l.source, t = l.target
        if (!visible(s) || !visible(t)) continue
        const minor = isMinor(s) || isMinor(t)
        const structural = l.type === 'branch' || l.type === 'merge' || l.type === 'pull' || l.type === 'member'
        if (!structural && fd < 0.02) continue
        const on = focus ? focus.has(s.id) && focus.has(t.id) && (s.id === focusId || t.id === focusId) : true
        const inOpen = openSet && (s.id === open || t.id === open)
        let colour = pal.edge
        let width = lw * 0.9
        ctx.setLineDash([])
        if (l.type === 'branch' || l.type === 'merge' || l.type === 'pull') {
          const whoC = (l.type === 'pull' ? s.by ?? t.by : t.by ?? s.by) as PersonId | undefined
          colour = withAlpha(whoC ? PEOPLE[whoC].color : pal.hub, l.type === 'pull' ? 0.7 : 0.8)
          width = lw * (l.type === 'pull' ? 1.4 : 1.8)
          if (l.type === 'merge') ctx.setLineDash([5 / v.k, 4 / v.k])
          if (l.type === 'pull') ctx.setLineDash([1.4 / v.k, 4 / v.k])
        } else if (on && focus) {
          colour = withAlpha(pal.text, 0.42)
          width = lw * 1.2
        } else if (inOpen) {
          colour = withAlpha(pal.text, 0.3)
          width = lw * 1.1
        } else if (l.type === 'data') {
          colour = withAlpha(pal.text, 0.075)
        } else if (l.type === 'chunk') {
          colour = withAlpha(t.by ? PEOPLE[t.by].color : pal.text, 0.22)
        } else if (l.type === 'related') {
          colour = withAlpha(pal.text, 0.11)
          ctx.setLineDash([2 / v.k, 4 / v.k])
        }
        let alpha = focus && !on ? 0.25 : match && !(match.has(s.id) || match.has(t.id)) ? 0.25 : 1
        if (minor || !structural) alpha *= fd
        ctx.globalAlpha = alpha
        ctx.strokeStyle = colour
        ctx.lineWidth = width
        // New edges draw themselves on, with a bright head.
        const bt = births.get(edgeKey(s.id, t.id, l.type))
        const grow = bt === undefined ? 1 : Math.max(0, Math.min(1, (now - bt) / 900))
        const ex = s.x! + (t.x! - s.x!) * ease(grow)
        const ey = s.y! + (t.y! - s.y!) * ease(grow)
        ctx.beginPath()
        ctx.moveTo(s.x!, s.y!)
        ctx.lineTo(ex, ey)
        ctx.stroke()
        if (grow < 1) {
          ctx.setLineDash([])
          ctx.globalAlpha = 1
          ctx.fillStyle = colour.replace(/[\d.]+\)$/, '1)')
          ctx.beginPath()
          ctx.arc(ex, ey, 3.2 / v.k, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.setLineDash([])
      ctx.globalAlpha = 1

      // Signals travelling along the open chat's connections
      if (open) {
        const n = graph.byId.get(open)
        const colour = n?.by ? PEOPLE[n.by].color : pal.hub
        let i = 0
        for (const l of graph.links) {
          if (l.source.id !== open && l.target.id !== open) continue
          if (!visible(l.source) || !visible(l.target)) continue
          const out = l.source.id === open
          const p = ((now - t0) / 2200 + i * 0.37) % 1
          const a = out ? l.target : l.source
          const b = out ? l.source : l.target
          const x = a.x! + (b.x! - a.x!) * ease(p)
          const y = a.y! + (b.y! - a.y!) * ease(p)
          ctx.fillStyle = withAlpha(colour, 0.9 * (1 - p * 0.6))
          ctx.beginPath()
          ctx.arc(x, y, 2.2 / v.k, 0, Math.PI * 2)
          ctx.fill()
          i++
        }
      }

      // Nodes
      const order: GNode['type'][] = ['data', 'chunk', 'file', 'chat', 'hub']
      for (const type of order) {
        for (const n of graph.nodes) {
          if (n.type !== type || !visible(n)) continue
          const g = born(n.id)
          ctx.globalAlpha = (lit(n) ? 1 : 0.18) * (isMinor(n) ? fd : 1) * Math.min(1, g * 2)
          const x = n.x!, y = n.y!
          const r = Math.max(0.1, Math.max(n.r, MIN_PX[n.type] / v.k) * (g < 1 ? springOut(g) : 1))
          if (n.type === 'chunk') {
            ctx.fillStyle = withAlpha(PEOPLE[n.by!].color, 0.55)
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
          } else if (n.type === 'data') {
            ctx.fillStyle = withAlpha(pal.text, 0.34)
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
          } else if (n.type === 'file') {
            ctx.fillStyle = pal.file
            ctx.strokeStyle = pal.text
            ctx.lineWidth = 1 / v.k
            if (n.source === 'paper') {
              ctx.fillStyle = pal.text
              ctx.fillRect(x - r, y - r * 1.25, r * 2, r * 2.5)
            } else if (n.source === 'robot') {
              ctx.beginPath()
              ctx.moveTo(x, y - r * 1.35); ctx.lineTo(x + r * 1.35, y); ctx.lineTo(x, y + r * 1.35); ctx.lineTo(x - r * 1.35, y)
              ctx.closePath()
              ctx.fillStyle = pal.hub
              ctx.fill()
            } else if (n.source === 'web') {
              ctx.beginPath()
              ctx.arc(x, y, r, 0, Math.PI * 2)
              ctx.stroke()
            } else {
              ctx.fillRect(x - r, y - r, r * 2, r * 2)
            }
          } else if (n.type === 'chat') {
            const colour = PEOPLE[n.by!].color
            ctx.fillStyle = colour
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
            if (n.by === 'you') {
              ctx.strokeStyle = pal.slate
              ctx.lineWidth = 1.4 / v.k
              ctx.stroke()
            }
            if (n.kind === 'merge' || n.kind === 'branch') {
              ctx.strokeStyle = withAlpha(colour, 0.85)
              ctx.lineWidth = 1.1 / v.k
              ctx.beginPath()
              ctx.arc(x, y, r + 2.6 / v.k, 0, Math.PI * 2)
              ctx.stroke()
            }
          } else {
            const grad = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 3.2)
            grad.addColorStop(0, withAlpha(pal.hub, 0.16))
            grad.addColorStop(1, withAlpha(pal.hub, 0))
            ctx.fillStyle = grad
            ctx.beginPath()
            ctx.arc(x, y, r * 3.2, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = pal.slate2
            ctx.strokeStyle = pal.hub
            ctx.lineWidth = 1.6 / Math.sqrt(v.k)
            ctx.beginPath()
            ctx.arc(x, y, r, 0, Math.PI * 2)
            ctx.fill()
            ctx.stroke()
            ctx.fillStyle = pal.hub
            ctx.beginPath()
            ctx.arc(x, y, r * 0.34, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
      ctx.globalAlpha = 1
      ctx.restore()

      // Screen-space layer: pulses, labels, the open-chat halo
      const sx = (n: GNode) => n.x! * v.k + v.x
      const sy = (n: GNode) => n.y! * v.k + v.y
      const rad = (n: GNode) => Math.max(n.r * v.k, MIN_PX[n.type])
      const phase = ((now - t0) % 1100) / 1100

      for (const [chatId, acts] of activeByChat) {
        const n = graph.byId.get(chatId)
        if (!n) continue
        acts.forEach((a, i) => {
          const speed = a.doing === 'typing' ? 780 : 1100
          const p = (((now - t0) + i * 300) % speed) / speed
          const r = rad(n) + 3 + p * 16
          ctx.strokeStyle = withAlpha(PEOPLE[a.who].color, (1 - p) * 0.85)
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.arc(sx(n), sy(n), r, 0, Math.PI * 2)
          ctx.stroke()
        })
      }

      // One-off pulses: something was cited, pulled in, branched or merged
      for (const [id, at] of pulses) {
        const p = (now - at) / 1600
        if (p >= 1) {
          pulses.delete(id)
          continue
        }
        const n = graph.byId.get(id)
        if (!n || !visible(n)) continue
        const colour = n.by ? PEOPLE[n.by].color : pal.text
        for (let ring = 0; ring < 2; ring++) {
          const q = Math.min(1, Math.max(0, p * 1.4 - ring * 0.3))
          if (q <= 0) continue
          ctx.strokeStyle = withAlpha(colour, (1 - q) * 0.95)
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(sx(n), sy(n), rad(n) + 4 + ease(q) * 26, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      if (open) {
        const n = graph.byId.get(open)
        if (n) {
          const r = rad(n) + 7 + Math.sin(phase * Math.PI * 2) * 1.5
          ctx.strokeStyle = pal.text
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(sx(n), sy(n), r, 0, Math.PI * 2)
          ctx.stroke()
          // Drop target while dragging a node onto the open chat
          if (dropTarget.current === open) {
            ctx.strokeStyle = withAlpha(pal.text, 0.9)
            ctx.setLineDash([3, 3])
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(sx(n), sy(n), r + 9 + Math.sin(phase * Math.PI * 2) * 2, 0, Math.PI * 2)
            ctx.stroke()
            ctx.setLineDash([])
          }
        }
      }

      if (match) {
        for (const id of match) {
          const n = graph.byId.get(id)
          if (!n || !visible(n)) continue
          ctx.strokeStyle = withAlpha(pal.text, 0.75)
          ctx.lineWidth = 1.3
          ctx.beginPath()
          ctx.arc(sx(n), sy(n), rad(n) + 5 + Math.sin(phase * Math.PI * 2) * 1.2, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Labels with a halo so they read over edges
      ctx.lineJoin = 'round'
      const label = (text: string, x: number, y: number, font: string, fill: string, align: CanvasTextAlign = 'center') => {
        ctx.font = font
        ctx.textAlign = align
        ctx.textBaseline = 'top'
        ctx.strokeStyle = pal.slate
        ctx.lineWidth = 4
        ctx.strokeText(text, x, y)
        ctx.fillStyle = fill
        ctx.fillText(text, x, y)
      }
      const hubFont = (core: boolean) => `${core ? 23 : 18}px "Instrument Serif", Georgia, serif`
      for (const n of graph.nodes) {
        if (!visible(n)) continue
        const isOpen = n.id === open
        const matched = match?.has(n.id)
        const showChat = n.type === 'chat' && (
          v.k > 1.7 || (focus && focus.has(n.id)) || isOpen || matched || (openSet?.has(n.id) && v.k > 1.1) || (lineage && v.k > 0.75) || born(n.id) < 1
        )
        const showFile = (n.type === 'file' || n.type === 'data') && fd > 0.5 && ((focus && focus.has(n.id) && n.type === 'file') || n.id === focusId || matched || (v.k > 2.6 && n.type === 'file'))
        ctx.globalAlpha = lit(n) ? 1 : 0.25
        if (n.type === 'hub') {
          if (lineage) {
            label(n.label, sx(n) - rad(n) - 10, sy(n) - 11, hubFont(n.id === 'core'), pal.text, 'right')
          } else {
            label(n.label, sx(n), sy(n) + rad(n) + 9, hubFont(n.id === 'core'), pal.text)
            if (v.k > 1.1 || n.id === focusId) label(`${n.weight} chats`, sx(n), sy(n) + rad(n) + 32, '500 10.5px "Hanken Grotesk", sans-serif', pal.text2)
          }
        } else if (showChat) {
          const max = lineage ? 30 : 42
          const t = n.label.length > max ? n.label.slice(0, max - 2) + '…' : n.label
          label(t, sx(n), sy(n) + rad(n) + 6, `${isOpen || matched ? 600 : 500} 11.5px "Hanken Grotesk", sans-serif`, isOpen || matched ? pal.text : pal.text2)
        } else if (showFile) {
          const t = n.label.length > 38 ? n.label.slice(0, 36) + '…' : n.label
          label(t, sx(n), sy(n) + rad(n) + 5, '400 10.5px "JetBrains Mono", monospace', pal.text2)
        }
      }
      ctx.globalAlpha = 1

      // Mei's cursor wandering between topics
      const cur = cursorRef.current
      if (cur) {
        const tt = (now - t0) / SEG
        const i = Math.floor(tt) % WANDER.length
        const a = graph.byId.get(WANDER[i])!
        const b = graph.byId.get(WANDER[(i + 1) % WANDER.length])!
        const local = tt - Math.floor(tt)
        const move = Math.max(0, Math.min(1, (local - 0.55) / 0.45))
        const e = easeInOut(move)
        const wob = Math.sin((now - t0) / 700) * 6
        const wx = a.x! + (b.x! - a.x!) * e
        const wy = a.y! + (b.y! - a.y!) * e
        meiAt.current = { x: wx, y: wy }
        const x = wx * v.k + v.x + 18 + wob
        const y = wy * v.k + v.y - 22 + Math.cos((now - t0) / 900) * 4
        cur.style.transform = `translate(${x}px, ${y}px)`
        if (move === 0) {
          const pr = ((now - t0) % 1400) / 1400
          ctx.strokeStyle = withAlpha(PEOPLE.mei.color, 0.9 - pr * 0.5)
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(sx(a), sy(a), rad(a) + 6, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [activeByChat])

  // Pointer: hover, drag nodes (and out into a chat), pan, click to open
  useEffect(() => {
    const canvas = canvasRef.current!
    let drag: { node: GNode | null; sx: number; sy: number; vx: number; vy: number; moved: boolean; out: boolean; home: { x: number; y: number } | null } | null = null

    const local = (e: PointerEvent | WheelEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      const v = view.current
      return { x, y, wx: (x - v.x) / v.k, wy: (y - v.y) / v.k, inside: x >= 0 && y >= 0 && x <= r.width && y <= r.height }
    }
    const pick = (wx: number, wy: number) => {
      const k = view.current.k
      const lineage = getState().layout === 'lineage'
      let best: GNode | null = null
      let bestD = Infinity
      const rank = { hub: 0, chat: 1, file: 2, data: 3, chunk: 4 }
      for (const n of graph.nodes) {
        const minor = n.type === 'file' || n.type === 'data' || n.type === 'chunk'
        if (minor && (!showFilesRef.current || lineage)) continue
        const d = Math.hypot((n.x ?? 0) - wx, (n.y ?? 0) - wy)
        const reach = Math.max(n.r, MIN_PX[n.type] / k) + 5 / k
        if (d < reach && (best === null || rank[n.type] < rank[best.type] || (rank[n.type] === rank[best.type] && d < bestD))) {
          best = n
          bestD = d
        }
      }
      return best
    }
    const zoneAt = (cx: number, cy: number): 'chat' | 'new-chat' | null => {
      const el = document.elementFromPoint(cx, cy)?.closest('[data-dropzone]')
      const z = el?.getAttribute('data-dropzone')
      return z === 'chat' || z === 'new-chat' ? z : null
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      const p = local(e)
      const node = pick(p.wx, p.wy)
      drag = { node, sx: p.x, sy: p.y, vx: view.current.x, vy: view.current.y, moved: false, out: false, home: node ? { x: node.x!, y: node.y! } : null }
      canvas.setPointerCapture(e.pointerId)
      if (node && getState().layout === 'brain') {
        node.fx = node.x
        node.fy = node.y
      }
    }
    const onMove = (e: PointerEvent) => {
      const p = local(e)
      if (drag) {
        if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 3) drag.moved = true
        if (drag.node && drag.moved) {
          const n = drag.node
          if (p.inside) {
            if (drag.out) {
              drag.out = false
              setState({ drag: null })
            }
            if (getState().layout === 'brain') {
              n.fx = p.wx
              n.fy = p.wy
              sim.alpha(Math.max(sim.alpha(), 0.18))
            }
            // Dropping onto the open chat's node pulls it in too (SPEC CTX-2).
            const open = openRef.current
            const on = open && open !== n.id ? graph.byId.get(open) : null
            dropTarget.current = on && Math.hypot(on.x! - p.wx, on.y! - p.wy) < 22 / view.current.k ? open : null
          } else {
            // Out of the brain: the node springs home and a card follows the cursor on a tether.
            if (!drag.out && drag.home && getState().layout === 'brain') {
              n.fx = drag.home.x
              n.fy = drag.home.y
            }
            drag.out = true
            dropTarget.current = null
            const label = n.type === 'hub' ? `Topic: ${n.label}` : n.label.split('/').pop() ?? n.label
            setState({
              drag: {
                node: n.id, label, kind: n.type === 'file' ? n.source ?? 'file' : n.type,
                color: n.by ? PEOPLE[n.by].color : undefined, x: e.clientX, y: e.clientY, over: zoneAt(e.clientX, e.clientY),
              },
            })
          }
        } else if (!drag.node) {
          tween.current = null
          if (followRef.current) follow(null)
          view.current = { ...view.current, x: drag.vx + (p.x - drag.sx), y: drag.vy + (p.y - drag.sy) }
        }
        return
      }
      const n = pick(p.wx, p.wy)
      if (n !== hoverRef.current) {
        hoverRef.current = n
        canvas.style.cursor = n ? 'pointer' : 'grab'
      }
      setTip(n ? { node: n, x: p.x, y: p.y } : null)
    }
    const onUp = (e: PointerEvent) => {
      if (!drag) return
      const d = drag
      drag = null
      canvas.releasePointerCapture(e.pointerId)
      const n = d.node
      if (!n) return
      n.fx = null
      n.fy = null
      if (d.out) {
        const over = getState().drag?.over ?? null
        setState({ drag: null })
        if (over) dropNode(n.id, { x: e.clientX, y: e.clientY }, over)
        else cancelDrop(n.id, { x: e.clientX, y: e.clientY })
        return
      }
      if (dropTarget.current) {
        dropTarget.current = null
        if (d.home && getState().layout === 'brain') {
          n.x = d.home.x
          n.y = d.home.y
        }
        dropNode(n.id, { x: e.clientX, y: e.clientY }, 'chat')
        return
      }
      if (!d.moved) {
        if (n.type === 'chat') openChat(n.id)
        else if (n.type === 'hub') flyTo(centreOn(n.x!, n.y!, 1.9), 900)
      }
    }
    const onLeave = () => {
      hoverRef.current = null
      setTip(null)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      tween.current = null
      if (followRef.current) follow(null)
      const p = local(e)
      const v = view.current
      const k = Math.max(0.25, Math.min(4.5, v.k * Math.exp(-e.deltaY * 0.0016)))
      view.current = { k, x: p.x - p.wx * k, y: p.y - p.wy * k }
      setZoomPct(Math.round(k * 100))
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('wheel', onWheel)
    }
  }, [])

  // A hint the first moments after a chat opens: drag dots into it.
  useEffect(() => {
    if (!openChat_) return
    setDropHint(true)
    const t = window.setTimeout(() => setDropHint(false), 5200)
    return () => window.clearTimeout(t)
  }, [openChat_])

  const zoomBy = (f: number) => {
    const { w, h } = size.current
    const v = view.current
    const k = Math.max(0.25, Math.min(4.5, v.k * f))
    const cx = (w / 2 - v.x) / v.k, cy = (h / 2 - v.y) / v.k
    flyTo({ k, x: w / 2 - cx * k, y: h / 2 - cy * k }, 350)
  }

  return (
    <div className="brain" ref={wrapRef} data-tour="brain">
      <div className="brain__grain" aria-hidden="true" />
      <canvas ref={canvasRef} className="brain__canvas" aria-label="The lab's brain: research topics, chats and files. Drag any node into a chat to pull it in." />

      <div className="brain__top">
        <div className="seg seg--slate" role="group" aria-label="Layout" data-tour="lineage">
          <button type="button" className={`seg__btn ${layout === 'brain' ? 'is-on' : ''}`} aria-pressed={layout === 'brain'} onClick={() => setLayout('brain')}>Brain</button>
          <button type="button" className={`seg__btn ${layout === 'lineage' ? 'is-on' : ''}`} aria-pressed={layout === 'lineage'} onClick={() => setLayout('lineage')}>Lineage</button>
        </div>
        <button type="button" className={`slate-chip ${showFiles ? 'is-on' : ''}`} aria-pressed={showFiles} onClick={() => setShowFiles((s) => !s)}>
          <Icon name="file" size={13} /> Files {showFiles ? 'shown' : 'hidden'}
        </button>
        <button type="button" className="slate-chip slate-chip--new" onClick={() => newChat()} data-tour="new-chat">
          <Icon name="plus" size={13} /> New chat
        </button>
        {following && (
          <span className="follow-pill" style={{ ['--who' as string]: PEOPLE[following].color }}>
            <i /> Following {PEOPLE[following].short}
            <button type="button" onClick={() => follow(null)}>Stop</button>
          </span>
        )}
      </div>

      {openChat_ && dropHint && (
        <div className="brain__hint" role="note">
          <span className="brain__hint-hand" aria-hidden="true" />
          Drag any dot into the chat to pull it in
        </div>
      )}

      <div className="brain__legend" aria-label="Legend">
        <span><i className="lg-dot" /> Chat · colour = who started it</span>
        <span><i className="lg-hub" /> Research topic</span>
        <span><i className="lg-paper" /> Paper</span>
        <span><i className="lg-robot" /> Robot</span>
        <span><i className="lg-file" /> File</span>
        <span><i className="lg-mem" /> Saved Q&amp;A</span>
        <span><i className="lg-line" /> Branch</span>
        <span><i className="lg-line lg-line--dash" /> Merge</span>
        <span><i className="lg-line lg-line--dot" /> Pulled in</span>
      </div>

      <div className="brain__zoom">
        <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.35)}><Icon name="minus" size={14} /></button>
        <span>{zoomPct}%</span>
        <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.35)}><Icon name="plus" size={14} /></button>
        <button type="button" aria-label="Fit the whole lab" onClick={() => flyTo(fitView(), 700)}><Icon name="fit" size={14} /></button>
      </div>

      <div className="brain__cursor" ref={cursorRef} aria-hidden="true">
        <Cursor color={PEOPLE.mei.color} name="Mei" onColor={PEOPLE.mei.onColor} />
      </div>

      {tip && <Tip node={tip.node} x={tip.x} y={tip.y} split={!!openChat_} />}
    </div>
  )
}

function Tip({ node, x, y, split }: { node: GNode; x: number; y: number; split: boolean }) {
  const hub = HUBS.find((h) => h.id === node.hub)
  let kind = ''
  let meta: React.ReactNode = null
  if (node.type === 'hub') {
    kind = 'Research topic'
    meta = <>{hub?.question} · {node.weight} chats</>
  } else if (node.type === 'chat') {
    const p = PEOPLE[node.by!]
    kind = node.kind === 'branch' ? 'Branch' : node.kind === 'merge' ? 'Merge' : 'Chat'
    const act = ACTIVE.filter((a) => a.chat === node.id)
    meta = (
      <>
        <span className="tip__who"><i style={{ background: p.color }} />{p.name}</span>
        <span> · {hub?.label}</span>
        {act.map((a) => (
          <span key={a.who} className="tip__live" style={{ color: PEOPLE[a.who].color }}>
            {' '}· {PEOPLE[a.who].short} {a.doing === 'typing' ? 'is typing' : 'is here'}
          </span>
        ))}
      </>
    )
  } else if (node.type === 'chunk') {
    kind = 'Lab memory · one question and answer'
    meta = <span className="tip__who"><i style={{ background: PEOPLE[node.by!].color }} />Asked by {PEOPLE[node.by!].name}</span>
  } else {
    kind = SOURCE_LABEL[node.source ?? 'labpc'] + (node.type === 'data' ? ' · metadata only' : '')
    meta = node.cite ?? hub?.label
  }
  return (
    <div className="tip" style={{ transform: `translate(${x + 16}px, ${y + 14}px)` }} role="tooltip">
      <span className="tip__kind">{kind}</span>
      <span className={`tip__title ${node.type === 'data' || (node.type === 'file' && node.source !== 'paper' && node.source !== 'robot' && node.source !== 'web') ? 'mono' : ''}`}>{node.label}</span>
      <span className="tip__meta">{meta}</span>
      <span className="tip__hint">{split ? 'Drag into the chat to pull it in' : node.type === 'chat' ? 'Click to open · drag out to start a chat with it' : 'Drag out to start a chat with it'}</span>
    </div>
  )
}
