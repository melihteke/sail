import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { norm180 } from '../../../core/units'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { getStars, recordStars, starsFromScore } from '../progress'
import { Feedback, Panel, StarsView, useFixedLoop } from '../ui'
import { advance, aspectOf, bearingTo, cpa, lightScreenOffset, rangeTo, targetStart, visibleLights, type Vessel, type VesselType } from '../collision/encounter'

const PREFIX = 'competent-crew:lookout'
const TIME_SCALE = 0.5
const LIGHT_HEX = { white: '#fffbe6', red: '#ff3b30', green: '#34d399' }
export const TYPES: VesselType[] = ['powerSmall', 'powerLarge', 'sail', 'trawler', 'fishing', 'nuc', 'ram', 'cbd', 'anchored']
export type Aspect = 'headOn' | 'port' | 'starboard' | 'stern' | 'allRound'
export const ASPECTS: Aspect[] = ['headOn', 'port', 'starboard', 'stern', 'allRound']

const OWN: Vessel = { id: 'own', type: 'sail', pos: { x: 0, y: 0 }, course: 45, speed: 5 }

function tg(id: string, type: VesselType, course: number, speed: number, minutes: number, miss: number): Vessel {
  return { id, type, course, speed, pos: targetStart(OWN, course, speed, minutes, miss) }
}

export const LOOKOUT_LEVELS: Record<string, Vessel[]> = {
  dusk: [tg('a', 'powerSmall', 300, 10, 20, 0), tg('b', 'sail', 200, 5, 26, 1.2)],
  night: [tg('a', 'powerLarge', 230, 14, 18, 0.05), tg('b', 'trawler', 120, 4, 30, 1.5), { id: 'c', type: 'anchored', course: 0, speed: 0, pos: { x: -1.6, y: 2.2 } }],
  busy: [tg('a', 'cbd', 330, 12, 22, -1.4), tg('b', 'fishing', 90, 3, 25, 0), tg('c', 'nuc', 0, 0.5, 30, 1.8), tg('d', 'ram', 180, 6, 20, 0.9)],
}

/** The answer a lookout should give for the aspect of a vessel. */
export function aspectAnswer(v: Vessel, observer: Vessel): Aspect {
  if (v.type === 'anchored' || v.speed < 1) return v.type === 'anchored' ? 'allRound' : aspectBy(aspectOf(v, observer.pos))
  return aspectBy(aspectOf(v, observer.pos))
}

function aspectBy(rel: number): Aspect {
  if (Math.abs(rel) >= 112.5) return 'stern'
  if (Math.abs(rel) < 6) return 'headOn'
  return rel > 0 ? 'starboard' : 'port'
}

/** Risk of collision if the vessels would pass closer than half a mile holding course and speed. */
export function isRisk(v: Vessel, own: Vessel): boolean {
  return v.speed > 0 && cpa(own, v).cpa < 0.5
}

interface Report {
  type?: VesselType
  aspect?: Aspect
  risk?: boolean
  bearings: { min: number; brg: number }[]
  /** Correct answers, frozen when the report is made. */
  truth?: { type: VesselType; aspect: Aspect; risk: boolean }
}

export function LookoutGame() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const level = search.get('level') && LOOKOUT_LEVELS[search.get('level')!] ? search.get('level')! : 'dusk'
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.keys(LOOKOUT_LEVELS).map((id, i) => (
          <button
            key={id}
            type="button"
            onClick={() => setSearch({ level: id }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${id === level ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {i + 1}. {t(`rya.lo.l.${id}` as MessageKey)} <StarsView n={getStars(`${PREFIX}:${id}`)} size="text-xs" />
          </button>
        ))}
      </div>
      <Watch key={level} t={t} levelId={level} />
    </>
  )
}

