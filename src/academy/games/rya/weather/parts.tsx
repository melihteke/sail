import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useI18n, type Lang } from '../../../i18n'
import { BEAUFORT_WAVE, contours, mod, pressureAt, type Field, type FrontKind } from './field'
import { num, weatherTexts, type CloudId, type WeatherUi } from './text'

export const DEG = Math.PI / 180

export function useW(): { u: WeatherUi; lang: Lang; n: (v: number, d?: number) => string } {
  const { lang } = useI18n()
  return { u: weatherTexts[lang].ui, lang, n: (v, d = 1) => num(v, lang, d) }
}

export function useReducedMotion(): boolean {
  const [r, setR] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setR(m.matches)
    const on = () => setR(m.matches)
    m.addEventListener?.('change', on)
    return () => m.removeEventListener?.('change', on)
  }, [])
  return r
}

/** Seconds of animation time; advances only while `running`. */
export function useClock(running: boolean, speed = 1): number {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      setT((v) => v + dt * speed)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running, speed])
  return t
}

/** Ambient animation that starts on its own unless the user prefers reduced motion. */
export function useAmbient(): [boolean, (v: boolean) => void] {
  const reduced = useReducedMotion()
  const [on, setOn] = useState<boolean | null>(null)
  return [on ?? !reduced, setOn]
}

export function Slider({ label, value, min, max, step, onChange, show }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; show: string }) {
  return (
    <label className="block text-xs">
      <span className="flex justify-between gap-2 text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-mono font-semibold text-navy-900 dark:text-sky-100">{show}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-sky-600" />
    </label>
  )
}

export function Pills<T extends string | number>({ items, value, onChange, label }: { items: readonly T[]; value: T; onChange: (v: T) => void; label: (v: T) => string }) {
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

export function PlayButton({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  const { u } = useW()
  return (
    <button type="button" className="btn-secondary !px-3 !py-1 text-xs" onClick={() => set(!on)}>
      {on ? `⏸ ${u.pause}` : `▶ ${u.play}`}
    </button>
  )
}

export function HemiPills({ value, onChange }: { value: 'N' | 'S'; onChange: (v: 'N' | 'S') => void }) {
  const { u } = useW()
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{u.hemi}</span>
      <Pills items={['N', 'S'] as const} value={value} onChange={onChange} label={(h) => (h === 'N' ? u.nh : u.sh)} />
    </div>
  )
}

/** Scrolls sideways on narrow screens so drawings keep a readable size. */
export const Wide = ({ children, min = 0 }: { children: ReactNode; min?: number }) => (
  <div className="-mx-1 overflow-x-auto px-1 pb-1">
    <div style={{ minWidth: min || undefined }}>{children}</div>
  </div>
)

export const Info = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  <div className="rounded-lg border-l-4 border-sky-500 bg-white px-3 py-2 text-sm dark:bg-white/5">
    <div className="font-semibold text-navy-900 dark:text-sky-100">{title}</div>
    <div className="mt-0.5 text-slate-700 dark:text-slate-300">{children}</div>
  </div>
)

export const halo = { stroke: '#f8fafc', strokeWidth: 3, paintOrder: 'stroke' as const }

/** Arrow from (x, y) towards compass bearing `toDeg` (screen north up). */
export function Arrow({ x, y, toDeg, len, color, width = 2, head = 6 }: { x: number; y: number; toDeg: number; len: number; color: string; width?: number; head?: number }) {
  const ux = Math.sin(toDeg * DEG)
  const uy = -Math.cos(toDeg * DEG)
  const tx = x + ux * len
  const ty = y + uy * len
  return (
    <g stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x} y1={y} x2={tx} y2={ty} />
      <path d={`M${tx - ux * head - uy * head * 0.6} ${ty - uy * head + ux * head * 0.6} L${tx} ${ty} L${tx - ux * head + uy * head * 0.6} ${ty - uy * head - ux * head * 0.6}`} />
    </g>
  )
}

/** Wind arrow centred on (x, y), blowing FROM `from`. */
export const WindArrow = ({ x, y, from, len, color = '#0f172a', width = 1.6 }: { x: number; y: number; from: number; len: number; color?: string; width?: number }) => {
  const to = mod(from + 180, 360)
  const ux = Math.sin(to * DEG)
  const uy = -Math.cos(to * DEG)
  return <Arrow x={x - (ux * len) / 2} y={y - (uy * len) / 2} toDeg={to} len={len} color={color} width={width} head={Math.min(6, len / 3)} />
}

