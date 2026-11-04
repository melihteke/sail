import type { BoatProfile } from '../boats/sailboat'
import type { Environment } from './environment'
import { groundVelocity } from './leg'
import { bestBeat, bestRun } from './polar'
import { bearingOf } from './vec'

/**
 * Directions (compass bearings) of the laylines drawn away from a mark. A boat sailing at the
 * best VMG angle on either tack reaches the mark along one of these lines. Current is included,
 * so the lines follow the course over ground rather than the heading.
 */
export function laylineBearings(env: Environment, boat: BoatProfile, upwind: boolean): number[] {
  const twa = upwind ? bestBeat(boat.polar, env.windSpeedKn).twa : bestRun(boat.polar, env.windSpeedKn).twa
  const result: number[] = []
  for (const h of [env.windFromDeg - twa, env.windFromDeg + twa]) {
    const g = groundVelocity(h, env, boat)
    if (g) result.push((bearingOf(g) + 180) % 360)
  }
  return result
}
