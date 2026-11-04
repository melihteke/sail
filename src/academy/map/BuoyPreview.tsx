import { BuoySvg } from '../games/nautical-marks/BuoySvg'
import { markById } from '../games/nautical-marks/marks'
import type { BuoyKind } from './buoyIcon'

/** Small palette preview of a buoy. */
export function BuoyPreview({ id, className }: { id: BuoyKind; className?: string }) {
  if (id === 'race') {
    return (
      <svg viewBox="0 0 24 24" className={className}>
        <circle cx="12" cy="14" r="7" fill="#f97316" stroke="#111827" strokeWidth="2" />
      </svg>
    )
  }
  return <BuoySvg mark={markById(id)} className={className} noWater />
}
