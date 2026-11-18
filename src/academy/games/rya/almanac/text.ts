import type { Lang } from '../../../i18n'
import type { Block, CheckQuestion } from '../lessons/lessons'
import { almanacEn } from './text.en'
import { almanacNl } from './text.nl'
import { almanacTr } from './text.tr'

export type AWidget =
  | 'chart'
  | 'levels'
  | 'tideTable'
  | 'curveHalyard'
  | 'curveGannet'
  | 'diffBox'
  | 'secondary'
  | 'atlas'
  | 'diamonds'
  | 'streamDay'
  | 'departure'
  | 'overview'
  | 'legs'
  | 'cts'
  | 'sheet'
  | 'practice'

/** Lesson blocks plus almanac widgets. */
export type ABlock = Block | { aw: AWidget }

export const CHAPTER_IDS = ['start', 'area', 'terms', 'halyard', 'gannet', 'streams', 'plan', 'route', 'cts', 'sheet', 'practice'] as const
export type ChapterId = (typeof CHAPTER_IDS)[number]

export interface Chapter {
  title: string
  short: string
  sections: { h: string; blocks: ABlock[] }[]
}

/** UI strings for the widgets. `{x}` placeholders are filled in by the widgets. */
export interface AlmanacUi {
  ut: string
  local: string
  height: string
  minutes: string
  chapters: string
  disclaimer: string
  weekdays: string[]
  month: string
  chart: { title: string; legs: string; diamonds: string; streams: string; hour: string; legend: string[]; scale: string; variation: string }
  levels: { title: string; hot: string; depthDeep: string; overBank: string; dries: string; bridge: string; charted: string; drying: string; elevation: string; clearance: string; formula: string[] }
  table: { title: string; springs: string; neaps: string; fullMoon: string; range: string; note: string }
  curve: { title: string; pickDay: string; pickTime: string; need: string; window: string; at: string }
  diff: { title: string; times: string; heights: string; hw: string; lw: string; differences: string; stdPort: string; bar: string }
  secondary: { title: string; pickDay: string; pickEvent: string; stepTime: string; stepHeight: string; result: string }
  diamonds: { title: string; hour: string; dir: string; today: string; range: string; calc: string }
  atlas: { title: string; hour: string; clock: string; note: string }
  streamDay: { title: string; hour: string; band: string; verdict: string; fair: string; foul: string; slack: string }
  departure: { title: string; depart: string; castOff: string; leg: string; stream: string; cts: string; sog: string; arrive: string; bar: string; total: string; ok: string; early: string; late: string; foulWarn: string; fairNote: string; timeline: string; windowLbl: string; fairLbl: string; passageLbl: string; options: string; verdict: string }
  overview: { title: string; rows: string[]; text: string }
  legs: { title: string; wpts: string; wpt: string; pos: string; note: string; wptNotes: string[]; legTable: string; leg: string; trueT: string; magM: string; dist: string; work: string }
  cts: { title: string; leg: string; custom: string; track: string; set: string; rate: string; speed: string; result: string; left: string; right: string; tooStrong: string; steps: string[]; groundTrack: string; waterTrack: string; streamVec: string }
  sheet: { title: string; print: string; header: string[]; tides: string; summary: string; timeline: string; events: string[]; legsH: string; notesH: string; notes: string[] }
  practice: { title: string; pickDay: string; intro: string; check: string; reveal: string; questions: string[]; answer: string; score: string }
  check: { title: string; intro: string; correct: string; wrong: string; score: string }
}

export interface AlmanacText {
  title: string
  intro: string
  chapters: Record<ChapterId, Chapter>
  check: CheckQuestion[]
  ui: AlmanacUi
}

export const almanacTexts: Record<Lang, AlmanacText> = { en: almanacEn, nl: almanacNl, tr: almanacTr }

/** Decimal comma for Dutch and Turkish. */
export function num(v: number, lang: Lang, digits = 1): string {
  const s = v.toFixed(digits)
  return lang === 'en' ? s : s.replace('.', ',')
}

export function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m))
}