/* ---------------- Fronts ---------------- */

export const FRONT_COLOR: Record<FrontKind, string> = { cold: '#2563eb', warm: '#dc2626', occluded: '#9333ea', stationary: '#2563eb', trough: '#334155' }

type P = { x: number; y: number }

/** Front line in screen coordinates; `side` +1 puts the symbols on the left of the drawing direction (as on a north-up chart). */
export function FrontLine({ kind, pts, side, size = 7 }: { kind: FrontKind; pts: P[]; side: 1 | -1; size?: number }) {
  const d = `M${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')}`
  const segs = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y))
  const total = segs.reduce((a, b) => a + b, 0)
  const gap = size * 3.4
  const marks: ReactNode[] = []
  let k = 0
  for (let s = gap / 2; s < total - size; s += gap, k++) {
    let acc = 0
    let i = 0
    while (i < segs.length - 1 && acc + segs[i] < s) acc += segs[i++]
    const f = (s - acc) / (segs[i] || 1)
    const a = pts[i]
    const b = pts[i + 1]
    const tx = (b.x - a.x) / (segs[i] || 1)
    const ty = (b.y - a.y) / (segs[i] || 1)
    const c = { x: a.x + f * (b.x - a.x), y: a.y + f * (b.y - a.y) }
    let sd = side
    let shape: 'tri' | 'semi' | null = kind === 'cold' ? 'tri' : kind === 'warm' ? 'semi' : kind === 'occluded' ? (k % 2 ? 'semi' : 'tri') : kind === 'stationary' ? (k % 2 ? 'semi' : 'tri') : null
    let color = FRONT_COLOR[kind]
    if (kind === 'stationary') {
      if (shape === 'semi') {
        color = FRONT_COLOR.warm
        sd = side === 1 ? -1 : 1
      }
    }
    if (!shape) continue
    const nx = ty * sd
    const ny = -tx * sd
    if (shape === 'tri') {
      marks.push(<path key={k} d={`M${c.x - tx * size} ${c.y - ty * size} L${c.x + nx * size * 1.15} ${c.y + ny * size * 1.15} L${c.x + tx * size} ${c.y + ty * size} Z`} fill={color} />)
    } else {
      const r = size * 0.85
      const arc: string[] = []
      for (let j = 0; j <= 10; j++) {
        const t = (j / 10) * Math.PI
        arc.push(`${(c.x - tx * r * Math.cos(t) + nx * r * Math.sin(t)).toFixed(1)} ${(c.y - ty * r * Math.cos(t) + ny * r * Math.sin(t)).toFixed(1)}`)
      }
      marks.push(<path key={k} d={`M${arc.join(' L')} Z`} fill={color} />)
    }
  }
  return (
    <g>
      <path d={d} fill="none" stroke={FRONT_COLOR[kind]} strokeWidth={kind === 'trough' ? 2.5 : 2.6} strokeDasharray={kind === 'trough' ? '7 5' : undefined} strokeLinejoin="round" />
      {kind === 'stationary' && <path d={d} fill="none" stroke={FRONT_COLOR.warm} strokeWidth={2.6} strokeDasharray={`${gap / 2} ${gap / 2}`} />}
      {marks}
    </g>
  )
}

/* ---------------- Isobar chart ---------------- */

export interface ChartView {
  x0: number
  x1: number
  y0: number
  y1: number
  /** Pixels per unit. */
  k: number
}

export const toPx = (v: ChartView) => (x: number, y: number): P => ({ x: (x - v.x0) * v.k, y: (v.y1 - y) * v.k })

