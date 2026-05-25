import { formatearFecha, fmtNum } from '../lib/utils'

export default function TablaCuotas({ cuotas, tipo, cliente, numero, fecha, moneda, plazoLabel }) {
  return (
    <div className="bg-gqg-card rounded-xl border border-gqg-border p-4">
      <h3 className="text-sm text-gqg-gold font-bold mb-1">
        {tipo === 'Factura Crédito' ? 'CUENTAS A COBRAR' : 'CUENTA A COBRAR'}
      </h3>
      <div className="text-xs text-gqg-muted mb-3 leading-relaxed">
        <div>Cliente: <span className="text-gqg-text">{cliente}</span></div>
        <div>Factura: <span className="text-gqg-text">{numero}</span></div>
        <div>Fecha: <span className="text-gqg-text">{formatearFecha(fecha)}</span></div>
        <div>Moneda: <span className="text-gqg-text">{moneda}</span></div>
        <div>Cuotas: <span className="text-gqg-gold font-bold">{plazoLabel}</span></div>
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            {['Cuota', 'Importe', 'Vence', 'Cobrado'].map(h => (
              <th key={h} className="px-2.5 py-[7px] text-left text-[10px] text-gqg-muted font-bold uppercase tracking-wider border-b-2 border-gqg-border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cuotas.map((c, i) => (
            <tr key={i} className="border-b border-gqg-bg/50">
              <td className="px-2.5 py-2 text-xs font-semibold">{c.numero}</td>
              <td className="px-2.5 py-2 text-xs font-mono text-gqg-teal">{fmtNum(c.importe)}</td>
              <td className="px-2.5 py-2 text-xs">{formatearFecha(c.vence)}</td>
              <td className="px-2.5 py-2 text-xs font-mono text-gqg-red">{c.cobrado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
