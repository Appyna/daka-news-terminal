# 📱 SAUVEGARDE APP MOBILE V1 - NE PAS TOUCHER

**Date de sauvegarde** : 15 février 2026  
**Raison** : Repartir proprement sur v2 en gardant design et logique v1

---

## 🎨 DESIGN V1 (À reprendre à 100%)

### Couleurs (COLORS - constants.ts)
```typescript
export const COLORS = {
  dark1: '#0A0918',      // Background principal
  dark2: '#12102B',      // Background secondaire
  dark3: '#1C1940',      // Background cards
  accentYellow1: '#F5C518',  // Jaune principal
  accentYellow2: '#FFD700',  // Jaune secondaire
  white: '#FFFFFF',
};
```

### Composants UI v1

#### 1. NewsCard.tsx
**Features** :
- Focus/expand au clic avec haptic feedback
- Border jaune 0.4px en mode focus
- Header : time (HH:MM) + badge source
- Titre : font-bold, 3 lignes max si pas focus
- Texte source (title_original) : Affiché si focus + pays != France + direction RTL si Israel
- Boutons action (si focus) :
  - "Voir l'article d'origine" (bouton jaune primaire avec icône externe)
  - "Partager" (bouton secondaire avec icône share)
- Haptics : Medium au clic card, Light au clic boutons

**Styles précis** :
```typescript
card: {
  padding: 14px,
  borderBottom: 0.5px rgba(255,255,255,0.05)
}
cardFocused: {
  padding: 14px horizontal, 24px vertical
  shadowColor: COLORS.accentYellow1
  shadowOpacity: 1
  shadowRadius: 0.4
}
title: {
  fontSize: 14,
  fontWeight: '700',
  color: COLORS.white
}
titleFocused: {
  color: COLORS.accentYellow1
}
```

#### 2. TopBar.tsx
**Features** :
- Logo DAKA à gauche
- Avatar/Bulle profil à droite avec :
  - Initials user (2 premières lettres uppercase) si connecté
  - Icône user si non connecté
  - Badge ⭐ Premium juste au-dessus si isPremium
- Menu déroulant au clic :
  - "Accès illimité Premium" (si premium) → Ouvre SettingsModal
  - "Gérer mon abonnement" (si premium) → Ouvre portail Stripe/IAP
  - "Déconnexion" → signOut()

**Styles précis** :
```typescript
container: {
  height: 60px,
  backgroundColor: COLORS.dark2,
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingHorizontal: 16px
}
avatar: {
  width: 36px,
  height: 36px,
  borderRadius: 18px,
  backgroundColor: COLORS.dark3
}
premiumBadge: {
  position: 'absolute',
  top: -8,
  right: -8,
  fontSize: 16
}
```

#### 3. Sidebar.tsx
**Features** :
- Header "Live" avec point vert animé (pulse)
- Liste sources groupées par pays (Israel, France, Monde)
- Chaque source :
  - Nom
  - Cadenas 🔒 si !free_tier && !isPremium
  - Clic → onSelectSource(country, source)
  - Si locked → Ouvre PremiumModal
- Footer : Icône settings → Ouvre SettingsModal

**Styles précis** :
```typescript
container: {
  width: 280px,
  backgroundColor: COLORS.dark2
}
liveHeader: {
  padding: 16px,
  borderBottom: 1px rgba(255,255,255,0.1)
}
liveDot: {
  width: 8px,
  height: 8px,
  borderRadius: 4px,
  backgroundColor: '#00FF00',
  animation: pulse 2s infinite
}
sourceItem: {
  padding: 12px 16px,
  flexDirection: 'row',
  justifyContent: 'space-between'
}
```

#### 4. NewsColumn.tsx
**Features** :
- FlatList verticale avec articles
- Props : articles[], onArticlePress
- Loading spinner si loading
- EmptyState si pas d'articles

#### 5. AuthModal.tsx
**Features** :
- Modal fullscreen
- Tabs : Login / Signup
- Mode reset password si demandé
- Inputs styled (dark3 background, white text)
- Button CTA jaune
- Disclaimer CGU en bas

**Champs** :
- Login : email, password
- Signup : username (min 3 char), email, password, confirmPassword
- Reset : email

