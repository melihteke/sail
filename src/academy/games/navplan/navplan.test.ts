import { describe, expect, it } from 'vitest'
import { en } from '../../i18n/en'
import { nl } from '../../i18n/nl'
import { tr } from '../../i18n/tr'
import { computePlan, NM, planToText, suggestWaypoints } from './plan'
import { presets } from './presets'

describe('passage plan', () => {
  const env = { windFromDeg: 0, windSpeedKn: 12, currentSetDeg: 0, currentSpeedKn: 0 }
  const a = { lat: 52.7, lon: 5.3 }
  const b = { lat: 52.7, lon: 5.4 }

  it('computes legs, distances and cumulative times', () => {
    const p = computePlan(a, [{ lat: 52.75, lon: 5.35 }], b, env)
    expect(p.rows).toHaveLength(2)
    expect(p.rows[0].from).toBe('A')
    expect(p.rows[1].to).toBe('B')
    expect(p.totalNm).toBeCloseTo(p.route.distanceM / NM)
    expect(p.rows[1].endS).toBeCloseTo(p.totalS, 3)
    expect(p.rows[1].startS).toBeGreaterThanOrEqual(p.rows[0].endS)
  })

  it('flags legs into the wind and suggests a sailable route', () => {
    const north = { lat: 52.8, lon: 5.3 }
    expect(computePlan(a, [], north, env).rows[0].leg.ok).toBe(false)
    const wps = suggestWaypoints(a, north, env)!
    expect(wps).toHaveLength(1)
    expect(computePlan(a, wps, north, env).route.feasible).toBe(true)
  })

  it('exports a text plan', () => {
    const p = computePlan(a, [], b, env)
    const txt = planToText(p, env, new Date(2026, 5, 1, 10, 0), 'Test')
    expect(txt).toContain('A-B')
    expect(txt).toContain('ETA')
  })

  it('every preset is plannable and translated', () => {
    for (const pr of presets) {
      const wps = suggestWaypoints(pr.start, pr.end, pr.env)
      expect(wps, pr.id).not.toBeNull()
      for (const d of [en, nl, tr]) expect(d[`np.preset.${pr.id}` as keyof typeof en], pr.id).toBeTruthy()
    }
  })
})
