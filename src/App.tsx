import { useCallback, useState } from 'react'
import type { LatLngLiteral } from 'leaflet'
import { LocateButton } from './components/LocateButton'
import { StoreMap } from './components/StoreMap'
import { StorePanel } from './components/StorePanel'
import { useClosestStore } from './hooks/useClosestStore'
import './App.css'

function App() {
  const [selected, setSelected] = useState<LatLngLiteral | null>(null)
  const [focus, setFocus] = useState<LatLngLiteral | null>(null)
  const { state, lookup } = useClosestStore()

  const handleSelect = useCallback(
    (coords: LatLngLiteral) => {
      setSelected(coords)
      void lookup(coords.lat, coords.lng)
    },
    [lookup],
  )

  const handleLocate = useCallback(
    (coords: LatLngLiteral) => {
      setFocus(coords)
      handleSelect(coords)
    },
    [handleSelect],
  )

  return (
    <div className="app">
      <header className="app-header">
        <h1>InstaStore</h1>
        <LocateButton onLocate={handleLocate} />
      </header>
      <main className="app-main">
        <StoreMap
          selected={selected}
          store={state.status === 'success' ? state.store : null}
          focus={focus}
          onSelect={handleSelect}
        />
        <StorePanel state={state} />
      </main>
    </div>
  )
}

export default App
