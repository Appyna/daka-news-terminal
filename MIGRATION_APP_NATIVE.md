# 📱 Migration vers Apps Natives - Guide Complet

**Date de création :** 3 février 2026  
**Statut :** ✅ Backend 100% prêt | ⏳ Frontend à adapter

---

## 🎯 Architecture Actuelle (Web)

### ✅ Ce qui est prêt et compatible
- **Supabase Auth** : Fonctionne identiquement sur tous les supports
- **Base de données** : PostgreSQL avec RLS (Row Level Security)
- **Tables** : `profiles`, `user_preferences`, `user_bookmarks`, `subscriptions`
- **Triggers** : Création automatique profil + préférences
- **Email Templates** : HTML avec branding DAKA (blanc/jaune/violet)
- **SMTP** : Gmail configuré (sender: DAKA News)
- **Sessions** : JWT avec auto-refresh

### 📦 Stack Technique Web
- **Frontend** : React 19.2.3 + TypeScript + Vite 6.2.0
- **Auth** : Supabase Auth avec OTP (6 chiffres) + Magic Link
- **Context** : `AuthContext.tsx` (gestion globale état auth)
- **Components** : `TopBar.tsx`, `AuthModal.tsx`
- **Storage** : `sessionStorage` pour tokens temporaires

---

## 🚀 Migration React Native (Recommandée)

### Avantages
- ✅ **70-80% code réutilisable** (logique métier, AuthContext)
- ✅ Une seule codebase pour iOS + Android
- ✅ Équipe React déjà formée
- ✅ Temps de développement réduit

### Modifications Nécessaires

#### 1. **Dépendances à installer**
```bash
npm install @supabase/supabase-js
npm install @react-native-async-storage/async-storage
npm install react-native-url-polyfill
```

#### 2. **Deep Links Configuration**

**iOS (Info.plist) :**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>dakanews</string>
    </array>
  </dict>
</array>
```

**Android (AndroidManifest.xml) :**
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="dakanews" android:host="reset-password" />
</intent-filter>
```

**Supabase Dashboard :**
- Ajouter `dakanews://reset-password` dans Authentication > URL Configuration > Redirect URLs

#### 3. **Code à Adapter**

**AuthContext.tsx - Remplacer `sessionStorage` par `AsyncStorage` :**
```typescript
// AVANT (Web)
sessionStorage.setItem('supabase_recovery_access_token', token);

// APRÈS (React Native)
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('supabase_recovery_access_token', token);
```

**main.tsx - Adapter la capture du hash :**
```typescript
// React Native : Utiliser Linking pour capturer le deep link
import { Linking } from 'react-native';

Linking.addEventListener('url', async (event) => {
  const url = event.url;
  const params = new URLSearchParams(url.split('?')[1]);
  const accessToken = params.get('access_token');
  const type = params.get('type');
  
  if (type === 'recovery' && accessToken) {
    await AsyncStorage.setItem('supabase_recovery_access_token', accessToken);
    await AsyncStorage.setItem('supabase_password_recovery', 'true');
  }
});
```

**resetPassword() - Détecter la plateforme :**
```typescript
import { Platform } from 'react-native';

async function resetPassword(email: string) {
  const redirectUrl = Platform.OS === 'web' 
    ? 'https://dakanews.com'
    : 'dakanews://reset-password';
    
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  return { error };
}
```

#### 4. **UI Components à Recréer**

**TopBar.tsx → Créer `TopBar.native.tsx` :**
```typescript
import { View, TouchableOpacity, Text } from 'react-native';
// Remplacer tous les <div>, <button> par composants React Native
```

**AuthModal.tsx → Créer `AuthModal.native.tsx` :**
```typescript
import { Modal, View, TextInput, TouchableOpacity } from 'react-native';
// Remplacer les inputs HTML par TextInput React Native
```

#### 5. **Checklist React Native**
- [ ] Installer les dépendances
- [ ] Configurer deep links iOS/Android
- [ ] Ajouter `dakanews://reset-password` dans Supabase Dashboard
- [ ] Adapter AuthContext : sessionStorage → AsyncStorage
- [ ] Recréer TopBar avec composants React Native
- [ ] Recréer AuthModal avec composants React Native
- [ ] Tester signup → OTP → vérification
- [ ] Tester login avec email/password
- [ ] Tester mot de passe oublié → email → deep link → reset
- [ ] Tester persistance session (fermer/rouvrir app)

---

## 📱 Migration iOS Native (Swift/SwiftUI)

### Avantages
- ✅ Performances optimales
- ✅ Accès complet APIs iOS natives
- ✅ UI/UX natif iOS

### Stack Technique
- **SDK** : `supabase-swift` via Swift Package Manager
- **UI** : SwiftUI
- **Architecture** : MVVM (ViewModel + View)
- **Storage** : Keychain pour tokens sensibles

### Configuration

**1. Installer supabase-swift :**
```swift
// Package.swift
dependencies: [
    .package(url: "https://github.com/supabase-community/supabase-swift", from: "2.0.0")
]
```

**2. Configurer Universal Links (Xcode) :**
- Signing & Capabilities → Associated Domains
- Ajouter `applinks:dakanews.com` (production)
- Configurer `.well-known/apple-app-site-association` sur le domaine

**3. AuthViewModel.swift (équivalent AuthContext) :**
```swift
import Supabase

class AuthViewModel: ObservableObject {
    let supabase = SupabaseClient(
        supabaseURL: URL(string: "https://wzqhrothppyktowwllkr.supabase.co")!,
        supabaseKey: "votre_anon_key"
    )
    
    @Published var user: User?
    @Published var session: Session?
    
    func resetPassword(email: String) async throws {
        try await supabase.auth.resetPasswordForEmail(
            email,
            redirectTo: URL(string: "dakanews://reset-password")
        )
    }
    
    func updatePassword(newPassword: String) async throws {
        try await supabase.auth.update(user: UserAttributes(password: newPassword))
    }
}
```

