import L from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Circle, MapContainer, Marker, Polygon, Polyline, Rectangle, SVGOverlay, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Translate } from '../../i18n'
import { playHorn } from '../../lib/horn'
import { boatIcon } from '../../map/icons'
import { formatRaceTime } from './raceApi'
import { committeeIcon, pinBuoyIcon, raceMarkIcon } from './raceIcons'
import {
  fromLatLon,
  initialState,
  norm180,
  norm360,
  SPEEDUP,
  step,
  toLatLon,
  windAt,
  type CourseData,
  type HelmEvent,
  type Leg,
  type RaceState,
  type XY,
} from './sim'

const UP_TWA = 45
const DOWN_TWA = 150

interface Props {
  course: CourseData
  t: Translate
  onEnd: (final: RaceState, events: HelmEvent[]) => void
}

const legTarget = (c: CourseData, leg: Leg): XY | null => {
  const m = c.marks
  if (leg === 'start') return [(m.committee[0] + m.pin[0]) / 2, (m.committee[1] + m.pin[1]) / 2]
  if (leg === 'windward') return m.windward
  if (leg === 'offset') return m.offset
  if (leg === 'gate') return [(m.gateS[0] + m.gateP[0]) / 2, (m.gateS[1] + m.gateP[1]) / 2]
  if (leg === 'finish') return [(m.finishBoat[0] + m.finishPin[0]) / 2, (m.finishBoat[1] + m.finishPin[1]) / 2]
  return null
}

function FitCourse({ course }: { course: CourseData }) {
  const map = useMap()
  useEffect(() => {
    const pts = [...Object.values(course.marks), [course.boat.x, course.boat.y] as XY].map(([x, y]) => toLatLon(course, x, y))
    // Keep the course clear of the clock and wind boxes drawn over the top of the map.
    map.fitBounds(L.latLngBounds(pts), { paddingTopLeft: [24, 130], paddingBottomRight: [24, 24] })
  }, [map, course])
  return null
}

function ClickToSteer({ course, onPoint }: { course: CourseData; onPoint: (p: XY) => void }) {
  useMapEvents({
    click(e) {
      onPoint(fromLatLon(course, e.latlng.lat, e.latlng.lng))
    },
  })
  return null
}

/** Wind arrows and puffs (darker water = more wind), recomputed every simulated second. */
function WindField({ course, t, show }: { course: CourseData; t: number; show: boolean }) {
  const [bx0, by0, bx1, by1] = course.bounds
  const pts = useMemo(() => {
    const ms = Object.values(course.marks)
    const xs = ms.map((p) => p[0])
    const ys = ms.map((p) => p[1])
    const pad = course.legM * 0.45
    const x0 = Math.max(bx0, Math.min(...xs) - pad)
    const x1 = Math.min(bx1, Math.max(...xs) + pad)
    const y0 = Math.max(by0, Math.min(...ys) - pad)
    const y1 = Math.min(by1, Math.max(...ys) + pad)
    const g = Math.max(x1 - x0, y1 - y0) / 11
    const out: XY[] = []
    for (let y = y0 + g / 2; y < y1; y += g) for (let x = x0 + g / 2; x < x1; x += g) out.push([x, y])
    return { out, g }
  }, [course, bx0, bx1, by0, by1])
  if (!show) return null
  const sw = toLatLon(course, bx0, by0)
  const ne = toLatLon(course, bx1, by1)
  const base = course.wind.speed
  return (
    <SVGOverlay bounds={[sw, ne]} attributes={{ viewBox: `${bx0} ${-by1} ${bx1 - bx0} ${by1 - by0}`, preserveAspectRatio: 'none' }}>
      {pts.out.map(([x, y]) => {
        const w = windAt(course.wind, t, x, y)
        const k = Math.max(0, Math.min(1, (w.tws / base - 0.85) / 0.5))
        const len = pts.g * (0.28 + 0.22 * k)
        return (
          <g key={`${x}-${y}`} transform={`translate(${x} ${-y}) rotate(${w.dir + 180})`}>
            {k > 0.25 && <circle r={pts.g * 0.5} fill="#0b3a5c" opacity={0.16 * (k - 0.25)} />}
            <line x1={0} y1={len / 2} x2={0} y2={-len / 2} stroke="#0b3a5c" strokeWidth={pts.g * 0.03} opacity={0.45} />
            <path d={`M0 ${-len / 2 - pts.g * 0.09} L${-pts.g * 0.07} ${-len / 2 + pts.g * 0.03} L${pts.g * 0.07} ${-len / 2 + pts.g * 0.03}Z`} fill="#0b3a5c" opacity={0.5} />
          </g>
        )
      })}
    </SVGOverlay>
  )
}

