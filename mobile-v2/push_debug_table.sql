-- Table de debug pour tracer les tentatives de génération de token
CREATE TABLE IF NOT EXISTS push_debug_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT,
  ts TIMESTAMPTZ DEFAULT NOW(),
  stage TEXT,           -- 'permission-request', 'permission-granted', 'get-token-attempt', 'get-token-success', 'get-token-failure'
  is_device BOOLEAN,
  project_id TEXT,
  token TEXT,
  error JSONB,
  platform TEXT,
  attempt_number INTEGER
);

-- Index pour requêtes rapides
CREATE INDEX IF NOT EXISTS idx_push_debug_device ON push_debug_logs(device_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_push_debug_stage ON push_debug_logs(stage, ts DESC);

-- RLS public (pour debug seulement)
ALTER TABLE push_debug_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert" ON push_debug_logs;
CREATE POLICY "Allow public insert" ON push_debug_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "A-- Table de debug pour tracer les tentatives de génération de token
CREATE TABLE IF NOT_logs FOR SELECT USING (true);
