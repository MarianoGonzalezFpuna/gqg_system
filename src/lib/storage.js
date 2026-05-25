// ══════════════════════════════════════════════════════════════
//  Almacenamiento local para modo DEMO (sin Supabase).
//  Reemplazar estas funciones por las de supabase.js
//  cuando conectes la base de datos real.
// ══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'gqg_facturas'

export function guardarFacturaLocal(factura) {
  const facturas = obtenerFacturasLocal()
  facturas.unshift(factura)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(facturas))
  return factura
}

export function obtenerFacturasLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function limpiarFacturasLocal() {
  localStorage.removeItem(STORAGE_KEY)
}
