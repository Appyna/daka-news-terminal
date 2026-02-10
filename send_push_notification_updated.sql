-- Fonction SQL qui appelle l'Edge Function avec batching
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
  v_tokens TEXT[];
  v_count INT;
  v_response_id BIGINT;
  v_edge_function_url TEXT := 'https://wzqhrothppyktowwllkr.supabase.co/functions/v1/send-push-notification';
  v_anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cWhyb3RocHB5a3Rvd3dsbGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MDIxOTUsImV4cCI6MjA1NDA3ODE5NX0.TYJk_uOT1W6BX_c-wgb5UxvFRg-K3I6r8jwxeWE-8TE';
BEGIN
  -- Récupérer les tokens
  IF p_user_ids IS NULL THEN
    SELECT ARRAY_AGG(push_token) INTO v_tokens 
    FROM user_push_tokens 
    WHERE push_token IS NOT NULL;
  ELSE
    SELECT ARRAY_AGG(push_token) INTO v_tokens 
    FROM user_push_tokens 
    WHERE user_id = ANY(p_user_ids) AND push_token IS NOT NULL;
  END IF;
  
  v_count := COALESCE(array_length(v_tokens, 1), 0);
  
  IF v_count = 0 THEN
    RETURN json_build_object('success', true, 'sent', 0, 'message', 'Aucun token disponible');
  END IF;
  
  -- Appeler l'Edge Function avec tous les tokens (elle gère le batching)
  SELECT net.http_post(
    url := v_edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key,
      'apikey', v_anon_key
    ),
    body := jsonb_build_object(
      'title', p_title,
      'body', p_body,
      'tokens', v_tokens
    )
  ) INTO v_response_id;
  
  RETURN json_build_object(
    'success', true, 
    'sent', v_count,
    'request_id', v_response_id
  );
END;
$$;