export function RaceGame({ course, t, onEnd }: Props) {
  const stateRef = useRef<RaceState>(initialState(course))
  const prevRef = useRef<RaceState>(stateRef.current)
  const eventsRef = useRef<HelmEvent[]>([])
  const targetRef = useRef(course.boat.heading)
  const lastTargetRef = useRef(course.boat.heading)
  const boatRef = useRef<L.Marker | null>(null)
  const [hud, setHud] = useState<RaceState>(stateRef.current)
  const [track, setTrack] = useState<[number, number][]>([])
  const [showWind, setShowWind] = useState(true)
  const [showLaylines, setShowLaylines] = useState(true)
  const [over, setOver] = useState(false)
  const onEndRef = useRef(onEnd)
  onEndRef.current = onEnd

  const setTarget = useCallback((h: number) => {
    targetRef.current = Math.round(norm360(h))
  }, [])

  const helm = useMemo(
    () => ({
      turn: (d: number) => setTarget(targetRef.current + d),
      tack: () => {
        const s = stateRef.current
        setTarget(s.windDir + norm180(s.windDir - s.heading))
      },
      closeHauled: () => {
        const s = stateRef.current
        setTarget(norm180(s.windDir - s.heading) >= 0 ? s.windDir - UP_TWA : s.windDir + UP_TWA)
      },
      run: () => {
        const s = stateRef.current
        setTarget(norm180(s.windDir - s.heading) >= 0 ? s.windDir - DOWN_TWA : s.windDir + DOWN_TWA)
      },
      toward: (p: XY) => {
        const s = stateRef.current
        setTarget((Math.atan2(p[0] - s.x, p[1] - s.y) * 180) / Math.PI)
      },
    }),
    [setTarget],
  )

  // Game loop: fixed one-second simulation steps, interpolated for smooth drawing.
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let acc = 0
    let hornAtGun = false
    try {
      playHorn('-', { long: 1.2 })
    } catch {
      // audio not available
    }
    const frame = (now: number) => {
      acc += Math.min(0.25, (now - last) / 1000) * SPEEDUP
      last = now
      let s = stateRef.current
      while (acc >= 1 && s.status === 'racing') {
        if (targetRef.current !== lastTargetRef.current) {
          eventsRef.current.push([s.t, targetRef.current])
          lastTargetRef.current = targetRef.current
        }
        prevRef.current = s
        s = step(course, s, targetRef.current)
        stateRef.current = s
        acc -= 1
        if (s.t === 0 && !hornAtGun) {
          hornAtGun = true
          try {
            playHorn(s.ocs ? '..' : '.', { short: 0.6 })
          } catch {
            // audio not available
          }
        }
        if (s.t > 0) setTrack((tr) => [...tr, toLatLon(course, s.x, s.y)])
        setHud(s)
      }
      const p = prevRef.current
      const f = s.status === 'racing' ? Math.min(1, acc) : 1
      boatRef.current?.setLatLng(toLatLon(course, p.x + (s.x - p.x) * f, p.y + (s.y - p.y) * f))
      if (s.status !== 'racing') {
        setOver(true)
        onEndRef.current(s, eventsRef.current)
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [course])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (over || (e.target instanceof HTMLElement && e.target.closest('input, textarea, select'))) return
      const big = e.shiftKey ? 10 : 3
      if (e.key === 'ArrowLeft') helm.turn(-big)
      else if (e.key === 'ArrowRight') helm.turn(big)
      else if (e.key === 'ArrowUp') helm.closeHauled()
      else if (e.key === 'ArrowDown') helm.run()
      else if (e.key === ' ' || e.key.toLowerCase() === 't') helm.tack()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [helm, over])

  const m = course.marks
  const ll = (p: XY) => toLatLon(course, p[0], p[1])
  const next = legTarget(course, hud.leg)
  const upwindLeg = hud.leg === 'windward' || hud.leg === 'finish' || hud.leg === 'start'
  const shift = norm180(hud.windDir - course.wind.dir)
  const lift = hud.side > 0 ? shift : -shift
  const boatIco = useMemo(() => boatIcon(hud.heading, hud.twa, 'player'), [hud.heading, hud.twa])
  // The game loop moves the boat marker itself; React only sets its first position.
  const boatStart = useMemo(() => toLatLon(course, course.boat.x, course.boat.y), [course])

  const laylines = useMemo(() => {
    if (!showLaylines || !upwindLeg || !next) return []
    const ends: XY[] = hud.leg === 'finish' ? [m.finishBoat, m.finishPin] : hud.leg === 'start' ? [m.windward] : [next]
    const len = course.legM * 0.9
    const lines: [number, number][][] = []
    for (const e of ends)
      for (const sgn of [-1, 1]) {
        const a = ((hud.windDir + 180 + sgn * UP_TWA) * Math.PI) / 180
        lines.push([ll(e), ll([e[0] + Math.sin(a) * len, e[1] + Math.cos(a) * len])])
      }
    return lines
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLaylines, upwindLeg, hud.leg, Math.round(hud.windDir)])

  const clock = hud.t < 0 ? `−${formatRaceTime(-hud.t).replace(/\.0$/, '')}` : formatRaceTime(hud.t).replace(/\.0$/, '')
  const legName: Record<Leg, string> = {
    start: t('rc.leg.start'),
    windward: t('rc.leg.windward'),
    offset: t('rc.leg.offset'),
    gate: t('rc.leg.gate'),
    finish: t('rc.leg.finish'),
    done: t('rc.leg.done'),
  }
  const base = 'rounded-lg border px-3 py-2 text-sm font-semibold shadow-sm active:scale-95'
  const btn = `${base} border-slate-300 bg-white hover:bg-slate-50 dark:border-white/20 dark:bg-white/10 dark:hover:bg-white/15`

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
        <MapContainer center={ll([0, 0])} zoom={15} className="h-[62vh] min-h-[380px] w-full" scrollWheelZoom>

          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={18} />
          <FitCourse course={course} />
          <ClickToSteer course={course} onPoint={helm.toward} />
          <WindField course={course} t={hud.t} show={showWind} />
          <Rectangle bounds={[ll([course.bounds[0], course.bounds[1]]), ll([course.bounds[2], course.bounds[3]])]} pathOptions={{ color: '#dc2626', weight: 1, dashArray: '6 6', fill: false }} />
          {course.water.map((poly, i) => (
            <Polygon key={`w${i}`} positions={poly.map((r) => r.map(ll))} pathOptions={{ color: '#b45309', weight: 1, dashArray: '3 4', opacity: 0.55, fill: false }} />
          ))}
          {course.land.map((r, i) => (
            <Polygon key={`l${i}`} positions={r.map(ll)} pathOptions={{ color: '#b45309', weight: 1, fillColor: '#f1e2b4', fillOpacity: 0.6 }} />
          ))}
          <Polyline positions={[ll(m.committee), ll(m.pin)]} pathOptions={{ color: '#f97316', weight: 2.5, dashArray: '8 6' }} />
          <Polyline positions={[ll(m.finishBoat), ll(m.finishPin)]} pathOptions={{ color: '#2563eb', weight: 2.5, dashArray: '2 5' }} />
          <Polyline positions={[ll(m.gateS), ll(m.gateP)]} pathOptions={{ color: '#f97316', weight: 1, dashArray: '2 6', opacity: 0.7 }} />
          {laylines.map((l, i) => (
            <Polyline key={i} positions={l} pathOptions={{ color: '#7c3aed', weight: 1.5, dashArray: '6 6', opacity: 0.7 }} />
          ))}
          <Marker position={ll(m.committee)} icon={committeeIcon('RC', '#f97316')} interactive={false} />
          <Marker position={ll(m.pin)} icon={pinBuoyIcon('#f97316')} interactive={false} />
          <Marker position={ll(m.windward)} icon={raceMarkIcon('1', '#f97316', hud.leg === 'windward')} interactive={false} />
          <Marker position={ll(m.offset)} icon={raceMarkIcon('1a', '#facc15', hud.leg === 'offset')} interactive={false} />
          <Marker position={ll(m.gateS)} icon={raceMarkIcon('4S', '#f97316', hud.leg === 'gate')} interactive={false} />
          <Marker position={ll(m.gateP)} icon={raceMarkIcon('4P', '#f97316', hud.leg === 'gate')} interactive={false} />
          <Marker position={ll(m.finishBoat)} icon={committeeIcon('F', '#2563eb')} interactive={false} />
          <Marker position={ll(m.finishPin)} icon={pinBuoyIcon('#2563eb')} interactive={false} />
          {next && hud.leg !== 'start' && <Circle center={ll(next)} radius={22} pathOptions={{ color: '#facc15', weight: 2, fill: false, dashArray: '4 4' }} />}
          {track.length > 1 && <Polyline positions={track} pathOptions={{ color: '#0b3a5c', weight: 2, opacity: 0.6 }} />}
          <Marker position={boatStart} icon={boatIco} ref={boatRef} interactive={false} zIndexOffset={1000} />
        </MapContainer>

        <div className="pointer-events-none absolute left-2 top-2 z-[1000] space-y-1.5">
          <div className="rounded-lg bg-white/90 px-3 py-2 shadow dark:bg-navy-950/85">
            <p className={`font-mono text-2xl font-bold tabular-nums ${hud.t < 0 ? 'text-amber-600' : 'text-navy-900 dark:text-white'}`}>{clock}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t('rc.next')}: <strong>{legName[hud.leg]}</strong>
            </p>
            <p className="font-mono text-xs sm:hidden">
              {((hud.speed * 3600) / 1852).toFixed(1)} kn · {Math.round(Math.abs(hud.twa))}° · {hud.tacks}/{hud.gybes}
            </p>
          </div>
          {hud.t < 0 && (
            <div className="rounded-lg bg-amber-100/95 px-3 py-1.5 text-xs font-medium text-amber-900 shadow">
              {hud.speed < 0.5 ? t('rc.seq.go') : hud.t < -50 ? t('rc.seq.oneMinute') : t('rc.seq.wait')}
            </div>
          )}
          {hud.ocs && (
            <div className="flex items-center gap-2 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow">
              <svg viewBox="0 0 30 20" className="h-4 w-6" aria-hidden>
                <rect width="30" height="20" fill="#fff" stroke="#1e3a8a" />
                <path d="M13 0h4v20h-4zM0 8h30v4H0z" fill="#1e3a8a" />
              </svg>
              {t('rc.ocs')}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute right-2 top-2 z-[1000] w-36 rounded-lg bg-white/90 px-3 py-2 text-xs shadow sm:w-44 dark:bg-navy-950/85">
          <div className="flex items-center gap-2">
            <svg viewBox="-20 -20 40 40" className="h-10 w-10" aria-hidden>
              <circle r="18" fill="none" stroke="#94a3b8" />
              <text y="-11" textAnchor="middle" fontSize="7" fill="#64748b">N</text>
              <g transform={`rotate(${hud.windDir + 180})`}>
                <line y1="12" y2="-10" stroke="#0b3a5c" strokeWidth="2.5" />
                <path d="M0 -15 L-4.5 -7 L4.5 -7Z" fill="#0b3a5c" />
              </g>
            </svg>
            <div>
              <p className="font-mono text-base font-bold">{hud.tws.toFixed(1)} kn</p>
              <p className="text-slate-500">{t('rc.windFrom', { dir: Math.round(hud.windDir) })}</p>
            </div>
          </div>
          {hud.t >= 0 && upwindLeg && hud.leg !== 'start' && Math.abs(lift) >= 1 && (
            <p className={`mt-1 font-semibold ${lift > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {lift > 0 ? t('rc.lift', { d: Math.round(Math.abs(lift)) }) : t('rc.header', { d: Math.round(Math.abs(lift)) })}
            </p>
          )}
          <dl className="mt-1 hidden grid-cols-2 gap-x-2 font-mono sm:grid">
            <dt className="font-sans text-slate-500">{t('rc.speed')}</dt>
            <dd className="text-right">{((hud.speed * 3600) / 1852).toFixed(1)} kn</dd>
            <dt className="font-sans text-slate-500">{t('rc.heading')}</dt>
            <dd className="text-right">{String(Math.round(hud.heading) % 360).padStart(3, '0')}°</dd>
            <dt className="font-sans text-slate-500">TWA</dt>
            <dd className="text-right">
              {Math.round(Math.abs(hud.twa))}° {hud.twa >= 0 ? 'S' : 'P'}
            </dd>
            <dt className="font-sans text-slate-500">{t('rc.tacksGybes')}</dt>
            <dd className="text-right">
              {hud.tacks} / {hud.gybes}
            </dd>
          </dl>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label={t('rc.helm')}>
        <button type="button" className={btn} onClick={() => helm.turn(-10)} aria-label={t('rc.port10')}>
          ⟲ 10°
        </button>
        <button type="button" className={btn} onClick={() => helm.turn(-3)} aria-label={t('rc.port3')}>
          ⟲ 3°
        </button>
        <button type="button" className={`${base} min-w-24 border-navy-900 bg-navy-900 text-white hover:bg-navy-700 dark:border-sea-500 dark:bg-sea-500`} onClick={helm.tack}>
          {Math.abs(hud.twa) < 90 ? t('rc.tack') : t('rc.gybe')}
        </button>
        <button type="button" className={btn} onClick={() => helm.turn(3)} aria-label={t('rc.stbd3')}>
          3° ⟳
        </button>
        <button type="button" className={btn} onClick={() => helm.turn(10)} aria-label={t('rc.stbd10')}>
          10° ⟳
        </button>
        <span className="mx-1 hidden h-6 w-px bg-slate-300 sm:block" />
        <button type="button" className={btn} onClick={helm.closeHauled}>
          ↑ {t('rc.closeHauled')}
        </button>
        <button type="button" className={btn} onClick={helm.run}>
          ↓ {t('rc.run')}
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 dark:text-slate-300">
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={showWind} onChange={(e) => setShowWind(e.target.checked)} /> {t('rc.showWind')}
        </label>
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={showLaylines} onChange={(e) => setShowLaylines(e.target.checked)} /> {t('rc.showLaylines')}
        </label>
        <span className="hidden md:inline">{t('rc.keys')}</span>
      </div>
    </div>
  )
}
