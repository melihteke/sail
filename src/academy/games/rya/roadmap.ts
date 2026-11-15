/** The RYA cruising scheme (sail) from first taste to ocean, with the sea time each step asks for. */
export type StepId = 'startYachting' | 'competentCrew' | 'daySkipper' | 'coastalSkipper' | 'ymCoastal' | 'ymOffshore' | 'ymOcean'

export interface Experience {
  days: number
  skipperDays: number
  miles: number
  nightHours: number
  /** Passages over 60 NM. */
  passages: number
  src: boolean
  firstAid: boolean
  ymOffshore: boolean
  oceanPassage: boolean
}

export type Requirement = Partial<Record<'days' | 'skipperDays' | 'miles' | 'nightHours' | 'passages', number>> & {
  src?: boolean
  firstAid?: boolean
  ymOffshore?: boolean
  oceanPassage?: boolean
}

export interface RoadStep {
  id: StepId
  kind: 'course' | 'exam'
  /** Course length in days (courses only). */
  courseDays?: number
  minAge?: number
  req: Requirement
  /** Shorebased theory course that goes with this step. */
  theory?: 'essential' | 'daySkipperTheory' | 'coastalTheory' | 'oceanTheory'
  /** Route of the academy section when the content exists. */
  path?: string
}

export const roadmap: RoadStep[] = [
  { id: 'startYachting', kind: 'course', courseDays: 2, minAge: 8, req: {} },
  { id: 'competentCrew', kind: 'course', courseDays: 5, minAge: 12, req: {}, theory: 'essential', path: '/rya/competent-crew' },
  { id: 'daySkipper', kind: 'course', courseDays: 5, minAge: 16, req: { days: 5, miles: 100, nightHours: 4 }, theory: 'daySkipperTheory', path: '/rya/day-skipper' },
  { id: 'coastalSkipper', kind: 'course', courseDays: 5, minAge: 17, req: { days: 15, skipperDays: 2, miles: 300, nightHours: 8 }, theory: 'coastalTheory' },
  { id: 'ymCoastal', kind: 'exam', minAge: 17, req: { days: 30, skipperDays: 2, miles: 800, nightHours: 12, src: true, firstAid: true }, theory: 'coastalTheory' },
  { id: 'ymOffshore', kind: 'exam', minAge: 18, req: { days: 50, skipperDays: 5, miles: 2500, passages: 5, src: true, firstAid: true }, theory: 'coastalTheory' },
  { id: 'ymOcean', kind: 'exam', req: { ymOffshore: true, oceanPassage: true, src: true, firstAid: true }, theory: 'oceanTheory' },
]

export const NUMERIC_REQS = ['days', 'skipperDays', 'miles', 'nightHours', 'passages'] as const
export const FLAG_REQS = ['src', 'firstAid', 'ymOffshore', 'oceanPassage'] as const

export interface ReqCheck {
  key: (typeof NUMERIC_REQS)[number] | (typeof FLAG_REQS)[number]
  need: number | boolean
  have: number | boolean
  met: boolean
}

export function checkStep(step: RoadStep, xp: Experience): ReqCheck[] {
  const out: ReqCheck[] = []
  for (const k of NUMERIC_REQS) {
    const need = step.req[k]
    if (need !== undefined) out.push({ key: k, need, have: xp[k], met: xp[k] >= need })
  }
  for (const k of FLAG_REQS) {
    if (step.req[k]) out.push({ key: k, need: true, have: xp[k], met: xp[k] })
  }
  return out
}

export function isReady(step: RoadStep, xp: Experience): boolean {
  return checkStep(step, xp).every((c) => c.met)
}

/** Index of the furthest step whose prerequisites are all met (every earlier step must be met too). */
export function readyIndex(xp: Experience): number {
  let idx = 0
  for (let i = 0; i < roadmap.length; i++) {
    if (isReady(roadmap[i], xp)) idx = i
    else break
  }
  return idx
}

export const emptyExperience: Experience = {
  days: 0,
  skipperDays: 0,
  miles: 0,
  nightHours: 0,
  passages: 0,
  src: false,
  firstAid: false,
  ymOffshore: false,
  oceanPassage: false,
}
