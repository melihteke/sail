import { describe, expect, it } from 'vitest'
import { courseToSteer, fmtHM, gateWindow, mainTide, planPassage, rangeFactor, secEvents, streamRate, totalMinutes } from './calc'
import type { LatLon, Scenario } from './scenario'
import { ALL_SCENARIOS, EXTRA_SCENARIOS, SALTMERE } from './scenarios'
import { CHAPTER_IDS, fill, num, type ABlock } from './text'
import { almanacTexts, scenarioTexts } from './texts'
import { fillBlock, planVars } from './vars'
import { parseAnswer, practiceAnswers } from './widgets'

const S = SALTMERE
const today = (s: Scenario, day: number) => secEvents(s, day).filter((e) => e.t >= 0 && e.t < 1440)
const byId = (id: string) => ALL_SCENARIOS.find((x) => x.id === id)!

function inside(p: LatLon, poly: LatLon[]): boolean {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a.lat > p.lat !== b.lat > p.lat && p.lon < ((b.lon - a.lon) * (p.lat - a.lat)) / (b.lat - a.lat) + a.lon) c = !c
  }
  return c
}

describe('Almanac: secondary port and depth gate', () => {
  it('matches the worked Gannet Cove example for 13 June', () => {
    expect(today(S, 13).map((e) => `${e.kind} ${fmtHM(e.t)} ${e.h.toFixed(1)}`)).toEqual(['LW 0425 0.8', 'HW 1052 4.4', 'LW 1647 0.9', 'HW 2318 4.3'])
    const w = gateWindow(S, 13)!
    expect(w.need).toBe(2.9)
    expect([fmtHM(w.open), fmtHM(w.close)]).toEqual(['0800', '1333'])
  })

  it('interpolates stream rates between neaps and springs', () => {
    const { range } = mainTide(S, 13)
    expect(range).toBe(4)
    expect(rangeFactor(S, range)).toBeCloseTo(0.75, 5)
    const row = S.diamonds[0].rows[3]
    expect([streamRate(S, row, range), streamRate(S, row, 2.2), streamRate(S, row, 4.6)]).toEqual([1.6, 1.0, 1.8])
  })

  it('treats a charted depth as water that is already there', () => {
    const w = gateWindow(byId('windfarm'), 20)!
    expect(w.need).toBe(1.3)
  })
})

describe('Almanac: route and course to steer', () => {
  it('keeps the ground track when steering the CTS', () => {
    expect(courseToSteer(120, 0, 0, 5)).toMatchObject({ heading: 120, sog: 5 })
    const c = courseToSteer(156, 180, 1.6, 5)!
    const D = Math.PI / 180
    const east = 5 * Math.sin(c.heading * D) + 1.6 * Math.sin(180 * D)
    const north = 5 * Math.cos(c.heading * D) + 1.6 * Math.cos(180 * D)
    expect((Math.atan2(east, north) / D + 360) % 360).toBeCloseTo(156, 6)
    expect(Math.hypot(east, north)).toBeCloseTo(c.sog, 6)
    expect(courseToSteer(0, 90, 6, 5)).toBeNull()
  })

  it('matches the worked Saltmere passage plan', () => {
    const p = planPassage(S, 13, S.planDepart)
    expect(fmtHM(p.castOff)).toBe('0600')
    expect(p.legs.map((l) => [l.track, l.nm, l.hour, l.set, l.rate, l.cts, l.ctsM, l.sog, l.minutes, fmtHM(l.end)])).toEqual([
      [156, 6.6, -3, 180, 1.6, 149, 152, 6.4, 62, '0732'],
      [120, 7.9, -2, 92, 1.7, 129, 132, 6.4, 74, '0846'],
    ])
    expect([fmtHM(p.barEta), p.barHeight, p.barOk, p.foul, fmtHM(p.anchor)]).toEqual(['0902', 3.7, true, false, '0912'])
  })

  it('shows the tidal gate described in the departure step', () => {
    const run = (h: number, m = 0) => planPassage(S, 13, h * 60 + m)
    expect(run(5).barOk).toBe(false)
    for (const p of [run(5, 30), run(6), run(6, 30), run(7)]) {
      expect(p.barOk && !p.foul).toBe(true)
      expect(totalMinutes(p)).toBe(136)
    }
    expect(run(8, 30).foul).toBe(false)
    expect(run(9).foul).toBe(true)
    expect(run(10).barOk).toBe(false)
  })

  it('holds the heading across the TSS and lets the stream set the boat', () => {
    const s = byId('tss')
    const p = planPassage(s, s.planDay, s.planDepart)
    const lane = p.legs.find((l) => l.fixed)!
    expect(lane.cts).toBe(0)
    expect(lane.setNm!).toBeGreaterThan(1)
    expect(lane.b.lon).toBeGreaterThan(lane.a.lon)
    expect(lane.b.lat - lane.a.lat).toBeCloseTo(7.6, 0)
    expect(p.barOk).toBe(true)
    // The last leg starts where the lane crossing ended.
    expect(p.legs[2].a).toEqual(lane.b)
  })

  it('needs a big upstream correction to cross the Bosphorus', () => {
    const s = byId('istanbul')
    const p = planPassage(s, s.planDay, s.planDepart)
    const cross = p.legs[p.legs.length - 1]
    expect(cross.offset).toBeGreaterThan(25)
    expect(cross.sog).toBeLessThan(s.boat.speed)
    expect(p.barOk).toBe(true)
  })

  it('keeps every waypoint and leg at sea and out of the wind farm zone', () => {
    for (const s of ALL_SCENARIOS) {
      const p = planPassage(s, s.planDay, s.planDepart)
      const zones = s.features.flatMap((f) => (f.kind === 'windfarm' ? [f.zone] : []))
      for (const l of p.legs) {
        for (let k = 0; k <= 20; k++) {
          const q = { lat: l.a.lat + ((l.b.lat - l.a.lat) * k) / 20, lon: l.a.lon + ((l.b.lon - l.a.lon) * k) / 20 }
          for (const poly of [...s.land, ...zones]) expect(inside(q, poly), `${s.id} ${l.from}→${l.to} @${k}`).toBe(false)
        }
      }
    }
  })

  it('only sets practice runs that can be sailed', () => {
    for (const s of ALL_SCENARIOS) {
      for (const ex of s.practice) {
        expect(planPassage(s, ex.day, ex.depart, ex.scale ?? 1).barOk, `${s.id} ${ex.day}`).toBe(true)
        for (const a of practiceAnswers(s, ex)) expect(Number.isFinite(a.value)).toBe(true)
      }
    }
    expect(parseAnswer('07:45', 'time')).toBe(465)
    expect(parseAnswer('1,6', 'num')).toBe(1.6)
    expect(parseAnswer('152°', 'num')).toBe(152)
  })
})

