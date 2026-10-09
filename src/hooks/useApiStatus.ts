import { useCallback, useEffect, useRef, useState } from 'react'
import { sleep } from '../api/client'
import { pingHealth } from '../api/health'

/**
 * checking: first ping in flight (under SLOW_AFTER_MS, so nothing is shown)
 * waking:   no answer yet; a free-tier server may be cold-starting
 * ready:    /health answered, or a search succeeded
 * down:     still nothing after GIVE_UP_AFTER_MS
 */
export type ApiStatus = 'checking' | 'waking' | 'ready' | 'down'

const SLOW_AFTER_MS = 3_000
const POLL_INTERVAL_MS = 4_000
const PING_TIMEOUT_MS = 10_000
const GIVE_UP_AFTER_MS = 90_000

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus>('checking')
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller
    const startedAt = Date.now()

    const slowTimer = setTimeout(
      () => setStatus((s) => (s === 'checking' ? 'waking' : s)),
      SLOW_AFTER_MS,
    )
    const giveUpTimer = setTimeout(() => {
      controller.abort()
      setStatus((s) => (s === 'ready' ? s : 'down'))
    }, GIVE_UP_AFTER_MS)

    const poll = async () => {
      for (;;) {
        const remaining = GIVE_UP_AFTER_MS - (Date.now() - startedAt)
        const ok = await pingHealth(
          Math.min(PING_TIMEOUT_MS, remaining),
          controller.signal,
        )
        if (ok) {
          setStatus('ready')
          return
        }
        await sleep(POLL_INTERVAL_MS, controller.signal)
      }
    }
    poll()
      .catch(() => {
        // Aborted: gave up, unmounted, or a search already proved it's up.
      })
      .finally(() => {
        clearTimeout(slowTimer)
        clearTimeout(giveUpTimer)
      })

    return () => controller.abort()
  }, [])

  /** A successful API call proves the server is up; stop polling. */
  const markReady = useCallback(() => {
    controllerRef.current?.abort()
    setStatus('ready')
  }, [])

  return { status, markReady }
}
