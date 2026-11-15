import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { MessageKey } from '../../../i18n/en'
import { useI18n, type Translate } from '../../../i18n'
import { getStars, recordStars } from '../progress'
import { Feedback, Panel, StarsView, useFixedLoop } from '../ui'
import { CENTRED_BOOM, GYBE_FROM, GYBE_TO, gybeVerdict, letFlyVerdict, penaltyStars, TACK_FROM, TACK_TO, TRIM_BAND, trimVerdict, turnAngle } from './tack'

const PREFIX = 'competent-crew:tack'
type Mode = 'tack' | 'gybe'

export function TackGame() {
  const { t } = useI18n()
  const [search, setSearch] = useSearchParams()
  const mode: Mode = search.get('mode') === 'gybe' ? 'gybe' : 'tack'
  return (
    <>
      <div className="mb-4 flex gap-2">
        {(['tack', 'gybe'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setSearch({ mode: m }, { replace: true })}
            className={`rounded-lg border px-3 py-1.5 text-sm ${m === mode ? 'border-navy-900 bg-navy-900 text-white dark:border-sea-500 dark:bg-sea-500' : 'border-slate-300 bg-white dark:border-white/20 dark:bg-white/5'}`}
          >
            {t(`rya.tk.mode.${m}`)} <StarsView n={getStars(`${PREFIX}:${m}`)} size="text-xs" />
          </button>
        ))}
      </div>
      {mode === 'tack' ? <TackDrill key="tack" t={t} /> : <GybeDrill key="gybe" t={t} />}
    </>
  )
}

interface Log {
  ok: boolean
  key: MessageKey
}

function useHold(onTick: (dt: number) => void, active: boolean) {
  const [held, setHeld] = useState(false)
  useFixedLoop(held && active, onTick, () => {}, 30)
  return {
    held,
    bind: {
      onPointerDown: () => setHeld(true),
      onPointerUp: () => setHeld(false),
      onPointerLeave: () => setHeld(false),
    },
  }
}

/* ---------------- Tack ---------------- */

