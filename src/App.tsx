import { useCallback, useRef, useState } from 'react'
import type { LatLngLiteral } from 'leaflet'
import { MapHint } from './components/MapHint'
import { StoreMap } from './components/StoreMap'
import { StorePanel } from './components/StorePanel'
import { useApiStatus } from './hooks/useApiStatus'
import { useClosestStore } from './hooks/useClosestStore'
import { useMapHint } from './hooks/useMapHint'
import { toInput, type CoordinateInput } from './lib/coordinates'
import './App.css'

function App() {
  const [selected, setSelected] = useState<LatLngLiteral | null>(null)
  const [focus, setFocus] = useState<LatLngLiteral | null>(null)
  const [input, setInput] = useState<CoordinateInput>({ lat: '', lng: '' })
  const hint = useMapHint()
  const api = useApiStatus()
  const { dismiss: dismissHint } = hint
  const { markReady } = api
  const handleSuccess = useCallback(() => {
    dismissHint()
    markReady()
  }, [dismissHint, markReady])
  const { state, lookup } = useClosestStore(handleSuccess)
  const panelRef = useRef<HTMLElement>(null)

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
  const handleDrag = useCallback(
    (coords: LatLngLiteral) => setInput(toInput(coords)),
    [],
  )
  const handleSearch = useCallback(
    (coords: LatLngLiteral) => search(coords, true),
    [search],
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-header__title">InstaStore</h1>
        <p className="app-header__subtitle">Find the closest available store</p>
      </header>
      <main className="app-main">
        {/* Panel first so keyboard users reach the search before the map. */}
        <StorePanel
          ref={panelRef}
          state={state}
          apiStatus={api.status}
          selected={selected}
          input={input}
          onInputChange={setInput}
          onSearch={handleSearch}
        />
        <StoreMap
          selected={selected}
          store={state.status === 'success' ? state.store : null}
          focus={focus}
          overlayRef={panelRef}
          onSelect={handleMapClick}
          onDrag={handleDrag}
        />
        {hint.visible && <MapHint onDismiss={hint.dismiss} />}
      </main>
    </div>
  )
}

export default App
