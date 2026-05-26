import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  obtenerPlazos,
  crearPlazo,
  actualizarPlazo,
  eliminarPlazo,
} from '../lib/supabase'

// ─── Estado inicial del formulario ───
const FORM_VACIO = {
  plazo: '',
  tipo_id: 1,
  cuotas: 3,
  irregular: false,
  detalles: [],
}

// ─── Generar etiqueta automática ───
function generarLabel(form) {
  if (form.tipo_id === 0) return 'CO-Contado'
  const prefix = 'CR'
  if (!form.irregular) {
    const dias = Array.from({ length: form.cuotas }, (_, i) => (i + 1) * 30)
    return `${prefix}-${dias.join('/')} días`
  }
  const dias = form.detalles.map(d => d.dias || 0)
  return `${prefix}-${dias.join('/')} días`
}

export default function Plazos() {
  const [plazos, setPlazos] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ ...FORM_VACIO })
  const [guardando, setGuardando] = useState(false)

  // Confirm delete
  const [deleteId, setDeleteId] = useState(null)

  // ─── Cargar plazos ───
  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const data = await obtenerPlazos()
      setPlazos(data || [])
    } catch (err) {
      toast.error('Error al cargar plazos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ─── Abrir modal para crear ───
  const abrirCrear = () => {
    setEditId(null)
    const initial = { ...FORM_VACIO, detalles: [{ cuota: 1, dias: 30 }, { cuota: 2, dias: 60 }, { cuota: 3, dias: 90 }] }
    initial.plazo = generarLabel(initial)
    setForm(initial)
    setShowModal(true)
  }

  // ─── Abrir modal para editar ───
  const abrirEditar = (plazo) => {
    setEditId(plazo.id)
    setForm({
      plazo: plazo.plazo,
      tipo_id: plazo.tipo_id,
      cuotas: plazo.cuotas,
      irregular: plazo.irregular,
      detalles: (plazo.plazo_detalles || [])
        .sort((a, b) => a.cuota - b.cuota)
        .map(d => ({ cuota: d.cuota, dias: d.dias })),
    })
    setShowModal(true)
  }

  // ─── Update form field ───
  const updateForm = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }

      // Si cambia tipo a contado
      if (key === 'tipo_id' && value === 0) {
        next.cuotas = 1
        next.irregular = false
        next.detalles = []
      }

      // Si cambia cantidad de cuotas, ajustar detalles
      if (key === 'cuotas') {
        const n = Math.max(1, Math.min(24, parseInt(value) || 1))
        next.cuotas = n
        next.detalles = Array.from({ length: n }, (_, i) => ({
          cuota: i + 1,
          dias: prev.detalles[i]?.dias || (i + 1) * 30,
        }))
      }

      // Regenerar label
      next.plazo = generarLabel(next)
      return next
    })
  }

  const updateDia = (idx, dias) => {
    setForm(prev => {
      const detalles = prev.detalles.map((d, i) =>
        i === idx ? { ...d, dias: parseInt(dias) || 0 } : d
      )
      const next = { ...prev, detalles }
      next.plazo = generarLabel(next)
      return next
    })
  }

  // ─── Guardar (crear o actualizar) ───
  const guardar = async () => {
    if (!form.plazo.trim()) {
      toast.error('El nombre del plazo no puede estar vacío')
      return
    }

    setGuardando(true)
    try {
      const plazoData = {
        plazo: form.plazo,
        tipo_id: form.tipo_id,
        cuotas: form.cuotas,
        irregular: form.irregular,
      }

      const detalles = form.irregular
        ? form.detalles.map(d => ({ cuota: d.cuota, dias: d.dias }))
        : []

      if (editId) {
        await actualizarPlazo(editId, plazoData, detalles)
        toast.success('Plazo actualizado')
      } else {
        await crearPlazo(plazoData, detalles)
        toast.success('Plazo creado')
      }

      setShowModal(false)
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
      await eliminarPlazo(deleteId)
      toast.success('Plazo eliminado')
      setDeleteId(null)
      await cargar()
    } catch (err) {
      toast.error('Error al eliminar: ' + err.message)
    }
  }

  // ─── Render ───
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-brand text-lg font-bold">⚙️ Configuración de Plazos</h2>
        <button
          onClick={abrirCrear}
          className="px-4 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold transition-colors"
        >
          + Nuevo Plazo
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-gray-400">Cargando plazos...</div>
      )}

      {/* Lista de plazos */}
      <div className="space-y-3">
        {plazos.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-800">{p.plazo}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.tipo_id === 0
                    ? 'text-gray-500 bg-gray-100'
                    : 'text-brand bg-brand-light'
                }`}>
                  {p.tipo_id === 0 ? 'Contado' : 'Crédito'}
                </span>
                {p.irregular && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-amber-600 bg-amber-50">
                    Irregular
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {p.cuotas} cuota{p.cuotas > 1 ? 's' : ''}
                {p.irregular && p.plazo_detalles?.length > 0 && (
                  <span className="ml-1">
                    · Días: {p.plazo_detalles.sort((a,b) => a.cuota - b.cuota).map(d => d.dias).join(', ')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => abrirEditar(p)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
              >
                ✏️ Editar
              </button>
              <button
                onClick={() => setDeleteId(p.id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition-colors"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {plazos.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-400">
          No hay plazos configurados. Creá uno con el botón "Nuevo Plazo".
        </div>
      )}

      {/* ═══ MODAL CREAR / EDITAR ═══ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-800">
                {editId ? '✏️ Editar Plazo' : '➕ Nuevo Plazo'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1.5">Tipo de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: 0, l: 'Contado' }, { v: 1, l: 'Crédito' }].map(t => (
                    <button
                      key={t.v}
                      onClick={() => updateForm('tipo_id', t.v)}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        form.tipo_id === t.v
                          ? 'bg-brand text-white'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cantidad de cuotas (solo crédito) */}
              {form.tipo_id === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1.5">Cuotas</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={form.cuotas}
                      onChange={e => updateForm('cuotas', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 font-semibold mb-1.5">Vencimiento</label>
                    <div className="flex items-center gap-3 py-2.5">
                      <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="radio"
                          name="venc"
                          checked={!form.irregular}
                          onChange={() => updateForm('irregular', false)}
                          className="accent-brand"
                        />
                        Regular
                      </label>
                      <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="radio"
                          name="venc"
                          checked={form.irregular}
                          onChange={() => {
                            setForm(prev => {
                              const next = { ...prev, irregular: true }
                              if (next.detalles.length === 0) {
                                next.detalles = Array.from({ length: next.cuotas }, (_, i) => ({
                                  cuota: i + 1, dias: (i + 1) * 30,
                                }))
                              }
                              next.plazo = generarLabel(next)
                              return next
                            })
                          }}
                          className="accent-brand"
                        />
                        Irregular
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Días irregulares */}
              {form.tipo_id === 1 && form.irregular && (
                <div>
                  <label className="block text-xs text-gray-500 font-semibold mb-2">
                    Días de vencimiento por cuota
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {form.detalles.map((d, i) => (
                      <div key={i}>
                        <span className="text-[10px] text-gray-400 block mb-0.5">Cuota {i + 1}</span>
                        <input
                          type="number"
                          min={1}
                          value={d.dias}
                          onChange={e => updateDia(i, e.target.value)}
                          className="w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-brand"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nombre generado */}
              <div>
                <label className="block text-xs text-gray-500 font-semibold mb-1.5">Nombre del Plazo</label>
                <input
                  value={form.plazo}
                  onChange={e => setForm(prev => ({ ...prev, plazo: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-brand"
                />
                <p className="text-[10px] text-gray-400 mt-1">Se genera automáticamente, pero podés editarlo.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="flex-1 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : (editId ? 'Actualizar' : 'Crear Plazo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL CONFIRMAR ELIMINACIÓN ═══ */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-base font-bold text-gray-800 mb-2">¿Eliminar este plazo?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Esta acción no se puede deshacer. Las facturas que usen este plazo no se verán afectadas.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminar}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
