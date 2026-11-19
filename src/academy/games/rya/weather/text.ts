import type { Lang } from '../../../i18n'
import type { Block, CheckQuestion } from '../lessons/lessons'
import type { ZoneId } from './field'
import { weatherEn } from './text.en'
import { weatherNl } from './text.nl'
import { weatherTr } from './text.tr'

export type WWidget = 'globe' | 'pressure' | 'buys' | 'isobars' | 'clouds' | 'symbols' | 'passage' | 'seabreeze' | 'beaufort' | 'trs' | 'forecast'
export type WDrill = 'synoptic' | 'route' | 'order' | 'beaufortGuess' | 'cloudGuess' | 'buysDrill' | 'trsDrill' | 'gonogo'

export type WBlock = Block | { ww: WWidget } | { wd: WDrill }

export const W_CHAPTERS = ['start', 'global', 'pressure', 'isobars', 'airmass', 'clouds', 'fronts', 'local', 'beaufort', 'tropical', 'forecasts', 'drills'] as const
export type WChapterId = (typeof W_CHAPTERS)[number]

export const CLOUD_IDS = ['ci', 'cc', 'cs', 'ac', 'as', 'ns', 'sc', 'st', 'cu', 'cb'] as const
export type CloudId = (typeof CLOUD_IDS)[number]
export const SYMBOL_IDS = ['cold', 'warm', 'occluded', 'stationary', 'trough', 'isobar', 'high', 'low'] as const
export type SymbolId = (typeof SYMBOL_IDS)[number]
export const BAND_IDS = ['polarE', 'subpolar', 'westerlies', 'horse', 'trades', 'itcz'] as const
export type BandId = (typeof BAND_IDS)[number]
export const TERM_IDS = ['imminent', 'soon', 'later', 'veering', 'backing', 'occasionally', 'becoming', 'variable', 'cyclonic', 'gale', 'severe', 'good', 'moderate', 'poor', 'veryPoor', 'fog', 'slight', 'modSea', 'rough', 'veryRough'] as const
export type TermId = (typeof TERM_IDS)[number]

export interface WChapter {
  title: string
  short: string
  sections: { h: string; blocks: WBlock[] }[]
}

export interface McItem {
  q: string
  options: string[]
  answer: number
  why: string
}

/** Strings used by the widgets and drills. `{x}` placeholders are filled in. */
export interface WeatherUi {
  chapters: string
  disclaimer: string
  play: string
  pause: string
  hemi: string
  nh: string
  sh: string
  correct: string
  wrong: string
  next: string
  again: string
  score: string
  check: string
  round: string
  final: { title: string; intro: string }
  /** 8-point compass, N first. */
  compass: string[]
  months: string[]
  globe: { title: string; month: string; hint: string; cells: string; bands: Record<BandId, { name: string; text: string }> }
  pressure: { title: string; friction: string; frictionOpts: [string, string, string]; high: string; low: string; note: string }
  buys: { title: string; windFrom: string; rule: string; ruleS: string; low: string; high: string }
  isobars: { title: string; spacing: string; lat: string; geo: string; surface: string; force: string; note: string }
  clouds: { title: string; hint: string; bands: { high: string; mid: string; low: string; vertical: string }; info: Record<CloudId, { name: string; text: string }> }
  symbols: { title: string; hint: string; items: Record<SymbolId, { name: string; text: string }>; barbs: string; barbsText: string }
  passage: {
    title: string
    time: string
    hours: string
    labels: { pressure: string; tendency: string; wind: string; sky: string; weather: string; vis: string; temp: string; zone: string }
    tendency: string[]
    rising: string
    falling: string
    section: string
    barograph: string
    zones: Record<ZoneId, { name: string; sky: string; weather: string; vis: string; temp: string }>
  }
  seabreeze: { title: string; time: string; gradient: string; land: string; sea: string; result: string; onshore: string; offshore: string; calm: string; sb: string; lb: string; none: string; note: string }
  beaufort: { title: string; force: string; kn: string; wave: string; names: string[]; sea: string[]; action: string[] }
  trs: { title: string; hint: string; dangerous: string; navigable: string; path: string; track: string; advice: Record<'dangerous' | 'navigable' | 'path', string>; adviceS: Record<'dangerous' | 'navigable' | 'path', string> }
  forecast: { title: string; hint: string; sample: string; terms: Record<TermId, string> }
  drills: {
    synoptic: {
      title: string
      intro: string
      qStrong: string
      qDir: string
      qHigh: string
      qFront: string
      frontN: string[]
      frontS: string[]
      qLow: string
      chart: string
      whyStrong: string
      whyDir: string
      whyHigh: string
      whyFrontN: string
      whyFrontS: string
      whyLow: string
      left: string
      right: string
    }
    route: {
      title: string
      intro: string
      month: string
      monthNames: Record<'nov' | 'feb' | 'jul' | 'sep', string>
      presets: Record<'rhumb' | 'butter' | 'south' | 'north', string>
      add: string
      undo: string
      clear: string
      sail: string
      days: string
      dayUnit: string
      dist: string
      avg: string
      calm: string
      gale: string
      hurricane: string
      land: string
      best: string
      verdict: { great: string; ok: string; slow: string }
      legend: string
    }
    order: { title: string; intro: string; cards: string[]; ok: string; bad: string; reset: string }
    beaufortGuess: { title: string; intro: string; q: string }
    cloudGuess: { title: string; intro: string; q: string; q2: string }
    buysDrill: { title: string; intro: string; q: string }
    trsDrill: { title: string; intro: string; q: string; qAction: string; actions: string[] }
    gonogo: { title: string; intro: string; items: McItem[] }
  }
}

export interface WeatherText {
  title: string
  intro: string
  chapters: Record<WChapterId, WChapter>
  check: CheckQuestion[]
  ui: WeatherUi
}

export const weatherTexts: Record<Lang, WeatherText> = { en: weatherEn, nl: weatherNl, tr: weatherTr }

export function num(v: number, lang: Lang, digits = 1): string {
  const s = v.toFixed(digits)
  return lang === 'en' ? s : s.replace('.', ',')
}

export function fill(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m))
}
