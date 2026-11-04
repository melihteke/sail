import { knotsToMs, norm180 } from './units'
import { fromBearing, type Vec2 } from './vec'

/**
 * Uniform sailing conditions.
 * - windFromDeg: meteorological convention, the direction the wind blows FROM.
 * - currentSetDeg: nautical convention, the direction the current flows TOWARDS ("set").
 */
export interface Environment {
  windFromDeg: number
  windSpeedKn: number
  currentSetDeg: number
  currentSpeedKn: number
}

export type Tack = 'port' | 'starboard' | 'headToWind'

export type PointOfSail = 'noGo' | 'closeHauled' | 'closeReach' | 'beamReach' | 'broadReach' | 'running'

export function currentVector(env: Environment): Vec2 {
  return fromBearing(env.currentSetDeg, knotsToMs(env.currentSpeedKn))
}

/**
 * Signed true wind angle relative to the bow, in (-180, 180].
 * Positive: wind comes over the starboard side (starboard tack).
 * The wind is treated as wind over the water (current-induced wind is ignored).
 */
export function trueWindAngle(headingDeg: number, env: Environment): number {
  return norm180(env.windFromDeg - headingDeg)
}

export function tackOf(twa: number): Tack {
  if (twa === 0) return 'headToWind'
  return twa > 0 ? 'starboard' : 'port'
}

export function pointOfSail(twaAbs: number, minTwa: number): PointOfSail {
  if (twaAbs < minTwa) return 'noGo'
  if (twaAbs < 60) return 'closeHauled'
  if (twaAbs < 80) return 'closeReach'
  if (twaAbs < 105) return 'beamReach'
  if (twaAbs < 155) return 'broadReach'
  return 'running'
}
