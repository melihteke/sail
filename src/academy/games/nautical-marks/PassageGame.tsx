import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { findLight, lightColorHex, lightState } from '../../core/lights'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { loadJson, saveJson } from '../../lib/storage'
import { useClock } from '../../lib/useClock'
import { BuoySvg } from './BuoySvg'
import { findLevel, levels, solutions } from './levels'
import { markById } from './marks'
import { bearingVec, checkPassage, PASS_RADIUS, type ChartLevel, type Pt, type Violation } from './passage'

const BEST_KEY = 'sg-passage-best'

function getPassageBest(): Record<string, number> {
  return loadJson<Record<string, number>>(BEST_KEY, {})
}

function recordStars(id: string, stars: number): boolean {
  const all = getPassageBest()
  if ((all[id] ?? 0) >= stars) return false
  all[id] = stars
  saveJson(BEST_KEY, all)
  return true
}

const polyPoints = (poly: Pt[]) => poly.map((p) => `${p.x},${p.y}`).join(' ')
const markName = (t: Translate, id: string) => t(`mark.${id}.name` as MessageKey)

function violationText(t: Translate, level: ChartLevel, v: Violation): string {
  switch (v.kind) {
    case 'land':
      return t('ps.v.land')
    case 'shoal':
      return t('ps.v.shoal')
    case 'zone':
      return t('ps.v.zone')
    case 'hitMark':
      return t('ps.v.hitMark', { mark: markName(t, level.marks[v.index].id) })
    case 'danger': {
      const rule = markById(level.marks[v.index].id).rule
      return t('ps.v.danger', { mark: markName(t, level.marks[v.index].id), r: rule.kind === 'danger' ? rule.radius : 0 })
    }
    case 'lateral':
      return t('ps.v.lateral', {
        mark: markName(t, level.marks[v.index].id),
        dir: t(v.withBuoyage ? 'ps.withBuoyage' : 'ps.againstBuoyage'),
        side: t(`side.${v.expected}` as MessageKey),
      })
    case 'cardinal':
      return t('ps.v.cardinal', { mark: markName(t, level.marks[v.index].id), side: t(`dir.${v.expected}` as MessageKey) })
  }
}

export function PassageGame() {
  const { levelId } = useParams()
  const level = findLevel(levelId)
  if (!level) return <Navigate to="/nautical-marks?tab=passage" replace />
  return <Passage key={level.id} level={level} />
}