describe('Almanac texts', () => {
  const shape = (b: ABlock) => ('aw' in b ? `aw:${b.aw}` : Object.keys(b)[0])

  it('have the same chapters, blocks, widgets and answers in every language', () => {
    const en = almanacTexts.en
    for (const lang of ['nl', 'tr'] as const) {
      const x = almanacTexts[lang]
      for (const id of CHAPTER_IDS) {
        expect(x.chapters[id].sections.map((s) => s.blocks.map(shape)), `${lang}/${id}`).toEqual(en.chapters[id].sections.map((s) => s.blocks.map(shape)))
      }
      expect(x.check.map((q) => [q.answer, q.options.length])).toEqual(en.check.map((q) => [q.answer, q.options.length]))
    }
  })

  it('give every scenario the same text structure in every language and fill all placeholders', () => {
    for (const s of ALL_SCENARIOS) {
      const en = scenarioTexts[s.id].en
      expect(en.wptNotes.length, s.id).toBe(s.waypoints.length)
      if (!s.tidal) expect(en.practiceLabels?.length).toBe(s.practice.length)
      for (const lang of ['en', 'nl', 'tr'] as const) {
        const x = scenarioTexts[s.id][lang]
        expect([x.legend.length, x.wptNotes.length, x.notes.length], `${s.id}/${lang}`).toEqual([en.legend.length, en.wptNotes.length, en.notes.length])
        const secs = Object.fromEntries(Object.entries(x.sections ?? {}).map(([k, v]) => [k, v!.map(shape)]))
        expect(secs, `${s.id}/${lang}`).toEqual(Object.fromEntries(Object.entries(en.sections ?? {}).map(([k, v]) => [k, v!.map(shape)])))
        const vars = planVars(s, planPassage(s, s.planDay, s.planDepart), lang, almanacTexts[lang].ui)
        const texts = [x.overview, ...x.notes, ...x.wptNotes, ...x.legend, ...Object.values(x.sections ?? {}).flatMap((bs) => bs!.map((b) => JSON.stringify(fillBlock(b, vars))))]
        for (const t of texts) expect(fill(t, vars), `${s.id}/${lang}`).not.toMatch(/\{\w+\}/)
      }
    }
  })

  it('quote the numbers the calculator produces in the main lesson', () => {
    const p = planPassage(S, 13, S.planDepart)
    const w = gateWindow(S, 13)!
    const g = today(S, 13).find((e) => e.kind === 'HW')!
    for (const lang of ['en', 'nl', 'tr'] as const) {
      const all = JSON.stringify(almanacTexts[lang].chapters)
      const expected = [
        fmtHM(g.t),
        fmtHM(w.open),
        fmtHM(w.close),
        fmtHM(p.barEta),
        ...p.legs.flatMap((l) => [fmtHM(l.end), `${l.cts}°T`, `${l.ctsM}°M`, `${l.track}°T`, `${num(l.rate, lang)} kn`, `${num(l.sog, lang)} kn`]),
        `${num(p.barHeight!, lang)} m`,
        num(rangeFactor(S, mainTide(S, 13).range), lang, 2),
        `${num(g.h, lang)} m`,
      ]
      for (const x of expected) expect(all, `${lang}: ${x}`).toContain(x)
    }
  })

  it('lists every extra scenario with a text', () => {
    for (const s of EXTRA_SCENARIOS) expect(scenarioTexts[s.id].tr.title.length).toBeGreaterThan(5)
  })
})
