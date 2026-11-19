import type { Lang } from '../../../i18n'
import { fmtBrg, fmtLocal, gateWindow, mainTide, secEvents, totalMinutes, totalNm, type PassagePlan } from './calc'
import type { Scenario } from './scenario'
import { fill, num, type ABlock, type AlmanacUi } from './text'

/** Values from a passage plan that scenario texts can quote as {placeholders} (times local). */
export function planVars(s: Scenario, p: PassagePlan, lang: Lang, u: AlmanacUi): Record<string, string> {
  const n = (v: number, d = 1) => num(v, lang, d)
  const v: Record<string, string> = {
    date: `${s.planDay} ${u.months[s.month - 1]}`,
    boat: s.boat.name,
    speed: n(s.boat.speed),
    draft: n(s.boat.draft),
    castOff: fmtLocal(s, p.castOff),
    depart: fmtLocal(s, p.depart),
    eta: fmtLocal(s, p.anchor),
    total: String(totalMinutes(p)),
    nm: n(totalNm(p)),
    gate: fmtLocal(s, p.barEta),
  }
  if (p.barHeight !== null) v.gateH = n(p.barHeight)
  if (p.need !== null) v.need = n(p.need)
  if (p.window) {
    v.open = fmtLocal(s, p.window.open)
    v.close = fmtLocal(s, p.window.close)
  }
  if (s.tidal) {
    const m = mainTide(s, p.day)
    v.hw = fmtLocal(s, m.hw.t)
    v.hwH = n(m.hw.h)
    v.range = n(m.range)
    v.f = n(p.factor!, 2)
    if (s.tidal.secondary) {
      const g = secEvents(s, p.day).find((e) => e.std.t === m.hw.t)!
      v.secHw = fmtLocal(s, g.t)
      v.secH = n(g.h)
    }
    const w = gateWindow(s, p.day)
    if (w) {
      v.dayOpen = fmtLocal(s, w.open)
      v.dayClose = fmtLocal(s, w.close)
    }
  }
  p.legs.forEach((l, i) => {
    const k = `l${i + 1}`
    v[`${k}track`] = fmtBrg(l.track)
    v[`${k}nm`] = n(l.nm)
    v[`${k}cts`] = fmtBrg(l.cts)
    v[`${k}ctsM`] = fmtBrg(l.ctsM)
    v[`${k}sog`] = n(l.sog)
    v[`${k}rate`] = n(l.rate)
    v[`${k}set`] = fmtBrg(l.set)
    v[`${k}min`] = String(l.minutes)
    v[`${k}end`] = fmtLocal(s, l.end)
    v[`${k}off`] = String(Math.round(Math.abs(l.offset)))
    if (l.setNm !== undefined) v.setNm = n(Math.abs(l.setNm))
  })
  return v
}

/** Fills {placeholders} in every string of a block. */
export function fillBlock(b: ABlock, vars: Record<string, string>): ABlock {
  const f = (x: string) => fill(x, vars)
  if ('p' in b) return { p: f(b.p) }
  if ('list' in b) return { list: b.list.map(f) }
  if ('steps' in b) return { steps: b.steps.map(f) }
  if ('ex' in b) return { ex: { title: f(b.ex.title), lines: b.ex.lines.map(f) } }
  if ('tip' in b) return { tip: f(b.tip) }
  if ('warn' in b) return { warn: f(b.warn) }
  if ('table' in b) return { table: { head: b.table.head.map(f), rows: b.table.rows.map((r) => r.map(f)) } }
  return b
}
