import { describe, expect, it } from 'vitest'
import { en } from '../../i18n/en'
import { nl } from '../../i18n/nl'
import { tr } from '../../i18n/tr'
import { dayShapes, lightPictures, rowScenarios, soundSignals } from './data'
import { decide } from './rules'

describe('COLREG right-of-way scenarios', () => {
  for (const s of rowScenarios) {
    it(`${s.id} matches the rule engine`, () => {
      expect(decide(s)).toBe(s.answer)
    })
  }

  it('cover every answer type and are unique', () => {
    expect(new Set(rowScenarios.map((s) => s.answer))).toEqual(new Set(['giveWay', 'standOn', 'bothStarboard']))
    expect(new Set(rowScenarios.map((s) => s.id)).size).toBe(rowScenarios.length)
  })
})

describe('COLREG translations', () => {
  it('exist for every scenario, light, shape and signal', () => {
    const keys = [
      ...rowScenarios.flatMap((s) => [`cr.s.${s.id}.q`, `cr.s.${s.id}.why`]),
      ...lightPictures.map((l) => `cr.l.${l.id}`),
      ...dayShapes.map((d) => `cr.d.${d.id}`),
      ...soundSignals.map((s) => `cr.snd.${s.id}`),
    ]
    for (const dict of [en, nl, tr]) for (const k of keys) expect(dict[k as keyof typeof en], k).toBeTruthy()
  })
})
