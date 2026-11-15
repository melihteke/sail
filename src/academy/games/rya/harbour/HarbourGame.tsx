import { useCallback, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { pointInPolygon } from '../../../core/polygon'
import { norm180 } from '../../../core/units'
import type { Vec2 } from '../../../core/vec'
import {
  forces,
  groundVelocity,
  hullPoints,
  msToKn,
  predictTrack,
  step,
  toWorld,
  YACHT,
  type Controls,
  type MooringLine,
  type YachtState,
} from '../../../core/yacht'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { getStars, recordStars, type Stars } from '../progress'
import { DirArrow, Feedback, Panel, StarsView, useFixedLoop, useKeys } from '../ui'
import { findHarbourLevel, harbourLevels, type HarbourLevel } from './levels'

const PREFIX = 'day-skipper:harbour'
const PX = 10

type Outcome = { kind: 'win'; stars: Stars; time: number; bumps: number; newBest: boolean; anchorOk?: boolean } | { kind: 'fail'; reason: 'crash' | 'hardLanding' | 'outside' }

export function HarbourGame() {
  const [search, setSearch] = useSearchParams()
  const level = findHarbourLevel(search.get('level'))
  if (!level) return <LevelPicker onPick={(id) => setSearch({ level: id })} />
  return <Sim key={level.id} level={level} onExit={() => setSearch({})} onNext={(id) => setSearch({ level: id })} />
}

function LevelPicker({ onPick }: { onPick: (id: string) => void }) {
  const { t } = useI18n()
  return (
    <>
      <Panel className="mb-4 text-sm text-slate-600 dark:text-slate-300">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{t('rya.hb.how')}</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          <li>{t('rya.hb.how1')}</li>
          <li>{t('rya.hb.how2')}</li>
          <li>{t('rya.hb.how3')}</li>
          <li>{t('rya.hb.how4')}</li>
        </ul>
      </Panel>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {harbourLevels.map((l, i) => (
          <button key={l.id} type="button" onClick={() => onPick(l.id)} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-navy-900/60">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{t('rya.level', { n: i + 1 })}</span>
              <StarsView n={getStars(`${PREFIX}:${l.id}`)} />
            </div>
            <div className="mt-1 font-semibold">{t(`rya.hb.l.${l.id}` as MessageKey)}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t(`rya.hb.l.${l.id}.goal` as MessageKey)}</div>
          </button>
        ))}
      </div>
    </>
  )
}

const hullPath = (s: YachtState, h: number) => {
  const pts = hullPoints.map((p) => toWorld(s, p))
  return `M${pts.map((p) => `${p.x * PX} ${(h - p.y) * PX}`).join(' L')} Z`
}

const polyPoints = (poly: Vec2[], h: number) => poly.map((p) => `${p.x * PX},${(h - p.y) * PX}`).join(' ')

