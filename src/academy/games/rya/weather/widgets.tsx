import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Frame } from '../lessons/frame'
import {
  BEAUFORT_KN,
  BEAUFORT_WAVE,
  DEP_COLD,
  DEP_HOURS,
  DEP_OBS,
  DEP_WARM,
  beaufort,
  beaufortRange,
  compass8,
  depCentre,
  depField,
  depState,
  frontXAt,
  mod,
  pressureAt,
  spacingToKn,
  tendencyIndex,
} from './field'
import {
  Arrow,
  BoatIcon,
  Centre,
  CloudShape,
  DEG,
  FrontLine,
  HemiPills,
  Info,
  Isobars,
  Pills,
  PlayButton,
  SeaScene,
  Slider,
  StormArt,
  TrsDefs,
  Wide,
  WindArrow,
  halo,
  toPx,
  useAmbient,
  useClock,
  useW,
  type ChartView,
} from './parts'
import { BAND_IDS, CLOUD_IDS, SYMBOL_IDS, fill, type BandId, type CloudId, type SymbolId, type TermId, type WWidget } from './text'

/* ---------------- Global circulation ---------------- */

interface Band {
  id: BandId
  lo: number
  hi: number
  /** Wind direction FROM, or null for calms / variable belts. */
  from: number | null
}

export function globeBands(month: number): Band[] {
  const s = 6 * Math.sin((2 * Math.PI * (month - 3)) / 12)
  const itcz = 5 + s
  return [
    { id: 'polarE', lo: 65 + s, hi: 90, from: 45 },
    { id: 'subpolar', lo: 55 + s, hi: 65 + s, from: null },
    { id: 'westerlies', lo: 35 + s, hi: 55 + s, from: 225 },
    { id: 'horse', lo: 25 + s, hi: 35 + s, from: null },
    { id: 'trades', lo: itcz + 4, hi: 25 + s, from: 45 },
    { id: 'itcz', lo: itcz - 4, hi: itcz + 4, from: null },
    { id: 'trades', lo: -25 + s, hi: itcz - 4, from: 135 },
    { id: 'horse', lo: -35 + s, hi: -25 + s, from: null },
    { id: 'westerlies', lo: -55 + s, hi: -35 + s, from: 315 },
    { id: 'subpolar', lo: -65 + s, hi: -55 + s, from: null },
    { id: 'polarE', lo: -90, hi: -65 + s, from: 135 },
  ]
}

const BAND_COLOR: Record<BandId, string> = { polarE: '#e0f2fe', subpolar: '#c7d2fe', westerlies: '#bbf7d0', horse: '#fef3c7', trades: '#bae6fd', itcz: '#fecaca' }

