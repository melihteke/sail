import { describe, expect, it } from 'vitest'
import { botRace } from './bot'
import courses from './courses.json'
import { initialState, landProbe, polarSpeedKn, simulate, sideOfStart, step, windAt, type CourseData, type HelmEvent, type RaceState } from './sim'

const list = courses as unknown as { meta: { id: string }; course: CourseData }[]
const poel = list[0]!.course

/** Sails a fixed heading per time window: [[fromTick, heading], …]. */
function sail(c: CourseData, plan: HelmEvent[], until = 1500): RaceState {
  let s = initialState(c)
  let target = s.target
  while (s.status === 'racing' && s.t < until) {
    for (const [tick, h] of plan) if (tick === s.t) target = h
    s = step(c, s, target)
  }
  return s
}

describe('race courses', () => {
  for (const { meta, course } of list) {
    it(`${meta.id}: marks, lines and the boat are on the water`, () => {
      for (const p of [...course.objects.map((o) => o.at), [course.boat.x, course.boat.y]]) {
        const probe = landProbe(course, p[0]!, p[1]!)
        expect(probe.water).toBe(true)
        expect(probe.dist).toBeGreaterThan(15)
      }
      expect(sideOfStart(course, course.boat.x, course.boat.y)).toBe(-1)
      const first = course.legs[0]!
      expect(first.kind).toBe('mark')
      if (first.kind === 'mark') expect(sideOfStart(course, ...first.at)).toBe(1)
      expect(course.legs.at(-1)!.kind).toBe('finish')
    })
  }
})

describe('race model', () => {
  it('has no speed head to wind and more speed in more wind', () => {
    expect(polarSpeedKn(30, 12)).toBe(0)
    expect(polarSpeedKn(90, 16)).toBeGreaterThan(polarSpeedKn(90, 8))
    expect(polarSpeedKn(90, 2)).toBeCloseTo(polarSpeedKn(90, 4) / 2)
  })

  it('gives everyone the same wind at the same race time', () => {
    const a = windAt(poel.wind, 123, 50, -40)
    expect(windAt(poel.wind, 123, 50, -40)).toEqual(a)
    expect(windAt(poel.wind, 300, 50, -40)).not.toEqual(a)
  })

  it('is deterministic: the same helm log gives the same result', () => {
    const { events } = botRace(poel, step, initialState(poel))
    expect(simulate(poel, events)).toEqual(simulate(poel, events))
    expect(simulate(poel, events).status).toBe('finished')
  })

  it('flags a boat over the line at the gun until it returns below it', () => {
    const up = Math.round(poel.wind.dir - 50 + 360) % 360
    const down = Math.round(poel.wind.dir + 180) % 360
    const s = sail(poel, [[-60, up]], 3)
    expect(s.ocs).toBe(true)
    expect(s.leg).toBe(0)
    const back = sail(poel, [[-60, up], [3, down]], 80)
    expect(back.ocs).toBe(false)
  })

  it('only counts mark 1 when it is left to port', () => {
    const mark = poel.legs[0]!
    if (mark.kind !== 'mark') throw new Error('first leg is a mark')
    const s0 = initialState(poel)
    // Cross the mark's ray the wrong way: no rounding.
    const [rx, ry] = mark.ray
    const perp: [number, number] = [-ry, rx]
    const from = { ...s0, leg: 1, t: 100, x: mark.at[0] + rx * 20 - perp[0] * 15, y: mark.at[1] + ry * 20 - perp[1] * 15 }
    const wrongDir = Math.round(((Math.atan2(-perp[0], -perp[1]) * 180) / Math.PI + 360) % 360)
    const rightDir = Math.round(((Math.atan2(perp[0], perp[1]) * 180) / Math.PI + 360) % 360)
    const before = { ...from, x: mark.at[0] + rx * 20 + perp[0] * 15, y: mark.at[1] + ry * 20 + perp[1] * 15, heading: wrongDir, speed: 2 }
    let w: RaceState = before
    for (let i = 0; i < 20 && w.status === 'racing'; i++) w = step(poel, w, wrongDir)
    expect(w.leg).toBe(1)
    let r: RaceState = { ...from, heading: rightDir, speed: 2 }
    for (let i = 0; i < 20 && r.status === 'racing'; i++) r = step(poel, r, rightDir)
    expect(r.leg).toBe(2)
  })

  it('sails triangle courses (1 → 2 → 3 → finish) and sea courses on a land grid', () => {
    const tri = list.filter((c) => c.course.type === 'triangle')
    expect(tri.length).toBeGreaterThanOrEqual(2)
    for (const { course } of tri) {
      expect(course.legs.map((l) => l.label)).toEqual(['1', '2', '3', 'F'])
      expect(course.mask).toBeDefined()
      const { events } = botRace(course, step, initialState(course))
      expect(simulate(course, events).status).toBe('finished')
    }
  })
  it('runs aground when steered into the shore', () => {
    const r = simulate(poel, [[-60, Math.round((poel.wind.dir + 90) % 360)]])
    expect(['crashed', 'outside']).toContain(r.status)
  })
})
