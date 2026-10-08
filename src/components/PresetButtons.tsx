import type { LatLngLiteral } from 'leaflet'
import { PRESETS } from '../lib/presets'

type PresetButtonsProps = {
  onSelect: (coords: LatLngLiteral) => void
}

export function PresetButtons({ onSelect }: PresetButtonsProps) {
  return (
    <div className="presets" role="group" aria-label="Preset locations">
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          className="button button--secondary"
          onClick={() => onSelect(preset.coords)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
