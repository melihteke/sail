import { describe, expect, it } from 'vitest'
import { sailboat } from '../../boats/sailboat'
import type { Environment } from '../../core/environment'
import { optimalRoute } from '../../core/optimal'
import { evaluateRoute } from '../../core/route'
import { vec } from '../../core/vec'
import { analyzeRoute, scoreFor, starsFor } from './analysis'
import { scenarios } from './scenarios'
import { legsOnLand, localize, markRoundedCorrectly, scenarioOptimal } from './solve'

const env: Environment = { windFromDeg: 0, windSpeedKn: 10, currentSetDeg: 0, currentSpeedKn: 0 }

describe('scoring', () => {
  it('maps efficiency to score and stars', () => {
    expect(scoreFor(1)).toBe(1000)
    expect(scoreFor(1.2)).toBe(1000)
    expect(scoreFor(0.9)).toBe(810)
    expect(starsFor(0.99)).toBe(3)
    expect(starsFor(0.5)).toBe(0)
  })
})

describe('analyzeRoute', () => {
  const start = vec(0, 0)
  const finish = vec(0, 2000)
  const optimal = optimalRoute(start, finish, env, sailboat)!

  it('rewards the optimal route', () => {
    const a = analyzeRoute(optimal, optimal, env, sailboat)
    expect(a.score).toBe(1000)
    expect(a.feedback[0].key).toBe('fb.perfect')
  })

  it('flags extra tacks and wide angles', () => {
    const zigzag = evaluateRoute(
      [start, vec(-600, 300), vec(600, 600), vec(-600, 900), vec(600, 1200), vec(-500, 1500), finish],
      env,
      sailboat,
    )
    expect(zigzag.feasible).toBe(true)
    const a = analyzeRoute(zigzag, optimal, env, sailboat)
    expect(a.score).toBeLessThan(1000)
    const keys = a.feedback.map((f) => f.key)
    expect(keys).toContain('fb.extraManeuvers')
    expect(keys).toContain('fb.tooWide')
  })

  it('reports current impact', () => {
    const withCurrent: Environment = { ...env, windFromDeg: 90, currentSetDeg: 0, currentSpeedKn: 1 }
    const r = evaluateRoute([start, finish], withCurrent, sailboat)
    const a = analyzeRoute(r, r, withCurrent, sailboat)
    expect(a.feedback.map((f) => f.key)).toContain('fb.currentHelped')
  })
})

describe('scenarios', () => {
  it('all have a sailable optimal route that respects the marks and stays off land', () => {
    for (const s of scenarios) {
      const l = localize(s)
      const r = scenarioOptimal(l, s.env)
      expect(r, s.id).not.toBeNull()
      expect(markRoundedCorrectly(l, r!.points), s.id).toBe(true)
      expect(legsOnLand(l, r!.points), s.id).toEqual([])
    }
  })

  it('marks in the new open-water passages force a detour from the straight line', () => {
    for (const id of ['peniche-berlenga', 'tarifa-tanger', 'granville-chausey', 'barcelona-soller', 'antibes-calvi']) {
      const l = localize(scenarios.find((s) => s.id === id)!)
      expect(markRoundedCorrectly(l, [l.start, l.finish]), id).toBe(false)
    }
  })

  it('island scenarios cannot be sailed straight through the island', () => {
    for (const s of scenarios.filter((x) => x.land?.length)) {
      const l = localize(s)
      expect(legsOnLand(l, [l.start, l.finish]).length, s.id).toBeGreaterThan(0)
    }
  })
})
