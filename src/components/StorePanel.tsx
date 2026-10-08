import type { ClosestStoreState } from '../hooks/useClosestStore'

type StorePanelProps = {
  state: ClosestStoreState
}

export function StorePanel({ state }: StorePanelProps) {
  return (
    <aside className="store-panel" aria-live="polite">
      <StorePanelContent state={state} />
    </aside>
  )
}

function StorePanelContent({ state }: StorePanelProps) {
  switch (state.status) {
    case 'idle':
      return (
        <p className="store-panel__message">
          Click the map to find the closest store.
        </p>
      )
    case 'loading':
      return <p className="store-panel__message">Finding the closest store…</p>
    case 'not-found':
      return (
        <div className="store-panel__message">
          <p className="store-panel__title">No store nearby</p>
          <p>
            There is no store close to this point. Try clicking somewhere else.
          </p>
        </div>
      )
    case 'error':
      return (
        <div
          className="store-panel__message store-panel__message--error"
          role="alert"
        >
          <p className="store-panel__title">Something went wrong</p>
          <p>{state.message}</p>
        </div>
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
