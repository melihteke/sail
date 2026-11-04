import { describe, expect, it } from 'vitest'
import { en } from '../../i18n/en'
import { nl } from '../../i18n/nl'
import { tr } from '../../i18n/tr'
import { approachQuality, firstActions, maneuvers, samplePath } from './maneuvers'

describe('MOB maneuvers', () => {
  it('steps are ordered and inside the path', () => {
    for (const m of maneuvers) {
      for (let i = 1; i < m.steps.length; i++) expect(m.steps[i].at).toBeGreaterThan(m.steps[i - 1].at)
      expect(m.steps[m.steps.length - 1].at).toBeLessThan(m.path.length)
    }
  })

  it('every maneuver ends close to the person, approaching from downwind', () => {
    for (const m of maneuvers) {
      const end = m.path[m.path.length - 1]
      expect(Math.hypot(end.x - m.mob.x, end.y - m.mob.y), m.id).toBeLessThan(55)
      if (m.id !== 'lifesling') expect(end.y, m.id).toBeGreaterThan(m.mob.y)
    }
  })

  it('samples positions along the path', () => {
    const m = maneuvers[0]
    expect(samplePath(m.path, 0).pos).toEqual(m.path[0])
    expect(samplePath(m.path, 1).pos.x).toBeCloseTo(m.path[m.path.length - 1].x)
    expect(samplePath(m.path, 0.01).heading).toBeCloseTo(90, 0)
  })

  it('rates approach angles', () => {
    expect(approachQuality(20)).toBe('tooHigh')
    expect(approachQuality(60)).toBe('good')
    expect(approachQuality(95)).toBe('beam')
    expect(approachQuality(150)).toBe('downwind')
  })

  it('has translations for all steps', () => {
    const keys = [...maneuvers.flatMap((m) => [`mob.m.${m.id}`, `mob.m.${m.id}.desc`, ...m.steps.map((s) => `mob.step.${s.key}`)]), ...firstActions.map((a) => `mob.step.${a}`)]
    for (const d of [en, nl, tr]) for (const k of keys) expect(d[k as keyof typeof en], k).toBeTruthy()
  })
})
