import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Frame } from '../lessons/frame'
import { Feedback, Panel } from '../ui'
import { CHART_H, CHART_W, QUIZ_CHARTS, type QuizChart } from './charts'
import {
  BEAUFORT_KN,
  OCEAN,
  OCEAN_ISLANDS,
  OCEAN_LAND,
  PRESET_ROUTES,
  SEASONS,
  START,
  FINISH,
  compass8,
  contours,
  distToPolyline,
  inPolygon,
  mod,
  oceanPressure,
  oceanWind,
  pressureAt,
  sailRoute,
  windAt,
  type LatLon,
  type Season,
  type SimResult,
} from './field'
import { Arrow, BoatIcon, CloudShape, Pills, SeaScene, SynChart, Wide, halo, toPx, useAmbient, useClock, useW, type ChartView } from './parts'
import { CLOUD_IDS, fill, type CloudId, type WDrill } from './text'
import { TrsScene, lowBearing, type TrsPos } from './widgets'

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)]
export function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const pad3 = (d: number) => String(mod(Math.round(d), 360)).padStart(3, '0')

/* ---------------- Generic question runner ---------------- */

export interface Q {
  q: string
  options: string[]
  answer: number
  why: string
  visual?: ReactNode
  shuffle?: boolean
  head?: string
}

type PQ = Q & { order: number[] }
const prep = (qs: Q[]): PQ[] => qs.map((q) => ({ ...q, order: q.shuffle === false ? q.options.map((_, i) => i) : shuffled(q.options.length) }))

function QuizRunner({ make }: { make: () => Q[] }) {
  const { u } = useW()
  const [qs, setQs] = useState<PQ[]>(() => prep(make()))
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const again = () => {
    setQs(prep(make()))
    setIdx(0)
    setPicked(null)
    setScore(0)
  }
  if (idx >= qs.length)
    return (
      <Panel className="text-center">
        <p className="text-lg font-semibold">{fill(u.score, { score, max: qs.length })}</p>
        <p className="mt-1 text-2xl">{score === qs.length ? '🏆' : score >= qs.length * 0.7 ? '👍' : '📚'}</p>
        <button type="button" className="btn-primary mt-3" onClick={again}>
          ↻ {u.again}
        </button>
      </Panel>
    )
  const q = qs[idx]
  const many = q.options.length > 4
  return (
    <Panel>
      <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-sea-500">
        <span>
          {q.head ? `${q.head} · ` : ''}
          {fill(u.round, { n: idx + 1, m: qs.length })}
        </span>
        <span>{fill(u.score, { score, max: qs.length })}</span>
      </div>
      {q.visual && <div className="mt-2">{q.visual}</div>}
      <p className="mt-3 font-medium">{q.q}</p>
      <div className={`mt-2 grid gap-1.5 ${many ? 'grid-cols-4' : 'sm:grid-cols-2'}`}>
        {q.order.map((oi) => {
          let cls = 'btn-secondary text-left'
          if (picked !== null) {
            if (oi === q.answer) cls += ' !border-emerald-500 !bg-emerald-50 dark:!bg-emerald-950/50'
            else if (oi === picked) cls += ' !border-rose-500 !bg-rose-50 dark:!bg-rose-950/50'
          }
          if (many) cls += ' !text-center'
          return (
            <button
              key={oi}
              type="button"
              className={cls}
              onClick={() => {
                if (picked !== null) return
                setPicked(oi)
                if (oi === q.answer) setScore((s) => s + 1)
              }}
            >
              {q.options[oi]}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 space-y-2">
          <Feedback ok={picked === q.answer}>
            <strong>{picked === q.answer ? u.correct : u.wrong}</strong> {q.why}
          </Feedback>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setIdx(idx + 1)
              setPicked(null)
            }}
          >
            {u.next} →
          </button>
        </div>
      )}
    </Panel>
  )
}

/* ---------------- Synoptic chart drill ---------------- */

const QUIZ_VIEW: ChartView = { x0: 0, x1: CHART_W, y0: 0, y1: CHART_H, k: 50 }

