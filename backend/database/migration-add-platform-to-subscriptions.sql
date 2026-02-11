-- ═══════════════════════════════════════════════════════════════════════
-- MIGRATION : Ajouter colonnes platform et IAP à la table subscriptions
-- ═══════════════════════════════════════════════════════════════════════
-- Date: 11 février 2026
-- Objectif: Distinguer les abonnements Stripe vs Apple vs Google
--           pour rediriger vers la bonne plateforme de gestion

-- Ajouter colonne platform (stripe, apple, google)
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'stripe';

-- Ajouter colonnes pour Apple In-App Purchase
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS apple_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS apple_original_transaction_id TEXT;

-- Ajouter colonnes pour Google Play Billing
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS google_purchase_token TEXT,
ADD COLUMN IF NOT EXISTS google_order_id TEXT;

-- Index pour recherche par plateforme
CREATE INDEX IF NOT EXISTS subscriptions_platform_idx ON public.subscriptions(platform);

-- Index pour recherche transactions Apple
CREATE INDEX IF NOT EXISTS subscriptions_apple_tx_idx ON public.subscriptions(apple_transaction_id);

-- Index pour recherche transactions Google
CREATE INDEX IF NOT EXISTS subscriptions_google_token_idx ON public.subscriptions(google_purchase_token);

-- ═══════════════════════════════════════════════════════════════════════
-- ✅ MIGRATION TERMINÉE
-- ═══════════════════════════════════════════════════════════════════════
-- Exécuter ce fichier dans Supabase SQL Editor
-- Tous les abonnements existants seront marqués 'stripe' par défaut
-- ═══════════════════════════════════════════════════════════════════════
