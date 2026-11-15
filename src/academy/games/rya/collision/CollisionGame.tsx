import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { norm180 } from '../../../core/units'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { hornSymbols, playHorn } from '../../../lib/horn'
import { shuffled } from '../../../lib/random'
import { getStars, recordStars } from '../progress'
import { Feedback, Panel, StarsView, useFixedLoop } from '../ui'
import {
  advance,
  aspectOf,
  bearingTo,
  buildScenarios,
  cpa,
  encounterStars,
  fogSignal,
  isForwardOfBeam,
  lightScreenOffset,
  newHistory,
  rangeTo,
  scoreEncounter,
  turnTowards,
  visibleLights,
  type History,
  type Scenario,
  type Score,
  type Vessel,
} from './encounter'

const PREFIX = 'day-skipper:collision'
const NM = 42
const VIEW = 5
/** Simulated minutes per real second. */
const TIME_SCALE = 0.5

export function CollisionGame() {
  const { t } = useI18n()
  const scenarios = useMemo(buildScenarios, [])
  const [search, setSearch] = useSearchParams()
  const sc = scenarios.find((s) => s.id === search.get('level')) ?? scenarios[0]
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSearch({ level: s.id }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${s.id === sc.id ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {i + 1}. {t(`rya.cc.s.${s.id}` as MessageKey)} <StarsView n={getStars(`${PREFIX}:${s.id}`)} size="text-xs" />
          </button>
        ))}
      </div>
      <Encounter key={sc.id} t={t} sc={sc} next={scenarios[scenarios.indexOf(sc) + 1]?.id} onNext={(id) => setSearch({ level: id }, { replace: true })} />
    </>
  )
}

interface Sim {
  own: Vessel
  targets: Vessel[]
  minutes: number
  history: History
  lastHorn: number
  targetAltered: boolean
  done: boolean
}

function initialSim(sc: Scenario): Sim {
  return { own: sc.own, targets: sc.targets, minutes: 0, history: newHistory(), lastHorn: -99, targetAltered: false, done: false }
}

