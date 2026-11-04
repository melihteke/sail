import type { LatLngExpression, Map as LeafletMap } from 'leaflet'
import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import type { Environment } from '../../core/environment'
import type { LatLon } from '../../core/geo'
import type { MessageKey } from '../../i18n/en'
import { useI18n, type Translate } from '../../i18n'
import { loadJson, saveJson } from '../../lib/storage'
import { buoyIcon, BUOY_PALETTE, type BuoyKind } from '../../map/buoyIcon'
import { BuoyPreview } from '../../map/BuoyPreview'
import { finishIcon, pinIcon, roundingMarkIcon } from '../../map/icons'
import { Game } from './RoutePlannerGame'
import type { Scenario, ScenarioMark } from './scenarios'

type RoundTool = 'round-port' | 'round-starboard'
type ToolId = 'start' | 'finish' | RoundTool | BuoyKind

interface FreeSetup {
  start: LatLon | null
  finish: LatLon | null
  marks: ScenarioMark[]
  buoys: { id: BuoyKind; at: LatLon }[]
  env: Environment
  view: { center: LatLon; zoom: number }
}

const STORAGE_KEY = 'sg-free-plan'
const EMPTY: FreeSetup = {
  start: null,
  finish: null,
  marks: [],
  buoys: [],
  env: { windFromDeg: 0, windSpeedKn: 12, currentSetDeg: 90, currentSpeedKn: 0 },
  view: { center: { lat: 45, lon: 5 }, zoom: 4 },
}

const ll = (p: LatLon): LatLngExpression => [p.lat, p.lon]

interface SearchResult {
  display_name: string
  lat: string
  lon: string
}

function MapBridge({ onReady, onMove }: { onReady: (m: LeafletMap) => void; onMove: (c: LatLon, z: number) => void }) {
  const map = useMap()
  useEffect(() => {
    onReady(map)
  }, [map, onReady])
  useMapEvents({
    moveend: () => {
      const c = map.getCenter()
      onMove({ lat: c.lat, lon: c.lng }, map.getZoom())
    },
  })
  return null
}

function ClickHandler({ onClick }: { onClick: (p: LatLon) => void }) {
  useMapEvents({ click: (e) => onClick({ lat: e.latlng.lat, lon: e.latlng.lng }) })
  return null
}

export function FreePlanner() {
  const { t } = useI18n()
  const [setup, setSetup] = useState<FreeSetup>(() => ({ ...EMPTY, ...loadJson<Partial<FreeSetup>>(STORAGE_KEY, {}) }))
  const [planning, setPlanning] = useState(false)

  useEffect(() => saveJson(STORAGE_KEY, setup), [setup])

  const scenario = useMemo<Scenario | null>(() => {
    if (!setup.start || !setup.finish) return null
    return {
      id: 'free',
      group: 'open',
      difficulty: 'medium',
      start: setup.start,
      finish: setup.finish,
      env: setup.env,
      marks: setup.marks,
      decorations: setup.buoys,
      free: true,
    }
  }, [setup])

  if (planning && scenario) {
    return <Game key={JSON.stringify(scenario)} scenario={scenario} mode="learning" onEditSetup={() => setPlanning(false)} />
  }
  return <Setup setup={setup} setSetup={setSetup} onStart={() => setPlanning(true)} t={t} />
}

interface SetupProps {
  setup: FreeSetup
  setSetup: (fn: (s: FreeSetup) => FreeSetup) => void
  onStart: () => void
  t: Translate
}

