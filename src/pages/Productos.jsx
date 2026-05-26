import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  buscarProductos,
} from '../lib/supabase'
import { fmtNum } from '../lib/utils'

const FORM_VACIO = {
  cod_barra: '',
  descripcion: '',
  precio: '',
  iva: 10,
  costo: '',
  stock: '',
  unidad: 'Unid',
}

const UNIDADES = ['Unid', 'Pack', 'Caja', 'Kg', 'Lt', 'Mt', 'Rollo']
const TASAS_IVA = [
  { value: 0, label: 'Exento (0%)' },
  { value: 5, label: 'IVA 5%' },
  { value: 10, label: 'IVA 10%' },
]

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ ...FORM_VACIO })
  const [guardando, setGuardando] = useState(false)

  const [deleteId, setDeleteId] = useState(null)

  // ─── Cargar ───
  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const data = await obtenerProductos()
      setProductos(data || [])
    } catch (err) {
      toast.error('Error al cargar: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ─── Buscar ───
  useEffect(() => {
    if (!busqueda.trim()) { cargar(); return }
    const timer = setTimeout(async () => {
      try {
        const data = await buscarProductos(busqueda.trim())
        setProductos(data || [])
      } catch { /* silent */ }
    }, 300)
    return () => clearTimeout(timer)
  }, [busqueda, cargar])

  const abrirCrear = () => {
    setEditId(null)
    setForm({ ...FORM_VACIO })
    setShowModal(true)
  }

  const abrirEditar = (p) => {
    setEditId(p.id)
    setForm({
      cod_barra: p.cod_barra || '',
      descripcion: p.descripcion || '',
      precio: p.precio ?? '',
      iva: p.iva ?? 10,
      costo: p.costo ?? '',
      stock: p.stock ?? '',
      unidad: p.unidad || 'Unid',
    })
    setShowModal(true)
  }

  const guardar = async () => {
    if (!form.descripcion.trim()) {
      toast.error('La descripción es obligatoria')
      return
    }
    setGuardando(true)
    try {
      const data = {
        ...form,
        precio: parseFloat(form.precio) || 0,
        costo: parseFloat(form.costo) || 0,
        stock: parseFloat(form.stock) || 0,
        iva: parseInt(form.iva),
      }
      if (editId) {
        await actualizarProducto(editId, data)
        toast.success('Producto actualizado')
      } else {
        await crearProducto(data)
        toast.success('Producto creado')
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

  const confirmarEliminar = async () => {
    if (!deleteId) return
    try {
      await eliminarProducto(deleteId)
      toast.success('Producto eliminado')
      setDeleteId(null)
      await cargar()
    } catch (err) {
      toast.error('Error: ' + err.message)
    }
  }

  const updateForm = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const INPUT = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-brand text-lg font-bold">📦 Productos</h2>
        <button onClick={abrirCrear}
          className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold transition-colors">
          + Nuevo Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por descripción o código..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand bg-white" />
          {busqueda && (
            <button onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
      </div>

      {loading && <div className="text-center py-10 text-gray-400">Cargando...</div>}

      {/* Tabla */}
      {!loading && productos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Código', 'Descripción', 'Precio', 'IVA', 'Costo', 'Stock', 'Unidad', 'Acciones'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productos.map((p, idx) => (
                <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 text-xs text-gray-500 font-mono">{p.cod_barra || '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{p.descripcion}</td>
                  <td className="px-4 py-3 text-sm font-mono text-green-700 font-semibold">{fmtNum(p.precio)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.iva === 0 ? 'text-gray-500 bg-gray-100' :
                      p.iva === 5 ? 'text-amber-600 bg-amber-50' :
                      'text-brand bg-brand-light'
                    }`}>
                      {p.iva}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-500">{fmtNum(p.costo || 0)}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{p.stock ?? 0}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.unidad}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => abrirEditar(p)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-xs font-medium transition-colors">
                        ✏️
                      </button>
                      <button onClick={() => setDeleteId(p.id)}
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
            {productos.length} producto{productos.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {!loading && productos.length === 0 && (
        <div className="text-center py-10 text-gray-400">
          {busqueda ? 'No se encontraron resultados.' : 'No hay productos registrados.'}
        </div>
      )}

      {/* ═══ MODAL CREAR / EDITAR ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">
                {editId ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1.5">Descripción *</label>
                <input value={form.descripcion} onChange={e => updateForm('descripcion', e.target.value)}
                  placeholder="Producto 1 x Unid" className={INPUT} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5">Código de Barra</label>
                  <input value={form.cod_barra} onChange={e => updateForm('cod_barra', e.target.value)}
                    placeholder="7841617000662" className={INPUT + " font-mono"} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5">Unidad</label>
                  <select value={form.unidad} onChange={e => updateForm('unidad', e.target.value)} className={INPUT}>
                    {UNIDADES.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5">Precio Venta</label>
                  <input type="number" value={form.precio} onChange={e => updateForm('precio', e.target.value)}
                    placeholder="27560.00" className={INPUT + " font-mono"} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5">Costo</label>
                  <input type="number" value={form.costo} onChange={e => updateForm('costo', e.target.value)}
                    placeholder="20000.00" className={INPUT + " font-mono"} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-1.5">IVA</label>
                  <select value={form.iva} onChange={e => updateForm('iva', parseInt(e.target.value))} className={INPUT}>
                    {TASAS_IVA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1.5">Stock actual</label>
                <input type="number" value={form.stock} onChange={e => updateForm('stock', e.target.value)}
                  placeholder="150" className={INPUT + " font-mono max-w-[150px]"} />
              </div>
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold transition-colors">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                className="flex-1 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                {guardando ? 'Guardando...' : (editId ? 'Actualizar' : 'Crear Producto')}
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
            <h3 className="text-base font-bold text-gray-800 mb-2">¿Eliminar este producto?</h3>
            <p className="text-sm text-gray-500 mb-5">El producto se desactivará y no aparecerá en nuevas facturas.</p>
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
