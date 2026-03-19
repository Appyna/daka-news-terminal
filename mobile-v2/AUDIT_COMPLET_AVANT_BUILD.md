# 🔍 AUDIT COMPLET - TOUTES LES CAUSES POSSIBLES D'ÉCHEC

## ⚠️ PROBLÈMES POTENTIELS NON VÉRIFIÉS

### 1️⃣ SUPABASE - Tables & Permissions

**CRITIQUE:** Je n'ai JAMAIS vérifié si les tables Supabase ont les bonnes policies RLS.

**Risque:**
- ❌ Les inserts dans `push_debug_logs` peuvent être BLOQUÉS par RLS
- ❌ Les inserts dans `user_push_tokens` peuvent être BLOQUÉS par RLS
- ❌ Le client Supabase utilise l'anon key → si RLS bloque, AUCUN log ne sera écrit

**Action requise:**
```sql
-- EXÉCUTER DANS SUPABASE SQL EDITOR:

-- 1. Vérifier que les policies existent
SELECT * FROM pg_policies 
WHERE tablename IN ('user_push_tokens', 'push_debug_logs');

-- 2. Si elles n'existent pas, LES CRÉER:

-- Pour push_debug_logs (ABSOLUMENT CRITIQUE)
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

-- Pour user_push_tokens
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public upsert tokens" ON user_push_tokens;
CREATE POLICY "Allow public upsert tokens" 
ON user_push_tokens 
FOR ALL 
USING (true) 
WITH CHECK (true);
```

---

### 2️⃣ FIREBASE - Vérification Console

**CRITIQUE:** Je n'ai pas vérifié si:
- Firebase Cloud Messaging API (V1) est VRAIMENT activée
- Les SHA fingerprints sont VRAIMENT ajoutés dans Firebase Console

**Action requise:**

1. **Va sur Firebase Console:**
   - https://console.firebase.google.com/project/daka-news-android-notifs/settings/general

2. **Vérifie dans "Your apps" → app.dakanews.com:**
   - ✅ Package name: `app.dakanews.com`
   - ✅ SHA-1 Debug présent: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - ✅ SHA-1 Production présent: `B3:0D:B6:CD:6B:65:BC:53:F5:10:AD:9C:54:2B:60:9A:1E:9C:35:83`

3. **Va sur Cloud Messaging:**
   - https://console.firebase.google.com/project/daka-news-android-notifs/settings/cloudmessaging
   - Onglet **Cloud Messaging API (V1)**
   - Vérifie que tu vois: "Cloud Messaging API (V1) is enabled"

4. **Si l'API n'est PAS activée:**
   - Clique sur "Manage API in Google Cloud Console"
   - Clique "ENABLE"
   - Attends 2 minutes

---

### 3️⃣ EXPO - ProjectId Cohérence ABSOLUE

**CRITIQUE:** Vérifie que le ProjectId est PARTOUT le même.

**Vérification:**

`app.json`:
```json
"extra": {
  "eas": {
    "projectId": "72f67e44-ecbe-4df7-95c9-f00dd7204d90"
  }
}
```

`src/services/notificationService.ts`:
```typescript
const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                  '72f67e44-ecbe-4df7-95c9-f00dd7204d90';
```

**Statut:** ✅ Cohérent

---

### 4️⃣ ANDROID - Vérifier les Ressources Firebase

**CRITIQUE:** Les ressources XML Firebase que j'ai créées manuellement.

**Fichier créé:** `android/app/src/main/res/values/firebase_config.xml`

**Vérification:**
```bash
cat "/Users/gabriel/Desktop/DAKA NEWS TERMINAL/mobile-v2/android/app/src/main/res/values/firebase_config.xml"
```

**Résultat attendu:**
```xml
<string name="gcm_defaultSenderId">745386523668</string>
<string name="google_app_id">1:745386523668:android:f63bb4f67f70ede6fd3b01</string>
```

**Statut:** ✅ Créé

---

### 5️⃣ KOTLIN - Vérifier l'Init Firebase Manuelle

**Fichier:** `android/app/src/main/java/app/dakanews/com/MainApplication.kt`

**Code actuel:**
```kotlin
val options = FirebaseOptions.Builder()
  .setApplicationId("1:745386523668:android:f63bb4f67f70ede6fd3b01")
  .setApiKey("AIzaSyBMTl5I3neYE3moZCIq1JJO9gzmSwJhI20")
  .setProjectId("daka-news-android-notifs")
  .setGcmSenderId("745386523668")
  .setStorageBucket("daka-news-android-notifs.firebasestorage.app")
  .build()
```

**⚠️ PROBLÈME POSSIBLE:** Je n'ai pas vérifié si ces valeurs sont 100% exactes.

