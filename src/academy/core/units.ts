export const KNOT_MS = 1852 / 3600

export const knotsToMs = (kn: number): number => kn * KNOT_MS
export const msToKnots = (ms: number): number => ms / KNOT_MS

/** Normalise to [0, 360). */
export function norm360(deg: number): number {
  const d = deg % 360
  return d < 0 ? d + 360 : d
}

/** Normalise to (-180, 180]. */
export function norm180(deg: number): number {
  const d = norm360(deg)
  return d > 180 ? d - 360 : d
}

export const toRad = (deg: number): number => (deg * Math.PI) / 180
export const toDeg = (rad: number): number => (rad * 180) / Math.PI

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  const mm = h ? m.toString().padStart(2, '0') : String(m)
  return `${h ? `${h}:` : ''}${mm}:${r.toString().padStart(2, '0')}`
}
