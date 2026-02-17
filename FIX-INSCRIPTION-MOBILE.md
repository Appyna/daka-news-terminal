# 🔧 CORRECTION INSCRIPTION APP MOBILE - GUIDE D'EXÉCUTION

**Date** : 17 février 2026  
**Problème résolu** : "Une erreur est survenue. Veuillez réessayer plus tard." lors de l'inscription

---

## ❌ PROBLÈME IDENTIFIÉ

### Symptômes observés :
1. L'utilisateur s'inscrit dans l'app iOS
2. Email de confirmation reçu ✅
3. Mais l'écran d'inscription reste bloqué avec erreur ❌
4. Message d'erreur : "Une erreur est survenue. Veuillez réessayer plus tard."

### Cause racine :
Le code mobile tentait de créer le profil utilisateur **immédiatement** après le `signUp()`, mais Supabase bloque cette action tant que l'email n'est pas confirmé (Row Level Security / RLS).

**Ancien flux (cassé)** :
```
1. signUp(email, password, username)
2. ❌ Création immédiate du profil → ERREUR RLS (email non confirmé)
3. Email envoyé mais profil non créé
4. Utilisateur bloqué
```

---

## ✅ SOLUTION IMPLÉMENTÉE

### Nouveau flux (robuste) :
```
1. signUp(email, password, username)
   → Supabase stocke username dans metadata
   → Email de confirmation envoyé
   → App affiche: "Email envoyé, cliquez sur le lien"

2. Utilisateur clique sur le lien dans l'email
   → Supabase confirme l'email
   → INSERT dans auth.users

3. ✨ TRIGGER automatique s'exécute
   → Crée le profil dans public.profiles
   → Utilise le username stocké dans metadata

4. ✅ Utilisateur peut maintenant se connecter
```

---

## 📋 ACTIONS À EFFECTUER (DANS L'ORDRE)

### ÉTAPE 1 : Exécuter le trigger SQL dans Supabase (5 min) ⚠️ OBLIGATOIRE

**Instructions** :

1. **Se connecter à Supabase Dashboard**
   - URL : https://supabase.com/dashboard/sign-in
   - Projet : DAKA News

2. **Ouvrir SQL Editor**
   - Menu gauche → `SQL Editor`
   - Cliquer sur `New query`

3. **Copier-coller le SQL**
   - Ouvrir le fichier : [backend/database/trigger_create_profile.sql](backend/database/trigger_create_profile.sql)
   - Tout copier (Cmd+A → Cmd+C)
   - Coller dans SQL Editor (Cmd+V)

4. **Exécuter le script**
   - Cliquer sur le bouton `RUN` en bas à droite
   - Attendre 2-3 secondes

5. **Vérifier que ça a marché**
   - Tu devrais voir 2 résultats :
     ```
     trigger_name         | enabled
     --------------------|--------
     on_auth_user_created | O
     
     function_name      | security_definer
     -------------------|------------------
     handle_new_user    | t
     ```
   - Si tu vois ça : ✅ **Trigger créé avec succès !**
   - Si erreur : Copie-colle l'erreur et envoie-la moi

---

### ÉTAPE 2 : Rebuild l'app iOS (15 min)

Le code mobile a été corrigé. Tu dois rebuild l'app pour que les modifications prennent effet.

**Option A : Build preview (rapide - 10 min)**
```bash
cd mobile-v2
eas build --platform ios --profile preview
```

**Option B : Build production (recommandé pour App Store - 15 min)**
```bash
cd mobile-v2
eas build --platform ios --profile production
```

