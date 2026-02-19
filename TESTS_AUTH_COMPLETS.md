# 🧪 CHECKLIST TESTS AUTH COMPLETS - Site Web vs App Mobile

## 📋 Matrice de comparaison

| Scénario | Site Web | App Mobile | Status |
|----------|----------|------------|--------|
| Vérification username doublon | `profiles.username` | `profiles.username` | ✅ IDENTIQUE |
| Vérification email doublon | `profiles.email` + `auth.users` | `profiles.email` + RPC `check_email_exists` | ✅ IDENTIQUE |
| Message erreur email doublon | "Cette adresse email est déjà utilisée..." | "Cette adresse email est déjà utilisée..." | ✅ IDENTIQUE |
| Message erreur username doublon | "Ce nom d'utilisateur est déjà utilisé..." | "Ce nom d'utilisateur est déjà utilisé..." | ✅ IDENTIQUE |
| Mode inscription | OTP 6 chiffres | OTP 6 chiffres | ✅ IDENTIQUE |
| Message après inscription | "Un code de vérification a été envoyé..." | "Un code de vérification a été envoyé..." | ✅ IDENTIQUE |
| UI champ OTP | Input 6 digits, mono, text-center | TextInput 6 digits, mono, text-center | ✅ IDENTIQUE |
| Validation OTP | `verifyOtp(email, token, type: 'signup')` | `verifyOtp(email, token, type: 'signup')` | ✅ IDENTIQUE |
| Renvoi code | `resend(type: 'signup', email)` | `resend(type: 'signup', email)` | ✅ IDENTIQUE |
| Profil création | Trigger après email_confirmed_at | Trigger après email_confirmed_at | ✅ IDENTIQUE |
| Connexion | `signInWithPassword(email, password)` | `signInWithPassword(email, password)` | ✅ IDENTIQUE |
| Message connexion échouée | "Invalid login credentials" | "Email ou mot de passe incorrect" | ⚠️ TRADUIT |
| Reset password redirectTo | `window.location.origin` | `dakanews://reset-password` | ⚠️ DIFFÉRENT (normal) |

---

## 🧪 TESTS À EFFECTUER (Dans l'ordre)

### TEST 1 : Inscription nouveau compte (App → Site)

#### Sur APP MOBILE :
1. ✅ Ouvrir AuthModal → Onglet "Inscription"
2. ✅ Entrer username : `testuser01` (min 3 car)
3. ✅ Entrer email : `test01@dakanews.com` (jamais utilisé)
4. ✅ Entrer password : `Test123!` (min 6 car)
5. ✅ Cliquer "Créer mon compte"

**Résultat attendu** :
- ✅ Message : "Un code de vérification a été envoyé à votre adresse email."
- ✅ Écran change → Champ OTP visible
- ✅ Message : "Un code à 6 chiffres a été envoyé à test01@dakanews.com"

6. ✅ Vérifier email → Code 6 chiffres reçu (ex: 123456)
7. ✅ Entrer code dans champ OTP
8. ✅ Cliquer "Vérifier le code"

**Résultat attendu** :
- ✅ Message : "Votre adresse email a été vérifiée avec succès. Connexion en cours..."
- ✅ Modal se ferme après 1 seconde
- ✅ Utilisateur connecté (profil visible)
- ✅ Username affiché : `testuser01`

#### Sur SITE WEB (dakanews.com) :
9. ✅ Ouvrir site web sur navigateur
10. ✅ Cliquer "Connexion"
11. ✅ Entrer email : `test01@dakanews.com`
12. ✅ Entrer password : `Test123!`
13. ✅ Cliquer "Se connecter"

**Résultat attendu** :
- ✅ Connexion réussie
- ✅ Profil chargé avec username `testuser01`
- ✅ is_premium : false
- ✅ **Preuve connexion cross-platform OK**

---

### TEST 2 : Inscription nouveau compte (Site → App)

#### Sur SITE WEB (dakanews.com) :
1. ✅ Ouvrir site web → Modal auth → Onglet "Inscription"
2. ✅ Entrer username : `websiteuser`
3. ✅ Entrer email : `test02@dakanews.com` (nouveau)
4. ✅ Entrer password : `Web123!`
5. ✅ Cliquer "Créer mon compte"

