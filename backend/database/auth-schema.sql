-- ═══════════════════════════════════════════════════════════════════════
-- DAKA NEWS TERMINAL - Authentication & User Management Schema
-- ═══════════════════════════════════════════════════════════════════════
-- À exécuter dans Supabase SQL Editor après création du projet

-- ═══ 1. EXTENSION UUID (si pas déjà activée) ═══
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══ 2. TABLE PROFILES (infos supplémentaires users) ═══
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL, -- copie de auth.users.email pour facilité requêtes
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_until TIMESTAMP WITH TIME ZONE, -- date expiration premium
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]+$')
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_premium_idx ON public.profiles(is_premium);

-- ═══ 3. TABLE SUBSCRIPTIONS (historique paiements multi-plateformes) ═══
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT DEFAULT 'stripe', -- 'stripe', 'apple', 'google'
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Apple In-App Purchase
  apple_transaction_id TEXT,
  apple_original_transaction_id TEXT,
  
  -- Google Play Billing
  google_purchase_token TEXT,
  google_order_id TEXT,
  
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour lookup
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_platform_idx ON public.subscriptions(platform);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_sub_idx ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS subscriptions_apple_tx_idx ON public.subscriptions(apple_transaction_id);
CREATE INDEX IF NOT EXISTS subscriptions_google_token_idx ON public.subscriptions(google_purchase_token);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON public.subscriptions(status);

-- ═══ 4. TABLE USER_PREFERENCES (préférences sources/pays) ═══
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_countries TEXT[] DEFAULT '{}', -- ['israel', 'france', 'monde']
  favorite_sources TEXT[] DEFAULT '{}', -- IDs des sources favorites
  theme TEXT DEFAULT 'light', -- light, dark, auto
  language TEXT DEFAULT 'fr', -- fr, en, he
  notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un seul profil de préférences par user
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);

-- ═══ 5. TABLE USER_BOOKMARKS (articles sauvegardés) ═══
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Empêcher doublons
  UNIQUE(user_id, article_id)
);

CREATE INDEX IF NOT EXISTS user_bookmarks_user_id_idx ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS user_bookmarks_article_id_idx ON public.user_bookmarks(article_id);

-- ═══ 6. FUNCTION: Créer profil automatiquement à l'inscription ═══
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans profiles
  INSERT INTO public.profiles (id, username, email, is_premium)
  VALUES (
    NEW.id,
    -- Username temporaire = email avant @
    split_part(NEW.email, '@', 1),
    NEW.email,
    FALSE
  );
  
  -- Insérer préférences par défaut
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══ 7. TRIGGER: Créer profil après signup ═══
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══ 8. FUNCTION: Mettre à jour timestamp updated_at ═══
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger updated_at pour profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger updated_at pour subscriptions
DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Trigger updated_at pour user_preferences
DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ═══ 9. ROW LEVEL SECURITY (RLS) POLICIES ═══

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- PROFILES: Lecture publique, modification own only
DROP POLICY IF EXISTS "Profiles lisibles par tous" ON public.profiles;
CREATE POLICY "Profiles lisibles par tous"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users peuvent modifier leur profil" ON public.profiles;
CREATE POLICY "Users peuvent modifier leur profil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- SUBSCRIPTIONS: Own only
DROP POLICY IF EXISTS "Users voient leurs subscriptions" ON public.subscriptions;
CREATE POLICY "Users voient leurs subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role gère subscriptions" ON public.subscriptions;
CREATE POLICY "Service role gère subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- USER_PREFERENCES: Own only
DROP POLICY IF EXISTS "Users voient leurs préférences" ON public.user_preferences;
CREATE POLICY "Users voient leurs préférences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users modifient leurs préférences" ON public.user_preferences;
CREATE POLICY "Users modifient leurs préférences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- USER_BOOKMARKS: Own only
DROP POLICY IF EXISTS "Users voient leurs bookmarks" ON public.user_bookmarks;
CREATE POLICY "Users voient leurs bookmarks"
  ON public.user_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users créent leurs bookmarks" ON public.user_bookmarks;
CREATE POLICY "Users créent leurs bookmarks"
  ON public.user_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users suppriment leurs bookmarks" ON public.user_bookmarks;
CREATE POLICY "Users suppriment leurs bookmarks"
  ON public.user_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- ═══ 10. FUNCTION: Vérifier statut premium ═══
CREATE OR REPLACE FUNCTION public.is_user_premium(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  premium_status BOOLEAN;
  premium_expiry TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT is_premium, premium_until
  INTO premium_status, premium_expiry
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Premium si flag TRUE ET (pas d'expiration OU expiration future)
  RETURN premium_status AND (premium_expiry IS NULL OR premium_expiry > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══ 11. FUNCTION: Activer premium (appelée par webhook Stripe) ═══
CREATE OR REPLACE FUNCTION public.activate_premium(
  user_id_param UUID,
  months INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    is_premium = TRUE,
    premium_until = NOW() + (months || ' months')::INTERVAL,
    updated_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══ 12. FUNCTION: Désactiver premium (expiration ou annulation) ═══
CREATE OR REPLACE FUNCTION public.deactivate_premium(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    is_premium = FALSE,
    premium_until = NULL,
    updated_at = NOW()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ SCHÉMA D'AUTHENTIFICATION COMPLET
-- ═══════════════════════════════════════════════════════════════════════
-- Configuration Supabase Auth à activer dans Dashboard:
-- 1. Email confirmation: ON (envoi code vérification)
-- 2. Double opt-in: ON
-- 3. Secure email change: ON
-- 4. Email templates: Personnaliser avec branding DAKA News
--
-- Next steps:
-- 1. Exécuter ce fichier dans Supabase SQL Editor
-- 2. Configurer Email templates (Settings > Auth > Email Templates)
-- 3. Ajouter SUPABASE_URL et SUPABASE_ANON_KEY dans frontend .env
-- 4. Créer client Supabase frontend
-- 5. Créer AuthContext React
-- ═══════════════════════════════════════════════════════════════════════
