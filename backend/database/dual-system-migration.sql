-- Migration pour le Dual System (Stripe + Apple + Google)
-- Ajoute les colonnes nécessaires pour gérer les 3 plateformes de paiement

-- 1. Ajouter la colonne platform pour identifier la source du paiement
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS platform TEXT CHECK (platform IN ('stripe', 'apple', 'google'));

-- 2. Ajouter les colonnes spécifiques à Apple
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS apple_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS apple_original_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS apple_product_id TEXT;

-- 3. Ajouter les colonnes spécifiques à Google
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS google_purchase_token TEXT,
ADD COLUMN IF NOT EXISTS google_order_id TEXT,
ADD COLUMN IF NOT EXISTS google_product_id TEXT;

-- 4. Créer un index composite pour les recherches par plateforme
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_platform 
ON public.subscriptions(user_id, platform);

-- 5. Créer un index pour les recherches par transaction Apple
CREATE INDEX IF NOT EXISTS idx_subscriptions_apple_transaction 
ON public.subscriptions(apple_original_transaction_id);

-- 6. Créer un index pour les recherches par token Google
CREATE INDEX IF NOT EXISTS idx_subscriptions_google_token 
ON public.subscriptions(google_purchase_token);

-- 7. Mettre à jour les abonnements Stripe existants
UPDATE public.subscriptions 
SET platform = 'stripe' 
WHERE platform IS NULL AND stripe_customer_id IS NOT NULL;

-- 8. Fonction helper pour obtenir l'abonnement actif d'un user (toutes plateformes)
CREATE OR REPLACE FUNCTION public.get_active_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  platform TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    subscriptions.platform,
    subscriptions.status,
    subscriptions.current_period_end
  FROM public.subscriptions
  WHERE user_id = p_user_id
    AND status = 'active'
    AND current_period_end > NOW()
  ORDER BY current_period_end DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Fonction pour vérifier si un user a un abonnement actif sur n'importe quelle plateforme
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_subscription BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM public.subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND current_period_end > NOW()
  ) INTO v_has_subscription;
  
  RETURN v_has_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.subscriptions IS 'Stocke les abonnements de toutes les plateformes (Stripe, Apple, Google)';
COMMENT ON COLUMN public.subscriptions.platform IS 'Plateforme de paiement: stripe, apple, ou google';
COMMENT ON COLUMN public.subscriptions.apple_transaction_id IS 'ID de transaction Apple (peut changer à chaque renouvellement)';
COMMENT ON COLUMN public.subscriptions.apple_original_transaction_id IS 'ID original de la transaction Apple (unique et permanent)';
COMMENT ON COLUMN public.subscriptions.google_purchase_token IS 'Token d''achat Google Play (unique par abonnement)';
