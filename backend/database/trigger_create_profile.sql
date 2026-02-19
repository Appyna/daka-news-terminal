-- ════════════════════════════════════════════════════════════════════════════
-- TRIGGER AUTOMATIQUE : Création du profil utilisateur après inscription
-- ════════════════════════════════════════════════════════════════════════════
--
-- PROBLÈME RÉSOLU :
-- Avant, le code mobile tentait de créer le profil immédiatement après signUp(),
-- mais si l'email n'était pas confirmé, la création échouait avec erreur RLS.
--
-- SOLUTION :
-- Ce trigger s'exécute automatiquement lors de la confirmation d'email par Supabase.
-- Il crée le profil avec les métadonnées (username) stockées lors du signUp.
--
-- SÉCURITÉ :
-- - Le trigger s'exécute avec les privilèges de sécurité database (SECURITY DEFINER)
-- - Il contourne les RLS policies pour garantir la création du profil
-- - Le username vient de auth.users.raw_user_meta_data (fourni lors du signUp)
--
-- DÉPLOIEMENT :
-- 1. Copier-coller ce SQL dans Supabase Dashboard → SQL Editor
-- 2. Cliquer sur "RUN"
-- 3. Vérifier le trigger existe : Table "auth.users" → Triggers
--
-- ════════════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 1 : Supprimer l'ancien trigger s'il existe (évite les doublons)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 2 : Créer la fonction qui crée le profil automatiquement
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER -- Exécute avec privilèges élevés (contourne RLS)
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insérer le profil UNIQUEMENT si email confirmé (après validation OTP)
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, username, is_premium, premium_until, created_at)
    VALUES (
      NEW.id,                                                   -- ID de l'utilisateur (depuis auth.users)
      NEW.email,                                                -- Email confirmé
      COALESCE(NEW.raw_user_meta_data->>'username', 'User'),   -- Username depuis metadata (défaut: 'User')
      false,                                                    -- Pas premium par défaut
      NULL,                                                     -- Pas de date d'expiration premium
      NOW()                                                     -- Date de création
    )
    ON CONFLICT (id) DO NOTHING;  -- Éviter les doublons si profil déjà créé
  END IF;
  
  -- Retourner NEW (obligatoire pour les triggers)
  RETURN NEW;
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 3 : Créer le trigger qui appelle la fonction automatiquement
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users  -- Déclenché après INSERT ou UPDATE (confirmation OTP)
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VÉRIFICATION : Tester que le trigger fonctionne
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Vérifier que le trigger existe
SELECT 
  tgname AS trigger_name,
  tgenabled AS enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Vérifier que la fonction existe
SELECT 
  proname AS function_name,
  prosecdef AS security_definer
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ✅ RÉSULTAT ATTENDU :
-- trigger_name         | enabled
-- --------------------|--------
-- on_auth_user_created | O       (O = enabled)
--
-- function_name      | security_definer
-- -------------------|------------------
-- handle_new_user    | t                (t = true)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COMMENT ÇA MARCHE MAINTENANT :
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1. L'utilisateur s'inscrit dans l'app avec email + password + username
-- 2. Supabase envoie un email de confirmation
-- 3. L'utilisateur clique sur le lien dans l'email
-- 4. Supabase confirme l'email et INSERT l'utilisateur dans auth.users
-- 5. ✨ LE TRIGGER on_auth_user_created s'exécute automatiquement
-- 6. ✅ Le profil est créé dans public.profiles avec le bon username
-- 7. L'utilisateur peut maintenant se connecter normalement

-- ════════════════════════════════════════════════════════════════════════════
-- FIN DU SCRIPT
-- ════════════════════════════════════════════════════════════════════════════