function GlobeWidget() {
  const { u } = useW()
  const g = u.globe
  const [month, setMonth] = useState(0)
  const [sel, setSel] = useState<BandId>('trades')
  const [on, setOn] = useAmbient()
  const t = useClock(on)
  const R = 165
  const cx = 185
  const cy = 180
  const yOf = (lat: number) => cy - R * Math.sin(Math.max(-90, Math.min(90, lat)) * DEG)
  const bands = globeBands(month)
  const vertical: { lat: number; up: boolean }[] = [
    { lat: 5 + 6 * Math.sin((2 * Math.PI * (month - 3)) / 12), up: true },
    { lat: 30, up: false },
    { lat: -30, up: false },
    { lat: 60, up: true },
    { lat: -60, up: true },
  ]
  return (
    <Frame title={g.title}>
      <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label={g.month} value={month} min={0} max={11} step={1} onChange={setMonth} show={u.months[month]} />
        <PlayButton on={on} set={setOn} />
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
        <Wide min={320}>
          <svg viewBox="0 0 470 360" className="w-full">
            <defs>
              <clipPath id="globeClip">
                <circle cx={cx} cy={cy} r={R} />
              </clipPath>
            </defs>
            <circle cx={cx} cy={cy} r={R} fill="#e2e8f0" />
            <g clipPath="url(#globeClip)">
              {bands.map((b, i) => {
                const y1 = yOf(b.hi)
                const y2 = yOf(b.lo)
                return <rect key={i} x={cx - R} y={y1} width={2 * R} height={Math.max(0, y2 - y1)} fill={BAND_COLOR[b.id]} stroke={b.id === sel ? '#0369a1' : '#fff'} strokeWidth={b.id === sel ? 2.5 : 0.8} onClick={() => setSel(b.id)} className="cursor-pointer" />
              })}
              <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="#64748b" strokeDasharray="4 4" />
              {bands.map((b, i) => {
                if (b.from === null) return null
                // Polar belts: keep the arrows towards the wider, equatorward edge of the band.
                const eq = Math.abs(b.lo) < Math.abs(b.hi) ? b.lo : b.hi
                const mid = b.id === 'polarE' ? eq + ((b.lo + b.hi - 2 * eq) / 2) * 0.55 : (b.lo + b.hi) / 2
                const count = b.id === 'polarE' ? 3 : 5
                const hw = R * Math.cos(mid * DEG) * 0.85
                const bandH = yOf(b.lo) - yOf(b.hi)
                const to = mod(b.from + 180, 360)
                const sx = Math.sin(to * DEG) > 0 ? 1 : -1
                const dy = -Math.cos(to * DEG)
                return Array.from({ length: count }, (_, k) => {
                  const f = mod(k / count + sx * t * 0.06, 1)
                  const x = cx - hw + f * 2 * hw
                  const y = yOf(mid) + (f - 0.5) * dy * bandH * 0.35 * sx
                  return <Arrow key={`${i}-${k}`} x={x} y={y} toDeg={to} len={14} color="#0f172a" width={1.6} head={4} />
                })
              })}
              {vertical.map((v) => (
                <text key={v.lat} x={cx + R * Math.cos(v.lat * DEG) * 0.55} y={yOf(v.lat) + 5} fontSize={14} fontWeight={700} fill={v.up ? '#b91c1c' : '#1d4ed8'} textAnchor="middle">
                  {v.up ? '↑' : '↓'}
                </text>
              ))}
            </g>
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="#334155" strokeWidth={1.5} />
            {[60, 30, 0, -30, -60].map((lat) => (
              <text key={lat} x={cx - R * Math.cos(lat * DEG) - 4} y={yOf(lat) + 3} fontSize={9} fill="#475569" textAnchor="end">
                {lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`}
              </text>
            ))}
            {[
              [0, 30, 'Hadley'],
              [30, 60, 'Ferrel'],
              [60, 90, 'Polar'],
              [-30, 0, 'Hadley'],
              [-60, -30, 'Ferrel'],
              [-90, -60, 'Polar'],
            ].map(([a, b, name]) => {
              const y1 = yOf(b as number)
              const y2 = yOf(a as number)
              return (
                <g key={`${a}`}>
                  <ellipse cx={cx + R + 45} cy={(y1 + y2) / 2} rx={22} ry={Math.max(8, (y2 - y1) / 2 - 2)} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
                  <text x={cx + R + 45} y={(y1 + y2) / 2 + 3} fontSize={9} textAnchor="middle" fill="#334155">
                    {name}
                  </text>
                </g>
              )
            })}
            <text x={cx + R + 45} y={14} fontSize={9} textAnchor="middle" fill="#475569">
              {g.cells}
            </text>
          </svg>
        </Wide>
        <div className="space-y-2">
          <Pills items={BAND_IDS} value={sel} onChange={setSel} label={(b) => g.bands[b].name} />
          <Info title={g.bands[sel].name}>{g.bands[sel].text}</Info>
          <p className="text-xs text-slate-500 dark:text-slate-400">{g.hint}</p>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Wind round highs and lows ---------------- */

const INFLOW = [0, 15, 30]

function PressureWidget() {
  const { u } = useW()
  const [hemi, setHemi] = useState<'N' | 'S'>('N')
  const [fr, setFr] = useState(1)
  const [on, setOn] = useAmbient()
  const t = useClock(on)
  const alpha = INFLOW[fr]
  const system = (kind: 'L' | 'H', ox: number) => {
    // Screen angle grows clockwise; NH lows turn anticlockwise.
    const dir = (kind === 'L') === (hemi === 'N') ? -1 : 1
    const N = 22
    const dots: ReactNode[] = []
    for (let i = 0; i < N; i++) {
      const th0 = (i * 137.5 * DEG) % (2 * Math.PI)
      let r: number
      let th: number
      let op = 0.9
      if (alpha === 0) {
        r = 20 + ((i * 37) % 75)
        th = th0 + dir * t * (40 / r)
      } else {
        const p = mod(t * 0.07 * (alpha / 15) + i / N, 1)
        r = kind === 'L' ? 95 - 83 * p : 12 + 83 * p
        const ta = Math.tan(alpha * DEG)
        th = th0 + dir * (kind === 'L' ? Math.log(95 / r) : Math.log(r / 12)) / ta
        op = Math.min(1, p * 6, (1 - p) * 6)
      }
      dots.push(<circle key={i} cx={ox + r * Math.cos(th)} cy={100 + r * Math.sin(th)} r={3} fill="#0ea5e9" opacity={op} />)
    }
    const arrows = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
      const ph = (k * 45 + 22.5) * DEG
      const tx = -Math.sin(ph) * dir
      const ty = Math.cos(ph) * dir
      const rs = kind === 'L' ? -1 : 1
      const a = alpha * DEG
      const vx = tx * Math.cos(a) + rs * Math.cos(ph) * Math.sin(a)
      const vy = ty * Math.cos(a) + rs * Math.sin(ph) * Math.sin(a)
      const to = mod(Math.atan2(vx, -vy) / DEG, 360)
      const x = ox + 62 * Math.cos(ph) - (Math.sin(to * DEG) * 16) / 2
      const y = 100 + 62 * Math.sin(ph) + (Math.cos(to * DEG) * 16) / 2
      return <Arrow key={k} x={x} y={y} toDeg={to} len={16} color="#0f172a" width={2} head={5} />
    })
    return (
      <g>
        {[25, 50, 75, 95].map((r, i) => (
          <circle key={r} cx={ox} cy={100} r={r} fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray={i === 3 ? '3 3' : undefined} />
        ))}
        {dots}
        {arrows}
        <Centre kind={kind} x={ox} y={98} />
        <text x={ox} y={212} textAnchor="middle" fontSize={12} fontWeight={600} fill="#334155">
          {kind === 'L' ? u.pressure.low : u.pressure.high}
        </text>
      </g>
    )
  }
  return (
    <Frame title={u.pressure.title}>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <HemiPills value={hemi} onChange={setHemi} />
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">{u.pressure.friction}</span>
          <Pills items={[0, 1, 2]} value={fr} onChange={setFr} label={(i) => u.pressure.frictionOpts[i]} />
        </div>
        <PlayButton on={on} set={setOn} />
      </div>
      <Wide min={360}>
        <svg viewBox="0 0 440 220" className="w-full rounded-lg bg-sky-50">
          {system('L', 110)}
          {system('H', 330)}
        </svg>
      </Wide>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{u.pressure.note}</p>
    </Frame>
  )
}

/* ---------------- Buys Ballot ---------------- */

export const lowBearing = (from: number, hemi: 'N' | 'S') => mod(from + (hemi === 'N' ? 90 : -90), 360)

function BuysWidget() {
  const { u } = useW()
  const [from, setFrom] = useState(225)
  const [hemi, setHemi] = useState<'N' | 'S'>('N')
  const low = lowBearing(from, hemi)
  const C = 150
  const at = (b: number, r: number) => ({ x: C + r * Math.sin(b * DEG), y: C - r * Math.cos(b * DEG) })
  const lp = at(low, 105)
  const hp = at(low + 180, 105)
  const wStart = at(from, 135)
  const facing = mod(from + 180, 360)
  return (
    <Frame title={u.buys.title}>
      <div className="mb-3 grid gap-3 sm:grid-cols-2 sm:items-end">
        <Slider label={u.buys.windFrom} value={from} min={0} max={355} step={5} onChange={setFrom} show={`${String(from).padStart(3, '0')}° (${u.compass[compass8(from)]})`} />
        <HemiPills value={hemi} onChange={setHemi} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,18rem)_1fr] sm:items-center">
        <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-xs">
          <circle cx={C} cy={C} r={128} fill="#f1f7fb" stroke="#cbd5e1" />
          {u.compass.map((c, i) =>
            i % 2 === 0 ? (
              <text key={c} x={at(i * 45, 140).x} y={at(i * 45, 140).y + 4} fontSize={11} fontWeight={700} textAnchor="middle" fill="#475569">
                {c}
              </text>
            ) : null,
          )}
          <Arrow x={wStart.x} y={wStart.y} toDeg={facing} len={95} color="#0ea5e9" width={4} head={10} />
          <g transform={`translate(${C} ${C}) rotate(${facing})`}>
            <ellipse cx={0} cy={0} rx={16} ry={7} fill="#f59e0b" stroke="#0f172a" />
            <circle cx={0} cy={0} r={6} fill="#fde68a" stroke="#0f172a" />
            <path d="M-3 -6 L0 -11 L3 -6 Z" fill="#0f172a" />
          </g>
          <Centre kind="L" x={lp.x} y={lp.y - 4} />
          <Centre kind="H" x={hp.x} y={hp.y - 4} />
        </svg>
        <div className="space-y-2">
          <Info title={hemi === 'N' ? u.nh : u.sh}>{hemi === 'N' ? u.buys.rule : u.buys.ruleS}</Info>
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">{fill(u.buys.low, { b: `${String(Math.round(low)).padStart(3, '0')}° (${u.compass[compass8(low)]})` })}</p>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Isobar spacing ---------------- */

function IsobarsWidget() {
  const { u, n } = useW()
  const [nm, setNm] = useState(120)
  const [lat, setLat] = useState(50)
  const geo = spacingToKn(nm, lat)
  const surf = geo * 0.7
  const f = beaufort(surf)
  const gap = Math.max(18, nm * 0.55)
  const yA = 100 - gap / 2
  const yB = 100 + gap / 2
  return (
    <Frame title={u.isobars.title}>
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <Slider label={u.isobars.spacing} value={nm} min={30} max={300} step={10} onChange={setNm} show={`${nm} nm`} />
        <Slider label={u.isobars.lat} value={lat} min={20} max={70} step={5} onChange={setLat} show={`${lat}°`} />
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_15rem] md:items-center">
        <Wide min={320}>
          <svg viewBox="0 0 420 200" className="w-full rounded-lg" style={{ background: '#f1f7fb' }}>
            <path d={`M10 ${yA} C140 ${yA - 8} 280 ${yA + 8} 410 ${yA}`} fill="none" stroke="#475569" strokeWidth={1.6} />
            <path d={`M10 ${yB} C140 ${yB - 8} 280 ${yB + 8} 410 ${yB}`} fill="none" stroke="#475569" strokeWidth={1.6} />
            <text x={20} y={yA - 5} fontSize={10} fill="#334155">
              1004
            </text>
            <text x={20} y={yB - 5} fontSize={10} fill="#334155">
              1008
            </text>
            <Centre kind="L" x={380} y={Math.max(14, yA - 26)} />
            <line x1={300} y1={yA} x2={300} y2={yB} stroke="#0369a1" strokeDasharray="3 3" />
            <text x={306} y={100 + 3} fontSize={10} fill="#0369a1">
              {nm} nm
            </text>
            <Arrow x={110} y={100} toDeg={90} len={Math.min(140, 30 + geo * 1.6)} color="#94a3b8" width={3} head={8} />
            <Arrow x={110} y={100} toDeg={75} len={Math.min(130, 22 + surf * 1.6)} color="#0ea5e9" width={4} head={9} />
          </svg>
        </Wide>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">{u.isobars.geo}</span>
            <strong className="font-mono">{n(geo, 0)} kn</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-sky-700 dark:text-sky-300">{u.isobars.surface}</span>
            <strong className="font-mono">{n(surf, 0)} kn</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{u.isobars.force}</span>
            <strong>
              F{f} · {u.beaufort.names[f]}
            </strong>
          </div>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{u.isobars.note}</p>
    </Frame>
  )
}

/* ---------------- Cloud atlas ---------------- */

const KM = (km: number) => 330 - km * 26
const CLOUD_PLACES: Record<CloudId, { x: number; base: number; w: number; h: number }> = {
  ci: { x: 30, base: 9.6, w: 110, h: 40 },
  cc: { x: 170, base: 8.4, w: 100, h: 44 },
  cs: { x: 300, base: 8.6, w: 140, h: 48 },
  ac: { x: 30, base: 3.4, w: 105, h: 48 },
  as: { x: 170, base: 3.3, w: 125, h: 52 },
  ns: { x: 320, base: 0.7, w: 120, h: 78 },
  sc: { x: 110, base: 0.9, w: 100, h: 32 },
  st: { x: 222, base: 0.5, w: 90, h: 22 },
  cu: { x: 462, base: 0.8, w: 70, h: 62 },
  cb: { x: 540, base: 0.8, w: 95, h: 262 },
}

function CloudsWidget() {
  const { u } = useW()
  const c = u.clouds
  const [sel, setSel] = useState<CloudId>('ci')
  return (
    <Frame title={c.title}>
      <Wide min={420}>
        <svg viewBox="0 0 640 360" className="w-full rounded-lg">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e6fb8" />
              <stop offset="100%" stopColor="#9fd0f5" />
            </linearGradient>
          </defs>
          <rect width={640} height={360} fill="url(#skyGrad)" />
          {[
            [6, 12, c.bands.high],
            [2, 6, c.bands.mid],
            [0, 2, c.bands.low],
          ].map(([a, b, name]) => (
            <g key={String(name)}>
              <line x1={0} y1={KM(a as number)} x2={455} y2={KM(a as number)} stroke="#fff" strokeOpacity={0.5} strokeDasharray="5 5" />
              <text x={6} y={KM(b as number) + 13} fontSize={10} fill="#fff" fontWeight={600}>
                {name}
              </text>
            </g>
          ))}
          <line x1={455} y1={18} x2={455} y2={330} stroke="#fff" strokeOpacity={0.5} />
          <text x={548} y={14} fontSize={10} fill="#fff" fontWeight={600} textAnchor="middle">
            {c.bands.vertical}
          </text>
          <rect y={330} width={640} height={30} fill="#1d4e89" />
          {CLOUD_IDS.map((id) => {
            const p = CLOUD_PLACES[id]
            const top = KM(p.base) - p.h
            return (
              <g key={id} onClick={() => setSel(id)} className="cursor-pointer">
                <CloudShape id={id} x={p.x} top={top} w={p.w} h={p.h} />
                <rect x={p.x - 4} y={top - 4} width={p.w + 8} height={p.h + 8} fill="transparent" stroke={sel === id ? '#facc15' : 'none'} strokeWidth={2} strokeDasharray="5 3" rx={6} />
                <text x={p.x + p.w / 2} y={Math.min(KM(p.base) + 11, 326)} fontSize={10} textAnchor="middle" fontWeight={700} fill="#0f172a" {...halo}>
                  {id.charAt(0).toUpperCase() + id.slice(1)}
                </text>
              </g>
            )
          })}
          <BoatIcon x={600} y={343} hdg={90} s={0.9} />
          {[0, 2, 6, 10].map((km) => (
            <text key={km} x={452} y={KM(km) - 2} fontSize={9} fill="#fff" textAnchor="end">
              {km} km
            </text>
          ))}
        </svg>
      </Wide>
      <div className="mt-3 space-y-2">
        <Pills items={CLOUD_IDS} value={sel} onChange={setSel} label={(id) => c.info[id].name} />
        <Info title={c.info[sel].name}>{c.info[sel].text}</Info>
        <p className="text-xs text-slate-500 dark:text-slate-400">{c.hint}</p>
      </div>
    </Frame>
  )
}

/* ---------------- Chart symbols and wind barbs ---------------- */

function SymbolArt({ id }: { id: SymbolId }) {
  const line = [
    { x: 10, y: 34 },
    { x: 60, y: 28 },
    { x: 110, y: 34 },
  ]
  if (id === 'cold' || id === 'warm' || id === 'occluded' || id === 'stationary' || id === 'trough') return <FrontLine kind={id} pts={line} side={1} />
  if (id === 'isobar')
    return (
      <g>
        <path d="M8 40 C40 10 80 10 112 40" fill="none" stroke="#475569" strokeWidth={1.5} />
        <text x={60} y={22} fontSize={10} textAnchor="middle" fill="#334155" {...halo}>
          1012
        </text>
      </g>
    )
  return (
    <g>
      <Centre kind={id === 'high' ? 'H' : 'L'} x={60} y={20} value={id === 'high' ? 1032 : 984} />
    </g>
  )
}

export function Barb({ x, y, from, kn }: { x: number; y: number; from: number; kn: number }) {
  const ux = Math.sin(from * DEG)
  const uy = -Math.cos(from * DEG)
  const L = 34
  const px = -uy
  const py = ux
  let rest = Math.round(kn / 5) * 5
  const parts: ReactNode[] = []
  let s = L
  let k = 0
  while (rest >= 50) {
    const a = { x: x + ux * s, y: y + uy * s }
    const b = { x: x + ux * (s - 7), y: y + uy * (s - 7) }
    parts.push(<path key={k++} d={`M${a.x} ${a.y} L${a.x + px * 12 - ux * 3} ${a.y + py * 12 - uy * 3} L${b.x} ${b.y} Z`} fill="#0f172a" />)
    s -= 9
    rest -= 50
  }
  while (rest >= 10) {
    const a = { x: x + ux * s, y: y + uy * s }
    parts.push(<line key={k++} x1={a.x} y1={a.y} x2={a.x + px * 12 + ux * 4} y2={a.y + py * 12 + uy * 4} stroke="#0f172a" strokeWidth={1.6} />)
    s -= 5
    rest -= 10
  }
  if (rest >= 5) {
    if (s === L) s -= 5
    const a = { x: x + ux * s, y: y + uy * s }
    parts.push(<line key={k++} x1={a.x} y1={a.y} x2={a.x + px * 6 + ux * 2} y2={a.y + py * 6 + uy * 2} stroke="#0f172a" strokeWidth={1.6} />)
  }
  return (
    <g>
      <circle cx={x} cy={y} r={3.5} fill="none" stroke="#0f172a" strokeWidth={1.4} />
      <line x1={x + ux * 3.5} y1={y + uy * 3.5} x2={x + ux * L} y2={y + uy * L} stroke="#0f172a" strokeWidth={1.6} />
      {parts}
    </g>
  )
}

function SymbolsWidget() {
  const { u } = useW()
  const s = u.symbols
  const [sel, setSel] = useState<SymbolId>('cold')
  return (
    <Frame title={s.title}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SYMBOL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSel(id)}
            className={`rounded-lg border bg-white p-1 text-xs font-medium dark:bg-white/90 ${sel === id ? 'border-sky-600 ring-2 ring-sky-500' : 'border-slate-200'}`}
          >
            <svg viewBox="0 0 120 50" className="w-full">
              <SymbolArt id={id} />
            </svg>
            <span className="text-slate-800">{s.items[id].name}</span>
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Info title={s.items[sel].name}>{s.items[sel].text}</Info>
      </div>
      <div className="mt-4 text-sm font-semibold text-navy-900 dark:text-sky-100">{s.barbs}</div>
      <Wide min={340}>
        <svg viewBox="0 0 440 90" className="mt-1 w-full rounded-lg bg-white">
          {[5, 10, 25, 50, 65].map((kn, i) => (
            <g key={kn}>
              <Barb x={40 + i * 88} y={60} from={270} kn={kn} />
              <text x={40 + i * 88 - 10} y={84} fontSize={11} textAnchor="middle" fill="#334155">
                {kn} kn
              </text>
            </g>
          ))}
        </svg>
      </Wide>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.barbsText}</p>
    </Frame>
  )
}

/* ---------------- A depression passes ---------------- */

const DEP_VIEW: ChartView = { x0: 0, x1: 16, y0: 0, y1: 9, k: 40 }

function PassageWidget() {
  const { u, n } = useW()
  const pu = u.passage
  const [t, setT] = useState(6)
  const [on, setOn] = useState(false)
  // Advance the time while playing: 4 hours per second.
  useEffect(() => {
    if (!on) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      setT((v) => Math.min(DEP_HOURS, v + dt * 4))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [on])
  useEffect(() => {
    if (on && t >= DEP_HOURS) setOn(false)
  }, [on, t])
  const tq = Math.round(t * 4) / 4
  const field = useMemo(() => depField(tq), [tq])
  const st = depState(tq)
  const px = toPx(DEP_VIEW)
  const [ox, oy] = DEP_OBS
  const [cx, cy] = depCentre(tq)
  const z = pu.zones[st.zone]
  const ti = tendencyIndex(st.tendency)
  const tend = ti === 0 ? pu.tendency[0] : `${st.tendency > 0 ? pu.rising : pu.falling} ${pu.tendency[ti]}`.trim()
  const series = useMemo(() => Array.from({ length: DEP_HOURS * 2 + 1 }, (_, i) => depState(i / 2).p), [])
  const pMin = Math.min(...series)
  const pMax = Math.max(...series)
  const bx = (h: number) => 30 + (h / DEP_HOURS) * 280
  const by = (p: number) => 10 + ((pMax - p) / (pMax - pMin || 1)) * 80
  const toggle = (v: boolean) => {
    if (v && t >= DEP_HOURS) setT(0)
    setOn(v)
  }
  // Cross-section geometry along the boat's latitude.
  const wx = (frontXAt(DEP_WARM, oy - cy) ?? 99) + cx
  const kx = (frontXAt(DEP_COLD, oy - cy) ?? -99) + cx
  const sx = (x: number) => (x - DEP_VIEW.x0) * 40
  const G = 130
  const TOP = 24
  const rows: [string, ReactNode][] = [
    [pu.labels.zone, <strong key="z">{z.name}</strong>],
    [pu.labels.pressure, `${n(st.p, 1)} hPa`],
    [pu.labels.tendency, `${tend} (${st.tendency > 0 ? '+' : ''}${n(st.tendency, 1)} hPa / 3 h)`],
    [pu.labels.wind, `${u.compass[compass8(st.wind.from)]} ${n(st.wind.kn, 0)} kn · F${beaufort(st.wind.kn)}`],
    [pu.labels.sky, z.sky],
    [pu.labels.weather, z.weather],
    [pu.labels.vis, z.vis],
    [pu.labels.temp, z.temp],
  ]
  const op = px(ox, oy)
  return (
    <Frame title={pu.title}>
      <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider
          label={pu.time}
          value={tq}
          min={0}
          max={DEP_HOURS}
          step={0.5}
          onChange={(v) => {
            setOn(false)
            setT(v)
          }}
          show={fill(pu.hours, { h: n(tq, 1) })}
        />
        <PlayButton on={on} set={toggle} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-3">
          <Wide min={420}>
            <svg viewBox="0 0 640 360" className="w-full rounded-lg border border-slate-300 dark:border-white/20" style={{ background: '#f1f7fb' }}>
              <Isobars field={field} view={DEP_VIEW} />
              {field.fronts.map((f, i) => (
                <FrontLine key={i} kind={f.kind} side={f.side} pts={f.pts.map(([x, y]) => px(x, y))} />
              ))}
              {cx > -0.3 && <Centre kind="L" x={px(cx, cy).x} y={px(cx, cy).y} value={pressureAt(field, cx, cy)} />}
              <BoatIcon x={op.x} y={op.y} hdg={0} />
              <WindArrow x={op.x + 26} y={op.y - 22} from={st.wind.from} len={30} color="#0369a1" width={2.4} />
            </svg>
          </Wide>
          <div>
            <div className="text-xs font-semibold text-slate-500">{pu.section}</div>
            <Wide min={420}>
              <svg viewBox="0 0 640 150" className="w-full rounded-lg" style={{ background: '#dbeafe' }}>
                <path d={`M${sx(kx)} ${G} L${sx(wx)} ${G} L${sx(wx + 3.6)} ${TOP} L${sx(kx - 0.7)} ${TOP} Z`} fill="#fecaca" opacity={0.75} />
                <line x1={sx(wx)} y1={G} x2={sx(wx + 3.6)} y2={TOP} stroke="#dc2626" strokeWidth={2.5} />
                <line x1={sx(kx)} y1={G} x2={sx(kx - 0.7)} y2={TOP} stroke="#2563eb" strokeWidth={2.5} />
                <CloudShape id="ns" x={sx(wx) - 2} top={G - 68} w={sx(1.3)} h={60} />
                <CloudShape id="as" x={sx(wx + 1.2)} top={G - 82} w={sx(1.2)} h={28} />
                <CloudShape id="cs" x={sx(wx + 2.3)} top={TOP + 2} w={sx(1)} h={22} />
                <CloudShape id="ci" x={sx(wx + 3.3)} top={TOP - 6} w={sx(1)} h={24} />
                <CloudShape id="st" x={sx(kx + 0.3)} top={G - 30} w={Math.max(0, sx(wx - kx - 0.8))} h={18} />
                <CloudShape id="cb" x={sx(kx - 0.55)} top={TOP} w={sx(0.8)} h={G - TOP - 18} />
                <CloudShape id="cu" x={sx(kx - 2.4)} top={G - 50} w={sx(0.6)} h={32} />
                <CloudShape id="cu" x={sx(kx - 3.8)} top={G - 44} w={sx(0.5)} h={26} />
                <rect y={G} width={640} height={20} fill="#1d4e89" />
                <BoatIcon x={sx(ox)} y={G + 4} hdg={90} s={0.8} />
                <text x={sx(wx) + 6} y={G - 4} fontSize={9} fill="#b91c1c" {...halo}>
                  {u.symbols.items.warm.name}
                </text>
                <text x={sx(kx) - 6} y={G - 4} fontSize={9} fill="#1d4ed8" textAnchor="end" {...halo}>
                  {u.symbols.items.cold.name}
                </text>
              </svg>
            </Wide>
          </div>
        </div>
        <div className="space-y-3">
          <dl className="space-y-1 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-2 border-b border-slate-200 pb-1 dark:border-white/10">
                <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <div className="text-xs font-semibold text-slate-500">{pu.barograph}</div>
            <svg viewBox="0 0 320 110" className="w-full rounded-lg bg-white">
              {[pMin, (pMin + pMax) / 2, pMax].map((p) => (
                <g key={p}>
                  <line x1={30} x2={310} y1={by(p)} y2={by(p)} stroke="#e2e8f0" />
                  <text x={26} y={by(p) + 3} fontSize={8} textAnchor="end" fill="#64748b">
                    {Math.round(p)}
                  </text>
                </g>
              ))}
              <polyline points={series.map((p, i) => `${bx(i / 2)},${by(p)}`).join(' ')} fill="none" stroke="#0369a1" strokeWidth={1.8} />
              <line x1={bx(tq)} x2={bx(tq)} y1={8} y2={92} stroke="#f59e0b" strokeWidth={2} />
              <text x={170} y={106} fontSize={8} textAnchor="middle" fill="#64748b">
                0 – {DEP_HOURS} h
              </text>
            </svg>
          </div>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Sea breeze ---------------- */

export function seaBreeze(hour: number, gradient: number) {
  const land = hour >= 7 && hour <= 19 ? 15 + 11 * Math.sin((Math.PI * (hour - 7)) / 12) : 15 - 4 * Math.min(1, mod(hour - 19, 24) / 5)
  const sea = 16
  const dT = land - sea
  let sb = dT > 2 ? Math.min(15, (dT - 2) * 1.6) : 0
  if (gradient < 0) sb *= Math.max(0, Math.min(1, 1 + gradient / 14))
  let lb = dT < -2 ? Math.min(6, (-dT - 2) * 2.5) : 0
  if (gradient > 0) lb *= Math.max(0, Math.min(1, 1 - gradient / 8))
  const net = gradient + sb - lb
  return { land, sea, sb, lb, net, state: sb > 1.5 ? ('sb' as const) : lb > 1 ? ('lb' as const) : ('none' as const) }
}

function SeaBreezeWidget() {
  const { u, n } = useW()
  const s = u.seabreeze
  const [hour, setHour] = useState(14)
  const [grad, setGrad] = useState(-4)
  const [on, setOn] = useAmbient()
  const t = useClock(on)
  const r = seaBreeze(hour, grad)
  const day = hour >= 6.5 && hour <= 19.5
  const sunX = 60 + ((hour - 6) / 14) * 520
  const sunY = 70 - Math.sin((Math.PI * (hour - 6)) / 14) * 50
  const loop = r.state !== 'none'
  const strength = r.state === 'sb' ? r.sb : r.lb
  // Loop path: surface towards the land for a sea breeze, reversed for a land breeze.
  const d = r.state === 'sb' ? 'M150 200 L470 200 Q520 200 520 160 L520 130 Q520 100 470 100 L150 100 Q110 100 110 130 L110 160 Q110 200 150 200' : 'M470 200 L150 200 Q110 200 110 160 L110 130 Q110 100 150 100 L470 100 Q520 100 520 130 L520 160 Q520 200 470 200'
  const res = Math.abs(r.net) < 2 ? s.calm : r.net > 0 ? s.onshore : s.offshore
  return (
    <Frame title={s.title}>
      <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Slider label={s.time} value={hour} min={0} max={23.5} step={0.5} onChange={setHour} show={`${String(Math.floor(hour)).padStart(2, '0')}:${hour % 1 ? '30' : '00'}`} />
        <Slider label={s.gradient} value={grad} min={-20} max={15} step={1} onChange={setGrad} show={`${grad > 0 ? '+' : ''}${grad} kn`} />
        <PlayButton on={on} set={setOn} />
      </div>
      <Wide min={400}>
        <svg viewBox="0 0 640 260" className="w-full rounded-lg">
          <rect width={640} height={230} fill={day ? '#bfdbfe' : '#1e293b'} />
          {day ? <circle cx={sunX} cy={sunY + 20} r={16} fill="#facc15" /> : <circle cx={560} cy={40} r={12} fill="#e2e8f0" />}
          <rect y={210} width={330} height={50} fill="#1d4e89" />
          <path d="M320 210 L340 200 L640 196 L640 260 L320 260 Z" fill={day ? '#a3a3a3' : '#57534e'} />
          <path d="M320 210 L340 200 L640 196" fill="none" stroke="#e7c78a" strokeWidth={4} />
          {loop && (
            <path d={d} fill="none" stroke={r.state === 'sb' ? '#0ea5e9' : '#a78bfa'} strokeWidth={2 + strength / 3} strokeDasharray="14 10" strokeDashoffset={-t * 40} opacity={0.9} />
          )}
          {r.state === 'sb' && r.sb > 4 && <CloudShape id="cu" x={470} top={40} w={70} h={56} />}
          <text x={20} y={250} fontSize={12} fill="#fff" fontWeight={600}>
            {s.sea} {n(r.sea, 0)}°C
          </text>
          <text x={620} y={250} fontSize={12} fill="#fff" fontWeight={600} textAnchor="end">
            {s.land} {n(r.land, 0)}°C
          </text>
          {Math.abs(r.net) >= 2 && <Arrow x={r.net > 0 ? 220 : 400} y={180} toDeg={r.net > 0 ? 90 : 270} len={Math.min(180, 20 + Math.abs(r.net) * 8)} color="#f97316" width={5} head={11} />}
          {grad !== 0 && <Arrow x={grad > 0 ? 40 : 600} y={24} toDeg={grad > 0 ? 90 : 270} len={Math.min(120, 14 + Math.abs(grad) * 5)} color="#475569" width={2} head={6} />}
        </svg>
      </Wide>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Info title={r.state === 'sb' ? s.sb : r.state === 'lb' ? s.lb : s.none}>
          {s.result}: <strong>{Math.abs(r.net) < 2 ? s.calm : `${n(Math.abs(r.net), 0)} kn ${res}`}</strong>
        </Info>
        <p className="text-sm text-slate-600 dark:text-slate-300">{s.note}</p>
      </div>
    </Frame>
  )
}

/* ---------------- Beaufort ---------------- */

function BeaufortWidget() {
  const { u, n } = useW()
  const b = u.beaufort
  const [f, setF] = useState(4)
  const [on, setOn] = useAmbient()
  const t = useClock(on)
  return (
    <Frame title={b.title}>
      <div className="mb-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Slider label={b.force} value={f} min={0} max={12} step={1} onChange={setF} show={`F${f} · ${b.names[f]}`} />
        <PlayButton on={on} set={setOn} />
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
        <SeaScene force={f} t={t} />
        <div className="space-y-2 text-sm">
          <div className="text-lg font-bold text-navy-900 dark:text-white">
            F{f} – {b.names[f]}
          </div>
          <div>
            {b.kn}: <strong className="font-mono">{beaufortRange(f)} kn</strong>
          </div>
          <div>
            {b.wave}: <strong className="font-mono">{f === 0 ? '0' : n(BEAUFORT_WAVE[f], 1)} m</strong>
          </div>
          <p className="text-slate-600 dark:text-slate-300">{b.sea[f]}</p>
          <Info title="⛵">{b.action[f]}</Info>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {[b.force, '', b.kn, b.wave].map((h, i) => (
                <th key={i} className="border-b-2 border-slate-300 px-2 py-1 text-left dark:border-white/20">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BEAUFORT_KN.map((_, i) => (
              <tr key={i} onClick={() => setF(i)} className={`cursor-pointer ${i === f ? 'bg-amber-100 font-semibold dark:bg-amber-400/15' : 'odd:bg-slate-50 dark:odd:bg-white/5'}`}>
                <td className="px-2 py-0.5">F{i}</td>
                <td className="px-2 py-0.5">{b.names[i]}</td>
                <td className="px-2 py-0.5 font-mono">{beaufortRange(i)} kn</td>
                <td className="px-2 py-0.5 font-mono">{i === 0 ? '0' : n(BEAUFORT_WAVE[i], 1)} m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  )
}

/* ---------------- Tropical revolving storm ---------------- */

export type TrsPos = 'dangerous' | 'navigable' | 'path'

export function TrsScene({ hemi, rot, boats, sel, onPick }: { hemi: 'N' | 'S'; rot: number; boats: TrsPos[]; sel?: TrsPos | null; onPick?: (p: TrsPos) => void }) {
  const { u } = useW()
  const C = { x: 180, y: 170 }
  const R = 120
  const dangerRight = hemi === 'N'
  const pos: Record<TrsPos, { x: number; y: number }> = {
    dangerous: { x: C.x + (dangerRight ? 78 : -78), y: C.y - 10 },
    navigable: { x: C.x + (dangerRight ? -78 : 78), y: C.y - 10 },
    path: { x: C.x, y: C.y - 95 },
  }
  return (
    <svg viewBox="0 0 360 320" className="mx-auto w-full max-w-md rounded-lg" style={{ background: '#0c4a6e' }}>
      <TrsDefs />
      <defs>
        <clipPath id="trsClip">
          <circle cx={C.x} cy={C.y} r={R + 18} />
        </clipPath>
      </defs>
      <g clipPath="url(#trsClip)">
        <rect x={dangerRight ? C.x : C.x - R - 18} y={C.y - R - 18} width={R + 18} height={2 * R + 36} fill="#dc2626" opacity={0.28} />
        <rect x={dangerRight ? C.x - R - 18 : C.x} y={C.y - R - 18} width={R + 18} height={2 * R + 36} fill="#16a34a" opacity={0.25} />
      </g>
      <StormArt cx={C.x} cy={C.y} r={R} hemi={hemi} rot={rot} />
      <Arrow x={C.x} y={C.y + R + 10} toDeg={0} len={2 * R + 4} color="#fde68a" width={2} head={10} />
      <text x={C.x + 6} y={22} fontSize={10} fill="#fde68a">
        {u.trs.track}
      </text>
      <text x={dangerRight ? 350 : 10} y={312} fontSize={11} fontWeight={700} fill="#fecaca" textAnchor={dangerRight ? 'end' : 'start'}>
        {u.trs.dangerous}
      </text>
      <text x={dangerRight ? 10 : 350} y={312} fontSize={11} fontWeight={700} fill="#bbf7d0" textAnchor={dangerRight ? 'start' : 'end'}>
        {u.trs.navigable}
      </text>
      {boats.map((b) => (
        <g key={b} onClick={() => onPick?.(b)} className={onPick ? 'cursor-pointer' : undefined}>
          <circle cx={pos[b].x} cy={pos[b].y} r={18} fill="#fff" opacity={sel === b ? 0.5 : 0.15} />
          <BoatIcon x={pos[b].x} y={pos[b].y} hdg={0} />
        </g>
      ))}
    </svg>
  )
}

function TrsWidget() {
  const { u } = useW()
  const [hemi, setHemi] = useState<'N' | 'S'>('N')
  const [sel, setSel] = useState<TrsPos>('dangerous')
  const [on, setOn] = useAmbient()
  const t = useClock(on)
  const advice = hemi === 'N' ? u.trs.advice : u.trs.adviceS
  const name = { dangerous: u.trs.dangerous, navigable: u.trs.navigable, path: u.trs.path }
  return (
    <Frame title={u.trs.title}>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <HemiPills value={hemi} onChange={setHemi} />
        <PlayButton on={on} set={setOn} />
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center">
        <TrsScene hemi={hemi} rot={t * 40 * (hemi === 'N' ? -1 : 1)} boats={['dangerous', 'navigable', 'path']} sel={sel} onPick={setSel} />
        <div className="space-y-2">
          <Pills items={['dangerous', 'navigable', 'path'] as const} value={sel} onChange={setSel} label={(p) => name[p]} />
          <Info title={name[sel]}>{advice[sel]}</Info>
          <p className="text-xs text-slate-500 dark:text-slate-400">{u.trs.hint}</p>
        </div>
      </div>
    </Frame>
  )
}

/* ---------------- Forecast decoder ---------------- */

export function parseSample(s: string): ({ text: string } | { term: TermId; text: string })[] {
  const out: ({ text: string } | { term: TermId; text: string })[] = []
  const re = /\[\[(\w+)(?:\|([^\]]+))?\]\]/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ text: s.slice(last, m.index) })
    out.push({ term: m[1] as TermId, text: m[2] ?? m[1] })
    last = m.index + m[0].length
  }
  if (last < s.length) out.push({ text: s.slice(last) })
  return out
}

function ForecastWidget() {
  const { u } = useW()
  const f = u.forecast
  const [sel, setSel] = useState<TermId>('later')
  const lines = f.sample.split('\n')
  return (
    <Frame title={f.title}>
      <div className="rounded-lg bg-navy-950 p-3 font-mono text-[13px] leading-relaxed text-sky-100">
        {lines.map((line, i) => (
          <p key={i} className={i ? 'mt-2' : ''}>
            {parseSample(line).map((part, j) =>
              'term' in part ? (
                <button key={j} type="button" onClick={() => setSel(part.term)} className={`rounded px-0.5 underline decoration-dotted underline-offset-2 ${sel === part.term ? 'bg-amber-400 text-navy-950' : 'text-amber-300 hover:bg-white/10'}`}>
                  {part.text}
                </button>
              ) : (
                <span key={j}>{part.text}</span>
              ),
            )}
          </p>
        ))}
      </div>
      <div className="mt-3">
        <Info title={f.hint}>{f.terms[sel]}</Info>
      </div>
    </Frame>
  )
}

export function WeatherWidget({ id }: { id: WWidget }) {
  switch (id) {
    case 'globe':
      return <GlobeWidget />
    case 'pressure':
      return <PressureWidget />
    case 'buys':
      return <BuysWidget />
    case 'isobars':
      return <IsobarsWidget />
    case 'clouds':
      return <CloudsWidget />
    case 'symbols':
      return <SymbolsWidget />
    case 'passage':
      return <PassageWidget />
    case 'seabreeze':
      return <SeaBreezeWidget />
    case 'beaufort':
      return <BeaufortWidget />
    case 'trs':
      return <TrsWidget />
    case 'forecast':
      return <ForecastWidget />
  }
}
