# DAKA News Mobile - Configuration

## 📱 Setup Expo

Pour démarrer le projet :

```bash
cd mobile
npm start
```

Puis scanner le QR code avec **Expo Go** (iOS/Android).

---

## 🔑 Variables d'environnement

Créer un fichier `.env` dans `mobile/` avec tes clés Supabase :

```env
EXPO_PUBLIC_SUPABASE_URL=https://ton-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ta_cle_anon
```

(Récupère ces valeurs depuis ton dashboard Supabase)

---

## 🎨 Composants implémentés

### TopBar
- Logo DAKA
- Avatar avec initials (ou icône user si non connecté)
- Badge premium ⭐
- Menu déroulant : "Accès illimité" ou "Gérer abonnement" + Déconnexion

### Sidebar
- Header "Live" avec point vert animé
- Liste des sources groupées par pays
- Cadenas 🔒 sur sources premium
- Settings icon en footer

### NewsCard
- Focus/expand au clic (toggle)
- Border jaune 0.4px en focus
- Share button natif (iOS/Android)
- Texte source RTL pour hébreu
- Heure + badge source

### NewsColumn
- FlatList verticale avec articles
- Loading spinner

### AuthModal
- Tabs Login/Signup
- Reset password
- Inputs styled (dark3 background)
- CGU disclaimer

### PremiumModal
- 3 sources gratuites affichées
- Features Premium avec checkmarks
- Prix 9,99€/mois
- CTA "Devenir Premium" → Stripe checkout

### SettingsModal
- CGU/CGV (ouvre modal secondaire)
- Politique de Confidentialité
- Contactez-nous (mailto)

---

## 🔄 État actuel

✅ **Tous les composants UI créés**  
✅ **Architecture complète (services, contexts, types)**  
✅ **AuthContext avec Supabase**  
✅ **API Service connecté au backend Render**  
✅ **App.tsx intégré avec navigation et états**

---

## 🚀 Prochaines étapes

### 1. Tester sur Expo Go
- Ajouter tes clés Supabase dans `.env`
- Scanner le QR code
- Tester login, sources, focus news

### 2. Notifications Push
```bash
npm install expo-notifications
```
- Configurer dans `app.json`
- Créer endpoint backend `/notifications/subscribe`
- Tester notifications iOS/Android

### 3. Paiements Natifs (IAP)
```bash
npm install @stripe/stripe-react-native react-native-purchases
```
- Configurer RevenueCat
- Intégrer Apple In-App Purchase
- Intégrer Google Play Billing

### 4. Build Production
```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

---

## 📊 Différences avec la version Web

| Feature | Web | React Native |
|---------|-----|--------------|
| Layout | Flexbox CSS | Flexbox natif |
| Scroll | `overflow-y: auto` | `FlatList` optimisé |
| Modal | `<div>` overlay | `<Modal>` natif |
| Notifications | ❌ PWA limité | ✅ Push natives |
| Share | Web Share API | `Share.share()` natif |
| Paiements | Stripe Web | Stripe + IAP (Apple/Google) |
| Performance | Bon | **Excellent** (60fps natif) |

---

## 🎯 Ce qui reste 100% identique

- ✅ Backend Render (aucun changement)
- ✅ Supabase (tables, auth, RLS)
- ✅ API endpoints
- ✅ Stripe webhooks
- ✅ RSS collection + traduction OpenAI
- ✅ Logique métier

Seul le **frontend** change, tout le reste est réutilisé ! 🚀