function Passage({ level }: { level: ChartLevel }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const svgRef = useRef<SVGSVGElement>(null)
  const [waypoints, setWaypoints] = useState<Pt[]>([])
  const [violations, setViolations] = useState<Violation[] | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [hints, setHints] = useState(false)
  const [result, setResult] = useState<{ stars: number; newBest: boolean } | null>(null)
  const time = useClock(!!level.night, 20)
  const night = !!level.night
  const path = useMemo(() => [level.start, ...waypoints, level.finish], [level, waypoints])
  const done = !!result

  const edit = (fn: (w: Pt[]) => Pt[]) => {
    if (done) return
    setWaypoints(fn)
    setViolations(null)
  }

  const onChartClick = (e: MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    const ctm = svg?.getScreenCTM()
    if (!svg || !ctm) return
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    edit((w) => [...w, { x: Math.round(pt.x), y: Math.round(pt.y) }])
  }

  const check = () => {
    const v = checkPassage(level, waypoints)
    const n = attempts + 1
    setAttempts(n)
    setViolations(v)
    if (v.length === 0) {
      const stars = showSolution ? 1 : n === 1 ? 3 : n === 2 ? 2 : 1
      setResult({ stars, newBest: recordStars(level.id, stars) })
    }
  }

  const idx = levels.findIndex((l) => l.id === level.id)
  const nextLevel = levels[(idx + 1) % levels.length]
  const buoyage = bearingVec(level.buoyageDeg)
  const hasLateral = level.marks.some((m) => markById(m.id).rule.kind === 'lateral')
  const hasDanger = level.marks.some((m) => markById(m.id).rule.kind === 'danger')

  const c = night
    ? { water: '#0a1424', land: '#1b2333', landStroke: '#334155', shoal: '#10233d', shoalStroke: '#1e3a5f', zone: 'rgba(250,204,21,0.05)', route: '#e2e8f0' }
    : { water: '#cfe8f5', land: '#f1e2b4', landStroke: '#b08d57', shoal: '#9fd0ea', shoalStroke: '#5a9cc2', zone: 'rgba(250,204,21,0.18)', route: '#0b3a5c' }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-7.25rem)] lg:flex-row">
      <div className="flex-1 overflow-auto bg-slate-200 p-2 dark:bg-navy-950">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${level.width} ${level.height}`}
          className={`mx-auto block h-auto max-h-full w-full max-w-[1100px] rounded-lg shadow ${done ? '' : 'cursor-crosshair'}`}
          onClick={onChartClick}
          role="application"
          aria-label={t(`level.${level.id}.title` as MessageKey)}
        >
          <defs>
            <pattern id="ps-shoal" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke={c.shoalStroke} strokeWidth="1" opacity="0.5" />
            </pattern>
            <marker id="ps-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M0 0 L10 5 L0 10 Z" fill="#7c3aed" />
            </marker>
          </defs>
          <rect width={level.width} height={level.height} fill={c.water} />

          {level.zones.map((z, i) => (
            <polygon key={`z${i}`} points={polyPoints(z)} fill={c.zone} stroke="#eab308" strokeWidth="1.5" strokeDasharray="6 4" />
          ))}
          {level.shoals.map((s, i) => (
            <g key={`s${i}`}>
              <polygon points={polyPoints(s)} fill={c.shoal} stroke={c.shoalStroke} strokeDasharray="3 3" />
              <polygon points={polyPoints(s)} fill="url(#ps-shoal)" />
            </g>
          ))}
          {level.land.map((l, i) => (
            <polygon key={`l${i}`} points={polyPoints(l)} fill={c.land} stroke={c.landStroke} strokeWidth="1.5" />
          ))}

          {hints &&
            !night &&
            level.marks.map((m, i) => {
              const rule = markById(m.id).rule
              if (rule.kind !== 'cardinal') return null
              const r = PASS_RADIUS
              const half: Record<string, string> = {
                N: `M${m.at.x - r} ${m.at.y} A${r} ${r} 0 0 1 ${m.at.x + r} ${m.at.y} Z`,
                S: `M${m.at.x + r} ${m.at.y} A${r} ${r} 0 0 1 ${m.at.x - r} ${m.at.y} Z`,
                E: `M${m.at.x} ${m.at.y - r} A${r} ${r} 0 0 1 ${m.at.x} ${m.at.y + r} Z`,
                W: `M${m.at.x} ${m.at.y + r} A${r} ${r} 0 0 1 ${m.at.x} ${m.at.y - r} Z`,
              }
              return <path key={`h${i}`} d={half[rule.safeSide]} fill="rgba(31,154,77,0.15)" stroke="rgba(31,154,77,0.5)" strokeDasharray="4 4" />
            })}

          {!night &&
            level.marks.map((m, i) => {
              const rule = markById(m.id).rule
              return rule.kind === 'danger' ? (
                <g key={`d${i}`}>
                  <circle cx={m.at.x} cy={m.at.y} r={rule.radius} fill="none" stroke="#7c2d12" strokeDasharray="2 4" strokeWidth="1.5" />
                  {m.id === 'isolated' && (
                    <text x={m.at.x + 8} y={m.at.y + 18} fontSize="16" fill="#7c2d12">
                      ✱
                    </text>
                  )}
                </g>
              ) : null
            })}

          {showSolution && (
            <polyline
              points={polyPoints([level.start, ...solutions[level.id], level.finish])}
              fill="none"
              stroke="#16a34a"
              strokeWidth="3"
              strokeDasharray="10 8"
              opacity="0.8"
            />
          )}

          <polyline points={polyPoints(path)} fill="none" stroke={c.route} strokeWidth="3" strokeLinejoin="round" />

          {level.marks.map((m, i) => {
            const def = markById(m.id)
            if (night) {
              if (!def.lightId) return null
              const light = findLight(def.lightId)
              const s = lightState(light, time + i * 0.37)
              return (
                <g key={`m${i}`}>
                  <circle cx={m.at.x} cy={m.at.y} r="16" fill={lightColorHex[s.color]} opacity={s.on ? 0.35 : 0} />
                  <circle cx={m.at.x} cy={m.at.y} r="5" fill={s.on ? lightColorHex[s.color] : '#1e293b'} />
                  <title>{light.code}</title>
                </g>
              )
            }
            return (
              <g key={`m${i}`}>
                <circle cx={m.at.x} cy={m.at.y} r="3" fill="#111827" />
                <BuoySvg mark={def} x={m.at.x - 12} y={m.at.y - 38} width={24} height={40} noWater title={markName(t, m.id)} />
              </g>
            )
          })}

          <g transform={`translate(${level.start.x} ${level.start.y})`}>
            <circle r="14" fill="#0b3a5c" stroke="#fff" strokeWidth="2" />
            <text y="5" textAnchor="middle" fontSize="14" fill="#fff">
              ⛵
            </text>
          </g>
          <g transform={`translate(${level.finish.x} ${level.finish.y})`}>
            <circle r="14" fill="#f59e0b" stroke="#fff" strokeWidth="2" />
            <text y="5" textAnchor="middle" fontSize="14">
              ⚓
            </text>
          </g>

          {waypoints.map((w, i) => (
            <circle
              key={`w${i}`}
              cx={w.x}
              cy={w.y}
              r="9"
              fill="#1d5f8c"
              stroke="#fff"
              strokeWidth="2"
              className={done ? '' : 'cursor-pointer'}
              onClick={(e) => {
                e.stopPropagation()
                edit((ws) => ws.filter((_, j) => j !== i))
              }}
            />
          ))}

          {violations?.map((v, i) => (
            <circle key={`v${i}`} cx={v.at.x} cy={v.at.y} r="20" fill="none" stroke="#ef4444" strokeWidth="4">
              <animate attributeName="r" values="14;24;14" dur="1.4s" repeatCount="indefinite" />
            </circle>
          ))}

          <g transform="translate(40 50)" pointerEvents="none">
            <circle r="24" fill="rgba(255,255,255,0.85)" stroke="#94a3b8" />
            <path d="M0 18 V-16" stroke="#0b3a5c" strokeWidth="2.5" />
            <path d="M-6 -8 L0 -18 L6 -8 Z" fill="#0b3a5c" />
            <text y="-26" textAnchor="middle" fontSize="12" fontWeight="700" fill={night ? '#e2e8f0' : '#0b3a5c'}>
              N
            </text>
          </g>
          {hasLateral && (
            <g transform={`translate(${level.width - 60} ${level.height - 60})`} pointerEvents="none">
              <circle r="30" fill="rgba(255,255,255,0.85)" stroke="#c4b5fd" />
              <line x1={-buoyage.x * 20} y1={-buoyage.y * 20} x2={buoyage.x * 16} y2={buoyage.y * 16} stroke="#7c3aed" strokeWidth="3" markerEnd="url(#ps-arrow)" />
              <text y="44" textAnchor="middle" fontSize="11" fill="#7c3aed" fontWeight="600">
                {t('ps.buoyage')}
              </text>
            </g>
          )}
        </svg>
      </div>

      <aside className="w-full overflow-y-auto border-l border-slate-200 bg-white p-4 lg:w-[24rem] dark:border-white/10 dark:bg-navy-950">
        <Link to="/nautical-marks?tab=passage" className="text-sm text-sea-500 hover:underline">
          ← {t('ps.levels')}
        </Link>
        <h1 className="mt-1 text-xl font-bold">{t(`level.${level.id}.title` as MessageKey)}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(`level.${level.id}.desc` as MessageKey)}</p>
        {night && <p className="mt-2 rounded-lg bg-navy-900 p-2 text-xs text-slate-100">🌙 {t('ps.nightNote')}</p>}

        <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-5 border border-dashed border-sky-600 bg-sky-200" /> {t('ps.legendShoal')}
          </li>
          {level.zones.length > 0 && (
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-5 border border-dashed border-yellow-500 bg-yellow-100" /> {t('ps.legendZone')}
            </li>
          )}
          {hasDanger && (
            <li className="flex items-center gap-2">
              <span className="inline-block h-3 w-5 rounded-full border border-dashed border-orange-900" /> {t('ps.legendDanger')}
            </li>
          )}
          {hasLateral && (
            <li className="flex items-center gap-2">
              <span className="font-bold text-violet-600">→</span> {t('ps.buoyageHelp')}
            </li>
          )}
        </ul>

        {!done && (
          <section className="mt-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">{t('ps.hint')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" onClick={() => edit((w) => w.slice(0, -1))} disabled={!waypoints.length}>
                {t('rp.undo')}
              </button>
              <button type="button" className="btn-secondary" onClick={() => edit(() => [])} disabled={!waypoints.length}>
                {t('rp.clear')}
              </button>
              <button type="button" className="btn-primary ml-auto" onClick={check}>
                ✓ {t('ps.check')}
              </button>
            </div>
            {!night && (
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={hints} onChange={(e) => setHints(e.target.checked)} />
                {t('ps.showHints')}
              </label>
            )}
            {attempts > 0 && <p className="mt-2 text-xs text-slate-500">{t('ps.attempts', { n: attempts })}</p>}
          </section>
        )}

        {violations && violations.length > 0 && (
          <section className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100">
            <p className="font-semibold">{t('ps.problems')}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {violations.map((v, i) => (
                <li key={i}>{violationText(t, level, v)}</li>
              ))}
            </ul>
            {!showSolution && (
              <button type="button" className="btn-secondary mt-3" onClick={() => setShowSolution(true)}>
                {t('ps.showSolution')}
              </button>
            )}
          </section>
        )}

        {result && (
          <section className="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
            <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">{t('ps.success')}</p>
            <div className="mt-1 text-2xl tracking-widest text-amber-500" aria-label={`${result.stars}/3`}>
              {'★'.repeat(result.stars)}
              <span className="text-slate-300 dark:text-slate-600">{'★'.repeat(3 - result.stars)}</span>
            </div>
            {result.newBest && <p className="text-xs font-medium text-emerald-700">{t('res.newBest')}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setResult(null)
                  setViolations(null)
                  setWaypoints([])
                  setAttempts(0)
                  setShowSolution(false)
                }}
              >
                {t('nm.restart')}
              </button>
              <button type="button" className="btn-primary" onClick={() => navigate(`/nautical-marks/passage/${nextLevel.id}`)}>
                {t('ps.next')} →
              </button>
            </div>
          </section>
        )}
      </aside>
    </div>
  )
}

export function PassageLevels({ t }: { t: Translate }) {
  const best = getPassageBest()
  const regionBadge: Record<ChartLevel['region'], string> = { nl: '🇳🇱', med: '🌊', generic: '⚓' }
  const groups: { key: 'ps.dayCharts' | 'ps.nightCharts'; items: ChartLevel[] }[] = [
    { key: 'ps.dayCharts', items: levels.filter((l) => !l.night) },
    { key: 'ps.nightCharts', items: levels.filter((l) => l.night) },
  ]
  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{t('ps.intro')}</p>
      {groups.map((g) => (
        <section key={g.key} className="mt-6">
          <h2 className="text-lg font-semibold">
            {g.key === 'ps.nightCharts' ? '🌙 ' : '☀️ '}
            {t(g.key)}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {g.items.map((l, i) => (
              <Link
                key={l.id}
                to={`/nautical-marks/passage/${l.id}`}
                className={`block rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  l.night
                    ? 'border-navy-700 bg-navy-950 text-slate-100'
                    : 'border-slate-200 bg-white dark:border-white/10 dark:bg-navy-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">
                    {i + 1}. {t(`level.${l.id}.title` as MessageKey)}
                  </h3>
                  <span aria-hidden>{regionBadge[l.region]}</span>
                </div>
                <p className={`mt-1 text-sm ${l.night ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {t(`level.${l.id}.desc` as MessageKey)}
                </p>
                <div className="mt-2 text-lg tracking-widest text-amber-500">
                  {'★'.repeat(best[l.id] ?? 0)}
                  <span className="text-slate-400 dark:text-slate-600">{'★'.repeat(3 - (best[l.id] ?? 0))}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
