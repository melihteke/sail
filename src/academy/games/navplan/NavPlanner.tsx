import { type LatLngBoundsExpression, type LatLngExpression, type Map as LeafletMap } from 'leaflet'
import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import type { Environment } from '../../core/environment'
import type { LatLon } from '../../core/geo'
import { minTwa } from '../../core/polar'
import { formatDuration } from '../../core/units'
import { sailboat } from '../../boats/sailboat'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { loadJson, saveJson } from '../../lib/storage'
import { buoyIcon, BUOY_PALETTE } from '../../map/buoyIcon'
import { BuoyPreview } from '../../map/BuoyPreview'
import { FlowField } from '../../map/FlowField'
import { finishIcon, pinIcon } from '../../map/icons'
import { WindCompass } from '../../map/WindCompass'
import { clock, computePlan, planToText, suggestWaypoints } from './plan'
import { presets, type PlacedNavMark } from './presets'

type Tool = 'start' | 'end' | 'route' | { place: PlacedNavMark['id'] } | null

interface SavedPlan {
  presetId: string
  start: LatLon | null
  end: LatLon | null
  marks: PlacedNavMark[]
  waypoints: LatLon[]
  env: Environment
  locked: boolean
  departure: string
}

const STORAGE_KEY = 'sg-navplan-v2'
const PALETTE = BUOY_PALETTE
const markIcon = buoyIcon

const ll = (p: LatLon): LatLngExpression => [p.lat, p.lon]

