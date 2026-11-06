import L from 'leaflet'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Circle, ImageOverlay, MapContainer, Marker, Polygon, Polyline, Rectangle, SVGOverlay, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import type { Translate } from '../../i18n'
import { playHorn } from '../../lib/horn'
import { FlowField } from '../../map/FlowField'
import { boatIcon } from '../../map/icons'
import { WindCompass } from '../../map/WindCompass'
import { formatRaceTime } from './raceApi'
import { committeeIcon, pinBuoyIcon, raceMarkIcon } from './raceIcons'
import {
  fromLatLon,
  initialState,
  norm180,
  norm360,
  POLAR,
  SPEEDUP,
  step,
  toLatLon,
  windAt,
  type CourseData,
  type HelmEvent,
  type RaceState,
  type XY,
} from './sim'

const UP_TWA = 45
/** Closest angle to the wind in the polar table: the no-go wedge on the compass. */
const MIN_TWA = POLAR.twa[0]!
const DOWN_TWA = 150

interface Props {
  course: CourseData
  t: Translate
  onEnd: (final: RaceState, events: HelmEvent[]) => void
}

/** Where the boat is heading next: the start line, a mark, or the middle of a gate / finish line. */
const legTarget = (c: CourseData, leg: number): XY | null => {
  if (leg === 0) return [(c.start.committee[0] + c.start.pin[0]) / 2, (c.start.committee[1] + c.start.pin[1]) / 2]
  const L = c.legs[leg - 1]
  if (!L) return null
  return L.kind === 'mark' ? L.at : [(L.a[0] + L.b[0]) / 2, (L.a[1] + L.b[1]) / 2]
}

const CARDINALS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
export const cardinal = (deg: number) => CARDINALS[Math.round(norm360(deg) / 22.5) % 16]!

