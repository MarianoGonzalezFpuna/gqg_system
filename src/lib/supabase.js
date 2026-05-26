import { createClient } from '@supabase/supabase-js'

// ══════════════════════════════════════════════════════════════
//  CONFIGURACIÓN - Reemplazar con tus datos de Supabase
//  https://app.supabase.com → Settings → API
// ══════════════════════════════════════════════════════════════

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://TU-PROYECTO.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU-ANON-KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)


// ══════════════════════════════════════════
//  CLIENTES
// ══════════════════════════════════════════

export async function obtenerClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}

export async function crearCliente(cliente) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([cliente])
    .select()
  if (error) throw error
  return data[0]
}

export async function buscarClientes(texto) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('activo', true)
    .or(`nombre.ilike.%${texto}%,ruc_ci.ilike.%${texto}%`)
    .order('nombre')
    .limit(10)
  if (error) throw error
  return data
}

export async function actualizarCliente(id, cliente) {
  const { data, error } = await supabase
    .from('clientes')
    .update(cliente)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export async function eliminarCliente(id) {
  const { error } = await supabase
    .from('clientes')
    .update({ activo: false })
    .eq('id', id)
  if (error) throw error
}


// ══════════════════════════════════════════
//  PRODUCTOS
// ══════════════════════════════════════════

export async function obtenerProductos() {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('descripcion')
  if (error) throw error
  return data
}

export async function buscarProductos(texto) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .or(`descripcion.ilike.%${texto}%,cod_barra.ilike.%${texto}%`)
    .order('descripcion')
    .limit(20)
  if (error) throw error
  return data
}

export async function buscarProductoPorCodigo(codBarra) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('cod_barra', codBarra)
    .single()
  if (error) return null
  return data
}

export async function crearProducto(producto) {
  const { data, error } = await supabase
    .from('productos')
    .insert([producto])
    .select()
  if (error) throw error
  return data[0]
}

export async function actualizarProducto(id, producto) {
  const { data, error } = await supabase
    .from('productos')
    .update(producto)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export async function eliminarProducto(id) {
  const { error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', id)
  if (error) throw error
}


// ══════════════════════════════════════════
//  TIMBRADOS y DEPÓSITOS
// ══════════════════════════════════════════

export async function obtenerTimbradoActivo() {
  const { data, error } = await supabase
    .from('timbrados')
    .select('*')
    .eq('activo', true)
    .order('id', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function obtenerDepositos() {
  const { data, error } = await supabase
    .from('depositos')
    .select('*')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}


// ══════════════════════════════════════════
//  FACTURAS
// ══════════════════════════════════════════

/**
 * Crear factura completa: cabecera + detalles.
 * El trigger fn_generar_cuotas() crea las cuotas automáticamente.
 * El trigger fn_recalcular_totales_factura() actualiza los totales.
 */
export async function crearFacturaCompleta(cabecera, detalles) {
  // 1. Insertar cabecera
  const { data: factura, error: errFact } = await supabase
    .from('facturas')
    .insert([cabecera])
    .select()
  if (errFact) throw errFact

  const facturaId = factura[0].id

  // 2. Insertar detalles (el trigger recalcula totales)
  const detallesConId = detalles.map((d, i) => ({
    factura_id:   facturaId,
    item_nro:     i + 1,
    producto_id:  d.producto_id || null,
    cod_barra:    d.cod_barra,
    descripcion:  d.descripcion,
    precio:       d.precio,
    iva:          d.iva,
    base:         d.base,
    impuesto:     d.impuesto,
    descuento_pct: d.descuento_pct || 0,
    descuento:    d.descuento || 0,
    cantidad:     d.cantidad,
    total:        d.total,
  }))

  const { error: errDet } = await supabase
    .from('factura_detalles')
    .insert(detallesConId)
  if (errDet) throw errDet

  return factura[0]
}

/**
 * Obtener facturas con detalles y cuotas.
 */
export async function obtenerFacturas() {
  const { data, error } = await supabase
    .from('facturas')
    .select(`
      *,
      cliente:clientes(*),
      timbrado:timbrados(*),
      deposito:depositos(*),
      factura_detalles(*),
      cuentas(*)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}


// ══════════════════════════════════════════
//  CUENTAS (cuotas)
// ══════════════════════════════════════════

export async function obtenerCuotas(facturaId) {
  const { data, error } = await supabase
    .from('cuentas')
    .select('*')
    .eq('factura_id', facturaId)
    .order('vence', { ascending: true })
  if (error) throw error
  return data
}

export async function registrarPago(cuentaId, monto) {
  const { data, error } = await supabase
    .rpc('registrar_pago', { p_cuenta_id: cuentaId, p_monto: monto })
  if (error) throw error
  return data
}


// ══════════════════════════════════════════
//  PLAZOS
// ══════════════════════════════════════════

export async function obtenerPlazos() {
  const { data, error } = await supabase
    .from('plazos')
    .select('*, plazo_detalles(*)')
    .order('id')
  if (error) throw error
  return data
}

export async function crearPlazo(plazo, detalles = []) {
  const { data, error } = await supabase
    .from('plazos')
    .insert([plazo])
    .select()
  if (error) throw error

  if (detalles.length > 0) {
    const detallesConId = detalles.map(d => ({
      ...d,
      plazo_id: data[0].id,
    }))
    const { error: detErr } = await supabase
      .from('plazo_detalles')
      .insert(detallesConId)
    if (detErr) throw detErr
  }

  return data[0]
}

export async function actualizarPlazo(id, plazo, detalles = []) {
  const { data, error } = await supabase
    .from('plazos')
    .update(plazo)
    .eq('id', id)
    .select()
  if (error) throw error

  // Borrar detalles viejos y reinsertar
  const { error: delErr } = await supabase
    .from('plazo_detalles')
    .delete()
    .eq('plazo_id', id)
  if (delErr) throw delErr

  if (detalles.length > 0) {
    const detallesConId = detalles.map(d => ({
      plazo_id: id,
      cuota: d.cuota,
      dias: d.dias,
    }))
    const { error: detErr } = await supabase
      .from('plazo_detalles')
      .insert(detallesConId)
    if (detErr) throw detErr
  }

  return data[0]
}

export async function eliminarPlazo(id) {
  const { error } = await supabase
    .from('plazos')
    .delete()
    .eq('id', id)
  if (error) throw error
}
