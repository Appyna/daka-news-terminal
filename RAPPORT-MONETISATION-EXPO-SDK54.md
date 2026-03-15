# RAPPORT - Solutions de Monétisation Publicitaire pour Expo SDK 54

**Date:** 15 mars 2026  
**Contexte:** Build 25 fonctionne, Builds 26-34 crashent avec react-native-google-mobile-ads v16.2.2

---

## 🔴 PROBLÈME IDENTIFIÉ

### Crash React-Native-Google-Mobile-Ads v16.2.2
- **Version actuelle:** `react-native-google-mobile-ads@16.2.2`
- **Expo SDK:** 54.0.33
- **React Native:** 0.81.5
- **Symptômes:** Crash systématique au lancement avec NSException, imageOffset 8818940
- **Location:** Background dispatch block
- **New Architecture:** DÉSACTIVÉE (confirmé)

### Analyse du Code Source
D'après le repo GitHub `invertase/react-native-google-mobile-ads`:
- La v16.2.2 est la **dernière version** (sortie le 10 mars 2026)
- Changelog v16.2.3 (13 mars 2026): "**guard nullable app event data to prevent crash**"
- La v16.x utilise Google Mobile Ads SDK iOS 13.1.0 et Android 25.0.0
- Issue #835 reportée: "Config plugin invalid with Expo SDK 54 / React Native 0.81"

---

## ✅ SOLUTIONS RECOMMANDÉES

### OPTION 1 (RECOMMANDÉE): Downgrade vers v15.8.3 ou v14.10.0

#### **Version 15.8.3** (Stable, 21 oct 2025)
```bash
npm install react-native-google-mobile-ads@15.8.3
```

**Avantages:**
- ✅ Compatible Expo SDK 54 (peerDep: `>=47.0.0`)
- ✅ Changelog propre sans crash reports récents
- ✅ Fix iOS: "fixed null responseIdentifier crash" (v15.8.2)
- ✅ SDK Natifs: iOS 12.x, Android 24.x (plus stables que 13.x/25.x)

**Configuration app.json:**
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-9184646133625988~9578008828",
          "iosAppId": "ca-app-pub-9184646133625988~9578008828"
        }
      ]
    ]
  }
}
```

#### **Version 14.10.0** (Alternative stable, 15 mars 2025)
```bash
npm install react-native-google-mobile-ads@14.10.0
```

**Avantages:**
- ✅ SDK Natifs: iOS 12.2.0, Android 24.1.0
- ✅ Plus mature, testé sur longue durée
- ✅ Compatible Expo >=47.0.0
- ✅ Pas de New Architecture required

---

### OPTION 2: Attendre le fix v16.2.4

La v16.2.3 (sortie il y a 2 jours) a tenté de fix un crash similaire:
> "guard nullable app event data to prevent crash"

**Risque:** La v16.x est trop récente et instable avec Expo SDK 54.

---

### OPTION 3: SDK Publicitaires Alternatifs

#### ❌ **Meta Audience Network (Facebook)**
- **Statut:** DÉPRÉCIÉ depuis juin 2024
- Meta a fermé son SDK publicitaire mobile
- **NE PAS UTILISER**

#### ⚠️ **Unity Ads**
- **Package:** `react-native-unity-ads` ou `expo-ads-admob` (déprécié)
- **Problème:** Pas de support officiel Expo SDK 54
- **Intégration:** Nécessite custom native modules
- **Verdict:** Non recommandé pour Expo managed workflow

#### 🟡 **AppLovin MAX**
```bash
npm install applovin-maximumize-react-native
```
- Nécessite config plugin Expo custom
- SDK complexe, learning curve importante
- **Verdict:** Overkill pour votre cas d'usage

#### 🟡 **IronSource**
- Nécessite bare workflow ou custom plugins
- Pas de support Expo managed officiel
- **Verdict:** Non recommandé

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### ÉTAPE 1: Downgrade vers v15.8.3
```bash
cd mobile-v2
npm uninstall react-native-google-mobile-ads
npm install react-native-google-mobile-ads@15.8.3
```

### ÉTAPE 2: Vérifier app.json
Votre configuration est correcte:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "android_app_id": "ca-app-pub-9184646133625988~9578008828",
          "ios_app_id": "ca-app-pub-9184646133625988~9578008828"
        }
      ]
    ]
  }
}
```