function nowLocal(): string {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromPreset(id: string): SavedPlan {
  const p = presets.find((x) => x.id === id) ?? presets[0]
  return { presetId: p.id, start: p.start, end: p.end, marks: p.marks, waypoints: [], env: p.env, locked: false, departure: nowLocal() }
}

function MapBridge({ onReady, fitKey, bounds }: { onReady: (m: LeafletMap) => void; fitKey: string; bounds: LatLngBoundsExpression | null }) {
  const map = useMap()
  useEffect(() => {
    onReady(map)
  }, [map, onReady])
  useEffect(() => {
    // Refit only when the preset changes (fitKey), not on every edit.
    if (bounds) map.fitBounds(bounds, { padding: [40, 40] })
  }, [fitKey, map]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

function ClickHandler({ onClick }: { onClick: (p: LatLon) => void }) {
  useMapEvents({ click: (e) => onClick({ lat: e.latlng.lat, lon: e.latlng.lng }) })
  return null
}

export function NavPlanner() {
  const { t } = useI18n()
  const [plan, setPlan] = useState<SavedPlan>(() => loadJson<SavedPlan | null>(STORAGE_KEY, null) ?? fromPreset(presets[0].id))
  const [tool, setTool] = useState<Tool>(null)
  const [copied, setCopied] = useState(false)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => saveJson(STORAGE_KEY, plan), [plan])

  const update = (patch: Partial<SavedPlan>) => setPlan((p) => ({ ...p, ...patch }))
  const { start, end, marks, waypoints, env, locked } = plan

  const computed = useMemo(() => (start && end ? computePlan(start, waypoints, end, env) : null), [start, end, waypoints, env])
  const departure = useMemo(() => new Date(plan.departure || nowLocal()), [plan.departure])

  const bounds = useMemo<LatLngBoundsExpression | null>(() => {
    const pts = [start, end, ...marks.map((m) => m.at)].filter((p): p is LatLon => !!p)
    if (pts.length < 2) return null
    return pts.map((p) => [p.lat, p.lon] as [number, number])
  }, [start, end, marks])

  const onMapClick = (p: LatLon) => {
    if (tool === 'start') {
      update({ start: p })
      setTool(null)
    } else if (tool === 'end') {
      update({ end: p })
      setTool(null)
    } else if (tool && typeof tool === 'object') {
      update({ marks: [...marks, { id: tool.place, at: p }] })
    } else if (locked && start && end) {
      update({ waypoints: [...waypoints, p] })
    }
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') as PlacedNavMark['id']
    const map = mapRef.current
    if (!map || !PALETTE.includes(id) || locked) return
    const latlng = map.mouseEventToLatLng(e.nativeEvent)
    update({ marks: [...marks, { id, at: { lat: latlng.lat, lon: latlng.lng } }] })
  }

  const startIcon = useMemo(() => pinIcon('A', '#0b3a5c'), [])
  const endIcon = useMemo(() => finishIcon(), [])
  const toolActive = (x: Tool) => JSON.stringify(tool) === JSON.stringify(x)

  const copy = async () => {
    if (!computed) return
    try {
      await navigator.clipboard.writeText(planToText(computed, env, departure, t(`np.preset.${plan.presetId}` as MessageKey)))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard may be unavailable (http, permissions); ignore.
    }
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-7.25rem)] lg:flex-row">
      <div className="relative h-[60vh] lg:h-auto lg:flex-1" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <MapContainer bounds={bounds ?? [[52.4, 4.8], [52.9, 5.5]]} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />
          <MapBridge onReady={(m) => (mapRef.current = m)} fitKey={plan.presetId} bounds={bounds} />
          <ClickHandler onClick={onMapClick} />

          {computed &&
            computed.route.legs.map((leg, i) => {
              const a = i === 0 ? start! : waypoints[i - 1]
              const b = i === waypoints.length ? end! : waypoints[i]
              const color = !leg.ok ? '#ef4444' : leg.tack === 'port' ? '#d6312b' : '#1f9a4d'
              return (
                <Polyline key={i} positions={[ll(a), ll(b)]} pathOptions={{ color, weight: 4, dashArray: leg.ok ? undefined : '8 6' }}>
                  <Tooltip sticky>{`${computed.rows[i].from}–${computed.rows[i].to}`}</Tooltip>
                </Polyline>
              )
            })}

          {marks.map((m, i) => (
            <Marker
              key={`m${i}-${m.at.lat}-${m.at.lon}`}
              position={ll(m.at)}
              icon={markIcon(m.id)}
              draggable={!locked}
              eventHandlers={{
                dragend: (e) => {
                  const p = e.target.getLatLng()
                  update({ marks: marks.map((x, j) => (j === i ? { ...x, at: { lat: p.lat, lon: p.lng } } : x)) })
                },
              }}
            >
              <Tooltip direction="top">{m.id === 'race' ? t('np.raceMark') : t(`mark.${m.id}.name` as MessageKey)}</Tooltip>
              {!locked && (
                <Popup>
                  <button type="button" className="btn-secondary" onClick={() => update({ marks: marks.filter((_, j) => j !== i) })}>
                    🗑 {t('np.remove')}
                  </button>
                </Popup>
              )}
            </Marker>
          ))}

          {start && (
            <Marker
              position={ll(start)}
              icon={startIcon}
              draggable={!locked}
              eventHandlers={{ dragend: (e) => update({ start: { lat: e.target.getLatLng().lat, lon: e.target.getLatLng().lng } }) }}
            >
              <Tooltip direction="bottom">{t('np.departure')}</Tooltip>
            </Marker>
          )}
          {end && (
            <Marker
              position={ll(end)}
              icon={endIcon}
              draggable={!locked}
              eventHandlers={{ dragend: (e) => update({ end: { lat: e.target.getLatLng().lat, lon: e.target.getLatLng().lng } }) }}
            >
              <Tooltip direction="top">{t('np.destination')}</Tooltip>
            </Marker>
          )}

          {waypoints.map((w, i) => (
            <Marker
              key={`w${i}`}
              position={ll(w)}
              icon={pinIcon(String(i + 1), '#1d5f8c', 24)}
              draggable={locked}
              eventHandlers={{
                click: () => locked && update({ waypoints: waypoints.filter((_, j) => j !== i) }),
                dragend: (e) => {
                  const p = e.target.getLatLng()
                  update({ waypoints: waypoints.map((x, j) => (j === i ? { lat: p.lat, lon: p.lng } : x)) })
                },
              }}
            />
          ))}
        </MapContainer>
        <FlowField env={env} />
        <div className="pointer-events-none absolute right-3 top-3 z-[1000]">
          <WindCompass env={env} minTwa={minTwa(sailboat.polar)} windLabel={t('rp.wind')} currentLabel={t('rp.current')} noGoLabel={t('rp.noGoShort')} />
        </div>
        <div className="absolute bottom-6 left-2 z-[1000] rounded-lg bg-white/90 px-2 py-1 text-xs shadow dark:bg-navy-900/90">
          {locked ? `🔒 ${t('np.lockedHint')}` : tool && typeof tool === 'object' ? t('np.placeHint') : t('np.editHint')}
        </div>
      </div>

      <aside className="w-full overflow-y-auto border-l border-slate-200 bg-white p-4 lg:w-[30rem] dark:border-white/10 dark:bg-navy-950">
        <Link to="/" className="text-sm text-sea-500 hover:underline">
          ← {t('common.home')}
        </Link>
        <h1 className="mt-1 text-xl font-bold">{t('game.navplan.title')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('np.intro')}</p>

        <Section title={`1. ${t('np.step.area')}`}>
          <select
            className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-white/20 dark:bg-navy-900"
            value={plan.presetId}
            onChange={(e) => {
              setPlan(fromPreset(e.target.value))
              setTool(null)
            }}
          >
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {t(`np.preset.${p.id}` as MessageKey)}
              </option>
            ))}
          </select>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" disabled={locked} className={toolActive('start') ? 'btn-primary' : 'btn-secondary'} onClick={() => setTool(toolActive('start') ? null : 'start')}>
              📍 {t('np.setStart')}
            </button>
            <button type="button" disabled={locked} className={toolActive('end') ? 'btn-primary' : 'btn-secondary'} onClick={() => setTool(toolActive('end') ? null : 'end')}>
              🏁 {t('np.setEnd')}
            </button>
          </div>
        </Section>

        <Section title={`2. ${t('np.step.conditions')}`}>
          <EnvEditor env={env} onChange={(e) => update({ env: e })} t={t} />
        </Section>

        <Section title={`3. ${t('np.step.marks')}`}>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('np.marksHelp')}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {PALETTE.map((id) => (
              <button
                key={id}
                type="button"
                draggable={!locked}
                disabled={locked}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', id)}
                onClick={() => setTool(toolActive({ place: id }) ? null : { place: id })}
                title={id === 'race' ? t('np.raceMark') : t(`mark.${id}.name` as MessageKey)}
                className={`rounded-lg border p-1 ${toolActive({ place: id }) ? 'border-sea-500 bg-sea-100 dark:bg-navy-700' : 'border-slate-200 dark:border-white/10'} disabled:opacity-40`}
              >
                <BuoyPreview id={id} className="h-9 w-6" />
              </button>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{t('np.symbolic')}</p>
          <label className="mt-3 flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={locked}
              onChange={(e) => {
                update({ locked: e.target.checked })
                setTool(null)
              }}
            />
            🔒 {t('np.lock')}
          </label>
        </Section>

        <Section title={`4. ${t('np.step.route')}`}>
          {!locked ? (
            <p className="text-sm text-slate-500">{t('np.lockFirst')}</p>
          ) : (
            <>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('np.routeHelp')}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="btn-secondary" disabled={!waypoints.length} onClick={() => update({ waypoints: waypoints.slice(0, -1) })}>
                  {t('rp.undo')}
                </button>
                <button type="button" className="btn-secondary" disabled={!waypoints.length} onClick={() => update({ waypoints: [] })}>
                  {t('rp.clear')}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={!start || !end}
                  onClick={() => {
                    const s = start && end ? suggestWaypoints(start, end, env) : null
                    if (s) update({ waypoints: s })
                  }}
                >
                  ✨ {t('np.suggest')}
                </button>
              </div>
            </>
          )}
          <label className="mt-3 block text-sm">
            {t('np.departureTime')}
            <input
              type="datetime-local"
              value={plan.departure}
              onChange={(e) => update({ departure: e.target.value })}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-navy-900"
            />
          </label>
        </Section>

        {computed && (
          <Section title={`5. ${t('np.step.plan')}`}>
            <PlanTable plan={computed} departure={departure} t={t} />
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-primary" onClick={copy}>
                {copied ? `✓ ${t('np.copied')}` : `📋 ${t('np.copy')}`}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">{t('np.disclaimer')}</p>
          </Section>
        )}
      </aside>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-white/10">
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function EnvEditor({ env, onChange, t }: { env: Environment; onChange: (e: Environment) => void; t: Translate }) {
  const num = (key: keyof Environment, label: string, min: number, max: number, step: number) => (
    <label className="block text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={env[key]}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (!Number.isNaN(v)) onChange({ ...env, [key]: Math.max(min, Math.min(max, v)) })
        }}
        className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 font-mono text-sm dark:border-white/20 dark:bg-navy-900"
      />
    </label>
  )
  return (
    <div className="grid grid-cols-2 gap-2">
      {num('windFromDeg', `${t('rp.windDirection')} (°)`, 0, 359, 5)}
      {num('windSpeedKn', `${t('rp.windSpeed')} (kn)`, 1, 40, 1)}
      {num('currentSetDeg', `${t('rp.currentDirection')} (°)`, 0, 359, 5)}
      {num('currentSpeedKn', `${t('rp.currentSpeed')} (kn)`, 0, 5, 0.1)}
      <p className="col-span-2 text-[11px] text-slate-400">{t('rp.conventions')}</p>
    </div>
  )
}

