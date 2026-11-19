import { mod, type Field } from './field'

/** Synoptic charts for the drills. Units of 100 nm, x east, y north; window x 0–12, y 0–8. */
export interface QuizChart {
  id: string
  field: Field
  points: { id: 'A' | 'B' | 'C' | 'D'; x: number; y: number }[]
  /** Point that the cold front reaches next. */
  frontPoint: 'A' | 'B' | 'C' | 'D'
  labels: { kind: 'H' | 'L'; x: number; y: number }[]
}

export const CHART_W = 12
export const CHART_H = 8

export const QUIZ_CHARTS: QuizChart[] = [
  {
    id: 'atlantic',
    field: {
      base: 1016,
      systems: [
        { x: 3.6, y: 5.6, a: -28, sx: 3.2, sy: 2.8 },
        { x: 11.5, y: 1.2, a: 16, sx: 4, sy: 3.4 },
      ],
      fronts: [
        {
          kind: 'warm',
          pts: [
            [3.6, 5.6],
            [5.2, 5.1],
            [6.6, 4.1],
            [7.4, 2.8],
          ],
          side: 1,
        },
        {
          kind: 'cold',
          pts: [
            [3.6, 5.6],
            [4.1, 4.2],
            [3.8, 2.8],
            [3, 1.4],
            [2, 0.4],
          ],
          side: 1,
        },
      ],
      trough: 2,
      hemi: 'N',
      lat: 52,
    },
    points: [
      { id: 'A', x: 6.4, y: 2.4 },
      { id: 'B', x: 0.8, y: 7.4 },
      { id: 'C', x: 9.8, y: 5.6 },
      { id: 'D', x: 2.4, y: 3.4 },
    ],
    frontPoint: 'A',
    labels: [
      { kind: 'L', x: 3.6, y: 5.6 },
      { kind: 'H', x: 11.5, y: 1.2 },
    ],
  },
  {
    id: 'blocking',
    field: {
      base: 1014,
      systems: [
        { x: 7.5, y: 6.2, a: 22, sx: 4, sy: 3 },
        { x: 3, y: 1.6, a: -18, sx: 3, sy: 2.6 },
      ],
      fronts: [
        {
          kind: 'occluded',
          pts: [
            [3, 1.6],
            [4.6, 2.4],
            [5.8, 2],
          ],
          side: 1,
        },
        {
          kind: 'cold',
          pts: [
            [5.8, 2],
            [5.6, 0.9],
            [5, 0],
          ],
          side: 1,
        },
        {
          kind: 'warm',
          pts: [
            [5.8, 2],
            [7.2, 1.3],
            [8.2, 0.2],
          ],
          side: 1,
        },
      ],
      trough: 1.5,
      hemi: 'N',
      lat: 50,
    },
    points: [
      { id: 'A', x: 1.4, y: 6.6 },
      { id: 'B', x: 5.2, y: 3.8 },
      { id: 'C', x: 11.2, y: 6.8 },
      { id: 'D', x: 6.4, y: 1.2 },
    ],
    frontPoint: 'D',
    labels: [
      { kind: 'H', x: 7.5, y: 6.2 },
      { kind: 'L', x: 3, y: 1.6 },
    ],
  },
  {
    id: 'southern',
    field: {
      base: 1014,
      systems: [
        { x: 6.4, y: 2.2, a: -30, sx: 3.4, sy: 2.8 },
        { x: 1.6, y: 6.6, a: 16, sx: 4, sy: 3 },
      ],
      fronts: [
        {
          kind: 'cold',
          pts: [
            [6.4, 2.2],
            [5.9, 3.6],
            [5, 5],
            [4.2, 6.6],
            [3.6, 7.9],
          ],
          side: -1,
        },
        {
          kind: 'warm',
          pts: [
            [6.4, 2.2],
            [7.8, 3.1],
            [8.8, 4.5],
            [9.4, 6],
          ],
          side: -1,
        },
      ],
      trough: 2,
      hemi: 'S',
      lat: -45,
    },
    points: [
      { id: 'A', x: 7.4, y: 5.4 },
      { id: 'B', x: 2.4, y: 5.2 },
      { id: 'C', x: 10.8, y: 1.4 },
      { id: 'D', x: 6.4, y: 0.6 },
    ],
    frontPoint: 'A',
    labels: [
      { kind: 'L', x: 6.4, y: 2.2 },
      { kind: 'H', x: 1.6, y: 6.6 },
    ],
  },
]

/** Compass bearing (deg) from a point to a target. */
export const bearingTo = (x: number, y: number, tx: number, ty: number) => mod((Math.atan2(tx - x, ty - y) * 180) / Math.PI, 360)
