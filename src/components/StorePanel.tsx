import type { Ref } from 'react'
import type { LatLngLiteral } from 'leaflet'
import type { Store } from '../api/stores'
import { isInCoverage } from '../config/coverage'
import type { ApiStatus } from '../hooks/useApiStatus'
import type { ClosestStoreState } from '../hooks/useClosestStore'
import type { CoordinateInput } from '../lib/coordinates'
import { distanceMeters, formatCoordinates, formatDistance } from '../lib/geo'
import { ApiStatusChip } from './ApiStatusChip'
import { CoordinateForm } from './CoordinateForm'
import { LocateButton } from './LocateButton'
import { PresetButtons } from './PresetButtons'

type StorePanelProps = {
  ref?: Ref<HTMLElement>
  state: ClosestStoreState
  apiStatus: ApiStatus
  selected: LatLngLiteral | null
  input: CoordinateInput
  onInputChange: (input: CoordinateInput) => void
  onSearch: (coords: LatLngLiteral) => void
}

export function StorePanel({
  ref,
  state,
  apiStatus,
  selected,
  input,
  onInputChange,
  onSearch,
}: StorePanelProps) {
  const busy = state.status === 'loading'

  return (
    <aside ref={ref} className="panel" aria-label="Store search">
      <ApiStatusChip status={apiStatus} />
      <section className="panel__section" aria-labelledby="search-title">
        <h2 id="search-title" className="panel__title">
          Search
        </h2>
        <CoordinateForm
          value={input}
          busy={busy}
          onChange={onInputChange}
          onSubmit={onSearch}
        />
        <div className="coverage">
          <p className="coverage__text">
            <span className="coverage__label">Coverage</span> Demo stores are
            available in Medellín and Bogotá only.
          </p>
          <PresetButtons disabled={busy} onSelect={onSearch} />
        </div>
        <LocateButton disabled={busy} onLocate={onSearch} />
      </section>

      <section
        className="panel__section"
        aria-labelledby="result-title"
        aria-live="polite"
        aria-busy={busy}
      >
        <h2 id="result-title" className="panel__title">
          Closest store
        </h2>
        <Result
          state={state}
          waking={apiStatus === 'waking'}
          selected={selected}
          onSearch={onSearch}
        />
      </section>
    </aside>
  )
}

type ResultProps = Pick<StorePanelProps, 'state' | 'selected' | 'onSearch'> & {
  /** The server is cold-starting, so a search may take a while. */
  waking: boolean
}

function Result({ state, waking, selected, onSearch }: ResultProps) {
  // Shown before the API answers; a 404 then explains itself, and a found
  // store makes the warning moot.
  const outside =
    selected !== null &&
    !isInCoverage(selected) &&
    (state.status === 'loading' || state.status === 'error')

  return (
    <>
      {outside && (
        <p className="callout callout--info callout--sm">
          This point is outside the demo coverage, so no store is likely to be
          found.
        </p>
      )}
      <ResultBody
        state={state}
        waking={waking}
        selected={selected}
        onSearch={onSearch}
      />
    </>
  )
}

function ResultBody({ state, waking, selected, onSearch }: ResultProps) {
  switch (state.status) {
    case 'idle':
      return (
        <p className="empty-state">
          Click or drag on the map, type coordinates, or pick a city.
        </p>
      )
    case 'loading':
      return (
        <div className="skeleton">
          {waking ? (
            <p className="loading-note">
              <span className="spinner" aria-hidden="true" />
              Waiting for the server to wake up…
            </p>
          ) : (
            <span className="visually-hidden">Finding the closest store…</span>
          )}
          <span className="skeleton__line skeleton__line--title" />
          <span className="skeleton__line skeleton__line--pill" />
          <span className="skeleton__line" />
        </div>
      )
    case 'not-found':
      return (
        <div className="callout callout--info">
          <p>
            No stores within 10 km of this point. Demo data covers Medellín and
            Bogotá.
          </p>
          <PresetButtons onSelect={onSearch} />
        </div>
      )
    case 'error':
      return (
        <p className="callout callout--warning" role="alert">
          {state.message}
        </p>
      )
    case 'success':
      return <ResultCard store={state.store} selected={selected} />
  }
}

function ResultCard({
  store,
  selected,
}: {
  store: Store
  selected: LatLngLiteral | null
}) {
  const { storeName, isOpen, coordinates } = store
  return (
    <div className="result">
      <h3 className="result__name">{storeName}</h3>
      <span className={`pill ${isOpen ? 'pill--open' : 'pill--closed'}`}>
        <span className="pill__dot" aria-hidden="true" />
        {isOpen ? 'Open' : 'Closed'}
      </span>
      <dl className="result__meta">
        <div>
          <dt className="visually-hidden">Coordinates</dt>
          <dd className="result__coords">{formatCoordinates(coordinates)}</dd>
        </div>
        {selected && (
          <div>
            <dt className="visually-hidden">Distance</dt>
            <dd className="result__distance">
              {formatDistance(distanceMeters(selected, coordinates))} from the
              selected point
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
