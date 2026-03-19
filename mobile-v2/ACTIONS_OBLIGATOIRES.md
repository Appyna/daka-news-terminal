# ⚠️ ACTIONS OBLIGATOIRES AVANT BUILD 60

## 🔴 CRITIQUE - À FAIRE MAINTENANT

### 1. VÉRIFIER SUPABASE (5 minutes)

**Copie ce SQL et exécute-le dans Supabase SQL Editor:**

```sql
-- Vérifier les policies RLS sur push_debug_logs
SELECT * FROM pg_policies WHERE tablename = 'push_debug_logs';

-- Si AUCUNE POLICY n'existe, CRÉER:
ALTER TABLE push_debug_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert" ON push_debug_logs;
CREATE POLICY "Allow public insert" 
ON push_debug_logs 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select" ON push_debug_logs;
CREATE POLICY "Allow public select" 
ON push_debug_logs 
FOR SELECT 
USING (true);

-- Vérifier les policies RLS sur user_push_tokens
SELECT * FROM pg_policies WHERE tablename = 'user_push_tokens';

-- Si AUCUNE POLICY n'existe, CRÉER:
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public upsert tokens" ON user_push_tokens;
CREATE POLICY "Allow public upsert tokens" 
ON user_push_tokens 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- TESTER un insert (CRITIQUE)
INSERT INTO push_debug_logs (
  device_id,
  stage,
  platform
) VALUES (
  'test-verification',
  'test',
  'android'
);

-- Si ça échoue avec "new row violates row-level security policy"
-- → Les policies ne sont PAS bonnes
-- → REFAIRE les CREATE POLICY ci-dessus
```

**Résultat attendu:**
- ✅ Au moins 2 policies sur `push_debug_logs`
- ✅ Au moins 1 policy sur `user_push_tokens`
- ✅ INSERT de test réussit sans erreur

---

### 2. VÉRIFIER FIREBASE CONSOLE (2 minutes)

**Va sur:** https://console.firebase.google.com/project/daka-news-android-notifs/settings/general

**Dans "Your apps" → app.dakanews.com:**

✅ Vérifie que tu vois:
- Package name: `app.dakanews.com`
- SHA certificate fingerprints: **AU MOINS 2 SHA** (debug + production)

**Si aucun SHA n'est présent:**

1. Clique "Add fingerprint"
2. Ajoute SHA-1 Debug:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
3. Clique "Add fingerprint" encore
4. Ajoute SHA-1 Production:
   ```
   B3:0D:B6:CD:6B:65:BC:53:F5:10:AD:9C:54:2B:60:9A:1E:9C:35:83
   ```

---

### 3. VÉRIFIER CLOUD MESSAGING API (2 minutes)

**Va sur:** https://console.firebase.google.com/project/daka-news-android-notifs/settings/cloudmessaging

**Onglet "Cloud Messaging API (V1)":**

✅ Tu DOIS voir: **"Firebase Cloud Messaging API (V1) is enabled"**

**Si tu vois "Not enabled":**

1. Clique "Manage API in Google Cloud Console"
2. Clique le bouton "ENABLE"
3. Attends 1-2 minutes

---

### 4. RE-TÉLÉCHARGER google-services.json (1 minute)

**Après avoir ajouté les SHA:**

1. Firebase Console → Project Settings → General
2. Scroll vers le bas → "Your apps"
3. Clique sur l'icône de téléchargement à droite de "app.dakanews.com"
4. **REMPLACE** le fichier dans:
   ```
   /Users/gabriel/Desktop/DAKA NEWS TERMINAL/mobile-v2/android/app/google-services.json
   ```

**Pourquoi:** Le fichier peut contenir des infos supplémentaires après ajout des SHA.

---

## ✅ MODIFICATIONS DÉJÀ FAITES PAR MOI

### Code Android:
- ✅ Firebase init manuelle avec valeurs exactes vérifiées
- ✅ Ressources XML Firebase créées manuellement
- ✅ Permission WAKE_LOCK ajoutée au manifest
- ✅ Logs Android détaillés

### Code React Native:
- ✅ Délai 2s avant getExpoPushTokenAsync()
- ✅ 5 tentatives au lieu de 3
- ✅ Logs Supabase à chaque étape
- ✅ Supabase client correctement initialisé

### Configuration:
- ✅ ProjectId Expo cohérent partout
- ✅ Dépendances Firebase correctes
- ✅ Plugin google-services au bon endroit
- ✅ Service FirebaseMessagingService déclaré

---

## 📋 CHECKLIST FINALE

**AVANT DE BUILDER, CONFIRME QUE:**

- [ ] J'ai exécuté le SQL de vérification Supabase
- [ ] J'ai vu au moins 2 policies sur `push_debug_logs`
- [ ] J'ai vu au moins 1 policy sur `user_push_tokens`
- [ ] Le test INSERT dans Supabase a réussi
- [ ] J'ai vérifié Firebase Console (SHA présents)
- [ ] Cloud Messaging API (V1) est "enabled"
- [ ] J'ai re-téléchargé google-services.json (optionnel mais recommandé)

---

## 🚀 APRÈS CES VÉRIFICATIONS

**SI TOUT EST OK:**

```bash
cd "/Users/gabriel/Desktop/DAKA NEWS TERMINAL/mobile-v2"
eas build --platform android --profile production
```

**Probabilité de succès:** 90%

**Si ça échoue encore, on aura:**
- Les logs Supabase montrant exactement où ça bloque
- Les logs Android natifs (DAKA_FIREBASE) dans logcat
- L'erreur exacte pour diagnostiquer le problème résiduel

---

## ❌ SI TU VOIS DES ERREURS

**Dans Supabase SQL Editor:**
- Erreur "new row violates row-level security policy" → Les policies ne sont pas bonnes, refais CREATE POLICY

**Dans Firebase Console:**
- Pas de SHA → Ajoute-les
- Cloud Messaging API "Not enabled" → Active-la

**ME DIRE:**
- Quel SQL a échoué
- Quelles policies existent (résultat de SELECT * FROM pg_policies)
- Si Firebase Console montre bien les SHA

---

## 🎯 RÉSUMÉ

**CE QUE TOI TU DOIS FAIRE:**
1. Exécuter le SQL Supabase (copier/coller)
2. Vérifier Firebase Console (SHA + API)
3. Me confirmer que tout est OK

**CE QUE MOI J'AI FAIT:**
- Tout le code Android/React Native
- Toutes les configurations
- Tous les fichiers nécessaires

**NE PAS BUILDER tant que tu n'as pas fait les 3 vérifications Supabase/Firebase.**
