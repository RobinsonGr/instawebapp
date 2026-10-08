import { useState } from 'react'
import type { LatLngLiteral } from 'leaflet'
import { StoreMap } from './components/StoreMap'
import './App.css'

function App() {
  const [selected, setSelected] = useState<LatLngLiteral | null>(null)

  return (
    <div className="app">
      <header className="app-header">
        <h1>InstaStore</h1>
      </header>
      <main className="app-main">
        <StoreMap selected={selected} onSelect={setSelected} />
      </main>
    </div>
  )
}

export default App
