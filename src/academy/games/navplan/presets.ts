import type { Environment } from '../../core/environment'
import type { LatLon } from '../../core/geo'
import type { MarkId } from '../nautical-marks/marks'

export interface PlacedNavMark {
  id: MarkId | 'race'
  at: LatLon
}

export interface NavPreset {
  id: string
  start: LatLon
  end: LatLon
  env: Environment
  /** Symbolic marks to illustrate the area. Not real aids to navigation. */
  marks: PlacedNavMark[]
}

const ll = (lat: number, lon: number): LatLon => ({ lat, lon })

export const presets: NavPreset[] = [
  {
    id: 'enkhuizen-stavoren',
    start: ll(52.708, 5.31),
    end: ll(52.878, 5.345),
    env: { windFromDeg: 220, windSpeedKn: 14, currentSetDeg: 0, currentSpeedKn: 0 },
    marks: [
      { id: 'north', at: ll(52.775, 5.25) },
      { id: 'special', at: ll(52.83, 5.38) },
    ],
  },
  {
    id: 'lelystad-hoorn',
    start: ll(52.522, 5.42),
    end: ll(52.632, 5.075),
    env: { windFromDeg: 250, windSpeedKn: 12, currentSetDeg: 0, currentSpeedKn: 0 },
    marks: [{ id: 'east', at: ll(52.58, 5.25) }],
  },
  {
    id: 'bodrum-kos',
    start: ll(37.022, 27.43),
    end: ll(36.9, 27.297),
    env: { windFromDeg: 330, windSpeedKn: 18, currentSetDeg: 200, currentSpeedKn: 0.5 },
    marks: [{ id: 'isolated', at: ll(36.965, 27.37) }],
  },
  {
    id: 'fenerbahce-buyukada',
    start: ll(40.966, 29.04),
    end: ll(40.879, 29.128),
    env: { windFromDeg: 40, windSpeedKn: 15, currentSetDeg: 220, currentSpeedKn: 0.5 },
    marks: [
      { id: 'south', at: ll(40.905, 29.075) },
      { id: 'safe', at: ll(40.885, 29.122) },
    ],
  },
]
