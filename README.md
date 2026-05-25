# GQG System — Módulo de Pagos v2

Sistema de facturación con soporte completo de **Contado** y **Crédito** (vencimiento regular e irregular), incluyendo detalle de ítems, cálculo de IVA y datos de timbrado.

---

## Instalación

### Requisitos
- **Node.js** 18 o superior → https://nodejs.org

### Pasos

```bash
# 1. Descomprimir
unzip gqg-system-v2.zip
cd gqg-system-v2

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

Se abre en **http://localhost:5173** y funciona inmediatamente en modo demo (sin necesidad de Supabase).

### Compilar para producción
```bash
npm run build
# Los archivos quedan en dist/
```

---

## Estructura del Proyecto

```
gqg-system-v2/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
│
├── src/
│   ├── main.jsx                    ← Entrada React + Router + Toast
│   ├── App.jsx                     ← Rutas de la aplicación
│   │
│   ├── components/
│   │   ├── Header.jsx              ← Navegación superior
│   │   ├── CabeceraFactura.jsx     ← Cabecera: timbrado, cliente, totales
│   │   ├── DetalleItems.jsx        ← Tabla de ítems con IVA
│   │   ├── ModalidadPago.jsx       ← Selector contado/crédito + cuotas
│   │   └── TablaCuotas.jsx         ← Preview de cuotas generadas
│   │
│   ├── pages/
│   │   ├── NuevaFactura.jsx        ← Página principal (compone todo)
│   │   ├── Historial.jsx           ← Facturas guardadas
│   │   ├── Catalogo.jsx            ← Lista de productos
│   │   └── Plazos.jsx              ← Configuración de plazos
│   │
│   ├── lib/
│   │   ├── constants.js            ← Clientes, productos, mock data
│   │   ├── utils.js                ← Cálculos de IVA, cuotas, formato
│   │   ├── supabase.js             ← Cliente Supabase (para producción)
│   │   └── storage.js              ← localStorage (para modo demo)
│   │
│   └── styles/
│       └── index.css               ← Tailwind + estilos globales
│
└── supabase/
    └── schema.sql                  ← Tablas, triggers, datos iniciales
```

---

## Conectar Supabase (opcional)

1. Crear proyecto en https://app.supabase.com
2. Copiar `.env.example` a `.env` y completar las credenciales
3. Ejecutar `supabase/schema.sql` en el SQL Editor
4. En `src/pages/NuevaFactura.jsx`, reemplazar `guardarFacturaLocal()` por `crearFactura()` de `src/lib/supabase.js`

---

## Funcionalidades

- Cabecera de factura completa (timbrado, RUC, cliente, depósito)
- Detalle de ítems con código de barra, precio, IVA (0%, 5%, 10%), descuento y cantidad
- Cálculo automático de Base, Impuesto, Excento y Total
- Modalidad Contado (1 cuota) o Crédito (N cuotas)
- Vencimiento Regular (30-60-90 días) o Irregular (días específicos)
- Vista previa de cuotas antes de guardar
- Historial con detalle expandible de ítems
- Catálogo de productos de referencia
- Configuración de plazos
