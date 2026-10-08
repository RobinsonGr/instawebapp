import type { LatLngLiteral } from 'leaflet'
import { PRESETS } from '../lib/presets'

type PresetButtonsProps = {
  disabled?: boolean
  onSelect: (coords: LatLngLiteral) => void
}

export function PresetButtons({ disabled, onSelect }: PresetButtonsProps) {
  return (
    <div className="presets" role="group" aria-label="Preset cities">
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          className="button button--secondary button--sm"
          disabled={disabled}
          onClick={() => onSelect(preset.coords)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
