import { describe, expect, it } from 'vitest'
import { findLight, lightChars, lightState } from './lights'

const flashCount = (id: string) => findLight(id).phases.filter((p) => p.on).length

describe('light characteristics', () => {
  it('every pattern fills exactly one period', () => {
    for (const l of lightChars) {
      const sum = l.phases.reduce((s, p) => s + p.dur, 0)
      expect(sum, l.id).toBeCloseTo(l.period, 9)
      expect(l.phases.every((p) => p.dur > 0), l.id).toBe(true)
    }
  })

  it('has the right number of flashes per group', () => {
    expect(flashCount('fl2-w-5')).toBe(2)
    expect(flashCount('q3-w-10')).toBe(3)
    expect(flashCount('q9-w-15')).toBe(9)
    expect(flashCount('q6lfl-w-15')).toBe(7)
    expect(flashCount('fl21-r-10')).toBe(3)
    expect(flashCount('moa-w-6')).toBe(2)
  })

  it('Iso has equal light and dark, Oc more light than dark', () => {
    const iso = findLight('iso-w-4').phases
    expect(iso[0].dur).toBe(iso[1].dur)
    const oc = findLight('oc-w-5').phases
    expect(oc[0].on && oc[0].dur > oc[1].dur).toBe(true)
  })

  it('evaluates state over time and wraps around', () => {
    const l = findLight('fl-w-5')
    expect(lightState(l, 0.2).on).toBe(true)
    expect(lightState(l, 1).on).toBe(false)
    expect(lightState(l, 5.2).on).toBe(true)
    const al = findLight('al-buy-3')
    expect(lightState(al, 0.5).color).toBe('Bu')
    expect(lightState(al, 2).color).toBe('Y')
  })

  it('codes are unique', () => {
    expect(new Set(lightChars.map((l) => l.code)).size).toBe(lightChars.length)
  })
})
