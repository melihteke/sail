import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { msToKnots, norm180 } from '../../../core/units'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { TopBoat } from '../../../map/TopBoat'
import { getStars, recordStars } from '../progress'
import { DirArrow, Feedback, Panel, StarsView, useFixedLoop, useKeys } from '../ui'
import { bowOf, buoyLevels, buoyStars, checkApproach, groundSpeed, stepSail, type BuoyLevel, type SailControls, type SailPlan, type SailState } from './buoySim'

const PREFIX = 'day-skipper:buoy'
const W = 240
const PX = 2.2
const TIME_LIMIT = 240

export function BuoyGame() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const level = buoyLevels.find((l) => l.id === search.get('level')) ?? buoyLevels[0]
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {buoyLevels.map((l, i) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSearch({ level: l.id }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${l.id === level.id ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {i + 1}. {t(`rya.bu.l.${l.id}` as MessageKey)} <StarsView n={getStars(`${PREFIX}:${l.id}`)} size="text-xs" />
          </button>
        ))}
      </div>
      <Approach key={level.id} t={t} level={level} />
    </>
  )
}

const initial = (l: BuoyLevel): SailState => ({ ...l.start, stw: 1.5 })

function Approach({ t, level }: { t: Translate; level: BuoyLevel }) {
  const [plan, setPlan] = useState<SailPlan | null>(null)
  const [running, setRunning] = useState(false)
  const [controls, setControls] = useState<SailControls>({ helm: 0, mainEase: 0, jibFurl: 0 })
  const [outcome, setOutcome] = useState<'won' | 'timeout' | null>(null)
  const [msg, setMsg] = useState<MessageKey | null>(null)
  const [, setFrame] = useState(0)
  const sim = useRef({ s: initial(level), time: 0, misses: 0, near: false, trail: [] as { x: number; y: number }[] })
  const ctl = useRef(controls)
  ctl.current = controls

  useFixedLoop(
    running,
    (dt) => {
      const st = sim.current
      if (!plan) return
      st.s = stepSail(st.s, level, plan, ctl.current, dt)
      st.time += dt
      if (Math.floor(st.time * 2) !== Math.floor((st.time - dt) * 2)) st.trail = [...st.trail.slice(-150), { x: st.s.x, y: st.s.y }]
      const a = checkApproach(st.s, level)
      if (a === 'pickedUp') {
        setRunning(false)
        setOutcome('won')
        setMsg('rya.bu.picked')
        recordStars(`${PREFIX}:${level.id}`, buoyStars(st.misses, plan, level.best))
        return
      }
      if (a === 'tooFast' && !st.near) {
        st.near = true
        st.misses++
        setMsg('rya.bu.tooFast')
      }
      if (a === 'none') st.near = false
      if (st.time > TIME_LIMIT || st.s.x < -20 || st.s.y < -20 || st.s.x > W + 20 || st.s.y > W + 20) {
        setRunning(false)
        setOutcome('timeout')
        setMsg('rya.bu.timeout')
      }
    },
    () => setFrame((f) => (f + 1) % 1e6),
    60,
  )

  const nudge = (d: Partial<SailControls>) =>
    setControls((c) => ({
      helm: Math.max(-1, Math.min(1, d.helm !== undefined ? d.helm : c.helm)),
      mainEase: Math.max(0, Math.min(1, d.mainEase !== undefined ? d.mainEase : c.mainEase)),
      jibFurl: Math.max(0, Math.min(1, d.jibFurl !== undefined ? d.jibFurl : c.jibFurl)),
    }))
  useKeys((e) => {
    const k = e.key.toLowerCase()
    if (k === 'arrowleft' || k === 'a') nudge({ helm: controls.helm - 0.25 })
    else if (k === 'arrowright' || k === 'd') nudge({ helm: controls.helm + 0.25 })
    else if (k === 'c') nudge({ helm: 0 })
    else if (k === 'arrowup' || k === 'w') nudge({ mainEase: controls.mainEase - 0.1, jibFurl: controls.jibFurl - 0.1 })
    else if (k === 'arrowdown' || k === 's') nudge({ mainEase: controls.mainEase + 0.1, jibFurl: controls.jibFurl + 0.1 })
    else return
    return true
  })

  const start = (p: SailPlan) => {
    setPlan(p)
    sim.current = { s: initial(level), time: 0, misses: 0, near: false, trail: [] }
    setControls({ helm: 0, mainEase: 0, jibFurl: p === 'main' ? 1 : 0 })
    setOutcome(null)
    setMsg(null)
    setRunning(true)
  }
  const restart = () => {
    setPlan(null)
    setRunning(false)
    sim.current = { s: initial(level), time: 0, misses: 0, near: false, trail: [] }
    setOutcome(null)
    setMsg(null)
  }

  const s = sim.current.s
  const sx = (x: number) => x * PX
  const sy = (y: number) => (W - y) * PX
  const twa = norm180(level.windFrom - s.heading)
  const bow = bowOf(s)
  const dist = Math.hypot(bow.x - level.buoy.x, bow.y - level.buoy.y)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
      <div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <svg viewBox={`0 0 ${W * PX} ${W * PX}`} className="block max-h-[560px] w-full bg-[#7cc4e4] dark:bg-[#1c4a66]">
            {[0.2, 0.5, 0.8].map((f) => (
              <DirArrow key={f} x={W * PX * f} y={40} toDeg={level.windFrom + 180} len={34} color="#ffffff" width={2} />
            ))}
            {level.streamKn > 0 &&
              [0.15, 0.85].map((f) => <DirArrow key={f} x={W * PX * f} y={W * PX * 0.55} toDeg={level.streamSet} len={40} color="#0e7490" width={3} label={`${level.streamKn} ${t('common.kn')}`} />)}
            <polyline points={sim.current.trail.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')} fill="none" stroke="#fff" strokeOpacity="0.6" strokeDasharray="3 4" />
            <circle cx={sx(level.buoy.x)} cy={sy(level.buoy.y)} r={3 * PX} fill="#dc2626" stroke="#fff" strokeWidth="2" />
            <circle cx={sx(level.buoy.x)} cy={sy(level.buoy.y)} r={10 * PX} fill="none" stroke="#fff" strokeOpacity="0.5" strokeDasharray="2 4" />
            <TopBoat x={sx(s.x)} y={sy(s.y)} headingDeg={s.heading}             twa={plan === 'jib' ? undefined : twa} boomDeg={plan && plan !== 'jib' ? 10 + controls.mainEase * 70 : undefined} scale={1.1} />
            {plan && plan !== 'main' && controls.jibFurl < 0.95 && (
                          <g transform={`translate(${sx(s.x)} ${sy(s.y)}) rotate(${s.heading}) scale(1.1)`}>
                <path d={`M0 -17 L${twa > 0 ? -6 : 6} -4 L0 -5 Z`} fill="#fff" opacity={1 - controls.jibFurl * 0.7} />
              </g>
            )}
          </svg>
          <div className="pointer-events-none absolute left-2 top-2 rounded-lg bg-white/85 p-2 text-xs tabular-nums dark:bg-navy-900/80">
            <div>
              SOG {msToKnots(groundSpeed(s, level)).toFixed(1)} {t('common.kn')} · STW {msToKnots(s.stw).toFixed(1)}
            </div>
            <div>
              TWA {Math.round(Math.abs(twa))}° · 🔴 {dist.toFixed(0)} m
            </div>
            <div>⏱ {Math.round(sim.current.time)}s · ✋ {sim.current.misses}</div>
          </div>
        </div>
        {msg && (
          <div className="mt-2">
            <Feedback ok={outcome === 'won'}>{t(msg)}</Feedback>
          </div>
        )}
        {outcome && (
          <Panel className="mt-3 text-center">
            {outcome === 'won' && plan && <StarsView n={buoyStars(sim.current.misses, plan, level.best)} size="text-3xl" />}
            <p className="mt-1 text-sm">{t(`rya.bu.l.${level.id}.why` as MessageKey)}</p>
            <button type="button" className="btn-primary mt-2" onClick={restart}>
              ↺ {t('rya.retry')}
            </button>
          </Panel>
        )}
      </div>
      <Panel className="space-y-3 self-start">
        {!plan ? (
          <>
            <p className="text-sm">{t(`rya.bu.l.${level.id}.brief` as MessageKey)}</p>
            <p className="text-sm font-semibold">{t('rya.bu.choose')}</p>
            {(['main', 'jib', 'both'] as const).map((p) => (
              <button key={p} type="button" className="btn-secondary w-full text-left" onClick={() => start(p)}>
                {t(`rya.bu.plan.${p}` as MessageKey)}
              </button>
            ))}
          </>
        ) : (
          <>
            <label className="block text-sm">
              <span className="font-semibold">{t('rya.bu.helm')}</span>
              <input type="range" min={-1} max={1} step={0.05} value={controls.helm} onChange={(e) => nudge({ helm: Number(e.target.value) })} className="mt-1 w-full accent-navy-900" />
              <button type="button" className="btn-secondary mt-1 w-full" onClick={() => nudge({ helm: 0 })}>
                {t('rya.hb.amidships')}
              </button>
            </label>
            {plan !== 'jib' && (
              <label className="block text-sm">
                <span className="font-semibold">{t('rya.bu.main')}</span>
                <input type="range" min={0} max={1} step={0.05} value={controls.mainEase} onChange={(e) => nudge({ mainEase: Number(e.target.value) })} className="mt-1 w-full accent-navy-900" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{t('rya.bu.fill')}</span>
                  <span>{t('rya.bu.spill')}</span>
                </div>
              </label>
            )}
            {plan !== 'main' && (
              <label className="block text-sm">
                <span className="font-semibold">{t('rya.bu.jib')}</span>
                <input type="range" min={0} max={1} step={0.05} value={controls.jibFurl} onChange={(e) => nudge({ jibFurl: Number(e.target.value) })} className="mt-1 w-full accent-navy-900" />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{t('rya.bu.out')}</span>
                  <span>{t('rya.bu.furled')}</span>
                </div>
              </label>
            )}
            <div className="flex gap-2">
              <button type="button" className="btn-secondary" disabled={!!outcome} onClick={() => setRunning((r) => !r)}>
                {running ? '⏸' : '▶'}
              </button>
              <button type="button" className="btn-secondary flex-1" onClick={restart}>
                ↺ {t('rya.restart')}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('rya.bu.keys')}</p>
          </>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">💡 {t('rya.bu.rule')}</p>
      </Panel>
    </div>
  )
}
