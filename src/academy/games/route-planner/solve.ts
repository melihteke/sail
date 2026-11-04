import { sailboat } from '../../boats/sailboat'
import type { Environment } from '../../core/environment'
import { LocalProjection } from '../../core/geo'
import { optimalRouteAvoiding, optimalRouteViaMarks } from '../../core/optimal'
import { polylineHitsPolygon } from '../../core/polygon'
import { roundsMark } from '../../core/rounding'
import type { EvaluatedRoute } from '../../core/route'
import type { Vec2 } from '../../core/vec'
import type { Scenario } from './scenarios'

export interface LocalScenario {
  proj: LocalProjection
  start: Vec2
  finish: Vec2
  marks: { at: Vec2; side: 'port' | 'starboard' }[]
  land: Vec2[][]
}

export function localize(s: Scenario): LocalScenario {
  const proj = new LocalProjection(s.start)
  return {
    proj,
    start: proj.toLocal(s.start),
    finish: proj.toLocal(s.finish),
    marks: (s.marks ?? []).map((m) => ({ at: proj.toLocal(m.at), side: m.side })),
    land: (s.land ?? []).map((poly) => poly.map((p) => proj.toLocal(p))),
  }
}

export function scenarioOptimal(l: LocalScenario, env: Environment): EvaluatedRoute | null {
  return l.marks.length
    ? optimalRouteViaMarks(l.start, l.marks, l.finish, env, sailboat, l.land)
    : optimalRouteAvoiding(l.start, l.finish, env, sailboat, l.land)
}

/** Index of each mark (in order) that the route does NOT leave on the required side. */
export function marksMissed(l: LocalScenario, points: Vec2[]): number[] {
  return l.marks.flatMap((m, i) => (roundsMark(points, m.at, m.side) ? [] : [i]))
}

export function markRoundedCorrectly(l: LocalScenario, points: Vec2[]): boolean {
  return marksMissed(l, points).length === 0
}

/** Indices of the legs (from points[i] to points[i+1]) that cross land. */
export function legsOnLand(l: LocalScenario, points: Vec2[]): number[] {
  if (!l.land.length) return []
  const out: number[] = []
  for (let i = 0; i < points.length - 1; i++) {
    if (l.land.some((poly) => polylineHitsPolygon([points[i], points[i + 1]], poly))) out.push(i)
  }
  return out
}
