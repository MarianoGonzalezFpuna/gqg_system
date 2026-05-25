export default function ModalidadPago({
  modalidad, setModalidad,
  cantCuotas, setCantCuotas,
  tipoVenc, setTipoVenc,
  diasIrreg, setDiasIrreg,
  plazoLabel,
  totalFactura,
  onPreview,
  onGuardar,
  showCuotas,
  onHeaderTipoDoc,
}) {
  const handleCantChange = (v) => {
    const n = Math.max(1, Math.min(24, parseInt(v) || 1))
    setCantCuotas(n)
    setDiasIrreg(prev => Array.from({ length: n }, (_, i) => prev[i] || 30 * (i + 1)))
  }

  const handleDiaChange = (idx, val) => {
    setDiasIrreg(prev => prev.map((d, i) => i === idx ? (parseInt(val) || 0) : d))
  }

  return (
    <div className="bg-gqg-card rounded-xl border border-gqg-border p-4">
      <h3 className="text-sm text-gqg-gold font-bold mb-3">💳 Modalidad de Pago</h3>

      {/* Selector CO / CR */}
      <div className="grid grid-cols-2 gap-2 mb-3.5">
        {[
          { v: 'CO', l: 'Contado (CO)', d: 'Pago único en fecha de factura' },
          { v: 'CR', l: 'Crédito (CR)', d: 'Pago en cuotas con vencimientos' },
        ].map(m => (
          <button
            key={m.v}
            onClick={() => {
              setModalidad(m.v)
              onHeaderTipoDoc(m.v === 'CO' ? 'Factura Contado' : 'Factura Crédito')
            }}
            className={`p-2.5 rounded-lg text-left transition-all ${
              modalidad === m.v
                ? 'border-2 border-gqg-gold bg-gqg-gold/5'
                : 'border border-gqg-border hover:border-gqg-muted'
            }`}
          >
            <div className={`text-[13px] font-bold ${modalidad === m.v ? 'text-gqg-gold' : 'text-gqg-muted'}`}>
              {m.l}
            </div>
            <div className="text-[11px] text-gqg-muted mt-0.5">{m.d}</div>
          </button>
        ))}
      </div>

      {/* Credit options */}
      {modalidad === 'CR' && (
        <div className="bg-gqg-bg rounded-lg p-3.5 border border-gqg-border mb-3.5">
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <label className="text-[11px] text-gqg-muted font-semibold">
              Cantidad de Cuotas
              <input type="number" min={1} max={24} value={cantCuotas}
                onChange={e => handleCantChange(e.target.value)}
                className="mt-1 w-full px-2.5 py-[7px] bg-gqg-card border border-gqg-border rounded text-gqg-text text-[13px]" />
            </label>
            <label className="text-[11px] text-gqg-muted font-semibold">
              Tipo Vencimiento
              <select value={tipoVenc} onChange={e => setTipoVenc(e.target.value)}
                className="mt-1 w-full px-2.5 py-[7px] bg-gqg-card border border-gqg-border rounded text-gqg-text text-[13px]">
                <option value="regular">Regular (30-60-90...)</option>
                <option value="irregular">Irregular (días específicos)</option>
              </select>
            </label>
          </div>

          {tipoVenc === 'irregular' && (
            <div className="mb-2.5">
              <p className="text-[11px] text-gqg-muted mb-1.5">Días por cuota desde fecha factura:</p>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: cantCuotas }).map((_, i) => (
                  <label key={i} className="text-[10px] text-gqg-muted">
                    Cuota {i + 1}
                    <input type="number" min={1} value={diasIrreg[i] || ''}
                      onChange={e => handleDiaChange(i, e.target.value)}
                      className="block mt-0.5 w-14 px-1.5 py-1 bg-gqg-card border border-gqg-border rounded text-gqg-text text-xs text-center" />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="px-2.5 py-1.5 bg-gqg-gold/5 rounded border border-gqg-gold/15">
            <span className="text-xs text-gqg-gold">Cuotas: <strong>{plazoLabel}</strong></span>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button onClick={onPreview} disabled={totalFactura <= 0}
          className="flex-1 py-2.5 rounded-md text-[13px] font-semibold transition-all
            disabled:bg-gqg-bg disabled:text-gqg-border disabled:cursor-not-allowed
            bg-gqg-border/50 text-gqg-text hover:bg-gqg-border">
          👁️ Vista Previa
        </button>
        <button onClick={onGuardar} disabled={!showCuotas}
          className="flex-1 py-2.5 rounded-md text-[13px] font-bold transition-all
            disabled:bg-gqg-bg disabled:text-gqg-border disabled:cursor-not-allowed
            bg-gradient-to-r from-gqg-gold to-gqg-gold-dark text-gqg-bg hover:opacity-90">
          💾 Guardar Factura
        </button>
      </div>
    </div>
  )
}
