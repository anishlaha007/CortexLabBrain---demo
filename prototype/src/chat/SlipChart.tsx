// An output inside an answer: slip per gait cycle against bed angle (illustrative lab data).
// Neutral ink only. Colour is reserved for people.

const RUNS: [number, number][] = [
  [6, 0.3], [8, 0.35], [10, 0.5], [12, 0.62], [13, 0.8], [14, 0.95],
  [15, 1.3], [16, 2.0], [17, 2.6], [18, 3.4], [19, 4.1], [20, 4.9],
]

const W = 440
const H = 168
const M = { l: 34, r: 14, t: 16, b: 30 }
const X = (deg: number) => M.l + ((deg - 5) / (21 - 5)) * (W - M.l - M.r)
const Y = (cm: number) => H - M.b - (cm / 5.5) * (H - M.t - M.b)

export function SlipChart() {
  const path = RUNS.map(([d, s], i) => `${i ? 'L' : 'M'}${X(d).toFixed(1)},${Y(s).toFixed(1)}`).join(' ')
  const area = `${path} L${X(20).toFixed(1)},${Y(0)} L${X(6).toFixed(1)},${Y(0)} Z`
  return (
    <figure className="artifact">
      <figcaption className="artifact__cap">
        <span className="artifact__title">Slip per gait cycle vs bed angle</span>
        <span className="artifact__src mono">slope_trials_2025-06.csv · runs after 14 Jun</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="artifact__svg" role="img" aria-label="Slip stays under 1 cm per cycle up to 14 degrees, then rises steeply to about 5 cm at 20 degrees">
        {[0, 1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} className="ax-grid" />
            <text x={M.l - 8} y={Y(v) + 3.5} className="ax-label" textAnchor="end">{v}</text>
          </g>
        ))}
        {[6, 10, 14, 18].map((d) => (
          <text key={d} x={X(d)} y={H - 10} className="ax-label" textAnchor="middle">{d}°</text>
        ))}
        <rect x={X(15)} y={M.t} width={X(21) - X(15)} height={H - M.t - M.b} className="ax-zone" />
        <line x1={X(15)} x2={X(15)} y1={M.t} y2={H - M.b} className="ax-mark" />
        <text x={X(15) + 6} y={M.t + 10} className="ax-note">slips above 15°</text>
        <line x1={X(18)} x2={X(18)} y1={Y(3.4) - 8} y2={Y(3.4) - 26} className="ax-mark" />
        <text x={X(18) - 4} y={Y(3.4) - 30} className="ax-note" textAnchor="end">robot pitches · 18°</text>
        <path d={area} className="line-area" />
        <path d={path} className="line" />
        {RUNS.map(([d, s]) => (
          <circle key={d} cx={X(d)} cy={Y(s)} r={2.6} className="pt" />
        ))}
        <text x={M.l - 26} y={M.t - 4} className="ax-label">cm</text>
      </svg>
    </figure>
  )
}
