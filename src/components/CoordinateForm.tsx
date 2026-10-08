import { useState, type FormEvent } from 'react'
import type { LatLngLiteral } from 'leaflet'
import {
  validateCoordinates,
  type CoordinateErrors,
  type CoordinateInput,
} from '../lib/coordinates'

const HINT_ID = 'coord-hint'

type CoordinateFormProps = {
  value: CoordinateInput
  /** A request is in flight. */
  busy: boolean
  onChange: (value: CoordinateInput) => void
  onSubmit: (coords: LatLngLiteral) => void
}

export function CoordinateForm({
  value,
  busy,
  onChange,
  onSubmit,
}: CoordinateFormProps) {
  // Errors appear after the first failed submit, then track the inputs live
  // (so a map click that fills valid values clears them).
  const [showErrors, setShowErrors] = useState(false)
  const result = validateCoordinates(value)
  const errors: CoordinateErrors = showErrors && !result.ok ? result.errors : {}

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!result.ok) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    onSubmit(result.coords)
  }

  return (
    <form className="coord-form" onSubmit={handleSubmit} noValidate>
      <Field
        id="lat"
        label="Latitude"
        placeholder="6.2442"
        value={value.lat}
        error={errors.lat}
        onChange={(lat) => onChange({ ...value, lat })}
      />
      <Field
        id="lng"
        label="Longitude"
        placeholder="-75.5812"
        value={value.lng}
        error={errors.lng}
        onChange={(lng) => onChange({ ...value, lng })}
      />
      <p id={HINT_ID} className="coord-form__hint">
        Latitude −90 to 90 · Longitude −180 to 180
      </p>
      <button
        type="submit"
        className="button button--primary coord-form__submit"
        disabled={busy}
      >
        {busy && <span className="spinner" aria-hidden="true" />}
        {busy ? 'Searching…' : 'Find closest store'}
      </button>
    </form>
  )
}

type FieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  error: string | undefined
  onChange: (value: string) => void
}

function Field({ id, label, placeholder, value, error, onChange }: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {/* Plain text: inputMode="decimal" hides the minus key on iOS. */}
      <input
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${errorId} ${HINT_ID}` : HINT_ID}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}
