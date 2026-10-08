import type { LatLngLiteral } from 'leaflet'

export type Preset = { label: string; coords: LatLngLiteral }

export const PRESETS: Preset[] = [
  { label: 'Medellín', coords: { lat: 6.2442, lng: -75.5812 } },
  { label: 'Bogotá', coords: { lat: 4.711, lng: -74.0721 } },
]