function Sim({ level, onExit, onNext }: { level: HarbourLevel; onExit: () => void; onNext: (id: string) => void }) {
  const { t } = useI18n()
  const [, setFrame] = useState(0)
  const [running, setRunning] = useState(true)
  const [help, setHelp] = useState(true)
  const [controls, setControls] = useState<Controls>({ throttle: 0, rudder: 0 })
  const [lines, setLines] = useState<MooringLine[]>(level.lines ?? [])
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [anchorAt, setAnchorAt] = useState<Vec2 | null>(null)
  const sim = useRef({ state: level.start, time: 0, bumps: 0, still: 0, lastBumpAt: -9, taut: [] as string[] })
  const ctlRef = useRef(controls)
  ctlRef.current = controls
  const linesRef = useRef(lines)
  linesRef.current = lines

  const restart = useCallback(() => {
    sim.current = { state: level.start, time: 0, bumps: 0, still: 0, lastBumpAt: -9, taut: [] }
    setControls({ throttle: 0, rudder: 0 })
    setLines(level.lines ?? [])
    setAnchorAt(null)
    setOutcome(null)
    setRunning(true)
  }, [level])

  const finish = useCallback(
    (o: Outcome) => {
      setRunning(false)
      setOutcome(o)
    },
    [],
  )

  const tick = (dt: number) => {
    const s = sim.current
    const res = step(s.state, { controls: ctlRef.current, conditions: level.conditions, lines: linesRef.current, obstacles: level.obstacles }, dt)
    s.state = res.state
    s.taut = res.taut
    s.time += dt
    for (const c of res.contacts) {
      const hard = c.kind !== 'pontoon'
      if ((hard && c.speed > 0.3) || (!hard && c.speed > 0.6)) {
        finish({ kind: 'fail', reason: hard ? 'crash' : 'hardLanding' })
        return
      }
      if ((hard && c.speed > 0.05) || (!hard && c.speed > 0.3)) {
        if (s.time - s.lastBumpAt > 1) s.bumps++
        s.lastBumpAt = s.time
      }
    }
    const st = s.state
    if (st.x < -5 || st.y < -5 || st.x > level.w + 5 || st.y > level.h + 5) {
      finish({ kind: 'fail', reason: 'outside' })
      return
    }
    const g = level.goal
    const inZone = pointInPolygon({ x: st.x, y: st.y }, g.zone)
    const headingOk = g.heading === undefined || g.tol === undefined || Math.abs(norm180(st.heading - g.heading)) <= g.tol
    const sog = Math.hypot(groundVelocity(st, level.conditions).x, groundVelocity(st, level.conditions).y)
    const done = g.kind === 'exit' ? inZone && headingOk : inZone && headingOk && sog < 0.25
    s.still = done ? s.still + dt : 0
    if (s.still >= (g.kind === 'exit' ? 0.2 : 1.5)) {
      let stars: Stars = s.bumps === 0 && s.time <= level.par ? 3 : s.bumps <= 1 && s.time <= level.par * 1.6 ? 2 : 1
      let anchorOk: boolean | undefined
      if (level.anchor) {
        const d = anchorAt ? level.anchor.quayY - anchorAt.y : 0
        anchorOk = !!anchorAt && d >= level.anchor.min && d <= level.anchor.max
        if (!anchorOk) stars = Math.min(stars, 2) as Stars
      }
      const newBest = recordStars(`${PREFIX}:${level.id}`, stars)
      finish({ kind: 'win', stars, time: s.time, bumps: s.bumps, newBest, anchorOk })
    }
  }

  useFixedLoop(running, tick, () => setFrame((f) => (f + 1) % 1e6))

  const nudge = (dThrottle: number, dRudder: number) =>
    setControls((c) => ({
      throttle: Math.round(Math.max(-1, Math.min(1, c.throttle + dThrottle)) * 10) / 10,
      rudder: Math.round(Math.max(-1, Math.min(1, c.rudder + dRudder)) * 10) / 10,
    }))

  useKeys((e) => {
    const k = e.key.toLowerCase()
    if (k === 'arrowup' || k === 'w') nudge(0.1, 0)
    else if (k === 'arrowdown' || k === 's') nudge(-0.1, 0)
    else if (k === 'arrowleft' || k === 'a') nudge(0, -0.25)
    else if (k === 'arrowright' || k === 'd') nudge(0, 0.25)
    else if (k === ' ') setControls((c) => ({ ...c, throttle: 0 }))
    else if (k === 'c') setControls((c) => ({ ...c, rudder: 0 }))
    else if (k === 'p') setRunning((r) => !r && !outcome)
    else return
    return true
  })

  const s = sim.current.state
  const H = level.h
  const g = groundVelocity(s, level.conditions)
  const sogKn = msToKn(Math.hypot(g.x, g.y))
  const f = forces(s, controls, level.conditions)
  const track = useMemo(
    () => (help ? predictTrack(s, { controls, conditions: level.conditions, lines }, 8, 0.2) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [help, s, controls, lines],
  )
  const stern = toWorld(s, { a: -YACHT.length / 2, b: 0 })
  const bow = toWorld(s, { a: YACHT.length / 2, b: 0 })

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <button type="button" onClick={onExit} className="text-sm text-sea-500 hover:underline">
              ← {t('rya.levels')}
            </button>
            <h2 className="text-lg font-semibold">{t(`rya.hb.l.${level.id}` as MessageKey)}</h2>
          </div>
          <div className="flex gap-3 text-sm tabular-nums text-slate-600 dark:text-slate-300">
            <span>⏱ {sim.current.time.toFixed(0)}s</span>
            <span>🧭 {Math.round(s.heading)}°</span>
            <span>🚤 {sogKn.toFixed(1)} {t('common.kn')}</span>
            <span>💥 {sim.current.bumps}</span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <svg viewBox={`0 0 ${level.w * PX} ${level.h * PX}`} className="block w-full select-none bg-[#9fd3ea] dark:bg-[#1c4a66]">
            <defs>
              <pattern id="hb-grid" width={PX * 5} height={PX * 5} patternUnits="userSpaceOnUse">
                <path d={`M${PX * 5} 0 L0 0 0 ${PX * 5}`} fill="none" stroke="#fff" strokeOpacity="0.15" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hb-grid)" />
            <polygon points={polyPoints(level.goal.zone, H)} fill="#22c55e" fillOpacity="0.18" stroke="#16a34a" strokeDasharray="6 4" strokeWidth="2" />
            {level.goal.kind === 'berth' && level.goal.tol < 90 && (
              <DirArrow
                x={(level.goal.zone.reduce((a, p) => a + p.x, 0) / level.goal.zone.length) * PX}
                y={(H - level.goal.zone.reduce((a, p) => a + p.y, 0) / level.goal.zone.length) * PX}
                toDeg={level.goal.heading}
                len={34}
                color="#16a34a"
              />
            )}
            {level.obstacles.map((o) => (
              <polygon
                key={o.id}
                points={polyPoints(o.poly, H)}
                fill={o.kind === 'pontoon' ? '#b08b5a' : o.kind === 'hard' ? '#8b8f96' : '#f8fafc'}
                stroke={o.kind === 'boat' ? '#64748b' : '#5b4630'}
                strokeWidth="1.5"
              />
            ))}
            {level.anchor && (
              <rect x={0} y={(H - (level.anchor.quayY - level.anchor.min)) * PX} width={level.w * PX} height={(level.anchor.max - level.anchor.min) * PX} fill="#f59e0b" fillOpacity={help ? 0.08 : 0} />
            )}
            {help && track.length > 1 && (
              <polyline points={track.map((p) => `${p.x * PX},${(H - p.y) * PX}`).join(' ')} fill="none" stroke="#0b3a5c" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="4 5" />
            )}
            {lines.map((l) => {
              const p = toWorld(s, l.at)
              const tautNow = sim.current.taut.includes(l.id)
              return <line key={l.id} x1={p.x * PX} y1={(H - p.y) * PX} x2={l.anchor.x * PX} y2={(H - l.anchor.y) * PX} stroke={tautNow ? '#dc2626' : '#f8fafc'} strokeWidth="2.5" />
            })}
            {anchorAt && (
              <>
                <line x1={bow.x * PX} y1={(H - bow.y) * PX} x2={anchorAt.x * PX} y2={(H - anchorAt.y) * PX} stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                <text x={anchorAt.x * PX} y={(H - anchorAt.y) * PX + 6} textAnchor="middle" fontSize="18">
                  ⚓
                </text>
              </>
            )}
            <path d={hullPath(s, H)} fill="#0b3a5c" stroke="#fff" strokeWidth="2" />
            {[-1, 1].map((side) =>
              [3, 0, -3].map((a) => {
                const p = toWorld(s, { a, b: side * (YACHT.beam / 2 + 0.15) })
                return <circle key={`${side}${a}`} cx={p.x * PX} cy={(H - p.y) * PX} r={3} fill="#e2e8f0" stroke="#334155" />
              }),
            )}
            <circle cx={toWorld(s, { a: 1.2, b: 0 }).x * PX} cy={(H - toWorld(s, { a: 1.2, b: 0 }).y) * PX} r={4} fill="#fff" />
            {help && Math.abs(f.propWalk) > 0.01 && (
              <DirArrow x={stern.x * PX} y={(H - stern.y) * PX} toDeg={s.heading + (f.propWalk > 0 ? -90 : 90)} len={20 + Math.abs(f.propWalk) * 300} color="#dc2626" width={2} label={t('rya.hb.propwalk')} />
            )}
            {help && controls.throttle > 0 && (
              <DirArrow x={stern.x * PX} y={(H - stern.y) * PX} toDeg={s.heading + 180 + controls.rudder * 35} len={14 + controls.throttle * 30} color="#38bdf8" width={2} />
            )}
          </svg>
          <div className="pointer-events-none absolute right-2 top-2 flex flex-col gap-1 rounded-lg bg-white/85 p-2 text-xs dark:bg-navy-900/80">
            {level.conditions.windKn > 0 && (
              <span className="flex items-center gap-1">
                <svg width="28" height="28" viewBox="-15 -15 30 30">
                  <DirArrow x={0} y={0} toDeg={level.conditions.windFromDeg + 180} len={24} color="#0b3a5c" width={2} />
                </svg>
                {t('rya.wind')} {level.conditions.windKn} {t('common.kn')}
              </span>
            )}
            {level.conditions.streamKn > 0 && (
              <span className="flex items-center gap-1">
                <svg width="28" height="28" viewBox="-15 -15 30 30">
                  <DirArrow x={0} y={0} toDeg={level.conditions.streamSetDeg} len={24} color="#0891b2" width={2} />
                </svg>
                {t('rya.stream')} {level.conditions.streamKn} {t('common.kn')}
              </span>
            )}
            {level.conditions.windKn === 0 && level.conditions.streamKn === 0 && <span>{t('rya.hb.calm')}</span>}
          </div>
          {outcome && <OutcomeCard t={t} level={level} outcome={outcome} onRetry={restart} onNext={onNext} />}
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">💡 {t(`rya.hb.l.${level.id}.tip` as MessageKey)}</p>
      </div>
      <ControlPanel
        t={t}
        controls={controls}
        setControls={setControls}
        lines={lines}
        onSlip={(id) => setLines((ls) => ls.filter((l) => l.id !== id))}
        anchor={level.anchor ? { dropped: !!anchorAt, drop: () => setAnchorAt(toWorld(sim.current.state, { a: YACHT.length / 2, b: 0 })) } : undefined}
        help={help}
        setHelp={setHelp}
        running={running}
        setRunning={(r) => !outcome && setRunning(r)}
        restart={restart}
      />
    </div>
  )
}

