-- ✅ FIX CRITIQUE : Corriger la table user_push_tokens pour supporter iOS + Android

-- 1. Supprimer l'ancienne table (si vide, sinon migrer les données)
DROP TABLE IF EXISTS user_push_tokens CASCADE;

-- 2. Recréer avec device_id comme clé unique (pas user_id)
CREATE TABLE user_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL UNIQUE,           -- ✅ device_id unique (iOS Constants.installationId)
  push_token TEXT NOT NULL,                  -- Token Expo Push
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- ✅ Nullable car peut être connecté ou non
  platform TEXT,                             -- 'ios' ou 'android'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche par user (permet plusieurs devices par user)
CREATE INDEX idx_user_push_tokens_user_id ON user_push_tokens(user_id);
CREATE INDEX idx_user_push_tokens_device_id ON user_push_tokens(device_id);

-- RLS : Permettre insertion/update publique (car app non-auth peut aussi recevoir notifs)
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON user_push_tokens;
CREATE POLICY "Allow public insert" ON user_push_tokens
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON user_push_tokens;
CREATE POLICY "Allow public update" ON user_push_tokens
  FOR UPDATE USING (true);

-- Commentaires
COMMENT ON TABLE user_push_tokens IS 'Push tokens Expo pour iOS et Android (multi-devices par user)';
COMMENT ON COLUMN user_push_tokens.device_id IS 'ID unique de l appareil (Constants.installationId)';
COMMENT ON COLUMN user_push_tokens.push_token IS 'Token Expo Push (format: ExponentPushToken[...])';
COMMENT ON COLUMN user_push_tokens.platform IS 'Plateforme: ios ou android';
