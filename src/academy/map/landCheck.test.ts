import { describe, expect, it } from 'vitest'
import { isWaterPixel, landRuns, toPixel } from './landCheck'

describe('land check helpers', () => {
  it('classifies OSM colours', () => {
    expect(isWaterPixel(0xaa, 0xd3, 0xdf)).toBe(true) // water
    expect(isWaterPixel(0x4d, 0x80, 0xb3)).toBe(true) // water label
    expect(isWaterPixel(0xf2, 0xef, 0xe9)).toBe(false) // land
    expect(isWaterPixel(0xad, 0xd1, 0x9e)).toBe(false) // park
    expect(isWaterPixel(0xd9, 0xd0, 0xc9)).toBe(false) // building
  })

  it('needs a run of land, not a single pixel', () => {
    expect(landRuns([true, false, true, false, false, true], 3)).toEqual([])
    expect(landRuns([true, false, false, false, true, false, false, false, false], 3)).toEqual([1, 5])
  })

  it('projects to web mercator pixels', () => {
    expect(toPixel({ lat: 0, lon: 0 }, 0)).toEqual({ x: 128, y: 128 })
    expect(toPixel({ lat: 0, lon: 180 }, 1).x).toBe(512)
    expect(toPixel({ lat: 60, lon: 0 }, 0).y).toBeLessThan(128)
  })
})