function QuizChartView({ c, mark }: { c: QuizChart; mark?: string }) {
  const px = toPx(QUIZ_VIEW)
  return (
    <Wide min={360}>
      <SynChart field={c.field} view={QUIZ_VIEW} centres={c.labels}>
        {c.points.map((p) => {
          const q = px(p.x, p.y)
          return (
            <g key={p.id}>
              <circle cx={q.x} cy={q.y} r={11} fill={mark === p.id ? '#f59e0b' : '#fff'} stroke="#0f172a" strokeWidth={1.6} />
              <text x={q.x} y={q.y + 4} fontSize={12} fontWeight={800} textAnchor="middle" fill="#0f172a">
                {p.id}
              </text>
            </g>
          )
        })}
      </SynChart>
    </Wide>
  )
}

export function chartFacts(c: QuizChart) {
  const winds = c.points.map((p) => windAt(c.field, p.x, p.y))
  const press = c.points.map((p) => pressureAt(c.field, p.x, p.y))
  const argmax = (a: number[]) => a.indexOf(Math.max(...a))
  const strong = argmax(winds.map((w) => w.kn))
  const high = argmax(press)
  const off = c.points.map((p, i) => ({ p, i })).filter(({ p }) => c.field.fronts.every((f) => distToPolyline(p.x, p.y, f.pts) > 0.6))
  const dev = (d: number) => Math.min(mod(d, 45), 45 - mod(d, 45))
  const dirPt = off.reduce((a, b) => (dev(winds[b.i].from) < dev(winds[a.i].from) ? b : a), off[0])
  const lowPt = off.find((o) => o.i !== dirPt.i) ?? off[0]
  return { winds, press, strong, high, dir: dirPt.i, low: lowPt.i }
}

function SynopticDrill() {
  const { u } = useW()
  const d = u.drills.synoptic
  const make = () =>
    QUIZ_CHARTS.flatMap((c, ci): Q[] => {
      const f = chartFacts(c)
      const P = (i: number) => c.points[i].id
      const head = fill(d.chart, { n: ci + 1, m: QUIZ_CHARTS.length })
      const nh = c.field.hemi === 'N'
      const side = nh ? d.left : d.right
      const ids = c.points.map((p) => p.id)
      const cd = compass8(f.winds[f.dir].from)
      return [
        { head, q: d.qStrong, options: ids, answer: f.strong, shuffle: false, why: fill(d.whyStrong, { p: P(f.strong), kn: Math.round(f.winds[f.strong].kn) }), visual: <QuizChartView c={c} /> },
        {
          head,
          q: fill(d.qDir, { p: P(f.dir) }),
          options: [0, 2, 4, 6].map((k) => u.compass[(cd + k) % 8]),
          answer: 0,
          why: fill(d.whyDir, { side, dir: `${u.compass[cd]} (${pad3(f.winds[f.dir].from)}°)` }),
          visual: <QuizChartView c={c} mark={P(f.dir)} />,
        },
        { head, q: d.qHigh, options: ids, answer: f.high, shuffle: false, why: fill(d.whyHigh, { p: P(f.high), hpa: Math.round(f.press[f.high]) }), visual: <QuizChartView c={c} /> },
        { head, q: fill(d.qFront, { p: c.frontPoint }), options: nh ? d.frontN : d.frontS, answer: 0, why: nh ? d.whyFrontN : d.whyFrontS, visual: <QuizChartView c={c} mark={c.frontPoint} /> },
        { head, q: fill(d.qLow, { p: P(f.low) }), options: [d.left, d.right], answer: nh ? 0 : 1, shuffle: false, why: fill(d.whyLow, { hemi: nh ? u.nh : u.sh, side }), visual: <QuizChartView c={c} mark={P(f.low)} /> },
      ]
    })
  return (
    <Frame title={d.title}>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{d.intro}</p>
      <QuizRunner make={make} />
    </Frame>
  )
}

/* ---------------- Ocean passage game ---------------- */

