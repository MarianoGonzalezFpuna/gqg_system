import { useState, useEffect } from 'react'
import { obtenerFacturasLocal, limpiarFacturasLocal } from '../lib/storage'
import { formatearFecha, fmtNum } from '../lib/utils'

function Badge({ color, children }) {
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${color}`}>
      {children}
    </span>
  )
}

export default function Historial() {
  const [facturas, setFacturas] = useState([])

  useEffect(() => {
    setFacturas(obtenerFacturasLocal())
  }, [])

  const limpiar = () => {
    if (confirm('¿Borrar todo el historial?')) {
      limpiarFacturasLocal()
      setFacturas([])
    }
  }

  if (facturas.length === 0) {
    return (
      <div className="bg-gqg-card rounded-xl border border-gqg-border p-10 text-center">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-gqg-muted">No hay facturas registradas.</p>
        <p className="text-gqg-muted text-sm mt-1">Creá una desde "Nueva Factura".</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gqg-gold font-bold text-base">
          📋 Facturas Registradas ({facturas.length})
        </h2>
        <button onClick={limpiar}
          className="px-3 py-1.5 text-xs text-gqg-red bg-gqg-red/10 border border-gqg-red/20 rounded-md hover:bg-gqg-red/20 transition-colors">
          🗑️ Limpiar
        </button>
      </div>

      <div className="space-y-3">
        {facturas.map(f => (
          <div key={f.id} className="bg-gqg-card rounded-xl border border-gqg-border p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {f.header.factNum1}-{f.header.factNum2}-{f.header.factNum3}
                </span>
                <Badge color="text-gqg-teal bg-gqg-teal/10">Venta</Badge>
                <Badge color={f.modalidad === 'CO' ? 'text-gqg-muted bg-gqg-muted/10' : 'text-gqg-red bg-gqg-red/10'}>
                  {f.modalidad === 'CO' ? 'Contado' : 'Crédito'}
                </Badge>
              </div>
              <span className="text-base font-extrabold font-mono text-gqg-teal">
                {fmtNum(f.totals.total)} ₲
              </span>
            </div>

            {/* Info */}
            <div className="text-xs text-gqg-muted mb-1.5">
              {f.cliente.nombre} · {formatearFecha(f.header.fechaFactura)} · {f.plazoLabel}
            </div>
            <div className="text-[11px] text-gqg-muted mb-3">
              {f.items.length} ítems · Neto: {fmtNum(f.totals.neto)} · IVA: {fmtNum(f.totals.impuesto)} · Excento: {fmtNum(f.totals.excento)}
            </div>

            {/* Items */}
            <details className="mb-2">
              <summary className="text-[11px] text-gqg-muted cursor-pointer hover:text-gqg-text">
                📦 Ver detalle de ítems
              </summary>
              <table className="w-full border-collapse mt-2 text-[11px]">
                <thead>
                  <tr>
                    {['#', 'Descripción', 'Precio', 'IVA', 'Cant.', 'Total'].map(h => (
                      <th key={h} className="px-2 py-1 text-left text-gqg-muted font-semibold text-[9px] uppercase border-b border-gqg-border">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {f.items.map((it, i) => (
                    <tr key={i} className="border-b border-gqg-bg/30">
                      <td className="px-2 py-1 text-gqg-muted">{i + 1}</td>
                      <td className="px-2 py-1">{it.desc}</td>
                      <td className="px-2 py-1 font-mono">{fmtNum(it.precio)}</td>
                      <td className="px-2 py-1">{it.iva}%</td>
                      <td className="px-2 py-1 text-center">{it.cantidad}</td>
                      <td className="px-2 py-1 font-mono font-semibold text-right">{fmtNum(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>

            {/* Cuotas */}
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  {['Cuota', 'Importe', 'Vence', 'Cobrado'].map(h => (
                    <th key={h} className="px-2 py-1.5 text-left text-gqg-muted font-semibold text-[9px] uppercase border-b border-gqg-border">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {f.cuotas.map((c, i) => (
                  <tr key={i} className="border-b border-gqg-bg/30">
                    <td className="px-2 py-1.5 font-semibold">{c.numero}</td>
                    <td className="px-2 py-1.5 font-mono text-gqg-teal">{fmtNum(c.importe)}</td>
                    <td className="px-2 py-1.5">{formatearFecha(c.vence)}</td>
                    <td className="px-2 py-1.5 font-mono">{c.cobrado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
