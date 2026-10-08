import type { LatLngLiteral } from 'leaflet'

export type CoordinateInput = { lat: string; lng: string }
export type CoordinateErrors = { lat?: string; lng?: string }

export function toInput({ lat, lng }: LatLngLiteral): CoordinateInput {
  // Drop trailing zeros: 6.244200 -> "6.2442".
  return {
    lat: String(Number(lat.toFixed(6))),
    lng: String(Number(lng.toFixed(6))),
  }
}

export function validateCoordinates(
  input: CoordinateInput,
):
  | { ok: true; coords: LatLngLiteral }
  | { ok: false; errors: CoordinateErrors } {
  const lat = parseField(input.lat, 'Latitude', 90)
  const lng = parseField(input.lng, 'Longitude', 180)

  if (typeof lat === 'number' && typeof lng === 'number') {
    return { ok: true, coords: { lat, lng } }
  }
  return {
    ok: false,
    errors: {
      lat: typeof lat === 'string' ? lat : undefined,
      lng: typeof lng === 'string' ? lng : undefined,
    },
  }
}

/** The parsed number, or an error message. */
function parseField(
  raw: string,
  label: string,
  limit: number,
): number | string {
  const text = raw.trim()
  if (text === '') return `${label} is required.`
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(text))
    return `${label} must be a number.`
  const value = Number(text)
  if (value < -limit || value > limit) {
    return `${label} must be between -${limit} and ${limit}.`
  }
  return value
}
