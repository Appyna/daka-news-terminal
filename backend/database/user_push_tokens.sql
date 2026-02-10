-- Table pour stocker les push tokens des users
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index pour recherche rapide par user
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);

-- Commentaires
COMMENT ON TABLE user_push_tokens IS 'Tokens Expo Push pour envoyer des notifications aux users';
COMMENT ON COLUMN user_push_tokens.push_token IS 'Token Expo Push (format: ExponentPushToken[...])';
