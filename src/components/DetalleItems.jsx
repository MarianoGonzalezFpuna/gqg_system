import { TASAS_IVA } from '../lib/constants'
import { fmtNum } from '../lib/utils'

const INPUT = "w-full px-2 py-[6px] bg-gqg-bg border border-gqg-border rounded text-gqg-text text-[13px] font-sans"

export default function DetalleItems({ items, onUpdate, onRemove, onAdd, totals }) {
  return (
    <div className="bg-gqg-card rounded-xl border border-gqg-border p-4 mb-3.5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm text-gqg-gold font-bold">📦 Detalle de Ítems</h3>
        <button
          onClick={onAdd}
          className="px-3.5 py-1.5 text-xs font-semibold text-gqg-gold bg-gqg-gold/10 border border-gqg-gold/20 rounded-md hover:bg-gqg-gold/20 transition-colors"
        >
          + Agregar Ítem
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['#', 'Cód. Barra', 'Descripción', 'Precio', '% IVA', 'Base', 'Impuesto', 'Desc.%', 'Cant.', 'Total', ''].map(h => (
                <th key={h} className="px-2 py-[7px] text-left text-[10px] text-gqg-muted font-bold uppercase tracking-wider border-b-2 border-gqg-border whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-gqg-bg/20'}>
                <td className="px-2 py-1.5 text-xs text-gqg-muted font-semibold w-8 border-b border-gqg-bg/50">
                  {idx + 1}
                </td>
                <td className="px-2 py-1.5 border-b border-gqg-bg/50">
                  <input value={it.cod} onChange={e => onUpdate(idx, 'cod', e.target.value)}
                    className={INPUT + " w-[120px] text-[11px] font-mono"} />
                </td>
                <td className="px-2 py-1.5 border-b border-gqg-bg/50">
                  <input value={it.desc} onChange={e => onUpdate(idx, 'desc', e.target.value)}
                    className={INPUT + " min-w-[160px]"} />
                </td>
                <td className="px-2 py-1.5 border-b border-gqg-bg/50">
                  <input type="number" value={it.precio} onChange={e => onUpdate(idx, 'precio', parseFloat(e.target.value) || 0)}
                    className={INPUT + " w-[100px] text-right font-mono"} />
                </td>
                <td className="px-2 py-1.5 border-b border-gqg-bg/50">
                  <select value={it.iva} onChange={e => onUpdate(idx, 'iva', parseInt(e.target.value))}
                    className={INPUT + " w-[60px] text-center"}>
                    {TASAS_IVA.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5 text-[11px] font-mono text-gqg-muted text-right border-b border-gqg-bg/50">
                  {fmtNum(it.base)}
                </td>
                <td className="px-2 py-1.5 text-[11px] font-mono text-gqg-gold text-right border-b border-gqg-bg/50">
                  {fmtNum(it.impuesto)}
                </td>
                <td className="px-2 py-1.5 border-b border-gqg-bg/50">
                  <input type="number" min={0} max={100} value={it.desc_pct}
                    onChange={e => onUpdate(idx, 'desc_pct', parseFloat(e.target.value) || 0)}
                    className={INPUT + " w-[55px] text-center"} />
                </td>
                <td className="px-2 py-1.5 border-b border-gqg-bg/50">
                  <input type="number" min={0.01} step={0.01} value={it.cantidad}
                    onChange={e => onUpdate(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                    className={INPUT + " w-[60px] text-center"} />
                </td>
                <td className="px-2 py-1.5 text-xs font-mono font-bold text-white text-right border-b border-gqg-bg/50">
                  {fmtNum(it.total)}
                </td>
                <td className="px-2 py-1.5 border-b border-gqg-bg/50">
                  <button onClick={() => onRemove(idx)}
                    className="text-gqg-red hover:text-red-400 text-base bg-transparent border-none cursor-pointer px-1">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gqg-gold">
              <td colSpan={8}></td>
              <td className="px-2 py-2 text-center text-xs font-bold text-gqg-gold">
                {totals.cantItems.toFixed(2)}
              </td>
              <td className="px-2 py-2 text-right font-mono font-extrabold text-gqg-gold text-sm">
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
