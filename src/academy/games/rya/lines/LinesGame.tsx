import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { hullPoints, toWorld, type YachtState } from '../../../core/yacht'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { getStars, recordStars } from '../progress'
import { DirArrow, Feedback, Panel, StarsView, useFixedLoop } from '../ui'
import {
  BOAT_CLEATS,
  conditionsAt,
  judge,
  linesLevels,
  newTracker,
  OBSTACLES,
  roleOf,
  SHORE_CLEATS,
  START,
  TEST_SECONDS,
  testStep,
  toMooringLine,
  type FenderSpot,
  type LinesLevel,
  type PlacedLine,
  type TestResult,
} from './lines'

const PREFIX = 'competent-crew:lines'
const PX = 16
const VIEW = { x0: -2, x1: 16, y0: 4, y1: 36 }
const sx = (x: number) => (x - VIEW.x0) * PX
const sy = (y: number) => (VIEW.y1 - y) * PX

const FENDER_POS: Record<FenderSpot, number> = { bow: 3.1, mid: 0, quarter: -4.2 }

export function LinesGame() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const level = linesLevels.find((l) => l.id === search.get('level')) ?? linesLevels[0]
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {linesLevels.map((l, i) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSearch({ level: l.id }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${l.id === level.id ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {i + 1}. {t(`rya.ln.l.${l.id}` as MessageKey)} <StarsView n={getStars(`${PREFIX}:${l.id}`)} size="text-xs" />
          </button>
        ))}
      </div>
      <Mooring key={level.id} t={t} level={level} />
    </>
  )
}