function Encounter({ t, sc, next, onNext }: { t: Translate; sc: Scenario; next?: string; onNext: (id: string) => void }) {
  const [phase, setPhase] = useState<'brief' | 'run' | 'done'>('brief')
  const [, setFrame] = useState(0)
  const [wantCourse, setWantCourse] = useState(sc.own.course)
  const [speedF, setSpeedF] = useState(1)
  const [bearings, setBearings] = useState<{ min: number; brg: number; range: number }[]>([])
  const [score, setScore] = useState<Score | null>(null)
  const [quiz, setQuiz] = useState<string | null>(null)
  const [sound, setSound] = useState(false)
  const sim = useRef<Sim>(initialSim(sc))
  const control = useRef({ wantCourse, speedF })
  control.current = { wantCourse, speedF }

  const finish = () => {
    if (sim.current.done) return
    sim.current.done = true
    const sc2 = scoreEncounter(sc, sim.current.history)
    setScore(sc2)
    setPhase('done')
    const stars = encounterStars(sc2)
    if (stars > 0) recordStars(`${PREFIX}:${sc.id}`, stars)
  }

  useFixedLoop(
    phase === 'run',
    (dt) => {
      const s = sim.current
      if (s.done) return
      const m = dt * TIME_SCALE
      const c = control.current
      const course = turnTowards(s.own.course, c.wantCourse, 40 * dt)
      s.own = advance({ ...s.own, course, speed: sc.own.speed * c.speedF }, m)
      s.targets = s.targets.map((tg) => {
        let v = tg
        if (sc.targetAltersAt && !s.targetAltered && rangeTo(s.own.pos, tg.pos) < sc.targetAltersAt) {
          s.targetAltered = true
          v = { ...v, course: v.course + 35 }
        }
        return advance(v, m)
      })
      s.minutes += m
      const h = s.history
      const tg = s.targets[0]
      const range = rangeTo(s.own.pos, tg.pos)
      h.minRange = Math.min(h.minRange, range)
      const dev = norm180(s.own.course - sc.own.course)
      h.maxDeviation = Math.max(h.maxDeviation, Math.abs(dev))
      if (c.speedF < 0.5) h.slowed = true
      if (h.firstActionRange === null && (Math.abs(dev) > 5 || c.speedF < 0.7)) {
        h.firstActionRange = range
        h.firstActionSide = Math.abs(dev) > 5 ? (dev > 0 ? 1 : -1) : 0
      }
      if (sc.visibility === 'fog' && dev < -5 && isForwardOfBeam(s.own, tg.pos)) h.portForForward = true
      if (sound && sc.visibility === 'fog' && s.minutes - s.lastHorn > 4) {
        s.lastHorn = s.minutes
        playHorn(fogSignal(tg.type, false), { long: 1.6, short: 0.5, gap: 0.4 })
      }
      if (range < sc.minCpa) return finish()
      const { tcpa } = cpa(s.own, tg)
      if ((tcpa <= 0 && range > 1.2 && s.minutes > 3) || s.minutes > 45) finish()
    },
    () => setFrame((f) => (f + 1) % 1e6),
    30,
  )

  const takeBearing = () => {
    const s = sim.current
    const tg = s.targets[0]
    const brg = bearingTo(s.own.pos, tg.pos)
    setBearings((b) => [{ min: s.minutes, brg, range: rangeTo(s.own.pos, tg.pos) }, ...b].slice(0, 6))
    if (s.history.firstActionRange === null) s.history.bearingsBeforeAction++
  }
  const restart = () => {
    sim.current = initialSim(sc)
    setWantCourse(sc.own.course)
    setSpeedF(1)
    setBearings([])
    setScore(null)
    setQuiz(null)
    setPhase('brief')
  }
  const begin = () => {
    if (sc.visibility === 'fog') sim.current.history.fogSignalOk = quiz === '-'
    setPhase('run')
  }

  const s = sim.current
  const night = sc.visibility === 'night'
  const fog = sc.visibility === 'fog'

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_19rem]">
      <div>
        <Plot t={t} sc={sc} sim={s} />
        {night && <Horizon t={t} own={s.own} targets={s.targets} />}
        {phase === 'brief' && <Brief t={t} sc={sc} quiz={quiz} setQuiz={setQuiz} onStart={begin} />}
        {phase === 'done' && score && <ScoreView t={t} sc={sc} score={score} onRetry={restart} next={next} onNext={onNext} />}
      </div>
      <Panel className="space-y-3 self-start">
        <div className="grid grid-cols-2 gap-1 text-sm tabular-nums">
          <span>🧭 {Math.round(s.own.course)}°</span>
          <span>
            🚤 {(sc.own.speed * speedF).toFixed(0)} {t('common.kn')}
          </span>
          <span>📏 {rangeTo(s.own.pos, s.targets[0].pos).toFixed(1)} NM</span>
          <span>⏱ {Math.round(s.minutes)} min</span>
        </div>
        <div>
          <div className="text-sm font-semibold">{t('rya.cc.helm')}</div>
          <div className="mt-1 grid grid-cols-4 gap-1">
            {[-30, -10, 10, 30].map((d) => (
              <button key={d} type="button" className="btn-secondary px-1" disabled={phase !== 'run'} onClick={() => setWantCourse((c) => (c + d + 360) % 360)}>
                {d > 0 ? `+${d}` : d}°
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">{t('rya.cc.helmHint', { c: Math.round(wantCourse) })}</p>
        </div>
        {!sc.ownSail && (
          <div>
            <div className="text-sm font-semibold">{t('rya.cc.engine')}</div>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {[1, 0.5, 0].map((f) => (
                <button key={f} type="button" className={`btn-secondary px-1 ${speedF === f ? '!border-navy-900 dark:!border-sea-500' : ''}`} disabled={phase !== 'run'} onClick={() => setSpeedF(f)}>
                  {t(f === 1 ? 'rya.cc.full' : f === 0.5 ? 'rya.cc.half' : 'rya.cc.stop')}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <button type="button" className="btn-primary w-full" disabled={phase !== 'run'} onClick={takeBearing}>
            🧭 {t('rya.cc.bearing')}
          </button>
          <table className="mt-2 w-full text-xs tabular-nums">
            <tbody>
              {bearings.map((b, i) => {
                const prev = bearings[i + 1]
                const diff = prev ? norm180(b.brg - prev.brg) : null
                return (
                  <tr key={b.min} className="border-b border-slate-100 dark:border-white/5">
                    <td>{Math.round(b.min)}′</td>
                    <td className="font-semibold">{Math.round(b.brg)}°</td>
                    <td>{b.range.toFixed(1)} NM</td>
                    <td className={diff !== null && Math.abs(diff) < 2 ? 'text-rose-600' : 'text-slate-500'}>{diff === null ? '' : Math.abs(diff) < 2 ? t('rya.cc.steady') : `${diff > 0 ? '+' : ''}${diff.toFixed(0)}°`}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {fog && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> 🔊 {t('rya.cc.sound')}
          </label>
        )}
        <button type="button" className="btn-secondary w-full" onClick={restart}>
          ↺ {t('rya.restart')}
        </button>
      </Panel>
    </div>
  )
}

function Brief({ t, sc, quiz, setQuiz, onStart }: { t: Translate; sc: Scenario; quiz: string | null; setQuiz: (q: string) => void; onStart: () => void }) {
  const fogOptions = useMemo(() => shuffled(['-', '--', '-..', '.....']), [])
  return (
    <Panel className="mt-3">
      <p className="text-sm">{t(`rya.cc.s.${sc.id}.brief` as MessageKey)}</p>
      {sc.visibility === 'fog' && (
        <div className="mt-3">
          <p className="text-sm font-semibold">{t('rya.cc.fogQ')}</p>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {fogOptions.map((o) => (
              <button key={o} type="button" className={`btn-secondary ${quiz === o ? '!border-navy-900 !bg-sea-100 dark:!bg-sea-500/20' : ''}`} onClick={() => (setQuiz(o), playHorn(o, { long: 1.4, short: 0.4, gap: 0.3 }))}>
                {hornSymbols(o)}
              </button>
            ))}
          </div>
        </div>
      )}
      <button type="button" className="btn-primary mt-3" disabled={sc.visibility === 'fog' && !quiz} onClick={onStart}>
        ▶ {t('rya.start')}
      </button>
    </Panel>
  )
}

function ScoreView({ t, sc, score, onRetry, next, onNext }: { t: Translate; sc: Scenario; score: Score; onRetry: () => void; next?: string; onNext: (id: string) => void }) {
  const stars = encounterStars(score)
  return (
    <Panel className="mt-3">
      <div className="flex items-center gap-3">
        <StarsView n={stars} size="text-3xl" />
        <span className="font-semibold">
          {score.points}/{score.max}
        </span>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {score.notes.map((n) => {
          const ok = ['safe', 'held', 'bearings', 'early', 'substantial', 'starboard', 'starboardInFog', 'signalOk'].includes(n)
          return (
            <li key={n} className={ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
              {ok ? '✔' : '✘'} {t(`rya.cc.n.${n}` as MessageKey)}
            </li>
          )
        })}
      </ul>
      <div className="mt-3">
        <Feedback ok={stars > 0}>{t(`rya.cc.s.${sc.id}.why` as MessageKey)}</Feedback>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" className="btn-secondary" onClick={onRetry}>
          ↺ {t('rya.retry')}
        </button>
        {next && stars > 0 && (
          <button type="button" className="btn-primary" onClick={() => onNext(next)}>
            {t('rya.nextLevel')} →
          </button>
        )}
      </div>
    </Panel>
  )
}

const LIGHT_HEX = { white: '#fffbe6', red: '#ff3b30', green: '#34d399' }

function VesselGlyph({ v, night, observer }: { v: Vessel; night: boolean; observer: Vessel }) {
  if (night) {
    const aspect = aspectOf(v, observer.pos)
    return (
      <g>
        {visibleLights(v.type, aspect).map((l, i) => (
          <circle key={i} cx={lightScreenOffset(l, aspect) * 5} cy={-l.h * 4} r={3} fill={LIGHT_HEX[l.colour]} style={{ filter: `drop-shadow(0 0 4px ${LIGHT_HEX[l.colour]})` }} />
        ))}
      </g>
    )
  }
  const len = v.type === 'powerLarge' ? 26 : 14
  return (
    <g transform={`rotate(${v.course})`}>
      <path d={`M0 ${-len} C${len / 3} ${-len / 2} ${len / 3} ${len / 2} ${len / 4} ${len} L${-len / 4} ${len} C${-len / 3} ${len / 2} ${-len / 3} ${-len / 2} 0 ${-len} Z`} fill={v.type === 'sail' ? '#f8fafc' : '#7f1d1d'} stroke="#0f172a" />
      {v.type === 'sail' && <path d="M0 -8 Q6 0 2 8" fill="none" stroke="#0b3a5c" strokeWidth="2" />}
    </g>
  )
}

function Plot({ t, sc, sim }: { t: Translate; sc: Scenario; sim: Sim }) {
  const night = sc.visibility === 'night'
  const fog = sc.visibility === 'fog'
  const size = VIEW * 2 * NM
  const o = sim.own.pos
  const px = (p: { x: number; y: number }) => ({ x: size / 2 + (p.x - o.x) * NM, y: size / 2 - (p.y - o.y) * NM })
  const bg = night ? '#020617' : fog ? '#cbd5e1' : '#7cc4e4'
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      <svg viewBox={`0 0 ${size} ${size}`} className="block max-h-[520px] w-full" style={{ background: bg }}>
        {[1, 2, 4].map((r) => (
          <circle key={r} cx={size / 2} cy={size / 2} r={r * NM} fill="none" stroke={night ? '#334155' : '#ffffff'} strokeOpacity="0.5" strokeDasharray="4 6" />
        ))}
        <text x={size / 2 + 2 * NM + 3} y={size / 2 - 3} fontSize="10" fill={night ? '#64748b' : '#0b3a5c'}>
          2 NM
        </text>
        {sc.windFrom !== undefined && (
          <g transform={`translate(30 30) rotate(${sc.windFrom + 180})`}>
            <line y1={-14} y2={10} stroke="#0b3a5c" strokeWidth="2" />
            <path d="M0 16 L-5 6 L5 6 Z" fill="#0b3a5c" />
          </g>
        )}
        {sim.targets.map((tg) => {
          const p = px(tg.pos)
          const range = rangeTo(o, tg.pos)
          const visible = !fog || range < 0.4
          return (
            <g key={tg.id}>
              {fog && <circle cx={p.x} cy={p.y} r={5} fill="#16a34a" opacity="0.8" />}
              {fog && (
                <text x={p.x + 8} y={p.y - 6} fontSize="10" fill="#166534">
                  {t('rya.cc.radar')}
                </text>
              )}
              {visible && (
                <g transform={`translate(${p.x} ${p.y})`}>
                  <VesselGlyph v={tg} night={night} observer={sim.own} />
                </g>
              )}
            </g>
          )
        })}
        <g transform={`translate(${size / 2} ${size / 2}) rotate(${sim.own.course})`}>
          <path d="M0 -14 C5 -6 5 6 4 12 L-4 12 C-5 6 -5 -6 0 -14 Z" fill={night ? '#94a3b8' : '#0b3a5c'} stroke="#fff" />
          <line y1={-14} y2={-60} stroke={night ? '#475569' : '#0b3a5c'} strokeDasharray="3 4" />
        </g>
      </svg>
      {fog && <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 8%, rgba(203,213,225,0.85) 30%)' }} />}
    </div>
  )
}

/** First-person view over the bow (±90°) showing the lights you would actually see. */
function Horizon({ t, own, targets }: { t: Translate; own: Vessel; targets: Vessel[] }) {
  const W = 480
  const H = 90
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-700 bg-gradient-to-b from-slate-950 to-slate-900">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
        <line x1="0" x2={W} y1={H * 0.62} y2={H * 0.62} stroke="#1e293b" />
        {[-90, -45, 0, 45, 90].map((a) => (
          <text key={a} x={W / 2 + (a / 90) * (W / 2)} y={H - 4} fontSize="9" fill="#475569" textAnchor="middle">
            {a === 0 ? t('rya.cc.ahead') : `${a > 0 ? '+' : ''}${a}°`}
          </text>
        ))}
        {targets.map((tg) => {
          const rel = aspectOf(own, tg.pos)
          if (Math.abs(rel) > 90) return null
          const x = W / 2 + (rel / 90) * (W / 2)
          const range = rangeTo(own.pos, tg.pos)
          const k = Math.max(0.6, Math.min(3, 2.2 / range))
          const aspect = aspectOf(tg, own.pos)
          return (
            <g key={tg.id} transform={`translate(${x} ${H * 0.62})`}>
              {visibleLights(tg.type, aspect).map((l, i) => (
                <circle key={i} cx={lightScreenOffset(l, aspect) * 6 * k} cy={-l.h * 5 * k} r={1.6 * k} fill={LIGHT_HEX[l.colour]} style={{ filter: `drop-shadow(0 0 3px ${LIGHT_HEX[l.colour]})` }} />
              ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
