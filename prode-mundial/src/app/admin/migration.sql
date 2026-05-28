-- ============================================================
-- Backoffice /admin — Migración inicial
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- 1. Tabla user_roles
-- Controla quién puede acceder al backoffice.
-- Poblar manualmente: INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'super_admin');
CREATE TABLE IF NOT EXISTS user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text NOT NULL CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS: solo service_role puede leer/escribir (el backoffice usa service_role key)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role full access" ON user_roles
  USING (true) WITH CHECK (true);

-- 2. Extender matches con columnas opcionales
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS grupo    text,
  ADD COLUMN IF NOT EXISTS sede     text,
  ADD COLUMN IF NOT EXISTS estadio  text,
  ADD COLUMN IF NOT EXISTS fixture_api_id int;

-- 3. Extender audit_logs con campos before/after
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS entity    text,
  ADD COLUMN IF NOT EXISTS entity_id text,
  ADD COLUMN IF NOT EXISTS before    jsonb,
  ADD COLUMN IF NOT EXISTS after     jsonb;

-- ============================================================
-- Seed: agregar super_admin
-- Reemplazar el UUID con el del usuario real en auth.users
-- ============================================================
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('<UUID-del-super-admin>', 'super_admin')
-- ON CONFLICT (user_id) DO NOTHING;