**4. Gérer les deep links (App.swift) :**
```swift
@main
struct DakaNewsApp: App {
    @StateObject var authVM = AuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authVM)
                .onOpenURL { url in
                    handleDeepLink(url)
                }
        }
    }
    
    func handleDeepLink(_ url: URL) {
        guard url.scheme == "dakanews",
              url.host == "reset-password" else { return }
        
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        if let accessToken = components?.queryItems?.first(where: { $0.name == "access_token" })?.value {
            // Restaurer la session
            Task {
                try? await authVM.supabase.auth.setSession(accessToken: accessToken, refreshToken: "")
                // Afficher l'écran de reset password
            }
        }
    }
}
```

---

## 🤖 Migration Android Native (Kotlin/Jetpack Compose)

### Stack Technique
- **SDK** : `supabase-kt` (Ktor-based)
- **UI** : Jetpack Compose
- **Architecture** : MVVM (ViewModel + Composables)
- **Storage** : EncryptedSharedPreferences

### Configuration

**1. build.gradle.kts :**
```kotlin
dependencies {
    implementation("io.github.jan-tennert.supabase:postgrest-kt:2.0.0")
    implementation("io.github.jan-tennert.supabase:gotrue-kt:2.0.0")
}
```

**2. AndroidManifest.xml - Intent Filters :**
```xml
<activity android:name=".MainActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data 
            android:scheme="dakanews" 
            android:host="reset-password" />
    </intent-filter>
</activity>
```

**3. AuthViewModel.kt :**
```kotlin
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth

class AuthViewModel : ViewModel() {
    private val supabase = createSupabaseClient(
        supabaseUrl = "https://wzqhrothppyktowwllkr.supabase.co",
        supabaseKey = "votre_anon_key"
    ) {
        install(Auth)
    }
    
    suspend fun resetPassword(email: String) {
        supabase.auth.resetPasswordForEmail(
            email = email,
            redirectUrl = "dakanews://reset-password"
        )
    }
    
    suspend fun updatePassword(newPassword: String) {
        supabase.auth.updateUser {
            password = newPassword
        }
    }
}
```

---

## 📋 Checklist Globale Migration Apps Natives

### Configuration Supabase (une seule fois)
- [ ] Ajouter `dakanews://reset-password` dans Redirect URLs
- [ ] Vérifier que les templates email sont appliqués
- [ ] Tester l'envoi d'email depuis Supabase Dashboard

### React Native
- [ ] Setup projet React Native (Expo ou bare)
- [ ] Installer dépendances Supabase + AsyncStorage
- [ ] Configurer deep links iOS + Android
- [ ] Adapter AuthContext (sessionStorage → AsyncStorage)
- [ ] Recréer UI avec React Native components
- [ ] Tests complets du flux auth

### iOS Native (optionnel)
- [ ] Setup projet SwiftUI
- [ ] Installer supabase-swift via SPM
- [ ] Configurer Universal Links
- [ ] Créer AuthViewModel
- [ ] Créer vues SwiftUI
- [ ] Gérer deep links avec onOpenURL

### Android Native (optionnel)
- [ ] Setup projet Jetpack Compose
- [ ] Installer supabase-kt
- [ ] Configurer Intent Filters
- [ ] Créer AuthViewModel
- [ ] Créer Composables UI
- [ ] Gérer deep links avec Intent.getData()

---

## 🔑 Points Critiques à Ne Pas Oublier

### 1. **Tokens temporaires (Password Recovery)**
- Web : `sessionStorage` (volatil, disparaît à la fermeture onglet)
- React Native : `AsyncStorage` (persiste)
- iOS : `Keychain` (sécurisé)
- Android : `EncryptedSharedPreferences` (sécurisé)

### 2. **Deep Links vs Universal Links**
- **Deep Links** (`dakanews://`) : Ouvre directement l'app si installée
- **Universal Links** (`https://dakanews.com/reset-password`) : Ouvre l'app OU le site web
- **Recommandation** : Supporter les deux

### 3. **Gestion des Erreurs**
Tous les messages d'erreur actuels sont déjà en français :
- ✅ "Le nouveau mot de passe doit être différent de l'ancien"
- ✅ "Le lien de réinitialisation a expiré"
- ✅ "Code expiré ou invalide"
→ Réutilisables tel quel sur mobile

### 4. **Templates Email**
Les templates HTML actuels (`email-template-signup.html`, `email-template-reset-password.html`) fonctionnent sur **tous les clients email** (iOS Mail, Gmail Android, Outlook, etc.)
→ Aucune modification nécessaire

---

## 🎯 Recommandation Finale

**Phase 1 : React Native (2-3 semaines)**
- Réutiliser 70% du code existant
- App iOS + Android en une seule codebase
- Time-to-market rapide

**Phase 2 (optionnel) : Apps Natives (1-2 mois par plateforme)**
- Si besoin de performances extrêmes
- Si besoin d'APIs natives spécifiques
- Meilleur UX natif

**Conseil :** Commencer par React Native, puis optimiser en natif si nécessaire.

---

## 📞 Support

**Documentation officielle :**
- Supabase Auth : https://supabase.com/docs/guides/auth
- React Native : https://reactnative.dev/docs/linking
- supabase-swift : https://github.com/supabase-community/supabase-swift
- supabase-kt : https://github.com/supabase-community/supabase-kt

**Status actuel :** ✅ Backend 100% prêt, adapté pour web + mobile