function FitCourse({ course }: { course: CourseData }) {
  const map = useMap()
  useEffect(() => {
    const pts = [...course.objects.map((o) => o.at), [course.boat.x, course.boat.y] as XY].map(([x, y]) => toLatLon(course, x, y))
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

/** Puffs as soft dark patches on the water (darker = more wind); the streaks come from FlowField. */
function WindField({ course, t, show }: { course: CourseData; t: number; show: boolean }) {
  const [bx0, by0, bx1, by1] = course.bounds
  const pts = useMemo(() => {
    const ms = course.objects.map((o) => o.at)
    const xs = ms.map((p) => p[0])
    const ys = ms.map((p) => p[1])
    const pad = course.legM * 0.45
    const x0 = Math.max(bx0, Math.min(...xs) - pad)
    const x1 = Math.min(bx1, Math.max(...xs) + pad)
    const y0 = Math.max(by0, Math.min(...ys) - pad)
    const y1 = Math.min(by1, Math.max(...ys) + pad)
    const g = Math.max(x1 - x0, y1 - y0) / 10
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
      <defs>
        <radialGradient id="rc-puff">
          <stop offset="0" stopColor="#0b3a5c" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0b3a5c" stopOpacity="0" />
        </radialGradient>
      </defs>
      {pts.out.map(([x, y]) => {
        const w = windAt(course.wind, t, x, y)
        const k = Math.max(0, Math.min(1, (w.tws / base - 0.85) / 0.5))
        return k > 0.3 ? <circle key={`p${x}-${y}`} cx={x} cy={-y} r={pts.g * 0.95} fill="url(#rc-puff)" opacity={(k - 0.3) * 0.8} /> : null
      })}
    </SVGOverlay>
  )
}

/** Sea courses: tint the land of the race grid so the crash line is visible on the map. */
function LandMask({ course }: { course: CourseData }) {
  const url = useMemo(() => {
    const m = course.mask!
    const bin = atob(m.bits)
    const canvas = document.createElement('canvas')
    canvas.width = m.nx
    canvas.height = m.ny
    const ctx = canvas.getContext('2d')!
    const img = ctx.createImageData(m.nx, m.ny)
    const water = (ix: number, iy: number) => {
      if (ix < 0 || iy < 0 || ix >= m.nx || iy >= m.ny) return true
      const i = iy * m.nx + ix
      return (bin.charCodeAt(i >> 3) & (1 << (i & 7))) !== 0
    }
    for (let iy = 0; iy < m.ny; iy++)
      for (let ix = 0; ix < m.nx; ix++) {
        if (water(ix, iy)) continue
        const shore = water(ix + 1, iy) || water(ix - 1, iy) || water(ix, iy + 1) || water(ix, iy - 1)
        img.data.set(shore ? [180, 83, 9, 150] : [241, 226, 180, 40], ((m.ny - 1 - iy) * m.nx + ix) * 4)
      }
    ctx.putImageData(img, 0, 0)
    return canvas.toDataURL()
  }, [course])
  const m = course.mask!
  return <ImageOverlay url={url} bounds={[toLatLon(course, m.x0, m.y0), toLatLon(course, m.x0 + m.nx * m.cell, m.y0 + m.ny * m.cell)]} />
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

  const ll = (p: XY) => toLatLon(course, p[0], p[1])
  const next = legTarget(course, hud.leg)
  const nextLeg = hud.leg > 0 ? course.legs[hud.leg - 1] : undefined
  // Upwind when the next target lies within ~60° of the wind direction.
  const upwindLeg = (() => {
    const p = hud.leg === 0 ? legTarget(course, 1) : next
    if (!p) return false
    const b = (Math.atan2(p[0] - hud.x, p[1] - hud.y) * 180) / Math.PI
    return Math.abs(norm180(b - hud.windDir)) < 60
  })()
  const shift = norm180(hud.windDir - course.wind.dir)
  const lift = hud.side > 0 ? shift : -shift
  const boatIco = useMemo(() => boatIcon(hud.heading, hud.twa, 'player'), [hud.heading, hud.twa])
  // The game loop moves the boat marker itself; React only sets its first position.
  const boatStart = useMemo(() => toLatLon(course, course.boat.x, course.boat.y), [course])

  const laylines = useMemo(() => {
    if (!showLaylines || !upwindLeg || !next) return []
    const ends: XY[] = nextLeg && nextLeg.kind !== 'mark' ? [nextLeg.a, nextLeg.b] : hud.leg === 0 ? [legTarget(course, 1)!] : [next]
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
  const legName = (leg: number) => {
    if (leg === 0) return t('rc.leg.start')
    const L = course.legs[leg - 1]
    if (!L) return t('rc.leg.done')
    if (L.kind === 'mark') return t('rc.leg.mark', { label: L.label, side: t(L.side > 0 ? 'rc.port' : 'rc.starboard') })
    return L.kind === 'gate' ? t('rc.leg.gate', { label: L.label }) : t('rc.leg.finish')
  }
  const isNext = (label: string) => !!nextLeg && (nextLeg.kind === 'mark' ? nextLeg.label === label : nextLeg.kind === 'gate' && nextLeg.label.split('/').includes(label))
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
          <Polyline positions={[ll(course.start.committee), ll(course.start.pin)]} pathOptions={{ color: '#f97316', weight: 2.5, dashArray: '8 6' }} />
          {course.legs.map((L, i) =>
            L.kind === 'mark' ? null : (
              <Polyline
                key={`line${i}`}
                positions={[ll(L.a), ll(L.b)]}
                pathOptions={L.kind === 'finish' ? { color: '#2563eb', weight: 2.5, dashArray: '2 5' } : { color: '#f97316', weight: 1, dashArray: '2 6', opacity: 0.7 }}
              />
            ),
          )}
          {laylines.map((l, i) => (
            <Polyline key={i} positions={l} pathOptions={{ color: '#7c3aed', weight: 1.5, dashArray: '6 6', opacity: 0.7 }} />
          ))}
          {course.mask && <LandMask course={course} />}
          {course.objects.map((o, i) => (
            <Marker
              key={`o${i}`}
              position={ll(o.at)}
              interactive={false}
              icon={
                o.kind === 'committee' || o.kind === 'finishBoat'
                  ? committeeIcon(o.label, o.color)
                  : o.kind === 'mark'
                    ? raceMarkIcon(o.label, o.color, isNext(o.label))
                    : pinBuoyIcon(o.color)
              }
            />
          ))}
          {next && hud.leg !== 0 && <Circle center={ll(next)} radius={22} pathOptions={{ color: '#facc15', weight: 2, fill: false, dashArray: '4 4' }} />}
          {track.length > 1 && <Polyline positions={track} pathOptions={{ color: '#0b3a5c', weight: 2, opacity: 0.6 }} />}
          <Marker position={boatStart} icon={boatIco} ref={boatRef} interactive={false} zIndexOffset={1000} />
        </MapContainer>

        <div className="pointer-events-none absolute left-2 top-2 z-[1000] space-y-1.5">
          <div className="rounded-lg bg-white/90 px-3 py-2 shadow dark:bg-navy-950/85">
            <p className={`font-mono text-2xl font-bold tabular-nums ${hud.t < 0 ? 'text-amber-600' : 'text-navy-900 dark:text-white'}`}>{clock}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t('rc.next')}: <strong>{legName(hud.leg)}</strong>
            </p>
            <p className="font-mono text-xs sm:hidden">
              {((hud.speed * 3600) / 1852).toFixed(1)} kn · {Math.round(Math.abs(hud.twa))}° · {hud.tacks}/{hud.gybes}
            </p>
            <p className="font-mono text-xs text-slate-500 sm:hidden">
              {t('rc.wind')} {hud.tws.toFixed(1)} kn · {cardinal(hud.windDir)}
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

        {showWind && <FlowField env={{ windFromDeg: Math.round(hud.windDir), windSpeedKn: course.wind.speed, currentSetDeg: 0, currentSpeedKn: 0 }} />}
        <div className="pointer-events-none absolute right-2 top-2 z-[1000] flex flex-col items-center gap-1.5 sm:w-44">
          <WindCompass
            env={{ windFromDeg: hud.windDir, windSpeedKn: hud.tws, currentSetDeg: 0, currentSpeedKn: 0 }}
            minTwa={MIN_TWA}
            windLabel={t('rc.windFrom', { dir: `${cardinal(hud.windDir)} ${Math.round(hud.windDir)}` })}
            currentLabel=""
            noGoLabel={t('rp.noGoShort')}
          />
        <div className="hidden w-full rounded-lg bg-white/90 px-3 py-2 text-xs shadow sm:block dark:bg-navy-950/85">
          <p className="font-mono text-base font-bold">{hud.tws.toFixed(1)} kn</p>
          <p className="text-slate-500">{t('rc.windFrom', { dir: `${cardinal(hud.windDir)} ${Math.round(hud.windDir)}` })}</p>
          {hud.t >= 0 && upwindLeg && hud.leg !== 0 && Math.abs(lift) >= 1 && (
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
