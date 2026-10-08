import { useEffect, useMemo, useState, type RefObject } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L, {
  type LatLngLiteral,
  type LeafletEvent,
  type Map as LeafletMap,
} from 'leaflet'
import type { Store } from '../api/stores'
import { FINE_POINTER, useMediaQuery } from '../hooks/useMediaQuery'
import { CoverageLayer } from './CoverageLayer'
import 'leaflet/dist/leaflet.css'

const MEDELLIN: LatLngLiteral = { lat: 6.2442, lng: -75.5812 }
const DEFAULT_ZOOM = 13
// Roughly street level; fitting two very close points shouldn't zoom further.
const MAX_FIT_ZOOM = 16
const FIT_PADDING = 48

// Standard OSM tiles, toned down with --map-tile-filter (index.css). CARTO's
// lighter basemaps now require an API key.
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Markers are styled divIcons (see App.css), so they follow the color tokens
// and need no image assets.
// The dot is 22px but the icon is 44px so it's easy to grab with a finger.
const SELECTED_ICON = L.divIcon({
  className: 'map-marker map-marker--selected',
  html: '<span class="map-marker__dot"></span>',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})
const DRAGGING_CLASS = 'map-marker--dragging'

const storeIcon = (isOpen: boolean) =>
  L.divIcon({
    className: `map-marker map-marker--store ${isOpen ? 'map-marker--open' : 'map-marker--closed'}`,
    html: '<span class="map-marker__pin"><span class="map-marker__core"></span></span>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
const OPEN_STORE_ICON = storeIcon(true)
const CLOSED_STORE_ICON = storeIcon(false)

type StoreMapProps = {
  selected: LatLngLiteral | null
  store: Store | null
  /** A new object here pans the map to it, e.g. after a typed search. */
  focus: LatLngLiteral | null
  /** An element floating over the map (the side panel) to keep points clear of. */
  overlayRef: RefObject<HTMLElement | null>
  /** A click, or the end of a marker drag. */
  onSelect: (coords: LatLngLiteral) => void
  /** Each move while the selected marker is being dragged. */
  onDrag: (coords: LatLngLiteral) => void
}

// Positions past ±180 (from a repeated world copy) are rejected by the API.
function wrapped(latlng: L.LatLng): LatLngLiteral {
  const { lat, lng } = latlng.wrap()
  return { lat, lng }
}

/** Fit options that keep the target out from under the floating panel. */
function fitOptions(map: LeafletMap, overlay: HTMLElement | null) {
  let right = 0
  if (overlay) {
    const mapRect = map.getContainer().getBoundingClientRect()
    const panelRect = overlay.getBoundingClientRect()
    // On mobile the panel sits below the map and covers nothing.
    if (panelRect.top < mapRect.bottom && panelRect.left > mapRect.left) {
      right = Math.max(0, mapRect.right - panelRect.left)
    }
  }
  return {
    paddingTopLeft: L.point(FIT_PADDING, FIT_PADDING),
    paddingBottomRight: L.point(FIT_PADDING + right, FIT_PADDING),
  }
}

function ClickHandler({ onSelect }: Pick<StoreMapProps, 'onSelect'>) {
  useMapEvents({
    click: (e) => onSelect(wrapped(e.latlng)),
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

// MapContainer doesn't forward aria props to its element, so set the label here.
function MapLabel() {
  const map = useMap()
  useEffect(() => {
    map
      .getContainer()
      .setAttribute('aria-label', 'Map. Click to choose a point.')
  }, [map])
  return null
}

function FocusHandler({
  focus,
  overlayRef,
}: Pick<StoreMapProps, 'focus' | 'overlayRef'>) {
  const map = useMap()
  useEffect(() => {
    if (!focus) return
    map.flyToBounds(L.latLngBounds([focus, focus]), {
      ...fitOptions(map, overlayRef.current),
      maxZoom: Math.max(map.getZoom(), DEFAULT_ZOOM),
    })
  }, [map, focus, overlayRef])
  return null
}

// Frame the selected point and its store whenever a new result arrives.
function FitHandler({
  selected,
  store,
  overlayRef,
}: Pick<StoreMapProps, 'selected' | 'store' | 'overlayRef'>) {
  const map = useMap()
  useEffect(() => {
    if (!selected || !store) return
    map.fitBounds(L.latLngBounds([selected, store.coordinates]), {
      ...fitOptions(map, overlayRef.current),
      maxZoom: MAX_FIT_ZOOM,
    })
  }, [map, selected, store, overlayRef])
  return null
}

function SelectedMarker({
  position,
  onDragChange,
  onDrag,
  onSelect,
}: {
  position: LatLngLiteral
  onDragChange: (dragging: boolean) => void
} & Pick<StoreMapProps, 'onDrag' | 'onSelect'>) {
  // Hover tooltips make no sense on touch screens.
  const canHover = useMediaQuery(FINE_POINTER)

  const eventHandlers = useMemo(() => {
    const marker = (e: LeafletEvent) => e.target as L.Marker
    return {
      // A name for screen readers, without a native title tooltip competing
      // with "Drag me".
      add: (e: LeafletEvent) =>
        marker(e).getElement()?.setAttribute('aria-label', 'Selected point'),
      dragstart: (e: LeafletEvent) => {
        marker(e).closeTooltip()
        marker(e).getElement()?.classList.add(DRAGGING_CLASS)
        onDragChange(true)
      },
      // Inputs follow the marker; the API is only called on drop.
      drag: (e: LeafletEvent) => onDrag(wrapped(marker(e).getLatLng())),
      dragend: (e: LeafletEvent) => {
        marker(e).getElement()?.classList.remove(DRAGGING_CLASS)
        onDragChange(false)
        onSelect(wrapped(marker(e).getLatLng()))
      },
    }
  }, [onDragChange, onDrag, onSelect])

  return (
    <Marker
      position={position}
      icon={SELECTED_ICON}
      draggable
      // Stay above the store pin so it can still be grabbed when they overlap.
      zIndexOffset={1000}
      eventHandlers={eventHandlers}
    >
      {canHover && (
        <Tooltip direction="top" offset={[0, -14]} className="map-tooltip">
          Drag me
        </Tooltip>
      )}
    </Marker>
  )
}

export function StoreMap({
  selected,
  store,
  focus,
  overlayRef,
  onSelect,
  onDrag,
}: StoreMapProps) {
  const [dragging, setDragging] = useState(false)

  return (
    <MapContainer center={MEDELLIN} zoom={DEFAULT_ZOOM} className="store-map">
      <TileLayer attribution={ATTRIBUTION} url={TILE_URL} maxZoom={19} />
      <CoverageLayer />
      <ClickHandler onSelect={onSelect} />
      <ResizeHandler />
      <MapLabel />
      <FocusHandler focus={focus} overlayRef={overlayRef} />
      <FitHandler selected={selected} store={store} overlayRef={overlayRef} />
      {selected && (
        <SelectedMarker
          position={selected}
          onDragChange={setDragging}
          onDrag={onDrag}
          onSelect={onSelect}
        />
      )}
      {selected && store && (
        <>
          {/* Hidden mid-drag: it would point from the new spot to a store
              that may no longer be the closest. */}
          {!dragging && (
            <Polyline
              positions={[selected, store.coordinates]}
              pathOptions={{ className: 'route-line', weight: 3 }}
              interactive={false}
            />
          )}
          <Marker
            position={store.coordinates}
            icon={store.isOpen ? OPEN_STORE_ICON : CLOSED_STORE_ICON}
            title={`${store.storeName} (${store.isOpen ? 'open' : 'closed'})`}
          />
        </>
      )}
    </MapContainer>
  )
}
