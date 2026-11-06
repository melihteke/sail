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
      for (const p of [...Object.values(course.marks), [course.boat.x, course.boat.y]]) {
        const probe = landProbe(course, p[0]!, p[1]!)
        expect(probe.water).toBe(true)
        expect(probe.dist).toBeGreaterThan(15)
      }
      expect(sideOfStart(course, course.boat.x, course.boat.y)).toBe(-1)
      expect(sideOfStart(course, ...course.marks.windward)).toBe(1)
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
    expect(s.leg).toBe('start')
    const back = sail(poel, [[-60, up], [3, down]], 80)
    expect(back.ocs).toBe(false)
  })

  it('only counts mark 1 when it is left to port', () => {
    const { events } = botRace(poel, step, initialState(poel))
    let s = initialState(poel)
    let e = 0
    let target = s.target
    let sawWindward = false
    while (s.status === 'racing') {
      while (e < events.length && events[e]![0] <= s.t) target = events[e++]![1]
      s = step(poel, s, target)
      if (s.leg === 'windward') sawWindward = true
      if (s.leg === 'offset') break
    }
    expect(sawWindward).toBe(true)
    expect(s.leg).toBe('offset')
    // Passing the mark the wrong way (west to east) does not round it.
    const wrong: RaceState = { ...s, leg: 'windward', x: poel.marks.windward[0] - 20, y: poel.marks.windward[1] + 20 }
    const a = (poel.wind.dir * Math.PI) / 180
    const east = Math.round(((Math.atan2(Math.cos(a), -Math.sin(a)) * 180) / Math.PI + 360) % 360)
    let w = wrong
    for (let i = 0; i < 25 && w.status === 'racing'; i++) w = step(poel, w, east)
    expect(w.leg).toBe('windward')
  })

  it('runs aground when steered into the shore', () => {
    const r = simulate(poel, [[-60, Math.round((poel.wind.dir + 90) % 360)]])
    expect(['crashed', 'outside']).toContain(r.status)
  })
})
