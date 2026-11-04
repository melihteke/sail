import type { LatLon } from '../core/geo'

/**
 * Coastline check for free planning, using the colours of the OpenStreetMap standard tiles that
 * the map already shows: water is drawn in light blue (#aad3df), land in beige/green/grey.
 * It is a practical heuristic, not a navigational check.
 */

/** Water and water labels are clearly blue; land, roads, buildings and borders are not. */
export function isWaterPixel(r: number, g: number, b: number): boolean {
  return b - r >= 25 && b >= g - 10
}

/** Indices where a run of at least `minRun` consecutive `false` (land) samples starts. */
export function landRuns(water: boolean[], minRun: number): number[] {
  const out: number[] = []
  let run = 0
  for (let i = 0; i < water.length; i++) {
    if (water[i]) run = 0
    else if (++run === minRun) out.push(i - minRun + 1)
  }
  return out
}

const TILE = 256

/** Global pixel coordinates (Web Mercator) at zoom z. */
export function toPixel(p: LatLon, z: number): { x: number; y: number } {
  const n = TILE * 2 ** z
  const lat = Math.max(-85, Math.min(85, p.lat)) * (Math.PI / 180)
  return {
    x: ((p.lon + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * n,
  }
}

const tileCache = new Map<string, Promise<ImageData | null>>()

function loadTile(z: number, x: number, y: number): Promise<ImageData | null> {
  const n = 2 ** z
  const xx = ((x % n) + n) % n
  const key = `${z}/${xx}/${y}`
  let p = tileCache.get(key)
  if (!p) {
    p = new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const c = document.createElement('canvas')
          c.width = TILE
          c.height = TILE
          const ctx = c.getContext('2d', { willReadFrequently: true })!
          ctx.drawImage(img, 0, 0)
          resolve(ctx.getImageData(0, 0, TILE, TILE))
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = `https://tile.openstreetmap.org/${key}.png`
    })
    tileCache.set(key, p)
  }
  return p
}

export type LandCheck = { status: 'ok'; landLegs: number[] } | { status: 'unknown' }

const SAMPLE_PX = 3
const MIN_RUN = 4
/** Ignore this distance (in pixels) around each leg end, so harbour starts are allowed. */
const END_MARGIN_PX = 8

/** Checks each leg (points[i] → points[i+1]) for land using OSM tiles. */
export async function checkLegsForLand(points: LatLon[]): Promise<LandCheck> {
  const landLegs: number[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    // Zoom 12 shows small islands; very long legs use a coarser zoom to limit tile downloads.
    let z = 12
    let pa = toPixel(a, z)
    let pb = toPixel(b, z)
    while (Math.hypot(pb.x - pa.x, pb.y - pa.y) > 8000 && z > 8) {
      z--
      pa = toPixel(a, z)
      pb = toPixel(b, z)
    }
    const len = Math.hypot(pb.x - pa.x, pb.y - pa.y)
    const steps = Math.max(1, Math.floor(len / SAMPLE_PX))
    const water: boolean[] = []
    for (let s = 0; s <= steps; s++) {
      const d = (s / steps) * len
      if (d < END_MARGIN_PX || len - d < END_MARGIN_PX) {
        water.push(true)
        continue
      }
      const x = pa.x + ((pb.x - pa.x) * s) / steps
      const y = pa.y + ((pb.y - pa.y) * s) / steps
      const tile = await loadTile(z, Math.floor(x / TILE), Math.floor(y / TILE))
      if (!tile) return { status: 'unknown' }
      const px = Math.floor(x) % TILE
      const py = Math.floor(y) % TILE
      const o = (py * TILE + px) * 4
      water.push(isWaterPixel(tile.data[o], tile.data[o + 1], tile.data[o + 2]))
    }
    if (landRuns(water, MIN_RUN).length) landLegs.push(i)
  }
  return { status: 'ok', landLegs }
}
