import type { Lang } from '../../../i18n'
import type { Block, CheckQuestion } from '../lessons/lessons'

export type AWidget =
  | 'chart'
  | 'levels'
  | 'tideTable'
  | 'curveStd'
  | 'curveGate'
  | 'diffBox'
  | 'secondary'
  | 'atlas'
  | 'diamonds'
  | 'streamDay'
  | 'currents'
  | 'departure'
  | 'overview'
  | 'legs'
  | 'cts'
  | 'sheet'
  | 'practice'
  | 'scenarios'

/** Lesson blocks plus almanac widgets. Text may contain {placeholders} filled from the scenario's plan. */
export type ABlock = Block | { aw: AWidget }

export const CHAPTER_IDS = ['start', 'area', 'terms', 'halyard', 'gannet', 'streams', 'plan', 'route', 'cts', 'sheet', 'practice'] as const
export type ChapterId = (typeof CHAPTER_IDS)[number]

export interface Chapter {
  title: string
  short: string
  sections: { h: string; blocks: ABlock[] }[]
}

/** Generic UI strings for the widgets. `{x}` placeholders are filled in by the widgets. */
export interface AlmanacUi {
  ut: string
  local: string
  height: string
  minutes: string
  chapters: string
  disclaimer: string
  weekdays: string[]
  months: string[]
  chart: { legs: string; diamonds: string; streams: string; currents: string; hour: string; scale: string; variation: string }
  levels: { title: string; hot: string; depthDeep: string; overBank: string; dries: string; bridge: string; charted: string; drying: string; elevation: string; clearance: string; formula: string[] }
  table: { title: string; springs: string; neaps: string; fullMoon: string; range: string; note: string }
  curve: { title: string; pickDay: string; pickTime: string; need: string; window: string; at: string }
  diff: { title: string; times: string; heights: string; hw: string; lw: string; differences: string; stdPort: string }
  secondary: { title: string; pickDay: string; pickEvent: string; stepTime: string; stepHeight: string; result: string }
  diamonds: { title: string; hour: string; dir: string; today: string; range: string; calc: string }
  atlas: { title: string; hour: string; clock: string; note: string }
  streamDay: { title: string; hour: string; band: string; verdict: string; fair: string; foul: string; slack: string }
  currents: { title: string; leg: string; set: string; rate: string; effect: string; head: string; cross: string; behind: string; note: string }
  departure: {
    title: string
    depart: string
    castOff: string
    leg: string
    stream: string
    cts: string
    sog: string
    arrive: string
    bar: string
    sill: string
    total: string
    ok: string
    early: string
    late: string
    sillOk: string
    sillEarly: string
    sillLate: string
    foulWarn: string
    fairNote: string
    timeline: string
    windowLbl: string
    fairLbl: string
    passageLbl: string
    options: string
    verdict: string
    setLane: string
  }
  overview: { title: string; date: string; std: string; sec: string; gate: string; fair: string; castOff: string; gateAt: string; arrive: string; current: string }
  legs: { title: string; wpts: string; wpt: string; pos: string; note: string; legTable: string; leg: string; trueT: string; magM: string; dist: string; work: string; fixed: string }
  cts: { title: string; leg: string; custom: string; track: string; set: string; rate: string; speed: string; result: string; left: string; right: string; tooStrong: string; steps: string[]; groundTrack: string; waterTrack: string; streamVec: string }
  sheet: {
    title: string
    print: string
    header: string[]
    tides: string
    summary: string
    timeline: string
    ev: { castOff: string; depart: string; wpt: string; tss: string; gate: string; arrive: string }
    legsH: string
    notesH: string
  }
  practice: {
    title: string
    pickDay: string
    intro: string
    introCurrent: string
    check: string
    reveal: string
    q: { stdHw: string; range: string; secHw: string; secH: string; gate: string; rate: string; cts: string; sog: string; set: string; eta: string }
    answer: string
    score: string
  }
  check: { title: string; intro: string; correct: string; wrong: string; score: string }
  sc: {
    more: string
    moreIntro: string
    open: string
    back: string
    backMain: string
    h: { brief: string; almanac: string; tides: string; gate: string; streams: string; departure: string; overview: string; route: string; cts: string; sheet: string; practice: string }
    tidesTable: string
  }
}

/** Texts belonging to one scenario. Strings may use {placeholders} from the plan (see planVars). */
export interface ScenarioText {
  title: string
  short: string
  summary: string
  chartTitle: string
  legend: string[]
  wptNotes: string[]
  notes: string[]
  overview: string
  gateNote?: string
  practiceLabels?: string[]
  sections?: Partial<Record<keyof AlmanacUi['sc']['h'], ABlock[]>>
}

export interface AlmanacText {
  title: string
  intro: string
  chapters: Record<ChapterId, Chapter>
  check: CheckQuestion[]
  ui: AlmanacUi
}

/** Decimal comma for Dutch and Turkish. */
export function num(v: number, lang: Lang, digits = 1): string {
  const s = v.toFixed(digits)
  return lang === 'en' ? s : s.replace('.', ',')
}

export function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m))
}
