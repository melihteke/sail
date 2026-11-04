import { useId } from 'react'
import type { MarkDef, Topmark } from './marks'

const BODY_TOP = 72
const WATER = 172

const bodyPath: Record<MarkDef['shape'], string> = {
  can: `M36 ${BODY_TOP + 22} H84 V${WATER} H36 Z`,
  cone: `M60 ${BODY_TOP + 10} L92 ${WATER} H28 Z`,
  pillar: `M44 ${BODY_TOP} H76 V140 L94 ${WATER} H26 L44 140 Z`,
  spar: `M53 58 H67 V${WATER} H53 Z`,
  sphere: `M26 ${WATER - 30} A34 34 0 1 1 94 ${WATER - 30} A34 34 0 0 1 26 ${WATER - 30} Z`,
}

const bodyTop: Record<MarkDef['shape'], number> = {
  can: BODY_TOP + 22,
  cone: BODY_TOP + 10,
  pillar: BODY_TOP,
  spar: 58,
  sphere: WATER - 64,
}

function cone(cx: number, baseY: number, apexUp: boolean, color: string) {
  const h = 15
  const w = 11
  const apex = apexUp ? baseY - h : baseY + h
  return <path d={`M${cx - w} ${baseY} L${cx + w} ${baseY} L${cx} ${apex} Z`} fill={color} stroke="#000" strokeWidth="0.8" />
}

function TopmarkShape({ kind, color }: { kind: Topmark; color: string }) {
  switch (kind) {
    case 'can':
      return <rect x="50" y="36" width="20" height="20" fill={color} stroke="#000" strokeWidth="0.8" />
    case 'cone':
      return cone(60, 56, true, color)
    case 'cones-up':
      return (
        <>
          {cone(60, 36, true, color)}
          {cone(60, 56, true, color)}
        </>
      )
    case 'cones-down':
      return (
        <>
          {cone(60, 20, false, color)}
          {cone(60, 40, false, color)}
        </>
      )
    case 'cones-base':
      return (
        <>
          {cone(60, 37, true, color)}
          {cone(60, 41, false, color)}
        </>
      )
    case 'cones-point':
      return (
        <>
          {cone(60, 20, false, color)}
          {cone(60, 56, true, color)}
        </>
      )
    case 'balls':
      return (
        <>
          <circle cx="60" cy="26" r="8.5" fill={color} />
          <circle cx="60" cy="46" r="8.5" fill={color} />
        </>
      )
    case 'ball':
      return <circle cx="60" cy="42" r="11" fill={color} stroke="#000" strokeWidth="0.8" />
    case 'x':
      return (
        <g stroke="#000" strokeWidth="7" strokeLinecap="round">
          <path d="M48 28 L72 54 M72 28 L48 54" />
          <path d="M48 28 L72 54 M72 28 L48 54" stroke={color} strokeWidth="4.5" />
        </g>
      )
    case 'plus':
      return (
        <g stroke="#000" strokeWidth="7" strokeLinecap="butt">
          <path d="M60 24 V56 M44 40 H76" />
          <path d="M60 25 V55 M45 40 H75" stroke={color} strokeWidth="4.5" />
        </g>
      )
    case 'none':
      return null
  }
}

interface BuoyProps {
  mark: MarkDef
  className?: string
  title?: string
  /** Placement when nested inside another SVG. */
  x?: number
  y?: number
  width?: number
  height?: number
  /** Hide the water at the bottom (e.g. on a chart). */
  noWater?: boolean
}

/** A stylised IALA buoy, drawn from scratch. */
export function BuoySvg({ mark, className, title, x, y, width, height: h, noWater }: BuoyProps) {
  const clipId = useId()
  const top = bodyTop[mark.shape]
  const height = WATER - top
  const bandH = mark.bands.length ? height / mark.bands.length : height

  return (
    <svg viewBox="0 0 120 200" className={className} role="img" aria-label={title} x={x} y={y} width={width} height={h}>
      {title && <title>{title}</title>}
      <defs>
        <clipPath id={clipId}>
          <path d={bodyPath[mark.shape]} />
        </clipPath>
      </defs>
      {mark.topmark !== 'none' && <line x1="60" y1={top} x2="60" y2="22" stroke="#374151" strokeWidth="3" />}
      <TopmarkShape kind={mark.topmark} color={mark.topmarkColor} />
      <g clipPath={`url(#${clipId})`}>
        {mark.bands.map((c, i) => (
          <rect key={i} x="0" y={top + i * bandH} width="120" height={bandH + 0.5} fill={c} />
        ))}
        {mark.verticalStripes &&
          Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={20 + i * 10} y={top} width="10" height={height} fill={mark.verticalStripes![i % 2]} />
          ))}
      </g>
      <path d={bodyPath[mark.shape]} fill="none" stroke="#000" strokeWidth="1.2" />
      {!noWater && (
        <>
          <path d="M0 176 Q15 170 30 176 T60 176 T90 176 T120 176 V200 H0 Z" fill="#1e9bd7" opacity="0.85" />
          <path d="M0 184 Q15 179 30 184 T60 184 T90 184 T120 184 V200 H0 Z" fill="#0b3a5c" opacity="0.5" />
        </>
      )}
    </svg>
  )
}
