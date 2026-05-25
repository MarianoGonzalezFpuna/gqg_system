import { CLIENTES, DEPOSITOS, TIPOS_DOCUMENTO, MONEDAS } from '../lib/constants'
import { formatearFecha, fmtNum } from '../lib/utils'

function Field({ label, children }) {
  return (
    <label className="block text-[11px] text-gqg-muted font-semibold tracking-wide">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  )
}

const INPUT = "w-full px-2.5 py-[7px] bg-gqg-bg border border-gqg-border rounded text-gqg-text text-[13px] font-sans"
const INPUT_RO = INPUT + " opacity-60"

export default function CabeceraFactura({ header, setHeader, totals, onModalidadChange }) {
  const cliente = CLIENTES.find(c => c.id === header.clienteId) || CLIENTES[0]

  const update = (key, val) => setHeader(prev => ({ ...prev, [key]: val }))

  return (
    <div className="bg-gqg-card rounded-xl border border-gqg-border p-4 mb-3.5">
      {/* Row 1: Registro+Fechas | Timbrado | Totales */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr] gap-3.5 mb-3.5">
        {/* Left */}
        <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-end">
          <Field label="Nº Registro">
            <input value={header.nroRegistro} readOnly className={INPUT_RO + " w-14 text-center"} />
          </Field>
          <Field label="Fecha Proceso">
            <input type="datetime-local" value={header.fechaProceso}
              onChange={e => update('fechaProceso', e.target.value)} className={INPUT} />
          </Field>
          <Field label="Fecha Factura">
            <input type="date" value={header.fechaFactura}
              onChange={e => update('fechaFactura', e.target.value)} className={INPUT} />
          </Field>
        </div>

        {/* Center: Timbrado */}
        <div className="bg-gqg-bg rounded-md p-2.5 border border-gqg-border">
          <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1 text-xs">
            <span className="text-gqg-muted text-[11px]">Timbrado Nº:</span>
            <span className="font-semibold">{header.timbrado}</span>
            <span className="text-gqg-muted text-[11px]">Inicio Vigencia:</span>
            <span>{formatearFecha(header.vigenciaDesde)}</span>
            <span className="text-gqg-muted text-[11px]">Fin Vigencia:</span>
            <span>{formatearFecha(header.vigenciaHasta)}</span>
            <span className="text-gqg-muted text-[11px]">RUC:</span>
            <span>{header.rucEmpresa}</span>
          </div>
        </div>

        {/* Right: Totales */}
        <div className="bg-gqg-bg rounded-md p-2.5 border border-gqg-border">
          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs">
            <span className="text-gqg-muted text-[11px]">Total Neto:</span>
            <span className="text-right font-mono text-gqg-teal">{fmtNum(totals.neto)}</span>
            <span className="text-gqg-muted text-[11px]">Total Impuesto:</span>
            <span className="text-right font-mono text-gqg-gold">{fmtNum(totals.impuesto)}</span>
            <span className="text-gqg-muted text-[11px]">Total Excento:</span>
            <span className="text-right font-mono">{fmtNum(totals.excento)}</span>
            <span className="text-white text-xs font-bold">Total Factura:</span>
            <span className="text-right font-mono text-white font-bold text-sm">{fmtNum(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Cliente | Depósito+Tipo | Factura Nro */}
      <div className="grid grid-cols-[2fr_1.5fr_1fr] gap-3.5">
        {/* Cliente */}
        <div>
          <div className="grid grid-cols-2 gap-2 mb-1.5">
            <Field label="Cliente">
              <select value={header.clienteId} onChange={e => update('clienteId', +e.target.value)} className={INPUT}>
                {CLIENTES.map(c => <option key={c.id} value={c.id}>{c.id} — {c.nombre}</option>)}
              </select>
            </Field>
            <Field label="RUC / CI">
              <input value={cliente.ruc} readOnly className={INPUT_RO} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Dirección">
              <input value={cliente.direccion} readOnly className={INPUT_RO} />
            </Field>
            <Field label="Teléfono">
              <input value={cliente.telefono} readOnly className={INPUT_RO} />
            </Field>
          </div>
        </div>

        {/* Depósito + Tipo Doc + Moneda */}
        <div>
          <div className="grid grid-cols-2 gap-2 mb-1.5">
            <Field label="Depósito">
              <select value={header.deposito} onChange={e => update('deposito', e.target.value)} className={INPUT}>
                {DEPOSITOS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Tipo Documento">
              <select value={header.tipoDoc} onChange={e => {
                update('tipoDoc', e.target.value)
                onModalidadChange(e.target.value.includes('Crédito') ? 'CR' : 'CO')
              }} className={INPUT}>
                {TIPOS_DOCUMENTO.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Moneda">
            <select value={header.moneda} onChange={e => update('moneda', e.target.value)} className={INPUT}>
              {MONEDAS.map(m => <option key={m}>{m}</option>)}
            </select>
          </Field>
        </div>

        {/* Factura Nro */}
        <div className="text-center">
          <p className="text-[11px] text-gqg-muted font-semibold mb-1.5 tracking-wide">FACTURA Nº</p>
          <div className="flex gap-1 justify-center">
            {['factNum1', 'factNum2', 'factNum3'].map((key, i) => (
              <input
                key={key}
                value={header[key]}
                onChange={e => update(key, e.target.value)}
                className={`${INPUT} text-center font-bold text-sm ${i === 2 ? 'w-[90px]' : 'w-[50px]'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
