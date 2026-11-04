import { sailboat } from '../../boats/sailboat'
import type { Environment } from '../../core/environment'
import { LocalProjection, type LatLon } from '../../core/geo'
import type { LegResult } from '../../core/leg'
import { optimalRoute } from '../../core/optimal'
import { evaluateRoute, type EvaluatedRoute, type Maneuver } from '../../core/route'
import { formatDuration } from '../../core/units'

export const NM = 1852

export interface PlanRow {
  index: number
  from: string
  to: string
  leg: LegResult
  distanceNm: number
  /** Seconds from departure at the start of the leg (after any maneuver at its start). */
  startS: number
  endS: number
  maneuver?: Maneuver
}

export interface Plan {
  route: EvaluatedRoute
  rows: PlanRow[]
  totalNm: number
  totalS: number
}

export function pointName(i: number, count: number): string {
  if (i === 0) return 'A'
  if (i === count - 1) return 'B'
  return `WP${i}`
}

export function computePlan(start: LatLon, waypoints: LatLon[], end: LatLon, env: Environment): Plan {
  const proj = new LocalProjection(start)
  const pts = [start, ...waypoints, end].map((p) => proj.toLocal(p))
  const route = evaluateRoute(pts, env, sailboat)
  let t = 0
  const rows: PlanRow[] = route.legs.map((leg, i) => {
    const maneuver = route.maneuvers.find((m) => m.pointIndex === i)
    if (maneuver) t += maneuver.penaltyS
    const startS = t
    if (leg.ok) t += leg.timeS
    return {
      index: i,
      from: pointName(i, pts.length),
      to: pointName(i + 1, pts.length),
      leg,
      distanceNm: leg.distanceM / NM,
      startS,
      endS: t,
      maneuver,
    }
  })
  return { route, rows, totalNm: route.distanceM / NM, totalS: route.totalTimeS }
}

/** Interior waypoints of the fastest route (direct or one tack/gybe). */
export function suggestWaypoints(start: LatLon, end: LatLon, env: Environment): LatLon[] | null {
  const proj = new LocalProjection(start)
  const r = optimalRoute(proj.toLocal(start), proj.toLocal(end), env, sailboat)
  if (!r) return null
  return r.points.slice(1, -1).map((p) => proj.toLatLon(p))
}

const pad3 = (d: number) => `${Math.round(((d % 360) + 360) % 360)}`.padStart(3, '0')

export function clock(departure: Date, s: number): string {
  const d = new Date(departure.getTime() + s * 1000)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

/** Plain-text passage plan, e.g. for the logbook or a message to the crew. */
export function planToText(plan: Plan, env: Environment, departure: Date, title: string): string {
  const lines = [
    title,
    `Wind ${pad3(env.windFromDeg)}° ${env.windSpeedKn} kn · Current ${pad3(env.currentSetDeg)}° ${env.currentSpeedKn} kn`,
    `Departure ${clock(departure, 0)}`,
    '',
    'Leg      Dist   COG   HDG   TWA     SOG   Time    ETA',
  ]
  for (const r of plan.rows) {
    const name = `${r.from}-${r.to}`.padEnd(8)
    if (!r.leg.ok) {
      lines.push(`${name} ${r.distanceNm.toFixed(1).padStart(5)}  ${pad3(r.leg.courseDeg)}   not sailable (${r.leg.reason})`)
      continue
    }
    lines.push(
      `${name} ${r.distanceNm.toFixed(1).padStart(5)}  ${pad3(r.leg.courseDeg)}   ${pad3(r.leg.headingDeg)}   ${Math.abs(Math.round(r.leg.twa)).toString().padStart(3)}${r.leg.tack === 'port' ? 'P' : 'S'}  ${r.leg.sogKn.toFixed(1).padStart(5)}  ${formatDuration(r.leg.timeS).padStart(7)}  ${clock(departure, r.endS)}`,
    )
  }
  lines.push('', `Total ${plan.totalNm.toFixed(1)} nm · ${formatDuration(plan.totalS)} · ETA ${clock(departure, plan.totalS)}`)
  return lines.join('\n')
}
