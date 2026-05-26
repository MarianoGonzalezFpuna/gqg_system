import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import CabeceraFactura from '../components/CabeceraFactura'
import DetalleItems from '../components/DetalleItems'
import ModalidadPago from '../components/ModalidadPago'
import TablaCuotas from '../components/TablaCuotas'
import { CLIENTES } from '../lib/constants'
import {
  calcularItem,
  calcularTotalesFactura,
  generarCuotas,
  generarEtiquetaPlazo,
} from '../lib/utils'
import { crearFacturaCompleta } from '../lib/supabase'
import { guardarFacturaLocal } from '../lib/storage'

export default function NuevaFactura() {
  const navigate = useNavigate()

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
    clienteId: 15,
    deposito: 'Depósito 1',
    tipoDoc: 'Factura Crédito',
    moneda: 'Guaraní',
  })

  // ── Line items ──
  const [items, setItems] = useState([
    { cod: '7841617000662', desc: 'Producto 1 x Unid', precio: 27560, iva: 5, desc_pct: 0, cantidad: 1 },
    { cod: '7842568000312', desc: 'Producto 2 x Unid', precio: 125000, iva: 0, desc_pct: 0, cantidad: 1 },
    { cod: '7840036106030', desc: 'Producto 3 x Unid', precio: 65842, iva: 10, desc_pct: 0, cantidad: 1 },
    { cod: '7793742000669', desc: 'Producto 4 x Unid', precio: 365824, iva: 10, desc_pct: 0, cantidad: 1 },
  ])

  // ── Credit config ──
  const [modalidad, setModalidad] = useState('CR')
  const [cantCuotas, setCantCuotas] = useState(3)
  const [tipoVenc, setTipoVenc] = useState('irregular')
  const [diasIrreg, setDiasIrreg] = useState([30, 45, 60])
  const [cuotasPreview, setCuotasPreview] = useState([])
  const [showCuotas, setShowCuotas] = useState(false)

  // ── Computed values ──
  const computedItems = useMemo(() => items.map(calcularItem), [items])
  const totals = useMemo(() => calcularTotalesFactura(items), [items])

  const cliente = CLIENTES.find(c => c.id === header.clienteId) || CLIENTES[0]

  const plazoLabel = useMemo(
    () => generarEtiquetaPlazo(modalidad, cantCuotas, tipoVenc, diasIrreg),
    [modalidad, cantCuotas, tipoVenc, diasIrreg]
  )

  // ── Handlers ──
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

  const handleModalidadChange = (mod) => {
    setModalidad(mod)
    setShowCuotas(false)
  }

  const handleHeaderTipoDoc = (tipoDoc) => {
    setHeader(prev => ({ ...prev, tipoDoc }))
    setShowCuotas(false)
  }

  const genPreview = useCallback(() => {
    if (totals.total <= 0) {
      toast.error('Agregá ítems con precio y cantidad')
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
  }, [totals.total, modalidad, cantCuotas, tipoVenc, diasIrreg, header.fechaFactura])

  const guardar = async () => {
    if (!showCuotas) return

    try {
      // Intentar guardar en Supabase
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
        plazo_id:       modalidad === 'CO' ? 1 : null,  // 1 = contado en datos iniciales
      }

      const detalles = computedItems.map(it => ({
        cod_barra:     it.cod,
        descripcion:   it.desc,
        precio:        it.precio,
        iva:           it.iva,
        base:          it.base,
        impuesto:      it.impuesto,
        descuento_pct: it.desc_pct,
        descuento:     it.descMonto || 0,
        cantidad:      it.cantidad,
        total:         it.total,
      }))

      await crearFacturaCompleta(cabecera, detalles)
      toast.success('Factura guardada en Supabase')
    } catch (err) {
      console.warn('Supabase no disponible, guardando local:', err.message)

      // Fallback: guardar en localStorage
      guardarFacturaLocal({
        id: Date.now(),
        header: { ...header },
        items: [...computedItems],
        totals: { ...totals },
        cuotas: cuotasPreview.map(c => ({ ...c, vence: c.vence.toISOString() })),
        plazoLabel,
        modalidad,
        cliente: { ...cliente },
      })
      toast.success('Factura guardada (modo local)')
    }

    setShowCuotas(false)
    setCuotasPreview([])
    navigate('/historial')
  }

  // ── Render ──
  return (
    <div>
      <CabeceraFactura
        header={header}
        setHeader={setHeader}
        totals={totals}
        onModalidadChange={handleModalidadChange}
      />

      <DetalleItems
        items={computedItems}
        onUpdate={updateItem}
        onRemove={removeItem}
        onAdd={addItem}
        totals={totals}
      />

      <div className={`grid gap-3.5 ${showCuotas ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        <ModalidadPago
          modalidad={modalidad}
          setModalidad={handleModalidadChange}
          cantCuotas={cantCuotas}
          setCantCuotas={(v) => { setCantCuotas(v); setShowCuotas(false); }}
          tipoVenc={tipoVenc}
          setTipoVenc={(v) => { setTipoVenc(v); setShowCuotas(false); }}
          diasIrreg={diasIrreg}
          setDiasIrreg={(v) => { setDiasIrreg(v); setShowCuotas(false); }}
          plazoLabel={plazoLabel}
          totalFactura={totals.total}
          onPreview={genPreview}
          onGuardar={guardar}
          showCuotas={showCuotas}
          onHeaderTipoDoc={handleHeaderTipoDoc}
        />

        {showCuotas && (
          <TablaCuotas
            cuotas={cuotasPreview}
            tipo={header.tipoDoc}
            cliente={cliente.nombre}
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
