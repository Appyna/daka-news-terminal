-- ════════════════════════════════════════════════════════════════════════════
-- FONCTION RPC : Vérifier si un email existe dans auth.users
-- ════════════════════════════════════════════════════════════════════════════
--
-- PROBLÈME :
-- Supabase en mode OTP ne bloque pas les doublons lors de signUp (par sécurité).
-- Il envoie un code OTP même si l'email existe déjà.
-- L'app mobile doit vérifier AVANT d'appeler signUp.
--
-- SOLUTION :
-- Fonction RPC qui vérifie dans auth.users si l'email existe.
--
-- UTILISATION DANS L'APP :
-- const { data: emailExists } = await supabase.rpc('check_email_exists', { check_email: 'test@example.com' });
-- if (emailExists) throw new Error('Email déjà utilisé');
--
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_email_exists(check_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER -- Permet d'accéder à auth.users (table protégée)
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Retourner TRUE si l'email existe, FALSE sinon
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = check_email
  );
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VÉRIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Tester avec un email qui existe (remplacer par un vrai email de test)
-- SELECT public.check_email_exists('test@example.com');
-- Résultat : true si existe, false sinon

-- Vérifier que la fonction a bien été créée
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'check_email_exists';
-- Résultat attendu :
-- proname               | prosecdef
-- ---------------------|----------
-- check_email_exists   | t         (t = SECURITY DEFINER activé)

-- ════════════════════════════════════════════════════════════════════════════
-- FIN
-- ════════════════════════════════════════════════════════════════════════════
