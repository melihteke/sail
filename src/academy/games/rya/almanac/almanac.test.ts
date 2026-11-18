import { describe, expect, it } from 'vitest'
import { barWindow, courseToSteer, fmtHM, gannetEvents, legs, mainTide, planPassage, PLAN_DEPART, rangeFactor, streamRate } from './calc'
import { DIAMONDS, PLAN_DAY } from './data'
import { almanacTexts, CHAPTER_IDS, num, type ABlock } from './text'
import { parseAnswer, PRACTICE } from './widgets'

const today = (day: number) => gannetEvents(day).filter((e) => e.t >= 0 && e.t < 1440)

describe('Almanac: secondary port and depth gate', () => {
  it('matches the worked Gannet Cove example for 13 June', () => {
    expect(today(PLAN_DAY).map((e) => `${e.kind} ${fmtHM(e.t)} ${e.h.toFixed(1)}`)).toEqual(['LW 0425 0.8', 'HW 1052 4.4', 'LW 1647 0.9', 'HW 2318 4.3'])
    const w = barWindow(PLAN_DAY)
    expect(w.need).toBe(2.9)
    expect([fmtHM(w.open), fmtHM(w.close)]).toEqual(['0800', '1333'])
  })

  it('interpolates stream rates between neaps and springs', () => {
    const { range } = mainTide(PLAN_DAY)
    expect(range).toBe(4)
    expect(rangeFactor(range)).toBeCloseTo(0.75, 5)
    expect(streamRate(DIAMONDS[0].rows[3], range)).toBe(1.6)
    expect(streamRate(DIAMONDS[0].rows[3], 2.2)).toBe(1.0)
    expect(streamRate(DIAMONDS[0].rows[3], 4.6)).toBe(1.8)
  })
})

describe('Almanac: route and course to steer', () => {
  it('gives the leg tracks and distances used in the lesson', () => {
    expect(legs().map((l) => [l.track, l.nm])).toEqual([
      [156, 6.6],
      [120, 7.9],
    ])
  })

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

  it('matches the worked passage plan', () => {
    const p = planPassage(PLAN_DAY, PLAN_DEPART)
    expect(fmtHM(p.castOff)).toBe('0600')
    expect(p.legs.map((l) => [l.hour, l.row.set, l.rate, l.cts, l.ctsM, l.sog, l.minutes, fmtHM(l.end)])).toEqual([
      [-3, 180, 1.6, 149, 152, 6.4, 62, '0732'],
      [-2, 92, 1.7, 129, 132, 6.4, 74, '0846'],
    ])
    expect([fmtHM(p.barEta), p.barHeight, p.barOk, p.foul, fmtHM(p.anchor)]).toEqual(['0902', 3.7, true, false, '0912'])
  })

  it('shows the tidal gate described in the departure step', () => {
    const run = (h: number, m = 0) => planPassage(PLAN_DAY, h * 60 + m)
    const total = (p: ReturnType<typeof run>) => p.legs.reduce((s, l) => s + l.minutes, 0)
    expect(run(5).barOk).toBe(false)
    for (const p of [run(5, 30), run(6), run(6, 30), run(7)]) {
      expect(p.barOk && !p.foul).toBe(true)
      expect(total(p)).toBe(136)
    }
    expect(run(7, 30).barOk && !run(7, 30).foul).toBe(true)
    expect(run(8, 30).foul).toBe(false)
    expect(run(9).foul).toBe(true)
    expect(run(10).barOk).toBe(false)
  })

  it('only sets practice days that can be sailed', () => {
    for (const ex of PRACTICE) {
      const p = planPassage(ex.day, ex.depart)
      expect(p.barOk && !p.foul).toBe(true)
    }
    expect(parseAnswer('07:45', 'time')).toBe(465)
    expect(parseAnswer('0745', 'time')).toBe(465)
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
      expect(x.ui.practice.questions.length).toBe(en.ui.practice.questions.length)
      expect(x.ui.overview.rows.length).toBe(en.ui.overview.rows.length)
      expect(x.ui.legs.wptNotes.length).toBe(en.ui.legs.wptNotes.length)
      expect(x.ui.sheet.events.length).toBe(en.ui.sheet.events.length)
    }
  })

  it('quote the numbers the calculator produces', () => {
    const p = planPassage(PLAN_DAY, PLAN_DEPART)
    const w = barWindow(PLAN_DAY)
    const g = today(PLAN_DAY).find((e) => e.kind === 'HW')!
    for (const lang of ['en', 'nl', 'tr'] as const) {
      const all = JSON.stringify(almanacTexts[lang].chapters)
      const expected = [
        fmtHM(g.t),
        fmtHM(w.open),
        fmtHM(w.close),
        fmtHM(p.barEta),
        ...p.legs.flatMap((l) => [fmtHM(l.end), `${l.cts}°T`, `${l.ctsM}°M`, `${l.track}°T`, `${num(l.rate, lang)} kn`, `${num(l.sog, lang)} kn`]),
        `${num(p.barHeight, lang)} m`,
        num(rangeFactor(mainTide(PLAN_DAY).range), lang, 2),
        `${num(g.h, lang)} m`,
      ]
      for (const s of expected) expect(all, `${lang}: ${s}`).toContain(s)
    }
  })
})
