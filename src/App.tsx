import { useState } from 'react'
import type { LatLngLiteral } from 'leaflet'
import { StoreMap } from './components/StoreMap'
import { StoreStatus } from './components/StoreStatus'
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
        <StoreMap selected={selected} onSelect={handleSelect} />
        <div aria-live="polite">
          <StoreStatus state={state} />
        </div>
      </main>
    </div>
  )
}

export default App