export function Isobars({ field, view, step = 4, labels = true }: { field: Field; view: ChartView; step?: number; labels?: boolean }) {
  const px = toPx(view)
  const cs = useMemo(() => {
    const nx = Math.round((view.x1 - view.x0) * 5)
    const ny = Math.round((view.y1 - view.y0) * 5)
    return contours((x, y) => pressureAt(field, x, y), view.x0, view.x1, view.y0, view.y1, nx, ny, step)
  }, [field, view, step])
  return (
    <g>
      {cs.map((c) => {
        const d = c.segs.map(([ax, ay, bx, by]) => {
          const a = px(ax, ay)
          const b = px(bx, by)
          return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`
        })
        // Label on the segment closest to the chart edge so it does not sit on a front or a centre.
        let best = c.segs[0]
        let bestD = Infinity
        for (const s of c.segs) {
          const mx = (s[0] + s[2]) / 2
          const my = (s[1] + s[3]) / 2
          const e = Math.min(mx - view.x0, view.x1 - mx, my - view.y0, view.y1 - my)
          const dd = Math.abs(e - 0.35)
          if (dd < bestD) {
            bestD = dd
            best = s
          }
        }
        const lp = px((best[0] + best[2]) / 2, (best[1] + best[3]) / 2)
        return (
          <g key={c.level}>
            <path d={d.join('')} fill="none" stroke="#475569" strokeWidth={1.1} />
            {labels && (
              <text x={lp.x} y={lp.y + 3} fontSize={9} textAnchor="middle" fill="#334155" {...halo}>
                {c.level}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

export function Centre({ kind, x, y, value }: { kind: 'H' | 'L'; x: number; y: number; value?: number }) {
  const c = kind === 'H' ? '#1d4ed8' : '#b91c1c'
  return (
    <g>
      <text x={x} y={y + 7} fontSize={22} fontWeight={800} textAnchor="middle" fill={c} {...halo}>
        {kind}
      </text>
      {value !== undefined && (
        <text x={x} y={y + 20} fontSize={10} fontWeight={600} textAnchor="middle" fill={c} {...halo}>
          {Math.round(value)}
        </text>
      )}
    </g>
  )
}

/** A whole synoptic chart: isobars, fronts and centre labels. */
export function SynChart({ field, view, centres, children }: { field: Field; view: ChartView; centres: { kind: 'H' | 'L'; x: number; y: number }[]; children?: ReactNode }) {
  const px = toPx(view)
  const W = (view.x1 - view.x0) * view.k
  const H = (view.y1 - view.y0) * view.k
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg border border-slate-300 dark:border-white/20" style={{ background: '#f1f7fb' }}>
      <Isobars field={field} view={view} />
      {field.fronts.map((f, i) => (
        <FrontLine key={i} kind={f.kind} side={f.side} pts={f.pts.map(([x, y]) => px(x, y))} />
      ))}
      {centres.map((c, i) => {
        const p = px(c.x, c.y)
        return <Centre key={i} kind={c.kind} x={p.x} y={p.y} value={pressureAt(field, c.x, c.y)} />
      })}
      {children}
    </svg>
  )
}

/* ---------------- Clouds ---------------- */

/** A cloud drawn in a 100 × 100 box whose bottom edge is the cloud base. */
function CloudBody({ id }: { id: CloudId }) {
  switch (id) {
    case 'ci':
      return (
        <g fill="none" stroke="#fff" strokeLinecap="round" opacity={0.95}>
          <path d="M5 72 Q35 56 60 63 T96 40" strokeWidth={2.4} />
          <path d="M12 42 Q40 28 62 36 T93 14" strokeWidth={2} />
          <path d="M22 94 Q46 80 70 86 T98 70" strokeWidth={1.6} />
          <path d="M40 58 q10 -6 18 -4" strokeWidth={1.2} />
        </g>
      )
    case 'cc':
      return (
        <g fill="#fff" opacity={0.92}>
          {[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3, 4, 5, 6, 7].map((c) => <circle key={`${r}${c}`} cx={8 + c * 12 + (r % 2) * 6} cy={36 + r * 15} r={4.6} />))}
        </g>
      )
    case 'cs':
      return (
        <g>
          <rect x={0} y={24} width={100} height={56} rx={28} fill="#fff" opacity={0.5} />
          <circle cx={62} cy={52} r={7} fill="#fef08a" />
          <circle cx={62} cy={52} r={22} fill="none" stroke="#fde68a" strokeWidth={2} opacity={0.9} />
        </g>
      )
    case 'ac':
      return (
        <g fill="#f8fafc" stroke="#94a3b8" strokeWidth={1}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse key={i} cx={9 + i * 16.4} cy={62 + (i % 2) * 8} rx={9} ry={8} />
          ))}
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={`b${i}`} cx={17 + i * 16.4} cy={80 - (i % 2) * 6} rx={8} ry={7} />
          ))}
        </g>
      )
    case 'as':
      return (
        <g>
          <rect x={0} y={22} width={100} height={66} rx={12} fill="#cbd5e1" opacity={0.92} />
          <circle cx={70} cy={50} r={8} fill="#fef9c3" opacity={0.55} />
        </g>
      )
    case 'ns':
      return (
        <g>
          <g stroke="#64748b" strokeWidth={1.4}>
            {[8, 20, 32, 44, 56, 68, 80, 92].map((x) => (
              <line key={x} x1={x} y1={98} x2={x - 6} y2={135} />
            ))}
          </g>
          <path d="M0 100 L0 30 Q10 10 25 22 Q35 4 52 18 Q66 2 78 20 Q92 8 100 28 L100 100 Z" fill="#475569" />
        </g>
      )
    case 'sc':
      return (
        <g fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1}>
          {[0, 1, 2, 3, 4].map((i) => (
            <ellipse key={i} cx={11 + i * 19.5} cy={70 - (i % 2) * 5} rx={13} ry={17} />
          ))}
        </g>
      )
    case 'st':
      return (
        <g>
          <g fill="#64748b">
            {[10, 25, 40, 55, 70, 85].map((x, i) => (
              <circle key={x} cx={x} cy={108 + (i % 2) * 8} r={1.4} />
            ))}
          </g>
          <rect x={0} y={56} width={100} height={40} rx={8} fill="#94a3b8" opacity={0.9} />
        </g>
      )
    case 'cu':
      return (
        <g fill="#fff" stroke="#cbd5e1" strokeWidth={1.2}>
          <circle cx={30} cy={70} r={22} />
          <circle cx={70} cy={68} r={22} />
          <circle cx={50} cy={50} r={28} />
          <rect x={12} y={70} width={76} height={28} stroke="none" />
          <line x1={12} y1={98} x2={88} y2={98} stroke="#94a3b8" strokeWidth={2} />
        </g>
      )
    case 'cb':
      return (
        <g>
          <g stroke="#64748b" strokeWidth={1.6}>
            {[26, 36, 46, 56, 66, 76].map((x) => (
              <line key={x} x1={x} y1={100} x2={x - 5} y2={124} />
            ))}
          </g>
          <path d="M18 100 L24 60 Q18 40 32 30 L30 18 L2 8 Q50 0 98 8 L70 18 L68 30 Q84 40 78 60 L84 100 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1.2} />
          <path d="M18 100 L21 80 L81 80 L84 100 Z" fill="#475569" />
          <path d="M58 100 L50 112 L56 112 L48 126" fill="none" stroke="#facc15" strokeWidth={2.2} strokeLinejoin="round" />
        </g>
      )
  }
}

/** Draws a cloud inside the box (x, top) – (x + w, top + h). */
export function CloudShape({ id, x, top, w, h }: { id: CloudId; x: number; top: number; w: number; h: number }) {
  return (
    <g transform={`translate(${x} ${top}) scale(${w / 100} ${h / 100})`}>
      <CloudBody id={id} />
    </g>
  )
}

/* ---------------- Sea state and a yacht ---------------- */

/** Fraction of the mainsail still set at each Beaufort force (0 = bare poles). */
const MAIN = [1, 1, 1, 1, 1, 0.82, 0.66, 0.5, 0.3, 0.25, 0, 0, 0]
const JIB = [1, 1, 1, 1, 0.9, 0.75, 0.55, 0.35, 0.25, 0.2, 0, 0, 0]

export function SeaScene({ force, t, W = 420, H = 210 }: { force: number; t: number; W?: number; H?: number }) {
  const f = Math.max(0, Math.min(12, force))
  const wave = BEAUFORT_WAVE[f]
  const amp = 1.5 + Math.sqrt(wave) * 9
  const L = 46 + f * 11
  const sea = H * 0.6
  const yAt = (x: number) => sea - amp * Math.sin((2 * Math.PI * (x - t * (14 + f * 5))) / L) - amp * 0.35 * Math.sin((2 * Math.PI * (x * 1.7 + t * 9)) / L)
  const pts: string[] = []
  for (let x = 0; x <= W; x += 4) pts.push(`${x} ${yAt(x).toFixed(1)}`)
  const sky = f >= 9 ? '#64748b' : f >= 7 ? '#94a3b8' : f >= 5 ? '#bfdbfe' : '#dbeafe'
  const water = f >= 8 ? '#1e3a5f' : f >= 5 ? '#1d4e89' : '#2563eb'
  const crests: ReactNode[] = []
  if (f >= 3) {
    for (let x = -L; x <= W + L; x += L) {
      const shift = mod(t * (14 + f * 5), L)
      const cx = x + shift + L / 4
      if (cx < 0 || cx > W) continue
      crests.push(<ellipse key={`c${x}`} cx={cx} cy={yAt(cx) + 2} rx={4 + f * 1.6} ry={1.5 + f * 0.25} fill="#fff" opacity={Math.min(0.95, 0.25 + f * 0.08)} />)
    }
  }
  const streaks: ReactNode[] = []
  if (f >= 7)
    for (let i = 0; i < f - 5; i++) {
      const y = sea + 16 + i * ((H - sea - 20) / Math.max(1, f - 5))
      const x0 = mod(i * 97 + t * 30, W + 120) - 120
      streaks.push(<line key={`s${i}`} x1={x0} y1={y} x2={x0 + 70 + f * 4} y2={y + 2} stroke="#fff" strokeWidth={1.4} opacity={0.6} />)
    }
  const bx = W * 0.48
  const by = yAt(bx)
  const slope = (yAt(bx + 6) - yAt(bx - 6)) / 12
  const pitch = Math.max(-16, Math.min(16, (Math.atan(slope) * 180) / Math.PI))
  const heel = Math.min(28, f * 3.2)
  const m = MAIN[f]
  const j = JIB[f]
  const mast = 70
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg">
      <rect width={W} height={H} fill={sky} />
      <path d={`M0 ${H} L${pts.join(' L')} L${W} ${H} Z`} fill={water} />
      {crests}
      {streaks}
      <g transform={`translate(${bx} ${by - 4}) rotate(${pitch})`}>
        <g transform={`rotate(${heel * 0.6})`}>
          <line x1={0} y1={0} x2={0} y2={-mast} stroke="#1f2937" strokeWidth={2} />
          {m > 0 && <path d={`M2 -6 L2 ${-6 - (mast - 8) * m} L${4 + 30 * m} -6 Z`} fill="#fff" stroke="#64748b" strokeWidth={0.8} />}
          {m === 0 && f <= 9 && <path d="M2 -6 L2 -24 L12 -6 Z" fill="#f97316" />}
          {j > 0 && <path d={`M-2 -6 L-2 ${-6 - (mast - 12) * j} L${-6 - 26 * j} -6 Z`} fill="#f1f5f9" stroke="#64748b" strokeWidth={0.8} />}
        </g>
        <path d="M-32 -6 L34 -6 L26 6 L-26 6 Z" fill="#f8fafc" stroke="#334155" strokeWidth={1.2} />
      </g>
      {f >= 9 && <rect width={W} height={H} fill="#fff" opacity={Math.min(0.45, (f - 8) * 0.1)} />}
    </svg>
  )
}

/* ---------------- Tropical revolving storm ---------------- */

/** A storm seen from above with its track pointing up the screen. `rot` in degrees animates the spiral. */
export function StormArt({ cx, cy, r, hemi, rot }: { cx: number; cy: number; r: number; hemi: 'N' | 'S'; rot: number }) {
  const dir = hemi === 'N' ? -1 : 1
  const arms = [0, 120, 240].map((a0) => {
    const pts: string[] = []
    for (let i = 0; i <= 40; i++) {
      const s = i / 40
      const ang = (a0 + rot + dir * -s * 260) * DEG
      const rr = r * (0.12 + 0.88 * s)
      pts.push(`${(cx + rr * Math.cos(ang)).toFixed(1)} ${(cy + rr * Math.sin(ang)).toFixed(1)}`)
    }
    return `M${pts.join(' L')}`
  })
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="url(#trsGlow)" />
      {arms.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#e2e8f0" strokeWidth={r * 0.07} strokeLinecap="round" opacity={0.85} />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.09} fill="#0f172a" stroke="#f8fafc" strokeWidth={1.5} />
    </g>
  )
}

export const TrsDefs = () => (
  <defs>
    <radialGradient id="trsGlow">
      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.95} />
      <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
    </radialGradient>
  </defs>
)

/** Boat symbol (small yacht seen from above) heading `hdg` degrees. */
export const BoatIcon = ({ x, y, hdg = 0, color = '#f59e0b', s = 1 }: { x: number; y: number; hdg?: number; color?: string; s?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${hdg}) scale(${s})`}>
    <path d="M0 -11 Q6 -2 5 9 L-5 9 Q-6 -2 0 -11 Z" fill={color} stroke="#0f172a" strokeWidth={1.2} />
  </g>
)
