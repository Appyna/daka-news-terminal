-- Fonction SQL pour envoyer des notifications push via Supabase Edge Function
-- Usage: SELECT send_push_notification('Breaking News!', 'Un événement important', ARRAY['user-id-1', 'user-id-2']);
-- Ou envoyer à tous les users premium: SELECT send_push_notification_to_premium('Nouvelle source ajoutée', 'USA Today disponible');

CREATE OR REPLACE FUNCTION send_push_notification(
  p_title TEXT,
  p_body TEXT,
  p_user_ids UUID[] DEFAULT NULL,
  p_article_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_response JSON;
  v_edge_function_url TEXT;
BEGIN
  -- URL de l'edge function (remplacer PROJECT_REF par ton vrai project ref)
  v_edge_function_url := current_setting('app.supabase_url') || '/functions/v1/send-push-notification';
  
  -- Appeler l'edge function via http request (nécessite extension pg_net)
  SELECT 
    net.http_post(
      url := v_edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_service_key')
      ),
      body := jsonb_build_object(
        'title', p_title,
        'body', p_body,
        'userIds', p_user_ids,
        'articleId', p_article_id,
        'sendToAll', CASE WHEN p_user_ids IS NULL THEN true ELSE false END
      )
    ) INTO v_response;

  RETURN v_response;
END;
$$;

-- Fonction pour envoyer uniquement aux users premium
CREATE OR REPLACE FUNCTION send_push_notification_to_premium(
  p_title TEXT,
  p_body TEXT,
  p_article_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_premium_user_ids UUID[];
BEGIN
  -- Récupérer les IDs des users premium
  SELECT ARRAY_AGG(user_id)
  INTO v_premium_user_ids
  FROM user_profiles
  WHERE subscription_tier = 'PREMIUM';

  -- Appeler la fonction principale
  RETURN send_push_notification(p_title, p_body, v_premium_user_ids, p_article_id);
END;
$$;

-- Fonction trigger : envoyer notif automatiquement quand un article est marqué "breaking"
CREATE OR REPLACE FUNCTION notify_on_breaking_news()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si l'article est marqué comme breaking (tu peux ajouter une colonne is_breaking)
  IF NEW.is_breaking = true THEN
    PERFORM send_push_notification_to_premium(
      '🚨 Breaking News',
      NEW.title,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger (à activer sur la table articles si tu veux l'auto-notif)
-- DROP TRIGGER IF EXISTS trigger_breaking_news ON articles;
-- CREATE TRIGGER trigger_breaking_news
--   AFTER INSERT OR UPDATE ON articles
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_on_breaking_news();

-- Commentaires
COMMENT ON FUNCTION send_push_notification IS 'Envoie une notification push aux users spécifiés via Expo Push API';
COMMENT ON FUNCTION send_push_notification_to_premium IS 'Envoie une notification push à tous les users premium';
COMMENT ON FUNCTION notify_on_breaking_news IS 'Fonction trigger pour envoyer automatiquement une notif sur breaking news';

-- EXEMPLES D'USAGE :

-- 1. Envoyer à un user spécifique
-- SELECT send_push_notification('Test', 'Hello!', ARRAY['user-uuid-here']::UUID[]);

-- 2. Envoyer à tous les users premium
-- SELECT send_push_notification_to_premium('Nouvelle source', 'BBC disponible');

-- 3. Envoyer à tous les users (premium + free)
-- SELECT send_push_notification('Maintenance', 'App en maintenance dans 10min', NULL);

-- 4. Test rapide (remplacer par un vrai user ID)
-- SELECT send_push_notification('🔔 Test', 'Si tu vois ça, ça marche!', ARRAY['ton-user-id']::UUID[]);