#### 6. PremiumModal.tsx
**Features** :
- Titre "Accès Illimité Premium"
- 3 sources gratuites affichées (Ynet, France Info, Reuters)
- Liste features Premium avec checkmarks :
  - "Accès à toutes les sources"
  - "Notifications push exclusives"
  - "Sans publicité"
  - "Support prioritaire"
- Prix : 9,99€/mois (récupéré depuis IAP si possible)
- Button CTA "Devenir Premium" → Lance IAP ou Stripe
- Disclaimer "Renouvelé automatiquement"

#### 7. SettingsModal.tsx
**Features** :
- Titre "Paramètres"
- Options :
  - "CGU & CGV" → Ouvre modal secondaire avec texte CGU
  - "Politique de Confidentialité" → Ouvre modal secondaire avec texte
  - "Contactez-nous" → mailto:dakanewsapp@gmail.com

#### 8. Logo.tsx
**Features** :
- Logo "DAKA" stylé
- Font : Inter-Bold
- Couleur : COLORS.accentYellow1

---

## 🔧 LOGIQUE MÉTIER V1 (À reprendre)

### Auth (AuthContext.tsx)
**Flow** :
```typescript
const { user, profile, isPremium, signUp, signIn, signOut } = useAuth();

// isPremium : CORRECT dans site web, BUGUÉ dans v1
// Site web (correct) :
const isPremium = profile?.is_premium && 
  (!profile.premium_until || new Date(profile.premium_until) > new Date());

// V1 mobile (BUGGÉ) :
const isPremium = profile?.subscription_tier === 'PREMIUM';  // ❌ Champ n'existe pas
```

**À corriger** : Utiliser `is_premium` + `premium_until` (même logique que site web)

### API Service (apiService.ts)
**Endpoints** :
```typescript
const API_BASE_URL = 'https://api.dakanews.com/api';

GET /api/news → Tous les articles (filtrés 24h côté backend)
GET /api/sources → Toutes les sources avec free_tier
```

**Bug v1** : URL était `http://localhost:4000` → À corriger

### Notifications (notificationService.ts + Backend)
**System complet v1** :
1. App demande permission : `Notifications.getExpoPushTokenAsync()`
2. App enregistre token : 
   ```typescript
   await supabase.from('user_push_tokens').upsert({
     device_id: Constants.installationId,
     push_token: token,
     user_id: user?.id || null
   });
   ```
3. Backend envoie notifs :
   ```sql
   SELECT send_push_notification(
     'DAKA News', 
     'Titre article', 
     NULL::UUID[]  -- NULL = tous
   );
   ```
4. Edge Function Supabase (`send-push-notification`) :
   - Batching 100 messages max
   - Appel Expo Push API
   - Gestion erreurs

**Infrastructure v1** :
- ✅ Table `user_push_tokens` existe
- ✅ Fonction SQL `send_push_notification()` déployée
- ✅ Edge Function Supabase déployée
- ✅ Code mobile qui enregistre le token

**À garder** : TOUT ce système fonctionne, ne rien changer

### IAP (IAPService.ts)
**Product IDs v1** :
```typescript
const PRODUCT_IDS = {
  ios: 'com.dakanews.premium.monthly',
  android: 'premium_monthly'
};
```

**Flow v1** :
1. User clic "Devenir Premium"
2. `iapService.purchasePremium(userId)`
3. Apple/Google affiche modal paiement natif
4. Purchase success → Envoyer receipt au backend
5. Backend valide avec Apple/Google
6. Backend active Premium dans Supabase
7. Webhook Apple/Google pour renouvellements

**Webhooks backend v1** :
- `backend/src/routes/apple-webhooks.ts` → Reçoit notifs Apple Server-to-Server v2
- `backend/src/routes/google-webhooks.ts` → Reçoit notifs Google Pub/Sub

**À corriger** : Code IAP non testé, besoin sandbox tests

### Sources Free vs Premium
**Logique v1** :
```typescript
// constants.ts
const FREE_SOURCES = ['Ynet', 'France Info', 'Reuters'];

// Dans Sidebar
if (!source.free_tier && !isPremium) {
  // Afficher cadenas 🔒
  // Bloquer le clic
  // Ouvrir PremiumModal si clic
}
```

**À garder** : Cette logique fonctionne

---

## 📦 DÉPENDANCES V1 (package.json)

