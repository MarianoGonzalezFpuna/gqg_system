import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/',          label: 'Nueva Factura', icon: '📝' },
  { to: '/historial', label: 'Historial',     icon: '📋' },
  { to: '/catalogo',  label: 'Catálogo',      icon: '📦' },
  { to: '/plazos',    label: 'Plazos',        icon: '⚙️' },
]

export default function Header() {
  return (
    <header className="bg-gqg-card border-b border-gqg-border">
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gqg-gold to-gqg-gold-dark flex items-center justify-center text-gqg-bg font-extrabold text-lg">
          G
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-white leading-tight">GQG System</h1>
          <p className="text-[11px] text-gqg-muted tracking-widest uppercase">
            Módulo de Pagos — Facturación Completa
          </p>
        </div>
      </div>
      <nav className="flex gap-0 px-6">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-4 py-2 text-xs font-medium tracking-wide uppercase rounded-t-md transition-all ${
                isActive
                  ? 'bg-gqg-bg text-gqg-gold border-t-2 border-gqg-gold -mb-px'
                  : 'text-gqg-muted hover:text-gqg-text border-t-2 border-transparent'
              }`
            }
          >
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
