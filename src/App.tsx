import { useCallback, useState } from 'react'
import type { LatLngLiteral } from 'leaflet'
import { LocateButton } from './components/LocateButton'
import { StoreMap } from './components/StoreMap'
import { StorePanel } from './components/StorePanel'
import { useClosestStore } from './hooks/useClosestStore'
import { toInput, type CoordinateInput } from './lib/coordinates'
import './App.css'

function App() {
  const [selected, setSelected] = useState<LatLngLiteral | null>(null)
  const [focus, setFocus] = useState<LatLngLiteral | null>(null)
  const [input, setInput] = useState<CoordinateInput>({ lat: '', lng: '' })
  const { state, lookup } = useClosestStore()

  const search = useCallback(
    (coords: LatLngLiteral, center: boolean) => {
      setSelected(coords)
      setInput(toInput(coords))
      // Map clicks are already in view; typed, preset and located points may not be.
      if (center) setFocus(coords)
      void lookup(coords.lat, coords.lng)
    },
    [lookup],
  )

  const handleMapClick = useCallback(
    (coords: LatLngLiteral) => search(coords, false),
    [search],
  )
  const handleSearch = useCallback(
    (coords: LatLngLiteral) => search(coords, true),
    [search],
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>InstaStore</h1>
        <LocateButton onLocate={handleSearch} />
      </header>
      <main className="app-main">
        <StoreMap
          selected={selected}
          store={state.status === 'success' ? state.store : null}
          focus={focus}
          onSelect={handleMapClick}
        />
        <StorePanel
          state={state}
          input={input}
          onInputChange={setInput}
          onSearch={handleSearch}
        />
      </main>
    </div>
  )
}

export default App