function TackDrill({ t }: { t: Translate }) {
  const [phase, setPhase] = useState<'prep' | 'turning' | 'trim' | 'done'>('prep')
  const [loaded, setLoaded] = useState(false)
  const [prepped, setPrepped] = useState(false)
  const [f, setF] = useState(0)
  const [released, setReleased] = useState(false)
  const [slack, setSlack] = useState(1)
  const [trim, setTrim] = useState(0.45)
  const [backed, setBacked] = useState(false)
  const [penalties, setPenalties] = useState(0)
  const [log, setLog] = useState<Log[]>([])
  const flags = useRef({ filledWithSlack: false, f: 0, released: false })
  const twa = turnAngle(TACK_FROM, TACK_TO, f, 0)
  const say = (ok: boolean, key: MessageKey) => setLog((l) => [{ ok, key }, ...l].slice(0, 4))
  const penalise = (key: MessageKey) => {
    setPenalties((p) => p + 1)
    say(false, key)
  }

  useFixedLoop(
    phase === 'turning',
    (dt) => {
      const fl = flags.current
      if (fl.f >= 1) return
      fl.f = Math.min(1, fl.f + dt / 6)
      setF(fl.f)
      const a = turnAngle(TACK_FROM, TACK_TO, fl.f, 0)
      if (!fl.released && a < -12) {
        fl.released = true
        setBacked(true)
        setReleased(true)
        penalise('rya.tk.backed')
      }
      if (fl.released && slack > 0.2 && a < -38 && !fl.filledWithSlack) {
        fl.filledWithSlack = true
        penalise('rya.tk.slack')
      }
      if (fl.f >= 1) setPhase('trim')
    },
    () => {},
    30,
  )

  const haul = useHold((dt) => setSlack((s) => Math.max(0, s - dt * 0.7)), released && slack > 0)
  const winch = useHold((dt) => setTrim((v) => v + dt * 0.22), phase === 'trim' && slack <= 0.05)
  const stopWinch = () => {
    if (phase !== 'trim' || slack > 0.05) return
    const v = trimVerdict(trim)
    if (v === 'over') {
      penalise('rya.tk.over')
      setTrim(0.7)
    } else if (v === 'good') {
      say(true, 'rya.tk.trimmed')
      setPhase('done')
      recordStars(`${PREFIX}:tack`, penaltyStars(penalties))
    }
  }

  const ready = () => {
    if (!loaded || !prepped) return penalise('rya.tk.notReady')
    say(true, 'rya.tk.leeoh')
    setPhase('turning')
  }
  const letFly = () => {
    if (released) return
    if (phase === 'prep') return penalise('rya.tk.flyPrep')
    const v = letFlyVerdict(twa)
    flags.current.released = true
    setReleased(true)
    if (v === 'early') penalise('rya.tk.early')
    else say(true, 'rya.tk.goodRelease')
  }
  const reset = () => {
    setPhase('prep')
    setLoaded(false)
    setPrepped(false)
    setF(0)
    setReleased(false)
    setSlack(1)
    setTrim(0.45)
    setBacked(false)
    setPenalties(0)
    setLog([])
    flags.current = { filledWithSlack: false, f: 0, released: false }
  }

  const call = phase === 'prep' ? 'rya.tk.call.readyAbout' : phase === 'turning' ? 'rya.tk.call.leeoh' : phase === 'trim' ? 'rya.tk.call.trim' : 'rya.tk.call.well'
  const jib: JibState = !released ? (twa < 0 ? 'backed' : 'set') : slack > 0.05 ? 'flogging' : 'set'
  const jibSide: 1 | -1 = released && slack <= 0.05 ? 1 : -1

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div>
        <BoatView t={t} twa={twa} boomDeg={twa > 0 ? -22 : 22} jib={jib} jibSide={jibSide} call={t(call as MessageKey)} />
        <TrimBar t={t} value={phase === 'trim' || phase === 'done' ? trim : 0} active={phase === 'trim'} />
        <LogView t={t} log={log} />
      </div>
      <Panel className="space-y-2 self-start">
        <h3 className="text-sm font-semibold">{t('rya.tk.crew')}</h3>
        <button type="button" className="btn-secondary w-full text-left" disabled={loaded || phase !== 'prep'} onClick={() => (setLoaded(true), say(true, 'rya.tk.loaded'))}>
          🔁 {t('rya.tk.a.load')}
        </button>
        <button type="button" className="btn-secondary w-full text-left" disabled={prepped || phase !== 'prep'} onClick={() => (setPrepped(true), say(true, 'rya.tk.prepped'))}>
          ✋ {t('rya.tk.a.prep')}
        </button>
        <button type="button" className="btn-primary w-full" disabled={phase !== 'prep'} onClick={ready}>
          🗣️ {t('rya.tk.a.ready')}
        </button>
        <button type="button" className="btn-secondary w-full text-left" disabled={released || phase === 'done'} onClick={letFly}>
          💨 {t('rya.tk.a.letFly')}
        </button>
        <button type="button" className={`btn-secondary w-full select-none text-left ${haul.held ? '!bg-sea-100 dark:!bg-sea-500/20' : ''}`} disabled={!released || slack <= 0} {...haul.bind}>
          ✊ {t('rya.tk.a.haul')} <span className="text-xs text-slate-400">({Math.round((1 - slack) * 100)}%)</span>
        </button>
        <button
          type="button"
          className={`btn-secondary w-full select-none text-left ${winch.held ? '!bg-sea-100 dark:!bg-sea-500/20' : ''}`}
          disabled={phase !== 'trim' || slack > 0.05}
          {...winch.bind}
          onPointerUp={() => {
            winch.bind.onPointerUp()
            stopWinch()
          }}
        >
          ⚙️ {t('rya.tk.a.winch')}
        </button>
        <Result t={t} done={phase === 'done'} penalties={penalties} onRetry={reset} />
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('rya.tk.tip')}</p>
      </Panel>
    </div>
  )
}

/* ---------------- Gybe ---------------- */

