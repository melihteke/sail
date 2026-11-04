/**
 * Simplified mainsail trim for drawing. Returns the boom angle measured from the centreline
 * (pointing aft) and the side the sail sets on. The sail always goes to leeward:
 * with wind over starboard (TWA > 0) the boom is out to port.
 */
export interface SailTrim {
  boomDeg: number
  side: 'port' | 'starboard' | 'centre'
}

export function sailTrim(twa: number, minTwa = 40): SailTrim {
  const a = Math.abs(twa)
  if (a < minTwa * 0.75) return { boomDeg: 0, side: 'centre' }
  const boomDeg = Math.min(85, Math.max(14, (a - 25) * 0.6))
  return { boomDeg, side: twa > 0 ? 'port' : 'starboard' }
}
