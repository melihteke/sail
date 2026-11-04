import L from 'leaflet'
import { sailTrim } from './sail'

const SIZE = 44
const C = SIZE / 2
const MAST = { x: C, y: 17 }
const BOOM_LEN = 19

/** Top-down sailing dinghy: hull, mast and a mainsail set to leeward according to the true wind angle. */
export function boatIcon(headingDeg: number, twa: number, variant: 'player' | 'ghost'): L.DivIcon {
  const player = variant === 'player'
  const hull = player ? '#0b3a5c' : '#b45309'
  const deck = player ? '#1d5f8c' : '#f59e0b'
  const sailFill = player ? '#ffffff' : '#fff7ed'
  const opacity = player ? 1 : 0.8

  const trim = sailTrim(twa)
  const dir = trim.side === 'port' ? -1 : 1
  const r = (trim.boomDeg * Math.PI) / 180
  const sail = crescent(MAST, { x: MAST.x + dir * Math.sin(r) * BOOM_LEN, y: MAST.y + Math.cos(r) * BOOM_LEN }, dir, 13, 3)
  const jr = r * 0.8
  const jib = crescent({ x: C, y: 6 }, { x: C + dir * Math.sin(jr) * 9, y: 6 + Math.cos(jr) * 9 }, dir, 7, 1.5)
  const luffing = trim.side === 'centre'
  const sailStyle = `fill="${sailFill}" stroke="${hull}" stroke-width="0.7" stroke-linejoin="round"`

  return L.divIcon({
    className: 'sg-divicon',
    iconSize: [SIZE, SIZE],
    iconAnchor: [C, C],
    html: `<div style="width:${SIZE}px;height:${SIZE}px;transform:rotate(${headingDeg.toFixed(0)}deg);opacity:${opacity};filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.45))">
      <svg viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
        <path d="M${C} 4 C${C + 6.5} 11 ${C + 7.5} 22 ${C + 5.5} 38 L${C - 5.5} 38 C${C - 7.5} 22 ${C - 6.5} 11 ${C} 4 Z" fill="${hull}" stroke="#ffffff" stroke-width="1.2"/>
        <path d="M${C} 9 C${C + 4} 14 ${C + 4.6} 22 ${C + 3.4} 33 L${C - 3.4} 33 C${C - 4.6} 22 ${C - 4} 14 ${C} 9 Z" fill="${deck}"/>
        ${
          luffing
            ? `<path d="M${C} 6 L${C} ${MAST.y}" stroke="${sailFill}" stroke-width="2" stroke-linecap="round"/>
               <path d="M${MAST.x} ${MAST.y} q1.5 5 0 9.5 t0 9.5" fill="none" stroke="${sailFill}" stroke-width="2.4" stroke-linecap="round"/>`
            : `<path d="${jib}" ${sailStyle}/><path d="${sail}" ${sailStyle}/>`
        }
        <circle cx="${MAST.x}" cy="${MAST.y}" r="1.8" fill="${hull}" stroke="#ffffff" stroke-width="0.8"/>
      </svg></div>`,
  })
}

type Pt = { x: number; y: number }

/**
 * A sail seen from above: a crescent between luff point `a` and clew `b`, bulging to leeward (`dir`).
 * Outer edge has `outer` belly, inner edge (roughly the boom) `inner` belly.
 */
function crescent(a: Pt, b: Pt, dir: number, outer: number, inner: number): string {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  // Unit normal pointing to leeward (same sign of x as dir).
  let nx = -dy / len
  let ny = dx / len
  if (Math.sign(nx) !== dir && nx !== 0) {
    nx = -nx
    ny = -ny
  }
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const f = (v: number) => v.toFixed(1)
  return `M${f(a.x)} ${f(a.y)} Q${f(mx + nx * outer)} ${f(my + ny * outer)} ${f(b.x)} ${f(b.y)} Q${f(mx + nx * inner)} ${f(my + ny * inner)} ${f(a.x)} ${f(a.y)} Z`
}

/**
 * A rounding mark (race buoy or floating dock) with an arrow showing the direction to go round it:
 * leaving it to port means going anticlockwise round it (red), to starboard clockwise (green).
 */
export function roundingMarkIcon(kind: 'buoy' | 'dock', side: 'port' | 'starboard'): L.DivIcon {
  const color = side === 'port' ? '#d6312b' : '#1f9a4d'
  // Arc from about 10 o'clock round the top to 2 o'clock; the arrowhead sits at the end of travel.
  const arc = side === 'port' ? 'M43 18 A17 17 0 0 0 17 18' : 'M17 18 A17 17 0 0 1 43 18'
  const head = side === 'port' ? 'M17 18 l-5 -1 l3 6 z' : 'M43 18 l5 -1 l-3 6 z'
  const body =
    kind === 'dock'
      ? `<rect x="18" y="25" width="24" height="10" rx="1.5" fill="#a16207" stroke="#fff" stroke-width="1.5"/>
         <path d="M22 25 v10 M27 25 v10 M32 25 v10 M37 25 v10" stroke="#713f12" stroke-width="0.8"/>`
      : `<circle cx="30" cy="30" r="7" fill="#facc15" stroke="#111827" stroke-width="1.8"/>`
  return L.divIcon({
    className: 'sg-divicon',
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    html: `<svg viewBox="0 0 60 60" width="60" height="60" style="filter:drop-shadow(0 1px 1.5px rgba(0,0,0,.35))">
      <path d="${arc}" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="4 3"/>
      <path d="${head}" fill="${color}"/>
      ${body}
    </svg>`,
  })
}

export function pinIcon(label: string, color: string, size = 26): L.DivIcon {
  return L.divIcon({
    className: 'sg-divicon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,.4);color:white;font:600 12px/1 system-ui;display:flex;align-items:center;justify-content:center">${label}</div>`,
  })
}

export function finishIcon(): L.DivIcon {
  return L.divIcon({
    className: 'sg-divicon',
    iconSize: [30, 34],
    iconAnchor: [15, 30],
    html: `<svg viewBox="0 0 30 34" width="30" height="34">
      <ellipse cx="15" cy="30" rx="10" ry="3" fill="rgba(0,0,0,.25)"/>
      <path d="M8 29 L11 12 L19 12 L22 29 Z" fill="#f97316" stroke="white" stroke-width="1.5"/>
      <line x1="15" y1="12" x2="15" y2="2" stroke="#1f2937" stroke-width="1.5"/>
      <path d="M15 2 L24 5 L15 8 Z" fill="#facc15" stroke="#1f2937" stroke-width="0.8"/>
    </svg>`,
  })
}