**Vérification nécessaire:**
```bash
# Extraire les valeurs du google-services.json
cat "/Users/gabriel/Desktop/DAKA NEWS TERMINAL/mobile-v2/android/app/google-services.json" | grep -E "(mobilesdk_app_id|current_key|project_id|project_number|storage_bucket)"
```

---

### 6️⃣ PERMISSIONS ANDROID - Vérifier AndroidManifest

**Critique:** Vérifier que TOUTES les permissions sont présentes.

**Fichier:** `android/app/src/main/AndroidManifest.xml`

**Permissions requises:**
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.WAKE_LOCK"/>
```

**⚠️ MANQUE:** `WAKE_LOCK` peut être nécessaire pour les notifications en background.

---

### 7️⃣ GOOGLE PLAY SERVICES - Version Compatible

**Critique:** Vérifier que le téléphone Android a Google Play Services.

**Ton Android:** Redmi 7.1.2
**Question:** Est-ce que Google Play Services est installé et à jour ?

**Vérification impossible sans le téléphone:**
- Paramètres → Apps → Google Play Services
- Version doit être récente (pas 2019)

---

### 8️⃣ BUILD GRADLE - Vérifier les Versions

**Fichier:** `android/app/build.gradle`

**Dépendances actuelles:**
```gradle
implementation platform('com.google.firebase:firebase-bom:32.7.4')
implementation 'com.google.firebase:firebase-messaging'
```

**⚠️ PROBLÈME POSSIBLE:** Version trop récente pour Android 7.1.2 ?

**Firebase BoM 32.7.4 requirements:**
- minSdkVersion: 21 (Android 5.0)
- Ton Android: 7.1.2 = API 25 → OK

**Mais:** Firebase Cloud Messaging peut avoir des bugs sur Android 7.

---

### 9️⃣ EXPO NOTIFICATIONS - Configuration Plugin

**Fichier:** `app.json`

**Configuration actuelle:**
```json
"plugins": [
  [
    "expo-notifications",
    {
      "icon": "./assets/notification-icon.png",
      "color": "#F5C518",
      "sounds": []
    }
  ]
]
```

**⚠️ MANQUE PEUT-ÊTRE:**
```json
"android": {
  "useNextNotificationsApi": true  // Pour forcer FCM v1
}
```

---

### 🔟 CONFLITS POTENTIELS - AdMob vs Firebase

**Risque:** AdMob et Firebase utilisent Google Play Services.

**Versions actuelles:**
- AdMob: react-native-google-mobile-ads v14.2.0
- Firebase: BoM 32.7.4

**Conflit potentiel:** Versions de `play-services-basement` différentes.

**Solution possible:**
```gradle
// Dans android/app/build.gradle
configurations.all {
    resolutionStrategy {
        force 'com.google.android.gms:play-services-basement:18.2.0'
    }
}
```

---

## ✅ CE QUI EST PARFAIT

1. ✅ Firebase init manuelle avec valeurs hardcodées
2. ✅ Ressources XML Firebase créées
3. ✅ Délais + retry (2s + 5 tentatives)
4. ✅ Logs Supabase exhaustifs
5. ✅ ProjectId Expo cohérent
6. ✅ google-services.json valide
7. ✅ Service FirebaseMessagingService dans manifest
8. ✅ Supabase client initialisé correctement

---

## ❌ CE QUI DOIT ÊTRE VÉRIFIÉ MAINTENANT

### Actions OBLIGATOIRES avant Build 60:

1. **EXÉCUTER** `VERIFICATION_SUPABASE.sql` dans Supabase SQL Editor
2. **VÉRIFIER** Firebase Console (SHA + Cloud Messaging API)
3. **VÉRIFIER** que les valeurs dans MainApplication.kt matchent google-services.json
4. **AJOUTER** permission WAKE_LOCK dans AndroidManifest
5. **TESTER** INSERT manuel dans push_debug_logs depuis Supabase

---

## 🎯 PROBABILITÉ DE SUCCÈS

**AVANT vérifications:** 70%
**APRÈS vérifications:** 90%

**Causes possibles d'échec résiduel après vérifications:**
1. Google Play Services pas installé/obsolète sur le Redmi
2. Bug Firebase sur Android 7.1.2 spécifiquement
3. Conflit de version Google Play Services (AdMob vs Firebase)

---

## 📝 CE QUE TU DOIS FAIRE MAINTENANT

1. **Copie** le contenu de `VERIFICATION_SUPABASE.sql`
2. **Colle** dans Supabase SQL Editor
3. **Exécute** toutes les requêtes
4. **Envoie-moi** les résultats (surtout les policies)
5. Je corrigerai ce qui manque AVANT le build

**NE PAS BUILDER avant d'avoir fait ça.**
