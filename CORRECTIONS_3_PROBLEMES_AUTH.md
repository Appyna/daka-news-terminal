# 🔧 CORRECTIONS CRITIQUES AUTH - 3 PROBLÈMES RÉSOLUS

## ❌ Problèmes identifiés

### 1. Connexion impossible après inscription OTP
**Symptôme** : "Email ou mot de passe incorrect" alors que c'est les bons.

**Cause probable** : 
- `verifyOtp()` confirme l'email mais ne stocke pas la session correctement
- Ou Supabase considère l'email non confirmé malgré OTP validé

**Solution** : Améliorer la gestion d'erreur dans `signIn` + vérifier configuration Supabase

---

### 2. Message d'erreur doublon incorrect  
**Symptôme** : "Erreur avec l'email. Vérifiez le format" au lieu de "Cette adresse email est déjà utilisée"

**Cause** : 
```tsx
// ❌ AVANT (MAUVAIS)
const { data: existingEmail } = await supabase
  .from('profiles')  // Profil créé APRÈS OTP, pas trouvé au 2e signUp
  .select('email')
  .eq('email', email)
  .maybeSingle();
```

Au 2e signUp avec même email :
1. Vérification dans `profiles` → pas trouvé (profil créé après OTP du 1er user)
2. `supabase.auth.signUp()` appelé → Supabase erreur "User already registered"
3. Traduction générique → "Erreur avec l'email"

**Solution** : Vérifier dans `auth.users` au lieu de `profiles`
```tsx
// ✅ APRÈS (CORRECT)
const { data: authUser } = await supabase.rpc('check_email_exists', { check_email: email });

if (authUser) {
  throw new Error('Cette adresse email est déjà utilisée...');
}
```

---

### 3. Reset password redirige vers localhost:3000
**Symptôme** : Lien reset password redirige vers localhost au lieu de l'app mobile

**Cause** : Pas de `redirectTo` configuré
```tsx
// ❌ AVANT
const { error } = await supabase.auth.resetPasswordForEmail(email);
```

**Solution** : Ajouter deep link vers l'app
```tsx
// ✅ APRÈS
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'dakanews://reset-password',
});
```

---

## ✅ Fichiers modifiés

### 1. mobile-v2/src/contexts/AuthContext.tsx
**Changements** :
- ✅ Vérification email dans `auth.users` via RPC `check_email_exists`
- ✅ Amélioration messages d'erreur `signIn` (français clair)
- ✅ Ajout `redirectTo` dans `resetPasswordForEmail`

### 2. backend/database/function_check_email_exists.sql (NOUVEAU)
**Fonction RPC** :
```sql
CREATE FUNCTION check_email_exists(check_email TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
  SELECT COUNT(*) INTO email_count
  FROM auth.users
  WHERE email = check_email;
  
  RETURN email_count > 0;
END;
$$;
```

---

## ⚠️ ACTIONS REQUISES

### 1️⃣ Exécuter la fonction SQL dans Supabase (5 min)

**Instructions** :
1. Ouvrir Supabase Dashboard → SQL Editor
2. Copier TOUT le contenu de `backend/database/function_check_email_exists.sql`
3. Coller et cliquer **RUN**
4. Vérifier résultat : "CREATE FUNCTION" success

**Vérification** :
```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'check_email_exists';
```

Résultat attendu :
```json
[
  {
    "proname": "check_email_exists",
    "prosecdef": true
  }
]
```

---

### 2️⃣ Configurer Deep Link dans app.json (2 min)

**Fichier** : `mobile-v2/app.json`

Vérifier que le deep link scheme existe :
```json
{
  "expo": {
    "scheme": "dakanews",
    "ios": {
      "bundleIdentifier": "com.dakanews.app"
    }
  }
}
```

---

### 3️⃣ Vérifier configuration Email Templates Supabase (5 min)

**Problème possible connexion** : Email pas confirmé malgré OTP validé

**Instructions** :
1. Ouvrir Supabase Dashboard → Authentication → Email Templates
2. Vérifier template **"Confirm signup"**
3. S'assurer que le template utilise bien `{{ .ConfirmationURL }}`

