import type { BoatProfile } from '../boats/sailboat'
import { currentVector, pointOfSail, tackOf, trueWindAngle, type Environment, type PointOfSail, type Tack } from './environment'
import { boatSpeedKn, minTwa } from './polar'
import { knotsToMs, msToKnots } from './units'
import { add, bearingOf, cross, dot, fromBearing, length, scale, sub, type Vec2 } from './vec'

export interface LegSolution {
  ok: true
  from: Vec2
  to: Vec2
  distanceM: number
  /** Desired course over ground (bearing from -> to). */
  courseDeg: number
  /** Heading the boat must steer to make good the course, allowing for current. */
  headingDeg: number
  twa: number
  tack: Tack
  pointOfSail: PointOfSail
  stwKn: number
  sogKn: number
  timeS: number
}

export type LegFailureReason = 'zeroLength' | 'noGo' | 'current'

export interface LegFailure {
  ok: false
  from: Vec2
  to: Vec2
  distanceM: number
  courseDeg: number
  reason: LegFailureReason
}

export type LegResult = LegSolution | LegFailure

const HEADING_STEP = 0.5

/** Boat velocity over ground (m/s) for a heading; null when the heading is in the no-go zone. */
export function groundVelocity(headingDeg: number, env: Environment, boat: BoatProfile): Vec2 | null {
  const stw = boatSpeedKn(boat.polar, trueWindAngle(headingDeg, env), env.windSpeedKn)
  if (stw <= 0) return null
  return add(fromBearing(headingDeg, knotsToMs(stw)), currentVector(env))
}

/**
 * Finds the heading that makes good the straight course from -> to (current triangle),
 * choosing the fastest solution if there are several.
 */
export function solveLeg(from: Vec2, to: Vec2, env: Environment, boat: BoatProfile): LegResult {
  const delta = sub(to, from)
  const distanceM = length(delta)
  const courseDeg = bearingOf(delta)
  const fail = (reason: LegFailureReason): LegFailure => ({ ok: false, from, to, distanceM, courseDeg, reason })
  if (distanceM < 1) return fail('zeroLength')

  const dir = scale(delta, 1 / distanceM)
  const crossAt = (h: number): number | null => {
    const g = groundVelocity(h, env, boat)
    return g ? cross(dir, g) : null
  }

  let bestHeading: number | null = null
  let bestSog = 0
  const consider = (h: number) => {
    const g = groundVelocity(h, env, boat)
    if (!g) return
    const along = dot(dir, g)
    if (along > bestSog + 1e-9) {
      bestSog = along
      bestHeading = h
    }
  }

  // Regular grid plus the exact no-go edges, so optima that sit on the edge are not missed.
  const edge = minTwa(boat.polar) + 1e-7
  const headings = [env.windFromDeg - edge, env.windFromDeg + edge].map((h) => ((h % 360) + 360) % 360)
  for (let i = 0; i < 360 / HEADING_STEP; i++) headings.push(i * HEADING_STEP)
  headings.sort((a, b) => a - b)
  headings.push(headings[0] + 360)

  let prevH = headings[0]
  let prevF = crossAt(prevH)
  for (let i = 1; i < headings.length; i++) {
    const h = headings[i]
    const f = crossAt(h)
    if (prevF !== null && Math.abs(prevF) < 1e-7) consider(prevH)
    if (prevF !== null && f !== null) {
      if (Math.sign(prevF) !== Math.sign(f) && f !== 0 && prevF !== 0) {
        let lo = prevH
        let hi = h
        let flo = prevF
        for (let k = 0; k < 40; k++) {
          const mid = (lo + hi) / 2
          const fm = crossAt(mid) ?? 0
          if (Math.sign(fm) === Math.sign(flo)) {
            lo = mid
            flo = fm
          } else hi = mid
        }
        consider((lo + hi) / 2)
      }
    }
    prevH = h
    prevF = f
  }

  if (bestHeading === null) {
    const twaCourse = Math.abs(trueWindAngle(courseDeg, env))
    return fail(twaCourse < minTwa(boat.polar) ? 'noGo' : 'current')
  }

  const headingDeg = (bestHeading as number) % 360
  const twa = trueWindAngle(headingDeg, env)
  const stwKn = boatSpeedKn(boat.polar, twa, env.windSpeedKn)
  return {
    ok: true,
    from,
    to,
    distanceM,
    courseDeg,
    headingDeg,
    twa,
    tack: tackOf(twa),
    pointOfSail: pointOfSail(Math.abs(twa), minTwa(boat.polar)),
    stwKn,
    sogKn: msToKnots(bestSog),
    timeS: distanceM / bestSog,
  }
}
