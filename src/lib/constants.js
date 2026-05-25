// ══════════════════════════════════════════════
//  Datos mock para desarrollo sin Supabase.
//  En producción estos vendrían de la base de datos.
// ══════════════════════════════════════════════

export const CLIENTES = [
  { id: 15, nombre: 'Gregorio Quintana González', ruc: '3419776-0', direccion: 'Asunción', telefono: '0961-894343' },
  { id: 16, nombre: 'María López Fernández', ruc: '4521889-1', direccion: 'San Lorenzo', telefono: '0981-223344' },
  { id: 17, nombre: 'Carlos Ramírez Ortega', ruc: '2987654-3', direccion: 'Luque', telefono: '0971-556677' },
  { id: 18, nombre: 'Ana Benítez de Sosa', ruc: '5678432-0', direccion: 'Fernando de la Mora', telefono: '0991-112233' },
]

export const PRODUCTOS = [
  { cod: '7841617000662', desc: 'Producto 1 x Unid', precio: 27560.00, iva: 5 },
  { cod: '7842568000312', desc: 'Producto 2 x Unid', precio: 125000.00, iva: 0 },
  { cod: '7840036106030', desc: 'Producto 3 x Unid', precio: 65842.00, iva: 10 },
  { cod: '7793742000669', desc: 'Producto 4 x Unid', precio: 365824.00, iva: 10 },
  { cod: '7841234000111', desc: 'Producto 5 x Pack', precio: 45000.00, iva: 10 },
  { cod: '7849999000222', desc: 'Producto 6 x Caja', precio: 89500.00, iva: 5 },
]

export const DEPOSITOS = ['Depósito 1', 'Depósito 2', 'Depósito Central']

export const TIPOS_DOCUMENTO = ['Factura Contado', 'Factura Crédito']

export const MONEDAS = ['Guaraní', 'Dólar', 'Real']

export const TASAS_IVA = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
]
