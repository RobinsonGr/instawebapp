import { useCallback, useEffect, useRef, useState } from 'react'
import { getClosestStore, StoreApiError, type Store } from '../api/stores'

export type ClosestStoreState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; store: Store }
  | { status: 'not-found' }
  | { status: 'error'; message: string }

export function useClosestStore() {
  const [state, setState] = useState<ClosestStoreState>({ status: 'idle' })
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  const lookup = useCallback(async (lat: number, lng: number) => {
    // A newer click supersedes any request still in flight.
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setState({ status: 'loading' })
    try {
      const store = await getClosestStore(lat, lng, controller.signal)
      setState({ status: 'success', store })
    } catch (err) {
      if (controller.signal.aborted) return
      if (err instanceof StoreApiError && err.code === 'NO_STORE_NEARBY') {
        setState({ status: 'not-found' })
        return
      }
      setState({ status: 'error', message: toMessage(err) })
    }
  }, [])

  return { state, lookup }
}

function toMessage(err: unknown): string {
  if (err instanceof StoreApiError) {
    switch (err.code) {
      case 'INVALID_COORDINATES':
        return 'Those coordinates are not valid. Try another point.'
      case 'NO_STORE_NEARBY':
      case 'UNKNOWN':
        return 'Something went wrong. Please try again.'
    }
  }
  return 'Could not reach the server. Please try again.'
}
