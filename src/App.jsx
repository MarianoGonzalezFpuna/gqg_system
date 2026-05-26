import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Clientes from './pages/Clientes'
import NuevaFactura from './pages/NuevaFactura'
import Historial from './pages/Historial'
import Catalogo from './pages/Catalogo'
import Plazos from './pages/Plazos'

function Inicio() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center">
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-800">GQG System</h1>
    </div>
  )
}

export default function App() {
  const [usuario, setUsuario] = useState(() => {
    return sessionStorage.getItem('gqg_user') || null
  })

  const handleLogin = (user) => {
    setUsuario(user)
    sessionStorage.setItem('gqg_user', user)
  }

  const handleLogout = () => {
    setUsuario(null)
    sessionStorage.removeItem('gqg_user')
  }

  // No logueado → mostrar login
  if (!usuario) {
    return <Login onLogin={handleLogin} />
  }

  // Logueado → layout con sidebar
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar usuario={usuario} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-brand h-11 flex items-center justify-end px-4 shrink-0">
          <div className="flex items-center gap-2 text-white text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>{usuario}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/facturas" element={<NuevaFactura />} />
            <Route path="/historial" element={<Historial />} />
            <Route path="/plazos" element={<Plazos />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
