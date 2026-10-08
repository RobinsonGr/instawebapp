import { useState } from 'react'
import type { LatLngLiteral } from 'leaflet'
import { StoreMap } from './components/StoreMap'
import { StorePanel } from './components/StorePanel'
import { useClosestStore } from './hooks/useClosestStore'
import './App.css'

function App() {
  const [selected, setSelected] = useState<LatLngLiteral | null>(null)
  const { state, lookup } = useClosestStore()

  const handleSelect = (coords: LatLngLiteral) => {
    setSelected(coords)
    void lookup(coords.lat, coords.lng)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>InstaStore</h1>
      </header>
      <main className="app-main">
        <StoreMap
          selected={selected}
          store={state.status === 'success' ? state.store : null}
          onSelect={handleSelect}
        />
        <StorePanel state={state} />
      </main>
    </div>
  )
}

export default App