function Watch({ t, levelId }: { t: Translate; levelId: string }) {
  const start = LOOKOUT_LEVELS[levelId]
  const sim = useRef({ own: OWN, targets: start, minutes: 0 })
  const [, setFrame] = useState(0)
  const [running, setRunning] = useState(false)
  const [sel, setSel] = useState<string | null>(null)
  const [reports, setReports] = useState<Record<string, Report>>(() => Object.fromEntries(start.map((v) => [v.id, { bearings: [] }])))
  const [finished, setFinished] = useState(false)

  useFixedLoop(
    running,
    (dt) => {
      const s = sim.current
      const m = dt * TIME_SCALE
      s.own = advance(s.own, m)
      s.targets = s.targets.map((v) => advance(v, m))
      s.minutes += m
      if (s.minutes > 25) {
        setRunning(false)
        setFinished(true)
      }
    },
    () => setFrame((f) => (f + 1) % 1e6),
    30,
  )

  const s = sim.current
  const target = s.targets.find((v) => v.id === sel)
  const report = sel ? reports[sel] : undefined
  const update = (id: string, patch: Partial<Report>) => setReports((r) => ({ ...r, [id]: { ...r[id], ...patch } }))

  const takeBearing = () => {
    if (!target || !report) return
    const last = report.bearings[0]
    if (last && s.minutes - last.min < 1) return
    update(target.id, { bearings: [{ min: s.minutes, brg: bearingTo(s.own.pos, target.pos) }, ...report.bearings].slice(0, 5) })
  }
  const answer = (patch: Partial<Report>) => {
    if (!target || !report || report.truth) return
    const next = { ...report, ...patch }
    if (next.type && next.aspect && next.risk !== undefined) {
      next.truth = { type: target.type, aspect: aspectAnswer(target, s.own), risk: isRisk(target, s.own) }
    }
    update(target.id, next)
    const done = Object.entries({ ...reports, [target.id]: next }).every(([, r]) => r.truth)
    if (done) {
      setRunning(false)
      setFinished(true)
    }
  }

  const points = Object.values(reports).reduce((sum, r) => sum + (r.truth ? Number(r.type === r.truth.type) + Number(r.aspect === r.truth.aspect) + Number(r.risk === r.truth.risk) : 0), 0)
  const max = start.length * 3
  const stars = starsFromScore(points, max)
  const recorded = useRef(false)
  if (finished && !recorded.current) {
    recorded.current = true
    if (stars > 0) recordStars(`${PREFIX}:${levelId}`, stars)
  }
  const restart = () => {
    sim.current = { own: OWN, targets: start, minutes: 0 }
    setReports(Object.fromEntries(start.map((v) => [v.id, { bearings: [] }])))
    setSel(null)
    setFinished(false)
    recorded.current = false
    setRunning(true)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div>
        <Panorama t={t} own={s.own} targets={s.targets} sel={sel} onSelect={setSel} reports={reports} />
        <div className="mt-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>
            🧭 {t('rya.lo.ownCourse', { c: s.own.course })} · ⏱ {Math.round(s.minutes)} min
          </span>
          {!running && !finished && (
            <button type="button" className="btn-primary" onClick={() => setRunning(true)}>
              ▶ {s.minutes > 0 ? t('rya.resume') : t('rya.start')}
            </button>
          )}
          {running && (
            <button type="button" className="btn-secondary" onClick={() => setRunning(false)}>
              ⏸
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">💡 {t('rya.lo.how')}</p>
        {finished && (
          <Panel className="mt-3 text-center">
            <StarsView n={stars} size="text-3xl" />
            <p className="mt-1 font-semibold">{t('rya.score', { score: points, max })}</p>
            <button type="button" className="btn-primary mt-2" onClick={restart}>
              ↺ {t('rya.retry')}
            </button>
          </Panel>
        )}
      </div>
      <Panel className="space-y-3 self-start">
        {!target || !report ? (
          <p className="text-sm text-slate-500">{t('rya.lo.select')}</p>
        ) : (
          <>
            <h3 className="font-semibold">
              {t('rya.lo.target')} {target.id.toUpperCase()}
            </h3>
            <div>
              <button type="button" className="btn-primary w-full" disabled={!running || !!report.truth} onClick={takeBearing}>
                🧭 {t('rya.cc.bearing')}
              </button>
              <ul className="mt-1 text-xs tabular-nums">
                {report.bearings.map((b, i) => {
                  const prev = report.bearings[i + 1]
                  const d = prev ? norm180(b.brg - prev.brg) : null
                  return (
                    <li key={b.min}>
                      {Math.round(b.min)}′ — <strong>{Math.round(b.brg)}°</strong> {d !== null && <span className={Math.abs(d) < 2 ? 'text-rose-600' : 'text-slate-500'}>{Math.abs(d) < 2 ? t('rya.cc.steady') : `${d > 0 ? '+' : ''}${d.toFixed(0)}°`}</span>}
                    </li>
                  )
                })}
              </ul>
            </div>
            <Choice t={t} label={t('rya.lo.q.type')} options={TYPES} value={report.type} keyOf={(x) => `rya.lo.type.${x}`} onPick={(x) => answer({ type: x as VesselType })} locked={!!report.truth} truth={report.truth?.type} />
            <Choice t={t} label={t('rya.lo.q.aspect')} options={ASPECTS} value={report.aspect} keyOf={(x) => `rya.lo.aspect.${x}`} onPick={(x) => answer({ aspect: x as Aspect })} locked={!!report.truth} truth={report.truth?.aspect} />
            <div>
              <div className="text-xs font-semibold text-slate-500">{t('rya.lo.q.risk')}</div>
              {report.bearings.length < 2 && !report.truth && <div className="text-xs text-amber-700 dark:text-amber-300">{t('rya.lo.needBearings')}</div>}
              <div className="mt-1 grid grid-cols-2 gap-1">
                {[true, false].map((r) => (
                  <button
                    key={String(r)}
                    type="button"
                    disabled={report.bearings.length < 2 && !report.truth}
                    onClick={() => !report.truth && answer({ risk: r })}
                    className={`btn-secondary text-xs ${report.risk === r ? '!border-navy-900 dark:!border-sea-500' : ''} ${report.truth && report.truth.risk === r ? '!bg-emerald-50 dark:!bg-emerald-950/50' : ''}`}
                  >
                    {t(r ? 'rya.lo.risk' : 'rya.lo.clear')}
                  </button>
                ))}
              </div>
            </div>
            {report.truth && (
              <Feedback ok={report.type === report.truth.type && report.aspect === report.truth.aspect && report.risk === report.truth.risk}>
                {t(`rya.lo.why.${report.truth.type}` as MessageKey)}
              </Feedback>
            )}
          </>
        )}
      </Panel>
    </div>
  )
}

function Choice({ t, label, options, value, keyOf, onPick, locked, truth }: { t: Translate; label: string; options: string[]; value?: string; keyOf: (x: string) => string; onPick: (x: string) => void; locked: boolean; truth?: string }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 grid grid-cols-2 gap-1">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => !locked && onPick(o)}
            className={`btn-secondary px-2 text-left text-xs ${value === o ? '!border-navy-900 dark:!border-sea-500' : ''} ${truth === o ? '!bg-emerald-50 dark:!bg-emerald-950/50' : ''} ${locked && value === o && truth !== o ? '!bg-rose-50 dark:!bg-rose-950/50' : ''}`}
          >
            {t(keyOf(o) as MessageKey)}
          </button>
        ))}
      </div>
    </div>
  )
}

