import { useCallback, useState } from 'react'
import type { LatLngLiteral } from 'leaflet'

export type GeolocationState =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'error'; message: string }

const OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 60_000,
}

export function useGeolocation(onLocate: (coords: LatLngLiteral) => void) {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' })

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({
        status: 'error',
        message: 'Your browser does not support location.',
      })
      return
    }

    setState({ status: 'locating' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({ status: 'idle' })
        onLocate({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      (err) => setState({ status: 'error', message: toMessage(err) }),
      OPTIONS,
    )
  }, [onLocate])

  return { state, locate }
}

function toMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return 'Location access was denied. Allow it in your browser settings, or click the map instead.'
    case err.POSITION_UNAVAILABLE:
      return 'Your location is unavailable right now. Click the map instead.'
    case err.TIMEOUT:
      return 'Finding your location took too long. Try again or click the map.'
    default:
      return 'Could not get your location. Click the map instead.'
  }
}
