import { useEffect } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L, { type LatLngLiteral } from 'leaflet'
import type { Store } from '../api/stores'
import 'leaflet/dist/leaflet.css'
import '../lib/leafletIcon'

const MEDELLIN: LatLngLiteral = { lat: 6.2442, lng: -75.5812 }
const DEFAULT_ZOOM = 13

const storeIcon = (isOpen: boolean) =>
  L.divIcon({
    className: `store-marker ${isOpen ? 'store-marker--open' : 'store-marker--closed'}`,
    html: '<span></span>',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  })
const OPEN_STORE_ICON = storeIcon(true)
const CLOSED_STORE_ICON = storeIcon(false)

type StoreMapProps = {
  selected: LatLngLiteral | null
  store: Store | null
  onSelect: (coords: LatLngLiteral) => void
}

function ClickHandler({ onSelect }: Pick<StoreMapProps, 'onSelect'>) {
  useMapEvents({
    click: (e) => onSelect({ lat: e.latlng.lat, lng: e.latlng.lng }),
  })
  return null
}

// Leaflet only listens for window resizes; the container also changes size
// when the mobile bottom sheet grows or shrinks.
function ResizeHandler() {
  const map = useMap()
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])
  return null
}

export function StoreMap({ selected, store, onSelect }: StoreMapProps) {
  return (
    <MapContainer center={MEDELLIN} zoom={DEFAULT_ZOOM} className="store-map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onSelect={onSelect} />
      <ResizeHandler />
      {selected && <Marker position={selected} />}
      {selected && store && (
        <>
          <Polyline
            positions={[selected, store.coordinates]}
            pathOptions={{ color: '#2563eb', weight: 3, dashArray: '6 8' }}
          />
          <Marker
            position={store.coordinates}
            icon={store.isOpen ? OPEN_STORE_ICON : CLOSED_STORE_ICON}
            title={store.storeName}
          />
        </>
      )}
    </MapContainer>
  )
}
