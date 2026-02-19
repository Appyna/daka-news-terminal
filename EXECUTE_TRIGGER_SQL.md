# ⚠️ ACTION CRITIQUE REQUISE : Exécuter le Trigger SQL dans Supabase

## 🔴 Étape OBLIGATOIRE avant de tester l'app

Le trigger SQL a été modifié dans le fichier local, mais **DOIT ÊTRE EXÉCUTÉ DANS SUPABASE** pour fonctionner.

---

## 📋 Instructions (5 minutes)

### 1. Ouvrir Supabase Dashboard
- Aller sur https://supabase.com/dashboard
- Sélectionner le projet **DAKA News**

### 2. Ouvrir SQL Editor
- Dans le menu de gauche, cliquer sur **SQL Editor**
- Cliquer sur **New Query**

### 3. Copier-Coller le Trigger SQL
Copier **TOUT LE CONTENU** du fichier suivant :
```
backend/database/trigger_create_profile.sql
```

### 4. Exécuter le SQL
- Coller le contenu dans le SQL Editor
- Cliquer sur **RUN** (ou Cmd/Ctrl + Enter)

### 5. Vérifier le résultat
Vous devriez voir :
- ✅ **Success** : "DROP TRIGGER", "DROP FUNCTION", "CREATE FUNCTION", "CREATE TRIGGER"
- ⚠️ Si erreur : copier l'erreur et la partager

---

## 🎯 Ce que fait ce trigger

**AVANT (❌ INCORRECT)** :
- Créait le profil **immédiatement** après inscription
- Même **SANS** validation du code OTP
- Utilisateur avait profil sans avoir confirmé son email

**APRÈS (✅ CORRECT)** :
- Crée le profil **UNIQUEMENT** après validation du code OTP
- Condition : `IF NEW.email_confirmed_at IS NOT NULL`
- Process identique au site web

---

## 🔍 Contenu du fichier trigger_create_profile.sql

Voici ce que vous devez exécuter :

\`\`\`sql
-- Supprimer trigger et function existants
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Créer la function avec condition email_confirmed_at
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- ✅ Créer profil UNIQUEMENT si email confirmé via OTP
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (id, email, username, is_premium, premium_until, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'username', 'User'),
      false,
      NULL,
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;  -- Éviter doublons
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger (AFTER INSERT OR UPDATE)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users  -- Déclenché après INSERT ou UPDATE (confirmation OTP)
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
\`\`\`

---

## ✅ Après exécution

Une fois le trigger exécuté avec succès dans Supabase, tu peux tester l'inscription OTP :

1. Lancer l'app : `cd mobile-v2 && npx expo start`
2. Ouvrir sur iPhone avec Expo Go
3. Tenter une inscription avec nouvel email
4. **Résultat attendu** : Message "Un code de vérification a été envoyé à votre adresse email."
5. Vérifier email → Code à 6 chiffres reçu
6. Entrer le code dans le champ OTP
7. **Résultat attendu** : "Votre adresse email a été vérifiée avec succès. Connexion en cours..."
8. Profil créé dans Supabase **UNIQUEMENT** après validation OTP ✅

---

## 🚨 Important

**NE PAS PASSER À LA SUITE** sans exécuter ce trigger dans Supabase !

Le code de l'app est corrigé, mais le trigger Database doit être mis à jour pour que tout fonctionne.