const MK = 9
const COS = Math.cos(25 * (Math.PI / 180))
const MW = (OCEAN.lonMax - OCEAN.lonMin) * MK * COS
const MH = (OCEAN.latMax - OCEAN.latMin) * MK
const mp = (p: LatLon) => ({ x: (p[1] - OCEAN.lonMin) * MK * COS, y: (OCEAN.latMax - p[0]) * MK })
const unmp = (x: number, y: number): LatLon => [OCEAN.latMax - y / MK, OCEAN.lonMin + x / (MK * COS)]
const onLand = (p: LatLon) => OCEAN_LAND.some((poly) => inPolygon(p, poly))

function OceanMap({ season, route, boat, track, onAdd }: { season: Season; route: LatLon[]; boat?: LatLon; track?: LatLon[]; onAdd?: (p: LatLon) => void }) {
  const iso = useMemo(() => contours((lon, lat) => oceanPressure(season, lat, lon), OCEAN.lonMin, OCEAN.lonMax, OCEAN.latMin, OCEAN.latMax, 65, 45, 4), [season])
  const arrows = useMemo(() => {
    const out: { p: LatLon; from: number; kn: number }[] = []
    for (let lat = 2.5; lat < OCEAN.latMax; lat += 5)
      for (let lon = OCEAN.lonMin + 2.5; lon < OCEAN.lonMax; lon += 5) {
        const p: LatLon = [lat, lon]
        if (onLand(p)) continue
        const w = oceanWind(season, lat, lon)
        out.push({ p, ...w })
      }
    return out
  }, [season])
  const click = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onAdd) return
    const r = e.currentTarget.getBoundingClientRect()
    onAdd(unmp(((e.clientX - r.left) / r.width) * MW, ((e.clientY - r.top) / r.height) * MH))
  }
  const line = (pts: LatLon[]) => pts.map((p) => `${mp(p).x.toFixed(1)},${mp(p).y.toFixed(1)}`).join(' ')
  const it = mp([season.itcz + 2.5, 0]).y
  const ib = mp([season.itcz - 2.5, 0]).y
  return (
    <svg viewBox={`0 0 ${MW.toFixed(0)} ${MH.toFixed(0)}`} className={`w-full rounded-lg border border-slate-300 dark:border-white/20 ${onAdd ? 'cursor-crosshair' : ''}`} style={{ background: '#e0f2fe' }} onClick={click}>
      <rect x={0} y={it} width={MW} height={ib - it} fill="#fde68a" opacity={0.45} />
      {season.hurricanes && (
        <rect x={0} y={mp([25, 0]).y} width={mp([0, -40]).x} height={MH - mp([25, 0]).y} fill="#dc2626" opacity={0.1} stroke="#dc2626" strokeDasharray="6 4" />
      )}
      {iso.map((c) => (
        <path
          key={c.level}
          d={c.segs
            .map(([ax, ay, bx, by]) => {
              const a = mp([ay, ax])
              const b = mp([by, bx])
              return `M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${b.x.toFixed(1)} ${b.y.toFixed(1)}`
            })
            .join('')}
          fill="none"
          stroke="#64748b"
          strokeWidth={0.9}
        />
      ))}
      {arrows.map((a, i) => {
        const q = mp(a.p)
        const len = Math.max(5, Math.min(26, a.kn * 1.3))
        const to = mod(a.from + 180, 360)
        const ux = Math.sin((to * Math.PI) / 180)
        const uy = -Math.cos((to * Math.PI) / 180)
        return <Arrow key={i} x={q.x - (ux * len) / 2} y={q.y - (uy * len) / 2} toDeg={to} len={len} color={a.kn < 5 ? '#94a3b8' : a.kn > 22 ? '#be123c' : '#0369a1'} width={1.4} head={4} />
      })}
      {OCEAN_LAND.map((poly, i) => (
        <polygon key={i} points={line(poly)} fill="#d6c7a1" stroke="#a8956b" strokeWidth={0.8} />
      ))}
      {OCEAN_ISLANDS.map((isl, i) => {
        const q = mp(isl.pos)
        return (
          <g key={i}>
            <circle cx={q.x} cy={q.y} r={2.4} fill="#a8956b" />
            {isl.name && (
              <text x={q.x + 4} y={q.y - 3} fontSize={8} fill="#57534e" {...halo}>
                {isl.name}
              </text>
            )}
          </g>
        )
      })}
      <text x={mp(season.high).x} y={mp(season.high).y + 7} textAnchor="middle" fontSize={20} fontWeight={800} fill="#1d4ed8" {...halo}>
        H
      </text>
      {track && <polyline points={line(track)} fill="none" stroke="#f59e0b" strokeWidth={2.4} />}
      <polyline points={line(route)} fill="none" stroke="#0f172a" strokeWidth={1.6} strokeDasharray="6 4" />
      {route.slice(1, -1).map((p, i) => (
        <g key={i}>
          <circle cx={mp(p).x} cy={mp(p).y} r={6} fill="#fff" stroke="#0f172a" strokeWidth={1.4} />
          <text x={mp(p).x} y={mp(p).y + 3} fontSize={8} fontWeight={700} textAnchor="middle">
            {i + 1}
          </text>
        </g>
      ))}
      {[START, FINISH].map((p, i) => (
        <circle key={i} cx={mp(p).x} cy={mp(p).y} r={5} fill={i ? '#16a34a' : '#dc2626'} stroke="#fff" strokeWidth={1.5} />
      ))}
      <text x={mp(FINISH).x + 8} y={mp(FINISH).y + 4} fontSize={9} fontWeight={700} fill="#166534" {...halo}>
        St Lucia
      </text>
      {boat && <BoatIcon x={mp(boat).x} y={mp(boat).y} hdg={250} />}
    </svg>
  )
}

