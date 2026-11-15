import { useEffect, useMemo, useState } from 'react'
import type { Translate } from '../../../i18n'
import { fmtTime, gateStars, heightAt, NEEDED_HEIGHT, PASSAGE, simulatePassage, streamAt } from '../passage/passage'
import { Frame } from './frame'
import { twelfthsHeight } from './lessons'

const reducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const mod = (a: number, n: number) => ((a % n) + n) % n
const n1 = (v: number) => v.toFixed(1)

/** Seconds elapsed while `running` (driven by requestAnimationFrame). */
function useClock(running: boolean): number {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setT((x) => x + dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running])
  return t
}

function Slider({ label, value, min, max, step, onChange, unit }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit: string }) {
  return (
    <label className="block text-xs">
      <span className="flex justify-between text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span className="font-mono font-semibold">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-sea-500" />
    </label>
  )
}

function Stat({ label, value, tone = 'plain' }: { label: string; value: string; tone?: 'plain' | 'good' | 'bad' }) {
  const c = tone === 'good' ? 'text-emerald-700 dark:text-emerald-300' : tone === 'bad' ? 'text-rose-700 dark:text-rose-300' : 'text-navy-900 dark:text-sky-100'
  return (
    <div className="rounded-lg bg-white/70 px-2 py-1 dark:bg-white/5">
      <div className="text-[11px] text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`font-mono text-sm font-semibold ${c}`}>{value}</div>
    </div>
  )
}

/* ---------------- Tidal stream: speed over the ground ---------------- */

type StreamDir = 'fair' | 'foul' | 'cross'
const PARTICLES = Array.from({ length: 46 }, (_, i) => ({ x: (i * 137.5) % 600, y: (i * 61) % 180 }))