function GybeDrill({ t }: { t: Translate }) {
  const [phase, setPhase] = useState<'prep' | 'turning' | 'after' | 'done'>('prep')
  const [preventer, setPreventer] = useState(true)
  const [boom, setBoom] = useState(70)
  const [side, setSide] = useState<1 | -1>(1)
  const [f, setF] = useState(0)
  const [crossedAt, setCrossedAt] = useState<number | null>(null)
  const [jibOver, setJibOver] = useState(false)
  const [penalties, setPenalties] = useState(0)
  const [log, setLog] = useState<Log[]>([])
  const [shake, setShake] = useState(false)
  const flags = useRef({ roundedUp: false, f: 0, clock: 0, crossedAt: null as number | null })
  const twa = turnAngle(GYBE_FROM, GYBE_TO, f, 180)
  const say = (ok: boolean, key: MessageKey) => setLog((l) => [{ ok, key }, ...l].slice(0, 4))
  const penalise = (key: MessageKey, n = 1) => {
    setPenalties((p) => p + n)
    say(false, key)
  }

  useFixedLoop(
    phase === 'turning' || phase === 'after',
    (dt) => {
      const fl = flags.current
      fl.clock += dt
      if (phase === 'turning' && fl.f < 1) {
        fl.f = Math.min(1, fl.f + dt / 6)
        setF(fl.f)
        const a = turnAngle(GYBE_FROM, GYBE_TO, fl.f, 180)
        if (fl.crossedAt === null && a < 0) {
          fl.crossedAt = fl.clock
          setCrossedAt(fl.clock)
          setSide(-1)
          if (gybeVerdict(boom) === 'crash') {
            penalise('rya.gb.crash', 2)
            setShake(true)
            setTimeout(() => setShake(false), 700)
            setBoom(80)
          } else say(true, 'rya.gb.crossed')
        }
        if (fl.f >= 1) setPhase('after')
      }
      if (fl.crossedAt !== null && boom < 45 && fl.clock - fl.crossedAt > 4 && !fl.roundedUp) {
        fl.roundedUp = true
        penalise('rya.gb.roundUp')
      }
    },
    () => {},
    30,
  )

  const centre = useHold((dt) => setBoom((b) => Math.max(0, b - dt * 30)), phase === 'prep')
  const ease = useHold((dt) => setBoom((b) => Math.min(70, b + dt * 30)), crossedAt !== null)

  const ready = () => {
    if (preventer) return penalise('rya.gb.preventer')
    if (boom > CENTRED_BOOM) say(false, 'rya.gb.notCentred')
    else say(true, 'rya.gb.gybeoh')
    setPhase('turning')
  }
  const sheetJib = () => {
    if (jibOver) return
    if (crossedAt === null) return penalise('rya.gb.jibEarly')
    setJibOver(true)
    say(true, 'rya.gb.jibDone')
  }
  const done = phase === 'after' && jibOver && boom >= 45
  useEffect(() => {
    if (!done) return
    setPhase('done')
    recordStars(`${PREFIX}:gybe`, penaltyStars(penalties))
  }, [done, penalties])
  const reset = () => {
    setPhase('prep')
    setPreventer(true)
    setBoom(70)
    setSide(1)
    setF(0)
    setCrossedAt(null)
    setJibOver(false)
    setPenalties(0)
    setLog([])
    flags.current = { roundedUp: false, f: 0, clock: 0, crossedAt: null }
  }
  const call = phase === 'prep' ? 'rya.gb.call.standBy' : phase === 'turning' ? 'rya.gb.call.gybeoh' : phase === 'after' ? 'rya.gb.call.ease' : 'rya.tk.call.well'

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className={shake ? 'animate-pulse' : ''}>
        <BoatView t={t} twa={twa} boomDeg={-side * boom} jib={crossedAt !== null && !jibOver ? 'flogging' : 'set'} jibSide={jibOver ? 1 : -1} call={t(call as MessageKey)} preventer={preventer} />
        <LogView t={t} log={log} />
      </div>
      <Panel className="space-y-2 self-start">
        <h3 className="text-sm font-semibold">{t('rya.tk.crew')}</h3>
        <button type="button" className="btn-secondary w-full text-left" disabled={!preventer || phase !== 'prep'} onClick={() => (setPreventer(false), say(true, 'rya.gb.preventerOff'))}>
          🔓 {t('rya.gb.a.preventer')}
        </button>
        <button type="button" className={`btn-secondary w-full select-none text-left ${centre.held ? '!bg-sea-100 dark:!bg-sea-500/20' : ''}`} disabled={phase !== 'prep'} {...centre.bind}>
          ⚙️ {t('rya.gb.a.centre')} <span className="text-xs text-slate-400">({Math.round(boom)}°)</span>
        </button>
        <button type="button" className="btn-primary w-full" disabled={phase !== 'prep'} onClick={ready}>
          🗣️ {t('rya.tk.a.ready')}
        </button>
        <button type="button" className={`btn-secondary w-full select-none text-left ${ease.held ? '!bg-sea-100 dark:!bg-sea-500/20' : ''}`} disabled={crossedAt === null || phase === 'done'} {...ease.bind}>
          ↗️ {t('rya.gb.a.ease')}
        </button>
        <button type="button" className="btn-secondary w-full text-left" disabled={jibOver || phase === 'prep' || phase === 'done'} onClick={sheetJib}>
          🔁 {t('rya.gb.a.jib')}
        </button>
        <Result t={t} done={phase === 'done'} penalties={penalties} onRetry={reset} />
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('rya.gb.tip')}</p>
      </Panel>
    </div>
  )
}

/* ---------------- Shared view ---------------- */

type JibState = 'set' | 'flogging' | 'backed'

