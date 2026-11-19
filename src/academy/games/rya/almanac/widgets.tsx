import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useI18n, type Lang } from '../../../i18n'
import { Frame } from '../lessons/frame'
import {
  courseToSteer,
  dayEvents,
  diamondOf,
  fmtBrg,
  fmtDiff,
  fmtHM,
  fmtLocal,
  fmtPos,
  fmtVariation,
  gateEvents,
  gatePortName,
  gateWindow,
  heightAt,
  heightDifference,
  hourLabel,
  isFair,
  legGeometry,
  mainTide,
  mod,
  planPassage,
  r1,
  rangeFactor,
  secEvent,
  secEvents,
  stdEvents,
  streamRate,
  timeDifference,
  toMagnetic,
  totalMinutes,
  totalNm,
  type PassagePlan,
} from './calc'
import type { Feature, LatLon, Scenario, TideEvent } from './scenario'
import { EXTRA_SCENARIOS, SALTMERE } from './scenarios'
import { fill, num, type AlmanacText, type AWidget, type ScenarioText } from './text'
import { almanacTexts, scenarioTexts } from './texts'
import { planVars } from './vars'

const DEG = Math.PI / 180

const ScenarioCtx = createContext<Scenario>(SALTMERE)

export function ScenarioProvider({ s, children }: { s: Scenario; children: ReactNode }) {
  return <ScenarioCtx.Provider value={s}>{children}</ScenarioCtx.Provider>
}

export function useAlmanac(): { a: AlmanacText; u: AlmanacText['ui']; st: ScenarioText; s: Scenario; lang: Lang; n: (v: number, d?: number) => string } {
  const { lang } = useI18n()
  const s = useContext(ScenarioCtx)
  const a = almanacTexts[lang]
  return { a, u: a.ui, st: scenarioTexts[s.id][lang], s, lang, n: (v, d = 1) => num(v, lang, d) }
}

export function usePlanVars(p?: PassagePlan): Record<string, string> {
  const { s, lang, u } = useAlmanac()
  return useMemo(() => planVars(s, p ?? planPassage(s, s.planDay, s.planDepart), lang, u), [s, p, lang, u])
}

/* ---------------- Small UI pieces ---------------- */

function Slider({ label, value, min, max, step, onChange, show }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="block text-xs">
      <span className="flex justify-between text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-mono font-semibold text-navy-900 dark:text-sky-100">{show}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-sky-600" />
    </label>
  )
}

function Pills<T extends string | number>({ items, value, onChange, label }: { items: T[]; value: T; onChange: (v: T) => void; label: (v: T) => string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((it) => (
        <button
          key={String(it)}
          type="button"
          onClick={() => onChange(it)}
          className={`rounded-full border px-3 py-0.5 text-xs font-medium ${it === value ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/20 dark:bg-white/5 dark:text-slate-300'}`}
        >
          {label(it)}
        </button>
      ))}
    </div>
  )
}

