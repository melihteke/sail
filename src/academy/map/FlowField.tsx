import { useId } from 'react'
import type { Environment } from '../core/environment'

const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

interface StreakDef {
  x: number
  y: number
  len: number
}

const WIND_TILE = 140
const WIND_STREAKS: StreakDef[] = [
  { x: 18, y: 20, len: 34 },
  { x: 62, y: 78, len: 26 },
  { x: 104, y: 36, len: 40 },
  { x: 128, y: 100, len: 22 },
]
const CURRENT_TILE = 180
const CURRENT_STREAKS: StreakDef[] = [
  { x: 40, y: 50, len: 36 },
  { x: 130, y: 120, len: 30 },
]

interface StreaksProps {
  id: string
  streaks: StreakDef[]
  color: string
  opacity: number
  dashed?: boolean
}

/** Faint streaks in pattern space flowing "up" (towards y = 0): bright head, fading tail. */
function Streaks({ id, streaks, color, opacity, dashed }: StreaksProps) {
  return (
    <>
      {streaks.map((s, i) => (
        <linearGradient key={`g${i}`} id={`${id}-${i}`} gradientUnits="userSpaceOnUse" x1={s.x} y1={s.y + s.len} x2={s.x} y2={s.y}>
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor={color} stopOpacity={opacity} />
        </linearGradient>
      ))}
      {streaks.map((s, i) => (
        <line
          key={`l${i}`}
          x1={s.x}
          y1={s.y + s.len}
          x2={s.x}
          y2={s.y}
          stroke={`url(#${id}-${i})`}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeDasharray={dashed ? '2 4' : undefined}
        />
      ))}
    </>
  )
}

/**
 * Subtle animated wind streaks (and dashed current streaks) drifting where the wind blows TO.
 * Conditions are uniform and the map is north-up, so screen bearings equal compass bearings.
 */
export function FlowField({ env }: { env: Environment }) {
  const id = useId().replace(/:/g, '')
  const windTo = (env.windFromDeg + 180) % 360
  const windDur = `${Math.max(2.5, 14 - env.windSpeedKn * 0.5).toFixed(1)}s`
  const currentDur = `${Math.max(4, 14 - env.currentSpeedKn * 3).toFixed(1)}s`

  return (
    <svg className="pointer-events-none absolute inset-0 z-[450] h-full w-full" aria-hidden>
      <defs>
        <pattern id={`${id}w`} width={WIND_TILE} height={WIND_TILE} patternUnits="userSpaceOnUse" patternTransform={`rotate(${windTo})`}>
          {!reducedMotion && <animate attributeName="y" from="0" to={-WIND_TILE} dur={windDur} repeatCount="indefinite" />}
          <Streaks id={`${id}wg`} streaks={WIND_STREAKS} color="#ffffff" opacity={0.85} />
        </pattern>
        <pattern id={`${id}c`} width={CURRENT_TILE} height={CURRENT_TILE} patternUnits="userSpaceOnUse" patternTransform={`rotate(${env.currentSetDeg})`}>
          {!reducedMotion && <animate attributeName="y" from="0" to={-CURRENT_TILE} dur={currentDur} repeatCount="indefinite" />}
          <Streaks id={`${id}cg`} streaks={CURRENT_STREAKS} color="#0369a1" opacity={0.55} dashed />
        </pattern>
      </defs>
      {env.windSpeedKn > 0 && <rect width="100%" height="100%" fill={`url(#${id}w)`} />}
      {env.currentSpeedKn > 0 && <rect width="100%" height="100%" fill={`url(#${id}c)`} />}
    </svg>
  )
}
