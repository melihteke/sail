import L from 'leaflet'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { Translate } from '../../i18n'
import { distanceNm } from './almanac'
import { latStr, lonStr, Why } from './ui'

interface P {
  lat: number
  lon: number
}

const dot = (color: string, size = 16) =>
  L.divIcon({
    className: 'sg-divicon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>`,
  })

function FitTo({ points }: { points: P[] }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number])).pad(0.5), { maxZoom: 6 })
  }, [map, points])
  return null
}

function FlyTo({ to }: { to: P | null }) {
  const map = useMap()
  useEffect(() => {
    if (to) map.flyTo([to.lat, to.lon], Math.max(map.getZoom(), 8))
  }, [map, to])
  return null
}

/** Degrees + minutes + hemisphere → decimal degrees. */
export function parseDm(deg: string, min: string, hemi: string): number | null {
  const d = Number(deg.replace(',', '.'))
  const m = Number((min || '0').replace(',', '.'))
  if (!Number.isFinite(d) || !Number.isFinite(m) || d < 0 || m < 0 || m >= 60) return null
  const v = d + m / 60
  return hemi === 'S' || hemi === 'W' ? -v : v
}

export const osmLink = (p: P) => `https://www.openstreetmap.org/?mlat=${p.lat.toFixed(5)}&mlon=${p.lon.toFixed(5)}#map=9/${p.lat.toFixed(4)}/${p.lon.toFixed(4)}`

function splitDm(v: number) {
  const a = Math.abs(v)
  const d = Math.floor(a)
  return { d: String(d), m: ((a - d) * 60).toFixed(1) }
}

/** Plot the noon fix, compare it with the DR and the true position, and drop any coordinates on the chart. */
export default function FixMap({ t, fix, dr, truth }: { t: Translate; fix: P; dr: P; truth: P }) {
  const [reveal, setReveal] = useState(false)
  const init = { lat: splitDm(fix.lat), lon: splitDm(fix.lon) }
  const [latD, setLatD] = useState(init.lat.d)
  const [latM, setLatM] = useState(init.lat.m)
  const [latH, setLatH] = useState(fix.lat >= 0 ? 'N' : 'S')
  const [lonD, setLonD] = useState(init.lon.d)
  const [lonM, setLonM] = useState(init.lon.m)
  const [lonH, setLonH] = useState(fix.lon >= 0 ? 'E' : 'W')
  const [pin, setPin] = useState<P | null>(null)
  const points = useMemo(() => [fix, dr], [fix, dr])
  const errNm = distanceNm(fix.lat, fix.lon, truth.lat, truth.lon)
  const drNm = distanceNm(dr.lat, dr.lon, truth.lat, truth.lon)

  const place = () => {
    const lat = parseDm(latD, latM, latH)
    const lon = parseDm(lonD, lonM, lonH)
    if (lat === null || lon === null || Math.abs(lat) > 90 || Math.abs(lon) > 180) return
    setPin({ lat, lon })
  }
  const input = 'w-16 rounded border border-slate-300 bg-white px-2 py-1 font-mono text-sm dark:border-white/20 dark:bg-navy-900'

  return (
    <div className="space-y-4">
      <Why title={t('cn.why')}>
        <p>{t('cn.plot.why1')}</p>
        <p>{t('cn.plot.why2')}</p>
      </Why>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="h-[26rem] overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <MapContainer center={[fix.lat, fix.lon]} zoom={8} className="h-full w-full" scrollWheelZoom>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={18} />
            <TileLayer attribution='&copy; <a href="https://www.openseamap.org">OpenSeaMap</a>' url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png" maxZoom={18} />
            <FitTo points={points} />
            <FlyTo to={pin} />
            <Marker position={[dr.lat, dr.lon]} icon={dot('#94a3b8')}>
              <Tooltip permanent direction="right">DR</Tooltip>
            </Marker>
            <Marker position={[fix.lat, fix.lon]} icon={dot('#1d4ed8')}>
              <Tooltip permanent direction="right">{t('cn.plot.fix')}</Tooltip>
            </Marker>
            {reveal && (
              <>
                <Marker position={[truth.lat, truth.lon]} icon={dot('#16a34a')}>
                  <Tooltip permanent direction="left">{t('cn.plot.truth')}</Tooltip>
                </Marker>
                <Polyline positions={[[fix.lat, fix.lon], [truth.lat, truth.lon]]} pathOptions={{ color: '#16a34a', dashArray: '4 4' }} />
              </>
            )}
            {pin && (
              <Marker position={[pin.lat, pin.lon]} icon={dot('#a21caf', 14)}>
                <Tooltip permanent direction="top">
                  {latStr(pin.lat)} {lonStr(pin.lon)}
                </Tooltip>
              </Marker>
            )}
          </MapContainer>
        </div>
        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-900/60">
            <p className="font-medium">{t('cn.plot.yourFix')}</p>
            <p className="font-mono">
              {latStr(fix.lat)}
              <br />
              {lonStr(fix.lon)}
            </p>
            <a className="mt-1 inline-block text-sea-500 hover:underline" href={osmLink(fix)} target="_blank" rel="noreferrer">
              {t('cn.plot.openOsm')} ↗
            </a>
            {!reveal ? (
              <button type="button" className="btn-primary mt-3 block" onClick={() => setReveal(true)}>
                🎯 {t('cn.plot.reveal')}
              </button>
            ) : (
              <div className="mt-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/40">
                <p className="font-mono">
                  {latStr(truth.lat)} {lonStr(truth.lon)}
                </p>
                <p className="mt-1">{t('cn.plot.result', { err: errNm.toFixed(1), dr: drNm.toFixed(1) })}</p>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-navy-900/60">
            <p className="font-medium">{t('cn.plot.coordsTitle')}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('cn.plot.coordsHelp')}</p>
            <div className="mt-2 flex items-center gap-1">
              <input aria-label={t('sx.degrees')} className={input} value={latD} onChange={(e) => setLatD(e.target.value)} inputMode="numeric" />°
              <input aria-label={t('sx.minutes')} className={input} value={latM} onChange={(e) => setLatM(e.target.value)} inputMode="decimal" />′
              <select aria-label="N/S" className={input} value={latH} onChange={(e) => setLatH(e.target.value)}>
                <option>N</option>
                <option>S</option>
              </select>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <input aria-label={t('sx.degrees')} className={input} value={lonD} onChange={(e) => setLonD(e.target.value)} inputMode="numeric" />°
              <input aria-label={t('sx.minutes')} className={input} value={lonM} onChange={(e) => setLonM(e.target.value)} inputMode="decimal" />′
              <select aria-label="E/W" className={input} value={lonH} onChange={(e) => setLonH(e.target.value)}>
                <option>E</option>
                <option>W</option>
              </select>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-primary" onClick={place}>
                📍 {t('cn.plot.place')}
              </button>
              {pin && (
                <a className="btn-secondary" href={osmLink(pin)} target="_blank" rel="noreferrer">
                  OpenStreetMap ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
