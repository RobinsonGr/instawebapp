import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import type { LatLngLiteral } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../lib/leafletIcon'

const MEDELLIN: LatLngLiteral = { lat: 6.2442, lng: -75.5812 }
const DEFAULT_ZOOM = 13

type StoreMapProps = {
  selected: LatLngLiteral | null
  onSelect: (coords: LatLngLiteral) => void
}

function ClickHandler({ onSelect }: Pick<StoreMapProps, 'onSelect'>) {
  useMapEvents({
    click: (e) => onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }),
  })
  return null
}

export function StoreMap({ selected, onSelect }: StoreMapProps) {
  return (
    <MapContainer center={MEDELLIN} zoom={DEFAULT_ZOOM} className="store-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onSelect={onSelect} />
      {selected && <Marker position={selected} />}
    </MapContainer>
  )
}
