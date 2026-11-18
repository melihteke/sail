import { useMemo, useState, type ReactNode } from 'react'
import { useI18n, type Lang } from '../../../i18n'
import { Frame } from '../lessons/frame'
import {
  barWindow,
  courseToSteer,
  dayEvents,
  fmtBrg,
  fmtDiff,
  fmtHM,
  fmtLocal,
  fmtPos,
  gannetEvent,
  gannetEvents,
  halyardEvents,
  heightAt,
  heightDifference,
  hourLabel,
  legGeometry,
  legs,
  mainTide,
  mod,
  planPassage,
  PLAN_DEPART,
  r1,
  rangeFactor,
  streamRate,
  timeDifference,
  toMagnetic,
  type PassagePlan,
} from './calc'
import {
  ANCHORAGE,
  ANVIL_ROCK,
  BAR,
  BOAT,
  CHART_BOUNDS as B,
  COAST,
  DIAMONDS,
  FAIRWAY_BUOY,
  FULL_MOON_DAY,
  GANNET,
  HALYARD,
  HALYARD_TABLE,
  KESTREL_HEAD,
  PLAN_DAY,
  RACE,
  SOUNDINGS,
  SPRINGS_DAY,
  VARIATION_W,
  WAYPOINTS,
  type LatLon,
  type TideEvent,
} from './data'
import { almanacTexts, fill, num, type AlmanacText, type AWidget } from './text'

const DEG = Math.PI / 180

