-- ════════════════════════════════════════════════════════════
--  GQG SYSTEM — MÓDULO DE PAGOS (esquema completo)
--  Supabase / PostgreSQL
--
--  Instrucciones:
--  1. Ir a https://app.supabase.com → tu proyecto → SQL Editor
--  2. Pegar todo este archivo y ejecutar
--  3. Las tablas, índices y triggers se crean automáticamente
-- ════════════════════════════════════════════════════════════


-- ┌──────────────────────────────────────────┐
-- │  TABLA: clientes                         │
-- │  Clientes y proveedores                  │
-- └──────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS clientes (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(150) NOT NULL,
  ruc_ci      VARCHAR(20),                     -- RUC o Cédula de Identidad
  direccion   VARCHAR(200),
  telefono    VARCHAR(30),
  email       VARCHAR(100),
  tipo        VARCHAR(15) DEFAULT 'cliente'    -- 'cliente', 'proveedor', 'ambos'
                CHECK (tipo IN ('cliente', 'proveedor', 'ambos')),
  activo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE clientes IS 'Clientes y proveedores del sistema';


-- ┌──────────────────────────────────────────┐
-- │  TABLA: productos                        │
-- │  Catálogo de productos                   │
-- └──────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS productos (
  id            SERIAL PRIMARY KEY,
  cod_barra     VARCHAR(20) UNIQUE,              -- Código de barra (EAN-13, etc.)
  descripcion   VARCHAR(200) NOT NULL,
  precio        NUMERIC(15,2) NOT NULL DEFAULT 0,
  iva           INT NOT NULL DEFAULT 10          -- Tasa IVA: 0, 5, 10
                  CHECK (iva IN (0, 5, 10)),
  costo         NUMERIC(15,2) DEFAULT 0,         -- Precio de costo (para compras)
  stock         NUMERIC(12,2) DEFAULT 0,
  unidad        VARCHAR(20) DEFAULT 'Unid',      -- Unid, Pack, Caja, Kg, Lt
  activo        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE productos IS 'Catálogo de productos con precios e IVA';


-- ┌──────────────────────────────────────────┐
-- │  TABLA: timbrados                        │
-- │  Datos de timbrado del contribuyente     │
-- └──────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS timbrados (
  id                SERIAL PRIMARY KEY,
  numero            VARCHAR(20) NOT NULL,         -- Nro de timbrado (ej: 17155531)
  ruc               VARCHAR(20) NOT NULL,         -- RUC de la empresa
  fecha_inicio      DATE NOT NULL,
  fecha_fin         DATE NOT NULL,
  punto_expedicion  VARCHAR(5) DEFAULT '001',     -- Ej: 001
  activo            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE timbrados IS 'Timbrados vigentes del contribuyente';


-- ┌──────────────────────────────────────────┐
-- │  TABLA: depositos                        │
-- │  Depósitos / sucursales                  │
-- └──────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS depositos (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  direccion   VARCHAR(200),
  activo      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE depositos IS 'Depósitos o sucursales de la empresa';


-- ┌──────────────────────────────────────────┐
-- │  TABLA: plazos                           │
-- │  Configuraciones de tipos de pago        │
-- └──────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS plazos (
  id          SERIAL PRIMARY KEY,
  plazo       VARCHAR(100) NOT NULL,          -- Ej: "CO-Contado", "CR-30/60/90 días"
  tipo_id     INT NOT NULL DEFAULT 0,          -- 0 = Contado, 1 = Crédito
  cuotas      INT NOT NULL DEFAULT 1,
  irregular   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE plazos IS 'Configuraciones de tipos de pago (contado/crédito)';


-- ┌──────────────────────────────────────────┐
-- │  TABLA: plazo_detalles                   │
-- │  Días por cuota (solo para irregulares)  │
-- └──────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS plazo_detalles (
  id        SERIAL PRIMARY KEY,
  plazo_id  INT NOT NULL REFERENCES plazos(id) ON DELETE CASCADE,
  cuota     INT NOT NULL,
  dias      INT NOT NULL DEFAULT 30
);

COMMENT ON TABLE plazo_detalles IS 'Detalle de días por cuota para plazos irregulares';


-- ┌──────────────────────────────────────────┐
-- │  TABLA: facturas                         │
-- │  Cabecera de ventas y compras            │
-- └──────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS facturas (
  id              SERIAL PRIMARY KEY,
  numero          VARCHAR(20) NOT NULL UNIQUE,     -- "001-001-0044685"
  tipo            VARCHAR(10) NOT NULL             -- 'venta' o 'compra'
                    CHECK (tipo IN ('venta', 'compra')),
  cliente_id      INT NOT NULL REFERENCES clientes(id),
  timbrado_id     INT REFERENCES timbrados(id),
  deposito_id     INT REFERENCES depositos(id),
  fecha           DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_proceso   TIMESTAMPTZ DEFAULT NOW(),
  moneda          VARCHAR(20) DEFAULT 'Guaraní',
  total_neto      NUMERIC(15,2) NOT NULL DEFAULT 0,   -- Base imponible (sin IVA)
  total_impuesto  NUMERIC(15,2) NOT NULL DEFAULT 0,   -- Suma de IVA
  total_excento   NUMERIC(15,2) NOT NULL DEFAULT 0,   -- Items con IVA 0%
  total           NUMERIC(15,2) NOT NULL,              -- Neto + Impuesto + Excento
  modalidad       VARCHAR(2) NOT NULL
                    CHECK (modalidad IN ('CO', 'CR')),
  plazo_id        INT REFERENCES plazos(id),
  estado          VARCHAR(20) DEFAULT 'pendiente',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE facturas IS 'Cabecera de facturas de venta y compra';


-- ┌──────────────────────────────────────────┐
-- │  TABLA: factura_detalles                 │
-- │  Líneas / ítems de cada factura          │
-- └──────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS factura_detalles (
  id            SERIAL PRIMARY KEY,
  factura_id    INT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  item_nro      INT NOT NULL,                      -- Orden del ítem (1, 2, 3...)
  producto_id   INT REFERENCES productos(id),      -- NULL si se carga manualmente
  cod_barra     VARCHAR(20),
  descripcion   VARCHAR(200) NOT NULL,
  precio        NUMERIC(15,2) NOT NULL,            -- Precio unitario con IVA incluido
  iva           INT NOT NULL DEFAULT 10            -- Tasa: 0, 5, 10
                  CHECK (iva IN (0, 5, 10)),
  base          NUMERIC(15,2) NOT NULL DEFAULT 0,  -- Precio / (1 + iva/100)
  impuesto      NUMERIC(15,2) NOT NULL DEFAULT 0,  -- Precio - Base
  descuento_pct NUMERIC(5,2) DEFAULT 0,            -- % de descuento
  descuento     NUMERIC(15,2) DEFAULT 0,           -- Monto del descuento
  cantidad      NUMERIC(12,2) NOT NULL DEFAULT 1,
  total         NUMERIC(15,2) NOT NULL DEFAULT 0,  -- (Precio * Cantidad) - Descuento
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE factura_detalles IS 'Líneas de detalle de cada factura (productos/ítems)';


-- ┌──────────────────────────────────────────┐
-- │  TABLA: cuentas                          │
-- │  Cuotas / Cuentas a cobrar y pagar       │
-- └──────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS cuentas (
  id          SERIAL PRIMARY KEY,
  factura_id  INT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
  tipo        VARCHAR(10) NOT NULL
                CHECK (tipo IN ('cobrar', 'pagar')),
  cuota       VARCHAR(10) NOT NULL,               -- "1/3", "2/3"
  importe     NUMERIC(15,2) NOT NULL,
  vence       DATE NOT NULL,
  cobrado     NUMERIC(15,2) DEFAULT 0,
  estado      VARCHAR(20) DEFAULT 'pendiente',    -- pendiente, parcial, pagado
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE cuentas IS 'Cuotas individuales - cuentas a cobrar y pagar';


-- ┌──────────────────────────────────────────┐
-- │  ÍNDICES                                 │
-- └──────────────────────────────────────────┘

CREATE INDEX IF NOT EXISTS idx_productos_cod      ON productos(cod_barra);
CREATE INDEX IF NOT EXISTS idx_clientes_ruc       ON clientes(ruc_ci);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre    ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_facturas_cliente   ON facturas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_facturas_fecha     ON facturas(fecha);
CREATE INDEX IF NOT EXISTS idx_facturas_tipo      ON facturas(tipo);
CREATE INDEX IF NOT EXISTS idx_facturas_estado    ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_fdet_factura       ON factura_detalles(factura_id);
CREATE INDEX IF NOT EXISTS idx_fdet_producto      ON factura_detalles(producto_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_factura    ON cuentas(factura_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_vence      ON cuentas(vence);
CREATE INDEX IF NOT EXISTS idx_cuentas_estado     ON cuentas(estado);
CREATE INDEX IF NOT EXISTS idx_cuentas_tipo       ON cuentas(tipo);


-- ════════════════════════════════════════════════════════════
--  TRIGGER: Generar cuotas automáticamente al insertar factura
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_generar_cuotas()
RETURNS TRIGGER AS $$
DECLARE
  v_plazo       RECORD;
  v_cant_cuotas INT;
  v_irregular   BOOLEAN;
  v_tipo_cuenta VARCHAR(10);
  v_importe     NUMERIC(15,2);
  v_resto       NUMERIC(15,2);
  v_fecha_venc  DATE;
  v_dias        INT;
  i             INT;
BEGIN
  IF NEW.tipo = 'venta' THEN
    v_tipo_cuenta := 'cobrar';
  ELSE
    v_tipo_cuenta := 'pagar';
  END IF;

  -- CONTADO
  IF NEW.modalidad = 'CO' THEN
    INSERT INTO cuentas (factura_id, tipo, cuota, importe, vence, cobrado, estado)
    VALUES (NEW.id, v_tipo_cuenta, '1/1', NEW.total, NEW.fecha, 0, 'pendiente');
    RETURN NEW;
  END IF;

  -- CRÉDITO
  SELECT * INTO v_plazo FROM plazos WHERE id = NEW.plazo_id;
  IF v_plazo IS NULL THEN
    RAISE EXCEPTION 'Plazo con id % no encontrado', NEW.plazo_id;
  END IF;

  v_cant_cuotas := v_plazo.cuotas;
  v_irregular   := v_plazo.irregular;
  v_importe     := FLOOR(NEW.total / v_cant_cuotas);
  v_resto       := NEW.total - (v_importe * v_cant_cuotas);

  FOR i IN 1..v_cant_cuotas LOOP
    IF v_irregular THEN
      SELECT dias INTO v_dias FROM plazo_detalles
      WHERE plazo_id = NEW.plazo_id AND cuota = i;
      IF v_dias IS NULL THEN v_dias := i * 30; END IF;
      v_fecha_venc := NEW.fecha + v_dias;
    ELSE
      v_fecha_venc := NEW.fecha + (i * 30);
    END IF;

    INSERT INTO cuentas (factura_id, tipo, cuota, importe, vence, cobrado, estado)
    VALUES (
      NEW.id, v_tipo_cuenta,
      i || '/' || v_cant_cuotas,
      CASE WHEN i = v_cant_cuotas THEN v_importe + v_resto ELSE v_importe END,
      v_fecha_venc, 0, 'pendiente'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generar_cuotas ON facturas;
CREATE TRIGGER trg_generar_cuotas
  AFTER INSERT ON facturas
  FOR EACH ROW EXECUTE FUNCTION fn_generar_cuotas();


-- ════════════════════════════════════════════════════════════
--  TRIGGER: Recalcular totales de factura al insertar/editar
--  detalle (opcional, útil para consistencia)
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION fn_recalcular_totales_factura()
RETURNS TRIGGER AS $$
DECLARE
  v_factura_id INT;
  v_neto       NUMERIC(15,2);
  v_impuesto   NUMERIC(15,2);
  v_excento    NUMERIC(15,2);
BEGIN
  -- Determinar factura afectada
  IF TG_OP = 'DELETE' THEN
    v_factura_id := OLD.factura_id;
  ELSE
    v_factura_id := NEW.factura_id;
  END IF;

  -- Sumar desde los detalles
  SELECT
    COALESCE(SUM(CASE WHEN iva > 0 THEN base * cantidad END), 0),
    COALESCE(SUM(CASE WHEN iva > 0 THEN impuesto * cantidad END), 0),
    COALESCE(SUM(CASE WHEN iva = 0 THEN total END), 0)
  INTO v_neto, v_impuesto, v_excento
  FROM factura_detalles
  WHERE factura_id = v_factura_id;

  UPDATE facturas SET
    total_neto     = v_neto,
    total_impuesto = v_impuesto,
    total_excento  = v_excento,
    total          = v_neto + v_impuesto + v_excento
  WHERE id = v_factura_id;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalcular_totales ON factura_detalles;
CREATE TRIGGER trg_recalcular_totales
  AFTER INSERT OR UPDATE OR DELETE ON factura_detalles
  FOR EACH ROW EXECUTE FUNCTION fn_recalcular_totales_factura();


-- ════════════════════════════════════════════════════════════
--  FUNCIÓN: Registrar pago en una cuota
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION registrar_pago(p_cuenta_id INT, p_monto NUMERIC)
RETURNS cuentas AS $$
DECLARE
  v_cuenta cuentas;
BEGIN
  SELECT * INTO v_cuenta FROM cuentas WHERE id = p_cuenta_id;
  IF v_cuenta IS NULL THEN
    RAISE EXCEPTION 'Cuenta con id % no encontrada', p_cuenta_id;
  END IF;

  UPDATE cuentas SET
    cobrado = cobrado + p_monto,
    estado = CASE WHEN cobrado + p_monto >= importe THEN 'pagado' ELSE 'parcial' END
  WHERE id = p_cuenta_id
  RETURNING * INTO v_cuenta;

  IF NOT EXISTS (
    SELECT 1 FROM cuentas WHERE factura_id = v_cuenta.factura_id AND estado != 'pagado'
  ) THEN
    UPDATE facturas SET estado = 'pagado' WHERE id = v_cuenta.factura_id;
  END IF;

  RETURN v_cuenta;
END;
$$ LANGUAGE plpgsql;


-- ════════════════════════════════════════════════════════════
--  DATOS INICIALES
-- ════════════════════════════════════════════════════════════

-- Depósitos
INSERT INTO depositos (nombre, direccion) VALUES
  ('Depósito 1', 'Sede Central'),
  ('Depósito 2', 'Sucursal Norte'),
  ('Depósito Central', 'Almacén principal');

-- Timbrado
INSERT INTO timbrados (numero, ruc, fecha_inicio, fecha_fin, punto_expedicion) VALUES
  ('17155531', '384649-0', '2024-04-11', '2025-04-30', '001');

-- Clientes
INSERT INTO clientes (nombre, ruc_ci, direccion, telefono, tipo) VALUES
  ('Gregorio Quintana González', '3419776-0', 'Asunción', '0961-894343', 'cliente'),
  ('María López Fernández', '4521889-1', 'San Lorenzo', '0981-223344', 'cliente'),
  ('Carlos Ramírez Ortega', '2987654-3', 'Luque', '0971-556677', 'cliente'),
  ('Ana Benítez de Sosa', '5678432-0', 'Fernando de la Mora', '0991-112233', 'ambos'),
  ('Distribuidora Central S.A.', '80012345-6', 'Asunción', '021-445566', 'proveedor');

-- Productos
INSERT INTO productos (cod_barra, descripcion, precio, iva, stock, unidad) VALUES
  ('7841617000662', 'Producto 1 x Unid', 27560.00, 5, 150, 'Unid'),
  ('7842568000312', 'Producto 2 x Unid', 125000.00, 0, 80, 'Unid'),
  ('7840036106030', 'Producto 3 x Unid', 65842.00, 10, 200, 'Unid'),
  ('7793742000669', 'Producto 4 x Unid', 365824.00, 10, 45, 'Unid'),
  ('7841234000111', 'Producto 5 x Pack', 45000.00, 10, 300, 'Pack'),
  ('7849999000222', 'Producto 6 x Caja', 89500.00, 5, 120, 'Caja');

-- Plazos
INSERT INTO plazos (plazo, tipo_id, cuotas, irregular) VALUES
  ('CO-Contado', 0, 1, false),
  ('CR-30/60/90 días', 1, 3, false),
  ('CR-30/60/90/120 días', 1, 4, false),
  ('CR-25/40/55 días', 1, 3, true);

INSERT INTO plazo_detalles (plazo_id, cuota, dias) VALUES
  (4, 1, 25),
  (4, 2, 40),
  (4, 3, 55);


-- ════════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE timbrados ENABLE ROW LEVEL SECURITY;
ALTER TABLE depositos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plazos ENABLE ROW LEVEL SECURITY;
ALTER TABLE plazo_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según roles de tu app)
CREATE POLICY "auth_clientes"        ON clientes FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_productos"       ON productos FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_timbrados"       ON timbrados FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_depositos"       ON depositos FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_plazos"          ON plazos FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_plazo_detalles"  ON plazo_detalles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_facturas"        ON facturas FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_factura_det"     ON factura_detalles FOR ALL TO authenticated USING (true);
CREATE POLICY "auth_cuentas"         ON cuentas FOR ALL TO authenticated USING (true);