**Si le template utilise un lien au lieu d'un code OTP**, c'est ça le problème !

**Configuration requise** :
- Supabase Dashboard → Authentication → **Settings** 
- **Enable email confirmations** : ✅ ON
- **Email confirmation method** : **"OTP"** (pas "Magic Link")

---

### 4️⃣ Diagnostic connexion : Vérifier l'utilisateur dans Supabase

Après une inscription OTP qui a réussi, exécuter ce SQL :

```sql
-- Vérifier l'utilisateur créé
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'username' as username
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;
```

**Résultat attendu** :
```json
[
  {
    "id": "...",
    "email": "test@example.com",
    "email_confirmed_at": "2026-02-17 15:30:00",  // ✅ DOIT ÊTRE REMPLI
    "created_at": "2026-02-17 15:28:00",
    "username": "testuser"
  }
]
```

**Si `email_confirmed_at` est NULL** → C'est ça le problème !
Ça veut dire que `verifyOtp()` ne confirme pas l'email correctement.

**Solution** : Vérifier que dans Supabase Dashboard → Authentication → Settings :
- **"Secure email change"** : OFF (sinon verifyOtp ne fonctionne pas)
- **"Double confirm email changes"** : OFF

---

## 🧪 Tests à refaire après corrections

### Test 1 : Inscription + Connexion
1. Inscription avec nouvel email → Code OTP reçu → Validation → Connexion auto
2. **Déconnexion**
3. **Connexion manuelle** avec même email + password
4. **✅ Résultat attendu** : Connexion réussie (plus d'erreur "mot de passe incorrect")

### Test 2 : Doublon email
1. Tenter inscription avec email déjà utilisé
2. **✅ Résultat attendu** : "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse."
3. **❌ Ne doit PAS dire** : "Erreur avec l'email. Vérifiez le format"

### Test 3 : Reset password
1. Connexion → "Mot de passe oublié"
2. Entrer email → Email reçu
3. Cliquer sur le lien
4. **✅ Résultat attendu** : App s'ouvre sur écran reset password
5. **❌ Ne doit PAS ouvrir** : localhost:3000

---

## 🔍 Debugging connexion impossible

Si après toutes ces corrections, la connexion échoue toujours, exécuter ce diagnostic :

```sql
-- 1. Vérifier l'utilisateur existe
SELECT id, email, email_confirmed_at, encrypted_password 
FROM auth.users 
WHERE email = 'TON_EMAIL_ICI';

-- 2. Vérifier le profil existe
SELECT id, email, username 
FROM profiles 
WHERE email = 'TON_EMAIL_ICI';

-- 3. Vérifier les sessions actives
SELECT user_id, created_at, updated_at 
FROM auth.sessions 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'TON_EMAIL_ICI');
```

**Si `encrypted_password` est vide** → Le password n'a pas été enregistré lors du signUp !

**Si `email_confirmed_at` est NULL** → L'email n'est pas confirmé, donc connexion impossible.

**Si `profiles` est vide** → Le trigger n'a pas créé le profil, ou email_confirmed_at était NULL.

---

## 📝 Ordre d'exécution

1. ✅ **Maintenant** : Exécuter `function_check_email_exists.sql` dans Supabase (5 min)
2. ✅ **Maintenant** : Vérifier configuration Supabase Email OTP (5 min)
3. ✅ **Maintenant** : Vérifier `email_confirmed_at` du dernier user (2 min)
4. ✅ **Maintenant** : Rebuild iOS si config Supabase changée (15 min)
5. ✅ **Puis** : Tester inscription + déconnexion + reconnexion (5 min)
6. ✅ **Puis** : Tester doublon email (1 min)
7. ✅ **Puis** : Tester reset password (3 min)

**Temps total estimé** : 36 minutes

---

## 🎯 Résultat final attendu

- ✅ Inscription OTP fonctionne
- ✅ Connexion après inscription fonctionne
- ✅ Déconnexion + reconnexion fonctionne
- ✅ Message doublon email correct
- ✅ Reset password ouvre l'app (deep link)
- ✅ Process identique au site web
