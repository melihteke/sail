/** Sun sight reduction helpers (lower limb, noon sight). Angles in degrees unless named *Min. */

/** Dip of the horizon in arc minutes for a height of eye in metres. */
export function dipMin(heightM: number): number {
  return 1.76 * Math.sqrt(Math.max(0, heightM))
}

/** Astronomical refraction (Bennett) in arc minutes for an apparent altitude in degrees. */
export function refractionMin(haDeg: number): number {
  const a = haDeg + 7.31 / (haDeg + 4.4)
  return 1 / Math.tan((a * Math.PI) / 180)
}

/** Semi-diameter of the sun (average), arc minutes. */
export const SUN_SD_MIN = 16

export interface Reduction {
  hs: number
  /** Index correction in arc minutes (index error on the arc gives a negative correction). */
  icMin: number
  dipMin: number
  ha: number
  refrMin: number
  sdMin: number
  ho: number
}

/**
 * Sextant altitude of the sun's lower limb → observed altitude.
 * @param indexErrorMin positive when the error is "on the arc" (reading too high).
 */
export function reduceSunLL(hs: number, indexErrorMin: number, heightM: number, sdMin = SUN_SD_MIN): Reduction {
  const icMin = -indexErrorMin
  const d = dipMin(heightM)
  const ha = hs + (icMin - d) / 60
  const refr = refractionMin(ha)
  const ho = ha + (sdMin - refr) / 60
  return { hs, icMin, dipMin: d, ha, refrMin: refr, sdMin, ho }
}

/** Latitude from a noon sight. Declination north positive. */
export function noonLatitude(ho: number, dec: number, sunBearing: 'S' | 'N'): number {
  const zd = 90 - ho
  return sunBearing === 'S' ? zd + dec : dec - zd
}

/** Inverse of reduceSunLL: the sextant reading that gives altitude `ho`. */
export function sextantFor(ho: number, indexErrorMin: number, heightM: number, sdMin = SUN_SD_MIN): number {
  let ha = ho
  for (let i = 0; i < 20; i++) ha = ho - (sdMin - refractionMin(ha)) / 60
  return ha + (dipMin(heightM) + indexErrorMin) / 60
}

export function toDegMin(deg: number): { sign: number; d: number; m: number } {
  const sign = deg < 0 ? -1 : 1
  const a = Math.abs(deg)
  let d = Math.floor(a)
  let m = Math.round((a - d) * 600) / 10
  if (m >= 60) {
    d += 1
    m = 0
  }
  return { sign, d, m }
}

export function formatDegMin(deg: number, pos = 'N', neg = 'S'): string {
  const { sign, d, m } = toDegMin(deg)
  return `${d}° ${m.toFixed(1).padStart(4, '0')}′${pos || neg ? ` ${sign < 0 ? neg : pos}` : ''}`
}
