import { CircleMarker, MapContainer, Rectangle, TileLayer, Tooltip } from 'react-leaflet'
import { toLatLon, type CourseData } from './sim'

/**
 * Zoomed-out overview of where a course lies, so players see the bay / lake / coast around it.
 * Sea courses zoom out further than lakes; the box marks the race area.
 */
export function RaceAreaMap({ id, course, label }: { id: string; course: CourseData; label: string }) {
  const xs = course.objects.map((o) => o.at[0])
  const ys = course.objects.map((o) => o.at[1])
  const pad = course.legM * 0.3
  const sw = toLatLon(course, Math.min(...xs) - pad, Math.min(...ys) - pad)
  const ne = toLatLon(course, Math.max(...xs) + pad, Math.max(...ys) + pad)
  const center: [number, number] = [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2]
  return (
    <MapContainer
      key={id}
      center={center}
      zoom={course.mask ? 10 : 11}
      minZoom={5}
      maxZoom={16}
      scrollWheelZoom={false}
      attributionControl
      className="h-60 w-full sm:h-72"
    >
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Rectangle bounds={[sw, ne]} pathOptions={{ color: '#f97316', weight: 2, fillColor: '#f97316', fillOpacity: 0.15 }} />
      <CircleMarker center={center} radius={4} pathOptions={{ color: '#0b3a5c', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }}>
        <Tooltip direction="top" offset={[0, -6]} permanent>
          {label}
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  )
}
