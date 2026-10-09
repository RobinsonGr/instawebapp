import type { ApiStatus } from '../hooks/useApiStatus'

type ApiStatusChipProps = {
  status: ApiStatus
}

/** Always rendered so the live region exists before its text changes. */
export function ApiStatusChip({ status }: ApiStatusChipProps) {
  return (
    <div className="api-status" role="status">
      {status === 'waking' && (
        <p className="api-status__chip">
          <span className="spinner" aria-hidden="true" />
          The server is waking up (free hosting). This can take up to a minute.
        </p>
      )}
      {status === 'down' && (
        <p className="api-status__chip api-status__chip--down">
          The server isn't responding. Please try again later.
        </p>
      )}
    </div>
  )
}
