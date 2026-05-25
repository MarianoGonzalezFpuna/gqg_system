import { format, addDays, addMonths } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatear fecha a DD/MM/YYYY
 */
export function formatearFecha(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date + 'T12:00:00') : date
  return format(d, 'dd/MM/yyyy', { locale: es })
}

/**
 * Formatear número con 2 decimales y separador de miles
 */
export function fmtNum(n) {
  return new Intl.NumberFormat('es-PY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

/**
 * Calcular Base e Impuesto a partir de un total con IVA incluido
 */
export function calcularIVA(totalConIva, tasaIva) {
  if (tasaIva <= 0) return { base: totalConIva, impuesto: 0 }
  const base = totalConIva / (1 + tasaIva / 100)
  const impuesto = totalConIva - base
  return {
    base: Math.round(base * 100) / 100,
    impuesto: Math.round(impuesto * 100) / 100,
  }
}

/**
 * Generar etiqueta de plazo (ej: "CR-30-45-60 días")
 */
export function generarEtiquetaPlazo(modalidad, cantCuotas, tipoVenc, diasIrregulares) {
  if (modalidad === 'CO') return 'CO-Contado'
  if (tipoVenc === 'regular') {
    const dias = Array.from({ length: cantCuotas }, (_, i) => (i + 1) * 30)
    return `CR-${dias.join('-')} días`
  }
  return `CR-${diasIrregulares.slice(0, cantCuotas).join('-')} días`
}

/**
 * Generar cuotas (vista previa en frontend).
 * La generación real ocurre en el trigger de PostgreSQL.
 */
export function generarCuotas(total, cantCuotas, tipoVenc, diasIrregulares, fechaFactura) {
  const cuotas = []
  const importeCuota = Math.floor(total / cantCuotas)
  const resto = total - importeCuota * cantCuotas

  for (let i = 0; i < cantCuotas; i++) {
    let vence
    if (tipoVenc === 'regular') {
      vence = addMonths(fechaFactura, i + 1)
    } else {
      const dias = diasIrregulares[i] || 30 * (i + 1)
      vence = addDays(fechaFactura, dias)
    }

    cuotas.push({
      numero: `"${i + 1}/${cantCuotas}"`,
      importe: i === cantCuotas - 1 ? importeCuota + resto : importeCuota,
      vence,
      cobrado: 0,
    })
  }
  return cuotas
}

/**
 * Calcular totales de la factura a partir de los ítems
 */
export function calcularTotalesFactura(items) {
  let neto = 0
  let impuesto = 0
  let excento = 0
  let cantItems = 0

  items.forEach(it => {
    const totalBruto = it.precio * it.cantidad
    const descMonto = totalBruto * (it.desc_pct / 100)
    const totalNeto = totalBruto - descMonto
    const { base, impuesto: imp } = calcularIVA(totalNeto, it.iva)

    if (it.iva === 0) {
      excento += totalNeto
    } else {
      neto += base
      impuesto += imp
    }
    cantItems += it.cantidad
  })

  const total = neto + impuesto + excento

  return {
    neto: Math.round(neto * 100) / 100,
    impuesto: Math.round(impuesto * 100) / 100,
    excento: Math.round(excento * 100) / 100,
    total: Math.round(total * 100) / 100,
    cantItems,
  }
}

/**
 * Calcular campos derivados de un ítem
 */
export function calcularItem(item) {
  const totalBruto = item.precio * item.cantidad
  const descMonto = totalBruto * (item.desc_pct / 100)
  const totalNeto = totalBruto - descMonto
  const { base, impuesto } = calcularIVA(totalNeto, item.iva)

  return {
    ...item,
    totalBruto,
    descMonto,
    base,
    impuesto,
    total: totalNeto,
  }
}