**Résultat attendu** :
- ✅ Message : "Un code de vérification a été envoyé à votre adresse email."
- ✅ Écran change → Champ OTP visible
- ✅ Message : "Un code à 6 chiffres a été envoyé à test02@dakanews.com"

6. ✅ Vérifier email → Code 6 chiffres reçu
7. ✅ Entrer code
8. ✅ Cliquer "Vérifier le code"

**Résultat attendu** :
- ✅ Message : "Votre adresse email a été vérifiée avec succès. Connexion en cours..."
- ✅ Modal se ferme
- ✅ Utilisateur connecté avec username `websiteuser`

#### Sur APP MOBILE :
9. ✅ Ouvrir app → Modal auth → Onglet "Connexion"
10. ✅ Entrer email : `test02@dakanews.com`
11. ✅ Entrer password : `Web123!`
12. ✅ Cliquer "Se connecter"

**Résultat attendu** :
- ✅ Connexion réussie
- ✅ Profil chargé avec username `websiteuser`
- ✅ **Preuve connexion cross-platform OK (inversé)**

---

### TEST 3 : Doublon email (App)

#### Sur APP MOBILE :
1. ✅ Déconnexion si connecté
2. ✅ Modal auth → Onglet "Inscription"
3. ✅ Entrer username : `newuser`
4. ✅ Entrer email : `test01@dakanews.com` (DÉJÀ UTILISÉ dans TEST 1)
5. ✅ Entrer password : `Test456!`
6. ✅ Cliquer "Créer mon compte"

**Résultat attendu** :
- ✅ **Message immédiat** : "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse."
- ✅ **Aucun code OTP envoyé**
- ✅ **Champ OTP PAS affiché**
- ✅ Utilisateur reste sur formulaire inscription

---

### TEST 4 : Doublon email (Site)

#### Sur SITE WEB :
1. ✅ Déconnexion si connecté
2. ✅ Modal auth → Onglet "Inscription"
3. ✅ Entrer username : `anotheruser`
4. ✅ Entrer email : `test02@dakanews.com` (DÉJÀ UTILISÉ dans TEST 2)
5. ✅ Entrer password : `Web789!`
6. ✅ Cliquer "Créer mon compte"

**Résultat attendu** :
- ✅ **Message immédiat** : "Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser une autre adresse."
- ✅ **Message IDENTIQUE à l'app**
- ✅ Aucun code OTP envoyé
- ✅ Champ OTP pas affiché

**Validation** : Site et app se comportent EXACTEMENT pareil ✅

---

### TEST 5 : Doublon username (App)

#### Sur APP MOBILE :
1. ✅ Modal auth → Onglet "Inscription"
2. ✅ Entrer username : `testuser01` (DÉJÀ UTILISÉ dans TEST 1)
3. ✅ Entrer email : `test03@dakanews.com` (nouveau)
4. ✅ Entrer password : `Test789!`
5. ✅ Cliquer "Créer mon compte"

**Résultat attendu** :
- ✅ **Message immédiat** : "Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre."
- ✅ Aucun code OTP envoyé
- ✅ Utilisateur reste sur formulaire

---

### TEST 6 : Doublon username (Site)

#### Sur SITE WEB :
1. ✅ Modal auth → Onglet "Inscription"
2. ✅ Entrer username : `websiteuser` (DÉJÀ UTILISÉ dans TEST 2)
3. ✅ Entrer email : `test04@dakanews.com` (nouveau)
4. ✅ Entrer password : `Web999!`
5. ✅ Cliquer "Créer mon compte"

**Résultat attendu** :
- ✅ **Message immédiat** : "Ce nom d'utilisateur est déjà utilisé. Veuillez en choisir un autre."
- ✅ **Message IDENTIQUE à l'app**
- ✅ Comportement identique

**Validation** : Site et app se comportent EXACTEMENT pareil ✅

---

### TEST 7 : Connexion échouée - Mauvais password (App)

