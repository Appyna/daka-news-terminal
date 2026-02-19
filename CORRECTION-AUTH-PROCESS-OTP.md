# 🔥 CORRECTION COMPLÈTE AUTH APP iOS - PROCESS IDENTIQUE AU SITE WEB

**Date** : 17 février 2026  
**URGENT** : Refaire TOUT le système d'auth de l'app mobile pour correspondre EXACTEMENT au site web

---

## ❌ ERREUR GRAVE IDENTIFIÉE

**Site web dakanews.com** :
1. Inscription → **CODE OTP à 6 chiffres** envoyé par email
2. Utilisateur entre le **code dans un champ** dédié
3. Validation → Connexion automatique

**App mobile (MAUVAIS)** :
1. Inscription → **Lien de confirmation** email (magic link)
2. Utilisateur clique sur le lien
3. Aucun champ OTP

**RÉSULTAT** : **PROCESSUS COMPLÈTEMENT DIFFÉRENT** ❌

---

## ✅ CE QUI DOIT ÊTRE FAIT

### FICHIERS À MODIFIER

**1. mobile-v2/src/types.ts**
- Ajouter `verifyOtp` et `resendOtp` dans `AuthContextType`

**2. mobile-v2/src/contexts/AuthContext.tsx**
- Ajouter fonction `verifyOtp(email, token)`
- Ajouter fonction `resendOtp(email)`
- Modifier `signUp()` pour ne PAS créer profil immédiatement
- Le profil sera créé APRÈS vérification OTP (comme le site)

**3. mobile-v2/src/components/AuthModal.tsx**
- Ajouter état `showOtpInput`
- Ajouter état `pendingEmail`
- Ajouter état `otpCode`
- Après inscription → afficher champ OTP (6 chiffres)
- Copier EXACTEMENT les phrases du site web

---

## 📋 PHRASES EXACTES DU SITE WEB À COPIER

### Inscription réussie :
```
"Un code de vérification a été envoyé à votre adresse email."
```

### Écran OTP :
```
"Un code à 6 chiffres a été envoyé à [email]"
Label : "Code de vérification"
Placeholder : "000000"
Bouton : "Vérifier le code"
Lien : "Renvoyer le code"
```

### OTP validé :
```
"Votre adresse email a été vérifiée avec succès. Connexion en cours..."
```

### Erreurs :
```
- Code invalide : "Le code de vérification est expiré ou invalide. Veuillez demander un nouveau code."
- Code incomplet : "Le code doit contenir 6 chiffres"
- Erreur renvoi : "Erreur lors du renvoi du code de vérification. Veuillez réessayer."
```

---

## 🔧 CONFIGURATION SUPABASE

**Important** : Vérifier dans Supabase Dashboard → Authentication → Settings :

1. **Email Confirmation** : ENABLED ✅
2. **Email OTP** : ENABLED ✅
3. **OTP Expiry** : 3600 secondes (1h)
4. **OTP Length** : 6 digits

---

## ⚠️ TRIGGER SQL

Le trigger `on_auth_user_created` doit être modifié :

**AVANT (MAUVAIS)** :
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users  -- Se déclenche IMMÉDIATEMENT
```

**APRÈS (BON)** :
```sql
-- Le trigger doit se déclencher après confirmation OTP
-- Vérifier que NEW.email_confirmed_at IS NOT NULL
```

**Nouveau SQL** :
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insérer le profil UNIQUEMENT si email confirmé
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
    ON CONFLICT (id) DO NOTHING;  -- Éviter les doublons
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 🎯 FLOW COMPLET CORRECT

### INSCRIPTION

**Étape 1 : Utilisateur remplit formulaire**
- Username (min 3 car)
- Email
- Password (min 6 car)
- Clic "Créer mon compte"

**Étape 2 : signUp() appelé**
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: undefined,  // Pas de redirect = OTP mode
    data: { username }
  }
});
```

**Étape 3 : Supabase envoie email OTP**
- Email avec code à 6 chiffres
- **PAS de lien cliquable**
- Titre : "Confirmez votre email"

