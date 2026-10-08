import type { LatLngLiteral } from 'leaflet'

export type CoverageArea = {
  name: string
  /** Approximate: the seeded stores' extent plus the API's 10 km search radius. */
  bounds: { south: number; west: number; north: number; east: number }
}

export const COVERAGE_AREAS: CoverageArea[] = [
  {
    name: 'Medellín',
    bounds: { south: 6.06, west: -75.74, north: 6.44, east: -75.41 },
  },
  {
    name: 'Bogotá',
    bounds: { south: 4.51, west: -74.24, north: 4.84, east: -73.94 },
  },
]

export function isInCoverage({ lat, lng }: LatLngLiteral): boolean {
  return COVERAGE_AREAS.some(
    ({ bounds: b }) =>
      lat >= b.south && lat <= b.north && lng >= b.west && lng <= b.east,
  )
}
