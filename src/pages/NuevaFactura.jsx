import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import CabeceraFactura from '../components/CabeceraFactura'
import DetalleItems from '../components/DetalleItems'
import ModalidadPago from '../components/ModalidadPago'
import TablaCuotas from '../components/TablaCuotas'
import {
  calcularItem,
  calcularTotalesFactura,
  generarCuotas,
  generarEtiquetaPlazo,
} from '../lib/utils'
import {
  obtenerClientes,
  obtenerPlazos,
  obtenerProductos,
  crearFacturaCompleta,
} from '../lib/supabase'

export default function NuevaFactura() {
  const navigate = useNavigate()

  // ── Data from Supabase ──
  const [clientes, setClientes] = useState([])
  const [plazos, setPlazos] = useState([])
  const [productosDB, setProductosDB] = useState([])
  const [cargando, setCargando] = useState(true)

  // ── Header state ──
  const [header, setHeader] = useState({
    nroRegistro: 0,
    fechaProceso: new Date().toISOString().slice(0, 16),
    fechaFactura: new Date().toISOString().split('T')[0],
    timbrado: '17155531',
    vigenciaDesde: '2024-04-11',
    vigenciaHasta: '2025-04-30',
    rucEmpresa: '384649-0',
    factNum1: '001',
    factNum2: '001',
    factNum3: '0044685',
    clienteId: '',
    deposito: 'Depósito 1',
    tipoDoc: 'Factura Crédito',
    moneda: 'Guaraní',
  })

  // ── Line items (vacío al inicio) ──
  const [items, setItems] = useState([])

  // ── Credit config ──
  const [modalidad, setModalidad] = useState('CR')
  const [plazoSeleccionado, setPlazoSeleccionado] = useState(null)
  const [cantCuotas, setCantCuotas] = useState(3)
  const [tipoVenc, setTipoVenc] = useState('regular')
  const [diasIrreg, setDiasIrreg] = useState([30, 60, 90])
  const [cuotasPreview, setCuotasPreview] = useState([])
  const [showCuotas, setShowCuotas] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // ── Load data from Supabase ──
  useEffect(() => {
    async function cargar() {
      try {
        const [cli, plz, prod] = await Promise.all([
          obtenerClientes(),
          obtenerPlazos(),
          obtenerProductos(),
        ])
        setClientes(cli || [])
        setPlazos(plz || [])
        setProductosDB(prod || [])
        if (cli?.length > 0) {
          setHeader(prev => ({ ...prev, clienteId: cli[0].id }))
        }
      } catch (err) {
        toast.error('Error cargando datos: ' + err.message)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // ── Computed values ──
  const computedItems = useMemo(() => items.map(calcularItem), [items])
  const totals = useMemo(() => calcularTotalesFactura(items), [items])

  const cliente = clientes.find(c => c.id === header.clienteId) || {}

  const plazoLabel = useMemo(
    () => generarEtiquetaPlazo(modalidad, cantCuotas, tipoVenc, diasIrreg),
    [modalidad, cantCuotas, tipoVenc, diasIrreg]
  )

  // Plazos filtrados por tipo
  const plazosCredito = useMemo(() => plazos.filter(p => p.tipo_id === 1), [plazos])

  // ── Item handlers ──
  const updateItem = (idx, key, val) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it))
    setShowCuotas(false)
  }

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
    setShowCuotas(false)
  }

  const addItem = () => {
    setItems(prev => [...prev, { cod: '', desc: '', precio: 0, iva: 10, desc_pct: 0, cantidad: 1 }])
  }

  const addProductFromDB = (prod) => {
    setItems(prev => [...prev, {
      cod: prod.cod_barra || '',
      desc: prod.descripcion,
      precio: prod.precio,
      iva: prod.iva,
      desc_pct: 0,
      cantidad: 1,
      producto_id: prod.id,
    }])
    setShowCuotas(false)
  }

  // ── Modalidad / Plazo handlers ──
  const handleModalidadChange = (mod) => {
    setModalidad(mod)
    setShowCuotas(false)
    if (mod === 'CO') {
      setPlazoSeleccionado(plazos.find(p => p.tipo_id === 0) || null)
    }
  }

  const handlePlazoChange = (plazoId) => {
    const plazo = plazos.find(p => p.id === parseInt(plazoId))
    if (!plazo) return
    setPlazoSeleccionado(plazo)
    setCantCuotas(plazo.cuotas)
    setTipoVenc(plazo.irregular ? 'irregular' : 'regular')
    if (plazo.irregular && plazo.plazo_detalles?.length > 0) {
      setDiasIrreg(plazo.plazo_detalles.sort((a, b) => a.cuota - b.cuota).map(d => d.dias))
    } else {
      setDiasIrreg(Array.from({ length: plazo.cuotas }, (_, i) => (i + 1) * 30))
    }
    setShowCuotas(false)
  }

  const handleHeaderTipoDoc = (tipoDoc) => {
    setHeader(prev => ({ ...prev, tipoDoc }))
    setShowCuotas(false)
  }

  // ── Preview ──
  const genPreview = useCallback(() => {
    if (totals.total <= 0) {
      toast.error('Agregá ítems con precio y cantidad')
      return
    }
    if (!header.clienteId) {
      toast.error('Seleccioná un cliente')
      return
    }
    if (modalidad === 'CR' && !plazoSeleccionado) {
      toast.error('Seleccioná un plazo de crédito')
      return
    }

    if (modalidad === 'CO') {
      setCuotasPreview([{
        numero: '"1/1"',
        importe: totals.total,
        vence: new Date(header.fechaFactura + 'T12:00:00'),
        cobrado: 0,
      }])
    } else {
      setCuotasPreview(
        generarCuotas(totals.total, cantCuotas, tipoVenc, diasIrreg, new Date(header.fechaFactura + 'T12:00:00'))
      )
    }
    setShowCuotas(true)
    toast.success('Vista previa generada')
  }, [totals.total, modalidad, cantCuotas, tipoVenc, diasIrreg, header.fechaFactura, header.clienteId, plazoSeleccionado])

  // ── Guardar ──
  const guardar = async () => {
    if (!showCuotas) return
    setGuardando(true)

    try {
      const plazoId = modalidad === 'CO'
        ? (plazos.find(p => p.tipo_id === 0)?.id || null)
        : (plazoSeleccionado?.id || null)

      const cabecera = {
        numero:         `${header.factNum1}-${header.factNum2}-${header.factNum3}`,
        tipo:           'venta',
        cliente_id:     header.clienteId,
        timbrado_id:    1,
        deposito_id:    1,
        fecha:          header.fechaFactura,
        fecha_proceso:  header.fechaProceso,
        moneda:         header.moneda,
        total_neto:     totals.neto,
        total_impuesto: totals.impuesto,
        total_excento:  totals.excento,
        total:          totals.total,
        modalidad:      modalidad,
        plazo_id:       plazoId,
      }

      const detalles = computedItems.map(it => ({
        producto_id:   it.producto_id || null,
        cod_barra:     it.cod,
        descripcion:   it.desc,
        precio:        it.precio,
        iva:           it.iva,
        base:          it.base,
        impuesto:      it.impuesto,
        descuento_pct: it.desc_pct || 0,
        descuento:     it.descMonto || 0,
        cantidad:      it.cantidad,
        total:         it.total,
      }))

      await crearFacturaCompleta(cabecera, detalles)
      toast.success('✅ Factura guardada en Supabase')

      // Reset form
      setItems([])
      setShowCuotas(false)
      setCuotasPreview([])
      navigate('/historial')
    } catch (err) {
      toast.error('Error al guardar: ' + err.message)
      console.error('Error guardando factura:', err)
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return <div className="text-center py-10 text-gray-400">Cargando datos...</div>
  }

  // ── Render ──
  return (
    <div>
      <CabeceraFactura
        header={header}
        setHeader={setHeader}
        totals={totals}
        onModalidadChange={handleModalidadChange}
        clientes={clientes}
      />

      <DetalleItems
        items={computedItems}
        onUpdate={updateItem}
        onRemove={removeItem}
        onAdd={addItem}
        totals={totals}
      />

      {/* Agregar producto desde BD */}
      {productosDB.length > 0 && items.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-3.5">
          <p className="text-xs text-gray-500 font-semibold mb-2">⚡ Agregar producto rápido desde la base de datos:</p>
          <div className="flex gap-2 flex-wrap">
            {productosDB.slice(0, 8).map(p => (
              <button key={p.id} onClick={() => addProductFromDB(p)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-brand-light hover:text-brand text-gray-600 rounded-lg text-xs font-medium transition-colors">
                {p.descripcion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`grid gap-3.5 ${showCuotas ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Modalidad + Plazo selector */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm text-brand font-bold mb-3">💳 Modalidad de Pago</h3>

          <div className="grid grid-cols-2 gap-2 mb-3.5">
            {[
              { v: 'CO', l: 'Contado (CO)', d: 'Pago único' },
              { v: 'CR', l: 'Crédito (CR)', d: 'Cuotas' },
            ].map(m => (
              <button key={m.v} onClick={() => {
                handleModalidadChange(m.v)
                handleHeaderTipoDoc(m.v === 'CO' ? 'Factura Contado' : 'Factura Crédito')
              }}
                className={`p-2.5 rounded-lg text-left transition-all ${
                  modalidad === m.v
                    ? 'border-2 border-brand bg-brand-light'
                    : 'border border-gray-200 hover:border-gray-300'
                }`}>
                <div className={`text-[13px] font-bold ${modalidad === m.v ? 'text-brand-dark' : 'text-gray-400'}`}>{m.l}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{m.d}</div>
              </button>
            ))}
          </div>

          {/* Selector de plazo (solo crédito) */}
          {modalidad === 'CR' && (
            <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-200 mb-3.5">
              <label className="block text-xs text-gray-500 font-semibold mb-1.5">Plazo de pago</label>
              <select
                value={plazoSeleccionado?.id || ''}
                onChange={e => handlePlazoChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-brand bg-white"
              >
                <option value="">— Seleccionar plazo —</option>
                {plazosCredito.map(p => (
                  <option key={p.id} value={p.id}>{p.plazo}</option>
                ))}
              </select>

              {plazoSeleccionado && (
                <div className="mt-2 px-3 py-1.5 bg-brand-light rounded border border-brand/20">
                  <span className="text-xs text-brand-dark font-semibold">
                    {plazoSeleccionado.cuotas} cuota{plazoSeleccionado.cuotas > 1 ? 's' : ''}
                    {plazoSeleccionado.irregular ? ' (irregular)' : ' (regular)'}
                    {' — '}{plazoSeleccionado.plazo}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <button onClick={genPreview} disabled={totals.total <= 0}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all
                disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
                bg-gray-200 text-gray-700 hover:bg-gray-300">
              👁️ Vista Previa
            </button>
            <button onClick={guardar} disabled={!showCuotas || guardando}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-bold transition-all
                disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed
                bg-brand hover:bg-brand-dark text-white">
              {guardando ? '⏳ Guardando...' : '💾 Guardar'}
            </button>
          </div>
        </div>

        {showCuotas && (
          <TablaCuotas
            cuotas={cuotasPreview}
            tipo={header.tipoDoc}
            cliente={cliente.nombre || ''}
            numero={`${header.factNum1}-${header.factNum2}-${header.factNum3}`}
            fecha={header.fechaFactura}
            moneda={header.moneda}
            plazoLabel={plazoLabel}
          />
        )}
      </div>
    </div>
  )
}
