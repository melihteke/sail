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
/** Height of tide `h` hours after HW (HW → LW at +6 → HW at +12). */
export function heightAfterHw(h: number): number {
  return twelfthsHeight(TA.lw, TA.hw, h <= 6 ? 6 + h : h - 6)
}

export function TideAnchorWidget({ t }: { t: Translate }) {
  const [charted, setCharted] = useState(3)
  const [chain, setChain] = useState(20)
  const [hour, setHour] = useState(0)
  const [playing, setPlaying] = useState(false)

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
    </Frame>
  )
}