export function StreamWidget({ t }: { t: Translate }) {
  const [stw, setStw] = useState(5)
  const [rate, setRate] = useState(2)
  const [dir, setDir] = useState<StreamDir>('fair')
  const animate = useMemo(() => !reducedMotion(), [])
  const clock = useClock(animate)

  const W = 600
  const H = 220
  const K = 9
  const possible = dir !== 'cross' || rate < stw
  const crab = dir === 'cross' ? (possible ? (Math.asin(rate / stw) * 180) / Math.PI : 90) : 0
  const sog = dir === 'fair' ? stw + rate : dir === 'foul' ? Math.max(0, stw - rate) : possible ? Math.sqrt(stw * stw - rate * rate) : 0
  const hours = sog > 0.05 ? 18 / sog : Infinity
  const hm = Number.isFinite(hours) ? `${Math.floor(hours)} h ${String(Math.round((hours % 1) * 60)).padStart(2, '0')} min` : t('rya.lw.st.never')

  const vx = dir === 'fair' ? rate * K : dir === 'foul' ? -rate * K : 0
  const vy = dir === 'cross' ? rate * K : 0
  const span = W - 90
  const y0 = H / 2
  const bx = 45 + (sog > 0.05 ? (animate ? mod(sog * K * clock, span) : span * 0.45) : 0)
  const driftDeg = (Math.atan2(rate, stw) * 180) / Math.PI

  return (
    <Frame title={t('rya.lw.st.title')}>
      <div className="flex flex-wrap gap-1">
        {(['fair', 'foul', 'cross'] as const).map((d) => (
          <button key={d} type="button" onClick={() => setDir(d)} className={`rounded-full px-3 py-1 text-xs font-medium ${dir === d ? 'bg-navy-900 text-white dark:bg-sea-500' : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-white/10 dark:text-slate-200'}`}>
            {t(`rya.lw.st.${d}`)}
          </button>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full rounded-lg bg-[#cfe9f7] dark:bg-[#0e3550]" role="img" aria-label={t('rya.lw.st.title')}>
        {PARTICLES.map((p, i) => {
          const x = mod(p.x + vx * clock, W)
          const y = 20 + mod(p.y + vy * clock, H - 40)
          const len = Math.min(14, 3 + rate * 3)
          return dir === 'cross' ? (
            <line key={i} x1={x} y1={y} x2={x} y2={y + len} stroke="#0284c7" strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" />
          ) : (
            <line key={i} x1={x} y1={y} x2={x + Math.sign(vx || 1) * len} y2={y} stroke="#0284c7" strokeOpacity={0.45} strokeWidth={2} strokeLinecap="round" />
          )
        })}
        <line x1={45} y1={y0} x2={W - 45} y2={y0} stroke="#0b3a5c" strokeWidth={1.5} strokeDasharray="6 5" opacity={0.6} />
        <circle cx={45} cy={y0} r={7} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
        <circle cx={W - 45} cy={y0} r={7} fill="#16a34a" stroke="#fff" strokeWidth={2} />
        <text x={45} y={y0 + 24} textAnchor="middle" fontSize={11} fill="#0b3a5c">
          A
        </text>
        <text x={W - 45} y={y0 + 24} textAnchor="middle" fontSize={11} fill="#0b3a5c">
          B · 18 NM
        </text>
        {dir === 'cross' && (
          <line x1={45} y1={y0} x2={45 + 260} y2={y0 + 260 * Math.tan((driftDeg * Math.PI) / 180)} stroke="#e11d48" strokeWidth={1.5} strokeDasharray="4 4" opacity={0.8} />
        )}
        <g transform={`translate(${bx} ${y0}) rotate(${-crab})`}>
          <line x1={0} y1={0} x2={46} y2={0} stroke="#0b3a5c" strokeWidth={1.5} markerEnd="url(#st-arrow)" opacity={0.7} />
          <path d="M16 0 C 10 -7 -6 -8 -13 -6 L -13 6 C -6 8 10 7 16 0 Z" fill="#ffffff" stroke="#0b3a5c" strokeWidth={2} />
        </g>
        <defs>
          <marker id="st-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#0b3a5c" />
          </marker>
        </defs>
        <g transform={`translate(${W - 70} 30)`}>
          <rect x={-46} y={-16} width={104} height={28} rx={6} fill="#ffffff" opacity={0.85} />
          <text x={6} y={3} textAnchor="middle" fontSize={11} fill="#0369a1" fontWeight={600}>
            {dir === 'cross' ? '↓' : dir === 'fair' ? '→' : '←'} {t('rya.lw.st.water')} {n1(rate)} kn
          </text>
        </g>
      </svg>
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{t('rya.lw.st.legend')}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label={t('rya.lw.st.stw')} value={stw} min={2} max={8} step={0.5} onChange={setStw} unit="kn" />
        <Slider label={t('rya.lw.st.rate')} value={rate} min={0} max={4} step={0.5} onChange={setRate} unit="kn" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label={t('rya.lw.st.sog')} value={`${n1(sog)} kn`} tone={sog > stw ? 'good' : sog < stw ? 'bad' : 'plain'} />
        <Stat label={t('rya.lw.st.time')} value={hm} tone={sog > stw ? 'good' : sog < stw ? 'bad' : 'plain'} />
        {dir === 'cross' && <Stat label={t('rya.lw.st.heading')} value={possible ? `${Math.round(crab)}°` : '–'} />}
      </div>
      {dir === 'cross' && (
        <p className="mt-2 text-sm">
          {possible ? (
            <>
              🧭 {t('rya.lw.st.crab', { deg: Math.round(crab) })} <span className="text-rose-700 dark:text-rose-300">{t('rya.lw.st.drift', { nm: n1(rate) })}</span>
            </>
          ) : (
            <span className="text-rose-700 dark:text-rose-300">{t('rya.lw.st.tooStrong')}</span>
          )}
        </p>
      )}
    </Frame>
  )
}

/* ---------------- Tidal gate planner (same model as the passage game) ---------------- */

const T0 = 5 * 60
const T1 = 19 * 60

function windowTimes(): [number, number] {
  let a = PASSAGE.hw
  let b = PASSAGE.hw
  while (a > T0 && heightAt(a - 1) >= NEEDED_HEIGHT) a--
  while (b < T1 && heightAt(b + 1) >= NEEDED_HEIGHT) b++
  return [a, b]
}

export function GateWidget({ t }: { t: Translate }) {
  const [dep, setDep] = useState(9 * 60)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(1)
  const r = simulatePassage(dep)
  const [wa, wb] = useMemo(windowTimes, [])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 4500)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const W = 640
  const x = (m: number) => 40 + ((m - T0) / (T1 - T0)) * (W - 60)
  const yH = (h: number) => 140 - (h / 5.5) * 115
  const tidePath = Array.from({ length: (T1 - T0) / 10 + 1 }, (_, i) => {
    const m = T0 + i * 10
    return `${i ? 'L' : 'M'}${x(m).toFixed(1)} ${yH(heightAt(m)).toFixed(1)}`
  }).join(' ')
  const cur = dep + (r.arrive - dep) * progress
  const done = progress >= 1 && !playing
  const status = r.barOk ? 'ok' : r.arrive < wa ? 'tooEarly' : 'tooLate'
  const stars = gateStars(r)

  return (
    <Frame title={t('rya.lw.gt.title')}>
      <svg viewBox={`0 0 ${W} 230`} className="w-full rounded-lg bg-white dark:bg-navy-900/60" role="img" aria-label={t('rya.lw.gt.title')}>
        <rect x={x(wa)} y={20} width={x(wb) - x(wa)} height={120} fill="#22c55e" opacity={0.13} />
        <text x={(x(wa) + x(wb)) / 2} y={32} textAnchor="middle" fontSize={10} fill="#15803d" fontWeight={600}>
          {t('rya.lw.gt.window')} {fmtTime(wa)}–{fmtTime(wb)}
        </text>
        <line x1={x(T0)} y1={yH(NEEDED_HEIGHT)} x2={x(T1)} y2={yH(NEEDED_HEIGHT)} stroke="#16a34a" strokeDasharray="5 4" />
        <text x={x(T1)} y={yH(NEEDED_HEIGHT) - 4} textAnchor="end" fontSize={10} fill="#15803d">
          {t('rya.lw.gt.needed', { h: n1(NEEDED_HEIGHT) })}
        </text>
        <path d={tidePath} fill="none" stroke="#0284c7" strokeWidth={2.5} />
        <text x={x(T0) + 2} y={16} fontSize={10} fill="#0369a1" fontWeight={600}>
          {t('rya.lw.gt.height')}
        </text>
        <line x1={x(PASSAGE.hw)} y1={18} x2={x(PASSAGE.hw)} y2={215} stroke="#64748b" strokeDasharray="2 3" />
        <text x={x(PASSAGE.hw) + 3} y={50} fontSize={10} fill="#475569">
          HW
        </text>
        {Array.from({ length: (T1 - T0) / 30 }, (_, i) => {
          const m = T0 + i * 30 + 15
          const s = streamAt(m)
          const h = Math.abs(s) * 9
          return <rect key={i} x={x(m) - 6} y={s >= 0 ? 195 - h : 195} width={12} height={Math.max(1, h)} fill={s >= 0 ? '#22c55e' : '#ef4444'} opacity={0.75} rx={2} />
        })}
        <line x1={x(T0)} y1={195} x2={x(T1)} y2={195} stroke="#94a3b8" />
        <text x={x(T0) + 2} y={170} fontSize={10} fill="#475569">
          {t('rya.lw.gt.stream')}
        </text>
        <line x1={x(dep)} y1={152} x2={x(r.arrive)} y2={152} stroke="#0b3a5c" strokeWidth={5} strokeLinecap="round" opacity={0.25} />
        <line x1={x(dep)} y1={152} x2={x(cur)} y2={152} stroke="#0b3a5c" strokeWidth={5} strokeLinecap="round" />
        <line x1={x(cur)} y1={20} x2={x(cur)} y2={210} stroke="#f59e0b" strokeWidth={1.5} />
        <circle cx={x(cur)} cy={yH(heightAt(cur))} r={4.5} fill="#f59e0b" stroke="#fff" strokeWidth={1.5} />
        <text x={x(cur)} y={150} textAnchor="middle" fontSize={15}>
          ⛵
        </text>
        {Array.from({ length: (T1 - T0) / 120 + 1 }, (_, i) => {
          const m = T0 + i * 120
          return (
            <text key={m} x={x(m)} y={226} textAnchor="middle" fontSize={10} fill="#64748b">
              {fmtTime(m)}
            </text>
          )
        })}
      </svg>
      <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block text-xs">
          <span className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>{t('rya.lw.gt.depart')}</span>
            <span className="font-mono font-semibold">{fmtTime(dep)}</span>
          </span>
          <input
            type="range"
            min={T0}
            max={13 * 60}
            step={15}
            value={dep}
            onChange={(e) => {
              setDep(Number(e.target.value))
              setPlaying(false)
              setProgress(1)
            }}
            className="w-full accent-sea-500"
          />
        </label>
        <div className="flex flex-wrap gap-1">
          {[6 * 60, 9 * 60, 12 * 60].map((m) => (
            <button
              key={m}
              type="button"
              className="rounded-md bg-white px-2 py-1 text-xs hover:bg-slate-100 dark:bg-white/10"
              onClick={() => {
                setDep(m)
                setPlaying(false)
                setProgress(1)
              }}
            >
              {fmtTime(m)}
            </button>
          ))}
          <button
            type="button"
            className="btn-primary !px-3 !py-1 text-xs"
            onClick={() => {
              setProgress(0)
              setPlaying(true)
            }}
          >
            ▶ {t('rya.lw.gt.play')}
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{t('rya.lw.gt.now', { time: fmtTime(cur), h: n1(heightAt(cur)), s: (streamAt(cur) >= 0 ? '+' : '') + n1(streamAt(cur)) })}</p>
      {done && (
        <div className={`mt-2 rounded-lg p-2 text-sm ${r.barOk ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'}`}>
          <b>
            {t('rya.lw.gt.arrive', { time: fmtTime(r.arrive) })} · {t(`rya.lw.gt.${status}`)}
          </b>{' '}
          {stars > 0 && <span aria-label={`${stars}/3`}>{'⭐'.repeat(stars)}</span>}
          <div className="mt-0.5 text-xs">{t('rya.lw.gt.result', { h: n1(r.heightAtBar), need: n1(NEEDED_HEIGHT), sog: n1(r.avgSog) })}</div>
        </div>
      )}
    </Frame>
  )
}

/* ---------------- Anchored through a tide (side view) ---------------- */

const TA = { lw: 0.6, hw: 4.2, draft: 1.8 }
const TASK_IDS = ['play', 'fix', 'ground', 'safe'] as const
type TaskId = (typeof TASK_IDS)[number]
/** Height of tide `h` hours after HW (HW → LW at +6 → HW at +12). */
export function heightAfterHw(h: number): number {
  return twelfthsHeight(TA.lw, TA.hw, h <= 6 ? 6 + h : h - 6)
}

export function TideAnchorWidget({ t }: { t: Translate }) {
  const [charted, setCharted] = useState(3)
  const [chain, setChain] = useState(20)
  const [hour, setHour] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState<TaskId[]>([])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      let end = false
      setHour((h) => {
        const n = h + dt * 1.2
        if (n >= 12) end = true
        return Math.min(12, n)
      })
      if (end) setPlaying(false)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const tide = heightAfterHw(hour)
  const depth = charted + tide
  const keel = depth - TA.draft
  const scope = chain / depth
  const hwScope = chain / (charted + TA.hw)
  const lwKeel = charted + TA.lw - TA.draft
  const warn = keel <= 0 ? 'aground' : keel < 0.5 ? 'shallow' : scope < 4 ? 'drag' : 'ok'

  useEffect(() => {
    const now: TaskId[] = []
    if (hour >= 11.9) now.push('play')
    if (hwScope >= 4) now.push('fix')
    if (keel <= 0) now.push('ground')
    if (done.includes('ground') && hwScope >= 4 && hwScope <= 7 && lwKeel >= 0.5) now.push('safe')
    const add = now.filter((x) => !done.includes(x))
    if (add.length) setDone((d) => [...d, ...add.filter((x) => !d.includes(x))])
  }, [hour, hwScope, keel, lwKeel, done])

  const W = 640
  const BED = 240
  const VY = 16
  const SX = 8.5
  const AX = 50
  const surface = BED - depth * VY
  const reach = Math.sqrt(Math.max(0, chain * chain - depth * depth))
  const bx = Math.min(W - 40, AX + reach * SX + 14)
  const aground = keel <= 0
  const boatY = aground ? BED - TA.draft * VY : surface
  const bow = { x: bx - 16, y: boatY + 2 }
  const ctrl = { x: AX + (bow.x - AX) * 0.55, y: BED - Math.max(0, (1 - Math.min(1, scope / 8)) * depth * VY * 0.35) }
  const label = hour < 0.05 ? 'HW' : `HW+${hour.toFixed(1)} h`

  return (
    <Frame title={t('rya.lw.ta.title')}>
      <svg viewBox={`0 0 ${W} 260`} className="w-full rounded-lg bg-[#e0f2fe] dark:bg-[#0b2238]" role="img" aria-label={t('rya.lw.ta.title')}>
        <rect x={0} y={surface} width={W} height={BED - surface} fill="#38a3d6" opacity={0.55} />
        <path d={`M0 ${surface} Q 40 ${surface - 3} 80 ${surface} T 160 ${surface} T 240 ${surface} T 320 ${surface} T 400 ${surface} T 480 ${surface} T 560 ${surface} T 640 ${surface}`} fill="none" stroke="#0369a1" strokeWidth={1.5} />
        {[
          ['HW', charted + TA.hw],
          ['LW', charted + TA.lw],
        ].map(([k, d]) => (
          <g key={k as string}>
            <line x1={0} y1={BED - (d as number) * VY} x2={W} y2={BED - (d as number) * VY} stroke="#0b3a5c" strokeDasharray="3 5" opacity={0.45} />
            <text x={W - 6} y={BED - (d as number) * VY - 3} textAnchor="end" fontSize={10} fill="#0b3a5c">
              {k}
            </text>
          </g>
        ))}
        <rect x={0} y={BED} width={W} height={20} fill="#c2a878" />
        <path d={`M${AX} ${BED} Q ${ctrl.x} ${ctrl.y} ${bow.x} ${bow.y}`} fill="none" stroke="#475569" strokeWidth={2.5} strokeDasharray="1 3" strokeLinecap="round" />
        <text x={AX} y={BED - 2} textAnchor="middle" fontSize={16}>
          ⚓
        </text>
        <g transform={`translate(${bx} ${boatY}) rotate(${aground ? 6 : Math.sin(hour * 3) * 1.5})`}>
          <path d={`M-22 -8 L22 -8 L18 4 L3 6 L1 ${TA.draft * VY} L-4 ${TA.draft * VY} L-6 6 L-20 4 Z`} fill="#ffffff" stroke="#0b3a5c" strokeWidth={1.5} />
          <line x1={0} y1={-8} x2={0} y2={-58} stroke="#475569" strokeWidth={2} />
        </g>
        {!aground && (
          <g>
            <line x1={bx + 30} y1={surface + TA.draft * VY} x2={bx + 30} y2={BED} stroke={keel < 0.5 ? '#e11d48' : '#16a34a'} strokeWidth={2} />
            <text x={bx + 34} y={(surface + TA.draft * VY + BED) / 2 + 3} fontSize={10} fill={keel < 0.5 ? '#be123c' : '#15803d'} fontWeight={600}>
              {n1(keel)} m
            </text>
          </g>
        )}
        <g transform="translate(14 14)">
          <rect width={150} height={40} rx={6} fill="#ffffff" opacity={0.9} />
          <text x={8} y={16} fontSize={11} fill="#0b3a5c" fontWeight={700}>
            🕒 {label}
          </text>
          <text x={8} y={32} fontSize={10} fill="#0b3a5c">
            {t('rya.lw.ta.depth')} {n1(depth)} m · {t('rya.lw.ta.scope')} {n1(scope)} : 1
          </text>
        </g>
      </svg>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Slider label={t('rya.lw.ta.charted')} value={charted} min={0.5} max={8} step={0.5} onChange={setCharted} unit="m" />
        <Slider label={t('rya.lw.ta.chain')} value={chain} min={10} max={60} step={1} onChange={setChain} unit="m" />
        <label className="block text-xs">
          <span className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>{t('rya.lw.ta.time')}</span>
            <span className="font-mono font-semibold">{label}</span>
          </span>
          <input
            type="range"
            min={0}
            max={12}
            step={0.1}
            value={hour}
            onChange={(e) => {
              setPlaying(false)
              setHour(Number(e.target.value))
            }}
            className="w-full accent-sea-500"
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="btn-primary !px-3 !py-1 text-xs"
          onClick={() => {
            if (playing) setPlaying(false)
            else {
              if (hour >= 12) setHour(0)
              setPlaying(true)
            }
          }}
        >
          {playing ? `⏸ ${t('rya.lw.ta.pause')}` : `▶ ${t('rya.lw.ta.play')}`}
        </button>
        <span className="text-xs text-slate-500 dark:text-slate-400">{t('rya.lw.ta.note')}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label={t('rya.lw.ta.depth')} value={`${n1(depth)} m`} />
        <Stat label={t('rya.lw.ta.scope')} value={`${n1(scope)} : 1`} tone={scope < 4 ? 'bad' : 'good'} />
        <Stat label={t('rya.lw.ta.keel')} value={`${n1(keel)} m`} tone={keel < 0.5 ? 'bad' : 'good'} />
      </div>
      <p className={`mt-2 rounded-lg px-2 py-1 text-sm font-medium ${warn === 'ok' ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200' : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-200'}`}>
        {warn === 'ok' ? '✔' : '⚠️'} {t(`rya.lw.ta.${warn}`)}
      </p>
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t('rya.lw.ta.worst', { scope: n1(hwScope), keel: n1(lwKeel) })}</p>
      <div className="mt-3 rounded-lg border border-sea-500/30 bg-white/80 p-3 dark:bg-white/5">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>🎯 {t('rya.lw.ta.tasks')}</span>
          <span className="text-xs text-slate-500">
            {done.length} / {TASK_IDS.length}
          </span>
        </div>
        <ol className="mt-2 space-y-1.5 text-sm">
          {TASK_IDS.map((id, i) => {
            const ok = done.includes(id)
            const current = !ok && TASK_IDS.findIndex((x) => !done.includes(x)) === i
            return (
              <li key={id} className={`flex gap-2 rounded px-1 ${current ? 'bg-amber-50 dark:bg-amber-500/10' : ''}`}>
                <span className={ok ? 'text-emerald-600' : 'text-slate-400'}>{ok ? '✔' : `${i + 1}.`}</span>
                <span className={ok ? 'text-slate-500 line-through' : ''}>
                  {t(`rya.lw.ta.task.${id}`)}
                  {current && <span className="mt-0.5 block text-xs text-amber-800 dark:text-amber-200">💡 {t(`rya.lw.ta.hint.${id}`)}</span>}
                </span>
              </li>
            )
          })}
        </ol>
        {done.length === TASK_IDS.length && <p className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">🎉 {t('rya.lw.ta.allDone')}</p>}
      </div>
    </Frame>
  )
}

/* ---------------- Why tides happen: Moon, Sun, springs and neaps ---------------- */

const MONTH = 29.5
export function rangeOnDay(day: number): number {
  return 2.0 + 2.2 * ((1 + Math.cos((4 * Math.PI * day) / MONTH)) / 2)
}

export function MoonWidget({ t }: { t: Translate }) {
  const [day, setDay] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      setDay((d) => (d + dt * 2.4) % MONTH)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const phi = Math.PI + (2 * Math.PI * day) / MONTH
  const E = { x: 250, y: 130 }
  const moon = { x: E.x + Math.cos(phi) * 95, y: E.y - Math.sin(phi) * 95 }
  const amp = (1 + 0.46 * Math.cos(2 * (phi - Math.PI))) / 1.46
  const range = rangeOnDay(day)
  const near = (d: number) => Math.min(Math.abs(day - d), MONTH - Math.abs(day - d)) < 2
  const phase = near(0) ? 'new' : near(MONTH / 4) ? 'first' : near(MONTH / 2) ? 'full' : near((3 * MONTH) / 4) ? 'last' : 'between'
  const kind = range > 3.7 ? 'springs' : range < 2.5 ? 'neaps' : 'mid'
  const curve = Array.from({ length: 49 }, (_, i) => {
    const h = 2.6 + (range / 2) * Math.cos((2 * Math.PI * (i / 2)) / 12.42)
    return `${i ? 'L' : 'M'}${(430 + i * 3.1).toFixed(1)} ${(205 - h * 22).toFixed(1)}`
  }).join(' ')

  return (
    <Frame title={t('rya.lw.mo.title')}>
      <svg viewBox="0 0 600 260" className="w-full rounded-lg bg-[#0b1d33]" role="img" aria-label={t('rya.lw.mo.title')}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={i} x1={30} y1={130} x2={30 + Math.cos((i * Math.PI) / 4) * 22} y2={130 + Math.sin((i * Math.PI) / 4) * 22} stroke="#fbbf24" strokeWidth={2} />
        ))}
        <circle cx={30} cy={130} r={14} fill="#fbbf24" />
        <text x={30} y={165} textAnchor="middle" fontSize={10} fill="#fde68a">
          {t('rya.lw.mo.sun')}
        </text>
        <circle cx={E.x} cy={E.y} r={95} fill="none" stroke="#334155" strokeDasharray="3 5" />
        <ellipse cx={E.x} cy={E.y} rx={30 + 26 * amp} ry={30 + 4 * (1 - amp)} fill="#38bdf8" opacity={0.45} transform={`rotate(${(-phi * 180) / Math.PI} ${E.x} ${E.y})`} />
        <circle cx={E.x} cy={E.y} r={26} fill="#1d4ed8" />
        <circle cx={E.x - 6} cy={E.y - 5} r={9} fill="#16a34a" opacity={0.8} />
        <text x={E.x} y={E.y + 48} textAnchor="middle" fontSize={10} fill="#bae6fd">
          {t('rya.lw.mo.earth')}
        </text>
        <circle cx={moon.x} cy={moon.y} r={10} fill="#e2e8f0" />
        <text x={moon.x} y={moon.y - 15} textAnchor="middle" fontSize={10} fill="#e2e8f0">
          {t('rya.lw.mo.moon')}
        </text>
        <rect x={415} y={20} width={170} height={225} rx={8} fill="#ffffff" opacity={0.95} />
        <text x={500} y={42} textAnchor="middle" fontSize={13} fontWeight={700} fill={kind === 'springs' ? '#b91c1c' : kind === 'neaps' ? '#1d4ed8' : '#0f172a'}>
          {t(`rya.lw.mo.${kind}`)}
        </text>
        <text x={500} y={60} textAnchor="middle" fontSize={10} fill="#475569">
          {t(`rya.lw.mo.ph.${phase}`)}
        </text>
        <text x={500} y={80} textAnchor="middle" fontSize={11} fill="#0f172a">
          {t('rya.lw.mo.range', { r: n1(range) })}
        </text>
        <line x1={430} y1={205 - (2.6 + 2.1) * 22} x2={580} y2={205 - (2.6 + 2.1) * 22} stroke="#94a3b8" strokeDasharray="2 3" />
        <line x1={430} y1={205 - (2.6 - 2.1) * 22} x2={580} y2={205 - (2.6 - 2.1) * 22} stroke="#94a3b8" strokeDasharray="2 3" />
        <path d={curve} fill="none" stroke="#0284c7" strokeWidth={2} />
        <text x={500} y={236} textAnchor="middle" fontSize={9} fill="#64748b">
          {t('rya.lw.mo.day24')}
        </text>
      </svg>
      <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <Slider label={t('rya.lw.mo.dayOf')} value={day} min={0} max={29.5} step={0.5} onChange={(v) => (setPlaying(false), setDay(v))} unit="" />
        <button type="button" className="btn-primary !px-3 !py-1 text-xs" onClick={() => setPlaying((p) => !p)}>
          {playing ? `⏸ ${t('rya.lw.ta.pause')}` : `▶ ${t('rya.lw.mo.play')}`}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{t('rya.lw.mo.explain')}</p>
    </Frame>
  )
}

