import { describe, expect, it } from 'vitest'
import { sailboat } from '../boats/sailboat'
import type { Environment } from './environment'
import { LocalProjection } from './geo'
import { groundVelocity, solveLeg } from './leg'
import { optimalRoute } from './optimal'
import { bestBeat, bestRun, boatSpeedKn } from './polar'
import { classifyTurn, evaluateRoute, sampleRoute } from './route'
import { knotsToMs, norm180, norm360, toRad } from './units'
import { bearingOf, cross, fromBearing, length, sub, vec } from './vec'

const calm: Environment = { windFromDeg: 0, windSpeedKn: 10, currentSetDeg: 0, currentSpeedKn: 0 }

describe('units and vectors', () => {
  it('normalises angles', () => {
    expect(norm360(-10)).toBe(350)
    expect(norm360(725)).toBe(5)
    expect(norm180(190)).toBe(-170)
    expect(norm180(180)).toBe(180)
  })

  it('round-trips bearings', () => {
    for (const b of [0, 45, 90, 135, 222, 359]) expect(bearingOf(fromBearing(b))).toBeCloseTo(b, 6)
    expect(fromBearing(90).x).toBeCloseTo(1)
    expect(fromBearing(0).y).toBeCloseTo(1)
  })
})

describe('LocalProjection', () => {
  it('round-trips and measures in metres', () => {
    const p = new LocalProjection({ lat: 52.25, lon: 4.73 })
    const v = p.toLocal({ lat: 52.259, lon: 4.73 })
    expect(v.y).toBeCloseTo(1000.75, 0)
    const back = p.toLatLon(p.toLocal({ lat: 52.26, lon: 4.75 }))
    expect(back.lat).toBeCloseTo(52.26, 9)
    expect(back.lon).toBeCloseTo(4.75, 9)
  })
})

describe('polar', () => {
  it('is zero in the no-go zone and interpolates in the table', () => {
    expect(boatSpeedKn(sailboat.polar, 30, 10)).toBe(0)
    expect(boatSpeedKn(sailboat.polar, 90, 10)).toBeCloseTo(5.5)
    expect(boatSpeedKn(sailboat.polar, 90, 11)).toBeCloseTo(5.65)
    expect(boatSpeedKn(sailboat.polar, 90, 2)).toBeCloseTo(3.5 / 2)
    expect(boatSpeedKn(sailboat.polar, -90, 10)).toBeCloseTo(5.5)
  })

  it('finds sensible VMG angles', () => {
    const beat = bestBeat(sailboat.polar, 10)
    expect(beat.twa).toBeGreaterThanOrEqual(40)
    expect(beat.twa).toBeLessThan(60)
    const run = bestRun(sailboat.polar, 6)
    expect(run.twa).toBeGreaterThan(130)
    expect(run.twa).toBeLessThan(180)
  })
})

describe('solveLeg', () => {
  it('steers straight along the course without current', () => {
    const leg = solveLeg(vec(0, 0), vec(1000, 0), calm, sailboat)
    expect(leg.ok).toBe(true)
    if (!leg.ok) return
    expect(leg.headingDeg).toBeCloseTo(90, 3)
    expect(leg.tack).toBe('port')
    expect(leg.pointOfSail).toBe('beamReach')
    expect(leg.sogKn).toBeCloseTo(5.5, 3)
    expect(leg.timeS).toBeCloseTo(1000 / knotsToMs(5.5), 1)
  })

  it('rejects a leg straight into the wind', () => {
    const leg = solveLeg(vec(0, 0), vec(0, 1000), calm, sailboat)
    expect(leg.ok).toBe(false)
    if (!leg.ok) expect(leg.reason).toBe('noGo')
  })

  it('crabs into a cross current and keeps the ground track', () => {
    const env: Environment = { ...calm, windFromDeg: 90, currentSetDeg: 90, currentSpeedKn: 1 }
    const leg = solveLeg(vec(0, 0), vec(0, 2000), env, sailboat)
    expect(leg.ok).toBe(true)
    if (!leg.ok) return
    expect(leg.headingDeg).not.toBeCloseTo(0, 0)
    expect(norm180(leg.headingDeg)).toBeLessThan(0)
    const g = groundVelocity(leg.headingDeg, env, sailboat)!
    expect(Math.abs(cross(fromBearing(0), g))).toBeLessThan(1e-6)
  })

  it('fails when the current is stronger than the boat', () => {
    const env: Environment = { windFromDeg: 90, windSpeedKn: 4, currentSetDeg: 180, currentSpeedKn: 5 }
    const leg = solveLeg(vec(0, 0), vec(0, 1000), env, sailboat)
    expect(leg.ok).toBe(false)
    if (!leg.ok) expect(leg.reason).toBe('current')
  })
})

