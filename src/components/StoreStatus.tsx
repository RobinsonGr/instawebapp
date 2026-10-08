import type { ClosestStoreState } from '../hooks/useClosestStore'

type StoreStatusProps = {
  state: ClosestStoreState
}

export function StoreStatus({ state }: StoreStatusProps) {
  switch (state.status) {
    case 'idle':
      return (
        <div className="store-status">
          Click the map to find the closest store.
        </div>
      )
    case 'loading':
      return <div className="store-status">Finding the closest store…</div>
    case 'error':
      return (
        <div className="store-status store-status--error" role="alert">
          {state.message}
        </div>
      )
    case 'success':
      return (
        <div className="store-status">
          <strong>{state.store.storeName}</strong> ·{' '}
          {state.store.isOpen ? 'Open' : 'Closed'}
        </div>
      )
  }
}
