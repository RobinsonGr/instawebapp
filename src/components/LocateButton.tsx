import type { LatLngLiteral } from 'leaflet'
import { useGeolocation } from '../hooks/useGeolocation'

type LocateButtonProps = {
  onLocate: (coords: LatLngLiteral) => void
}

export function LocateButton({ onLocate }: LocateButtonProps) {
  const { state, locate } = useGeolocation(onLocate)
  const locating = state.status === 'locating'

  return (
    <div className="locate">
      <button
        type="button"
        className="locate__button"
        onClick={locate}
        disabled={locating}
      >
        {locating ? 'Locating…' : 'Use my location'}
      </button>
      {state.status === 'error' && (
        <p className="locate__error" role="alert">
          {state.message}
        </p>
      )}
    </div>
  )
}
