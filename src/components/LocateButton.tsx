import type { LatLngLiteral } from 'leaflet'
import { useGeolocation } from '../hooks/useGeolocation'

type LocateButtonProps = {
  disabled?: boolean
  onLocate: (coords: LatLngLiteral) => void
}

export function LocateButton({ disabled, onLocate }: LocateButtonProps) {
  const { state, locate } = useGeolocation(onLocate)
  const locating = state.status === 'locating'

  return (
    <div className="locate">
      <button
        type="button"
        className="button button--secondary button--block"
        onClick={locate}
        disabled={disabled || locating}
      >
        {locating ? (
          <span className="spinner" aria-hidden="true" />
        ) : (
          <LocationIcon />
        )}
        {locating ? 'Locating…' : 'Use my location'}
      </button>
      {state.status === 'error' && (
        <p className="callout callout--warning callout--sm" role="alert">
          {state.message}
        </p>
      )}
    </div>
  )
}

function LocationIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  )
}