function Mooring({ t, level }: { t: Translate; level: LinesLevel }) {
  const [placed, setPlaced] = useState<PlacedLine[]>([])
  const [fenders, setFenders] = useState<FenderSpot[]>([])
  const [from, setFrom] = useState<keyof typeof BOAT_CLEATS | null>(null)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [, setFrame] = useState(0)
  const sim = useRef({ s: START as YachtState, t: 0, tr: newTracker() })
  const seq = useRef(0)

  const lines = placed.map(toMooringLine)
  useFixedLoop(
    testing,
    (dt) => {
      const st = sim.current
      st.s = testStep(st.s, level.id, st.t, lines, fenders, st.tr, dt)
      st.t += dt
      if (st.t >= TEST_SECONDS) {
        setTesting(false)
        const r = judge(level, placed, fenders, st.tr)
        setResult(r)
        if (r.stars > 0) recordStars(`${PREFIX}:${level.id}`, r.stars as 2 | 3)
      }
    },
    () => setFrame((f) => (f + 1) % 1e6),
    60,
    3,
  )

  const startTest = () => {
    sim.current = { s: START, t: 0, tr: newTracker() }
    setResult(null)
    setTesting(true)
  }
  const resetBoat = () => {
    sim.current = { s: START, t: 0, tr: newTracker() }
    setResult(null)
    setTesting(false)
  }
  const clickShore = (i: number) => {
    if (!from || testing) return
    if (placed.length >= 6) return
    setPlaced((p) => [...p, { id: `l${seq.current++}`, from, to: i }])
    setFrom(null)
    resetBoat()
  }
  const toggleFender = (f: FenderSpot) => {
    if (testing) return
    setFenders((fs) => (fs.includes(f) ? fs.filter((x) => x !== f) : fs.length >= 3 ? fs : [...fs, f]))
    resetBoat()
  }

  const s = sim.current.s
  const cond = conditionsAt(level.id, sim.current.t)
  const hull = hullPoints.map((p) => toWorld(s, p))

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_19rem]">
      <div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <svg viewBox={`0 0 ${(VIEW.x1 - VIEW.x0) * PX} ${(VIEW.y1 - VIEW.y0) * PX}`} className="block max-h-[560px] w-full bg-[#9fd3ea] dark:bg-[#1c4a66]">
            {OBSTACLES.map((o) => (
              <polygon key={o.id} points={o.poly.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')} fill={o.kind === 'pontoon' ? '#b08b5a' : '#f8fafc'} stroke={o.kind === 'pontoon' ? '#5b4630' : '#64748b'} strokeWidth="1.5" />
            ))}
            {SHORE_CLEATS.map((c, i) => (
              <g key={i} onClick={() => clickShore(i)} className={from ? 'cursor-pointer' : ''}>
                <circle cx={sx(c.x)} cy={sy(c.y)} r={from ? 10 : 7} fill={from ? '#fbbf24' : '#334155'} stroke="#fff" strokeWidth="2" />
              </g>
            ))}
            {placed.map((l, i) => {
              const ml = lines[i]
              const p = toWorld(s, ml.at)
              return (
                <g key={l.id} onClick={() => !testing && (setPlaced((ps) => ps.filter((x) => x.id !== l.id)), resetBoat())} className="cursor-pointer">
                  <line x1={sx(p.x)} y1={sy(p.y)} x2={sx(ml.anchor.x)} y2={sy(ml.anchor.y)} stroke="#f59e0b" strokeWidth="4" />
                  <text x={(sx(p.x) + sx(ml.anchor.x)) / 2 + 8} y={(sy(p.y) + sy(ml.anchor.y)) / 2} fontSize="11" fill="#0b3a5c" fontWeight={600}>
                    {t(`rya.ln.role.${roleOf(l)}` as MessageKey)}
                  </text>
                </g>
              )
            })}
            <polygon points={hull.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')} fill="#0b3a5c" stroke="#fff" strokeWidth="2" />
            {(Object.keys(FENDER_POS) as FenderSpot[]).map((f) => {
              const p = toWorld(s, { a: FENDER_POS[f], b: -1.85 })
              const on = fenders.includes(f)
              return (
                <g key={f} onClick={() => toggleFender(f)} className="cursor-pointer">
                  <rect x={sx(p.x) - 5} y={sy(p.y) - 11} width="10" height="22" rx="5" fill={on ? '#e2e8f0' : 'transparent'} stroke={on ? '#334155' : '#fff'} strokeDasharray={on ? undefined : '3 2'} strokeWidth="1.5" />
                </g>
              )
            })}
            {(Object.keys(BOAT_CLEATS) as (keyof typeof BOAT_CLEATS)[]).map((k) => {
              const p = toWorld(s, BOAT_CLEATS[k])
              return (
                <g key={k} onClick={() => !testing && setFrom(from === k ? null : k)} className="cursor-pointer">
                  <circle cx={sx(p.x)} cy={sy(p.y)} r={from === k ? 9 : 7} fill={from === k ? '#fbbf24' : '#e2e8f0'} stroke="#0b3a5c" strokeWidth="2" />
                </g>
              )
            })}
          </svg>
          <div className="pointer-events-none absolute right-2 top-2 rounded-lg bg-white/85 p-2 text-xs dark:bg-navy-900/80">
            {cond.windKn > 0.5 && (
              <div className="flex items-center gap-1">
                <svg width="26" height="26" viewBox="-13 -13 26 26">
                  <DirArrow x={0} y={0} toDeg={cond.windFromDeg + 180} len={22} color="#0b3a5c" width={2} />
                </svg>
                {t('rya.wind')} {Math.round(cond.windKn)} {t('common.kn')}
              </div>
            )}
            {Math.abs(cond.streamKn) > 0.05 && (
              <div className="flex items-center gap-1">
                <svg width="26" height="26" viewBox="-13 -13 26 26">
                  <DirArrow x={0} y={0} toDeg={cond.streamKn >= 0 ? cond.streamSetDeg : cond.streamSetDeg + 180} len={22} color="#0891b2" width={2} />
                </svg>
                {t('rya.stream')} {Math.abs(cond.streamKn).toFixed(1)} {t('common.kn')}
              </div>
            )}
            {testing && <div className="mt-1 tabular-nums">⏱ {Math.round(sim.current.t)}/{TEST_SECONDS}s</div>}
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">🎯 {t(`rya.ln.l.${level.id}.goal` as MessageKey)}</p>
      </div>
      <Panel className="space-y-3 self-start">
        <div>
          <h3 className="text-sm font-semibold">{t('rya.ln.howTitle')}</h3>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-xs text-slate-600 dark:text-slate-300">
            <li>{t('rya.ln.how1')}</li>
            <li>{t('rya.ln.how2')}</li>
            <li>{t('rya.ln.how3')}</li>
          </ol>
        </div>
        <div className="text-sm">
          <div>
            🧷 {t('rya.ln.linesCount', { n: placed.length })} · 🎈 {t('rya.ln.fendersCount', { n: fenders.length })}
          </div>
          {from && <div className="mt-1 text-amber-700 dark:text-amber-300">{t('rya.ln.pickShore')}</div>}
        </div>
        <button type="button" className="btn-primary w-full" disabled={testing} onClick={startTest}>
          ▶ {t('rya.ln.test')}
        </button>
        <button type="button" className="btn-secondary w-full" disabled={testing} onClick={() => (setPlaced([]), setFenders([]), resetBoat())}>
          ↺ {t('rya.ln.clear')}
        </button>
        {result && <ResultView t={t} r={result} />}
      </Panel>
    </div>
  )
}

function ResultView({ t, r }: { t: Translate; r: TestResult }) {
  return (
    <div className="space-y-2">
      {r.passed ? (
        <div className="text-center">
          <StarsView n={r.stars} size="text-2xl" />
          <Feedback ok>{t('rya.ln.passed', { shift: r.shift.toFixed(1), yaw: Math.round(r.yaw) })}</Feedback>
        </div>
      ) : (
        <Feedback ok={false}>
          {t('rya.ln.failed')} {r.hitBoat && t('rya.ln.hitBoat')} {r.unfendered && t('rya.ln.scratch')} {r.shift >= 1.2 && t('rya.ln.drifted', { shift: r.shift.toFixed(1) })} {r.yaw >= 16 && t('rya.ln.swung', { yaw: Math.round(r.yaw) })}
        </Feedback>
      )}
      {r.missingRoles.length > 0 && (
        <p className="text-xs text-slate-600 dark:text-slate-300">💡 {t('rya.ln.missing')} {r.missingRoles.map((x) => t(`rya.ln.role.${x}` as MessageKey)).join(', ')}</p>
      )}
      {r.missingFenders.length > 0 && (
        <p className="text-xs text-slate-600 dark:text-slate-300">💡 {t('rya.ln.missingFenders')} {r.missingFenders.map((x) => t(`rya.ln.f.${x}` as MessageKey)).join(', ')}</p>
      )}
    </div>
  )
}
