-- Table de queue pour les notifications (système asynchrone production-ready)
CREATE TABLE IF NOT EXISTS push_notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  user_ids UUID[], -- NULL = tous les users
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,
  error_message TEXT,
  tokens_sent INT DEFAULT 0,
  tokens_failed INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ -- Pour exponential backoff
);

CREATE INDEX IF NOT EXISTS idx_push_jobs_status ON push_notification_jobs(status);
CREATE INDEX IF NOT EXISTS idx_push_jobs_created ON push_notification_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_push_jobs_retry ON push_notification_jobs(next_retry_at) WHERE status = 'failed' AND retry_count < max_retries;

-- Table pour tracker les tokens invalides
CREATE TABLE IF NOT EXISTS invalid_push_tokens (
  push_token TEXT PRIMARY KEY,
  error_type TEXT, -- DeviceNotRegistered, InvalidCredentials, etc.
  marked_invalid_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dead letter queue : jobs définitivement échoués
CREATE TABLE IF NOT EXISTS failed_push_jobs (
  id UUID PRIMARY KEY,
  original_job_id UUID,
  title TEXT,
  body TEXT,
  user_ids UUID[],
  retry_count INT,
  final_error TEXT,
  failed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fonction SQL : Créer un job de notification avec chunking automatique
CREATE OR REPLACE FUNCTION send_push_notification(
  p_title TEXT,
  p_body TEXT,
  p_user_ids UUID[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_ids UUID[] := '{}';
  v_job_id UUID;
  v_tokens TEXT[];
  v_token_count INT;
  v_chunk_size INT := 10000; -- Max 10k tokens par job
  v_chunks INT;
  v_chunk_tokens TEXT[];
BEGIN
  -- Récupérer les tokens
  IF p_user_ids IS NULL THEN
    SELECT ARRAY_AGG(push_token) INTO v_tokens 
    FROM user_push_tokens 
    WHERE push_token IS NOT NULL
    AND push_token NOT IN (SELECT push_token FROM invalid_push_tokens);
  ELSE
    SELECT ARRAY_AGG(push_token) INTO v_tokens 
    FROM user_push_tokens 
    WHERE user_id = ANY(p_user_ids) 
    AND push_token IS NOT NULL
    AND push_token NOT IN (SELECT push_token FROM invalid_push_tokens);
  END IF;
  
  v_token_count := COALESCE(array_length(v_tokens, 1), 0);
  
  IF v_token_count = 0 THEN
    RETURN json_build_object(
      'success', true,
      'sent', 0,
      'message', 'Aucun token valide'
    );
  END IF;
  
  -- Si <= 10k tokens : créer 1 seul job
  IF v_token_count <= v_chunk_size THEN
    INSERT INTO push_notification_jobs (title, body, user_ids)
    VALUES (p_title, p_body, p_user_ids)
    RETURNING id INTO v_job_id;
    
    RETURN json_build_object(
      'success', true,
      'job_ids', ARRAY[v_job_id],
      'jobs_created', 1,
      'estimated_tokens', v_token_count,
      'message', 'Notification en cours de traitement (30-90s)'
    );
  END IF;
  
  -- Si > 10k tokens : créer plusieurs jobs (chunking automatique)
  v_chunks := CEIL(v_token_count::FLOAT / v_chunk_size);
  
  FOR i IN 1..v_chunks LOOP
    -- Créer un job pour chaque chunk
    INSERT INTO push_notification_jobs (
      title, 
      body, 
      user_ids,
      error_message -- Utilisé pour stocker "Chunk X/Y"
    )
    VALUES (
      p_title, 
      p_body, 
      p_user_ids,
      format('Chunk %s/%s', i, v_chunks)
    )
    RETURNING id INTO v_job_id;
    
    v_job_ids := array_append(v_job_ids, v_job_id);
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'job_ids', v_job_ids,
    'jobs_created', v_chunks,
    'estimated_tokens', v_token_count,
    'message', format('Notification divisée en %s jobs (30s-5min)', v_chunks)
  );
END;
$$;

-- Fonction : Récupérer les tokens valides (exclut les invalides)
CREATE OR REPLACE FUNCTION get_valid_push_tokens(
  p_user_ids UUID[] DEFAULT NULL
)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tokens TEXT[];
BEGIN
  IF p_user_ids IS NULL THEN
    SELECT ARRAY_AGG(push_token) INTO v_tokens 
    FROM user_push_tokens 
    WHERE push_token IS NOT NULL
    AND push_token NOT IN (SELECT push_token FROM invalid_push_tokens);
  ELSE
    SELECT ARRAY_AGG(push_token) INTO v_tokens 
    FROM user_push_tokens 
    WHERE user_id = ANY(p_user_ids) 
    AND push_token IS NOT NULL
    AND push_token NOT IN (SELECT push_token FROM invalid_push_tokens);
  END IF;
  
  RETURN v_tokens;
END;
$$;

-- Fonction : Marquer tokens comme invalides et les supprimer
CREATE OR REPLACE FUNCTION mark_tokens_invalid(
  p_tokens TEXT[],
  p_error_type TEXT DEFAULT 'DeviceNotRegistered'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ajouter à la blacklist
  INSERT INTO invalid_push_tokens (push_token, error_type)
  SELECT unnest(p_tokens), p_error_type
  ON CONFLICT (push_token) DO UPDATE SET 
    marked_invalid_at = NOW(),
    error_type = p_error_type;
  
  -- Supprimer de la table principale
  DELETE FROM user_push_tokens 
  WHERE push_token = ANY(p_tokens);
END;
$$;

-- Fonction : Nettoyer les jobs complétés (>7 jours)
CREATE OR REPLACE FUNCTION cleanup_old_push_jobs()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_deleted INT;
BEGIN
  DELETE FROM push_notification_jobs
  WHERE status IN ('completed', 'failed')
  AND completed_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
