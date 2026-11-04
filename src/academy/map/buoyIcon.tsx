import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { BuoySvg } from '../games/nautical-marks/BuoySvg'
import { markById, type MarkId } from '../games/nautical-marks/marks'

export type BuoyKind = MarkId | 'race'

export const BUOY_PALETTE: BuoyKind[] = ['port', 'starboard', 'north', 'east', 'south', 'west', 'isolated', 'safe', 'special', 'wreck', 'race']

const RACE_SVG = '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="#f97316" stroke="#111827" stroke-width="2"/></svg>'

const cache = new Map<string, L.DivIcon>()

/** Leaflet icon for a symbolic IALA buoy (or a plain orange race/waypoint buoy). */
export function buoyIcon(id: BuoyKind): L.DivIcon {
  let icon = cache.get(id)
  if (!icon) {
    const race = id === 'race'
    const html = race ? RACE_SVG : renderToStaticMarkup(<BuoySvg mark={markById(id)} noWater width={22} height={37} />)
    icon = L.divIcon({ className: 'sg-divicon', html, iconSize: race ? [24, 24] : [22, 37], iconAnchor: race ? [12, 12] : [11, 33] })
    cache.set(id, icon)
  }
  return icon
}
