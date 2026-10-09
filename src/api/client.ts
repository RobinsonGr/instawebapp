// In dev, go through the Vite proxy (see vite.config.ts) to avoid CORS.
export const API_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Request timed out after ${ms} ms.`)
    this.name = 'TimeoutError'
  }
}

/**
 * fetch() that gives up after `timeoutMs`. Throws TimeoutError on timeout and
 * rethrows the caller's abort as-is, so callers can tell the two apart.
 */
export async function fetchWithTimeout(
  url: string,
  { signal, timeoutMs }: { signal?: AbortSignal; timeoutMs: number },
): Promise<Response> {
  const controller = new AbortController()
  const onAbort = () => controller.abort(signal?.reason)
  signal?.addEventListener('abort', onAbort, { once: true })
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  try {
    return await fetch(url, { signal: controller.signal })
  } catch (err) {
    if (timedOut && !signal?.aborted) throw new TimeoutError(timeoutMs)
    throw err
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

/** Resolves after `ms`, or rejects as soon as `signal` aborts. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    function onAbort() {
      clearTimeout(timer)
      reject(signal?.reason)
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
