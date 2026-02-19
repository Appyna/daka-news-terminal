# ✅ CORRECTIONS AUTH OTP TERMINÉES

## 📋 Résumé des modifications

### 🎯 Objectif
Reproduire **EXACTEMENT** le processus d'inscription du site web dakanews.com dans l'app mobile :
- ❌ **AVANT** : Magic link (clic sur lien email)
- ✅ **APRÈS** : Code OTP à 6 chiffres (identique au site web)

---

## ✅ Fichiers modifiés (4/4 complétés)

### 1. ✅ backend/database/trigger_create_profile.sql
**Modifications** :
- Ajout condition `IF NEW.email_confirmed_at IS NOT NULL`
- Ajout `ON CONFLICT (id) DO NOTHING` (éviter doublons)
- Changement trigger `AFTER INSERT` → `AFTER INSERT OR UPDATE`

**Résultat** :
- Profil créé **UNIQUEMENT** après validation OTP
- Process identique au site web

⚠️ **ACTION REQUISE** : Exécuter ce SQL dans Supabase Dashboard (voir EXECUTE_TRIGGER_SQL.md)

---

### 2. ✅ mobile-v2/src/types.ts
**Modifications** :
```tsx
export interface AuthContextType {
  // ... existing ...
  verifyOtp: (email: string, token: string) => Promise<{ error: any | null }>;
  resendOtp: (email: string) => Promise<{ error: any | null }>;
  signUp: (email, password, username) => Promise<{ user: any | null; session: any | null }>; // Return type modifié
}
```

**Résultat** :
- Types TypeScript corrects pour OTP
- Interface complète identique au site web

---

### 3. ✅ mobile-v2/src/contexts/AuthContext.tsx
**Modifications** :
```tsx
// ✅ COPIE EXACTE DU SITE WEB : verifyOtp
const verifyOtp = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (error) return { error };

  // Charger le profil après vérification OTP
  if (data.user) {
    await loadProfile(data.user.id);
  }

  return { error: null };
};

// ✅ COPIE EXACTE DU SITE WEB : resendOtp
const resendOtp = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  return { error };
};

// Export dans Provider
return (
  <AuthContext.Provider value={{
    // ... existing ...
    verifyOtp,
    resendOtp,
  }}>
    {children}
  </AuthContext.Provider>
);
```

**Résultat** :
- Fonctions OTP identiques au site web
- Chargement profil après validation OTP

---

### 4. ✅ mobile-v2/src/components/AuthModal.tsx
**Modifications majeures** :

#### États OTP ajoutés :
```tsx
const [showOtpInput, setShowOtpInput] = useState(false);
const [otpCode, setOtpCode] = useState('');
const [pendingEmail, setPendingEmail] = useState('');
```

#### Inscription modifiée :
```tsx
// ❌ AVANT (INCORRECT)
if (result?.user && !result?.session) {
  setSuccessMessage('Compte créé ! Un email de confirmation vous a été envoyé. Cliquez sur le lien...');
  setTimeout(() => setActiveTab('login'), 5000);
}

// ✅ APRÈS (CORRECT - identique site web)
if (result?.user) {
  setSuccessMessage('Un code de vérification a été envoyé à votre adresse email.');
  setPendingEmail(email);
  setShowOtpInput(true);
}
```

#### Fonctions OTP ajoutées :
```tsx
// ✅ handleVerifyOtp (copie exacte site web)
const handleVerifyOtp = async () => {
  if (otpCode.length !== 6) {
    setError('Le code doit contenir 6 chiffres');
    return;
  }

  const { error: verifyError } = await verifyOtp(pendingEmail, otpCode);
  
  if (verifyError) {
    if (verifyError.message === 'Token has expired or is invalid') {
      setError('Le code de vérification est expiré ou invalide. Veuillez demander un nouveau code.');
    } else {
      setError(translateError(verifyError.message));
    }
  } else {
    setSuccessMessage('Votre adresse email a été vérifiée avec succès. Connexion en cours...');
    setTimeout(() => onClose(), 1000);
  }
};

// ✅ handleResendOtp (copie exacte site web)
const handleResendOtp = async () => {
  const { error: resendError } = await resendOtp(pendingEmail);
  
  if (resendError) {
    setError('Erreur lors du renvoi du code de vérification. Veuillez réessayer.');
  } else {
    setSuccessMessage('Un nouveau code de vérification a été envoyé à votre adresse email.');
  }
};
```

#### UI OTP ajoutée :
```tsx
{showOtpInput ? (
  <>
    <Text style={styles.otpDescription}>
      Un code à 6 chiffres a été envoyé à {pendingEmail}
    </Text>

    <TextInput
      style={styles.otpInput}
      placeholder="000000"
      value={otpCode}
      onChangeText={(text) => setOtpCode(text.replace(/\D/g, '').slice(0, 6))}
      keyboardType="number-pad"
      maxLength={6}
      autoFocus
    />

    <Pressable onPress={handleVerifyOtp}>
      <Text>Vérifier le code</Text>
    </Pressable>

    <Pressable onPress={handleResendOtp}>
      <Text style={styles.resendLink}>Renvoyer le code</Text>
    </Pressable>
  </>
) : (
  // Formulaire inscription/connexion normal
)}
```

#### Styles OTP ajoutés :
```tsx
otpInput: {
  fontSize: 24,
  fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  textAlign: 'center',
  letterSpacing: 8,
  backgroundColor: COLORS.dark3,
  color: '#fff',
  padding: 12,
  borderRadius: 8,
},
otpDescription: {
  fontSize: 12,
  color: 'rgba(255, 255, 255, 0.6)',
  textAlign: 'center',
  marginBottom: 20,
},
resendLink: {
  fontSize: 12,
  color: COLORS.accentYellow1,
  fontWeight: '500',
},
```