describe('classifyTurn', () => {
  it('detects tacks, gybes and simple course changes', () => {
    expect(classifyTurn(315, 45, 0)).toBe('tack')
    expect(classifyTurn(135, 225, 0)).toBe('gybe')
    expect(classifyTurn(60, 120, 0)).toBeNull()
    expect(classifyTurn(260, 100, 0)).toBe('gybe')
  })
})

describe('evaluateRoute and sampleRoute', () => {
  it('adds maneuver penalties and samples positions', () => {
    const pts = [vec(0, 0), vec(-700, 700), vec(0, 1400)]
    const r = evaluateRoute(pts, calm, sailboat)
    expect(r.feasible).toBe(true)
    expect(r.maneuvers).toHaveLength(1)
    expect(r.maneuvers[0].type).toBe('tack')
    expect(r.totalTimeS).toBeCloseTo(r.sailingTimeS + sailboat.tackPenaltyS)
    const leg0 = r.legs[0]
    if (!leg0.ok) throw new Error('leg should be ok')
    const mid = sampleRoute(r, leg0.timeS / 2)
    expect(mid.position.x).toBeCloseTo(-350, 0)
    const turning = sampleRoute(r, leg0.timeS + sailboat.tackPenaltyS / 2)
    expect(turning.maneuvering).toBe(true)
    expect(sampleRoute(r, r.totalTimeS + 1).finished).toBe(true)
  })
})

describe('optimalRoute', () => {
  it('sails direct when the mark can be fetched', () => {
    const r = optimalRoute(vec(0, 0), vec(1500, 0), calm, sailboat)!
    expect(r.points).toHaveLength(2)
  })

  it('beats to a windward mark with one tack at the best VMG angle', () => {
    const d = 2000
    const r = optimalRoute(vec(0, 0), vec(0, d), calm, sailboat)!
    expect(r.points).toHaveLength(3)
    expect(r.maneuvers[0].type).toBe('tack')
    const beat = bestBeat(sailboat.polar, calm.windSpeedKn)
    const ideal = d / knotsToMs(beat.speedKn * Math.cos(toRad(beat.twa))) + sailboat.tackPenaltyS
    expect(r.totalTimeS).toBeLessThanOrEqual(ideal + 1)
    expect(r.totalTimeS).toBeGreaterThan(ideal - 10)
  })

  it('handles an optimum that sits exactly on the no-go edge', () => {
    const env12: Environment = { ...calm, windSpeedKn: 12 }
    expect(bestBeat(sailboat.polar, 12).twa).toBe(40)
    const r = optimalRoute(vec(0, 0), vec(0, 1500), env12, sailboat)
    expect(r).not.toBeNull()
    expect(r!.feasible).toBe(true)
  })

  it('is never slower than a hand-made route', () => {
    const env: Environment = { windFromDeg: 300, windSpeedKn: 12, currentSetDeg: 80, currentSpeedKn: 1.2 }
    const start = vec(0, 0)
    const finish = vec(-800, 1800)
    const best = optimalRoute(start, finish, env, sailboat)!
    const tries = [
      [start, vec(-1400, 600), finish],
      [start, vec(400, 900), finish],
      [start, vec(-900, 300), vec(-200, 1000), vec(-1000, 1500), finish],
    ]
    for (const pts of tries) {
      const r = evaluateRoute(pts, env, sailboat)
      if (r.feasible) expect(best.totalTimeS).toBeLessThanOrEqual(r.totalTimeS + 1e-6)
    }
  })

  it('is deterministic', () => {
    const env: Environment = { windFromDeg: 225, windSpeedKn: 8, currentSetDeg: 10, currentSpeedKn: 0.8 }
    const a = optimalRoute(vec(0, 0), vec(-1200, -1300), env, sailboat)!
    const b = optimalRoute(vec(0, 0), vec(-1200, -1300), env, sailboat)!
    expect(a.totalTimeS).toBe(b.totalTimeS)
    expect(length(sub(a.points[1], b.points[1]))).toBe(0)
  })
})
