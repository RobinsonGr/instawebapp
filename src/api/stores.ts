export type Store = {
  storeId: string
  storeName: string
  isOpen: boolean
  coordinates: { lat: number; lng: number }
}

export type StoreApiErrorCode =
  'INVALID_COORDINATES' | 'NO_STORE_NEARBY' | 'UNREACHABLE' | 'UNKNOWN'

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

  let res: Response
  try {
    res = await fetch(`${API_URL}/stores/closest?${params}`, { signal })
  } catch (err) {
    if (signal?.aborted) throw err
    throw new StoreApiError('UNREACHABLE', 'Network request failed.')
  }

  if (res.status === 400) {
    throw new StoreApiError(
      'INVALID_COORDINATES',
      await readBadRequestMessage(res),
    )
  }
  if (res.status === 404) {
    throw new StoreApiError('NO_STORE_NEARBY', 'No store nearby.')
  }
  // 502–504 come from a gateway (or the Vite dev proxy) when the API is down.
  if (res.status >= 502 && res.status <= 504) {
    throw new StoreApiError('UNREACHABLE', `API unavailable (${res.status}).`)
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

// 400 body: { message, errors?: [{ field, message }] }. Prefer the field messages.
async function readBadRequestMessage(res: Response): Promise<string> {
  const fallback = 'Invalid coordinates.'
  try {
    const body = (await res.json()) as {
      message?: unknown
      errors?: { message?: unknown }[]
    }
    const fieldMessages = Array.isArray(body.errors)
      ? body.errors
          .map((e) => e.message)
          .filter((m): m is string => typeof m === 'string')
      : []
    if (fieldMessages.length > 0) return fieldMessages.join('. ')
    return typeof body.message === 'string' ? body.message : fallback
  } catch {
    return fallback
  }
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
        const message =
          Math.abs(lat) > 90
            ? 'lat must be between -90 and 90'
            : 'lng must be between -180 and 180'
        reject(new StoreApiError('INVALID_COORDINATES', message))
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
