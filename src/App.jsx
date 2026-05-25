import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import NuevaFactura from './pages/NuevaFactura'
import Historial from './pages/Historial'
import Catalogo from './pages/Catalogo'
import Plazos from './pages/Plazos'

export default function App() {
  return (
    <div className="min-h-screen bg-gqg-bg">
      <Header />
      <main className="p-6 max-w-[1200px] mx-auto">
        <Routes>
          <Route path="/" element={<NuevaFactura />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/plazos" element={<Plazos />} />
        </Routes>
      </main>
    </div>
  )
}
