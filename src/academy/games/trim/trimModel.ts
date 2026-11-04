import { sailboat } from '../../boats/sailboat'
import { boatSpeedKn } from '../../core/polar'
import { toDeg, toRad } from '../../core/units'

export interface ApparentWind {
  awa: number
  aws: number
}

/** Apparent wind for a boat sailing at `bs` knots with true wind `tws` at angle `twa` (0..180). */
export function apparentWind(twa: number, tws: number, bs: number): ApparentWind {
  // Boat frame: bow along +y. Wind velocity (blowing TO) from angle twa, plus headwind from boat speed.
  const vx = -tws * Math.sin(toRad(twa))
  const vy = -tws * Math.cos(toRad(twa)) - bs
  return { awa: toDeg(Math.atan2(-vx, -vy)), aws: Math.hypot(vx, vy) }
}

/** Ideal angle of attack of the mainsail chord to the apparent wind (degrees). */
export const IDEAL_ATTACK = 18
export const MAX_BOOM = 85

export function optimalBoom(awa: number): number {
  return Math.max(5, Math.min(MAX_BOOM, awa - IDEAL_ATTACK))
}

export type TrimState = 'luffing' | 'good' | 'stalled' | 'running'

export interface TrimResult {
  awa: number
  aws: number
  attack: number
  state: TrimState
  /** 0..1, how much of the possible drive the sail produces. */
  efficiency: number
  targetKn: number
  speedKn: number
  optimalBoom: number
}

/** Simplified sail trim model for teaching: angle of attack decides luffing / good / stalled. */
export function evaluateTrim(twa: number, tws: number, boomDeg: number): TrimResult {
  const targetKn = boatSpeedKn(sailboat.polar, twa, tws)
  const { awa, aws } = apparentWind(twa, tws, targetKn)
  const opt = optimalBoom(awa)
  const attack = awa - boomDeg
  let state: TrimState
  let efficiency: number
  if (opt >= MAX_BOOM - 0.5 && awa > 120) {
    // Running: the sail works by drag; ease it as far as it goes.
    state = boomDeg >= MAX_BOOM - 10 ? 'running' : 'stalled'
    efficiency = Math.max(0.5, 1 - (MAX_BOOM - boomDeg) / 90)
  } else if (attack < 10) {
    state = 'luffing'
    efficiency = Math.max(0.15, attack / 10) * 0.85
  } else if (attack <= 26) {
    state = 'good'
    efficiency = 1 - Math.abs(attack - IDEAL_ATTACK) / 60
  } else {
    state = 'stalled'
    efficiency = Math.max(0.5, 1 - (attack - 26) / 40)
  }
  return { awa, aws, attack, state, efficiency, targetKn, speedKn: targetKn * efficiency, optimalBoom: opt }
}

/** Telltale behaviour on the jib luff for a trim state. */
export function telltales(state: TrimState): { windward: 'stream' | 'flutter' | 'lift'; leeward: 'stream' | 'flutter' | 'droop' } {
  switch (state) {
    case 'luffing':
      return { windward: 'lift', leeward: 'stream' }
    case 'stalled':
      return { windward: 'stream', leeward: 'flutter' }
    case 'running':
      return { windward: 'stream', leeward: 'droop' }
    default:
      return { windward: 'stream', leeward: 'stream' }
  }
}
