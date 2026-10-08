import { useState } from 'react'
import {
  CircleMarker,
  Marker,
  Rectangle,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { COVERAGE_AREAS, type CoverageArea } from '../config/coverage'

// Below this zoom the boxes are only a few pixels wide, so each area also gets
// a fixed-size dot to stay findable.
const DOT_BELOW_ZOOM = 8

const labelIcon = (text: string, compact: boolean) =>
  L.divIcon({
    className: `coverage-label${compact ? ' coverage-label--compact' : ''}`,
    html: `<span>${text}</span>`,
    // Sized by CSS; positioned with a transform on the inner span.
    iconSize: undefined,
  })

const LABEL_ICONS = new Map(
  COVERAGE_AREAS.map((area) => [
    area.name,
    {
      full: labelIcon(`${area.name} coverage`, false),
      compact: labelIcon(`${area.name} coverage`, true),
    },
  ]),
)

/** Demo coverage areas. Purely visual: nothing here receives pointer events. */
export function CoverageLayer() {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })
  const compact = zoom < DOT_BELOW_ZOOM

  return COVERAGE_AREAS.map((area) => (
    <CoverageShape key={area.name} area={area} compact={compact} />
  ))
}

function CoverageShape({
  area,
  compact,
}: {
  area: CoverageArea
  compact: boolean
}) {
  const { south, west, north, east } = area.bounds
  const center = { lat: (south + north) / 2, lng: (west + east) / 2 }
  const icons = LABEL_ICONS.get(area.name)

  return (
    <>
      <Rectangle
        bounds={[
          [south, west],
          [north, east],
        ]}
        pathOptions={{ className: 'coverage-area', weight: 1.5 }}
        interactive={false}
      />
      {compact && (
        <CircleMarker
          center={center}
          radius={6}
          pathOptions={{ className: 'coverage-dot', weight: 2 }}
          interactive={false}
        />
      )}
      {icons && (
        <Marker
          position={compact ? center : { lat: north, lng: center.lng }}
          icon={compact ? icons.compact : icons.full}
          interactive={false}
          keyboard={false}
          zIndexOffset={-1000}
        />
      )}
    </>
  )
}
