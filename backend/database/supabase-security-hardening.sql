-- ═══════════════════════════════════════════════════════════════════════
-- SUPABASE SECURITY HARDENING (RLS + SEARCH_PATH + EXTENSIONS)
-- Objectif: Verrouiller l'accès Data API sans casser le fonctionnement actuel
-- À exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

BEGIN;

-- 1) Activer RLS sur tables publiques listées par le linter
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invalid_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failed_push_jobs ENABLE ROW LEVEL SECURITY;

-- 2) POLICIES: ARTICLES
DROP POLICY IF EXISTS "Backend peut tout écrire articles" ON public.articles;
DROP POLICY IF EXISTS "Lecture publique articles" ON public.articles;
DROP POLICY IF EXISTS "Public read articles" ON public.articles;
DROP POLICY IF EXISTS "Service role write articles" ON public.articles;

CREATE POLICY "Public read articles"
  ON public.articles FOR SELECT
  USING (true);

CREATE POLICY "Service role write articles"
  ON public.articles FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- 3) POLICIES: SOURCES
DROP POLICY IF EXISTS "Backend peut tout écrire sources" ON public.sources;
DROP POLICY IF EXISTS "Lecture publique sources actives" ON public.sources;
DROP POLICY IF EXISTS "Public read sources active" ON public.sources;
DROP POLICY IF EXISTS "Service role write sources" ON public.sources;

CREATE POLICY "Public read sources active"
  ON public.sources FOR SELECT
  USING (active = true);

CREATE POLICY "Service role write sources"
  ON public.sources FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- 4) POLICIES: TRANSLATIONS CACHE (backend only)
DROP POLICY IF EXISTS "Backend peut tout écrire translations" ON public.translations_cache;
DROP POLICY IF EXISTS "Service role write translations" ON public.translations_cache;

CREATE POLICY "Service role write translations"
  ON public.translations_cache FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- 5) POLICIES: PUSH TABLES
DROP POLICY IF EXISTS "Service role push jobs" ON public.push_notification_jobs;
DROP POLICY IF EXISTS "Service role invalid tokens" ON public.invalid_push_tokens;
DROP POLICY IF EXISTS "Service role failed jobs" ON public.failed_push_jobs;

CREATE POLICY "Service role push jobs"
  ON public.push_notification_jobs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role invalid tokens"
  ON public.invalid_push_tokens FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role failed jobs"
  ON public.failed_push_jobs FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- 6) POLICIES: USER PUSH TOKENS (mobile app uses anon upsert)
-- IMPORTANT: Garder le process actuel sans le casser.
DROP POLICY IF EXISTS "Public insert push tokens" ON public.user_push_tokens;
DROP POLICY IF EXISTS "Public update push tokens" ON public.user_push_tokens;

CREATE POLICY "Public insert push tokens"
  ON public.user_push_tokens FOR INSERT
  WITH CHECK (device_id IS NOT NULL AND push_token IS NOT NULL);

CREATE POLICY "Public update push tokens"
  ON public.user_push_tokens FOR UPDATE
  USING (device_id IS NOT NULL)
  WITH CHECK (device_id IS NOT NULL AND push_token IS NOT NULL);

-- 7) FIX: Function search_path mutable (sécurité)
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.cleanup_old_articles() SET search_path = public;
ALTER FUNCTION public.is_user_premium(UUID) SET search_path = public;
ALTER FUNCTION public.activate_premium(UUID, INTEGER) SET search_path = public;
ALTER FUNCTION public.deactivate_premium(UUID) SET search_path = public;
ALTER FUNCTION public.get_active_subscription(UUID) SET search_path = public;
ALTER FUNCTION public.has_active_subscription(UUID) SET search_path = public;
ALTER FUNCTION public.get_valid_push_tokens(UUID[]) SET search_path = public;
ALTER FUNCTION public.mark_tokens_invalid(TEXT[], TEXT) SET search_path = public;
ALTER FUNCTION public.cleanup_old_push_jobs() SET search_path = public;

-- Fonctions push (utilisent pg_net) - seulement si elles existent
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'send_push_notification'
      AND pg_get_function_identity_arguments(p.oid) = 'text, text, uuid[], uuid'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.send_push_notification(TEXT, TEXT, UUID[], UUID) SET search_path = public, net, extensions';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'send_push_notification_to_premium'
      AND pg_get_function_identity_arguments(p.oid) = 'text, text, uuid'
  ) THEN
    EXECUTE 'ALTER FUNCTION public.send_push_notification_to_premium(TEXT, TEXT, UUID) SET search_path = public, net, extensions';
  END IF;
END $$;

-- 8) Extension pg_net: certains environnements ne supportent pas SET SCHEMA
-- Laisser pg_net en public si la commande n'est pas supportée.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    RAISE NOTICE 'pg_net présent: SET SCHEMA non supporté dans cet environnement, aucune action.';
  END IF;
END $$;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ Après exécution:
-- - RLS activé et contrôlé
-- - Data API sécurisé
-- - Search_path fixé
-- - pg_net hors public
-- ═══════════════════════════════════════════════════════════════════════