```json
{
  "dependencies": {
    "expo": "~54.0.33",                    // ❌ Beta, à downgrade vers ~52.0.0
    "react": "19.1.0",                      // ❌ Trop récent, à downgrade vers 18.3.1
    "react-native": "0.81.5",               // ❌ Inexistant, à corriger vers 0.76.5
    "expo-notifications": "^0.32.16",       // ✅ OK
    "expo-haptics": "^15.0.8",              // ✅ OK
    "expo-constants": "^18.0.13",           // ✅ OK
    "react-native-iap": "^14.7.8",          // ✅ OK
    "@supabase/supabase-js": "^2.94.1",     // ✅ OK
    "@react-native-async-storage/async-storage": "^2.2.0",  // ✅ OK
    "react-native-safe-area-context": "^5.6.2",  // ✅ OK
    "react-native-svg": "^15.12.1"          // ✅ OK
  }
}
```

---

## 🗂️ STRUCTURE FICHIERS V1

```
mobile/
├── App.tsx                    ✅ Structure OK, à nettoyer
├── app.json                   ✅ Config Expo OK
├── package.json               ⚠️ Versions à corriger
├── tsconfig.json              ✅ OK
├── babel.config.js            ✅ OK
├── eas.json                   ✅ Config EAS Build OK
├── src/
│   ├── constants.ts           ✅ COLORS + FREE_SOURCES OK
│   ├── types.ts               ✅ Interfaces OK
│   ├── contexts/
│   │   └── AuthContext.tsx    ⚠️ Bug isPremium à corriger
│   ├── services/
│   │   ├── apiService.ts      ⚠️ URL localhost à corriger
│   │   ├── IAPService.ts      ⚠️ À réécrire proprement
│   │   ├── notificationService.ts  ✅ OK, à garder
│   │   └── supabaseClient.ts  ✅ OK
│   └── components/
│       ├── TopBar.tsx         ✅ Design parfait, à garder
│       ├── Sidebar.tsx        ✅ Design parfait, à garder
│       ├── NewsCard.tsx       ✅ Design parfait, à garder
│       ├── NewsColumn.tsx     ✅ OK, à garder
│       ├── AuthModal.tsx      ✅ Design parfait, à garder
│       ├── PremiumModal.tsx   ✅ Design parfait, à garder
│       ├── SettingsModal.tsx  ✅ OK, à garder
│       ├── Logo.tsx           ✅ OK, à garder
│       ├── TopBar.old.tsx     ❌ À supprimer
│       └── NewsColumn.old.tsx ❌ À supprimer
```

---

## ✅ CE QUI MARCHE DÉJÀ (À garder tel quel)

1. ✅ **Design complet** : Tous les composants UI codés et stylés
2. ✅ **Système notifications** : Table + Fonction SQL + Edge Function + Code mobile
3. ✅ **Enregistrement push token** : Code fonctionnel
4. ✅ **Couleurs** : COLORS définies
5. ✅ **Types TypeScript** : Interfaces Article, Source, etc.
6. ✅ **Logo** : Component Logo.tsx
7. ✅ **Haptics** : Intégré dans NewsCard et boutons
8. ✅ **Share natif** : Fonctionnel dans NewsCard
9. ✅ **RTL hébreu** : Géré dans NewsCard pour texte source

---

## ❌ CE QUI EST BUGGÉ (À corriger en v2)

1. ❌ **isPremium** : Utilise `subscription_tier` au lieu de `is_premium`
2. ❌ **API URL** : Pointe vers localhost au lieu de prod
3. ❌ **Versions** : Expo/React/RN incohérentes
4. ❌ **IAPService** : Code non testé, besoin refonte
5. ❌ **Fichiers .old** : À supprimer

---

## 🎯 PLAN V2 (Repartir proprement)

### Phase 1: Setup propre
- Créer nouveau projet Expo avec versions stables
- Copier TOUS les composants UI (design identique)
- Copier constants.ts, types.ts

### Phase 2: Services
- Réécrire AuthContext avec bonne logique isPremium
- Réécrire apiService avec bonne URL
- Copier notificationService tel quel
- Réécrire IAPService proprement

### Phase 3: Tests
- Compiler et tester sur simulateur
- Tester chaque feature
- Corriger les bugs

### Phase 4: IAP + Stores
- Configurer Apple/Google stores
- Tester IAP en sandbox
- Soumettre TestFlight + Internal Testing

---

**FIN DE LA SAUVEGARDE V1 - NE PAS MODIFIER CE FICHIER**
