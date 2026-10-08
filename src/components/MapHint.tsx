import { useEffect, useState } from 'react'
import { FINE_POINTER, useMediaQuery } from '../hooks/useMediaQuery'

type MapHintProps = {
  onDismiss: () => void
}

export function MapHint({ onDismiss }: MapHintProps) {
  const fine = useMediaQuery(FINE_POINTER)
  const text = fine
    ? 'Click anywhere on the map to find the closest store, or drag the pin to move it.'
    : 'Tap the map to find the closest store, or drag the pin.'

  // A live region only announces content added after it exists, so fill it a
  // moment after mount. It's announced once: the first wording is kept even if
  // the pointer type changes later.
  const [firstText] = useState(text)
  const [announced, setAnnounced] = useState<string | null>(null)
  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(firstText), 300)
    return () => clearTimeout(timer)
  }, [firstText])

  return (
    // The wrapper spans the map but ignores the pointer; only the pill is clickable.
    <div className="map-hint">
      <div className="map-hint__pill">
        {/* Screen readers get the announcement below instead. */}
        <span aria-hidden="true">{text}</span>
        <button
          type="button"
          className="map-hint__close"
          aria-label="Dismiss map hint"
          onClick={onDismiss}
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
      <p className="visually-hidden" role="status">
        {announced}
      </p>
    </div>
  )
}