#### Sur APP MOBILE :
1. ✅ Modal auth → Onglet "Connexion"
2. ✅ Entrer email : `test01@dakanews.com` (existe)
3. ✅ Entrer password : `WRONG_PASSWORD`
4. ✅ Cliquer "Se connecter"

**Résultat attendu** :
- ✅ **Message** : "Email ou mot de passe incorrect"
- ✅ Pas de connexion
- ✅ Utilisateur reste sur formulaire

---

### TEST 8 : Connexion échouée - Email inexistant (App)

#### Sur APP MOBILE :
1. ✅ Modal auth → Onglet "Connexion"
2. ✅ Entrer email : `nonexistent@test.com`
3. ✅ Entrer password : `Test123!`
4. ✅ Cliquer "Se connecter"

**Résultat attendu** :
- ✅ **Message** : "Email ou mot de passe incorrect"
- ✅ Même message que mauvais password (sécurité)

---

### TEST 9 : Déconnexion + Reconnexion (App)

#### Sur APP MOBILE :
1. ✅ Connecté avec `test01@dakanews.com`
2. ✅ Cliquer "Déconnexion"
3. ✅ **Résultat attendu** : Déconnecté, profil vide
4. ✅ Modal auth → Onglet "Connexion"
5. ✅ Entrer email : `test01@dakanews.com`
6. ✅ Entrer password : `Test123!`
7. ✅ Cliquer "Se connecter"

**Résultat attendu** :
- ✅ Connexion réussie
- ✅ Profil rechargé avec username `testuser01`
- ✅ **Preuve : connexion fonctionne après déconnexion**

---

### TEST 10 : Reset password (App)

#### Sur APP MOBILE :
1. ✅ Modal auth → Onglet "Connexion"
2. ✅ Cliquer "Mot de passe oublié ?"
3. ✅ Entrer email : `test01@dakanews.com`
4. ✅ Cliquer "Envoyer le lien"

**Résultat attendu** :
- ✅ Message : "Email de réinitialisation envoyé ! Vérifiez votre boîte mail."
- ✅ Email reçu avec lien

5. ✅ Ouvrir email → Cliquer sur lien

**Résultat attendu** :
- ✅ **App s'ouvre** (deep link `dakanews://reset-password`)
- ✅ **PAS localhost:3000**
- ✅ Écran reset password affiché

---

### TEST 11 : Renvoi code OTP (App)

#### Sur APP MOBILE :
1. ✅ Inscription avec nouveau compte → Email `test05@dakanews.com`
2. ✅ Écran OTP affiché
3. ✅ **NE PAS entrer le code**
4. ✅ Cliquer "Renvoyer le code"

**Résultat attendu** :
- ✅ Message : "Un nouveau code de vérification a été envoyé à votre adresse email."
- ✅ Nouvel email reçu avec nouveau code
- ✅ Ancien code expire

5. ✅ Entrer le **nouveau** code
6. ✅ Cliquer "Vérifier le code"

**Résultat attendu** :
- ✅ Validation réussie
- ✅ Connexion automatique

---

### TEST 12 : Code OTP invalide (App)

#### Sur APP MOBILE :
1. ✅ Inscription avec nouveau compte → Email `test06@dakanews.com`
2. ✅ Écran OTP affiché
3. ✅ Entrer code FAUX : `999999`
4. ✅ Cliquer "Vérifier le code"

**Résultat attendu** :
- ✅ **Message** : "Le code de vérification est expiré ou invalide. Veuillez demander un nouveau code."
- ✅ Pas de connexion
- ✅ Utilisateur reste sur écran OTP

---

### TEST 13 : Code OTP trop court (App)

#### Sur APP MOBILE :
1. ✅ Inscription en cours → Écran OTP
2. ✅ Entrer code : `123` (seulement 3 chiffres)
3. ✅ Cliquer "Vérifier le code"

**Résultat attendu** :
- ✅ **Message** : "Le code doit contenir 6 chiffres"
- ✅ Pas d'appel API
- ✅ Validation côté client

---

### TEST 14 : Vérifier profil créé dans Supabase

#### Après chaque inscription validée OTP :
1. ✅ Ouvrir Supabase Dashboard → Table Editor → `profiles`
2. ✅ Chercher email inscrit (ex: `test01@dakanews.com`)