/* ---------------- A tidal stream atlas page ---------------- */

const ATLAS_ARROWS: { x: number; y: number; f: number; bend: number; id?: string }[] = [
  { x: 70, y: 150, f: 0.6, bend: 0 },
  { x: 160, y: 140, f: 0.8, bend: -6 },
  { x: 300, y: 150, f: 1.0, bend: 0, id: 'A' },
  { x: 420, y: 140, f: 1.15, bend: 8 },
  { x: 530, y: 120, f: 0.8, bend: 14 },
  { x: 110, y: 230, f: 0.5, bend: 6 },
  { x: 230, y: 245, f: 0.6, bend: 0 },
  { x: 470, y: 240, f: 0.6, bend: -8 },
  { x: 560, y: 225, f: 0.5, bend: -12 },
]

/** Spring rate (kn, + = east-going) at the atlas page `h` hours from HW. */
export function atlasSpring(h: number, f: number): number {
  return Math.round(2.6 * f * Math.sin((Math.PI * (h + 6)) / 6) * 10) / 10
}
export const neapOf = (spring: number) => Math.round(Math.abs(spring) * 0.55 * 10) / 10
const two = (v: number) => String(Math.round(Math.abs(v) * 10)).padStart(2, '0')

export function AtlasWidget({ t }: { t: Translate }) {
  const [h, setH] = useState(-3)
  const [springs, setSprings] = useState(true)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setH((x) => (x >= 6 ? -6 : x + 1)), 1100)
    return () => window.clearInterval(id)
  }, [playing])
  const a = atlasSpring(h, 1)
  const aNeap = neapOf(a)
  const slack = Math.abs(a) < 0.3
  const pageLabel = h === 0 ? 'HW' : `HW ${h > 0 ? '+' : '−'}${Math.abs(h)}`

  return (
    <Frame title={t('rya.lw.at.title')}>
      <svg viewBox="0 0 600 320" className="w-full rounded-lg bg-[#fdfbf3] dark:bg-[#f5f1e3]" role="img" aria-label={t('rya.lw.at.title')}>
        <path d="M0 0 H600 V70 Q520 95 450 80 Q380 60 320 90 Q250 110 180 85 Q100 60 0 95 Z" fill="#e8d9a8" stroke="#a08850" />
        <path d="M200 205 Q260 175 340 190 Q400 200 420 215 Q390 240 320 238 Q240 236 200 205 Z" fill="#e8d9a8" stroke="#a08850" />
        <path d="M0 290 Q120 270 240 300 Q380 320 600 285 V320 H0 Z" fill="#e8d9a8" stroke="#a08850" />
        <text x={310} y={215} textAnchor="middle" fontSize={10} fill="#7c6a3a">
          {t('rya.lw.at.island')}
        </text>
        <rect x={8} y={8} width={210} height={44} rx={6} fill="#ffffff" stroke="#0b3a5c" />
        <text x={18} y={27} fontSize={14} fontWeight={700} fill="#0b3a5c">
          {pageLabel}
        </text>
        <text x={18} y={44} fontSize={10} fill="#475569">
          {t(h === 0 ? 'rya.lw.at.pageHw' : h < 0 ? 'rya.lw.at.pageBefore' : 'rya.lw.at.pageAfter', { n: Math.abs(h) })}
        </text>
        {ATLAS_ARROWS.map((p, i) => {
          const sp = atlasSpring(h, p.f)
          const np = neapOf(sp)
          if (Math.abs(sp) < 0.25)
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill="none" stroke="#7c3aed" strokeWidth={1.5} />
                {p.id && (
                  <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={10} fontWeight={700} fill="#7c3aed">
                    {p.id}
                  </text>
                )}
              </g>
            )
          const dir = (sp > 0 ? 0 : 180) + p.bend
          const len = 18 + Math.abs(sp) * 16
          const w = 1 + Math.abs(sp) * 1.4
          return (
            <g key={i} transform={`translate(${p.x} ${p.y})`}>
              <g transform={`rotate(${dir})`}>
                <line x1={-len / 2} y1={0} x2={len / 2 - 6} y2={0} stroke="#7c3aed" strokeWidth={w} strokeLinecap="round" />
                <path d={`M${len / 2} 0 L${len / 2 - 9} ${-4 - w / 2} L${len / 2 - 9} ${4 + w / 2} Z`} fill="#7c3aed" />
              </g>
              <text y={-8 - w} textAnchor="middle" fontSize={10} fill="#4c1d95">
                <tspan fontWeight={springs ? 400 : 700} fill={springs ? '#6b7280' : '#4c1d95'}>
                  {two(np)}
                </tspan>
                ,
                <tspan fontWeight={springs ? 700 : 400} fill={springs ? '#4c1d95' : '#6b7280'}>
                  {two(sp)}
                </tspan>
              </text>
              {p.id && (
                <text y={18 + w} textAnchor="middle" fontSize={11} fontWeight={700} fill="#b91c1c">
                  {p.id}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <div className="mt-3 grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block text-xs">
          <span className="flex justify-between text-slate-600 dark:text-slate-300">
            <span>{t('rya.lw.at.page')}</span>
            <span className="font-mono font-semibold">{pageLabel}</span>
          </span>
          <input type="range" min={-6} max={6} step={1} value={h} onChange={(e) => (setPlaying(false), setH(Number(e.target.value)))} className="w-full accent-violet-600" />
        </label>
        <div className="flex flex-wrap gap-1">
          {[true, false].map((s) => (
            <button key={String(s)} type="button" onClick={() => setSprings(s)} className={`rounded-full px-3 py-1 text-xs font-medium ${springs === s ? 'bg-violet-700 text-white' : 'bg-white dark:bg-white/10'}`}>
              {t(s ? 'rya.lw.at.springs' : 'rya.lw.at.neaps')}
            </button>
          ))}
          <button type="button" className="btn-primary !px-3 !py-1 text-xs" onClick={() => setPlaying((p) => !p)}>
            {playing ? `⏸ ${t('rya.lw.ta.pause')}` : `▶ ${t('rya.lw.at.play')}`}
          </button>
        </div>
      </div>
      <p className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-sm dark:bg-white/5">
        <b>A:</b>{' '}
        {slack
          ? t('rya.lw.at.slack')
          : t('rya.lw.at.read', { label: `${two(aNeap)},${two(a)}`, dir: a > 0 ? '090°' : '270°', neap: n1(aNeap), spring: n1(Math.abs(a)), today: n1(springs ? Math.abs(a) : aNeap) })}
      </p>
    </Frame>
  )
}

/* ---------------- A tidal diamond on the chart ---------------- */

export const DIAMOND: { set: number; sp: number; np: number }[] = [
  { set: 30, sp: 0.6, np: 0.3 },
  { set: 35, sp: 1.4, np: 0.7 },
  { set: 40, sp: 2.1, np: 1.0 },
  { set: 45, sp: 2.4, np: 1.2 },
  { set: 50, sp: 2.0, np: 1.0 },
  { set: 60, sp: 1.0, np: 0.5 },
  { set: 140, sp: 0.2, np: 0.1 },
  { set: 220, sp: 1.0, np: 0.5 },
  { set: 230, sp: 2.1, np: 1.0 },
  { set: 225, sp: 2.5, np: 1.3 },
  { set: 220, sp: 2.0, np: 1.0 },
  { set: 215, sp: 1.2, np: 0.6 },
  { set: 200, sp: 0.4, np: 0.2 },
]
export const SPRING_RANGE = 4.2
export const NEAP_RANGE = 2.0
export function diamondRate(row: { sp: number; np: number }, range: number): number {
  const f = (range - NEAP_RANGE) / (SPRING_RANGE - NEAP_RANGE)
  return Math.max(0, row.np + (row.sp - row.np) * f)
}

export function DiamondWidget({ t }: { t: Translate }) {
  const [h, setH] = useState(-3)
  const [range, setRange] = useState(3.1)
  const row = DIAMOND[h + 6]
  const rate = diamondRate(row, range)
  const rad = (row.set * Math.PI) / 180
  const D = { x: 140, y: 110 }
  const len = 14 + rate * 22
  const tip = { x: D.x + Math.sin(rad) * len, y: D.y - Math.cos(rad) * len }
  const hl = (k: number) => (k === 0 ? 'HW' : `HW ${k > 0 ? '+' : '−'}${Math.abs(k)}`)

  return (
    <Frame title={t('rya.lw.di.title')}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem]">
        <svg viewBox="0 0 280 220" className="w-full rounded-lg bg-[#fdfbf3] dark:bg-[#f5f1e3]" role="img" aria-label={t('rya.lw.di.title')}>
          <path d="M0 0 H280 V40 Q200 70 140 45 Q70 20 0 55 Z" fill="#e8d9a8" stroke="#a08850" />
          {[
            [40, 90, '8'],
            [230, 80, '12'],
            [60, 170, '15'],
            [210, 180, '18'],
            [140, 200, '21'],
          ].map(([x, y, d]) => (
            <text key={`${x}`} x={x as number} y={y as number} fontSize={10} fill="#334155">
              {d}
            </text>
          ))}
          <text x={8} y={214} fontSize={9} fill="#64748b">
            N ↑
          </text>
          <line x1={D.x} y1={D.y} x2={tip.x} y2={tip.y} stroke="#0284c7" strokeWidth={2 + rate} strokeLinecap="round" />
          <circle cx={tip.x} cy={tip.y} r={3 + rate / 2} fill="#0284c7" />
          <path d={`M${D.x} ${D.y - 11} L${D.x + 9} ${D.y} L${D.x} ${D.y + 11} L${D.x - 9} ${D.y} Z`} fill="#ffffff" stroke="#a21caf" strokeWidth={2} />
          <text x={D.x} y={D.y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#a21caf">
            A
          </text>
          <text x={tip.x + 6} y={tip.y - 6} fontSize={11} fontWeight={700} fill="#0369a1">
            {n1(rate)} kn
          </text>
        </svg>
        <div className="overflow-hidden rounded-lg border border-fuchsia-300 bg-white text-xs dark:bg-white/5">
          <div className="bg-fuchsia-50 px-2 py-1 font-semibold text-fuchsia-800 dark:bg-fuchsia-500/10 dark:text-fuchsia-200">◊A 50°10′N 001°20′W</div>
          <table className="w-full text-center">
            <thead className="text-slate-500">
              <tr>
                <th className="px-1 py-0.5 text-left">{t('rya.lw.di.hour')}</th>
                <th>{t('rya.lw.di.dir')}</th>
                <th>Sp</th>
                <th>Np</th>
              </tr>
            </thead>
            <tbody>
              {DIAMOND.map((r, i) => {
                const k = i - 6
                return (
                  <tr key={k} onClick={() => setH(k)} className={`cursor-pointer ${k === h ? 'bg-sky-100 font-semibold dark:bg-sky-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                    <td className="px-1 text-left">{hl(k)}</td>
                    <td>{String(r.set).padStart(3, '0')}°</td>
                    <td>{n1(r.sp)}</td>
                    <td>{n1(r.np)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label={t('rya.lw.di.hourPick')} value={h} min={-6} max={6} step={1} onChange={setH} unit="h" />
        <Slider label={t('rya.lw.di.range')} value={range} min={1.5} max={5} step={0.1} onChange={setRange} unit="m" />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('rya.lw.di.ranges', { sp: n1(SPRING_RANGE), np: n1(NEAP_RANGE) })}</p>
      <p className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-sm dark:bg-white/5">
        {t('rya.lw.di.calc', { hour: hl(h), dir: String(row.set).padStart(3, '0'), sp: n1(row.sp), np: n1(row.np), range: n1(range), rate: n1(rate) })}
      </p>
    </Frame>
  )
}
