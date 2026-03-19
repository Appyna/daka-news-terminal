# 🔥 CONFIGURATION FIREBASE COMPLÈTE - ÉTAPE PAR ÉTAPE

## ❌ PROBLÈME IDENTIFIÉ
L'erreur observée est : `Default FirebaseApp is not initialized`.

Important : un `google-services.json` peut être valide même s'il est très minimal. L'absence de champs comme `firebase_url` n'est pas, à elle seule, une preuve de mauvais fichier.

---

## ✅ SOLUTION - REFAIRE LA CONFIG FIREBASE PROPREMENT

### ÉTAPE 1: Vérifier que Firebase Cloud Messaging est activé

1. Va sur https://console.firebase.google.com/project/daka-news-android-notifs
2. Menu gauche → **Build** → **Cloud Messaging**
3. Clique sur l'onglet **Cloud Messaging API (Legacy)**
4. **VÉRIFIE SI "Server Key" ET "Sender ID" SONT AFFICHÉS**
5. Note le **Sender ID** (devrait être 745386523668)

### ÉTAPE 2: Activer Firebase Cloud Messaging API dans Google Cloud

1. Clique sur le lien **"Manage API in Google Cloud Console"** (dans Firebase Cloud Messaging)
2. OU va directement sur https://console.cloud.google.com/apis/library/fcm.googleapis.com?project=daka-news-android-notifs
3. Clique **ENABLE** (Activer) si ce n'est pas déjà fait
4. Attends 1-2 minutes que l'API soit active

### ÉTAPE 3: Vérifier ou re-télécharger google-services.json

1. Retourne sur Firebase Console → **Project Settings** (icône engrenage ⚙️)
2. Onglet **General**
3. Scroll vers le bas → Section **Your apps**
4. Trouve l'app **app.dakanews.com** (Android)
5. Clique **Download google-services.json** (bouton bleu)
6. **REMPLACE** le fichier dans:
   ```
   /Users/gabriel/Desktop/DAKA NEWS TERMINAL/mobile-v2/android/app/google-services.json
   ```

### ÉTAPE 4: Vérifier le contenu du fichier

Le fichier doit surtout contenir les bons identifiants Android :
```json
{
  "project_info": {
    "project_number": "745386523668",
    "project_id": "daka-news-android-notifs",
    "storage_bucket": "..."
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "...",
        "android_client_info": {
          "package_name": "app.dakanews.com"
        }
      },
      "oauth_client": [...],                 // Peut être vide
      "api_key": [{
        "current_key": "AIzaSy..."
      }],
      "services": {
        "appinvite_service": {...}
      }
    }
  ],
  "configuration_version": "1"
}
```

### ÉTAPE 5: Vérifier que l'app Android est bien configurée

Dans Firebase Console → Project Settings → Your apps:

**Vérifie que ces infos sont présentes:**
- ✅ Package name: `app.dakanews.com`
- ✅ SHA-1 (debug): `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- ✅ SHA-1 (production): `B3:0D:B6:CD:6B:65:BC:53:F5:10:AD:9C:54:2B:60:9A:1E:9C:35:83`

Si manquants, ajoute-les:
```bash
# SHA-1 Debug
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# SHA-1 Production (si tu as un keystore)
keytool -list -v -keystore /chemin/vers/ton/keystore.jks -alias ton_alias
```

---

## 🚨 SI L'ERREUR PERSISTE APRÈS REBUILD

Le souci n'est pas forcément le JSON lui-même. Il peut aussi venir de l'initialisation native Android ou du traitement Gradle. Si besoin, **recrée l'app Android Firebase** :

1. Firebase Console → Project Settings → Your apps
2. Clique **Add app** → Sélectionne **Android**
3. Package name: `app.dakanews.com`
4. App nickname: `DAKA News Android`
5. SHA-1: Colle celui de debug ET production
6. Clique **Register app**
7. Télécharge le nouveau `google-services.json`
8. **SKIP** les autres étapes (on a déjà tout configuré)

---

## ✅ APRÈS AVOIR REMPLACÉ LE FICHIER

```bash
cd "/Users/gabriel/Desktop/DAKA NEWS TERMINAL/mobile-v2"
eas build --platform android --profile production
```

Le nouveau Build 60 devrait avoir Firebase correctement initialisé.

---

## 📊 VÉRIFICATION FINALE

Après installation du Build 60:

```sql
SELECT stage, error 
FROM push_debug_logs 
WHERE platform = 'android' 
ORDER BY ts DESC 
LIMIT 10;
```

**Résultat attendu:**
- ✅ `waiting-firebase-init`
- ✅ `permission-response` (granted)
- ✅ `get-token-success` ← **LE PLUS IMPORTANT**
- ✅ `save-token-success`

**Si toujours `get-token-error`:**
- Ouvre le champ `error` et copie le message complet
- Ça nous dira exactement ce qui bloque encore