function RouteDrill() {
  const { u, n } = useW()
  const d = u.drills.route
  const [sid, setSid] = useState<Season['id']>('nov')
  const season = SEASONS.find((s) => s.id === sid)!
  const [wps, setWps] = useState<LatLon[]>([])
  const [res, setRes] = useState<SimResult | null>(null)
  const [playing, setPlaying] = useState(false)
  const clock = useClock(playing)
  const [t0, setT0] = useState(0)
  const route: LatLon[] = [START, ...wps, FINISH]
  const best = useMemo(() => sailRoute(season, PRESET_ROUTES.find((r) => r.id === 'butter')!.pts), [season])
  const reset = () => {
    setRes(null)
    setPlaying(false)
  }
  const sail = () => {
    const r = sailRoute(season, route)
    setRes(r)
    if (!r.onLand) {
      setT0(clock)
      setPlaying(true)
    }
  }
  const frac = res && playing ? Math.min(1, (clock - t0) / 5) : 1
  useEffect(() => {
    if (playing && frac >= 1) setPlaying(false)
  }, [playing, frac])
  const idx = res ? Math.floor(frac * (res.track.length - 1)) : 0
  const shownTrack = res && !res.onLand ? res.track.slice(0, idx + 1) : undefined
  const done = res && !playing
  const ratio = res ? res.days / best.days : 0
  const verdict = ratio <= 1.03 ? d.verdict.great : ratio <= 1.15 ? d.verdict.ok : d.verdict.slow
  return (
    <Frame title={d.title}>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{d.intro}</p>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 dark:text-slate-400">{d.month}</span>
        <Pills
          items={SEASONS.map((s) => s.id)}
          value={sid}
          onChange={(v) => {
            setSid(v)
            reset()
          }}
          label={(v) => d.monthNames[v]}
        />
      </div>
      <div className="mb-3 flex flex-wrap gap-1">
        {PRESET_ROUTES.map((r) => (
          <button
            key={r.id}
            type="button"
            className="btn-secondary !px-2.5 !py-1 text-xs"
            onClick={() => {
              setWps(r.pts.slice(1, -1))
              reset()
            }}
          >
            {d.presets[r.id]}
          </button>
        ))}
      </div>
      <Wide min={380}>
        <OceanMap
          season={season}
          route={route}
          track={shownTrack}
          boat={shownTrack?.[shownTrack.length - 1]}
          onAdd={
            playing
              ? undefined
              : (p) => {
                  if (wps.length >= 5 || onLand(p)) return
                  setWps([...wps, p])
                  reset()
                }
          }
        />
      </Wide>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{d.legend}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {d.add} ({wps.length}/5)
        </span>
        <button type="button" className="btn-secondary !px-2.5 !py-1 text-xs" disabled={!wps.length || playing} onClick={() => (setWps(wps.slice(0, -1)), reset())}>
          ↶ {d.undo}
        </button>
        <button type="button" className="btn-secondary !px-2.5 !py-1 text-xs" disabled={!wps.length || playing} onClick={() => (setWps([]), reset())}>
          ✕ {d.clear}
        </button>
        <button type="button" className="btn-primary !px-4 !py-1 text-sm" disabled={playing} onClick={sail}>
          ⛵ {d.sail}
        </button>
      </div>
      {res?.onLand && (
        <div className="mt-3">
          <Feedback ok={false}>{d.land}</Feedback>
        </div>
      )}
      {done && !res.onLand && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
            {[
              [d.days, `${n(res.days, 1)} ${d.dayUnit}`],
              [d.dist, `${Math.round(res.nm)} nm`],
              [d.avg, `${n(res.avg, 1)} kn`],
              [d.calm, `${Math.round(res.calmH)} h`],
              [d.gale, `${Math.round(res.galeH)} h`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-white p-2 text-center dark:bg-white/5">
                <div className="text-[11px] text-slate-500">{k}</div>
                <div className="font-mono font-semibold">{v}</div>
              </div>
            ))}
          </div>
          {res.hurricaneH > 0 ? (
            <Feedback ok={false}>
              {fill(d.hurricane, { h: Math.round(res.hurricaneH) })} {fill(d.best, { d: n(best.days, 1) })}
            </Feedback>
          ) : (
            <Feedback ok={ratio <= 1.15}>
              <strong>{verdict}</strong> {fill(d.best, { d: n(best.days, 1) })}
            </Feedback>
          )}
        </div>
      )}
    </Frame>
  )
}