**Étape 4 : App affiche champ OTP**
```tsx
setSuccess('Un code de vérification a été envoyé à votre adresse email.');
setShowOtpInput(true);
setPendingEmail(email);
```

**Étape 5 : Utilisateur entre code**
- Champ : 6 chiffres
- Style : mono, text-center, tracking-widest
- Placeholder : "000000"

**Étape 6 : verifyOtp() appelé**
```typescript
const { data, error } = await supabase.auth.verifyOtp({
  email: pendingEmail,
  token: otpCode,
  type: 'signup'
});
```

**Étape 7 : Si valide**
- Supabase confirme email (`email_confirmed_at` rempli)
- Trigger SQL crée profil automatiquement
- App affiche : "Votre adresse email a été vérifiée avec succès. Connexion en cours..."
- Connexion automatique (session active)
- Fermeture modal après 1 seconde

---

### CONNEXION

**Étape 1 : Utilisateur remplit formulaire**
- Email
- Password
- Clic "Se connecter"

**Étape 2 : signIn() appelé**
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**Étape 3 : Si valide**
- Session créée
- Profil chargé depuis `public.profiles`
- Message : "Connexion réussie."
- Fermeture modal après 1 seconde

**Étape 4 : Si email non confirmé**
- Erreur : "Email not confirmed"
- Message traduit : "Veuillez confirmer votre email avant de vous connecter"
- Bouton "Renvoyer le code de vérification"

---

### MOT DE PASSE OUBLIÉ

**Sur site web** :
- Magic link (lien email)
- Redirection vers site avec token

**Sur app mobile** :
- **Même système que site web**
- Magic link avec deep link vers app
- URL de redirection : `exp://` (Expo) ou custom scheme

---

## 📊 COMPARAISON FINALE

| Fonctionnalité | Site Web | App Mobile (AVANT) | App Mobile (APRÈS) |
|----------------|----------|-------------------|-------------------|
| **Inscription** | OTP 6 chiffres | Magic link | OTP 6 chiffres ✅ |
| **Validation** | Champ OTP | Clic lien email | Champ OTP ✅ |
| **Profil créé** | Après OTP validé | Jamais | Après OTP validé ✅ |
| **Message** | "Code envoyé" | "Lien envoyé" | "Code envoyé" ✅ |
| **Connexion** | Automatique après OTP | Manuelle | Automatique après OTP ✅ |
| **Doublon email** | Vérifié | Vérifié | Vérifié ✅ |
| **Doublon username** | Vérifié | Vérifié | Vérifié ✅ |
| **Phrases** | Exactes | Différentes | Exactes ✅ |

---

## ✅ CHECKLIST DE CORRECTION

- [ ] **Lire et comprendre le processus exact du site web**
- [ ] **Modifier AuthContextType** (types.ts)
- [ ] **Ajouter verifyOtp() dans AuthContext.tsx**
- [ ] **Ajouter resendOtp() dans AuthContext.tsx**
- [ ] **Modifier signUp() pour OTP mode**
- [ ] **Ajouter états OTP dans AuthModal.tsx**
- [ ] **Créer UI champ OTP (6 chiffres, mono)**
- [ ] **Copier phrases exactes du site web**
- [ ] **Corriger trigger SQL (check email_confirmed_at)**
- [ ] **Tester inscription complète**
- [ ] **Tester renvoi code OTP**
- [ ] **Tester erreur code invalide**
- [ ] **Tester connexion après inscription**
- [ ] **Rebuild app iOS**
- [ ] **Valider process identique au site**

---

## 🚀 ORDRE D'EXÉCUTION

1. **Corriger trigger SQL dans Supabase** (5 min)
2. **Modifier types.ts** (2 min)
3. **Modifier AuthContext.tsx** (10 min)
4. **Modifier AuthModal.tsx** (20 min)
5. **Test en local avec Expo Go** (10 min)
6. **Build preview** (15 min)
7. **Test complet sur iPhone** (10 min)

**TOTAL** : 1h12

---

**CETTE FOIS C'EST LA BONNE ! Process 100% identique au site web.**

**Dernière mise à jour** : 17 février 2026