**Résultat** :
- UI OTP identique au site web
- Messages EXACTEMENT identiques au site web
- Process OTP complet : inscription → code → validation → connexion

---

## 📊 Comparaison AVANT/APRÈS

| Élément | ❌ AVANT (Incorrect) | ✅ APRÈS (Correct) |
|---------|---------------------|-------------------|
| **Type d'auth** | Magic link | Code OTP 6 chiffres |
| **Email envoyé** | Lien cliquable | Code à 6 chiffres |
| **UI** | Message "cliquez sur le lien" | Champ OTP dédié |
| **Validation** | Automatique au clic | Manuel (user entre code) |
| **Messages** | "Cliquez sur le lien dans l'email..." | "Un code de vérification a été envoyé..." |
| **Profil créé** | Immédiatement après signUp | APRÈS validation OTP uniquement |
| **Fonctions** | signUp uniquement | signUp + verifyOtp + resendOtp |
| **Conformité site web** | ❌ Différent | ✅ Identique |

---

## 🎯 Messages EXACTS (copie du site web)

### Après inscription
```
"Un code de vérification a été envoyé à votre adresse email."
```

### Écran OTP
```
"Un code à 6 chiffres a été envoyé à {email}"
```

### Validation réussie
```
"Votre adresse email a été vérifiée avec succès. Connexion en cours..."
```

### Erreur code invalide
```
"Le code de vérification est expiré ou invalide. Veuillez demander un nouveau code."
```

### Erreur format code
```
"Le code doit contenir 6 chiffres"
```

### Renvoi code
```
"Un nouveau code de vérification a été envoyé à votre adresse email."
```

---

## 🚀 Prochaines étapes

### 1. ⚠️ CRITIQUE : Exécuter le trigger SQL dans Supabase
**Voir le fichier** : `EXECUTE_TRIGGER_SQL.md`

**Pourquoi c'est critique** :
- Le code de l'app est corrigé ✅
- Mais le trigger Database doit être mis à jour ⚠️
- Sans ça, le profil sera créé trop tôt (avant validation OTP)

**Temps estimé** : 5 minutes

---

### 2. Tester l'inscription OTP (10 min)

**Commandes** :
```bash
cd mobile-v2
npx expo start
```

**Test complet** :
1. Ouvrir app sur iPhone avec Expo Go
2. Cliquer "Créer un compte"
3. Entrer username (min 3 car)
4. Entrer email (nouveau, jamais utilisé)
5. Entrer password (min 6 car)
6. Cliquer "Créer mon compte"

**✅ Résultat attendu** :
- Message : "Un code de vérification a été envoyé à votre adresse email."
- Écran change automatiquement → champ OTP visible
- Message : "Un code à 6 chiffres a été envoyé à {email}"

7. Vérifier email reçu → Code à 6 chiffres
8. Entrer le code dans le champ OTP
9. Cliquer "Vérifier le code"

**✅ Résultat attendu** :
- Message : "Votre adresse email a été vérifiée avec succès. Connexion en cours..."
- Modal se ferme après 1 seconde
- Utilisateur connecté automatiquement
- Profil créé dans Supabase (vérifier table `profiles`)

**Tests supplémentaires** :
- Cliquer "Renvoyer le code" → nouveau code reçu par email ✅
- Entrer code invalide "123456" → message erreur ✅
- Attendre expiration code (5 min) → message erreur ✅

---

### 3. Vérifier profil dans Supabase (2 min)

**SQL à exécuter** :
```sql
-- Vérifier dernier profil créé
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;

-- Vérifier que email_confirmed_at est rempli
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;
```

**✅ Résultat attendu** :
- `profiles.created_at` = après validation OTP
- `auth.users.email_confirmed_at` = timestamp rempli (pas NULL)

---

### 4. Build iOS et tests finaux (15 min)

**Commandes** :
```bash
cd mobile-v2
eas build --platform ios --profile preview
```

**Tests après installation app** :
1. ✅ Inscription nouvelle adresse → code reçu → validation → connexion
2. ✅ Doublon email → erreur "Cette adresse email est déjà utilisée..."
3. ✅ Doublon username → erreur "Ce nom d'utilisateur est déjà utilisé..."
4. ✅ Connexion cross-platform (inscrit sur app → connexion site web)
5. ✅ Connexion site → connexion app
6. ✅ Reset password (magic link toujours valide pour reset)

---

## 📝 Checklist finale

- [x] Trigger SQL modifié (condition email_confirmed_at)
- [x] types.ts mis à jour (verifyOtp + resendOtp)
- [x] AuthContext.tsx mis à jour (fonctions OTP)
- [x] AuthModal.tsx refait (UI OTP complète)
- [x] Messages identiques au site web
- [x] Styles OTP identiques au site web
- [x] Aucune erreur TypeScript
- [ ] **EN ATTENTE** : Exécuter trigger SQL dans Supabase
- [ ] **EN ATTENTE** : Tester inscription OTP
- [ ] **EN ATTENTE** : Build iOS et validation finale

---

## 🎉 Résultat

L'app mobile utilise maintenant **EXACTEMENT** le même processus d'inscription que le site web :
- ✅ Code OTP à 6 chiffres
- ✅ UI champ OTP mono text-center
- ✅ Messages identiques
- ✅ Profil créé après validation OTP
- ✅ Connexion automatique après validation
- ✅ Bouton "Renvoyer le code"

**Temps total des modifications** : ~30 minutes
**Temps total estimé avec tests** : 1h12 (exactement comme prévu dans CORRECTION-AUTH-PROCESS-OTP.md)