function BoatView({ t, twa, boomDeg, jib, jibSide, call, preventer }: { t: Translate; twa: number; boomDeg: number; jib: JibState; jibSide: 1 | -1; call: string; preventer?: boolean }) {
  // Wind blows from the top of the picture; heading = -twa. Positive boomDeg / jibSide = to starboard.
  const heading = -twa
  const jSide = jibSide
  const jibAngle = jib === 'set' ? 14 : 24
  return (
    <div className="relative rounded-xl border border-slate-200 bg-gradient-to-b from-sky-100 to-sky-300 dark:border-white/10 dark:from-navy-900 dark:to-[#1c4a66]">
      <svg viewBox="-160 -150 320 300" className="block w-full max-h-[420px]">
        {[-100, 0, 100].map((x) => (
          <g key={x} transform={`translate(${x} -125)`} opacity="0.6">
            <line y1={-10} y2={14} stroke="#0b3a5c" strokeWidth="2" />
            <path d="M0 22 L-5 12 L5 12 Z" fill="#0b3a5c" />
          </g>
        ))}
        <text x="0" y="-86" textAnchor="middle" fontSize="10" fill="#0b3a5c">
          {t('rya.wind')}
        </text>
        <g transform={`rotate(${heading}) scale(3.4)`}>
          <path d="M0 -24 C9 -12 10 4 7 22 L-7 22 C-10 4 -9 -12 0 -24 Z" fill="#f8fafc" stroke="#0b3a5c" strokeWidth="1" />
          <circle cy="-6" r="1.6" fill="#0b3a5c" />
          {/* jib */}
          {jib === 'flogging' ? (
            <path d={`M0 -23 L${jSide * 3} -18 L${-jSide * 2} -14 L${jSide * 3} -10 L0 -7`} fill="none" stroke="#fff" strokeWidth="1.4" className="sg-flutter" />
          ) : (
            <path
              d={`M0 -23 Q${jSide * 6} -15 ${Math.sin((jSide * jibAngle * Math.PI) / 180) * 17} ${-23 + Math.cos((jibAngle * Math.PI) / 180) * 17} Z`}
              fill={jib === 'backed' ? '#fecaca' : '#fff'}
              stroke="#334155"
              strokeWidth="0.6"
            />
          )}
          {/* boom and main */}
          <g transform={`translate(0 -6) rotate(${-boomDeg})`}>
            <path d={`M0 0 Q${boomDeg > 0 ? 6 : -6} 12 0 24 Z`} fill="#fff" stroke="#334155" strokeWidth="0.6" />
            <line y2="24" stroke="#334155" strokeWidth="1.4" />
          </g>
          {preventer && <line x1={Math.sin((-boomDeg * Math.PI) / 180) * -24} y1={-6 + Math.cos((boomDeg * Math.PI) / 180) * 24} x2={0} y2={-22} stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="1.5 1" />}
        </g>
      </svg>
      <div className="absolute left-3 top-3 max-w-[60%] rounded-2xl rounded-tl-none bg-white px-3 py-2 text-sm font-semibold text-navy-900 shadow dark:bg-navy-700 dark:text-white">
        🧑‍✈️ {call}
      </div>
      <div className="absolute bottom-2 right-3 text-xs tabular-nums text-navy-900 dark:text-sky-100">
        TWA {Math.round(twa)}°
      </div>
    </div>
  )
}

function TrimBar({ t, value, active }: { t: Translate; value: number; active: boolean }) {
  return (
    <div className={`mt-3 ${active ? '' : 'opacity-40'}`}>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{t('rya.tk.trim.under')}</span>
        <span>{t('rya.tk.trim.good')}</span>
        <span>{t('rya.tk.trim.over')}</span>
      </div>
      <div className="relative mt-1 h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="absolute inset-y-0 bg-emerald-400/60" style={{ left: `${TRIM_BAND[0] * 100}%`, width: `${(TRIM_BAND[1] - TRIM_BAND[0]) * 100}%` }} />
        <div className="absolute inset-y-0 w-1 bg-navy-900 dark:bg-white" style={{ left: `${Math.min(1, value) * 100}%` }} />
      </div>
    </div>
  )
}

function LogView({ t, log }: { t: Translate; log: Log[] }) {
  return (
    <div className="mt-3 space-y-1.5">
      {log.map((l, i) => (
        <div key={`${l.key}${i}`} className={i > 0 ? 'opacity-60' : ''}>
          <Feedback ok={l.ok}>{t(l.key)}</Feedback>
        </div>
      ))}
    </div>
  )
}

function Result({ t, done, penalties, onRetry }: { t: Translate; done: boolean; penalties: number; onRetry: () => void }) {
  if (!done)
    return (
      <button type="button" className="btn-secondary w-full" onClick={onRetry}>
        ↺ {t('rya.restart')}
      </button>
    )
  return (
    <div className="rounded-lg bg-emerald-50 p-3 text-center dark:bg-emerald-950/40">
      <StarsView n={penaltyStars(penalties)} size="text-2xl" />
      <p className="text-sm font-semibold">{t('rya.tk.done', { n: penalties })}</p>
      <button type="button" className="btn-primary mt-2" onClick={onRetry}>
        ↺ {t('rya.retry')}
      </button>
    </div>
  )
}