function Table({ head, rows, highlight, compact }: { head: ReactNode[]; rows: ReactNode[][]; highlight?: (i: number) => boolean; compact?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse ${compact ? 'text-xs' : 'text-sm'}`}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} className="border-b-2 border-slate-300 px-2 py-1 text-left font-semibold dark:border-white/20">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={highlight?.(i) ? 'bg-amber-100 font-semibold dark:bg-amber-400/15' : 'odd:bg-slate-50 dark:odd:bg-white/5'}>
              {r.map((c, j) => (
                <td key={j} className="border-b border-slate-200 px-2 py-1 align-top dark:border-white/10">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Mono = ({ children }: { children: ReactNode }) => <span className="font-mono">{children}</span>

/** "HHMM UT · HHMM local" for tidal scenarios, local time only otherwise. */
function useBoth() {
  const { s, u } = useAlmanac()
  return (ut: number) => (s.tidal ? `${fmtHM(ut)} ${u.ut} · ${fmtLocal(s, ut)} ${u.local}` : `${fmtLocal(s, ut)} ${u.local}`)
}

const dateOf = (s: Scenario, u: AlmanacText['ui'], day = s.planDay) => (s.tidal ? `${day} ${u.months[s.month - 1]}` : '')

/* ---------------- Chart ---------------- */

function chartGeom(s: Scenario) {
  const B = s.bounds
  const cos = Math.cos(s.latRef * DEG)
  const CW = 640
  const K = CW / ((B.lonMax - B.lonMin) * cos)
  const CH = (B.latMax - B.latMin) * K
  const px = (p: LatLon) => ({ x: (p.lon - B.lonMin) * cos * K, y: (B.latMax - p.lat) * K })
  return { B, K, CW, CH, px, cos }
}

function Arrow({ from, toDeg, len, color, width = 2, heads = 1 }: { from: { x: number; y: number }; toDeg: number; len: number; color: string; width?: number; heads?: number }) {
  const ux = Math.sin(toDeg * DEG)
  const uy = -Math.cos(toDeg * DEG)
  const tip = { x: from.x + ux * len, y: from.y + uy * len }
  const head = (f: number) => {
    const c = { x: from.x + ux * len * f, y: from.y + uy * len * f }
    const sz = 6 + width
    return `M${c.x - ux * sz - uy * sz * 0.55} ${c.y - uy * sz + ux * sz * 0.55} L${c.x} ${c.y} L${c.x - ux * sz + uy * sz * 0.55} ${c.y - uy * sz - ux * sz * 0.55}`
  }
  const fs = heads === 1 ? [1] : heads === 2 ? [0.62, 0.72] : [0.52, 0.62, 0.72]
  return (
    <g stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={from.x} y1={from.y} x2={tip.x} y2={tip.y} />
      {fs.map((f) => (
        <path key={f} d={head(f)} />
      ))}
    </g>
  )
}

const polyPath = (pts: { x: number; y: number }[]) => `M${pts.map((c) => `${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' L')} Z`
const halo = { stroke: '#f4f9fc', strokeWidth: 3, paintOrder: 'stroke' as const }

function BuoySymbol({ type }: { type: Extract<Feature, { kind: 'buoy' }>['type'] }) {
  if (type === 'swm')
    return (
      <>
        <circle r={5} fill="#fff" stroke="#dc2626" strokeWidth={1.5} />
        <path d="M0 -5 V5" stroke="#dc2626" strokeWidth={2} />
      </>
    )
  if (type === 'stbd') return <path d="M0 -7 L5 4 L-5 4 Z" fill="#16a34a" stroke="#14532d" />
  if (type === 'port') return <rect x={-4} y={-6} width={8} height={10} fill="#dc2626" stroke="#7f1d1d" />
  if (type === 'special') return <path d="M-4 -4 L4 4 M4 -4 L-4 4" stroke="#ca8a04" strokeWidth={2.5} />
  const top = { cardN: 'M-4 -6 L0 -11 L4 -6 Z M-4 -12 L0 -17 L4 -12 Z', cardS: 'M-4 -11 L0 -6 L4 -11 Z M-4 -17 L0 -12 L4 -17 Z', cardE: 'M-4 -9 L0 -14 L4 -9 Z M-4 -15 L0 -10 L4 -15 Z', cardW: 'M-4 -14 L0 -9 L4 -14 Z M-4 -10 L0 -15 L4 -10 Z' }[type]
  return (
    <>
      <rect x={-3} y={-5} width={6} height={10} fill="#facc15" stroke="#0f172a" />
      <rect x={-3} y={type === 'cardS' ? -5 : 0} width={6} height={5} fill="#0f172a" />
      <path d={top} fill="#0f172a" />
    </>
  )
}

function FeatureView({ f, px, K }: { f: Feature; px: (p: LatLon) => { x: number; y: number }; K: number }) {
  switch (f.kind) {
    case 'label': {
      const p = px(f.pos)
      return (
        <text x={p.x} y={p.y} fontSize={f.size ?? 10} fill={f.color ?? '#334155'} fontStyle={f.italic ? 'italic' : undefined} letterSpacing={f.italic && (f.size ?? 10) > 11 ? 3 : undefined} textAnchor={f.anchor ?? 'middle'} {...halo}>
          {f.text}
        </text>
      )
    }
    case 'port': {
      const p = px(f.pos)
      return (
        <g>
          <circle cx={p.x} cy={p.y} r={4} fill="#4a3b12" />
          <text x={p.x + (f.dx ?? 6)} y={p.y + (f.dy ?? -6)} fontSize={11} fontWeight={700} fill="#4a3b12" {...halo}>
            {f.label}
          </text>
        </g>
      )
    }
    case 'anchorage': {
      const p = px(f.pos)
      return (
        <text x={p.x - 5} y={p.y + 4} fontSize={11}>
          ⚓
        </text>
      )
    }
    case 'light': {
      const p = px(f.pos)
      return (
        <g>
          <path d={`M${p.x} ${p.y} l-3 -9 l6 0 z`} fill="#7c2d12" />
          <path d={`M${p.x} ${p.y - 9} l22 -14 l-3 9 z`} fill="#facc15" opacity={0.8} />
          {f.name && (
            <text x={p.x + 4} y={p.y - 20} fontSize={11} fontWeight={700} fill="#4a3b12" {...halo}>
              {f.name}
            </text>
          )}
          <text x={p.x + 4} y={p.y - 8} fontSize={7.5} fill="#7c2d12" {...halo}>
            {f.label}
          </text>
        </g>
      )
    }
    case 'race': {
      const p = px(f.pos)
      return (
        <g>
          <text x={p.x - 14} y={p.y + 4} fontSize={13} fill="#0369a1">
            ≈≈
          </text>
          <text x={p.x - 14} y={p.y + 13} fontSize={7} fill="#0369a1" {...halo}>
            {f.label}
          </text>
        </g>
      )
    }
    case 'rock': {
      const p = px(f.pos)
      return (
        <g transform={`translate(${p.x} ${p.y})`}>
          <path d="M-5 0 H5 M0 -5 V5" stroke="#0f172a" strokeWidth={1.6} />
          <circle r={7} fill="none" stroke="#0f172a" strokeDasharray="2 2" />
          <text x={9} y={-6} fontSize={8} fill="#0f172a" {...halo}>
            {f.label}
          </text>
          {f.drying && (
            <text x={9} y={4} fontSize={7.5} fill="#166534">
              {f.drying}
            </text>
          )}
        </g>
      )
    }
    case 'buoy': {
      const p = px(f.pos)
      return (
        <g transform={`translate(${p.x} ${p.y})`}>
          <BuoySymbol type={f.type} />
          <text x={f.left ? -8 : 8} y={3} fontSize={7.5} fill="#7f1d1d" textAnchor={f.left ? 'end' : 'start'} {...halo}>
            {f.label}
          </text>
        </g>
      )
    }
    case 'bar': {
      const p = px(f.pos)
      return (
        <g>
          <ellipse cx={p.x} cy={p.y} rx={14} ry={5} fill="#a7e3c0" stroke="#3f8f5f" strokeWidth={0.8} />
          <text x={p.x + 16} y={p.y + 10} fontSize={8} fill="#166534">
            {f.drying}
          </text>
        </g>
      )
    }
    case 'leading': {
      const a = px(f.from)
      const b = px(f.to)
      return (
        <g>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#16a34a" strokeDasharray="4 3" />
          <text x={a.x - 26} y={a.y + 12} fontSize={7} fill="#166534" {...halo}>
            {f.label}
          </text>
        </g>
      )
    }
    case 'path': {
      const pts = f.pts.map(px)
      return <polyline points={pts.map((c) => `${c.x},${c.y}`).join(' ')} fill="none" stroke="#c026d3" strokeWidth={1.2} strokeDasharray="3 3" />
    }
    case 'windfarm': {
      const zone = f.zone.map(px)
      const poly = f.poly.map(px)
      return (
        <g>
          <path d={polyPath(zone)} fill="none" stroke="#c026d3" strokeWidth={1.2} strokeDasharray="6 3" />
          <path d={polyPath(poly)} fill="#f5d0fe" fillOpacity={0.35} stroke="#a21caf" strokeWidth={1} />
          {f.turbines.map((t, i) => {
            const p = px(t)
            return (
              <g key={i} transform={`translate(${p.x} ${p.y})`}>
                <circle r={2.2} fill="#fff" stroke="#6b21a8" />
                <path d="M0 -6 V0 M0 0 L5 3 M0 0 L-5 3" stroke="#6b21a8" strokeWidth={0.8} />
              </g>
            )
          })}
          <text x={(poly[0].x + poly[2].x) / 2} y={(poly[0].y + poly[2].y) / 2} fontSize={11} fontWeight={700} textAnchor="middle" fill="#86198f" {...halo}>
            {f.label}
          </text>
          <text x={(poly[0].x + poly[2].x) / 2} y={(poly[0].y + poly[2].y) / 2 + 13} fontSize={8} textAnchor="middle" fill="#86198f" {...halo}>
            ⛔ 500 m
          </text>
        </g>
      )
    }
    case 'tss': {
      const lab = px(f.labelAt)
      return (
        <g>
          {f.lanes.map((l, i) => {
            const at = px(l.at)
            return (
              <g key={i}>
                <path d={polyPath(l.poly.map(px))} fill="#fae8ff" fillOpacity={0.45} stroke="#c026d3" strokeWidth={0.8} strokeDasharray="8 4" />
                <Arrow from={{ x: at.x - Math.sin(l.dir * DEG) * 30, y: at.y }} toDeg={l.dir} len={60} color="#a21caf" width={3} />
              </g>
            )
          })}
          <path d={polyPath(f.sep.map(px))} fill="#d946ef" fillOpacity={0.3} stroke="none" />
          <text x={lab.x} y={lab.y + 4} fontSize={10} fontWeight={700} textAnchor="middle" fill="#86198f" {...halo}>
            {f.label}
          </text>
        </g>
      )
    }
    case 'bridge': {
      const a = px(f.from)
      const b = px(f.to)
      const at = f.labelAt ? px(f.labelAt) : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 8 }
      return (
        <g>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#475569" strokeWidth={4} />
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e2e8f0" strokeWidth={1.2} strokeDasharray="5 3" />
          <text x={at.x} y={at.y} fontSize={8} textAnchor="middle" fill="#334155" fontWeight={700} {...halo}>
            {f.label}
          </text>
        </g>
      )
    }
    case 'tower': {
      const p = px(f.pos)
      const sz = Math.max(6, K * 0.05)
      return (
        <g>
          <circle cx={p.x} cy={p.y} r={sz} fill="#e7d7a6" stroke="#8a7440" />
          <path d={`M${p.x - 3} ${p.y + 2} L${p.x - 2} ${p.y - 10} L${p.x + 2} ${p.y - 10} L${p.x + 3} ${p.y + 2} Z`} fill="#fff" stroke="#7c2d12" />
          <path d={`M${p.x - 2.5} ${p.y - 10} L${p.x} ${p.y - 15} L${p.x + 2.5} ${p.y - 10} Z`} fill="#7c2d12" />
          <text x={p.x - 8} y={p.y + 4} fontSize={10} fontWeight={700} textAnchor="end" fill="#7c2d12" {...halo}>
            {f.label}
          </text>
        </g>
      )
    }
    case 'shoal': {
      const at = px(f.at)
      return (
        <g>
          <path d={polyPath(f.poly.map(px))} fill="#a7e3c0" fillOpacity={0.8} stroke="#3f8f5f" strokeWidth={0.8} strokeDasharray="2 2" />
          <text x={at.x} y={at.y} fontSize={7.5} textAnchor="middle" fill="#166534" {...halo}>
            {f.label}
          </text>
        </g>
      )
    }
  }
}

export function ScenarioChart({ showLegs = true, showDiamonds = true, stream, className = '' }: { showLegs?: boolean; showDiamonds?: boolean; stream?: { hour: number; range: number } | 'current'; className?: string }) {
  const { u, n, s, st } = useAlmanac()
  const { B, K, CW, CH, px, cos } = chartGeom(s)
  const plan = useMemo(() => planPassage(s, s.planDay, s.planDepart), [s])
  const hMin = B.latMax - B.latMin
  const wMin = B.lonMax - B.lonMin
  const latLab = hMin > 12 ? 2 : 1
  const lonLab = wMin > 16 ? 2 : 1
  const latTicks = Array.from({ length: hMin + 1 }, (_, i) => B.latMin + i)
  const lonTicks = Array.from({ length: Math.floor(wMin / lonLab) + 1 }, (_, i) => B.lonMin + i * lonLab)
  const rose = px(s.rose)
  const scaleNm = CW / K > 10 ? 2 : 1
  const degLat = Math.floor((B.latMin + B.latMax) / 2 / 60)
  const degLon = Math.floor(Math.abs((B.lonMin + B.lonMax) / 2) / 60)
  return (
    <svg viewBox={`-34 -6 ${CW + 40} ${CH + 30}`} className={`w-full rounded-lg bg-[#eef6fb] ${className}`} role="img" aria-label={st.chartTitle}>
      <defs>
        <clipPath id={`clip-${s.id}`}>
          <rect x={0} y={0} width={CW} height={CH} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={CW} height={CH} fill="#f4f9fc" stroke="#94a3b8" />
      {latTicks.map((m) => {
        const y = (B.latMax - m) * K
        const lab = (m - B.latMin) % latLab === 0
        return (
          <g key={m}>
            {lab && <line x1={0} x2={CW} y1={y} y2={y} stroke="#cbd5e1" strokeWidth={0.6} />}
            <line x1={-6} x2={0} y1={y} y2={y} stroke="#475569" />
            {lab && (
              <text x={-8} y={y + 3} fontSize={9} textAnchor="end" fill="#334155">
                {`${String(mod(m, 60)).padStart(2, '0')}′`}
              </text>
            )}
          </g>
        )
      })}
      {lonTicks.map((m) => {
        const x = (m - B.lonMin) * cos * K
        return (
          <g key={m}>
            <line x1={x} x2={x} y1={0} y2={CH} stroke="#cbd5e1" strokeWidth={0.6} />
            <text x={x} y={CH + 12} fontSize={9} textAnchor="middle" fill="#334155">
              {`${String(mod(Math.abs(m), 60)).padStart(2, '0')}′`}
            </text>
          </g>
        )
      })}
      <text x={-30} y={CH + 22} fontSize={8} fill="#475569">
        {`${degLat}°N · ${String(degLon).padStart(3, '0')}°${B.lonMin < 0 ? 'W' : 'E'}`}
      </text>
      <g clipPath={`url(#clip-${s.id})`}>
        {s.land.map((poly, i) => {
          const d = polyPath(poly.map(px))
          return (
            <g key={i}>
              <path d={d} fill="none" stroke="#bfdcf0" strokeWidth={s.shallow ?? 22} strokeLinejoin="round" />
              <path d={d} fill="none" stroke="#a7e3c0" strokeWidth={Math.min(6, (s.shallow ?? 22) / 3)} strokeLinejoin="round" />
            </g>
          )
        })}
        {s.land.map((poly, i) => (
          <path key={i} d={polyPath(poly.map(px))} fill="#efe0b0" stroke="#8a7440" strokeWidth={1.2} strokeLinejoin="round" />
        ))}
      </g>
      {s.soundings.map((x, i) => {
        const p = px(x)
        return (
          <text key={i} x={p.x} y={p.y} fontSize={9} textAnchor="middle" fill="#334155" fontStyle="italic">
            {x.d}
          </text>
        )
      })}
      {s.features.map((f, i) => (
        <FeatureView key={i} f={f} px={px} K={K} />
      ))}
      {showLegs && (
        <g>
          {plan.legs.map((l, i) => {
            const a = px(l.a)
            const b = px(l.b)
            const ang = Math.atan2(b.y - a.y, b.x - a.x) / DEG
            const rot = ang > 90 || ang < -90 ? ang + 180 : ang
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#c026d3" strokeWidth={2} strokeDasharray={l.fixed ? '7 3' : undefined} />
                <g transform={`translate(${a.x + (b.x - a.x) * 0.4} ${a.y + (b.y - a.y) * 0.4}) rotate(${rot})`}>
                  <text y={-5} fontSize={9} textAnchor="middle" fill="#86198f" fontWeight={700} {...halo}>
                    {l.fixed ? `TSS ${fmtBrg(l.cts)}T` : `${fmtBrg(l.track)}T ${n(l.nm)}M`}
                  </text>
                </g>
              </g>
            )
          })}
          {plan.legs
            .filter((l) => l.fixed)
            .map((l, i) => {
              const b = px(l.b)
              return <circle key={i} cx={b.x} cy={b.y} r={3.5} fill="#fff" stroke="#86198f" strokeWidth={1.5} />
            })}
          {s.waypoints.map((w) => {
            const p = px(w)
            return (
              <g key={w.id} transform={`translate(${p.x} ${p.y})`}>
                <rect x={-6} y={-6} width={12} height={12} fill="#fff" stroke="#86198f" strokeWidth={1.5} />
                <circle r={2} fill="#86198f" />
                <text x={9} y={4} fontSize={10} fontWeight={700} fill="#86198f" {...halo}>
                  {w.id}
                </text>
              </g>
            )
          })}
        </g>
      )}
      {showDiamonds &&
        s.diamonds.map((d) => {
          const p = px(d)
          return (
            <g key={d.id} transform={`translate(${p.x} ${p.y})`}>
              <path d="M0 -9 L7 0 L0 9 L-7 0 Z" fill="#fff" stroke="#a21caf" strokeWidth={1.6} />
              <text y={3.5} fontSize={9} textAnchor="middle" fontWeight={700} fill="#a21caf">
                {d.id}
              </text>
            </g>
          )
        })}
      {stream &&
        stream !== 'current' &&
        s.atlas.map((ap, i) => {
          const row = diamondOf(s, ap.d).rows[stream.hour + 6]
          const rate = r1(streamRate(s, row, stream.range) * ap.m)
          const p = px(ap.p)
          return (
            <g key={i}>
              {rate >= 0.15 ? <Arrow from={p} toDeg={row.set} len={10 + rate * 16} color="#0369a1" width={1.4 + rate * 0.8} /> : <circle cx={p.x} cy={p.y} r={2.5} fill="#0369a1" />}
              <text x={p.x + 5} y={p.y - 5} fontSize={8.5} fontWeight={700} fill="#075985" {...halo}>
                {String(Math.round(rate * 10)).padStart(2, '0')}
              </text>
            </g>
          )
        })}
      {stream === 'current' &&
        plan.legs.map((l, i) => {
          const a = px(l.a)
          const b = px(l.b)
          const m = { x: (a.x + b.x) / 2 + 14, y: (a.y + b.y) / 2 }
          return (
            <g key={i}>
              <Arrow from={m} toDeg={l.set} len={12 + l.rate * 12} color="#0369a1" width={1.4 + l.rate * 0.6} />
              <text x={m.x + 6} y={m.y + 14} fontSize={8.5} fontWeight={700} fill="#075985" {...halo}>
                {`${n(l.rate)} kn`}
              </text>
            </g>
          )
        })}
      <g transform={`translate(${rose.x} ${rose.y})`}>
        <circle r={36} fill="#fff" fillOpacity={0.6} stroke="#a21caf" strokeWidth={0.8} />
        <circle r={24} fill="none" stroke="#a21caf" strokeWidth={0.5} />
        {Array.from({ length: 36 }, (_, i) => (
          <line key={i} x1={0} y1={-36} x2={0} y2={i % 9 === 0 ? -30 : -33} stroke="#a21caf" strokeWidth={0.6} transform={`rotate(${i * 10})`} />
        ))}
        <path d="M0 -34 L4 -22 L-4 -22 Z" fill="#a21caf" />
        <g transform={`rotate(${s.variation})`}>
          <line x1={0} y1={8} x2={0} y2={-22} stroke="#a21caf" strokeWidth={1} />
          <path d="M0 -24 L3 -16 L-3 -16 Z" fill="none" stroke="#a21caf" />
        </g>
        <text y={50} fontSize={7.5} textAnchor="middle" fill="#86198f">
          {fill(u.chart.variation, { v: fmtVariation(s) })}
        </text>
      </g>
      <g transform={`translate(12 ${CH - 14})`}>
        <line x1={0} x2={scaleNm * K} y1={0} y2={0} stroke="#0f172a" strokeWidth={2} />
        {Array.from({ length: scaleNm + 1 }, (_, i) => (
          <line key={i} x1={i * K} x2={i * K} y1={-4} y2={4} stroke="#0f172a" />
        ))}
        <text x={(scaleNm * K) / 2} y={-6} fontSize={8} textAnchor="middle" fill="#0f172a">
          {fill(u.chart.scale, { n: scaleNm })}
        </text>
      </g>
    </svg>
  )
}

function ChartWidget() {
  const { u, n, s, st } = useAlmanac()
  const vars = usePlanVars()
  const [showLegs, setLegs] = useState(true)
  const [showD, setD] = useState(true)
  const [streams, setStreams] = useState(false)
  const [hour, setHour] = useState(-3)
  const range = s.tidal ? mainTide(s, s.planDay).range : 0
  const toggles: [string, boolean, (v: boolean) => void][] = [[u.chart.legs, showLegs, setLegs]]
  if (s.diamonds.length) toggles.push([u.chart.diamonds, showD, setD])
  toggles.push([s.tidal ? u.chart.streams : u.chart.currents, streams, setStreams])
  return (
    <Frame title={st.chartTitle}>
      <div className="mb-2 flex flex-wrap gap-3 text-xs">
        {toggles.map(([label, v, set]) => (
          <label key={label} className="flex items-center gap-1">
            <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} /> {label}
          </label>
        ))}
      </div>
      <ScenarioChart showLegs={showLegs} showDiamonds={showD} stream={streams ? (s.tidal ? { hour, range } : 'current') : undefined} />
      {streams && s.tidal && (
        <div className="mt-2">
          <Slider label={u.chart.hour} value={hour} min={-6} max={6} step={1} onChange={setHour} show={`${hourLabel(hour)} ${s.tidal.standard.name} · ${n(range)} m`} />
        </div>
      )}
      <ul className="mt-2 grid gap-x-4 gap-y-0.5 text-xs text-slate-600 sm:grid-cols-2 dark:text-slate-300">
        {st.legend.map((l) => (
          <li key={l}>• {fill(l, vars)}</li>
        ))}
      </ul>
    </Frame>
  )
}

/* ---------------- Tidal levels / terms diagram (Saltmere values) ---------------- */

function LevelsWidget() {
  const { u, n } = useAlmanac()
  const L = SALTMERE.tidal!.standard.levels
  const [hot, setHot] = useState(3.0)
  const W = 680
  const H = 430
  const base = 318
  const sc = 26
  const y = (m: number) => base - m * sc
  const deep = 3.0
  const bank = 1.2
  const bridge = 18
  const levels: [string, number, string][] = [
    ['HAT', L.hat, '#7c3aed'],
    ['MHWS', L.mhws, '#dc2626'],
    ['MHWN', L.mhwn, '#f97316'],
    ['MSL', L.msl, '#64748b'],
    ['MLWN', L.mlwn, '#0ea5e9'],
    ['MLWS', L.mlws, '#2563eb'],
    ['CD (≈LAT)', 0, '#0f172a'],
  ]
  const ySea = y(hot)
  const overBank = hot - bank
  const bridgeClear = bridge + (L.hat - hot)
  const hl = { stroke: '#f8fbff', strokeWidth: 3.5, paintOrder: 'stroke' as const }
  const deck = y(L.hat + 2.2)
  const x0 = 120
  return (
    <Frame title={u.levels.title}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-[#f8fbff]" role="img" aria-label={u.levels.title}>
        <rect x={x0} y={ySea} width={W - x0} height={H - ySea} fill="#bae6fd" opacity={0.75} />
        <line x1={x0} x2={W} y1={ySea} y2={ySea} stroke="#0284c7" strokeWidth={2} />
        <path d={`M${x0} ${y(-deep)} L255 ${y(-deep)} L305 ${y(-0.5)} L335 ${y(bank)} L395 ${y(bank)} L425 ${y(-0.4)} L470 ${y(-0.2)} L545 ${y(3.5)} L600 ${y(6.6)} L${W} ${y(6.8)} L${W} ${H} L${x0} ${H} Z`} fill="#e7d7a6" stroke="#8a7440" />
        {levels.map(([name, h, c]) => (
          <g key={name}>
            <line x1={x0 - 6} x2={W} y1={y(h)} y2={y(h)} stroke={c} strokeDasharray="5 4" strokeWidth={1} />
            <text x={x0 - 10} y={y(h) + 3.5} fontSize={10} fontWeight={700} fill={c} textAnchor="end">
              {name} {n(h)}
            </text>
          </g>
        ))}
        <text x={x0 + 18} y={26} fontSize={11} fontWeight={700} fill="#0284c7" {...hl}>
          {u.levels.hot}: {n(hot)} m
        </text>
        <line x1={x0 + 14} x2={x0 + 14} y1={32} y2={ySea - 2} stroke="#0284c7" strokeDasharray="2 3" />
        <line x1={x0 + 14} x2={x0 + 14} y1={y(0)} y2={ySea} stroke="#0284c7" strokeWidth={3} markerEnd={hot > 0.3 ? 'url(#lvA)' : undefined} />
        <line x1={x0 + 52} x2={x0 + 52} y1={y(0)} y2={y(-deep)} stroke="#0f172a" strokeWidth={1.5} />
        <text x={x0 + 6} y={H - 8} fontSize={10} fill="#0f172a">
          {u.levels.charted} {n(deep)} m
        </text>
        <line x1={x0 + 96} x2={x0 + 96} y1={ySea} y2={y(-deep)} stroke="#0369a1" strokeWidth={3} />
        <text x={x0 + 101} y={ySea + 15} fontSize={11} fontWeight={700} fill="#0369a1" {...hl}>
          {n(deep + hot)} m
        </text>
        <line x1={350} x2={350} y1={y(0)} y2={y(bank)} stroke="#166534" strokeWidth={2} />
        <text x={365} y={y(0) + 22} fontSize={10} fill="#166534" textAnchor="middle">
          {u.levels.drying} 1̲2
        </text>
        {overBank > 0 && (
          <>
            <line x1={380} x2={380} y1={ySea} y2={y(bank)} stroke="#0369a1" strokeWidth={3} />
            <text x={385} y={ySea + 15} fontSize={11} fontWeight={700} fill="#0369a1" {...hl}>
              {n(overBank)} m
            </text>
          </>
        )}
        <rect x={470} y={deck - 8} width={110} height={8} fill="#64748b" />
        <rect x={476} y={deck} width={6} height={y(-0.2) - deck} fill="#94a3b8" />
        <line x1={525} x2={525} y1={y(L.hat)} y2={deck} stroke="#7c3aed" strokeWidth={1.5} />
        <line x1={535} x2={535} y1={ySea} y2={deck} stroke="#0369a1" strokeWidth={2} strokeDasharray="3 2" />
        <text x={470} y={deck - 14} fontSize={9.5} fill="#334155" {...hl}>
          {u.levels.clearance}
        </text>
        <path d={`M640 ${y(6.8)} l-6 0 l3 -40 z`} fill="#7c2d12" />
        <line x1={660} x2={660} y1={y(L.mhws)} y2={y(6.8) - 40} stroke="#dc2626" strokeWidth={1.2} />
        <text x={W - 4} y={26} fontSize={9.5} fill="#7c2d12" textAnchor="end" {...hl}>
          {u.levels.elevation}
        </text>
        <line x1={656} x2={600} y1={y(6.8) - 42} y2={32} stroke="#7c2d12" strokeDasharray="2 3" />
        <defs>
          <marker id="lvA" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0 0 L10 5 L0 10 Z" fill="#0284c7" />
          </marker>
        </defs>
      </svg>
      <div className="mt-2">
        <Slider label={u.levels.hot} value={hot} min={0} max={5.6} step={0.1} onChange={setHot} show={`${n(hot)} m`} />
      </div>
      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          {u.levels.depthDeep}: <strong>{n(deep)} + {n(hot)} = {n(deep + hot)} m</strong>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          {u.levels.overBank}: <strong>{overBank > 0 ? `${n(hot)} − ${n(bank)} = ${n(overBank)} m` : u.levels.dries}</strong>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          {u.levels.bridge}: <strong>{`${bridge} + (${n(L.hat)} − ${n(hot)}) = ${n(bridgeClear)} m`}</strong>
        </div>
      </div>
      <ul className="mt-2 space-y-0.5 font-mono text-xs text-slate-600 dark:text-slate-300">
        {u.levels.formula.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </Frame>
  )
}

/* ---------------- Tide table, curves, secondary port ---------------- */

function TideTableWidget() {
  const { u, n, s } = useAlmanac()
  const std = s.tidal!.standard
  const t = std.table
  return (
    <Frame title={fill(u.table.title, { port: std.name, from: t[0].day, to: t[t.length - 1].day, month: u.months[s.month - 1] })}>
      <div className="rounded-lg border border-slate-300 bg-white p-2 dark:border-white/20 dark:bg-white/5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-1 text-xs dark:border-white/10">
          <strong>
            {std.name.toUpperCase()} · {fmtPos(std.pos)}
          </strong>
          <span>{u.table.note}</span>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {t.map((d) => {
            const hw = d.events.filter((e) => e.kind === 'HW').map((e) => e.h)
            const lw = d.events.filter((e) => e.kind === 'LW').map((e) => e.h)
            const range = r1(Math.max(...hw) - Math.min(...lw))
            const spring = d.day >= std.springsDay - 1
            return (
              <div key={d.day} className={`rounded-md border p-2 font-mono text-xs ${d.day === s.planDay ? 'border-amber-400 bg-amber-50 dark:bg-amber-400/10' : 'border-slate-200 dark:border-white/10'}`}>
                <div className="mb-1 flex items-center justify-between font-sans">
                  <span className={`text-sm font-bold ${spring ? 'text-rose-600' : ''}`}>
                    {d.day} <span className="text-xs font-semibold">{u.weekdays[d.weekday]}</span>
                  </span>
                  {d.day === std.fullMoonDay && <span title={u.table.fullMoon}>○</span>}
                </div>
                {d.events.map((e) => (
                  <div key={e.t} className="flex justify-between">
                    <span>{fmtHM(e.t)}</span>
                    <span className={e.kind === 'HW' ? 'font-bold' : ''}>{n(e.h)}</span>
                  </div>
                ))}
                <div className="mt-1 border-t border-dashed border-slate-200 pt-0.5 font-sans text-[11px] text-slate-500 dark:border-white/10">
                  {u.table.range} ≈ {n(range)} m
                </div>
              </div>
            )
          })}
          <div className="rounded-md border border-dashed border-slate-300 p-2 text-xs text-slate-600 dark:border-white/20 dark:text-slate-300">
            <div>
              <span className="font-bold text-rose-600">{u.table.springs}</span> · <span className="font-bold">{u.table.neaps}</span>
            </div>
            <div className="mt-1">○ {u.table.fullMoon}</div>
            <div className="mt-1">
              MHWS {n(std.levels.mhws)} · MHWN {n(std.levels.mhwn)}
              <br />
              MLWN {n(std.levels.mlwn)} · MLWS {n(std.levels.mlws)}
            </div>
            <div className="mt-1">
              Sp {n(std.springRange)} m · Np {n(std.neapRange)} m
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}

function CurveWidget({ which }: { which: 'std' | 'gate' }) {
  const { u, n, s } = useAlmanac()
  const both = useBoth()
  const [day, setDay] = useState(s.planDay)
  const [t, setT] = useState(Math.min(1435, s.planDepart + 150))
  const events: TideEvent[] = which === 'gate' ? gateEvents(s, day) : stdEvents(s, day)
  const port = which === 'gate' ? gatePortName(s) : s.tidal!.standard.name
  const w = which === 'gate' ? gateWindow(s, day) : null
  const W = 620
  const H = 230
  const top = Math.ceil(Math.max(...events.map((e) => e.h)) + 0.4)
  const step = top > 4 ? 1 : 0.5
  const pad = { l: 34, r: 10, t: 12, b: 26 }
  const x = (m: number) => pad.l + (m / 1440) * (W - pad.l - pad.r)
  const y = (h: number) => H - pad.b - (h / top) * (H - pad.t - pad.b)
  const pts = Array.from({ length: 145 }, (_, i) => i * 10).map((m) => `${x(m).toFixed(1)} ${y(heightAt(events, m)).toFixed(1)}`)
  const hNow = heightAt(events, t)
  const today = events.filter((e) => e.t >= 0 && e.t < 1440)
  const days = s.tidal!.standard.table.slice(1, -1).map((d) => d.day)
  return (
    <Frame title={fill(u.curve.title, { port })}>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">{u.curve.pickDay}</span>
        <Pills items={days} value={day} onChange={setDay} label={(d) => `${d} ${u.months[s.month - 1]}`} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-white dark:bg-white/90" role="img" aria-label={fill(u.curve.title, { port })}>
        {w && <rect x={x(w.open)} y={pad.t} width={x(w.close) - x(w.open)} height={H - pad.t - pad.b} fill="#bbf7d0" opacity={0.7} />}
        {Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step).map((h) => (
          <g key={h}>
            <line x1={pad.l} x2={W - pad.r} y1={y(h)} y2={y(h)} stroke="#e2e8f0" />
            <text x={pad.l - 4} y={y(h) + 3} fontSize={9} textAnchor="end" fill="#475569">
              {step < 1 ? n(h) : h}
            </text>
          </g>
        ))}
        {Array.from({ length: 9 }, (_, i) => i * 180).map((m) => (
          <text key={m} x={x(m)} y={H - 10} fontSize={9} textAnchor="middle" fill="#475569">
            {fmtHM(m)}
          </text>
        ))}
        <text x={W - pad.r} y={H - 1} fontSize={8} textAnchor="end" fill="#64748b">
          UT
        </text>
        <polyline points={pts.join(' ')} fill="none" stroke="#0284c7" strokeWidth={2.5} />
        {w && (
          <>
            <line x1={pad.l} x2={W - pad.r} y1={y(w.need)} y2={y(w.need)} stroke="#16a34a" strokeDasharray="6 4" strokeWidth={1.5} />
            <text x={W - pad.r - 4} y={y(w.need) - 4} fontSize={9} textAnchor="end" fill="#166534" fontWeight={700}>
              {fill(u.curve.need, { h: n(w.need) })}
            </text>
          </>
        )}
        {today.map((e) => (
          <g key={e.t}>
            <circle cx={x(e.t)} cy={y(e.h)} r={3.5} fill={e.kind === 'HW' ? '#dc2626' : '#2563eb'} />
            <text x={x(e.t)} y={e.kind === 'HW' ? y(e.h) - 7 : y(e.h) + 14} fontSize={9} textAnchor="middle" fontWeight={700} fill="#0f172a">
              {`${e.kind} ${fmtHM(e.t)} ${n(e.h)}`}
            </text>
          </g>
        ))}
        <line x1={x(t)} x2={x(t)} y1={pad.t} y2={H - pad.b} stroke="#f59e0b" strokeWidth={1.5} />
        <circle cx={x(t)} cy={y(hNow)} r={4} fill="#f59e0b" />
      </svg>
      <div className="mt-2">
        <Slider label={u.curve.pickTime} value={t} min={0} max={1435} step={5} onChange={setT} show={both(t)} />
      </div>
      <p className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-sm dark:bg-white/5">
        {fill(u.curve.at, { time: both(t), h: n(hNow) })}
        {w && (
          <>
            {' '}
            · <strong>{fill(u.curve.window, { open: both(w.open), close: both(w.close) })}</strong>
          </>
        )}
      </p>
    </Frame>
  )
}

function DiffBoxWidget() {
  const { u, n, s, st } = useAlmanac()
  const L = s.tidal!.standard.levels
  const sec = s.tidal!.secondary!
  const d = sec.hDiff
  const sd = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${n(Math.abs(v))}`
  return (
    <Frame title={fill(u.diff.title, { port: sec.name })}>
      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs dark:border-white/20 dark:bg-white/5">
        <div className="font-sans text-sm font-bold">
          {sec.name.toUpperCase()} · {fmtPos(sec.pos)}
        </div>
        <div className="font-sans text-xs text-slate-500">{fill(u.diff.stdPort, { port: s.tidal!.standard.name.toUpperCase() })}</div>
        <table className="mt-2 min-w-[30rem] text-center">
          <thead>
            <tr>
              <th colSpan={4}>{u.diff.times}</th>
              <th colSpan={4}>{u.diff.heights}</th>
            </tr>
            <tr className="text-slate-500">
              <th colSpan={2}>{u.diff.hw}</th>
              <th colSpan={2}>{u.diff.lw}</th>
              <th>MHWS</th>
              <th>MHWN</th>
              <th>MLWN</th>
              <th>MLWS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-2">{fmtHM(sec.hwTimes[0])}</td>
              <td className="px-2">{fmtHM(sec.hwTimes[1])}</td>
              <td className="px-2">{fmtHM(sec.lwTimes[0])}</td>
              <td className="px-2">{fmtHM(sec.lwTimes[1])}</td>
              <td rowSpan={2}>{n(L.mhws)}</td>
              <td rowSpan={2}>{n(L.mhwn)}</td>
              <td rowSpan={2}>{n(L.mlwn)}</td>
              <td rowSpan={2}>{n(L.mlws)}</td>
            </tr>
            <tr>
              <td>{fmtHM(sec.hwTimes[2])}</td>
              <td>{fmtHM(sec.hwTimes[3])}</td>
              <td>{fmtHM(sec.lwTimes[2])}</td>
              <td>{fmtHM(sec.lwTimes[3])}</td>
            </tr>
            <tr>
              <td colSpan={8} className="pt-1 text-left font-sans font-semibold">
                {fill(u.diff.differences, { port: sec.name.toUpperCase() })}
              </td>
            </tr>
            <tr className="font-bold text-fuchsia-700 dark:text-fuchsia-300">
              <td>{fmtDiff(sec.hwDiff[0])}</td>
              <td>{fmtDiff(sec.hwDiff[1])}</td>
              <td>{fmtDiff(sec.lwDiff[0])}</td>
              <td>{fmtDiff(sec.lwDiff[1])}</td>
              <td>{sd(d.mhws)}</td>
              <td>{sd(d.mhwn)}</td>
              <td>{sd(d.mlwn)}</td>
              <td>{sd(d.mlws)}</td>
            </tr>
          </tbody>
        </table>
        {st.gateNote && <div className="mt-2 font-sans text-xs text-slate-600 dark:text-slate-300">{st.gateNote}</div>}
      </div>
    </Frame>
  )
}

function SecondaryWidget() {
  const { u, n, s } = useAlmanac()
  const both = useBoth()
  const sec = s.tidal!.secondary!
  const [day, setDay] = useState(s.planDay)
  const evs = dayEvents(s, day)
  const [idx, setIdx] = useState(() => Math.max(0, evs.findIndex((e) => e.t === mainTide(s, s.planDay).hw.t)))
  const e = evs[Math.min(idx, evs.length - 1)]
  const g = secEvent(s, e)
  const times = e.kind === 'HW' ? sec.hwTimes : sec.lwTimes
  const diffs = e.kind === 'HW' ? sec.hwDiff : sec.lwDiff
  const tt = mod(e.t, 1440)
  let i0 = times.findIndex((a, i) => {
    const b = i + 1 < times.length ? times[i + 1] : times[0] + 1440
    const xx = tt < a ? tt + 1440 : tt
    return xx >= a && xx <= b
  })
  if (i0 < 0) i0 = 0
  const i1 = (i0 + 1) % times.length
  const span = mod(times[i1] - times[i0], 1440) || 1440
  const frac = mod(tt - times[i0], 1440) / span
  const L = s.tidal!.standard.levels
  const d = sec.hDiff
  const [lo, hi, dlo, dhi, nlo, nhi] = e.kind === 'HW' ? [L.mhwn, L.mhws, d.mhwn, d.mhws, 'MHWN', 'MHWS'] : [L.mlws, L.mlwn, d.mlws, d.mlwn, 'MLWS', 'MLWN']
  const hf = (e.h - lo) / (hi - lo)
  const sd = (v: number, digits = 1) => `${v < 0 ? '−' : '+'}${n(Math.abs(v), digits)}`
  const days = s.tidal!.standard.table.slice(1, -1).map((x) => x.day)
  return (
    <Frame title={fill(u.secondary.title, { port: sec.name })}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">{u.secondary.pickDay}</span>
        <Pills
          items={days}
          value={day}
          onChange={(v) => {
            setDay(v)
            setIdx(1)
          }}
          label={(v) => `${v} ${u.months[s.month - 1]}`}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">{u.secondary.pickEvent}</span>
        <Pills items={evs.map((_, i) => i)} value={Math.min(idx, evs.length - 1)} onChange={setIdx} label={(i) => `${evs[i].kind} ${fmtHM(evs[i].t)}`} />
      </div>
      <ol className="mt-3 space-y-2 text-sm">
        <li className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          <strong>1.</strong>{' '}
          {fill(u.secondary.stepTime, {
            std: s.tidal!.standard.name,
            kind: e.kind,
            t: fmtHM(e.t),
            a: fmtHM(times[i0]),
            da: fmtDiff(diffs[i0]),
            b: fmtHM(times[i1]),
            db: fmtDiff(diffs[i1]),
            f: n(frac, 2),
            d: fmtDiff(g.tDiff),
            raw: n(timeDifference(e.t, times, diffs)),
          })}
        </li>
        <li className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          <strong>2.</strong>{' '}
          {fill(u.secondary.stepHeight, { h: n(e.h), lo: `${nlo} ${n(lo)}`, dlo: sd(dlo), hi: `${nhi} ${n(hi)}`, dhi: sd(dhi), f: n(hf, 2), raw: sd(heightDifference(s, e.h, e.kind), 2), d: sd(g.hDiff) })}
        </li>
        <li className="rounded-lg border-2 border-emerald-400 bg-emerald-50 px-3 py-2 font-semibold dark:bg-emerald-500/10">{fill(u.secondary.result, { port: sec.name, kind: e.kind, t: both(g.t), h: n(g.h) })}</li>
      </ol>
    </Frame>
  )
}

/** HW/LW of the plan day at both ports, UT and local. */
export function DayTidesWidget() {
  const { u, n, s } = useAlmanac()
  const t = s.tidal!
  const std = stdEvents(s, s.planDay).filter((e) => e.t >= 0 && e.t < 1440)
  const sec = t.secondary ? secEvents(s, s.planDay).filter((e) => e.t >= 0 && e.t < 1440) : []
  const rows: ReactNode[][] = [
    [<strong key="a">{`${t.standard.name} (${u.ut})`}</strong>, ...std.map((e) => `${e.kind} ${fmtHM(e.t)} · ${n(e.h)}`)],
    [`${t.standard.name} (${u.local})`, ...std.map((e) => `${e.kind} ${fmtLocal(s, e.t)}`)],
  ]
  if (sec.length) {
    rows.push([<strong key="b">{`${t.secondary!.name} (${u.ut})`}</strong>, ...sec.map((e) => `${e.kind} ${fmtHM(e.t)} · ${n(e.h)}`)])
    rows.push([`${t.secondary!.name} (${u.local})`, ...sec.map((e) => `${e.kind} ${fmtLocal(s, e.t)}`)])
  }
  return (
    <Frame title={`${u.sc.tidesTable} · ${dateOf(s, u)}`}>
      <Table head={['', ...std.map((_, i) => String(i + 1))]} rows={rows} />
    </Frame>
  )
}

/* ---------------- Tidal streams ---------------- */

function AtlasWidget() {
  const { u, n, s } = useAlmanac()
  const both = useBoth()
  const [hour, setHour] = useState(-3)
  const main = mainTide(s, s.planDay)
  return (
    <Frame title={u.atlas.title}>
      <ScenarioChart showLegs={false} showDiamonds stream={{ hour, range: main.range }} />
      <div className="mt-2">
        <Slider label={fill(u.atlas.hour, { port: s.tidal!.standard.name })} value={hour} min={-6} max={6} step={1} onChange={setHour} show={hourLabel(hour)} />
      </div>
      <p className="mt-2 text-sm">{fill(u.atlas.clock, { date: dateOf(s, u), hour: hourLabel(hour), time: both(main.hw.t + hour * 60), range: n(main.range) })}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{u.atlas.note}</p>
    </Frame>
  )
}

function DiamondsWidget() {
  const { u, n, s } = useAlmanac()
  const [range, setRange] = useState(mainTide(s, s.planDay).range)
  const [hour, setHour] = useState(-3)
  const f = rangeFactor(s, range)
  const std = s.tidal!.standard
  return (
    <Frame title={fill(u.diamonds.title, { port: std.name })}>
      <div className={`grid gap-3 ${s.diamonds.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {s.diamonds.map((d) => (
          <div key={d.id} className="overflow-hidden rounded-lg border border-fuchsia-300 bg-white text-xs dark:bg-white/5">
            <div className="bg-fuchsia-50 px-2 py-1 font-semibold text-fuchsia-800 dark:bg-fuchsia-500/10 dark:text-fuchsia-200">
              ◇{d.id} {fmtPos(d)}
            </div>
            <table className="w-full text-center font-mono">
              <thead className="text-slate-500">
                <tr>
                  <th className="px-1 text-left font-sans">{u.diamonds.hour}</th>
                  <th>{u.diamonds.dir}</th>
                  <th>Sp</th>
                  <th>Np</th>
                  <th className="font-sans text-sky-700 dark:text-sky-300">{u.diamonds.today}</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((r, i) => {
                  const k = i - 6
                  return (
                    <tr key={k} onClick={() => setHour(k)} className={`cursor-pointer ${k === hour ? 'bg-sky-100 font-semibold dark:bg-sky-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                      <td className="px-1 text-left font-sans">{hourLabel(k)}</td>
                      <td>{fmtBrg(r.set)}</td>
                      <td>{n(r.sp)}</td>
                      <td>{n(r.np)}</td>
                      <td className="text-sky-700 dark:text-sky-300">{n(streamRate(s, r, range))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Slider label={u.diamonds.range} value={range} min={r1(std.neapRange * 0.7)} max={r1(std.springRange * 1.15)} step={0.1} onChange={setRange} show={`${n(range)} m`} />
      </div>
      {s.diamonds.map((d) => {
        const r = d.rows[hour + 6]
        return (
          <p key={d.id} className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-sm dark:bg-white/5">
            {fill(u.diamonds.calc, { d: d.id, hour: hourLabel(hour), dir: fmtBrg(r.set), sp: n(r.sp), np: n(r.np), range: n(range), f: n(f, 2), rate: n(streamRate(s, r, range)) })}
          </p>
        )
      })}
    </Frame>
  )
}

function StreamDayWidget() {
  const { u, n, s } = useAlmanac()
  const main = mainTide(s, s.planDay)
  const plan = planPassage(s, s.planDay, s.planDepart)
  const used = new Set(plan.legs.map((l) => l.hour))
  const key = s.keyDiamond ? diamondOf(s, s.keyDiamond) : null
  const rows = Array.from({ length: 13 }, (_, i) => i - 6).map((k) => {
    const t = main.hw.t + k * 60
    const cells: ReactNode[] = [hourLabel(k), <Mono key="b">{`${fmtHM(t - 30)}–${fmtHM(t + 30)}`}</Mono>, <Mono key="l">{`${fmtLocal(s, t - 30)}–${fmtLocal(s, t + 30)}`}</Mono>]
    for (const d of s.diamonds) cells.push(`${fmtBrg(d.rows[k + 6].set)} ${n(streamRate(s, d.rows[k + 6], main.range))} kn`)
    if (key) {
      const row = key.rows[k + 6]
      const rate = streamRate(s, row, main.range)
      cells.push(rate < 0.5 ? u.streamDay.slack : isFair(s, row) ? u.streamDay.fair : u.streamDay.foul)
    }
    return { k, cells }
  })
  const head: ReactNode[] = [u.streamDay.hour, `${u.streamDay.band} ${u.ut}`, `${u.streamDay.band} ${u.local}`, ...s.diamonds.map((d) => `◇${d.id}`)]
  if (key) head.push(`${u.streamDay.verdict} (◇${key.id})`)
  return (
    <Frame title={fill(u.streamDay.title, { date: dateOf(s, u), f: n(rangeFactor(s, main.range), 2) })}>
      <Table head={head} rows={rows.map((r) => r.cells)} highlight={(i) => used.has(rows[i].k)} compact />
    </Frame>
  )
}

function CurrentsWidget() {
  const { u, n, s } = useAlmanac()
  const plan = planPassage(s, s.planDay, s.planDepart)
  return (
    <Frame title={u.currents.title}>
      <Table
        compact
        head={[u.currents.leg, 'Track', u.currents.set, u.currents.rate, u.currents.effect]}
        rows={plan.legs.map((l) => {
          const c = Math.cos((l.set - l.track) * DEG)
          return [`${l.from}→${l.to}`, `${fmtBrg(l.track)}T`, `${fmtBrg(l.set)}`, `${n(l.rate)} kn`, c < -0.5 ? u.currents.head : c > 0.5 ? u.currents.behind : u.currents.cross]
        })}
      />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{u.currents.note}</p>
    </Frame>
  )
}

/* ---------------- Departure planner ---------------- */

function fairHours(s: Scenario, day: number): number[] {
  if (!s.keyDiamond || !s.tidal) return []
  const { range } = mainTide(s, day)
  const d = diamondOf(s, s.keyDiamond)
  return d.rows.map((r, i) => (isFair(s, r) && streamRate(s, r, range) >= 0.3 ? i - 6 : null)).filter((x): x is number => x !== null)
}

function Timeline({ plan }: { plan: PassagePlan }) {
  const { u, s } = useAlmanac()
  const t0 = Math.floor((s.departRange[0] - 90) / 60) * 60
  const t1 = t0 + 13 * 60
  const W = 620
  const x = (m: number) => 10 + ((Math.max(t0, Math.min(t1, m)) - t0) / (t1 - t0)) * (W - 20)
  const main = mainTide(s, plan.day)
  const fair = fairHours(s, plan.day)
  return (
    <svg viewBox={`0 0 ${W} 92`} className="w-full rounded-lg bg-white dark:bg-white/90" role="img" aria-label={u.departure.timeline}>
      {fair.map((k) => (
        <rect key={k} x={x(main.hw.t + k * 60 - 30)} y={8} width={x(main.hw.t + k * 60 + 30) - x(main.hw.t + k * 60 - 30)} height={16} fill="#bae6fd" />
      ))}
      {fair.length > 0 && (
        <text x={x(main.hw.t + fair[0] * 60 - 30) + 4} y={20} fontSize={9} fill="#075985">
          {u.departure.fairLbl}
        </text>
      )}
      {plan.window && (
        <>
          <rect x={x(plan.window.open)} y={28} width={x(plan.window.close) - x(plan.window.open)} height={16} fill="#bbf7d0" />
          <text x={x(plan.window.open) + 4} y={40} fontSize={9} fill="#166534">
            {u.departure.windowLbl}
          </text>
        </>
      )}
      <rect x={x(plan.castOff)} y={50} width={Math.max(2, x(plan.anchor) - x(plan.castOff))} height={14} rx={4} fill={plan.barOk && !plan.foul ? '#0ea5e9' : '#f97316'} />
      <text x={x(plan.castOff)} y={76} fontSize={9} fill="#0f172a">
        {u.departure.passageLbl}
      </text>
      {plan.window && <line x1={x(plan.barEta)} x2={x(plan.barEta)} y1={26} y2={66} stroke="#0f172a" strokeWidth={1.5} />}
      {Array.from({ length: 14 }, (_, i) => t0 + i * 60).map((m) => (
        <text key={m} x={x(m)} y={88} fontSize={8} textAnchor="middle" fill="#475569">
          {fmtHM(m).slice(0, 2)}
        </text>
      ))}
    </svg>
  )
}

function verdict(s: Scenario, p: PassagePlan): string {
  if (!p.barOk) return p.window && p.barEta < p.window.open ? '⏳' : '⛔'
  return p.foul ? '⚠️' : '✅'
}

function DepartureWidget() {
  const { u, n, s } = useAlmanac()
  const both = useBoth()
  const [dep, setDep] = useState(s.planDepart)
  const plan = useMemo(() => planPassage(s, s.planDay, dep), [s, dep])
  const atDepart = s.tidal?.gate?.at === 'depart'
  const early = !!plan.window && plan.barEta < plan.window.open
  const tss = plan.legs.find((l) => l.fixed)
  const options: number[] = []
  for (let o = s.departRange[0]; o <= s.departRange[1]; o += 30) options.push(o)
  const msg = atDepart ? (plan.barOk ? u.departure.sillOk : early ? u.departure.sillEarly : u.departure.sillLate) : plan.barOk ? u.departure.ok : early ? u.departure.early : u.departure.late
  return (
    <Frame title={fill(u.departure.title, { date: dateOf(s, u) })}>
      <Slider label={u.departure.depart} value={dep} min={s.departRange[0]} max={s.departRange[1]} step={15} onChange={setDep} show={both(dep)} />
      <div className="mt-2">
        <Timeline plan={plan} />
      </div>
      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          {u.departure.castOff}: <strong>{both(plan.castOff)}</strong>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          {atDepart ? u.departure.sill : u.departure.bar}: <strong>{both(plan.barEta)}</strong> · {plan.barHeight !== null && `${n(plan.barHeight)} m`}
        </div>
        <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          {u.departure.total}: <strong>{totalMinutes(plan)} {u.minutes}</strong>
          {tss?.setNm !== undefined && (
            <>
              {' '}
              · {u.departure.setLane} <strong>{n(Math.abs(tss.setNm))} M</strong>
            </>
          )}
        </div>
      </div>
      <div className="mt-2">
        <Table
          compact
          head={[u.departure.leg, u.departure.stream, u.departure.cts, u.departure.sog, u.departure.arrive]}
          rows={plan.legs.map((l) => [
            `${l.from}→${l.to}`,
            `${l.hour === null ? '' : `${hourLabel(l.hour)} ◇${l.diamond} `}${fmtBrg(l.set)} ${n(l.rate)} kn`,
            `${fmtBrg(l.cts)}T / ${fmtBrg(l.ctsM)}M${l.fixed ? ' (TSS)' : ''}`,
            `${n(l.sog)} kn · ${l.minutes} ${u.minutes}`,
            both(l.end),
          ])}
        />
      </div>
      <div className={`mt-2 rounded-lg border px-3 py-2 text-sm ${plan.barOk && !plan.foul ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10' : 'border-rose-300 bg-rose-50 dark:bg-rose-500/10'}`}>
        {msg} {plan.foul ? u.departure.foulWarn : u.departure.fairNote}
      </div>
      <h4 className="mt-4 text-sm font-semibold">{u.departure.options}</h4>
      <Table
        compact
        head={[u.departure.depart, u.departure.castOff, atDepart ? u.departure.sill : u.departure.bar, u.height, ...(tss ? [u.departure.setLane] : []), u.departure.total, u.departure.verdict]}
        highlight={(i) => options[i] === s.planDepart}
        rows={options.map((o) => {
          const p = planPassage(s, s.planDay, o)
          const lane = p.legs.find((l) => l.fixed)
          return [both(o), fmtLocal(s, p.castOff), fmtLocal(s, p.barEta), p.barHeight === null ? '' : `${n(p.barHeight)} m`, ...(lane ? [`${n(lane.setNm ?? 0)} M`] : []), `${totalMinutes(p)} ${u.minutes}`, verdict(s, p)]
        })}
      />
    </Frame>
  )
}

/* ---------------- Overview, legs, CTS ---------------- */

function OverviewWidget() {
  const { u, n, s, st } = useAlmanac()
  const both = useBoth()
  const p = planPassage(s, s.planDay, s.planDepart)
  const vars = usePlanVars(p)
  const rows: [string, string][] = [[u.overview.date, `${dateOf(s, u)} · ${s.boat.name} · ${n(s.boat.draft)} m · ${n(s.boat.speed)} kn`.replace(/^ · /, '')]]
  if (s.tidal) {
    const m = mainTide(s, s.planDay)
    rows.push([fill(u.overview.std, { port: s.tidal.standard.name }), `HW ${both(m.hw.t)} ${n(m.hw.h)} m · LW ${fmtHM(m.lw.t)} ${n(m.lw.h)} m · ${n(m.range)} m`])
    if (s.tidal.secondary) {
      const g = secEvents(s, s.planDay).find((e) => e.std.t === m.hw.t)!
      rows.push([fill(u.overview.sec, { port: s.tidal.secondary.name }), `HW ${both(g.t)} ${n(g.h)} m`])
    }
    if (p.window) rows.push([u.overview.gate, `${s.names.gate} ≥ ${n(p.need!)} m · ${both(p.window.open)} → ${both(p.window.close)}`])
    const fair = fairHours(s, s.planDay)
    if (fair.length) rows.push([u.overview.fair, `${hourLabel(fair[0])} → ${hourLabel(fair[fair.length - 1])} (${fmtLocal(s, m.hw.t + fair[0] * 60 - 30)}–${fmtLocal(s, m.hw.t + fair[fair.length - 1] * 60 + 30)} ${u.local})`])
  } else {
    const max = p.legs.reduce((a, l) => (l.rate > a.rate ? l : a), p.legs[0])
    rows.push([u.overview.current, `${fmtBrg(max.set)} ${n(max.rate)} kn (${max.from}→${max.to})`])
  }
  rows.push([u.overview.castOff, both(p.castOff)])
  if (p.window) rows.push([u.overview.gateAt, `${both(p.barEta)} · ${n(p.barHeight!)} m`])
  rows.push([u.overview.arrive, both(p.anchor)])
  return (
    <Frame title={fill(u.overview.title, { date: dateOf(s, u) }).replace(' ()', '')}>
      <Table head={['', '']} rows={rows.map(([k, v]) => [<strong key="k">{k}</strong>, v])} />
      <p className="mt-3 rounded-lg border-l-4 border-sky-500 bg-white px-3 py-2 text-sm dark:bg-white/5">{fill(st.overview, vars)}</p>
    </Frame>
  )
}

function LegsWidget() {
  const { u, n, s, st } = useAlmanac()
  const p = planPassage(s, s.planDay, s.planDepart)
  const vars = usePlanVars(p)
  return (
    <Frame title={u.legs.title}>
      <h4 className="text-sm font-semibold">{u.legs.wpts}</h4>
      <Table compact head={[u.legs.wpt, u.legs.pos, u.legs.note]} rows={s.waypoints.map((w, i) => [<strong key="w">{w.id}</strong>, <Mono key="p">{fmtPos(w)}</Mono>, fill(st.wptNotes[i] ?? '', vars)])} />
      <h4 className="mt-4 text-sm font-semibold">{u.legs.legTable}</h4>
      <Table
        compact
        head={[u.legs.leg, u.legs.trueT, u.legs.magM, u.legs.dist, u.legs.work]}
        rows={p.legs.map((l) => {
          if (l.fixed) return [<strong key="l">{`${l.from} → ${l.to}`}</strong>, '—', '—', '—', fill(u.legs.fixed, { h: fmtBrg(l.cts) })]
          const g = legGeometry(l.a, l.b)
          return [
            <strong key="l">{`${l.from} → ${l.to}`}</strong>,
            `${fmtBrg(l.track)}T`,
            `${fmtBrg(toMagnetic(s, l.track))}M`,
            `${n(l.nm)} M`,
            <Mono key="w">{`d.lat ${n(Math.abs(g.dlat))}′${g.dlat < 0 ? 'S' : 'N'} · d.long ${n(Math.abs(g.dlong))}′${g.dlong > 0 ? 'E' : 'W'} × cos ${Math.round(s.latRef)}° = ${n(Math.abs(g.dep))}M · √(${n(Math.abs(g.dlat))}² + ${n(Math.abs(g.dep))}²)`}</Mono>,
          ]
        })}
      />
    </Frame>
  )
}

function CtsWidget() {
  const { u, n, s } = useAlmanac()
  const p = planPassage(s, s.planDay, s.planDepart)
  const presets = p.legs.filter((l) => !l.fixed).map((l) => ({ label: `${l.from}→${l.to}`, track: l.track, set: l.set, rate: l.rate }))
  const big = presets.reduce((a, x, i) => (Math.abs(Math.sin((x.set - x.track) * DEG) * x.rate) > Math.abs(Math.sin((presets[a].set - presets[a].track) * DEG) * presets[a].rate) ? i : a), 0)
  const first = s.tidal ? 0 : big
  const [sel, setSel] = useState(first)
  const [track, setTrack] = useState(presets[first].track)
  const [set, setSet] = useState(presets[first].set)
  const [rate, setRate] = useState(presets[first].rate)
  const [speed, setSpeed] = useState(s.boat.speed)
  const pick = (i: number) => {
    setSel(i)
    if (i < presets.length) {
      setTrack(presets[i].track)
      setSet(presets[i].set)
      setRate(presets[i].rate)
      setSpeed(s.boat.speed)
    }
  }
  const c = courseToSteer(track, set, rate, speed)
  const v = (deg: number, len: number) => ({ x: Math.sin(deg * DEG) * len, y: Math.cos(deg * DEG) * len })
  const S = { x: 0, y: 0 }
  const E = v(set, rate)
  const C = c ? v(track, c.sog) : v(track, speed)
  const far = v(track, Math.max(speed + rate + 1, 7))
  const all = [S, E, C, far]
  const minX = Math.min(...all.map((q) => q.x)) - 1.2
  const maxX = Math.max(...all.map((q) => q.x)) + 1.2
  const minY = Math.min(...all.map((q) => q.y)) - 1.2
  const maxY = Math.max(...all.map((q) => q.y)) + 1.2
  const sc = 44
  const X = (q: { x: number }) => (q.x - minX) * sc
  const Y = (q: { y: number }) => (maxY - q.y) * sc
  const W = (maxX - minX) * sc
  const H = (maxY - minY) * sc
  const sp = { x: X(S), y: Y(S) }
  const ep = { x: X(E), y: Y(E) }
  const cp = { x: X(C), y: Y(C) }
  const len = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(b.x - a.x, b.y - a.y)
  return (
    <Frame title={u.cts.title}>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">{u.cts.leg}</span>
        <Pills items={[...presets.map((_, i) => i), presets.length]} value={sel} onChange={pick} label={(i) => (i < presets.length ? presets[i].label : u.cts.custom)} />
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_16rem]">
        <svg viewBox={`0 0 ${W} ${H}`} className="max-h-[26rem] w-full rounded-lg bg-[#f4f9fc]" role="img" aria-label={u.cts.title}>
          <line x1={sp.x} y1={sp.y} x2={X(far)} y2={Y(far)} stroke="#86198f" strokeWidth={1.5} strokeDasharray="6 4" />
          <Arrow from={sp} toDeg={track} len={len(sp, cp)} color="#86198f" width={2.5} heads={2} />
          <Arrow from={sp} toDeg={set} len={len(sp, ep)} color="#0284c7" width={2.5} heads={3} />
          {c && <Arrow from={ep} toDeg={c.heading} len={len(ep, cp)} color="#0f172a" width={2.5} heads={1} />}
          <circle cx={ep.x} cy={ep.y} r={speed * sc} fill="none" stroke="#94a3b8" strokeDasharray="3 4" />
          <circle cx={sp.x} cy={sp.y} r={4} fill="#86198f" />
          <circle cx={cp.x} cy={cp.y} r={4} fill="#0f172a" />
          <text x={sp.x + 6} y={sp.y - 6} fontSize={11} fontWeight={700} fill="#86198f" {...halo}>
            {presets[sel]?.label.split('→')[0] ?? 'A'}
          </text>
          <text x={(sp.x + ep.x) / 2 + 6} y={(sp.y + ep.y) / 2 + 12} fontSize={10} fill="#0369a1" fontWeight={700} {...halo}>
            {`${u.cts.streamVec} ${fmtBrg(set)} ${n(rate)}`}
          </text>
          {c && (
            <text x={(ep.x + cp.x) / 2 + 8} y={(ep.y + cp.y) / 2} fontSize={10} fill="#0f172a" fontWeight={700} {...halo}>
              {`${u.cts.waterTrack} ${fmtBrg(c.heading)}T · ${n(speed)} M`}
            </text>
          )}
          <text x={(sp.x + cp.x) / 2 - 8} y={(sp.y + cp.y) / 2 - 8} fontSize={10} fill="#86198f" fontWeight={700} textAnchor="end" {...halo}>
            {`${u.cts.groundTrack} ${fmtBrg(track)}T`}
          </text>
          <text x={W - 16} y={18} fontSize={12} fontWeight={700} fill="#334155">
            N↑
          </text>
        </svg>
        <div className="space-y-2">
          <Slider label={u.cts.track} value={track} min={0} max={359} step={1} onChange={(x) => (setTrack(x), setSel(presets.length))} show={`${fmtBrg(track)}T`} />
          <Slider label={u.cts.set} value={set} min={0} max={359} step={1} onChange={(x) => (setSet(x), setSel(presets.length))} show={`${fmtBrg(set)}T`} />
          <Slider label={u.cts.rate} value={rate} min={0} max={5} step={0.1} onChange={(x) => (setRate(x), setSel(presets.length))} show={`${n(rate)} kn`} />
          <Slider label={u.cts.speed} value={speed} min={2} max={8} step={0.5} onChange={(x) => (setSpeed(x), setSel(presets.length))} show={`${n(speed)} kn`} />
          <div className="rounded-lg border-2 border-slate-800 bg-white px-3 py-2 text-sm dark:border-sky-300 dark:bg-white/5">
            {c ? fill(u.cts.result, { t: fmtBrg(c.heading), m: fmtBrg(toMagnetic(s, c.heading)), sog: n(c.sog), off: n(Math.abs(c.offset), 0), side: c.offset >= 0 ? u.cts.right : u.cts.left }) : u.cts.tooStrong}
          </div>
        </div>
      </div>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
        {u.cts.steps.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ol>
    </Frame>
  )
}

/* ---------------- Plan sheet ---------------- */

function SheetWidget() {
  const { u, n, s, st } = useAlmanac()
  const both = useBoth()
  const p = planPassage(s, s.planDay, s.planDepart)
  const vars = usePlanVars(p)
  const ev = u.sheet.ev
  const events: [number, string][] = [
    [p.castOff, fill(ev.castOff, { place: s.names.start })],
    [p.depart, fill(ev.depart, { wpt: s.waypoints[0].id })],
    ...p.legs.map((l): [number, string] => [l.end, l.to === 'TSS' ? ev.tss : fill(ev.wpt, { wpt: l.to })]),
  ]
  if (p.barHeight !== null) events.push([p.barEta, fill(ev.gate, { gate: s.names.gate ?? '', h: n(p.barHeight) })])
  events.push([p.anchor, fill(ev.arrive, { place: s.names.end })])
  events.sort((a, b) => a[0] - b[0])
  const row = s.tidal?.standard.table.find((d) => d.day === s.planDay)
  const off = s.offset / 60
  return (
    <Frame title={fill(u.sheet.title, { from: s.names.start, to: s.names.end })}>
      <div className="mb-2 flex justify-end">
        <button type="button" className="btn-secondary text-xs" onClick={() => window.print()}>
          🖨️ {u.sheet.print}
        </button>
      </div>
      <div className="space-y-4 rounded-lg border-2 border-navy-900 bg-white p-4 text-sm dark:border-sky-300 dark:bg-navy-900/60">
        <div className="grid gap-1 sm:grid-cols-2">
          {u.sheet.header.map((h, i) => (
            <div key={h}>
              <span className="text-slate-500">{h}:</span>{' '}
              <strong>
                {
                  [
                    row ? `${u.weekdays[row.weekday]} ${dateOf(s, u)}` : '—',
                    `${s.boat.name} · ${n(s.boat.length)} m · ${n(s.boat.draft)} m · ${n(s.boat.speed)} kn`,
                    `${s.names.start} → ${s.names.end}`,
                    `${n(totalNm(p))} M`,
                    `${u.ut} + ${off} = ${u.local}`,
                    fmtVariation(s),
                  ][i]
                }
              </strong>
            </div>
          ))}
        </div>
        {s.tidal && (
          <div>
            <h4 className="font-semibold">{u.sheet.tides}</h4>
            <Table
              compact
              head={['', ...stdEvents(s, s.planDay).filter((e) => e.t >= 0 && e.t < 1440).map((e) => e.kind)]}
              rows={[
                [s.tidal.standard.name, ...stdEvents(s, s.planDay).filter((e) => e.t >= 0 && e.t < 1440).map((e) => `${fmtLocal(s, e.t)} · ${n(e.h)}`)],
                ...(s.tidal.secondary ? [[s.tidal.secondary.name, ...secEvents(s, s.planDay).filter((e) => e.std.t >= 0 && e.std.t < 1440).map((e) => `${fmtLocal(s, e.t)} · ${n(e.h)}`)]] : []),
              ]}
            />
            {p.window && <p className="mt-1 text-xs text-slate-500">{fill(u.sheet.summary, { range: n(p.range!), f: n(p.factor!, 2), need: n(p.need!), open: fmtLocal(s, p.window.open), close: fmtLocal(s, p.window.close) })}</p>}
          </div>
        )}
        <div>
          <h4 className="font-semibold">{u.sheet.timeline}</h4>
          <Table compact head={[u.local, ...(s.tidal ? [u.ut] : []), '']} rows={events.map(([t, label]) => [<strong key="l">{fmtLocal(s, t)}</strong>, ...(s.tidal ? [fmtHM(t)] : []), label])} />
        </div>
        <div>
          <h4 className="font-semibold">{u.sheet.legsH}</h4>
          <Table
            compact
            head={[u.legs.leg, u.legs.trueT, u.legs.dist, u.departure.stream, u.departure.cts, u.departure.sog, u.departure.arrive]}
            rows={p.legs.map((l) => [
              `${l.from}→${l.to}`,
              `${fmtBrg(l.track)}T`,
              `${n(l.nm)} M`,
              `${l.hour === null ? '' : `${hourLabel(l.hour)} ◇${l.diamond} `}${fmtBrg(l.set)} ${n(l.rate)}`,
              <strong key="c">{`${fmtBrg(l.ctsM)}M${l.fixed ? ' TSS' : ''}`}</strong>,
              `${n(l.sog)} kn`,
              fmtLocal(s, l.end),
            ])}
          />
        </div>
        <div>
          <h4 className="font-semibold">{u.sheet.notesH}</h4>
          <ul className="list-disc space-y-0.5 pl-5">
            {st.notes.map((x) => (
              <li key={x}>{fill(x, vars)}</li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Practice ---------------- */

type Answer = { key: keyof AlmanacText['ui']['practice']['q']; params: Record<string, string | number>; kind: 'time' | 'num'; value: number; tol: number }

export function practiceAnswers(s: Scenario, ex: Scenario['practice'][number]): Answer[] {
  const p = planPassage(s, ex.day, ex.depart, ex.scale ?? 1)
  const out: Answer[] = []
  if (s.tidal) {
    const main = mainTide(s, ex.day)
    out.push({ key: 'stdHw', params: { port: s.tidal.standard.name }, kind: 'time', value: main.hw.t, tol: 0 })
    out.push({ key: 'range', params: { port: s.tidal.standard.name }, kind: 'num', value: main.range, tol: 0.05 })
    if (s.tidal.secondary) {
      const g = secEvents(s, ex.day).find((e) => e.std.t === main.hw.t)!
      out.push({ key: 'secHw', params: { port: s.tidal.secondary.name }, kind: 'time', value: g.t, tol: 3 })
      out.push({ key: 'secH', params: { port: s.tidal.secondary.name }, kind: 'num', value: g.h, tol: 0.1 })
    }
    const w = gateWindow(s, ex.day, p.barEta)
    if (w) out.push({ key: 'gate', params: { gate: s.names.gate ?? '', need: num(w.need, 'en') }, kind: 'time', value: w.open, tol: 10 })
  }
  p.legs.forEach((l, i) => {
    if (l.fixed) {
      out.push({ key: 'set', params: {}, kind: 'num', value: Math.abs(l.setNm ?? 0), tol: 0.3 })
      return
    }
    if (s.tidal) out.push({ key: 'rate', params: { n: i + 1 }, kind: 'num', value: l.rate, tol: 0.1 })
    out.push({ key: 'cts', params: { n: i + 1 }, kind: 'num', value: l.ctsM, tol: 2 })
    if (!s.tidal) out.push({ key: 'sog', params: { n: i + 1 }, kind: 'num', value: l.sog, tol: 0.2 })
  })
  out.push({ key: 'eta', params: { place: s.names.end, tz: s.tidal ? 'UT' : 'local' }, kind: 'time', value: s.tidal ? p.anchor : p.anchor + s.offset, tol: 8 })
  return out
}

export function parseAnswer(raw: string, kind: 'time' | 'num'): number | null {
  const x = raw.trim().replace(',', '.')
  if (!x) return null
  if (kind === 'time') {
    const m = x.replace(':', '').match(/^(\d{1,2})(\d{2})$/)
    return m ? Number(m[1]) * 60 + Number(m[2]) : null
  }
  const v = Number(x.replace('°', ''))
  return Number.isFinite(v) ? v : null
}

function PracticeWidget() {
  const { u, n, s, st } = useAlmanac()
  const both = useBoth()
  const [pi, setPi] = useState(0)
  const ex = s.practice[pi]
  const ans = practiceAnswers(s, ex)
  const [vals, setVals] = useState<string[]>(() => ans.map(() => ''))
  const [checked, setChecked] = useState(false)
  const [reveal, setReveal] = useState(false)
  const show = (a: Answer) => (a.kind === 'time' ? fmtHM(a.value) : a.tol >= 1 ? String(a.value) : n(a.value))
  const ok = ans.map((a, i) => {
    const v = parseAnswer(vals[i] ?? '', a.kind)
    return v !== null && (a.kind === 'time' ? Math.abs(mod(v - a.value + 720, 1440) - 720) : Math.abs(v - a.value)) <= a.tol + 1e-9
  })
  const label = (i: number) => (s.tidal ? `${s.practice[i].day} ${u.months[s.month - 1]}` : (st.practiceLabels?.[i] ?? String(i + 1)))
  const pick = (i: number) => {
    setPi(i)
    setVals(practiceAnswers(s, s.practice[i]).map(() => ''))
    setChecked(false)
    setReveal(false)
  }
  const tzLabel = (a: Answer) => (a.key === 'eta' ? { ...a.params, tz: s.tidal ? u.ut : u.local } : a.params)
  return (
    <Frame title={u.practice.title}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">{u.practice.pickDay}</span>
        <Pills items={s.practice.map((_, i) => i)} value={pi} onChange={pick} label={label} />
      </div>
      <p className="mt-2 text-sm">
        {s.tidal ? fill(u.practice.intro, { day: ex.day, month: u.months[s.month - 1], depart: both(ex.depart) }) : fill(u.practice.introCurrent, { label: label(pi), depart: both(ex.depart) })}
      </p>
      <ol className="mt-3 space-y-2">
        {ans.map((a, i) => (
          <li key={`${pi}-${i}`} className="grid items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_8rem_auto] dark:bg-white/5">
            <span>
              {i + 1}. {fill(u.practice.q[a.key], tzLabel(a))}
            </span>
            <input
              value={vals[i] ?? ''}
              onChange={(e) => setVals(ans.map((_, j) => (j === i ? e.target.value : (vals[j] ?? ''))))}
              inputMode="decimal"
              className="rounded-md border border-slate-300 bg-white px-2 py-1 font-mono dark:border-white/20 dark:bg-white/5"
            />
            <span className="min-w-[6rem] text-xs">
              {checked && (ok[i] ? '✅' : '❌')}
              {reveal && (
                <span className="ml-1 font-mono text-slate-600 dark:text-slate-300">
                  {u.practice.answer} {show(a)}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className="btn-primary" onClick={() => setChecked(true)}>
          {u.practice.check}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setReveal(true)}>
          {u.practice.reveal}
        </button>
        {checked && <span className="text-sm font-semibold">{fill(u.practice.score, { score: ok.filter(Boolean).length, max: ans.length })}</span>}
      </div>
    </Frame>
  )
}

/* ---------------- Scenario cards ---------------- */

export function ScenarioCards() {
  const { u, lang } = useAlmanac()
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {EXTRA_SCENARIOS.map((x) => {
        const t = scenarioTexts[x.id][lang]
        return (
          <Link
            key={x.id}
            to={`/rya/learn/passage-planning/${x.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-navy-900/60"
          >
            <div className="text-3xl" aria-hidden>
              {x.icon}
            </div>
            <h4 className="mt-2 font-semibold">{t.title}</h4>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t.summary}</p>
            <div className="mt-3 text-sm font-medium text-sea-500">{u.sc.open} →</div>
          </Link>
        )
      })}
    </div>
  )
}

export function AlmanacWidget({ id }: { id: AWidget }) {
  switch (id) {
    case 'chart':
      return <ChartWidget />
    case 'levels':
      return <LevelsWidget />
    case 'tideTable':
      return <TideTableWidget />
    case 'curveStd':
      return <CurveWidget which="std" />
    case 'curveGate':
      return <CurveWidget which="gate" />
    case 'diffBox':
      return <DiffBoxWidget />
    case 'secondary':
      return <SecondaryWidget />
    case 'atlas':
      return <AtlasWidget />
    case 'diamonds':
      return <DiamondsWidget />
    case 'streamDay':
      return <StreamDayWidget />
    case 'currents':
      return <CurrentsWidget />
    case 'departure':
      return <DepartureWidget />
    case 'overview':
      return <OverviewWidget />
    case 'legs':
      return <LegsWidget />
    case 'cts':
      return <CtsWidget />
    case 'sheet':
      return <SheetWidget />
    case 'practice':
      return <PracticeWidget />
    case 'scenarios':
      return <ScenarioCards />
  }
}
