export type Store = {
  storeId: string
  storeName: string
  isOpen: boolean
  coordinates: { lat: number; lng: number }
}

export type StoreApiErrorCode =
  'INVALID_COORDINATES' | 'NO_STORE_NEARBY' | 'UNKNOWN'

export class StoreApiError extends Error {
  readonly code: StoreApiErrorCode

  constructor(code: StoreApiErrorCode, message: string) {
    super(message)
    this.name = 'StoreApiError'
    this.code = code
  }
}

// In dev, go through the Vite proxy (see vite.config.ts) to avoid CORS.
const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const MOCK_DELAY_MS = 600

export function getClosestStore(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<Store> {
  return USE_MOCK
    ? getClosestStoreMock(lat, lng, signal)
    : fetchClosestStore(lat, lng, signal)
}

async function fetchClosestStore(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<Store> {
  const params = new URLSearchParams({
    lat: toDecimal(lat),
    lng: toDecimal(lng),
  })
  const res = await fetch(`${API_URL}/stores/closest?${params}`, { signal })

  if (res.status === 400) {
    throw new StoreApiError('INVALID_COORDINATES', 'Invalid coordinates.')
  }
  if (res.status === 404) {
    throw new StoreApiError('NO_STORE_NEARBY', 'No store nearby.')
  }
  if (!res.ok) {
    throw new StoreApiError('UNKNOWN', `Unexpected response (${res.status}).`)
  }

  const body: unknown = await res.json()
  if (!isStore(body)) {
    throw new StoreApiError('UNKNOWN', 'Unexpected response shape.')
  }
  return body
}

// The API only accepts plain decimals; String() can produce exponents like 1e-7.
// Six decimal places is ~0.1 m, well below map click precision.
function toDecimal(n: number): string {
  return n.toFixed(6)
}

function isStore(value: unknown): value is Store {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  const c = v.coordinates as Record<string, unknown> | null | undefined
  return (
    typeof v.storeId === 'string' &&
    typeof v.storeName === 'string' &&
    typeof v.isOpen === 'boolean' &&
    typeof c === 'object' &&
    c !== null &&
    typeof c.lat === 'number' &&
    typeof c.lng === 'number'
  )
}

function getClosestStoreMock(
  lat: number,
  lng: number,
  signal?: AbortSignal,
): Promise<Store> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        reject(new StoreApiError('INVALID_COORDINATES', 'Invalid coordinates.'))
        return
      }
      // Offset by up to ~1 km so the store lands near, not on, the clicked point.
      resolve({
        storeId: `mock-${Date.now()}`,
        storeName: 'InstaStore Mock',
        isOpen: Math.random() < 0.7,
        coordinates: {
          lat: lat + (Math.random() - 0.5) * 0.018,
          lng: lng + (Math.random() - 0.5) * 0.018,
        },
      })
    }, MOCK_DELAY_MS)

    function onAbort() {
      clearTimeout(timer)
      reject(signal?.reason)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
