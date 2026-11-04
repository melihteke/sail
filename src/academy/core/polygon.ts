/** Planar polygon helpers. Work in any 2-D frame (x/y orientation does not matter). */
export interface XY {
  x: number
  y: number
}

const sub = (a: XY, b: XY): XY => ({ x: a.x - b.x, y: a.y - b.y })
const cross = (a: XY, b: XY) => a.x * b.y - a.y * b.x

export function segmentsIntersect(p1: XY, p2: XY, q1: XY, q2: XY): XY | null {
  const r = sub(p2, p1)
  const s = sub(q2, q1)
  const denom = cross(r, s)
  if (Math.abs(denom) < 1e-12) return null
  const qp = sub(q1, p1)
  const t = cross(qp, s) / denom
  const u = cross(qp, r) / denom
  if (t < 0 || t > 1 || u < 0 || u > 1) return null
  return { x: p1.x + r.x * t, y: p1.y + r.y * t }
}

export function pointInPolygon(p: XY, poly: XY[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside
  }
  return inside
}

/** First point where the polyline touches the polygon, or null. */
export function polylineHitsPolygon(path: XY[], poly: XY[]): XY | null {
  for (const p of path) if (pointInPolygon(p, poly)) return p
  for (let i = 0; i < path.length - 1; i++) {
    let best: XY | null = null
    let bestD = Infinity
    for (let j = 0; j < poly.length; j++) {
      const hit = segmentsIntersect(path[i], path[i + 1], poly[j], poly[(j + 1) % poly.length])
      if (hit) {
        const d = Math.hypot(hit.x - path[i].x, hit.y - path[i].y)
        if (d < bestD) {
          bestD = d
          best = hit
        }
      }
    }
    if (best) return best
  }
  return null
}

export function hitsAny(path: XY[], polys: XY[][]): boolean {
  return polys.some((poly) => polylineHitsPolygon(path, poly) !== null)
}
