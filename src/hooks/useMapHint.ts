import { useCallback, useState } from 'react'

const STORAGE_KEY = 'instastore:map-hint-dismissed'

// Storage can be unavailable or throw (private mode, blocked site data);
// the hint then just shows again next visit.
function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function writeDismissed() {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // Ignore: dismissal still holds for this session.
  }
}

/** First-visit map hint; hidden for good once closed or after a search succeeds. */
export function useMapHint() {
  const [dismissed, setDismissed] = useState(readDismissed)

  const dismiss = useCallback(() => {
    setDismissed(true)
    writeDismissed()
  }, [])

  return { visible: !dismissed, dismiss }
}
