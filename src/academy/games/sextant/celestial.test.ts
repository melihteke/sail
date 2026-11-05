import { describe, expect, it } from 'vitest'
import { altAz, dailyPage, distanceNm, fitMaximum, localNoon, sunAltAt, sunAt, sunIncrement, wrap180 } from './almanac'
import { poseFor } from './geometry'

describe('sun almanac', () => {
  it('matches the printed almanac near the June solstice', () => {
    // Nautical Almanac 2024 June 21, 12h UT: GHA 359° 31.2′ (EoT −1m 55s), Dec N 23° 26.2′, SD 15.8′
    const s = sunAt(new Date(Date.UTC(2024, 5, 21, 12)))
    expect(wrap180(s.gha) * 60).toBeCloseTo(-28.8, 0)
    expect((s.dec - 23) * 60).toBeCloseTo(26.2, 0)
    expect(Math.abs(s.sdMin - 15.8)).toBeLessThan(0.1)
  })

  it('matches the equation of time in early November', () => {
    // Around 3 November the sun is ~16.4 minutes fast.
    const s = sunAt(new Date(Date.UTC(2026, 10, 3, 12)))
    expect(s.eotMin).toBeCloseTo(16.4, 0)
    expect(s.dec).toBeCloseTo(-15.1, 0)
  })

  it('finds local noon: sun due south and highest', () => {
    const day = new Date(Date.UTC(2026, 5, 12))
    const lat = 45.6
    const lon = -6.8
    const noon = localNoon(day, lon)
    const at = sunAltAt(noon, lat, lon)
    expect(at.zn).toBeCloseTo(180, 1)
    const before = sunAltAt(new Date(noon.getTime() - 600000), lat, lon)
    expect(before.alt).toBeLessThan(at.alt)
    // Latitude = 90 − alt + dec on the meridian.
    expect(90 - at.alt + sunAt(noon).dec).toBeCloseTo(lat, 6)
  })

  it('builds a daily page with an hourly d value', () => {
    const page = dailyPage(new Date(Date.UTC(2026, 5, 12)))
    expect(page.rows).toHaveLength(24)
    expect(page.rows[13].gha - page.rows[12].gha).toBeCloseTo(15, 1)
    expect(Math.abs(page.d)).toBeLessThan(0.5)
  })

  it('uses 15° per hour for increments', () => {
    expect(sunIncrement(31, 40)).toBeCloseTo(7.9167, 4)
  })

  it('computes altitude and azimuth', () => {
    const a = altAz(50, 0, 90, 0)
    expect(a.alt).toBeCloseTo(0, 6)
    expect(a.zn).toBeCloseTo(270, 6)
  })

  it('fits the maximum of a noon curve', () => {
    const pts = [-20, -12, -5, 3, 9, 18].map((t) => ({ t, h: 60 - 0.001 * (t - 2) ** 2 }))
    const m = fitMaximum(pts)!
    expect(m.t).toBeCloseTo(2, 6)
    expect(m.h).toBeCloseTo(60, 6)
    expect(fitMaximum(pts.slice(0, 2))).toBeNull()
  })

  it('measures distance in nautical miles', () => {
    expect(distanceNm(50, 0, 51, 0)).toBeCloseTo(60, 6)
  })
})

describe('sextant optics', () => {
  it('reads twice the mirror angle', () => {
    for (const reading of [0, 20, 45, 90, 110]) {
      const p = poseFor(reading)
      expect(p.altitude).toBeCloseTo(reading, 6)
      expect(p.armDeg).toBeCloseTo(reading / 2, 6)
    }
  })
})