function useAlmanac(): { a: AlmanacText; u: AlmanacText['ui']; lang: Lang; n: (v: number, d?: number) => string } {
  const { lang } = useI18n()
  const a = almanacTexts[lang]
  return { a, u: a.ui, lang, n: (v, d = 1) => num(v, lang, d) }
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
const both = (ut: number, u: AlmanacText['ui']) => `${fmtHM(ut)} ${u.ut} · ${fmtLocal(ut)} ${u.local}`

/* ---------------- Chart ---------------- */

const K = 34
const COS = Math.cos(47.17 * DEG)
const CW = (B.lonMax - B.lonMin) * COS * K
const CH = (B.latMax - B.latMin) * K
const px = (p: LatLon) => ({ x: (p.lon - B.lonMin) * COS * K, y: (B.latMax - p.lat) * K })
const P = (latMin: number, lonMin: number): LatLon => ({ lat: 47 * 60 + latMin, lon: -(12 * 60 + lonMin) })

const ATLAS_POINTS: { p: LatLon; d: 'A' | 'B'; m: number }[] = [
  { p: P(15.5, 20.5), d: 'A', m: 0.5 },
  { p: P(14.0, 24.5), d: 'A', m: 0.6 },
  { p: P(13.0, 21.5), d: 'A', m: 0.9 },
  { p: P(13.0, 19.0), d: 'A', m: 0.8 },
  { p: P(11.0, 22.5), d: 'A', m: 1.0 },
  { p: P(10.0, 19.0), d: 'A', m: 1.0 },
  { p: P(8.0, 21.0), d: 'A', m: 0.9 },
  { p: P(5.0, 23.0), d: 'A', m: 0.8 },
  { p: P(3.0, 18.5), d: 'A', m: 0.8 },
  { p: P(8.2, 15.6), d: 'B', m: 1.2 },
  { p: P(6.5, 14.0), d: 'B', m: 1.1 },
  { p: P(4.6, 13.2), d: 'B', m: 1.0 },
  { p: P(2.6, 14.5), d: 'B', m: 0.9 },
  { p: P(6.4, 10.8), d: 'B', m: 0.9 },
  { p: P(4.4, 9.4), d: 'B', m: 0.7 },
  { p: P(2.6, 9.8), d: 'B', m: 0.8 },
  { p: P(2.0, 7.6), d: 'B', m: 0.6 },
]

function Arrow({ from, toDeg, len, color, width = 2, heads = 1 }: { from: { x: number; y: number }; toDeg: number; len: number; color: string; width?: number; heads?: number }) {
  const ux = Math.sin(toDeg * DEG)
  const uy = -Math.cos(toDeg * DEG)
  const tip = { x: from.x + ux * len, y: from.y + uy * len }
  const head = (f: number) => {
    const c = { x: from.x + ux * len * f, y: from.y + uy * len * f }
    const s = 6 + width
    return `M${c.x - ux * s - uy * s * 0.55} ${c.y - uy * s + ux * s * 0.55} L${c.x} ${c.y} L${c.x - ux * s + uy * s * 0.55} ${c.y - uy * s - ux * s * 0.55}`
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

export function SaltmereChart({ showLegs = true, showDiamonds = true, stream, className = '' }: { showLegs?: boolean; showDiamonds?: boolean; stream?: { hour: number; range: number }; className?: string }) {
  const { u, n } = useAlmanac()
  const coast = COAST.map(px)
  const path = `M${coast.map((c) => `${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' L')} Z`
  const latTicks = Array.from({ length: B.latMax - B.latMin + 1 }, (_, i) => B.latMin + i)
  const lonTicks = Array.from({ length: (B.lonMax - B.lonMin) / 2 + 1 }, (_, i) => B.lonMin + i * 2)
  const wp = WAYPOINTS.map((w) => ({ ...w, ...px(w) }))
  const lg = legs()
  const kh = px(KESTREL_HEAD)
  const fb = px(FAIRWAY_BUOY)
  const bar = px(BAR)
  const anv = px(ANVIL_ROCK)
  const race = px(RACE)
  const halyard = px(HALYARD.pos)
  const gannet = px(GANNET.pos)
  const anch = px(ANCHORAGE)
  const rose = { x: CW - 78, y: CH - 92 }
  return (
    <svg viewBox={`-34 -6 ${CW + 40} ${CH + 30}`} className={`w-full rounded-lg bg-[#eef6fb] ${className}`} role="img" aria-label={u.chart.title}>
      <rect x={0} y={0} width={CW} height={CH} fill="#f4f9fc" stroke="#94a3b8" />
      {latTicks.map((m) => {
        const y = (B.latMax - m) * K
        return (
          <g key={m}>
            {m % 2 === 1 && <line x1={0} x2={CW} y1={y} y2={y} stroke="#cbd5e1" strokeWidth={0.6} />}
            <line x1={-6} x2={0} y1={y} y2={y} stroke="#475569" />
            {m % 2 === 1 && (
              <text x={-8} y={y + 3} fontSize={9} textAnchor="end" fill="#334155">
                {`${String(m % 60).padStart(2, '0')}′`}
              </text>
            )}
          </g>
        )
      })}
      {lonTicks.map((m) => {
        const x = (m - B.lonMin) * COS * K
        return (
          <g key={m}>
            <line x1={x} x2={x} y1={0} y2={CH} stroke="#cbd5e1" strokeWidth={0.6} />
            <text x={x} y={CH + 12} fontSize={9} textAnchor="middle" fill="#334155">
              {`${String(Math.abs(m) % 60).padStart(2, '0')}′`}
            </text>
          </g>
        )
      })}
      <text x={-30} y={CH + 22} fontSize={8} fill="#475569">
        47°N · 012°W
      </text>
      <path d={path} fill="none" stroke="#bfdcf0" strokeWidth={26} strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#a7e3c0" strokeWidth={7} strokeLinejoin="round" />
      <path d={path} fill="#efe0b0" stroke="#8a7440" strokeWidth={1.2} strokeLinejoin="round" />
      <ellipse cx={bar.x} cy={bar.y} rx={14} ry={5} fill="#a7e3c0" stroke="#3f8f5f" strokeWidth={0.8} />
      <text x={bar.x + 16} y={bar.y + 10} fontSize={8} fill="#166534">
        0̲6
      </text>
      {SOUNDINGS.map((s, i) => {
        const p = px(s)
        return (
          <text key={i} x={p.x} y={p.y} fontSize={9} textAnchor="middle" fill="#334155" fontStyle="italic">
            {s.d}
          </text>
        )
      })}
      <text x={CW * 0.42} y={CH * 0.86} fontSize={15} fill="#5b7fa3" fontStyle="italic" letterSpacing={3}>
        SALTMERE SOUND
      </text>
      <text x={halyard.x - 34} y={halyard.y - 22} fontSize={11} fontWeight={700} fill="#4a3b12">
        Port Halyard
      </text>
      <circle cx={halyard.x} cy={halyard.y} r={4} fill="#4a3b12" />
      <text x={halyard.x + 6} y={halyard.y - 6} fontSize={7} fill="#4a3b12">
        ⚓ Marina
      </text>
      <text x={gannet.x - 20} y={gannet.y - 18} fontSize={11} fontWeight={700} fill="#4a3b12">
        Gannet Cove
      </text>
      <text x={anch.x - 4} y={anch.y + 4} fontSize={11}>
        ⚓
      </text>
      <text x={kh.x + 4} y={kh.y - 20} fontSize={11} fontWeight={700} fill="#4a3b12">
        Kestrel Head
      </text>
      <path d={`M${kh.x} ${kh.y} l-3 -9 l6 0 z`} fill="#7c2d12" />
      <path d={`M${kh.x} ${kh.y - 9} m0 0 l22 -14 l-3 9 z`} fill="#facc15" opacity={0.8} />
      <text x={kh.x + 4} y={kh.y - 8} fontSize={7.5} fill="#7c2d12">
        Fl(3)15s42m16M
      </text>
      <text x={race.x - 14} y={race.y + 4} fontSize={13} fill="#0369a1">
        ≈≈
      </text>
      <text x={race.x - 14} y={race.y + 13} fontSize={7} fill="#0369a1">
        Race
      </text>
      <g transform={`translate(${anv.x} ${anv.y})`}>
        <path d="M-5 0 H5 M0 -5 V5" stroke="#0f172a" strokeWidth={1.6} />
        <circle r={7} fill="none" stroke="#0f172a" strokeDasharray="2 2" />
        <text x={9} y={-6} fontSize={8} fill="#0f172a">
          The Anvil
        </text>
        <text x={9} y={4} fontSize={7.5} fill="#166534">
          1̲2
        </text>
      </g>
      <g transform={`translate(${fb.x} ${fb.y})`}>
        <circle r={5} fill="#fff" stroke="#dc2626" strokeWidth={1.5} />
        <path d="M0 -5 V5" stroke="#dc2626" strokeWidth={2} />
        <text x={8} y={3} fontSize={7.5} fill="#7f1d1d">
          Fairway LFl.10s
        </text>
      </g>
      <line x1={bar.x - 6} y1={bar.y + 22} x2={bar.x + 3} y2={bar.y - 14} stroke="#16a34a" strokeDasharray="4 3" />
      <text x={bar.x - 26} y={bar.y + 32} fontSize={7} fill="#166534">
        Ldg 016° Oc.G.4s
      </text>
      {showLegs && (
        <g>
          {lg.map((l, i) => {
            const a = wp[i]
            const b = wp[i + 1]
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            const ang = Math.atan2(b.y - a.y, b.x - a.x) / DEG
            const rot = ang > 90 || ang < -90 ? ang + 180 : ang
            return (
              <g key={l.from}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#c026d3" strokeWidth={2} />
                <g transform={`translate(${mx} ${my}) rotate(${rot})`}>
                  <text y={-5} fontSize={9} textAnchor="middle" fill="#86198f" fontWeight={700}>
                    {`${fmtBrg(l.track)}T ${n(l.nm)}M`}
                  </text>
                </g>
              </g>
            )
          })}
          <line x1={halyard.x} y1={halyard.y} x2={fb.x} y2={fb.y} stroke="#c026d3" strokeWidth={1.2} strokeDasharray="3 3" />
          <line x1={fb.x} y1={fb.y} x2={wp[0].x} y2={wp[0].y} stroke="#c026d3" strokeWidth={1.2} strokeDasharray="3 3" />
          <line x1={wp[2].x} y1={wp[2].y} x2={bar.x} y2={bar.y} stroke="#c026d3" strokeWidth={1.2} strokeDasharray="3 3" />
          {wp.map((w) => (
            <g key={w.id} transform={`translate(${w.x} ${w.y})`}>
              <rect x={-6} y={-6} width={12} height={12} fill="#fff" stroke="#86198f" strokeWidth={1.5} />
              <circle r={2} fill="#86198f" />
              <text x={9} y={4} fontSize={10} fontWeight={700} fill="#86198f">
                {w.id}
              </text>
            </g>
          ))}
        </g>
      )}
      {showDiamonds &&
        DIAMONDS.map((d) => {
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
        ATLAS_POINTS.map((ap, i) => {
          const d = DIAMONDS.find((x) => x.id === ap.d)!
          const row = d.rows[stream.hour + 6]
          const rate = r1(streamRate(row, stream.range) * ap.m)
          const p = px(ap.p)
          return (
            <g key={i}>
              {rate >= 0.15 ? <Arrow from={p} toDeg={row.set} len={10 + rate * 16} color="#0369a1" width={1.4 + rate * 0.8} /> : <circle cx={p.x} cy={p.y} r={2.5} fill="#0369a1" />}
              <text x={p.x + 5} y={p.y - 5} fontSize={8.5} fontWeight={700} fill="#075985">
                {String(Math.round(rate * 10)).padStart(2, '0')}
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
        <g transform={`rotate(${-VARIATION_W})`}>
          <line x1={0} y1={8} x2={0} y2={-22} stroke="#a21caf" strokeWidth={1} />
          <path d="M0 -24 L3 -16 L-3 -16 Z" fill="none" stroke="#a21caf" />
        </g>
        <text y={50} fontSize={7.5} textAnchor="middle" fill="#86198f">
          {u.chart.variation}
        </text>
      </g>
      <g transform={`translate(12 ${CH - 14})`}>
        <line x1={0} x2={2 * K} y1={0} y2={0} stroke="#0f172a" strokeWidth={2} />
        <line x1={0} x2={0} y1={-4} y2={4} stroke="#0f172a" />
        <line x1={K} x2={K} y1={-3} y2={3} stroke="#0f172a" />
        <line x1={2 * K} x2={2 * K} y1={-4} y2={4} stroke="#0f172a" />
        <text x={K} y={-6} fontSize={8} textAnchor="middle" fill="#0f172a">
          {u.chart.scale}
        </text>
      </g>
    </svg>
  )
}

function ChartWidget() {
  const { u, n } = useAlmanac()
  const [showLegs, setLegs] = useState(true)
  const [showD, setD] = useState(true)
  const [streams, setStreams] = useState(false)
  const [hour, setHour] = useState(-3)
  const range = mainTide(PLAN_DAY).range
  return (
    <Frame title={u.chart.title}>
      <div className="mb-2 flex flex-wrap gap-3 text-xs">
        {(
          [
            [u.chart.legs, showLegs, setLegs],
            [u.chart.diamonds, showD, setD],
            [u.chart.streams, streams, setStreams],
          ] as const
        ).map(([label, v, set]) => (
          <label key={label} className="flex items-center gap-1">
            <input type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} /> {label}
          </label>
        ))}
      </div>
      <SaltmereChart showLegs={showLegs} showDiamonds={showD} stream={streams ? { hour, range } : undefined} />
      {streams && (
        <div className="mt-2">
          <Slider label={u.chart.hour} value={hour} min={-6} max={6} step={1} onChange={setHour} show={`${hourLabel(hour)} Port Halyard · ${n(range)} m`} />
        </div>
      )}
      <ul className="mt-2 grid gap-x-4 gap-y-0.5 text-xs text-slate-600 sm:grid-cols-2 dark:text-slate-300">
        {u.chart.legend.map((l) => (
          <li key={l}>• {l}</li>
        ))}
      </ul>
    </Frame>
  )
}

/* ---------------- Tidal levels / terms diagram ---------------- */

function LevelsWidget() {
  const { u, n } = useAlmanac()
  const L = HALYARD.levels
  const [hot, setHot] = useState(3.0)
  const W = 640
  const H = 392
  const base = 300
  const s = 26
  const y = (m: number) => base - m * s
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
  const halo = { stroke: '#f8fbff', strokeWidth: 3, paintOrder: 'stroke' as const }
  const deck = y(L.hat + 2.2)
  return (
    <Frame title={u.levels.title}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-[#f8fbff]" role="img" aria-label={u.levels.title}>
        <rect x={0} y={ySea} width={W} height={H - ySea} fill="#bae6fd" opacity={0.75} />
        <line x1={0} x2={W} y1={ySea} y2={ySea} stroke="#0284c7" strokeWidth={2} />
        <path d={`M0 ${y(-deep)} L205 ${y(-deep)} L255 ${y(-0.5)} L290 ${y(bank)} L350 ${y(bank)} L385 ${y(-0.4)} L440 ${y(-0.2)} L510 ${y(3.5)} L565 ${y(6.6)} L${W} ${y(6.8)} L${W} ${H} L0 ${H} Z`} fill="#e7d7a6" stroke="#8a7440" />
        {levels.map(([name, h, c]) => (
          <g key={name}>
            <line x1={0} x2={W} y1={y(h)} y2={y(h)} stroke={c} strokeDasharray="5 4" strokeWidth={1} />
            <text x={4} y={y(h) - 3} fontSize={10} fontWeight={700} fill={c} {...halo}>
              {name} {n(h)} m
            </text>
          </g>
        ))}
        <line x1={112} x2={112} y1={y(0)} y2={ySea} stroke="#0284c7" strokeWidth={2.5} markerEnd={hot > 0.3 ? 'url(#lvA)' : undefined} />
        <text x={117} y={Math.min(y(0) - 6, (y(0) + ySea) / 2 + 4)} fontSize={10} fontWeight={700} fill="#0284c7" {...halo}>
          {u.levels.hot} {n(hot)}
        </text>
        <line x1={150} x2={150} y1={y(0)} y2={y(-deep)} stroke="#0f172a" strokeWidth={1.5} />
        <text x={155} y={y(-deep / 2) + 4} fontSize={10} fill="#0f172a" {...halo}>
          {u.levels.charted} {n(deep)}
        </text>
        <line x1={196} x2={196} y1={ySea} y2={y(-deep)} stroke="#0369a1" strokeWidth={3} />
        <text x={200} y={ySea + 14} fontSize={11} fontWeight={700} fill="#0369a1" {...halo}>
          {n(deep + hot)} m
        </text>
        <line x1={305} x2={305} y1={y(0)} y2={y(bank)} stroke="#166534" strokeWidth={1.5} />
        <text x={288} y={y(bank) - 6} fontSize={10} fill="#166534" {...halo}>
          {u.levels.drying} 1̲2
        </text>
        {overBank > 0 && (
          <>
            <line x1={335} x2={335} y1={ySea} y2={y(bank)} stroke="#0369a1" strokeWidth={3} />
            <text x={339} y={ySea + 14} fontSize={11} fontWeight={700} fill="#0369a1" {...halo}>
              {n(overBank)} m
            </text>
          </>
        )}
        <rect x={440} y={deck - 8} width={110} height={8} fill="#64748b" />
        <rect x={446} y={deck} width={6} height={y(-0.2) - deck} fill="#94a3b8" />
        <line x1={495} x2={495} y1={y(L.hat)} y2={deck} stroke="#7c3aed" strokeWidth={1.5} />
        <line x1={505} x2={505} y1={ySea} y2={deck} stroke="#0369a1" strokeWidth={2} strokeDasharray="3 2" />
        <text x={440} y={deck - 16} fontSize={9} fill="#334155" {...halo}>
          {u.levels.clearance}
        </text>
        <path d={`M600 ${y(6.8)} l-6 0 l3 -40 z`} fill="#7c2d12" />
        <line x1={620} x2={620} y1={y(L.mhws)} y2={y(6.8) - 40} stroke="#dc2626" strokeWidth={1.2} />
        <text x={W - 4} y={y(6.8) - 46} fontSize={9} fill="#7c2d12" textAnchor="end" {...halo}>
          {u.levels.elevation}
        </text>
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

/* ---------------- Port Halyard tide table ---------------- */

function TideTableWidget() {
  const { u, n } = useAlmanac()
  return (
    <Frame title={u.table.title}>
      <div className="rounded-lg border border-slate-300 bg-white p-2 dark:border-white/20 dark:bg-white/5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-1 text-xs dark:border-white/10">
          <strong>PORT HALYARD · 47°17′.4N 012°23′.5W</strong>
          <span>{u.table.note}</span>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {HALYARD_TABLE.map((d) => {
            const hw = d.events.filter((e) => e.kind === 'HW').map((e) => e.h)
            const lw = d.events.filter((e) => e.kind === 'LW').map((e) => e.h)
            const range = r1(Math.max(...hw) - Math.min(...lw))
            const spring = d.day >= SPRINGS_DAY - 1
            return (
              <div key={d.day} className={`rounded-md border p-2 font-mono text-xs ${d.day === PLAN_DAY ? 'border-amber-400 bg-amber-50 dark:bg-amber-400/10' : 'border-slate-200 dark:border-white/10'}`}>
                <div className="mb-1 flex items-center justify-between font-sans">
                  <span className={`text-sm font-bold ${spring ? 'text-rose-600' : ''}`}>
                    {d.day} <span className="text-xs font-semibold">{u.weekdays[d.weekday]}</span>
                  </span>
                  {d.day === FULL_MOON_DAY && <span title={u.table.fullMoon}>○</span>}
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
              MHWS {n(HALYARD.levels.mhws)} · MHWN {n(HALYARD.levels.mhwn)}
              <br />
              MLWN {n(HALYARD.levels.mlwn)} · MLWS {n(HALYARD.levels.mlws)}
            </div>
            <div className="mt-1">
              Sp {n(HALYARD.springRange)} m · Np {n(HALYARD.neapRange)} m
            </div>
          </div>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Tide curves ---------------- */

function CurveWidget({ port }: { port: 'halyard' | 'gannet' }) {
  const { u, n } = useAlmanac()
  const [day, setDay] = useState(PLAN_DAY)
  const [t, setT] = useState(9 * 60)
  const events: TideEvent[] = port === 'halyard' ? halyardEvents(day) : gannetEvents(day)
  const w = port === 'gannet' ? barWindow(day) : null
  const W = 620
  const H = 230
  const pad = { l: 34, r: 10, t: 12, b: 26 }
  const x = (m: number) => pad.l + (m / 1440) * (W - pad.l - pad.r)
  const y = (h: number) => H - pad.b - (h / 6) * (H - pad.t - pad.b)
  const pts = Array.from({ length: 145 }, (_, i) => i * 10).map((m) => `${x(m).toFixed(1)} ${y(heightAt(events, m)).toFixed(1)}`)
  const hNow = heightAt(events, t)
  const today = events.filter((e) => e.t >= 0 && e.t < 1440)
  return (
    <Frame title={fill(u.curve.title, { port: port === 'halyard' ? 'Port Halyard' : 'Gannet Cove' })}>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">{u.curve.pickDay}</span>
        <Pills items={HALYARD_TABLE.slice(1, 6).map((d) => d.day)} value={day} onChange={setDay} label={(d) => `${d} ${u.month}`} />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-white dark:bg-white/90" role="img" aria-label={u.curve.title}>
        {w && <rect x={x(w.open)} y={pad.t} width={x(w.close) - x(w.open)} height={H - pad.t - pad.b} fill="#bbf7d0" opacity={0.7} />}
        {[0, 1, 2, 3, 4, 5, 6].map((h) => (
          <g key={h}>
            <line x1={pad.l} x2={W - pad.r} y1={y(h)} y2={y(h)} stroke="#e2e8f0" />
            <text x={pad.l - 4} y={y(h) + 3} fontSize={9} textAnchor="end" fill="#475569">
              {h}
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
        <Slider label={u.curve.pickTime} value={t} min={0} max={1435} step={5} onChange={setT} show={both(t, u)} />
      </div>
      <p className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-sm dark:bg-white/5">
        {fill(u.curve.at, { time: both(t, u), h: n(hNow) })}
        {w && (
          <>
            {' '}
            · <strong>{fill(u.curve.window, { open: both(w.open, u), close: both(w.close, u) })}</strong>
          </>
        )}
      </p>
    </Frame>
  )
}

/* ---------------- Secondary port ---------------- */

function DiffBoxWidget() {
  const { u, n } = useAlmanac()
  const L = HALYARD.levels
  const d = GANNET.hDiff
  const sd = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${n(Math.abs(v))}`
  return (
    <Frame title={u.diff.title}>
      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs dark:border-white/20 dark:bg-white/5">
        <div className="font-sans text-sm font-bold">GANNET COVE · 47°06′.9N 012°07′.4W</div>
        <div className="font-sans text-xs text-slate-500">{u.diff.stdPort}</div>
        <table className="mt-2 min-w-[30rem] text-center">
          <thead>
            <tr>
              <th colSpan={2}>{u.diff.times}</th>
              <th colSpan={2} />
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
              <td className="px-2">0000</td>
              <td className="px-2">0600</td>
              <td className="px-2">0500</td>
              <td className="px-2">1100</td>
              <td rowSpan={2}>{n(L.mhws)}</td>
              <td rowSpan={2}>{n(L.mhwn)}</td>
              <td rowSpan={2}>{n(L.mlwn)}</td>
              <td rowSpan={2}>{n(L.mlws)}</td>
            </tr>
            <tr>
              <td>1200</td>
              <td>1800</td>
              <td>1700</td>
              <td>2300</td>
            </tr>
            <tr>
              <td colSpan={8} className="pt-1 text-left font-sans font-semibold">
                {u.diff.differences}
              </td>
            </tr>
            <tr className="font-bold text-fuchsia-700 dark:text-fuchsia-300">
              {GANNET.hwDiff.slice(0, 2).map((v, i) => (
                <td key={`h${i}`}>{fmtDiff(v)}</td>
              ))}
              {GANNET.lwDiff.slice(0, 2).map((v, i) => (
                <td key={`l${i}`}>{fmtDiff(v)}</td>
              ))}
              <td>{sd(d.mhws)}</td>
              <td>{sd(d.mhwn)}</td>
              <td>{sd(d.mlwn)}</td>
              <td>{sd(d.mlws)}</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-2 font-sans text-xs text-slate-600 dark:text-slate-300">{fill(u.diff.bar, { d: n(GANNET.barDrying) })}</div>
      </div>
    </Frame>
  )
}

function SecondaryWidget() {
  const { u, n } = useAlmanac()
  const [day, setDay] = useState(PLAN_DAY)
  const evs = dayEvents(day)
  const [idx, setIdx] = useState(1)
  const e = evs[Math.min(idx, evs.length - 1)]
  const g = gannetEvent(e)
  const times = e.kind === 'HW' ? GANNET.hwTimes : GANNET.lwTimes
  const diffs = e.kind === 'HW' ? GANNET.hwDiff : GANNET.lwDiff
  const tt = mod(e.t, 1440)
  let i0 = times.findIndex((a, i) => {
    const b = i + 1 < times.length ? times[i + 1] : times[0] + 1440
    const x = tt < a ? tt + 1440 : tt
    return x >= a && x <= b
  })
  if (i0 < 0) i0 = 0
  const i1 = (i0 + 1) % times.length
  const span = mod(times[i1] - times[i0], 1440) || 1440
  const frac = mod(tt - times[i0], 1440) / span
  const L = HALYARD.levels
  const d = GANNET.hDiff
  const [lo, hi, dlo, dhi, nlo, nhi] = e.kind === 'HW' ? [L.mhwn, L.mhws, d.mhwn, d.mhws, 'MHWN', 'MHWS'] : [L.mlws, L.mlwn, d.mlws, d.mlwn, 'MLWS', 'MLWN']
  const hf = (e.h - lo) / (hi - lo)
  const sd = (v: number, digits = 1) => `${v < 0 ? '−' : '+'}${n(Math.abs(v), digits)}`
  return (
    <Frame title={u.secondary.title}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">{u.secondary.pickDay}</span>
        <Pills
          items={HALYARD_TABLE.slice(1, 6).map((x) => x.day)}
          value={day}
          onChange={(v) => {
            setDay(v)
            setIdx(1)
          }}
          label={(v) => `${v} ${u.month}`}
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
          {fill(u.secondary.stepHeight, {
            h: n(e.h),
            lo: `${nlo} ${n(lo)}`,
            dlo: sd(dlo),
            hi: `${nhi} ${n(hi)}`,
            dhi: sd(dhi),
            f: n(hf, 2),
            raw: sd(heightDifference(e.h, e.kind), 2),
            d: sd(g.hDiff),
          })}
        </li>
        <li className="rounded-lg border-2 border-emerald-400 bg-emerald-50 px-3 py-2 font-semibold dark:bg-emerald-500/10">
          {fill(u.secondary.result, { kind: e.kind, t: both(g.t, u), h: n(g.h) })}
        </li>
      </ol>
    </Frame>
  )
}

/* ---------------- Tidal streams ---------------- */

function AtlasWidget() {
  const { u, n } = useAlmanac()
  const [hour, setHour] = useState(-3)
  const main = mainTide(PLAN_DAY)
  return (
    <Frame title={u.atlas.title}>
      <SaltmereChart showLegs={false} showDiamonds stream={{ hour, range: main.range }} />
      <div className="mt-2">
        <Slider label={u.atlas.hour} value={hour} min={-6} max={6} step={1} onChange={setHour} show={hourLabel(hour)} />
      </div>
      <p className="mt-2 text-sm">{fill(u.atlas.clock, { hour: hourLabel(hour), time: both(main.hw.t + hour * 60, u), range: n(main.range) })}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{u.atlas.note}</p>
    </Frame>
  )
}

function DiamondsWidget() {
  const { u, n } = useAlmanac()
  const [range, setRange] = useState(mainTide(PLAN_DAY).range)
  const [hour, setHour] = useState(-3)
  const f = rangeFactor(range)
  return (
    <Frame title={u.diamonds.title}>
      <div className="grid gap-3 md:grid-cols-2">
        {DIAMONDS.map((d) => (
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
                      <td className="text-sky-700 dark:text-sky-300">{n(streamRate(r, range))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <Slider label={u.diamonds.range} value={range} min={1.6} max={5.2} step={0.1} onChange={setRange} show={`${n(range)} m`} />
      </div>
      {DIAMONDS.map((d) => {
        const r = d.rows[hour + 6]
        return (
          <p key={d.id} className="mt-2 rounded-lg bg-white/70 px-2 py-1 text-sm dark:bg-white/5">
            {fill(u.diamonds.calc, { d: d.id, hour: hourLabel(hour), dir: fmtBrg(r.set), sp: n(r.sp), np: n(r.np), range: n(range), f: n(f, 2), rate: n(streamRate(r, range)) })}
          </p>
        )
      })}
    </Frame>
  )
}

function StreamDayWidget() {
  const { u, n } = useAlmanac()
  const main = mainTide(PLAN_DAY)
  const rows = Array.from({ length: 10 }, (_, i) => i - 6).map((k) => {
    const t = main.hw.t + k * 60
    const a = DIAMONDS[0].rows[k + 6]
    const b = DIAMONDS[1].rows[k + 6]
    const ra = streamRate(a, main.range)
    const rb = streamRate(b, main.range)
    const fair = b.set < 180 && rb >= 0.5
    const verdict = rb < 0.5 ? u.streamDay.slack : fair ? u.streamDay.fair : u.streamDay.foul
    return {
      k,
      cells: [hourLabel(k), <Mono key="b">{`${fmtHM(t - 30)}–${fmtHM(t + 30)}`}</Mono>, <Mono key="l">{`${fmtLocal(t - 30)}–${fmtLocal(t + 30)}`}</Mono>, `${fmtBrg(a.set)} ${n(ra)} kn`, `${fmtBrg(b.set)} ${n(rb)} kn`, verdict],
    }
  })
  return (
    <Frame title={u.streamDay.title}>
      <Table head={[u.streamDay.hour, `${u.streamDay.band} ${u.ut}`, `${u.streamDay.band} ${u.local}`, '◇A', '◇B', u.streamDay.verdict]} rows={rows.map((r) => r.cells)} highlight={(i) => rows[i].k === -3 || rows[i].k === -2} compact />
    </Frame>
  )
}

/* ---------------- Departure planner ---------------- */

function Timeline({ plan }: { plan: PassagePlan }) {
  const { u } = useAlmanac()
  const t0 = 3 * 60
  const t1 = 16 * 60
  const W = 620
  const x = (m: number) => 10 + ((m - t0) / (t1 - t0)) * (W - 20)
  const main = mainTide(plan.day)
  const fairEnd = main.hw.t + 30
  return (
    <svg viewBox={`0 0 ${W} 92`} className="w-full rounded-lg bg-white dark:bg-white/90" role="img" aria-label={u.departure.timeline}>
      <rect x={x(main.hw.t - 6 * 60 - 30)} y={8} width={x(fairEnd) - x(main.hw.t - 6 * 60 - 30)} height={16} fill="#bae6fd" />
      <rect x={x(fairEnd)} y={8} width={x(t1) - x(fairEnd)} height={16} fill="#fecaca" />
      <text x={x(main.hw.t - 6 * 60) + 4} y={20} fontSize={9} fill="#075985">
        {u.departure.fairLbl}
      </text>
      <rect x={x(plan.window.open)} y={28} width={x(plan.window.close) - x(plan.window.open)} height={16} fill="#bbf7d0" />
      <text x={x(plan.window.open) + 4} y={40} fontSize={9} fill="#166534">
        {u.departure.windowLbl}
      </text>
      <rect x={x(plan.castOff)} y={50} width={Math.max(2, x(plan.anchor) - x(plan.castOff))} height={14} rx={4} fill={plan.barOk && !plan.foul ? '#0ea5e9' : '#f97316'} />
      <text x={x(plan.castOff)} y={76} fontSize={9} fill="#0f172a">
        {u.departure.passageLbl}
      </text>
      <line x1={x(plan.barEta)} x2={x(plan.barEta)} y1={26} y2={66} stroke="#0f172a" strokeWidth={1.5} />
      {Array.from({ length: 14 }, (_, i) => t0 + i * 60).map((m) => (
        <text key={m} x={x(m)} y={88} fontSize={8} textAnchor="middle" fill="#475569">
          {fmtHM(m).slice(0, 2)}
        </text>
      ))}
    </svg>
  )
}

function DepartureWidget() {
  const { u, n } = useAlmanac()
  const [dep, setDep] = useState(PLAN_DEPART)
  const plan = useMemo(() => planPassage(PLAN_DAY, dep), [dep])
  const early = plan.barEta < plan.window.open
  const options = [300, 330, 360, 390, 420, 480, 540, 600]
  return (
    <Frame title={u.departure.title}>
      <Slider label={u.departure.depart} value={dep} min={270} max={690} step={15} onChange={setDep} show={both(dep, u)} />
      <div className="mt-2">
        <Timeline plan={plan} />
      </div>
      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          {u.departure.castOff}: <strong>{both(plan.castOff, u)}</strong>
        </div>
        <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          {u.departure.bar}: <strong>{both(plan.barEta, u)}</strong> · {n(plan.barHeight)} m
        </div>
        <div className="rounded-lg bg-white px-3 py-2 dark:bg-white/5">
          {u.departure.total}: <strong>{plan.legs.reduce((s, l) => s + l.minutes, 0)} {u.minutes}</strong>
        </div>
      </div>
      <div className="mt-2">
        <Table
          compact
          head={[u.departure.leg, u.departure.stream, u.departure.cts, u.departure.sog, u.departure.arrive]}
          rows={plan.legs.map((l) => [`${l.from}→${l.to}`, `${hourLabel(l.hour)} ◇${l.diamond} ${fmtBrg(l.row.set)} ${n(l.rate)} kn`, `${fmtBrg(l.cts)}T / ${fmtBrg(l.ctsM)}M`, `${n(l.sog)} kn · ${l.minutes} ${u.minutes}`, both(l.end, u)])}
        />
      </div>
      <div className={`mt-2 rounded-lg border px-3 py-2 text-sm ${plan.barOk && !plan.foul ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10' : 'border-rose-300 bg-rose-50 dark:bg-rose-500/10'}`}>
        {plan.barOk ? u.departure.ok : early ? u.departure.early : u.departure.late} {plan.foul ? u.departure.foulWarn : u.departure.fairNote}
      </div>
      <h4 className="mt-4 text-sm font-semibold">{u.departure.options}</h4>
      <Table
        compact
        head={[u.departure.depart, u.departure.castOff, u.departure.bar, u.height, u.departure.total, u.departure.verdict]}
        highlight={(i) => options[i] === PLAN_DEPART}
        rows={options.map((o) => {
          const p = planPassage(PLAN_DAY, o)
          const v = !p.barOk ? (p.barEta < p.window.open ? '⏳' : '⛔') : p.foul ? '⚠️' : '✅'
          return [both(o, u), fmtLocal(p.castOff), fmtLocal(p.barEta), `${n(p.barHeight)} m`, `${p.legs.reduce((s, l) => s + l.minutes, 0)} ${u.minutes}`, v]
        })}
      />
    </Frame>
  )
}

/* ---------------- Overview, legs, CTS ---------------- */

function OverviewWidget() {
  const { u, n } = useAlmanac()
  const p = planPassage(PLAN_DAY, PLAN_DEPART)
  const main = mainTide(PLAN_DAY)
  const g = gannetEvents(PLAN_DAY).find((e) => e.std.t === main.hw.t)!
  const vals = [
    `13 ${u.month} · ${BOAT.name} · ${n(BOAT.draft)} m · ${BOAT.speed} kn`,
    `HW ${both(main.hw.t, u)} ${n(main.hw.h)} m · LW ${fmtHM(main.lw.t)} ${n(main.lw.h)} m · ${n(main.range)} m`,
    `HW ${both(g.t, u)} ${n(g.h)} m`,
    `≥ ${n(p.need)} m · ${both(p.window.open, u)} → ${both(p.window.close, u)}`,
    `${hourLabel(-6)} → HW (${fmtLocal(main.hw.t - 360)}–${fmtLocal(main.hw.t)} ${u.local})`,
    both(p.castOff, u),
    `${both(p.barEta, u)} · ${n(p.barHeight)} m`,
    both(p.anchor, u),
  ]
  return (
    <Frame title={u.overview.title}>
      <Table head={['', '']} rows={u.overview.rows.map((r, i) => [<strong key="k">{r}</strong>, vals[i]])} />
      <p className="mt-3 rounded-lg border-l-4 border-sky-500 bg-white px-3 py-2 text-sm dark:bg-white/5">
        {fill(u.overview.text, {
          castOff: fmtLocal(p.castOff),
          wpt1: fmtLocal(PLAN_DEPART),
          bar: fmtLocal(p.barEta),
          h: n(p.barHeight),
          anchor: fmtLocal(p.anchor),
          open: fmtLocal(p.window.open),
          close: fmtLocal(p.window.close),
        })}
      </p>
    </Frame>
  )
}

function LegsWidget() {
  const { u, n } = useAlmanac()
  const lg = legs()
  return (
    <Frame title={u.legs.title}>
      <h4 className="text-sm font-semibold">{u.legs.wpts}</h4>
      <Table compact head={[u.legs.wpt, u.legs.pos, u.legs.note]} rows={WAYPOINTS.map((w, i) => [<strong key="w">{w.id}</strong>, <Mono key="p">{fmtPos(w)}</Mono>, u.legs.wptNotes[i]])} />
      <h4 className="mt-4 text-sm font-semibold">{u.legs.legTable}</h4>
      <Table
        compact
        head={[u.legs.leg, u.legs.trueT, u.legs.magM, u.legs.dist, u.legs.work]}
        rows={lg.map((l) => {
          const g = legGeometry(WAYPOINTS.find((w) => w.id === l.from)!, WAYPOINTS.find((w) => w.id === l.to)!)
          const dlong = WAYPOINTS.find((w) => w.id === l.to)!.lon - WAYPOINTS.find((w) => w.id === l.from)!.lon
          return [
            <strong key="l">{`${l.from} → ${l.to}`}</strong>,
            `${fmtBrg(l.track)}T`,
            `${fmtBrg(toMagnetic(l.track))}M`,
            `${n(l.nm)} M`,
            <Mono key="w">{`d.lat ${n(Math.abs(g.dlat))}′${g.dlat < 0 ? 'S' : 'N'} · d.long ${n(Math.abs(dlong))}′${dlong > 0 ? 'E' : 'W'} × cos47° = ${n(Math.abs(g.dep))}M · √(${n(Math.abs(g.dlat))}² + ${n(Math.abs(g.dep))}²)`}</Mono>,
          ]
        })}
      />
    </Frame>
  )
}

function CtsWidget() {
  const { u, n } = useAlmanac()
  const p = planPassage(PLAN_DAY, PLAN_DEPART)
  const presets = p.legs.map((l) => ({ label: `${l.from}→${l.to}`, track: l.track, set: l.row.set, rate: l.rate }))
  const [sel, setSel] = useState(0)
  const [track, setTrack] = useState(presets[0].track)
  const [set, setSet] = useState(presets[0].set)
  const [rate, setRate] = useState(presets[0].rate)
  const [speed, setSpeed] = useState(BOAT.speed)
  const pick = (i: number) => {
    setSel(i)
    if (i < presets.length) {
      setTrack(presets[i].track)
      setSet(presets[i].set)
      setRate(presets[i].rate)
      setSpeed(BOAT.speed)
    }
  }
  const c = courseToSteer(track, set, rate, speed)
  // Geometry in nautical miles: x east, y north.
  const v = (deg: number, len: number) => ({ x: Math.sin(deg * DEG) * len, y: Math.cos(deg * DEG) * len })
  const S = { x: 0, y: 0 }
  const E = v(set, rate)
  const C = c ? v(track, c.sog) : v(track, speed)
  const far = v(track, Math.max(speed + rate + 1, 7))
  const ptsAll = [S, E, C, far]
  const minX = Math.min(...ptsAll.map((q) => q.x)) - 1.2
  const maxX = Math.max(...ptsAll.map((q) => q.x)) + 1.2
  const minY = Math.min(...ptsAll.map((q) => q.y)) - 1.2
  const maxY = Math.max(...ptsAll.map((q) => q.y)) + 1.2
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
          <text x={sp.x + 6} y={sp.y - 6} fontSize={11} fontWeight={700} fill="#86198f">
            {presets[sel]?.label.split('→')[0] ?? 'A'}
          </text>
          <text x={(sp.x + ep.x) / 2 + 6} y={(sp.y + ep.y) / 2 + 12} fontSize={10} fill="#0369a1" fontWeight={700}>
            {`${u.cts.streamVec} ${fmtBrg(set)} ${n(rate)}`}
          </text>
          {c && (
            <text x={(ep.x + cp.x) / 2 + 8} y={(ep.y + cp.y) / 2} fontSize={10} fill="#0f172a" fontWeight={700}>
              {`${u.cts.waterTrack} ${fmtBrg(c.heading)}T · ${n(speed)} M`}
            </text>
          )}
          <text x={(sp.x + cp.x) / 2 - 8} y={(sp.y + cp.y) / 2 - 8} fontSize={10} fill="#86198f" fontWeight={700} textAnchor="end">
            {`${u.cts.groundTrack} ${fmtBrg(track)}T`}
          </text>
          <text x={W - 16} y={18} fontSize={12} fontWeight={700} fill="#334155">
            N↑
          </text>
        </svg>
        <div className="space-y-2">
          <Slider label={u.cts.track} value={track} min={0} max={359} step={1} onChange={(x) => (setTrack(x), setSel(presets.length))} show={`${fmtBrg(track)}T`} />
          <Slider label={u.cts.set} value={set} min={0} max={359} step={1} onChange={(x) => (setSet(x), setSel(presets.length))} show={`${fmtBrg(set)}T`} />
          <Slider label={u.cts.rate} value={rate} min={0} max={4} step={0.1} onChange={(x) => (setRate(x), setSel(presets.length))} show={`${n(rate)} kn`} />
          <Slider label={u.cts.speed} value={speed} min={2} max={8} step={0.5} onChange={(x) => (setSpeed(x), setSel(presets.length))} show={`${n(speed)} kn`} />
          <div className="rounded-lg border-2 border-slate-800 bg-white px-3 py-2 text-sm dark:border-sky-300 dark:bg-white/5">
            {c ? fill(u.cts.result, { t: fmtBrg(c.heading), m: fmtBrg(toMagnetic(c.heading)), sog: n(c.sog), off: n(Math.abs(c.offset), 0), side: c.offset >= 0 ? u.cts.right : u.cts.left }) : u.cts.tooStrong}
          </div>
        </div>
      </div>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
        {u.cts.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </Frame>
  )
}

/* ---------------- Plan sheet ---------------- */

function SheetWidget() {
  const { u, n } = useAlmanac()
  const p = planPassage(PLAN_DAY, PLAN_DEPART)
  const main = mainTide(PLAN_DAY)
  const hal = halyardEvents(PLAN_DAY).filter((e) => e.t >= 0 && e.t < 1440)
  const gan = gannetEvents(PLAN_DAY).filter((e) => e.t >= 0 && e.t < 1440)
  const events = [
    [p.castOff, u.sheet.events[0]],
    [PLAN_DEPART, u.sheet.events[1]],
    [p.legs[0].end, u.sheet.events[2]],
    [p.legs[1].end, u.sheet.events[3]],
    [p.barEta, fill(u.sheet.events[4], { h: n(p.barHeight) })],
    [p.anchor, u.sheet.events[5]],
  ] as const
  return (
    <Frame title={u.sheet.title}>
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
                    `${u.weekdays[6]} 13 ${u.month}`,
                    `${BOAT.name} · ${n(BOAT.length)} m · ${n(BOAT.draft)} m · ${BOAT.speed} kn`,
                    'Port Halyard → Gannet Cove',
                    `${n(p.legs.reduce((s, l) => s + l.nm, 0))} M`,
                    `${u.ut} + 1 = ${u.local}`,
                    `${VARIATION_W}°W`,
                  ][i]
                }
              </strong>
            </div>
          ))}
        </div>
        <div>
          <h4 className="font-semibold">{u.sheet.tides}</h4>
          <Table
            compact
            head={['', ...hal.map((e) => e.kind)]}
            rows={[
              ['Port Halyard', ...hal.map((e) => `${fmtLocal(e.t)} · ${n(e.h)}`)],
              ['Gannet Cove', ...gan.map((e) => `${fmtLocal(e.t)} · ${n(e.h)}`)],
            ]}
          />
          <p className="mt-1 text-xs text-slate-500">
            {fill(u.sheet.summary, { range: n(main.range), f: n(p.factor, 2), need: n(p.need), open: fmtLocal(p.window.open), close: fmtLocal(p.window.close) })}
          </p>
        </div>
        <div>
          <h4 className="font-semibold">{u.sheet.timeline}</h4>
          <Table compact head={[u.local, u.ut, '']} rows={events.map(([t, label]) => [<strong key="l">{fmtLocal(t)}</strong>, fmtHM(t), label])} />
        </div>
        <div>
          <h4 className="font-semibold">{u.sheet.legsH}</h4>
          <Table
            compact
            head={[u.legs.leg, u.legs.trueT, u.legs.dist, u.departure.stream, u.departure.cts, u.departure.sog, u.departure.arrive]}
            rows={p.legs.map((l) => [`${l.from}→${l.to}`, `${fmtBrg(l.track)}T`, `${n(l.nm)} M`, `${hourLabel(l.hour)} ◇${l.diamond} ${fmtBrg(l.row.set)} ${n(l.rate)}`, <strong key="c">{`${fmtBrg(l.ctsM)}M`}</strong>, `${n(l.sog)} kn`, fmtLocal(l.end)])}
          />
        </div>
        <div>
          <h4 className="font-semibold">{u.sheet.notesH}</h4>
          <ul className="list-disc space-y-0.5 pl-5">
            {u.sheet.notes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Practice ---------------- */

export const PRACTICE: { day: number; depart: number }[] = [
  { day: 12, depart: 5 * 60 },
  { day: 14, depart: 7 * 60 },
  { day: 15, depart: 8 * 60 },
]

type Answer = { kind: 'time' | 'num'; value: number; tol: number }

export function practiceAnswers(day: number, depart: number): Answer[] {
  const main = mainTide(day)
  const g = gannetEvents(day).find((e) => e.std.t === main.hw.t)!
  const w = barWindow(day)
  const p = planPassage(day, depart)
  return [
    { kind: 'time', value: main.hw.t, tol: 0 },
    { kind: 'num', value: main.range, tol: 0.05 },
    { kind: 'time', value: g.t, tol: 3 },
    { kind: 'num', value: g.h, tol: 0.1 },
    { kind: 'time', value: w.open, tol: 10 },
    { kind: 'num', value: p.legs[0].rate, tol: 0.1 },
    { kind: 'num', value: p.legs[0].ctsM, tol: 2 },
    { kind: 'num', value: p.legs[1].rate, tol: 0.1 },
    { kind: 'num', value: p.legs[1].ctsM, tol: 2 },
    { kind: 'time', value: p.barEta, tol: 8 },
  ]
}

export function parseAnswer(raw: string, kind: Answer['kind']): number | null {
  const s = raw.trim().replace(',', '.')
  if (!s) return null
  if (kind === 'time') {
    const m = s.replace(':', '').match(/^(\d{1,2})(\d{2})$/)
    return m ? Number(m[1]) * 60 + Number(m[2]) : null
  }
  const v = Number(s.replace('°', ''))
  return Number.isFinite(v) ? v : null
}

function PracticeWidget() {
  const { u, n } = useAlmanac()
  const [pi, setPi] = useState(0)
  const ex = PRACTICE[pi]
  const ans = practiceAnswers(ex.day, ex.depart)
  const [vals, setVals] = useState<string[]>(() => ans.map(() => ''))
  const [checked, setChecked] = useState(false)
  const [reveal, setReveal] = useState(false)
  const show = (a: Answer) => (a.kind === 'time' ? fmtHM(a.value) : Number.isInteger(a.value) && a.tol >= 1 ? String(a.value) : n(a.value))
  const ok = ans.map((a, i) => {
    const v = parseAnswer(vals[i], a.kind)
    return v !== null && Math.abs(v - a.value) <= a.tol + 1e-9
  })
  const pick = (i: number) => {
    setPi(i)
    setVals(practiceAnswers(PRACTICE[i].day, PRACTICE[i].depart).map(() => ''))
    setChecked(false)
    setReveal(false)
  }
  return (
    <Frame title={u.practice.title}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">{u.practice.pickDay}</span>
        <Pills items={PRACTICE.map((_, i) => i)} value={pi} onChange={pick} label={(i) => `${PRACTICE[i].day} ${u.month}`} />
      </div>
      <p className="mt-2 text-sm">{fill(u.practice.intro, { day: ex.day, depart: both(ex.depart, u) })}</p>
      <ol className="mt-3 space-y-2">
        {u.practice.questions.map((q, i) => (
          <li key={q} className="grid items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm sm:grid-cols-[minmax(0,1fr)_8rem_auto] dark:bg-white/5">
            <span>
              {i + 1}. {q}
            </span>
            <input
              value={vals[i]}
              onChange={(e) => setVals(vals.map((v, j) => (j === i ? e.target.value : v)))}
              inputMode="decimal"
              className="rounded-md border border-slate-300 bg-white px-2 py-1 font-mono dark:border-white/20 dark:bg-white/5"
            />
            <span className="min-w-[6rem] text-xs">
              {checked && (ok[i] ? '✅' : '❌')}
              {reveal && (
                <span className="ml-1 font-mono text-slate-600 dark:text-slate-300">
                  {u.practice.answer} {show(ans[i])}
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

export function AlmanacWidget({ id }: { id: AWidget }) {
  switch (id) {
    case 'chart':
      return <ChartWidget />
    case 'levels':
      return <LevelsWidget />
    case 'tideTable':
      return <TideTableWidget />
    case 'curveHalyard':
      return <CurveWidget port="halyard" />
    case 'curveGannet':
      return <CurveWidget port="gannet" />
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
  }
}