/* ---------------- Put the depression in order ---------------- */

function OrderDrill() {
  const { u } = useW()
  const d = u.drills.order
  const [deck, setDeck] = useState(() => shuffled(d.cards.length))
  const [chosen, setChosen] = useState<number[]>([])
  const full = chosen.length === d.cards.length
  const right = chosen.filter((c, i) => c === i).length
  const reset = () => {
    setDeck(shuffled(d.cards.length))
    setChosen([])
  }
  return (
    <Frame title={d.title}>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{d.intro}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          {deck
            .filter((i) => !chosen.includes(i))
            .map((i) => (
              <button key={i} type="button" className="btn-secondary block w-full text-left text-sm" onClick={() => setChosen([...chosen, i])}>
                {d.cards[i]}
              </button>
            ))}
        </div>
        <ol className="space-y-1.5">
          {chosen.map((c, i) => (
            <li
              key={c}
              className={`flex gap-2 rounded-lg border px-2 py-1.5 text-sm ${full ? (c === i ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'border-rose-400 bg-rose-50 dark:bg-rose-950/40') : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/5'}`}
            >
              <span className="font-bold text-sea-500">{i + 1}.</span>
              <span className="flex-1">{d.cards[c]}</span>
              {!full && i === chosen.length - 1 && (
                <button type="button" className="text-xs text-slate-400 hover:text-rose-500" onClick={() => setChosen(chosen.slice(0, -1))} aria-label="undo">
                  ✕
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>
      {full && (
        <div className="mt-3 space-y-2">
          <Feedback ok={right === d.cards.length}>{right === d.cards.length ? d.ok : fill(d.bad, { n: right })}</Feedback>
          {right < d.cards.length && (
            <ol className="list-decimal space-y-0.5 pl-6 text-sm text-slate-700 dark:text-slate-300">
              {d.cards.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ol>
          )}
          <button type="button" className="btn-primary" onClick={reset}>
            ↻ {d.reset}
          </button>
        </div>
      )}
    </Frame>
  )
}

/* ---------------- Guess the force ---------------- */

function SeaVisual({ force, kn }: { force: number; kn: number }) {
  const { u } = useW()
  const [on] = useAmbient()
  const t = useClock(on)
  return (
    <div className="relative">
      <SeaScene force={force} t={t} />
      <div className="absolute right-2 top-2 rounded-lg bg-navy-950/85 px-3 py-1 text-center font-mono text-sky-100">
        <div className="text-[10px] uppercase">{u.beaufort.kn}</div>
        <div className="text-xl font-bold">{kn} kn</div>
      </div>
    </div>
  )
}

function BeaufortGuess() {
  const { u } = useW()
  const d = u.drills.beaufortGuess
  const b = u.beaufort
  const make = (): Q[] =>
    shuffled(10)
      .slice(0, 6)
      .map((i) => {
        const f = i + 1
        const kn = BEAUFORT_KN[f] + Math.floor(Math.random() * (BEAUFORT_KN[f + 1] - BEAUFORT_KN[f]))
        const lo = Math.max(1, Math.min(f - 1, 9))
        const opts = [f, ...[lo, lo + 1, lo + 2, lo + 3].filter((x) => x !== f)].slice(0, 4)
        return {
          q: d.q,
          options: opts.map((x) => `F${x} · ${b.names[x]}`),
          answer: 0,
          why: `F${f}: ${BEAUFORT_KN[f]}–${BEAUFORT_KN[f + 1] - 1} kn. ${b.sea[f]}`,
          visual: <SeaVisual force={f} kn={kn} />,
        }
      })
  return (
    <Frame title={d.title}>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{d.intro}</p>
      <QuizRunner make={make} />
    </Frame>
  )
}

/* ---------------- Cloud spotter ---------------- */

function CloudVisual({ id }: { id: CloudId }) {
  const h = id === 'cb' ? 180 : id === 'ns' ? 110 : id === 'cu' ? 100 : 80
  const w = id === 'cu' ? 120 : 180
  return (
    <svg viewBox="0 0 300 210" className="mx-auto w-full max-w-sm rounded-lg">
      <defs>
        <linearGradient id="cgSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e6fb8" />
          <stop offset="100%" stopColor="#9fd0f5" />
        </linearGradient>
      </defs>
      <rect width={300} height={210} fill="url(#cgSky)" />
      <CloudShape id={id} x={150 - w / 2} top={id === 'cb' ? 8 : 150 - h} w={w} h={h} />
      <rect y={192} width={300} height={18} fill="#1d4e89" />
    </svg>
  )
}

function CloudGuess() {
  const { u } = useW()
  const d = u.drills.cloudGuess
  const info = u.clouds.info
  const make = (): Q[] =>
    shuffled(CLOUD_IDS.length)
      .slice(0, 4)
      .flatMap((i) => {
        const id = CLOUD_IDS[i]
        const others = shuffled(CLOUD_IDS.length)
          .filter((j) => j !== i)
          .slice(0, 3)
          .map((j) => CLOUD_IDS[j])
        const visual = <CloudVisual id={id} />
        return [
          { q: d.q, options: [id, ...others].map((c) => info[c].name), answer: 0, why: info[id].name, visual },
          { q: d.q2, options: [id, ...others].map((c) => info[c].text), answer: 0, why: `${info[id].name}: ${info[id].text}`, visual },
        ]
      })
  return (
    <Frame title={d.title}>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{d.intro}</p>
      <QuizRunner make={make} />
    </Frame>
  )
}

/* ---------------- Find the low ---------------- */

function BuysVisual({ from, hemi }: { from: number; hemi: 'N' | 'S' }) {
  const { u } = useW()
  const C = 110
  const at = (b: number, r: number) => ({ x: C + r * Math.sin((b * Math.PI) / 180), y: C - r * Math.cos((b * Math.PI) / 180) })
  const s = at(from, 70)
  return (
    <svg viewBox="0 0 220 220" className="mx-auto w-full max-w-[16rem]">
      <circle cx={C} cy={C} r={92} fill="#f1f7fb" stroke="#cbd5e1" />
      {u.compass.map((c, i) => (
        <text key={c} x={at(i * 45, 102).x} y={at(i * 45, 102).y + 4} fontSize={11} fontWeight={700} textAnchor="middle" fill="#475569">
          {c}
        </text>
      ))}
      <Arrow x={s.x} y={s.y} toDeg={mod(from + 180, 360)} len={140} color="#0ea5e9" width={4} head={11} />
      <text x={4} y={14} fontSize={12} fontWeight={700} fill={hemi === 'N' ? '#1d4ed8' : '#b91c1c'}>
        {hemi === 'N' ? u.nh : u.sh}
      </text>
    </svg>
  )
}

function BuysDrill() {
  const { u } = useW()
  const d = u.drills.buysDrill
  const make = (): Q[] =>
    Array.from({ length: 6 }, () => {
      const from = pick([0, 45, 90, 135, 180, 225, 270, 315])
      const hemi = pick(['N', 'S'] as const)
      const low = compass8(lowBearing(from, hemi))
      return { q: d.q, options: u.compass, answer: low, shuffle: false, why: hemi === 'N' ? u.buys.rule : u.buys.ruleS, visual: <BuysVisual from={from} hemi={hemi} /> }
    })
  return (
    <Frame title={d.title}>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{d.intro}</p>
      <QuizRunner make={make} />
    </Frame>
  )
}

/* ---------------- Escape the storm ---------------- */

export function trsAction(hemi: 'N' | 'S', pos: TrsPos): number {
  if (hemi === 'N') return pos === 'dangerous' ? 0 : 1
  return pos === 'dangerous' ? 2 : 3
}

function TrsVisual({ hemi, pos }: { hemi: 'N' | 'S'; pos: TrsPos }) {
  const [on] = useAmbient()
  const t = useClock(on)
  return <TrsScene hemi={hemi} rot={t * 40 * (hemi === 'N' ? -1 : 1)} boats={[pos]} />
}

function TrsDrill() {
  const { u } = useW()
  const d = u.drills.trsDrill
  const names = [u.trs.dangerous, u.trs.navigable, u.trs.path]
  const POS: TrsPos[] = ['dangerous', 'navigable', 'path']
  const make = (): Q[] =>
    Array.from({ length: 3 }, () => {
      const hemi = pick(['N', 'S'] as const)
      const pos = pick(POS)
      const advice = (hemi === 'N' ? u.trs.advice : u.trs.adviceS)[pos]
      const visual = <TrsVisual hemi={hemi} pos={pos} />
      const head = hemi === 'N' ? u.nh : u.sh
      return [
        { head, q: d.q, options: names, answer: POS.indexOf(pos), shuffle: false, why: advice, visual },
        { head, q: d.qAction, options: d.actions, answer: trsAction(hemi, pos), shuffle: false, why: advice, visual },
      ]
    }).flat()
  return (
    <Frame title={d.title}>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{d.intro}</p>
      <QuizRunner make={make} />
    </Frame>
  )
}

/* ---------------- Go / no-go ---------------- */

function GoNoGo() {
  const { u } = useW()
  const d = u.drills.gonogo
  return (
    <Frame title={d.title}>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">{d.intro}</p>
      <QuizRunner make={() => d.items.map((it) => ({ q: it.q, options: it.options, answer: it.answer, why: it.why }))} />
    </Frame>
  )
}

function DrillSwitch({ id }: { id: WDrill }) {
  switch (id) {
    case 'synoptic':
      return <SynopticDrill />
    case 'route':
      return <RouteDrill />
    case 'order':
      return <OrderDrill />
    case 'beaufortGuess':
      return <BeaufortGuess />
    case 'cloudGuess':
      return <CloudGuess />
    case 'buysDrill':
      return <BuysDrill />
    case 'trsDrill':
      return <TrsDrill />
    case 'gonogo':
      return <GoNoGo />
  }
}

export function WeatherDrill({ id }: { id: WDrill }) {
  const { lang } = useW()
  return <DrillSwitch key={lang} id={id} />
}

