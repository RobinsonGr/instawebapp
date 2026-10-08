import type { LatLngLiteral } from 'leaflet'

const EARTH_RADIUS_M = 6_371_000

/** Great-circle (haversine) distance in meters. */
export function distanceMeters(a: LatLngLiteral, b: LatLngLiteral): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h))
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`
}

export function formatCoordinates({ lat, lng }: LatLngLiteral): string {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
}