function Setup({ setup, setSetup, onStart, t }: SetupProps) {
  const [tool, setTool] = useState<ToolId | null>(setup.start ? null : 'start')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const mapRef = useRef<LeafletMap | null>(null)

  const update = (patch: Partial<FreeSetup>) => setSetup((s) => ({ ...s, ...patch }))
  const startIcon = useMemo(() => pinIcon('A', '#0b3a5c'), [])
  const endIcon = useMemo(() => finishIcon(), [])

  const place = (id: ToolId, p: LatLon) => {
    if (id === 'start') update({ start: p })
    else if (id === 'finish') update({ finish: p })
    else if (id === 'round-port' || id === 'round-starboard')
      setSetup((s) => ({ ...s, marks: [...s.marks, { at: p, side: id === 'round-port' ? 'port' : 'starboard', kind: 'buoy' }] }))
    else setSetup((s) => ({ ...s, buoys: [...s.buoys, { id, at: p }] }))
  }

  const onMapClick = (p: LatLon) => {
    if (!tool) return
    place(tool, p)
    // A and B are single points; marks and buoys stay selected for placing several.
    if (tool === 'start') setTool(setup.finish ? null : 'finish')
    else if (tool === 'finish') setTool(null)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain') as ToolId
    const map = mapRef.current
    if (!map || !id) return
    const latlng = map.mouseEventToLatLng(e.nativeEvent)
    place(id, { lat: latlng.lat, lon: latlng.lng })
  }

  const search = async (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query.trim())}`
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      setResults(res.ok ? ((await res.json()) as SearchResult[]) : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const goTo = (r: SearchResult) => {
    mapRef.current?.flyTo([Number(r.lat), Number(r.lon)], 11)
    setResults(null)
  }

  const fit = () => {
    const pts = [setup.start, setup.finish, ...setup.marks.map((m) => m.at), ...setup.buoys.map((b) => b.at)].filter((p): p is LatLon => !!p)
    if (pts.length) mapRef.current?.fitBounds(pts.map((p) => [p.lat, p.lon] as [number, number]), { padding: [60, 60], maxZoom: 13 })
  }

  const drag = (id: ToolId) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => e.dataTransfer.setData('text/plain', id),
  })
  const toolBtn = (id: ToolId) =>
    `rounded-lg border p-1.5 text-sm ${tool === id ? 'border-sea-500 bg-sea-100 dark:bg-navy-700' : 'border-slate-200 dark:border-white/10'}`

  const moveTo = (e: { target: { getLatLng: () => { lat: number; lng: number } } }): LatLon => {
    const p = e.target.getLatLng()
    return { lat: p.lat, lon: p.lng }
  }

  return (
    <div className="flex flex-col lg:h-[calc(100vh-7.25rem)] lg:flex-row">
      <div className="relative h-[60vh] lg:h-auto lg:flex-1" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <MapContainer center={ll(setup.view.center)} zoom={setup.view.zoom} className="h-full w-full" scrollWheelZoom worldCopyJump>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />
          <MapBridge onReady={(m) => (mapRef.current = m)} onMove={(center, zoom) => update({ view: { center, zoom } })} />
          <ClickHandler onClick={onMapClick} />

          {setup.buoys.map((b, i) => (
            <Marker key={`b${i}-${b.at.lat}`} position={ll(b.at)} icon={buoyIcon(b.id)} draggable eventHandlers={{ dragend: (e) => setSetup((s) => ({ ...s, buoys: s.buoys.map((x, j) => (j === i ? { ...x, at: moveTo(e) } : x)) })) }}>
              <Tooltip direction="top">{b.id === 'race' ? t('np.raceMark') : t(`mark.${b.id}.name` as MessageKey)}</Tooltip>
              <Popup>
                <button type="button" className="btn-secondary" onClick={() => setSetup((s) => ({ ...s, buoys: s.buoys.filter((_, j) => j !== i) }))}>
                  🗑 {t('np.remove')}
                </button>
              </Popup>
            </Marker>
          ))}

          {setup.marks.map((m, i) => (
            <Marker key={`m${i}-${m.at.lat}`} position={ll(m.at)} icon={roundingMarkIcon(m.kind, m.side)} draggable eventHandlers={{ dragend: (e) => setSetup((s) => ({ ...s, marks: s.marks.map((x, j) => (j === i ? { ...x, at: moveTo(e) } : x)) })) }}>
              <Tooltip direction="top" permanent className="!text-xs">
                {i + 1}. {t(`fp.round.${m.side}`)}
              </Tooltip>
              <Popup>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setSetup((s) => ({ ...s, marks: s.marks.map((x, j) => (j === i ? { ...x, side: x.side === 'port' ? 'starboard' : 'port' } : x)) }))}
                  >
                    ⇄ {t('fp.flipSide')}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setSetup((s) => ({ ...s, marks: s.marks.filter((_, j) => j !== i) }))}>
                    🗑 {t('np.remove')}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {setup.start && (
            <Marker position={ll(setup.start)} icon={startIcon} draggable eventHandlers={{ dragend: (e) => update({ start: moveTo(e) }) }}>
              <Tooltip direction="bottom">{t('np.departure')}</Tooltip>
            </Marker>
          )}
          {setup.finish && (
            <Marker position={ll(setup.finish)} icon={endIcon} draggable eventHandlers={{ dragend: (e) => update({ finish: moveTo(e) }) }}>
              <Tooltip direction="top">{t('np.destination')}</Tooltip>
            </Marker>
          )}
        </MapContainer>
        <div className="pointer-events-none absolute bottom-6 left-2 z-[1000] max-w-[70%] rounded-lg bg-white/90 px-2 py-1 text-xs shadow dark:bg-navy-900/90">
          {tool ? t('fp.toolHint', { tool: toolLabel(tool, t) }) : t('fp.idleHint')}
        </div>
      </div>

      <aside className="w-full overflow-y-auto border-l border-slate-200 bg-white p-4 lg:w-[26rem] dark:border-white/10 dark:bg-navy-950">
        <Link to="/route-planner" className="text-sm text-sea-500 hover:underline">
          ← {t('rp.scenarios')}
        </Link>
        <h1 className="mt-1 text-xl font-bold">{t('scenario.free.title')}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('fp.intro')}</p>

        <section className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-white/10">
          <h2 className="mb-2 text-sm font-semibold">1. {t('fp.step.find')}</h2>
          <form onSubmit={search} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('fp.searchPlaceholder')}
              className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-white/20 dark:bg-navy-900"
            />
            <button type="submit" className="btn-secondary" disabled={searching}>
              🔍
            </button>
          </form>
          {results && (
            <ul className="mt-2 space-y-1 text-xs">
              {results.length === 0 && <li className="text-slate-500">{t('fp.noResults')}</li>}
              {results.map((r) => (
                <li key={`${r.lat},${r.lon}`}>
                  <button type="button" className="w-full rounded px-2 py-1 text-left hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => goTo(r)}>
                    {r.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1 text-[11px] text-slate-400">{t('fp.searchNote')}</p>
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-white/10">
          <h2 className="mb-2 text-sm font-semibold">2. {t('fp.step.place')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('fp.placeHelp')}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            <button type="button" className={toolBtn('start')} onClick={() => setTool(tool === 'start' ? null : 'start')} {...drag('start')}>
              📍 A
            </button>
            <button type="button" className={toolBtn('finish')} onClick={() => setTool(tool === 'finish' ? null : 'finish')} {...drag('finish')}>
              🏁 B
            </button>
            <button type="button" className={toolBtn('round-port')} onClick={() => setTool(tool === 'round-port' ? null : 'round-port')} {...drag('round-port')}>
              ↺ {t('fp.round.port')}
            </button>
            <button type="button" className={toolBtn('round-starboard')} onClick={() => setTool(tool === 'round-starboard' ? null : 'round-starboard')} {...drag('round-starboard')}>
              ↻ {t('fp.round.starboard')}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t('fp.buoysHelp')}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {BUOY_PALETTE.map((id) => (
              <button
                key={id}
                type="button"
                title={id === 'race' ? t('np.raceMark') : t(`mark.${id}.name` as MessageKey)}
                className={toolBtn(id)}
                onClick={() => setTool(tool === id ? null : id)}
                {...drag(id)}
              >
                <BuoyPreview id={id} className="h-9 w-6" />
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={fit}>
              🔎 {t('fp.fit')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                if (!window.confirm(t('fp.clearConfirm'))) return
                setSetup((s) => ({ ...EMPTY, view: s.view, env: s.env }))
                setTool('start')
              }}
            >
              🗑 {t('fp.clearAll')}
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-white/10">
          <h2 className="mb-2 text-sm font-semibold">3. {t('np.step.conditions')}</h2>
          <EnvInputs env={setup.env} onChange={(env) => update({ env })} t={t} />
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 p-3 dark:border-white/10">
          <h2 className="mb-2 text-sm font-semibold">4. {t('fp.step.plan')}</h2>
          <ul className="mb-3 space-y-0.5 text-xs">
            <li>{setup.start ? '✓' : '○'} {t('np.departure')}</li>
            <li>{setup.finish ? '✓' : '○'} {t('np.destination')}</li>
            <li>
              {setup.marks.length} {t('fp.roundingMarks')} · {setup.buoys.length} {t('fp.symbolicBuoys')}
            </li>
          </ul>
          <button type="button" className="btn-primary w-full" disabled={!setup.start || !setup.finish} onClick={onStart}>
            🔒 {t('fp.lockAndPlan')}
          </button>
          <p className="mt-2 text-[11px] text-slate-400">{t('fp.limits')}</p>
        </section>
      </aside>
    </div>
  )
}

function toolLabel(tool: ToolId, t: Translate): string {
  if (tool === 'start') return t('np.departure')
  if (tool === 'finish') return t('np.destination')
  if (tool === 'round-port' || tool === 'round-starboard') return t(`fp.round.${tool === 'round-port' ? 'port' : 'starboard'}`)
  if (tool === 'race') return t('np.raceMark')
  return t(`mark.${tool}.name` as MessageKey)
}

function EnvInputs({ env, onChange, t }: { env: Environment; onChange: (e: Environment) => void; t: Translate }) {
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