**⚠️ Important** : Attends que le build soit terminé (EAS te donnera un lien pour télécharger l'app).

---

### ÉTAPE 3 : Tester la nouvelle inscription (3 min)

1. **Installer le nouveau build** sur ton iPhone
2. **Ouvrir l'app**
3. **Cliquer sur "Inscription"**
4. **Remplir le formulaire** :
   - Username : `testuser123`
   - Email : Une adresse email que tu n'as jamais utilisée avant
   - Mot de passe : `Test123!`
5. **Cliquer sur "Créer mon compte"**

**✅ Résultat attendu :**
```
Message vert affiché :
"✅ Compte créé ! Un email de confirmation vous a été envoyé. 
Cliquez sur le lien dans l'email pour activer votre compte, 
puis connectez-vous."
```

6. **Ouvrir ton email**
7. **Cliquer sur le lien de confirmation Supabase**
8. **Retourner dans l'app**
9. **Cliquer sur "Connexion"** (l'app bascule automatiquement après 5 secondes)
10. **Te connecter** avec email + mot de passe

**✅ Résultat attendu :** Connexion réussie, tu arrives sur l'écran principal avec tes articles !

---

## 🔍 VÉRIFICATIONS SUPPLÉMENTAIRES

### Vérifier que le profil a bien été créé

**SQL à exécuter dans Supabase** (après avoir confirmé l'email) :
```sql
SELECT 
  id,
  email,
  username,
  is_premium,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
```

**✅ Résultat attendu :**
Tu devrais voir ton nouveau compte avec :
- Email : celui utilisé lors de l'inscription
- Username : `testuser123` (ou celui que tu as choisi)
- is_premium : `false`
- created_at : Date/heure récente

---

## 🐛 SI ÇA NE MARCHE TOUJOURS PAS

### Scénario 1 : Email non reçu

**Vérifier la config Supabase** :
1. Dashboard Supabase → `Authentication` → `Email Templates`
2. Vérifier que "Confirm signup" est activé
3. Vérifier l'URL de redirection : doit être `exp://` ou ton scheme custom

**Solution temporaire** : Désactiver la confirmation d'email
```sql
-- ⚠️ UNIQUEMENT POUR TESTER, PAS EN PRODUCTION
UPDATE auth.config 
SET config = jsonb_set(config, '{mailer,autoconfirm}', 'true');
```

### Scénario 2 : Erreur "Email not confirmed" à la connexion

**Cause** : Le trigger n'a pas créé le profil automatiquement

**Vérifier** :
```sql
-- Voir si le trigger existe
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**Si vide** : Re-exécuter le script [trigger_create_profile.sql](backend/database/trigger_create_profile.sql)

### Scénario 3 : Erreur "User already registered"

**Cause** : Un compte existe déjà avec cet email

**Solution** : Supprimer l'ancien compte en BDD
```sql
-- Voir tous les comptes
SELECT id, email, confirmed_at FROM auth.users ORDER BY created_at DESC;

-- Supprimer un compte test (remplace l'email)
DELETE FROM auth.users WHERE email = 'test@example.com';
DELETE FROM profiles WHERE email = 'test@example.com';
```

---

## 🎯 RÉSUMÉ DES MODIFICATIONS

### Fichiers modifiés :

**1. [mobile-v2/src/contexts/AuthContext.tsx](mobile-v2/src/contexts/AuthContext.tsx)**
- ❌ Supprimé : Tentative de création manuelle du profil après signUp
- ✅ Ajouté : Retour des données signUp pour vérifier si session existe
- **Impact** : Évite l'erreur RLS lors de l'inscription

**2. [mobile-v2/src/components/AuthModal.tsx](mobile-v2/src/components/AuthModal.tsx)**
- ✅ Ajouté : Validation du username (min 3 caractères)
- ✅ Ajouté : Validation du password (min 6 caractères)
- ✅ Ajouté : Détection si email confirmation requise
- ✅ Amélioré : Message de succès explicite avec instructions
- ✅ Amélioré : Style du message de succès (encadré vert)
- ✅ Ajouté : Bascule automatique vers onglet "Connexion" après 5 secondes
- **Impact** : UX claire, utilisateur sait quoi faire

**3. [backend/database/trigger_create_profile.sql](backend/database/trigger_create_profile.sql)** (NOUVEAU)
- ✅ Créé : Trigger automatique `on_auth_user_created`
- ✅ Créé : Fonction `handle_new_user()` avec SECURITY DEFINER
- **Impact** : Profil créé automatiquement après confirmation d'email

---

## 📊 AVANT / APRÈS

### AVANT (cassé) ❌
```
Inscription → Erreur "Une erreur est survenue"
Email reçu mais profil non créé
Utilisateur bloqué, impossible de se connecter
```

### APRÈS (corrigé) ✅
```
Inscription → "Email envoyé, cliquez sur le lien"
Clic sur lien → Profil créé automatiquement via trigger
Connexion → Succès ! 🎉
```

---

## ⏱️ TEMPS TOTAL ESTIMÉ

- ✅ **ÉTAPE 1** : Exécuter trigger SQL → **5 minutes**
- ✅ **ÉTAPE 2** : Rebuild app iOS → **15 minutes** (attente build EAS)
- ✅ **ÉTAPE 3** : Tester inscription → **3 minutes**

**TOTAL** : **23 minutes**

---

## 🚀 PROCHAINE ÉTAPE APRÈS CORRECTION

Une fois l'inscription fonctionnelle :

1. ✅ Tester connexion/déconnexion
2. ✅ Tester reset password
3. ✅ Tester accès Premium (si IAP configuré)
4. ✅ Submit à App Store Connect

---

## 📞 CONTACT SI PROBLÈME

Si après avoir suivi ce guide tu as encore des erreurs :

1. **Copie l'erreur exacte** affichée dans l'app ou dans les logs Supabase
2. **Envoie-moi un screenshot** de l'erreur
3. **Indique-moi l'étape** où ça bloque (ÉTAPE 1, 2 ou 3)

**Je te répondrai avec une solution adaptée dans les 30 minutes.**

---

## ✅ CHECKLIST DE VÉRIFICATION

Coche chaque étape au fur et à mesure :

- [ ] **ÉTAPE 1** : Trigger SQL exécuté dans Supabase
- [ ] **ÉTAPE 1.1** : Vérification trigger OK (query retourne résultats)
- [ ] **ÉTAPE 2** : App iOS rebuild avec EAS
- [ ] **ÉTAPE 2.1** : Nouveau build installé sur iPhone
- [ ] **ÉTAPE 3** : Test inscription avec nouvel email
- [ ] **ÉTAPE 3.1** : Message "Email envoyé" affiché
- [ ] **ÉTAPE 3.2** : Email de confirmation reçu
- [ ] **ÉTAPE 3.3** : Clic sur lien dans email
- [ ] **ÉTAPE 3.4** : Connexion réussie avec email + password
- [ ] **ÉTAPE 3.5** : Profil visible dans Supabase (SQL vérification)

**Si toutes les cases sont cochées : 🎉 INSCRIPTION FONCTIONNELLE !**

---

**Dernière mise à jour** : 17 février 2026  
**Version** : 2.0 (Trigger automatique)