function PlanTable({ plan, departure, t }: { plan: ReturnType<typeof computePlan>; departure: Date; t: Translate }) {
  const pad3 = (d: number) => `${Math.round(((d % 360) + 360) % 360)}`.padStart(3, '0')
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-1">{t('rp.leg')}</th>
              <th className="text-right">nm</th>
              <th className="text-right">COG</th>
              <th className="text-right">{t('np.hdg')}</th>
              <th className="text-right">TWA</th>
              <th className="text-right">SOG</th>
              <th className="text-right">{t('rp.time')}</th>
              <th className="text-right">ETA</th>
            </tr>
          </thead>
          <tbody>
            {plan.rows.map((r) => (
              <tr key={r.index} className="border-t border-slate-100 dark:border-white/5">
                <td className="py-1 font-mono">
                  {r.from}→{r.to}
                  {r.maneuver && <span className="ml-1 text-slate-400">↻</span>}
                </td>
                <td className="text-right font-mono">{r.distanceNm.toFixed(1)}</td>
                {r.leg.ok ? (
                  <>
                    <td className="text-right font-mono">{pad3(r.leg.courseDeg)}°</td>
                    <td className="text-right font-mono">{pad3(r.leg.headingDeg)}°</td>
                    <td className={`text-right font-mono ${r.leg.tack === 'port' ? 'text-port' : 'text-starboard'}`}>{Math.abs(Math.round(r.leg.twa))}°</td>
                    <td className="text-right font-mono">{r.leg.sogKn.toFixed(1)}</td>
                    <td className="text-right font-mono">{formatDuration(r.leg.timeS)}</td>
                    <td className="text-right font-mono">{clock(departure, r.endS)}</td>
                  </>
                ) : (
                  <td colSpan={6} className="text-right text-rose-600">
                    {t(`rp.legFail.${r.leg.reason}` as MessageKey)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm font-semibold">
        {plan.totalNm.toFixed(1)} nm · {plan.route.feasible ? formatDuration(plan.totalS) : '–'} · ETA {plan.route.feasible ? clock(departure, plan.totalS) : '–'}
      </p>
      <p className="text-[11px] text-slate-400">{t('np.trueNote')}</p>
    </div>
  )
}