### ÉTAPE 3: Rebuild natif
```bash
# Clean builds
rm -rf ios/build android/app/build

# Rebuild iOS
npx expo prebuild --clean
eas build --platform ios --profile production

# Test en local d'abord
eas build --platform ios --profile development --local
```

### ÉTAPE 4: Tester la stabilité
- Vérifier que l'app démarre sans crash
- Tester l'affichage des bannières publicitaires
- Vérifier les logs Sentry

---

## 📊 COMPARAISON DES VERSIONS

| Version | SDK iOS | SDK Android | Expo Compat | Stabilité | Recommandation |
|---------|---------|-------------|-------------|-----------|----------------|
| **15.8.3** | 12.x | 24.x | ✅ SDK 54 | 🟢 Haute | ⭐ **OUI** |
| **14.10.0** | 12.2.0 | 24.1.0 | ✅ SDK 54 | 🟢 Très haute | ✅ Alternative |
| **16.2.2** | 13.1.0 | 25.0.0 | ⚠️ Instable | 🔴 Crash | ❌ NON |
| **16.2.3** | 13.1.0 | 25.0.0 | ⚠️ À tester | 🟡 Récent | ⏳ Attendre |

---

## 🔍 PREUVES DE COMPATIBILITÉ

### react-native-google-mobile-ads v15.8.3
- **Peer Dependencies:** `expo: >=47.0.0` ✅
- **Changelog:** Pas de crash reports entre v15.5.0 et v15.8.3
- **Issues GitHub:** Issue #835 concerne uniquement v16.x avec Expo SDK 54
- **Native SDKs:**
  - iOS: Google-Mobile-Ads-SDK 12.x (stable)
  - Android: play-services-ads 24.x (stable)

### Évidence du problème v16.x
```
Issue #835: "Config plugin invalid 'Unexpected token typeof' with Expo SDK 54 / React Native 0.81"
Status: Open, reported Feb 9 2026
Version affected: v16.x
```

---

## ⚠️ POINTS D'ATTENTION

1. **Ne pas utiliser v16.x** avant que le fix soit confirmé par la communauté
2. **Tester en local** avant de soumettre à l'App Store
3. **Monitorer Sentry** après déploiement
4. **Initialisation retardée:** Votre code avec `setTimeout(3000)` est une bonne pratique

---

## 🚀 COMMANDES D'INSTALLATION

### Installation v15.8.3 (RECOMMANDÉE)
```bash
cd /Users/gabriel/Desktop/DAKA\ NEWS\ TERMINAL/mobile-v2
npm uninstall react-native-google-mobile-ads
npm install react-native-google-mobile-ads@15.8.3
npx expo prebuild --clean
eas build --platform ios --profile production
```

### Alternative v14.10.0
```bash
npm install react-native-google-mobile-ads@14.10.0
```

---

## 📝 CONFIGURATION MINIMALE REQUISE

Votre [App.tsx](mobile-v2/App.tsx) actuel est correct:
```typescript
useEffect(() => {
  const initAds = async () => {
    try {
      await requestTrackingPermissionsAsync();
      
      // IMPORTANT: Delay pour éviter les crashes
      setTimeout(async () => {
        await MobileAds().initialize();
      }, 3000);
    } catch (error) {
      console.error('AdMob init error:', error);
    }
  };
  initAds();
}, []);
```

**Ne pas modifier cette initialisation**, elle protège contre les crashes.

---

## ✅ CONCLUSION

**SOLUTION RETENUE:** react-native-google-mobile-ads@**15.8.3**

**Justification:**
- Compatible Expo SDK 54 ✅
- Stable (pas de crash reports) ✅
- SDK natifs éprouvés (iOS 12.x, Android 24.x) ✅
- Fix du crash "null responseIdentifier" inclus ✅
- Communauté active ✅

**Alternatives publicitaires non viables:**
- Meta Audience Network: FERMÉ ❌
- Unity Ads: Pas de support Expo ❌
- AppLovin/IronSource: Trop complexe ❌

**Prochaine étape:** Downgrade vers v15.8.3 et rebuild.
