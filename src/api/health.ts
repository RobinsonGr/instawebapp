import { API_URL, fetchWithTimeout, USE_MOCK } from './client'

/** True when GET /health answers 2xx within `timeoutMs`; false otherwise. */
export async function pingHealth(
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<boolean> {
  if (USE_MOCK) return true
  try {
    const res = await fetchWithTimeout(`${API_URL}/health`, {
      signal,
      timeoutMs,
    })
    return res.ok
  } catch (err) {
    if (signal?.aborted) throw err
    return false
  }
}
