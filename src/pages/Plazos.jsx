import toast from 'react-hot-toast'

const PLAZOS = [
  { id: 1, plazo: 'CO-Contado', tipo: 0, cuotas: 1, irregular: false, detalles: [] },
  { id: 2, plazo: 'CR-30/60/90 días', tipo: 1, cuotas: 3, irregular: false, detalles: [] },
  { id: 3, plazo: 'CR-30/60/90/120 días', tipo: 1, cuotas: 4, irregular: false, detalles: [] },
  { id: 4, plazo: 'CR-25/40/55 días', tipo: 1, cuotas: 3, irregular: true, detalles: [
    { cuota: 1, dias: 25 }, { cuota: 2, dias: 40 }, { cuota: 3, dias: 55 },
  ]},
]

export default function Plazos() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-gqg-gold font-bold text-base">⚙️ Configuración de Plazos</h2>
        <button
          onClick={() => toast('Conectá Supabase para crear plazos nuevos', { icon: 'ℹ️' })}
          className="px-4 py-2 bg-gqg-gold text-gqg-bg rounded-md text-sm font-bold hover:opacity-90 transition-opacity"
        >
          + Nuevo Plazo
        </button>
      </div>

      <div className="space-y-3 mb-5">
        {PLAZOS.map(p => (
          <div key={p.id} className="bg-gqg-card rounded-xl border border-gqg-border p-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm">{p.plazo}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  p.tipo === 0 ? 'text-gqg-muted bg-gqg-muted/10' : 'text-gqg-teal bg-gqg-teal/10'
                }`}>
                  {p.tipo === 0 ? 'Contado' : 'Crédito'}
                </span>
                {p.irregular && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-gqg-gold bg-gqg-gold/10">
                    Irregular
                  </span>
                )}
              </div>
              <div className="text-xs text-gqg-muted">
                {p.cuotas} cuota{p.cuotas > 1 ? 's' : ''}
                {p.irregular && p.detalles.length > 0 && (
                  <span className="ml-1">· Días: {p.detalles.map(d => d.dias).join(', ')}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => toast('Conectá Supabase para editar', { icon: 'ℹ️' })}
              className="px-3 py-1.5 bg-gqg-border/50 text-gqg-text rounded text-xs font-medium hover:bg-gqg-border transition-colors"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-gqg-gold/5 border border-gqg-gold/20 rounded-xl p-5">
        <h3 className="text-gqg-gold font-semibold text-sm mb-2">💡 ¿Cómo funcionan los plazos?</h3>
        <div className="text-xs text-gqg-muted space-y-1.5">
          <p>Cada plazo define cómo se generan las cuotas al registrar una factura a crédito.</p>
          <p><strong className="text-gqg-text">Regular:</strong> Cuotas con intervalos fijos de 30 días (30, 60, 90...).</p>
          <p><strong className="text-gqg-text">Irregular:</strong> Días específicos por cuota (ej: 25, 40, 55 días desde la factura).</p>
          <p>El trigger <code className="bg-gqg-bg px-1 py-0.5 rounded text-gqg-teal text-[11px]">fn_generar_cuotas()</code> en PostgreSQL lee estos datos automáticamente.</p>
        </div>
      </div>
    </div>
  )
}
