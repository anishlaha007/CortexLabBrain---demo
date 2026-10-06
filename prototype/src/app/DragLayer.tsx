import { useEffect, useRef } from 'react'
import { useStore, type Flight } from '../engine/store'
import { screenOf } from '../engine/world'
import { Icon, type IconName } from '../ui/Icons'
import { nameify } from '../lab/people'

const KIND_ICON: Record<string, IconName> = {
  chat: 'chat', hub: 'compass', paper: 'paper', robot: 'robot', github: 'github', drive: 'drive',
  onedrive: 'onedrive', labpc: 'labpc', web: 'web', data: 'labpc', chunk: 'sparkle', file: 'file',
}

/**
 * Dragging something out of the brain: an elastic tether from the node to a card under the cursor.
 * Dropping it sends the card flying into the chat's context tray.
 */
export function DragLayer() {
  const drag = useStore((s) => s.drag)
  const flights = useStore((s) => s.flights)
  const pathRef = useRef<SVGPathElement>(null)
  const glowRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)
  const dragRef = useRef(drag)
  dragRef.current = drag

  // The tether follows the node (which can still drift) and the cursor every frame.
  useEffect(() => {
    if (!drag) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const d = dragRef.current
      if (!d || !pathRef.current) return
      const a = screenOf(d.node)
      if (!a) return
      const b = { x: d.x, y: d.y }
      const dist = Math.hypot(b.x - a.x, b.y - a.y)
      const sag = Math.min(90, dist * 0.22) * (1 + Math.sin((now - t0) / 260) * 0.08)
      const mx = (a.x + b.x) / 2
      const my = (a.y + b.y) / 2 + sag
      const dpath = `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`
      pathRef.current.setAttribute('d', dpath)
      glowRef.current?.setAttribute('d', dpath)
      dotRef.current?.setAttribute('cx', String(a.x))
      dotRef.current?.setAttribute('cy', String(a.y))
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [!!drag])

  return (
    <div className="drag-layer" aria-hidden="true">
      {drag && (
        <>
          <svg className={`tether ${drag.over ? 'is-over' : ''}`} style={{ ['--tether' as string]: drag.color ?? 'var(--accent)' }}>
            <path ref={glowRef} className="tether__glow" />
            <path ref={pathRef} className="tether__line" />
            <circle ref={dotRef} r="7" className="tether__anchor" />
          </svg>
          <div
            className={`ghost ${drag.over ? 'is-over' : ''} ${drag.x > window.innerWidth - 330 ? 'ghost--left' : ''}`}
            style={{ transform: drag.x > window.innerWidth - 330 ? `translate(calc(${drag.x - 14}px - 100%), ${drag.y + 10}px)` : `translate(${drag.x + 14}px, ${drag.y + 10}px)`, ['--who' as string]: drag.color }}
          >
            {drag.color ? <i className="ghost__dot" /> : <Icon name={KIND_ICON[drag.kind] ?? 'file'} size={13} />}
            <span className="ghost__label">{drag.label}</span>
            <span className="ghost__hint">{drag.over === 'chat' ? 'Drop to pull in' : drag.over === 'new-chat' ? 'Drop to start a chat' : 'Drag into a chat'}</span>
          </div>
        </>
      )}
      {flights.map((f) => <FlyingCard key={f.id} f={f} />)}
    </div>
  )
}

function FlyingCard({ f }: { f: Flight }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const lift = Math.min(140, Math.abs(f.to.x - f.from.x) * 0.25 + 40)
    const mid = { x: (f.from.x + f.to.x) / 2, y: Math.min(f.from.y, f.to.y) - (f.back ? 10 : lift) }
    el.animate(
      f.back
        ? [
            { transform: `translate(${f.from.x}px, ${f.from.y}px) scale(1)`, opacity: 1 },
            { transform: `translate(${f.to.x}px, ${f.to.y}px) scale(0.3)`, opacity: 0 },
          ]
        : [
            { transform: `translate(${f.from.x}px, ${f.from.y}px) scale(1) rotate(0deg)`, opacity: 1 },
            { transform: `translate(${mid.x}px, ${mid.y}px) scale(1.08) rotate(-3deg)`, opacity: 1, offset: 0.55 },
            { transform: `translate(${f.to.x}px, ${f.to.y}px) scale(0.86) rotate(0deg)`, opacity: 0.9 },
          ],
      { duration: f.back ? 420 : 560, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
    )
  }, [f])
  return (
    <div ref={ref} className="ghost ghost--flying" style={{ ['--who' as string]: f.color }}>
      {f.color ? <i className="ghost__dot" /> : <Icon name={KIND_ICON[f.kind] ?? 'file'} size={13} />}
      <span className="ghost__label">{f.label}</span>
    </div>
  )
}

export function Toasts() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone === 'live' ? 'toast--live' : ''}`} style={{ ['--who' as string]: t.who ? `var(--p-${t.who})` : undefined }}>
          {t.who && <i className="toast__dot" />}
          {nameify(t.text)}
        </div>
      ))}
    </div>
  )
}
