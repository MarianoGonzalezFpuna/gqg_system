import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PRODUCTOS } from '../lib/constants'
import { fmtNum } from '../lib/utils'

export default function Catalogo() {
  const navigate = useNavigate()

  // Nota: en un app real, esto agregaría al state global.
  // Aquí solo mostramos el catálogo como referencia visual.
  const agregar = (producto) => {
    toast.success(`"${producto.desc}" — copiá los datos a la factura`, { duration: 3000 })
    navigate('/')
  }

  return (
    <div>
      <h2 className="text-gqg-gold font-bold text-base mb-1">📦 Catálogo de Productos</h2>
      <p className="text-xs text-gqg-muted mb-4">
        Hacé clic en un producto para volver al formulario de factura.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PRODUCTOS.map((p, i) => (
          <button
            key={i}
            onClick={() => agregar(p)}
            className="bg-gqg-card border border-gqg-border rounded-lg p-4 text-left
              hover:border-gqg-gold transition-colors cursor-pointer group"
          >
            <div className="text-[13px] font-bold text-gqg-text group-hover:text-white transition-colors mb-1">
              {p.desc}
            </div>
            <div className="text-[11px] text-gqg-muted font-mono mb-3">{p.cod}</div>
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-gqg-teal">{fmtNum(p.precio)}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                p.iva === 0 ? 'text-gqg-muted bg-gqg-muted/10' : 'text-gqg-gold bg-gqg-gold/10'
              }`}>
                IVA {p.iva}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
