import { useEffect, useMemo, useRef, useState } from 'react'
import type { Simulation } from 'd3-force'
import { ACTIVE, HUBS, type Activity } from '../lab/content'
import { PEOPLE, type PersonId } from '../lab/people'
import type { GLink, GNode, Graph } from './graph'
import { Cursor } from '../ui/Cursor'
import { Icon } from '../ui/Icons'
import type { Theme } from '../app/theme'

interface Props {
  graph: Graph
  sim: Simulation<GNode, GLink>
  theme: Theme
  openChat: string | null
  onOpenChat: (id: string) => void
  compact?: boolean
  /** Set from the Topics list: the camera flies to that topic. */
  focusHub?: { id: string; n: number } | null
}

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

/** Mei is wandering the brain: a Figma-style cursor gliding between topics. */
const WANDER: string[] = ['sand', 'maths', 'posts', 'wiggle', 'maths']

export function Brain({ graph, sim, theme, openChat, onOpenChat, compact, focusHub }: Props) {
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
  const showFilesRef = useRef(showFiles)
  showFilesRef.current = showFiles
  const openRef = useRef(openChat)
  openRef.current = openChat

  const activeByChat = useMemo(() => {
    const m = new Map<string, Activity[]>()
    ACTIVE.forEach((a) => m.set(a.chat, [...(m.get(a.chat) ?? []), a]))
    return m
  }, [])

  useEffect(() => {
    palette.current = readPalette()
  }, [theme])

  const fitView = (pad = 34): View => {
    const { w, h } = size.current
    const xs = graph.nodes.map((n) => n.x ?? 0)
    const ys = graph.nodes.map((n) => n.y ?? 0)
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const k = Math.min((w - pad * 2) / (maxX - minX), (h - pad * 2) / (maxY - minY), 1.6)
    return { k, x: w / 2 - ((minX + maxX) / 2) * k, y: h / 2 - ((minY + maxY) / 2) * k }
  }

  const flyTo = (to: View, dur = 900) => {
    tween.current = { from: { ...view.current }, to, t0: performance.now(), dur }
  }

  const focusNode = (n: GNode, k: number) => {
    const { w, h } = size.current
    flyTo({ k, x: w / 2 - (n.x ?? 0) * k, y: h / 2 - (n.y ?? 0) * k })
  }

  /** Where the camera should be: the open chat's neighbourhood, or the whole lab. */
  const cameraFor = (chatId: string | null): View => {
    const n = chatId ? graph.byId.get(chatId) : null
    const hub = n ? graph.byId.get(n.hub) : null
    if (!n || !hub) return fitView()
    const { w, h } = size.current
    const k = 1.2
    const cx = (n.x ?? 0) * 0.6 + (hub.x ?? 0) * 0.4
    const cy = (n.y ?? 0) * 0.6 + (hub.y ?? 0) * 0.4
    return { k, x: w / 2 - cx * k, y: h / 2 - cy * k }
  }

  // Camera follows the open chat (split view) or returns to the whole lab.
  useEffect(() => {
    if (!fitted.current) return
    const to = cameraFor(openChat)
    flyTo(to, 1100)
    setZoomPct(Math.round(to.k * 100))
  }, [openChat, graph])

  useEffect(() => {
    if (!focusHub || !fitted.current) return
    const n = graph.byId.get(focusHub.id)
    if (n) {
      focusNode(n, 1.9)
      setZoomPct(190)
    }
  }, [focusHub, graph])

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
      } else {
        flyTo(to, 700)
      }
      setZoomPct(Math.round(to.k * 100))
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [graph])

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
      if (sim.alpha() > 0.004) sim.tick()

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
      const v = view.current
      const open = openRef.current
      const hover = hoverRef.current
      const files = showFilesRef.current
      const focusId = hover?.id ?? null
      const focus = focusId ? new Set([focusId, ...(graph.neighbours.get(focusId) ?? [])]) : null
      const openSet = open ? new Set([open, ...(graph.neighbours.get(open) ?? [])]) : null
      const visible = (n: GNode) => files || n.type === 'hub' || n.type === 'chat'
      const lit = (n: GNode) => (focus ? focus.has(n.id) : true)

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
        const on = focus ? focus.has(s.id) && focus.has(t.id) && (s.id === focusId || t.id === focusId) : true
        const inOpen = openSet && (s.id === open || t.id === open)
        let colour = pal.edge
        let width = lw * 0.9
        ctx.setLineDash([])
        if (l.type === 'branch' || l.type === 'merge' || l.type === 'pull') {
          const who = (t.by ?? s.by) as PersonId | undefined
          colour = withAlpha(who ? PEOPLE[who].color : pal.hub, l.type === 'pull' ? 0.55 : 0.75)
          width = lw * (l.type === 'pull' ? 1.1 : 1.6)
          if (l.type === 'merge') ctx.setLineDash([5, 4])
          if (l.type === 'pull') ctx.setLineDash([1.2, 3.5])
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
        ctx.globalAlpha = focus && !on ? 0.25 : 1
        ctx.strokeStyle = colour
        ctx.lineWidth = width
        ctx.beginPath()
        ctx.moveTo(s.x!, s.y!)
        ctx.lineTo(t.x!, t.y!)
        ctx.stroke()
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
          ctx.globalAlpha = lit(n) ? 1 : 0.18
          const x = n.x!, y = n.y!
          const r = Math.max(n.r, MIN_PX[n.type] / v.k)
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
            if (n.kind === 'merge' || n.kind === 'branch') {
              ctx.strokeStyle = withAlpha(colour, 0.85)
              ctx.lineWidth = 1.1 / v.k
              ctx.beginPath()
              ctx.arc(x, y, r + 2.6 / v.k, 0, Math.PI * 2)
              ctx.stroke()
            }
          } else {
            const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 3.2)
            g.addColorStop(0, withAlpha(pal.hub, 0.16))
            g.addColorStop(1, withAlpha(pal.hub, 0))
            ctx.fillStyle = g
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
      const phase = ((now - t0) % 1100) / 1100

      for (const [chatId, acts] of activeByChat) {
        const n = graph.byId.get(chatId)
        if (!n) continue
        acts.forEach((a, i) => {
          const speed = a.doing === 'typing' ? 780 : 1100
          const p = (((now - t0) + i * 300) % speed) / speed
          const r = Math.max(n.r * v.k, MIN_PX.chat) + 3 + p * 16
          ctx.strokeStyle = withAlpha(PEOPLE[a.who].color, (1 - p) * 0.85)
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.arc(sx(n), sy(n), r, 0, Math.PI * 2)
          ctx.stroke()
        })
      }

      if (open) {
        const n = graph.byId.get(open)
        if (n) {
          const r = Math.max(n.r * v.k, MIN_PX.chat) + 7 + Math.sin(phase * Math.PI * 2) * 1.5
          ctx.strokeStyle = pal.text
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(sx(n), sy(n), r, 0, Math.PI * 2)
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
        const showChat = n.type === 'chat' && (v.k > 1.7 || (focus && focus.has(n.id)) || isOpen || (openSet?.has(n.id) && v.k > 1.2))
        const showFile = (n.type === 'file' || n.type === 'data') && ((focus && focus.has(n.id) && n.type === 'file') || n.id === focusId || (v.k > 2.6 && n.type === 'file'))
        ctx.globalAlpha = lit(n) ? 1 : 0.25
        if (n.type === 'hub') {
          label(n.label, sx(n), sy(n) + Math.max(n.r * v.k, MIN_PX.hub) + 9, hubFont(n.id === 'core'), pal.text)
          if (v.k > 1.1 || n.id === focusId) {
            label(`${n.weight} chats`, sx(n), sy(n) + Math.max(n.r * v.k, MIN_PX.hub) + 32, '500 10.5px "Hanken Grotesk", sans-serif', pal.text2)
          }
        } else if (showChat) {
          const t = n.label.length > 42 ? n.label.slice(0, 40) + '…' : n.label
          label(t, sx(n), sy(n) + Math.max(n.r * v.k, MIN_PX.chat) + 6, `${isOpen ? 600 : 500} 11.5px "Hanken Grotesk", sans-serif`, isOpen ? pal.text : pal.text2)
        } else if (showFile) {
          const t = n.label.length > 38 ? n.label.slice(0, 36) + '…' : n.label
          label(t, sx(n), sy(n) + Math.max(n.r * v.k, MIN_PX.file) + 5, '400 10.5px "JetBrains Mono", monospace', pal.text2)
        }
      }
      ctx.globalAlpha = 1

      // Mei's cursor wandering between topics
      const cur = cursorRef.current
      if (cur) {
        const seg = 5200
        const tt = (now - t0) / seg
        const i = Math.floor(tt) % WANDER.length
        const a = graph.byId.get(WANDER[i])!
        const b = graph.byId.get(WANDER[(i + 1) % WANDER.length])!
        const local = tt - Math.floor(tt)
        const move = Math.max(0, Math.min(1, (local - 0.55) / 0.45))
        const e = easeInOut(move)
        const wob = Math.sin((now - t0) / 700) * 6
        const x = sx(a) + (sx(b) - sx(a)) * e + 18 + wob
        const y = sy(a) + (sy(b) - sy(a)) * e - 22 + Math.cos((now - t0) / 900) * 4
        cur.style.transform = `translate(${x}px, ${y}px)`
        if (move === 0) {
          const pr = ((now - t0) % 1400) / 1400
          ctx.strokeStyle = withAlpha(PEOPLE.mei.color, 0.9 - pr * 0.5)
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(sx(a), sy(a), a.r * v.k + 6, 0, Math.PI * 2)
          ctx.stroke()
        }
      }
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [graph, sim, activeByChat])

  // Pointer: hover, drag nodes, pan, click to open
  useEffect(() => {
    const canvas = canvasRef.current!
    let drag: { node: GNode | null; sx: number; sy: number; vx: number; vy: number; moved: boolean } | null = null

    const toWorld = (e: PointerEvent | WheelEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      const v = view.current
      return { x, y, wx: (x - v.x) / v.k, wy: (y - v.y) / v.k }
    }
    const pick = (wx: number, wy: number) => {
      const k = view.current.k
      let best: GNode | null = null
      let bestD = Infinity
      const rank = { hub: 0, chat: 1, file: 2, data: 3, chunk: 4 }
      for (const n of graph.nodes) {
        if (!showFilesRef.current && (n.type === 'file' || n.type === 'data')) continue
        const d = Math.hypot((n.x ?? 0) - wx, (n.y ?? 0) - wy)
        const reach = Math.max(n.r, MIN_PX[n.type] / k) + 5 / k
        if (d < reach && (best === null || rank[n.type] < rank[best.type] || (rank[n.type] === rank[best.type] && d < bestD))) {
          best = n
          bestD = d
        }
      }
      return best
    }

    const onDown = (e: PointerEvent) => {
      const p = toWorld(e)
      const node = pick(p.wx, p.wy)
      drag = { node, sx: p.x, sy: p.y, vx: view.current.x, vy: view.current.y, moved: false }
      canvas.setPointerCapture(e.pointerId)
      if (node) {
        node.fx = node.x
        node.fy = node.y
      }
    }
    const onMove = (e: PointerEvent) => {
      const p = toWorld(e)
      if (drag) {
        if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 3) drag.moved = true
        if (drag.node && drag.moved) {
          drag.node.fx = p.wx
          drag.node.fy = p.wy
          sim.alpha(Math.max(sim.alpha(), 0.18))
        } else if (!drag.node) {
          tween.current = null
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
      if (d.node) {
        d.node.fx = null
        d.node.fy = null
        if (!d.moved) {
          if (d.node.type === 'chat') onOpenChat(d.node.id)
          else if (d.node.type === 'hub') focusNode(d.node, 1.9)
        }
      }
    }
    const onLeave = () => {
      hoverRef.current = null
      setTip(null)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      tween.current = null
      const p = toWorld(e)
      const v = view.current
      const k = Math.max(0.3, Math.min(4.5, v.k * Math.exp(-e.deltaY * 0.0016)))
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
  }, [graph, sim, onOpenChat])

  const zoomBy = (f: number) => {
    const { w, h } = size.current
    const v = view.current
    const k = Math.max(0.3, Math.min(4.5, v.k * f))
    const cx = (w / 2 - v.x) / v.k, cy = (h / 2 - v.y) / v.k
    flyTo({ k, x: w / 2 - cx * k, y: h / 2 - cy * k }, 350)
    setZoomPct(Math.round(k * 100))
  }

  return (
    <div className={`brain ${compact ? 'brain--compact' : ''}`} ref={wrapRef}>
      <div className="brain__grain" aria-hidden="true" />
      <canvas ref={canvasRef} className="brain__canvas" aria-label="The lab's brain: research topics, chats and files" />

      <div className="brain__top">
        <div className="seg seg--slate" role="group" aria-label="Layout">
          <button type="button" className="seg__btn is-on">Brain</button>
          <button type="button" className="seg__btn" title="Lineage layout arrives in step 3">Lineage</button>
        </div>
        <button type="button" className={`slate-chip ${showFiles ? 'is-on' : ''}`} onClick={() => setShowFiles((s) => !s)}>
          <Icon name="file" size={13} /> Files {showFiles ? 'shown' : 'hidden'}
        </button>
      </div>

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
        <button type="button" aria-label="Fit the whole lab" onClick={() => { const f = fitView(); flyTo(f, 700); setZoomPct(Math.round(f.k * 100)) }}><Icon name="fit" size={14} /></button>
      </div>

      <div className="brain__cursor" ref={cursorRef} aria-hidden="true">
        <Cursor color={PEOPLE.mei.color} name="Mei" onColor={PEOPLE.mei.onColor} />
      </div>

      {tip && <Tip node={tip.node} x={tip.x} y={tip.y} />}
    </div>
  )
}

function Tip({ node, x, y }: { node: GNode; x: number; y: number }) {
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
    </div>
  )
}
