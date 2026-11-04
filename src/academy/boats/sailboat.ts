import type { Polar } from '../core/polar'

export interface BoatProfile {
  id: string
  name: string
  lengthM: number
  polar: Polar
  /** Time (s) lost in a tack compared with sailing on. Modelled as the boat pausing at the waypoint. */
  tackPenaltyS: number
  /** Time (s) lost in a gybe. */
  gybePenaltyS: number
}

/**
 * A generic ~6.5 m open sailing dinghy / day sailer.
 * The polar is an educated approximation for gameplay, not measured data. Tune it freely.
 */
export const sailboat: BoatProfile = {
  id: 'sailboat',
  name: 'Sailboat',
  lengthM: 6.5,
  tackPenaltyS: 8,
  gybePenaltyS: 6,
  polar: {
    tws: [4, 6, 8, 10, 12, 16, 20],
    twa: [40, 45, 52, 60, 75, 90, 110, 120, 135, 150, 165, 180],
    speeds: [
      [2.4, 3.3, 3.9, 4.3, 4.5, 4.7, 4.8],
      [2.7, 3.6, 4.2, 4.6, 4.8, 5.0, 5.1],
      [3.0, 3.9, 4.5, 4.9, 5.1, 5.3, 5.4],
      [3.2, 4.1, 4.7, 5.1, 5.3, 5.5, 5.6],
      [3.4, 4.4, 5.0, 5.4, 5.6, 5.8, 6.0],
      [3.5, 4.5, 5.1, 5.5, 5.8, 6.1, 6.4],
      [3.4, 4.4, 5.0, 5.5, 5.9, 6.4, 6.9],
      [3.3, 4.3, 4.9, 5.4, 5.8, 6.4, 7.0],
      [3.0, 4.0, 4.6, 5.1, 5.5, 6.1, 6.8],
      [2.6, 3.6, 4.3, 4.8, 5.2, 5.8, 6.4],
      [2.3, 3.3, 4.0, 4.5, 4.9, 5.5, 6.1],
      [2.1, 3.1, 3.8, 4.3, 4.7, 5.3, 5.9],
    ],
  },
}