function ControlPanel({
  t,
  controls,
  setControls,
  lines,
  onSlip,
  anchor,
  help,
  setHelp,
  running,
  setRunning,
  restart,
}: {
  t: Translate
  controls: Controls
  setControls: (c: Controls) => void
  lines: MooringLine[]
  onSlip: (id: string) => void
  anchor?: { dropped: boolean; drop: () => void }
  help: boolean
  setHelp: (h: boolean) => void
  running: boolean
  setRunning: (r: boolean) => void
  restart: () => void
}) {
  const gear = controls.throttle > 0.05 ? t('rya.hb.ahead') : controls.throttle < -0.05 ? t('rya.hb.astern') : t('rya.hb.neutral')
  return (
    <Panel className="space-y-4 self-start">
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{t('rya.hb.throttle')}</span>
          <span className="tabular-nums text-slate-500">
            {gear} {Math.round(Math.abs(controls.throttle) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.1}
          value={controls.throttle}
          onChange={(e) => setControls({ ...controls, throttle: Number(e.target.value) })}
          className="mt-2 w-full accent-navy-900"
          aria-label={t('rya.hb.throttle')}
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{t('rya.hb.astern')}</span>
          <span>{t('rya.hb.neutral')}</span>
          <span>{t('rya.hb.ahead')}</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          <button type="button" className="btn-secondary" onClick={() => setControls({ ...controls, throttle: -0.5 })}>
            ⏪
          </button>
          <button type="button" className="btn-secondary" onClick={() => setControls({ ...controls, throttle: 0 })}>
            N
          </button>
          <button type="button" className="btn-secondary" onClick={() => setControls({ ...controls, throttle: 0.3 })}>
            ⏩
          </button>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{t('rya.hb.wheel')}</span>
          <span className="tabular-nums text-slate-500">
            {controls.rudder === 0 ? t('rya.hb.amidships') : `${Math.round(Math.abs(controls.rudder) * 35)}° ${controls.rudder > 0 ? t('rya.stbd') : t('rya.port')}`}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-center">
          <svg width="70" height="70" viewBox="-35 -35 70 70" aria-hidden>
            <g transform={`rotate(${controls.rudder * 180})`}>
              <circle r="28" fill="none" stroke="#0b3a5c" strokeWidth="5" />
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <line key={a} x1={0} y1={0} x2={0} y2={-28} stroke="#0b3a5c" strokeWidth="3" transform={`rotate(${a})`} />
              ))}
              <circle cy={-28} r="4" fill="#dc2626" />
            </g>
          </svg>
        </div>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.05}
          value={controls.rudder}
          onChange={(e) => setControls({ ...controls, rudder: Number(e.target.value) })}
          className="w-full accent-navy-900"
          aria-label={t('rya.hb.wheel')}
        />
        <button type="button" className="btn-secondary mt-1 w-full" onClick={() => setControls({ ...controls, rudder: 0 })}>
          {t('rya.hb.amidships')}
        </button>
      </div>
      {(lines.length > 0 || anchor) && (
        <div>
          <div className="text-sm font-semibold">{t('rya.hb.lines')}</div>
          <div className="mt-1 grid gap-1">
            {lines.map((l) => (
              <button key={l.id} type="button" className="btn-secondary text-left" onClick={() => onSlip(l.id)}>
                ✂️ {t('rya.hb.slip')} {t(`rya.line.${l.id}` as MessageKey)}
              </button>
            ))}
            {anchor && (
              <button type="button" className="btn-secondary text-left" disabled={anchor.dropped} onClick={anchor.drop}>
                ⚓ {anchor.dropped ? t('rya.hb.anchorDown') : t('rya.hb.dropAnchor')}
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => setRunning(!running)}>
          {running ? '⏸' : '▶'}
        </button>
        <button type="button" className="btn-secondary" onClick={restart}>
          ↺ {t('rya.restart')}
        </button>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={help} onChange={(e) => setHelp(e.target.checked)} /> {t('rya.hb.help')}
        </label>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">{t('rya.hb.keys')}</p>
    </Panel>
  )
}

function OutcomeCard({ t, level, outcome, onRetry, onNext }: { t: Translate; level: HarbourLevel; outcome: Outcome; onRetry: () => void; onNext: (id: string) => void }) {
  const idx = harbourLevels.findIndex((l) => l.id === level.id)
  const next = harbourLevels[idx + 1]
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-navy-950/40 p-4">
      <div className="max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-navy-900">
        {outcome.kind === 'win' ? (
          <>
            <StarsView n={outcome.stars} size="text-4xl" />
            <h3 className="mt-2 text-xl font-semibold">{t('rya.hb.win')}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('rya.hb.winStats', { time: Math.round(outcome.time), bumps: outcome.bumps, par: level.par })}</p>
            {outcome.anchorOk === false && <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{t('rya.hb.anchorMiss')}</p>}
            {outcome.newBest && <p className="mt-1 text-sm font-medium text-emerald-600">{t('rya.newBest')}</p>}
          </>
        ) : (
          <>
            <div className="text-4xl">💥</div>
            <h3 className="mt-2 text-xl font-semibold">{t(`rya.hb.fail.${outcome.reason}`)}</h3>
            <div className="mt-2">
              <Feedback ok={false}>{t(`rya.hb.l.${level.id}.tip` as MessageKey)}</Feedback>
            </div>
          </>
        )}
        <div className="mt-4 flex justify-center gap-2">
          <button type="button" className="btn-secondary" onClick={onRetry}>
            ↺ {t('rya.retry')}
          </button>
          {outcome.kind === 'win' && next && (
            <button type="button" className="btn-primary" onClick={() => onNext(next.id)}>
              {t('rya.nextLevel')} →
            </button>
          )}
          {outcome.kind === 'win' && !next && (
            <Link to="/rya/day-skipper" className="btn-primary">
              {t('rya.backToCourse')}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
