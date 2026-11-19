import { describe, expect, it } from 'vitest'
import { QUIZ_CHARTS } from './charts'
import { chartFacts, trsAction } from './drills'
import { DEP_HOURS, PRESET_ROUTES, SEASONS, beaufort, compass8, depState, legOnLand, sailRoute, spacingToKn, type ZoneId } from './field'
import { BAND_IDS, CLOUD_IDS, SYMBOL_IDS, TERM_IDS, W_CHAPTERS, weatherTexts, type WBlock } from './text'
import { lowBearing, parseSample, seaBreeze } from './widgets'

const shape = (b: WBlock): string => {
  if ('ww' in b) return `ww:${b.ww}`
  if ('wd' in b) return `wd:${b.wd}`
  const k = Object.keys(b)[0]
  if (k === 'table') return `table:${(b as { table: { rows: unknown[] } }).table.rows.length}`
  if (k === 'list' || k === 'steps') return `${k}:${(b as Record<string, unknown[]>)[k].length}`
  return k
}

describe('weather texts', () => {
  const en = weatherTexts.en
  it('have the same structure in every language', () => {
    for (const lang of ['tr', 'nl'] as const) {
      const o = weatherTexts[lang]
      for (const ch of W_CHAPTERS) {
        expect(o.chapters[ch].sections.map((s) => s.blocks.map(shape)), `${lang}/${ch}`).toEqual(en.chapters[ch].sections.map((s) => s.blocks.map(shape)))
      }
      expect(o.check.map((q) => [q.options.length, q.answer])).toEqual(en.check.map((q) => [q.options.length, q.answer]))
      expect(o.ui.drills.order.cards).toHaveLength(en.ui.drills.order.cards.length)
      expect(o.ui.drills.gonogo.items.map((q) => [q.options.length, q.answer])).toEqual(en.ui.drills.gonogo.items.map((q) => [q.options.length, q.answer]))
      expect(o.ui.beaufort.names).toHaveLength(13)
      expect(o.ui.compass).toHaveLength(8)
    }
  })
  it('define every band, cloud, symbol and forecast term', () => {
    for (const lang of ['en', 'tr', 'nl'] as const) {
      const u = weatherTexts[lang].ui
      for (const id of BAND_IDS) expect(u.globe.bands[id].text).toBeTruthy()
      for (const id of CLOUD_IDS) expect(u.clouds.info[id].text).toBeTruthy()
      for (const id of SYMBOL_IDS) expect(u.symbols.items[id].text).toBeTruthy()
      const used = parseSample(u.forecast.sample).flatMap((p) => ('term' in p ? [p.term] : []))
      expect(new Set(used)).toEqual(new Set(TERM_IDS))
    }
  })
})

describe('weather model', () => {
  it('turns isobar spacing into wind', () => {
    expect(spacingToKn(120, 50)).toBeGreaterThan(20)
    expect(spacingToKn(60, 50)).toBeCloseTo(2 * spacingToKn(120, 50), 5)
    expect(spacingToKn(120, 30)).toBeGreaterThan(spacingToKn(120, 50))
    expect(beaufort(35)).toBe(8)
    expect(beaufort(3)).toBe(1)
  })

  it('puts the low on the left in the north and on the right in the south', () => {
    expect(compass8(lowBearing(270, 'N'))).toBe(0)
    expect(compass8(lowBearing(270, 'S'))).toBe(4)
  })

  it('passes a depression over the boat in the classic order', () => {
    const zones: ZoneId[] = []
    for (let t = 0; t <= DEP_HOURS; t += 0.5) {
      const z = depState(t).zone
      if (zones[zones.length - 1] !== z) zones.push(z)
    }
    expect(zones).toEqual(['far', 'ahead', 'warmFront', 'warmSector', 'coldFront', 'behind'])
    const at = (z: ZoneId) => {
      for (let t = 0; t <= DEP_HOURS; t += 0.5) if (depState(t).zone === z) return depState(t)
      throw new Error(z)
    }
    // Falling ahead of the warm front, rising behind the cold front, veer at the cold front.
    expect(at('ahead').tendency).toBeLessThan(0)
    expect(depState(DEP_HOURS).tendency).toBeGreaterThan(0)
    const veer = (((at('behind').wind.from - at('warmSector').wind.from) % 360) + 360) % 360
    expect(veer).toBeGreaterThan(20)
    expect(veer).toBeLessThan(180)
  })

  it('makes the trade-wind route faster than the rhumb line in November', () => {
    const nov = SEASONS.find((s) => s.id === 'nov')!
    const days = Object.fromEntries(PRESET_ROUTES.map((r) => [r.id, sailRoute(nov, r.pts).days]))
    expect(days.butter).toBeLessThan(days.rhumb)
    expect(days.butter).toBeLessThan(days.south)
    expect(days.butter).toBeLessThan(days.north)
    for (const r of PRESET_ROUTES) expect(sailRoute(nov, r.pts).onLand, r.id).toBe(false)
  })

  it('flags the hurricane season and land crossings', () => {
    const butter = PRESET_ROUTES.find((r) => r.id === 'butter')!.pts
    expect(sailRoute(SEASONS.find((s) => s.id === 'sep')!, butter).hurricaneH).toBeGreaterThan(0)
    expect(sailRoute(SEASONS.find((s) => s.id === 'nov')!, butter).hurricaneH).toBe(0)
    expect(legOnLand([28.13, -15.43], [28.2, -5.5])).toBe(true)
  })

  it('makes a sea breeze on a sunny afternoon and kills it with a strong offshore wind', () => {
    expect(seaBreeze(14, 0).state).toBe('sb')
    expect(seaBreeze(14, 0).net).toBeGreaterThan(8)
    expect(seaBreeze(14, -18).state).toBe('none')
    expect(seaBreeze(3, 0).state).toBe('lb')
  })
})

describe('weather drills', () => {
  it('ask about clear-cut points on every quiz chart', () => {
    for (const c of QUIZ_CHARTS) {
      const f = chartFacts(c)
      const kn = f.winds.map((w) => w.kn).sort((a, b) => b - a)
      expect(kn[0] - kn[1], c.id).toBeGreaterThan(5)
      const p = [...f.press].sort((a, b) => b - a)
      expect(p[0] - p[1], c.id).toBeGreaterThan(2)
      const d = f.winds[f.dir].from % 45
      expect(Math.min(d, 45 - d), c.id).toBeLessThan(20)
      expect(f.low).not.toBe(f.dir)
    }
  })

  it('sails away from the storm on the right side', () => {
    expect(trsAction('N', 'dangerous')).toBe(0)
    expect(trsAction('N', 'path')).toBe(1)
    expect(trsAction('S', 'dangerous')).toBe(2)
    expect(trsAction('S', 'navigable')).toBe(3)
  })
})
