-- ════════════════════════════════════════════════════════════
--  ARREGLO RÁPIDO: Permitir acceso sin login (anon)
--
--  Ejecutar esto en Supabase → SQL Editor si ya tenías
--  las tablas creadas pero no te conecta.
-- ════════════════════════════════════════════════════════════

-- Opción A: Si ya ejecutaste el schema.sql anterior,
-- primero borrar las políticas viejas:

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND policyname LIKE 'auth_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Ahora crear políticas que permiten acceso anon + authenticated:

CREATE POLICY IF NOT EXISTS "allow_all_clientes"
  ON clientes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_all_productos"
  ON productos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_all_timbrados"
  ON timbrados FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_all_depositos"
  ON depositos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_all_plazos"
  ON plazos FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_all_plazo_detalles"
  ON plazo_detalles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_all_facturas"
  ON facturas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_all_factura_detalles"
  ON factura_detalles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "allow_all_cuentas"
  ON cuentas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Verificar que funciona:
SELECT * FROM clientes LIMIT 5;
