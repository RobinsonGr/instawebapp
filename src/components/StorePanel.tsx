import type { LatLngLiteral } from 'leaflet'
import type { ClosestStoreState } from '../hooks/useClosestStore'
import type { CoordinateInput } from '../lib/coordinates'
import { CoordinateForm } from './CoordinateForm'
import { PresetButtons } from './PresetButtons'

type StorePanelProps = {
  state: ClosestStoreState
  input: CoordinateInput
  onInputChange: (input: CoordinateInput) => void
  onSearch: (coords: LatLngLiteral) => void
}

export function StorePanel({
  state,
  input,
  onInputChange,
  onSearch,
}: StorePanelProps) {
  return (
    <aside className="store-panel">
      <section className="store-panel__search" aria-label="Search">
        <CoordinateForm
          value={input}
          onChange={onInputChange}
          onSubmit={onSearch}
        />
        <PresetButtons onSelect={onSearch} />
      </section>
      <section className="store-panel__result" aria-live="polite">
        <Result state={state} onSearch={onSearch} />
      </section>
    </aside>
  )
}

type ResultProps = Pick<StorePanelProps, 'state' | 'onSearch'>

function Result({ state, onSearch }: ResultProps) {
  switch (state.status) {
    case 'idle':
      return (
        <p className="store-panel__message">
          Click the map, enter coordinates, or use your location to find the
          closest store.
        </p>
      )
    case 'loading':
      return <p className="store-panel__message">Finding the closest store…</p>
    case 'not-found':
      return (
        <div className="store-panel__message">
          <p>
            No stores within 10 km of this point. Demo data covers Medellín and
            Bogotá.
          </p>
          <PresetButtons onSelect={onSearch} />
        </div>
      )
    case 'error':
      return (
        <p
          className="store-panel__message store-panel__message--error"
          role="alert"
        >
          {state.message}
        </p>
      )
    case 'success': {
      const { storeName, isOpen, coordinates } = state.store
      return (
        <div>
          <div className="store-panel__header">
            <h2 className="store-panel__title">{storeName}</h2>
            <span
              className={`badge ${isOpen ? 'badge--open' : 'badge--closed'}`}
            >
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <dl className="store-panel__coords">
            <dt>Latitude</dt>
            <dd>{coordinates.lat.toFixed(5)}</dd>
            <dt>Longitude</dt>
            <dd>{coordinates.lng.toFixed(5)}</dd>
          </dl>
        </div>
      )
    }
  }
}
