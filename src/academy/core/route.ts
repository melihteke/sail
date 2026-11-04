import type { BoatProfile } from '../boats/sailboat'
import type { Environment } from './environment'
import { solveLeg, type LegResult, type LegSolution } from './leg'
import { norm180, norm360 } from './units'
import { lerp, type Vec2 } from './vec'

export type ManeuverType = 'tack' | 'gybe'

export interface Maneuver {
  /** Index of the waypoint (in the route points) where the maneuver happens. */
  pointIndex: number
  type: ManeuverType
  penaltyS: number
}

export interface EvaluatedRoute {
  points: Vec2[]
  legs: LegResult[]
  maneuvers: Maneuver[]
  feasible: boolean
  distanceM: number
  sailingTimeS: number
  penaltyTimeS: number
  totalTimeS: number
}

/**
 * Classifies a heading change. Changing the side the wind comes from is a tack when the
 * (shortest) turn takes the bow through the wind, and a gybe when it takes the stern through it.
 */
export function classifyTurn(fromHeading: number, toHeading: number, windFromDeg: number): ManeuverType | null {
  const twa1 = norm180(windFromDeg - fromHeading)
  const twa2 = norm180(windFromDeg - toHeading)
  if (Math.sign(twa1) === Math.sign(twa2) || twa1 === 0 || twa2 === 0) return null
  const turn = norm180(toHeading - fromHeading)
  const rel = norm180(windFromDeg - fromHeading)
  const throughBow = turn >= 0 ? rel >= 0 && rel <= turn : rel <= 0 && rel >= turn
  return throughBow ? 'tack' : 'gybe'
}

export function maneuverPenalty(type: ManeuverType | null, boat: BoatProfile): number {
  if (type === 'tack') return boat.tackPenaltyS
  if (type === 'gybe') return boat.gybePenaltyS
  return 0
}

export function evaluateRoute(points: Vec2[], env: Environment, boat: BoatProfile): EvaluatedRoute {
  const legs: LegResult[] = []
  for (let i = 0; i < points.length - 1; i++) legs.push(solveLeg(points[i], points[i + 1], env, boat))

  const maneuvers: Maneuver[] = []
  for (let i = 1; i < legs.length; i++) {
    const a = legs[i - 1]
    const b = legs[i]
    if (!a.ok || !b.ok) continue
    const type = classifyTurn(a.headingDeg, b.headingDeg, env.windFromDeg)
    if (type) maneuvers.push({ pointIndex: i, type, penaltyS: maneuverPenalty(type, boat) })
  }

  const feasible = legs.length > 0 && legs.every((l) => l.ok)
  const sailingTimeS = legs.reduce((t, l) => t + (l.ok ? l.timeS : 0), 0)
  const penaltyTimeS = maneuvers.reduce((t, m) => t + m.penaltyS, 0)
  return {
    points,
    legs,
    maneuvers,
    feasible,
    distanceM: legs.reduce((d, l) => d + l.distanceM, 0),
    sailingTimeS,
    penaltyTimeS,
    totalTimeS: sailingTimeS + penaltyTimeS,
  }
}

export interface RouteSample {
  position: Vec2
  headingDeg: number
  legIndex: number
  maneuvering: boolean
  finished: boolean
}

/** Position of the boat at time t (s) along a feasible route. Maneuvers are shown as a turn on the spot. */
export function sampleRoute(route: EvaluatedRoute, t: number): RouteSample {
  const legs = route.legs.filter((l): l is LegSolution => l.ok)
  let remaining = Math.max(0, t)
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]
    const m = route.maneuvers.find((x) => x.pointIndex === i)
    if (m && i > 0) {
      if (remaining < m.penaltyS) {
        const prev = legs[i - 1].headingDeg
        // classifyTurn uses the shortest arc, so the animation follows the same arc.
        const turn = norm180(leg.headingDeg - prev)
        return {
          position: leg.from,
          headingDeg: norm360(prev + (turn * remaining) / m.penaltyS),
          legIndex: i,
          maneuvering: true,
          finished: false,
        }
      }
      remaining -= m.penaltyS
    }
    if (remaining < leg.timeS) {
      return {
        position: lerp(leg.from, leg.to, remaining / leg.timeS),
        headingDeg: leg.headingDeg,
        legIndex: i,
        maneuvering: false,
        finished: false,
      }
    }
    remaining -= leg.timeS
  }
  const last = legs[legs.length - 1]
  return {
    position: last ? last.to : route.points[route.points.length - 1],
    headingDeg: last ? last.headingDeg : 0,
    legIndex: Math.max(0, legs.length - 1),
    maneuvering: false,
    finished: true,
  }
}