/** 360° view around the yacht at night: only the lights are visible. */
function Panorama({ t, own, targets, sel, onSelect, reports }: { t: Translate; own: Vessel; targets: Vessel[]; sel: string | null; onSelect: (id: string) => void; reports: Record<string, Report> }) {
  const W = 900
  const H = 150
  const horizon = H * 0.62
  const labels = useMemo(() => [-180, -135, -90, -45, 0, 45, 90, 135, 180], [])
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 bg-gradient-to-b from-[#020617] via-[#0b1730] to-[#020617]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block min-w-[640px]">
        <line x1="0" x2={W} y1={horizon} y2={horizon} stroke="#1e293b" />
        {labels.map((a) => (
          <g key={a}>
            <line x1={W / 2 + (a / 180) * (W / 2)} x2={W / 2 + (a / 180) * (W / 2)} y1={horizon + 4} y2={horizon + 10} stroke="#334155" />
            <text x={W / 2 + (a / 180) * (W / 2)} y={H - 8} fontSize="10" fill="#64748b" textAnchor="middle">
              {a === 0 ? t('rya.cc.ahead') : Math.abs(a) === 180 ? t('rya.lo.astern') : `${Math.round((own.course + a + 360) % 360)}°`}
            </text>
          </g>
        ))}
        <path d={`M${W / 2 - 40} ${H} Q${W / 2} ${horizon + 22} ${W / 2 + 40} ${H}`} fill="#0f172a" stroke="#334155" />
        {targets.map((v) => {
          const rel = aspectOf(own, v.pos)
          const x = W / 2 + (rel / 180) * (W / 2)
          const range = rangeTo(own.pos, v.pos)
          const k = Math.max(1.1, Math.min(3, 3 / range))
          const aspect = aspectOf(v, own.pos)
          const r = reports[v.id]
          return (
            <g key={v.id} transform={`translate(${x} ${horizon})`} onClick={() => onSelect(v.id)} className="cursor-pointer">
              <rect x={-18} y={-50} width={36} height={56} fill="transparent" stroke={sel === v.id ? '#fbbf24' : 'transparent'} strokeDasharray="3 3" rx="6" />
              {visibleLights(v.type, aspect, v.speed > 0).map((l, i) => (
                <circle key={i} cx={lightScreenOffset(l, aspect) * 9 * k} cy={-l.h * 7 * k} r={3 * k} fill={LIGHT_HEX[l.colour]} style={{ filter: `drop-shadow(0 0 5px ${LIGHT_HEX[l.colour]})` }} />
              ))}
              <text y={18} fontSize="10" textAnchor="middle" fill={r?.truth ? '#34d399' : '#94a3b8'}>
                {v.id.toUpperCase()}
                {r?.truth ? ' ✓' : ''}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
