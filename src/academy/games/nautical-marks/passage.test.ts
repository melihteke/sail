import { describe, expect, it } from 'vitest'
import { levels, solutions } from './levels'
import { bearingVec, cardinalOk, checkPassage, closestApproach, expectedLateralSide, pointInPolygon, sideOf, type ChartLevel } from './passage'

describe('passage geometry', () => {
  it('detects sides in y-down chart coordinates', () => {
    const north = bearingVec(0)
    expect(north.y).toBeCloseTo(-1)
    expect(sideOf(north, { x: 0, y: 0 }, { x: 10, y: 0 })).toBe('starboard')
    expect(sideOf(north, { x: 0, y: 0 }, { x: -10, y: 0 })).toBe('port')
  })

  it('flips lateral marks when sailing against the buoyage', () => {
    expect(expectedLateralSide('port', bearingVec(0), 0)).toBe('port')
    expect(expectedLateralSide('port', bearingVec(180), 0)).toBe('starboard')
  })

  it('checks cardinal half-planes', () => {
    expect(cardinalOk('N', { x: 0, y: 0 }, { x: 5, y: -10 })).toBe(true)
    expect(cardinalOk('N', { x: 0, y: 0 }, { x: 5, y: 10 })).toBe(false)
    expect(cardinalOk('W', { x: 0, y: 0 }, { x: -3, y: 50 })).toBe(true)
  })

  it('finds closest approach and points in polygons', () => {
    const ca = closestApproach([{ x: 0, y: 0 }, { x: 100, y: 0 }], { x: 50, y: 20 })
    expect(ca.distance).toBeCloseTo(20)
    expect(pointInPolygon({ x: 5, y: 5 }, [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }])).toBe(true)
  })
})

describe('checkPassage', () => {
  const simple: ChartLevel = {
    id: 't',
    region: 'generic',
    width: 100,
    height: 100,
    buoyageDeg: 0,
    land: [],
    shoals: [],
    zones: [],
    marks: [
      { id: 'port', at: { x: 40, y: 50 } },
      { id: 'starboard', at: { x: 60, y: 50 } },
    ],
    start: { x: 50, y: 95 },
    finish: { x: 50, y: 5 },
  }

  it('accepts sailing between lateral marks with the buoyage', () => {
    expect(checkPassage(simple, [])).toEqual([])
  })

  it('flags the wrong side of a lateral mark', () => {
    const v = checkPassage(simple, [{ x: 30, y: 50 }])
    expect(v.map((x) => x.kind)).toContain('lateral')
  })

  it('accepts the same channel leaving the harbour', () => {
    expect(checkPassage({ ...simple, start: { x: 50, y: 5 }, finish: { x: 50, y: 95 } }, [])).toEqual([])
  })

  it('flags hitting a mark', () => {
    expect(checkPassage(simple, [{ x: 40, y: 52 }]).map((x) => x.kind)).toContain('hitMark')
  })
})

describe('levels', () => {
  for (const level of levels) {
    it(`${level.id}: the reference route is safe and the direct route is not`, () => {
      expect(checkPassage(level, solutions[level.id])).toEqual([])
      expect(checkPassage(level, []).length).toBeGreaterThan(0)
    })
  }
})