**Résultat attendu** :
- ✅ Profil existe dans table `profiles`
- ✅ `id` = UUID user auth.users
- ✅ `email` = email inscrit
- ✅ `username` = username fourni
- ✅ `is_premium` = false
- ✅ `premium_until` = NULL
- ✅ `created_at` = timestamp après validation OTP (pas avant)

3. ✅ Aller dans auth.users
4. ✅ Chercher même email

**Résultat attendu** :
- ✅ User existe dans `auth.users`
- ✅ `email_confirmed_at` IS NOT NULL (timestamp de validation OTP)
- ✅ `raw_user_meta_data->>'username'` = username fourni

---

### TEST 15 : Connexion simultanée Site + App

#### Test connexion parallèle :
1. ✅ Connecté sur APP avec `test01@dakanews.com`
2. ✅ Ouvrir SITE WEB sur navigateur
3. ✅ Connecté sur SITE avec `test01@dakanews.com`

**Résultat attendu** :
- ✅ **Deux sessions actives** (normal)
- ✅ Profil chargé sur les deux
- ✅ Modifications profil synchronisées

4. ✅ Sur APP : Devenir premium (si fonctionnel)
5. ✅ Sur SITE : Rafraîchir profil

**Résultat attendu** :
- ✅ `is_premium` = true sur site aussi
- ✅ **Preuve synchronisation database OK**

---

## ✅ RÉSUMÉ VALIDATION FINALE

| Test | Description | Status |
|------|-------------|--------|
| 1 | Inscription App → Connexion Site | ⏳ À tester |
| 2 | Inscription Site → Connexion App | ⏳ À tester |
| 3 | Doublon email App | ⏳ À tester |
| 4 | Doublon email Site | ⏳ À tester |
| 5 | Doublon username App | ⏳ À tester |
| 6 | Doublon username Site | ⏳ À tester |
| 7 | Connexion échouée App (bad password) | ⏳ À tester |
| 8 | Connexion échouée App (email inexistant) | ⏳ À tester |
| 9 | Déconnexion + Reconnexion App | ⏳ À tester |
| 10 | Reset password App (deep link) | ⏳ À tester |
| 11 | Renvoi code OTP App | ⏳ À tester |
| 12 | Code OTP invalide App | ⏳ À tester |
| 13 | Code OTP trop court App | ⏳ À tester |
| 14 | Vérifier profil Supabase | ⏳ À tester |
| 15 | Connexion simultanée Site + App | ⏳ À tester |

---

## 🎯 CRITÈRES DE SUCCÈS

Pour valider que **tout est identique et fonctionne parfaitement** :

- ✅ **Tous les 15 tests** doivent passer
- ✅ **Messages d'erreur** identiques site vs app
- ✅ **Process OTP** identique site vs app
- ✅ **Connexion cross-platform** fonctionne dans les deux sens
- ✅ **Aucun crash** sur app
- ✅ **Aucune erreur** dans console
- ✅ **Profils créés** uniquement après validation OTP
- ✅ **Deep link reset password** ouvre app (pas localhost)

---

## 📝 NOTES IMPORTANTES

### Différences NORMALES (intentionnelles) :
1. **Reset password redirectTo** :
   - Site : `window.location.origin` (navigateur)
   - App : `dakanews://reset-password` (deep link)
   - **C'est normal**, chaque plateforme a son URL

2. **UI native vs web** :
   - Site : `<input>` HTML
   - App : `<TextInput>` React Native
   - **C'est normal**, mais comportement identique

### Différences INTERDITES (bugs) :
1. **Messages d'erreur différents** → BUG
2. **Process inscription différent** → BUG
3. **Connexion cross-platform ne marche pas** → BUG
4. **Profil créé avant OTP** → BUG
5. **Doublon email accepté** → BUG

---

## 🚀 READY TO BUILD

Si tous les tests passent après le build :
- ✅ **App = Site** (process identique)
- ✅ **Aucun bug**
- ✅ **Aucun crash**
- ✅ **Cross-platform OK**

**→ APP PRODUCTION-READY ! 🎉**
