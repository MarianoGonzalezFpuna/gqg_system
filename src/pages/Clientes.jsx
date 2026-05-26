import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  buscarClientes,
} from '../lib/supabase'

const FORM_VACIO = {
  nombre: '',
  ruc_ci: '',
  direccion: '',
  telefono: '',
  email: '',
  tipo: 'cliente',
}

const TIPOS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'proveedor', label: 'Proveedor' },
  { value: 'ambos', label: 'Ambos' },
]

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ ...FORM_VACIO })
  const [guardando, setGuardando] = useState(false)

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null)

  // ─── Cargar ───
  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const data = await obtenerClientes()
      setClientes(data || [])
    } catch (err) {
      toast.error('Error al cargar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ─── Buscar ───
  useEffect(() => {
    if (!busqueda.trim()) {
      cargar()
      return
    }
    const timer = setTimeout(async () => {
      try {
        const data = await buscarClientes(busqueda.trim())
        setClientes(data || [])
      } catch {
        // silently fallback
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda, cargar])

  // ─── Abrir crear ───
  const abrirCrear = () => {
    setEditId(null)
    setForm({ ...FORM_VACIO })
    setShowModal(true)
  }

  // ─── Abrir editar ───
  const abrirEditar = (c) => {
    setEditId(c.id)
    setForm({
      nombre: c.nombre || '',
      ruc_ci: c.ruc_ci || '',
      direccion: c.direccion || '',
      telefono: c.telefono || '',
      email: c.email || '',
      tipo: c.tipo || 'cliente',
    })
    setShowModal(true)
  }

  // ─── Guardar ───
  const guardar = async () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    setGuardando(true)
    try {
      if (editId) {
        await actualizarCliente(editId, form)
        toast.success('Cliente actualizado')
      } else {
        await crearCliente(form)
        toast.success('Cliente creado')
      }
      setShowModal(false)
      setBusqueda('')
      await cargar()
    } catch (err) {
      toast.error('Error: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  // ─── Eliminar ───
  const confirmarEliminar = async () => {
    if (!deleteId) return
    try {
      await eliminarCliente(deleteId)
      toast.success('Cliente eliminado')
      setDeleteId(null)
      await cargar()
    } catch (err) {
      toast.error('No se puede eliminar: ' + err.message)
    }
  }

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-brand text-lg font-bold">👥 Clientes</h2>
        <button onClick={abrirCrear}
          className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold transition-colors">
          + Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o RUC..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand bg-white"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-10 text-gray-400">Cargando...</div>}

      {/* Tabla */}
      {!loading && clientes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['ID', 'Nombre', 'RUC / CI', 'Dirección', 'Teléfono', 'Tipo', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clientes.map((c, idx) => (
                <tr key={c.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{c.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{c.nombre}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{c.ruc_ci || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.direccion || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.telefono || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.tipo === 'cliente' ? 'text-brand bg-brand-light' :
                      c.tipo === 'proveedor' ? 'text-amber-600 bg-amber-50' :
                      'text-purple-600 bg-purple-50'
                    }`}>
                      {c.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => abrirEditar(c)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-medium transition-colors">
                        ✏️
                      </button>
                      <button onClick={() => setDeleteId(c.id)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-500 rounded text-xs font-medium transition-colors">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 border-t border-gray-200">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {!loading && clientes.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          {busqueda ? 'No se encontraron resultados.' : 'No hay clientes registrados.'}
        </div>
      )}

      {/* ═══ MODAL CREAR / EDITAR ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">
                {editId ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1.5">Nombre *</label>
                <input value={form.nombre} onChange={e => updateForm('nombre', e.target.value)}
                  placeholder="Nombre completo o razón social" className={INPUT} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5">RUC / CI</label>
                  <input value={form.ruc_ci} onChange={e => updateForm('ruc_ci', e.target.value)}
                    placeholder="3419776-0" className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5">Tipo</label>
                  <select value={form.tipo} onChange={e => updateForm('tipo', e.target.value)} className={INPUT}>
                    {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1.5">Dirección</label>
                <input value={form.direccion} onChange={e => updateForm('direccion', e.target.value)}
                  placeholder="Ciudad, barrio, calle..." className={INPUT} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5">Teléfono</label>
                  <input value={form.telefono} onChange={e => updateForm('telefono', e.target.value)}
                    placeholder="0981-123456" className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)}
                    placeholder="correo@ejemplo.com" className={INPUT} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                {guardando ? 'Guardando...' : (editId ? 'Actualizar' : 'Crear Cliente')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONFIRMAR ELIMINAR ═══ */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-base font-bold text-gray-800 mb-2">¿Eliminar este cliente?</h3>
            <p className="text-sm text-gray-500 mb-5">Si tiene facturas asociadas, no se podrá eliminar.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={confirmarEliminar}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
