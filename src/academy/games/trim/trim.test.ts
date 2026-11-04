import { describe, expect, it } from 'vitest'
import { apparentWind, evaluateTrim, optimalBoom, telltales } from './trimModel'

describe('trim model', () => {
  it('apparent wind comes further forward than true wind when sailing', () => {
    const a = apparentWind(90, 12, 5.5)
    expect(a.awa).toBeLessThan(90)
    expect(a.aws).toBeGreaterThan(12)
    const run = apparentWind(180, 12, 5)
    expect(run.awa).toBeCloseTo(180)
    expect(run.aws).toBeCloseTo(7)
  })

  it('finds a good trim at the optimal boom angle', () => {
    for (const twa of [45, 60, 90, 120]) {
      const r0 = evaluateTrim(twa, 12, 0)
      const r = evaluateTrim(twa, 12, r0.optimalBoom)
      expect(r.state, String(twa)).toBe('good')
      expect(r.efficiency).toBeGreaterThan(0.95)
    }
  })

  it('detects luffing and stalling', () => {
    const r = evaluateTrim(90, 12, 0)
    expect(evaluateTrim(90, 12, r.optimalBoom + 25).state).toBe('luffing')
    expect(evaluateTrim(90, 12, Math.max(0, r.optimalBoom - 25)).state).toBe('stalled')
    expect(evaluateTrim(175, 12, 85).state).toBe('running')
  })

  it('maps states to telltales', () => {
    expect(telltales('luffing').windward).toBe('lift')
    expect(telltales('stalled').leeward).toBe('flutter')
    expect(telltales('good')).toEqual({ windward: 'stream', leeward: 'stream' })
    expect(optimalBoom(200)).toBe(85)
  })
})
