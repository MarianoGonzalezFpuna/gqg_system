import { useState } from 'react'
import { TASAS_IVA } from '../lib/constants'
import { fmtNum } from '../lib/utils'
import { buscarProductoPorCodigo } from '../lib/supabase'

const INPUT = "w-full px-2 py-[6px] bg-white border border-gray-200 rounded text-gray-800 text-[13px] font-sans focus:outline-none focus:border-brand"

// ─── Fila de ítem con autocomplete por código ───
function ItemRow({ item, idx, onUpdate, onRemove, onAutocomplete }) {
  const [buscando, setBuscando] = useState(false)
  const [estado, setEstado] = useState('') // 'ok' | 'notfound' | ''

  const buscarPorCodigo = async (codigo) => {
    if (!codigo?.trim()) return
    setBuscando(true)
    setEstado('')
    try {
      const prod = await buscarProductoPorCodigo(codigo.trim())
      if (prod) {
        onAutocomplete(idx, {
          cod: prod.cod_barra,
          desc: prod.descripcion,
          precio: prod.precio,
          iva: prod.iva,
          producto_id: prod.id,
        })
        setEstado('ok')
      } else {
        setEstado('notfound')
      }
    } catch {
      setEstado('notfound')
    } finally {
      setBuscando(false)
    }
  }

  const handleCodKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      buscarPorCodigo(e.target.value)
    }
  }

  const handleCodBlur = (e) => {
    // Solo buscar si cambió respecto al valor guardado
    if (e.target.value && e.target.value !== item._codAnterior) {
      buscarPorCodigo(e.target.value)
    }
  }

  return (
    <tr className={idx % 2 === 0 ? '' : 'bg-gray-50/60'}>
      {/* # */}
      <td className="px-2 py-1.5 text-xs text-gray-400 font-semibold w-8 border-b border-gray-100">
        {idx + 1}
      </td>

      {/* Código de barra */}
      <td className="px-2 py-1.5 border-b border-gray-100">
        <div className="relative">
          <input
            value={item.cod}
            onChange={e => {
              onUpdate(idx, 'cod', e.target.value)
              setEstado('')
            }}
            onKeyDown={handleCodKeyDown}
            onBlur={handleCodBlur}
            placeholder="Cód. / Enter"
            className={
              INPUT + " w-[130px] text-[11px] font-mono pr-6 " +
              (estado === 'ok' ? 'border-green-400 bg-green-50' :
               estado === 'notfound' ? 'border-red-300 bg-red-50' : '')
            }
          />
          {/* Indicador */}
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[11px]">
            {buscando ? (
              <svg className="w-3.5 h-3.5 text-brand animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : estado === 'ok' ? (
              <span className="text-green-500">✓</span>
            ) : estado === 'notfound' ? (
              <span className="text-red-400" title="Producto no encontrado">✕</span>
            ) : null}
          </span>
        </div>
      </td>

      {/* Descripción */}
      <td className="px-2 py-1.5 border-b border-gray-100">
        <input
          value={item.desc}
          onChange={e => onUpdate(idx, 'desc', e.target.value)}
          placeholder="Descripción"
          className={INPUT + " min-w-[170px]"}
        />
      </td>

      {/* Precio */}
      <td className="px-2 py-1.5 border-b border-gray-100">
        <input
          type="number"
          value={item.precio}
          onChange={e => onUpdate(idx, 'precio', parseFloat(e.target.value) || 0)}
          className={INPUT + " w-[100px] text-right font-mono"}
        />
      </td>

      {/* IVA */}
      <td className="px-2 py-1.5 border-b border-gray-100">
        <select
          value={item.iva}
          onChange={e => onUpdate(idx, 'iva', parseInt(e.target.value))}
          className={INPUT + " w-[65px] text-center"}
        >
          {TASAS_IVA.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </td>

      {/* Base (calculado) */}
      <td className="px-2 py-1.5 text-[11px] font-mono text-gray-400 text-right border-b border-gray-100">
        {fmtNum(item.base)}
      </td>

      {/* Impuesto (calculado) */}
      <td className="px-2 py-1.5 text-[11px] font-mono text-amber-600 text-right border-b border-gray-100">
        {fmtNum(item.impuesto)}
      </td>

      {/* Descuento % */}
      <td className="px-2 py-1.5 border-b border-gray-100">
        <input
          type="number"
          min={0}
          max={100}
          value={item.desc_pct}
          onChange={e => onUpdate(idx, 'desc_pct', parseFloat(e.target.value) || 0)}
          className={INPUT + " w-[55px] text-center"}
        />
      </td>

      {/* Cantidad */}
      <td className="px-2 py-1.5 border-b border-gray-100">
        <input
          type="number"
          min={0.01}
          step={0.01}
          value={item.cantidad}
          onChange={e => onUpdate(idx, 'cantidad', parseFloat(e.target.value) || 0)}
          className={INPUT + " w-[60px] text-center"}
        />
      </td>

      {/* Total */}
      <td className="px-2 py-1.5 text-xs font-mono font-bold text-gray-800 text-right border-b border-gray-100">
        {fmtNum(item.total)}
      </td>

      {/* Eliminar */}
      <td className="px-2 py-1.5 border-b border-gray-100">
        <button
          onClick={() => onRemove(idx)}
          className="text-red-400 hover:text-red-600 text-base bg-transparent border-none cursor-pointer px-1 transition-colors"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

// ─── Componente principal ───
export default function DetalleItems({ items, onUpdate, onRemove, onAdd, onAutocomplete, totals }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-3.5">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm text-brand font-bold">📦 Detalle de Ítems</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Escribí el código de barra y presioná <kbd className="bg-gray-100 px-1 py-0.5 rounded text-[9px] font-mono">Enter</kbd> para autocompletar
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-3.5 py-1.5 text-xs font-semibold text-brand bg-brand-light border border-brand/20 rounded-lg hover:bg-brand/20 transition-colors"
        >
          + Agregar Ítem
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['#', 'Cód. Barra', 'Descripción', 'Precio', '% IVA', 'Base', 'Impuesto', 'Desc.%', 'Cant.', 'Total', ''].map(h => (
                <th key={h} className="px-2 py-[7px] text-left text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b-2 border-gray-200 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-400">
                  No hay ítems. Hacé clic en "+ Agregar Ítem" o escribí un código de barra.
                </td>
              </tr>
            ) : (
              items.map((it, idx) => (
                <ItemRow
                  key={idx}
                  item={it}
                  idx={idx}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onAutocomplete={onAutocomplete}
                />
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand">
              <td colSpan={8}></td>
              <td className="px-2 py-2.5 text-center text-xs font-bold text-brand">
                {totals.cantItems.toFixed(2)}
              </td>
              <td className="px-2 py-2.5 text-right font-mono font-extrabold text-brand text-sm">
                {fmtNum(totals.total)}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
