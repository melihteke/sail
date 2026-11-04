import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet'
import { useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import type { LatLon } from '../../core/geo'
import type { EvaluatedRoute } from '../../core/route'
import { buoyIcon, type BuoyKind } from '../../map/buoyIcon'
import { boatIcon, finishIcon, pinIcon, roundingMarkIcon } from '../../map/icons'

export interface BoatMarker {
  position: LatLon
  headingDeg: number
  /** Signed true wind angle; positive = wind over starboard. Used to set the sail to leeward. */
  twa: number
  variant: 'player' | 'ghost'
}

export interface Layline {
  from: LatLon
  to: LatLon
}

export interface MapMark {
  at: LatLon
  kind: 'buoy' | 'dock'
  side: 'port' | 'starboard'
  label: string
  ok: boolean
}

interface Props {
  start: LatLon
  finish: LatLon
  waypoints: LatLon[]
  editable: boolean
  route: EvaluatedRoute
  toLatLon: (p: { x: number; y: number }) => LatLon
  legLabel: (legIndex: number) => string | null
  optimal?: EvaluatedRoute | null
  laylines?: Layline[]
  boats?: BoatMarker[]
  marks?: MapMark[]
  /** Symbolic buoys, display only. */
  decorations?: { id: BuoyKind; at: LatLon; label: string }[]
  /** Legs to show as invalid (e.g. crossing land). */
  badLegs?: number[]
  labels: { start: string; finish: string }
  onAdd: (p: LatLon) => void
  onMove: (index: number, p: LatLon) => void
  onRemove: (index: number) => void
}

const ll = (p: LatLon): LatLngExpression => [p.lat, p.lon]

function ClickHandler({ enabled, onAdd }: { enabled: boolean; onAdd: (p: LatLon) => void }) {
  useMapEvents({
    click(e) {
      if (enabled) onAdd({ lat: e.latlng.lat, lon: e.latlng.lng })
    },
  })
  return null
}

export function RouteMap(props: Props) {
  const { start, finish, waypoints, editable, route, toLatLon, optimal, laylines, boats, labels } = props

  const markKey = (props.marks ?? []).map((m) => `${m.at.lat},${m.at.lon}`).join('|')
  const bounds = useMemo<LatLngBoundsExpression>(() => {
    const extra = markKey ? markKey.split('|').map((s) => ({ lat: Number(s.split(',')[0]), lon: Number(s.split(',')[1]) })) : []
    const pts = [start, finish, ...extra]
    const lats = pts.map((p) => p.lat)
    const lons = pts.map((p) => p.lon)
    const [minLat, maxLat, minLon, maxLon] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)]
    const pad = 0.2
    const dLat = (maxLat - minLat) * pad + 0.002
    const dLon = (maxLon - minLon) * pad + 0.003
    return [
      [minLat - dLat, minLon - dLon],
      [maxLat + dLat, maxLon + dLon],
    ]
  }, [start, finish, markKey])

  const startIcon = useMemo(() => pinIcon('S', '#0b3a5c'), [])
  const endIcon = useMemo(() => finishIcon(), [])

  return (
    <MapContainer bounds={bounds} className="h-full w-full" zoomControl scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <ClickHandler enabled={editable} onAdd={props.onAdd} />

      {laylines?.map((l, i) => (
        <Polyline
          key={`ll-${i}`}
          positions={[ll(l.from), ll(l.to)]}
          pathOptions={{ color: '#7c3aed', weight: 2, dashArray: '6 6', opacity: 0.8 }}
          interactive={false}
        />
      ))}

      {optimal && (
        <Polyline
          positions={optimal.points.map((p) => ll(toLatLon(p)))}
          pathOptions={{ color: '#f59e0b', weight: 4, opacity: 0.9, dashArray: '2 8', lineCap: 'round' }}
          interactive={false}
        />
      )}

      {route.legs.map((leg, i) => {
        const bad = !leg.ok || props.badLegs?.includes(i)
        const color = bad ? '#ef4444' : leg.ok && leg.tack === 'port' ? '#d6312b' : '#1f9a4d'
        const label = props.legLabel(i)
        return (
          <Polyline
            key={`leg-${i}`}
            positions={[ll(toLatLon(leg.from)), ll(toLatLon(leg.to))]}
            pathOptions={{ color, weight: bad ? 5 : 4, opacity: 0.9, dashArray: bad ? '8 6' : undefined }}
          >
            {label && <Tooltip sticky>{label}</Tooltip>}
          </Polyline>
        )
      })}

      <Marker position={ll(start)} icon={startIcon} keyboard={false}>
        <Tooltip direction="bottom">{labels.start}</Tooltip>
      </Marker>
      <Marker position={ll(finish)} icon={endIcon} keyboard={false}>
        <Tooltip direction="top">{labels.finish}</Tooltip>
      </Marker>

      {props.decorations?.map((d, i) => (
        <Marker key={`dec-${i}`} position={ll(d.at)} icon={buoyIcon(d.id)} keyboard={false} interactive>
          <Tooltip direction="top">{d.label}</Tooltip>
        </Marker>
      ))}

      {props.marks?.map((m, i) => (
        <Marker key={`mk-${i}`} position={ll(m.at)} icon={roundingMarkIcon(m.kind, m.side)} keyboard={false}>
          <Tooltip direction="top" permanent className="!text-xs">
            {m.ok ? '✓ ' : ''}
            {m.label}
          </Tooltip>
        </Marker>
      ))}

      {waypoints.map((w, i) => (
        <Marker
          key={`wp-${i}`}
          position={ll(w)}
          icon={pinIcon(String(i + 1), '#1d5f8c', 24)}
          draggable={editable}
          eventHandlers={{
            click: () => editable && props.onRemove(i),
            dragend: (e) => {
              const p = e.target.getLatLng()
              props.onMove(i, { lat: p.lat, lon: p.lng })
            },
          }}
        />
      ))}

      {boats?.map((b, i) => (
        <Marker
          key={`boat-${i}`}
          position={ll(b.position)}
          icon={boatIcon(b.headingDeg, b.twa, b.variant)}
          interactive={false}
          zIndexOffset={b.variant === 'player' ? 1000 : 900}
        />
      ))}
    </MapContainer>
  )
}
