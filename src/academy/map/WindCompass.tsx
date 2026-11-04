import type { Environment } from '../core/environment'
import { toRad } from '../core/units'

interface Props {
  env: Environment
  minTwa: number
  windLabel: string
  currentLabel: string
  noGoLabel: string
}

const C = 60
const R = 48

function point(bearing: number, r: number): [number, number] {
  return [C + Math.sin(toRad(bearing)) * r, C - Math.cos(toRad(bearing)) * r]
}

/**
 * Compass rose. The wind arrow runs across the whole rose: its tail is where the wind comes FROM,
 * its head where it blows TO. The faint wedge on the windward side is the no-go zone.
 */
export function WindCompass({ env, minTwa, windLabel, currentLabel, noGoLabel }: Props) {
  const [ax, ay] = point(env.windFromDeg - minTwa, R)
  const [bx, by] = point(env.windFromDeg + minTwa, R)
  const [nx, ny] = point(env.windFromDeg, R * 0.62)
  const [wx, wy] = point(env.windFromDeg, R - 2)
  const [wtx, wty] = point(env.windFromDeg + 180, R - 8)
  const [cx1, cy1] = point(env.currentSetDeg + 180, 22)
  const [cx2, cy2] = point(env.currentSetDeg, 22)
  const hasCurrent = env.currentSpeedKn > 0

  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24 drop-shadow md:h-32 md:w-32" role="img" aria-label={`${windLabel}. ${currentLabel}`}>
      <defs>
        <marker id="wc-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#0b3a5c" />
        </marker>
        <marker id="wc-arrow-c" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
          <path d="M0 0 L10 5 L0 10 Z" fill="#0284c7" />
        </marker>
      </defs>
      <circle cx={C} cy={C} r={R + 10} fill="rgba(255,255,255,0.94)" stroke="#94a3b8" />
      <path d={`M${C} ${C} L${ax} ${ay} A${R} ${R} 0 0 1 ${bx} ${by} Z`} fill="rgba(214,49,43,0.12)" stroke="rgba(214,49,43,0.45)" strokeDasharray="3 2" />
      <text x={nx} y={ny + 2.5} textAnchor="middle" fontSize="7" fontWeight="600" fill="#b91c1c">
        {noGoLabel}
      </text>
      {['N', 'E', 'S', 'W'].map((l, i) => {
        const [x, y] = point(i * 90, R + 4)
        return (
          <text key={l} x={x} y={y + 3} textAnchor="middle" fontSize="9" fontWeight="600" fill="#334155">
            {l}
          </text>
        )
      })}
      <circle cx={wx} cy={wy} r="3" fill="#0b3a5c" />
      <line x1={wx} y1={wy} x2={wtx} y2={wty} stroke="#0b3a5c" strokeWidth="3.5" markerEnd="url(#wc-arrow)" />
      {hasCurrent && (
        <line x1={cx1} y1={cy1} x2={cx2} y2={cy2} stroke="#0284c7" strokeWidth="3" strokeDasharray="4 2" markerEnd="url(#wc-arrow-c)" />
      )}
    </svg>
  )
}
