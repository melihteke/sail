import { sailTrim } from './sail'

interface Props {
  x: number
  y: number
  headingDeg: number
  /** Signed true wind angle; sails are drawn to leeward. Omit for a boat without sails up. */
  twa?: number
  /** Override the boom angle (degrees from centreline) instead of auto trim. */
  boomDeg?: number
  scale?: number
  hull?: string
  deck?: string
  sail?: string
}

/** Top-down sailing dinghy as an SVG group (bow up before rotation, about 34 units long). */
export function TopBoat({ x, y, headingDeg, twa, boomDeg, scale = 1, hull = '#0b3a5c', deck = '#1d5f8c', sail = '#ffffff' }: Props) {
  let sailPath: string | null = null
  if (twa !== undefined) {
    const trim = sailTrim(twa)
    const dir = trim.side === 'port' ? -1 : 1
    const deg = boomDeg ?? trim.boomDeg
    const r = (deg * Math.PI) / 180
    const mast = { x: 0, y: -5 }
    const end = { x: mast.x + dir * Math.sin(r) * 19, y: mast.y + Math.cos(r) * 19 }
    const mx = (mast.x + end.x) / 2
    const my = (mast.y + end.y) / 2
    const belly = trim.side === 'centre' ? 0.5 : 6
    // Unit normal of the boom pointing away from the centreline (to leeward).
    let nx = dir * Math.cos(r)
    let ny = -Math.sin(r)
    if (Math.sign(nx) !== dir) {
      nx = -nx
      ny = -ny
    }
    sailPath = `M${mast.x} ${mast.y} Q${mx + nx * belly} ${my + ny * belly} ${end.x} ${end.y} Q${mx + nx * 1.5} ${my + ny * 1.5} ${mast.x} ${mast.y} Z`
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${headingDeg}) scale(${scale})`}>
      <path d="M0 -17 C6.5 -10 7.5 1 5.5 16 L-5.5 16 C-7.5 1 -6.5 -10 0 -17 Z" fill={hull} stroke="#fff" strokeWidth="1.2" />
      <path d="M0 -12 C4 -7 4.6 1 3.4 12 L-3.4 12 C-4.6 1 -4 -7 0 -12 Z" fill={deck} />
      {sailPath && <path d={sailPath} fill={sail} stroke={hull} strokeWidth="0.7" />}
      <circle cx="0" cy="-5" r="1.8" fill={hull} stroke="#fff" strokeWidth="0.8" />
    </g>
  )
}
