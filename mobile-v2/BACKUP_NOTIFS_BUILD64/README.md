# Backup - Fonctionnalité Notifications Push (Build 64)

**Date:** 18 mars 2026  
**Raison:** Retrait temporaire des notifications pour build production propre (Build 65)

## Fichiers sauvegardés

### Code React Native
- `App.tsx.backup` - Version avec enregistrement notifications (lignes 149-232 supprimées)
- `notificationService.ts` - Service complet de gestion des notifications

### Code Android
- `FirebaseInitProvider.kt` - ContentProvider pour initialisation Firebase (supprimé)
- `AndroidManifest.xml.backup` - Manifest avec permissions et services Firebase
- `MainApplication.kt` - (import Firebase retiré)

## Changements effectués pour Build 65

### App.tsx
**Retiré:**
- Import de `registerForPushNotifications`, `addNotificationReceivedListener`, `addNotificationResponseReceivedListener`
- Import de `Constants` (expo-constants)
- Import de `supabase` (gardé seulement pour gestion abonnements premium)
- useEffect complet d'enregistrement des notifications (lignes 149-232)

**Conservé:**
- Tout le reste: AdMob, IAP, ATT, Amplitude, gestion premium, etc.

### AndroidManifest.xml
**Retiré:**
- `<uses-permission android:name="com.google.android.c2dm.permission.RECEIVE"/>`
- `<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>`
- `<uses-permission android:name="android.permission.WAKE_LOCK"/>`
- `<provider>` FirebaseInitProvider
- `<service>` FirebaseMessagingService
- Toutes les meta-data Firebase et expo-notifications

**Conservé:**
- Permissions de base (Internet, Network, Storage, etc.)
- AD_ID permission (pour AdMob)
- Meta-data AdMob

### MainApplication.kt
**Retiré:**
- `import com.google.firebase.FirebaseApp`
- `import com.google.firebase.FirebaseOptions`

### Fichiers supprimés
- `FirebaseInitProvider.kt` (complètement retiré)

## Pour réactiver les notifications (version future)

1. Restaurer `FirebaseInitProvider.kt` dans `android/app/src/main/java/app/dakanews/com/`
2. Restaurer les modifications dans `AndroidManifest.xml` (voir backup)
3. Restaurer les imports et useEffect dans `App.tsx` (voir backup lignes 149-232)
4. Ré-ajouter les imports Firebase dans `MainApplication.kt`
5. Incrémenter le versionCode
6. Tester sur device

## État de développement

**Problème rencontré:**
- Firebase ne s'initialisait jamais malgré 64 builds
- Erreur persistante: "Default FirebaseApp is not initialized in this process"
- Tentatives: onCreate(), attachBaseContext(), ContentProvider, config manuelle/automatique
- Supabase logs confirmaient 100% d'échec

**Solutions tentées:**
- Build 40-59: Init dans onCreate() avec config manuelle
- Build 60-61: Init dans attachBaseContext()
- Build 62: ContentProvider avec config manuelle
- Build 63-64: ContentProvider avec config automatique + lecture ressources

**Décision:** Mise de côté pour release production propre sans bugs

## Build 65 - Version Production

- ✅ AdMob v12.6.0 fonctionnel
- ✅ IAP (Apple + Stripe) fonctionnel
- ✅ ATT (App Tracking Transparency) fonctionnel
- ✅ Amplitude Analytics fonctionnel
- ✅ Toutes sources gratuites disponibles
- ✅ Système d'abonnement premium complet
- ❌ Notifications push désactivées (temporairement)

**Aucun code notifications = Aucun bug notifications**
