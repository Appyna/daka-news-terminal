# 🎯 DUAL SYSTEM - Configuration Multi-Plateforme

Ce guide explique comment configurer les 3 systèmes de paiement pour DAKA News Terminal.

## 📊 Vue d'ensemble

| Plateforme | Prix | Vous gardez | Commission | Gestion |
|------------|------|-------------|------------|---------|
| **Site Web** | 4,99€/mois | 96% (4,79€) | Stripe 4% | Stripe Portal |
| **App iOS** | 4,99€/mois | 70% (3,49€) | Apple 30% | Réglages iOS |
| **App Android** | 4,99€/mois | 70% (3,49€) | Google 30% | Play Store |

**Base de données unifiée** : Les 3 sources mettent à jour `is_premium=true` dans Supabase.

---

## 🔵 1. Stripe (Site Web) - ✅ DÉJÀ CONFIGURÉ

### Configuration actuelle :

- ✅ Routes backend : `/api/stripe/create-checkout-session`, `/api/stripe/create-portal-session`
- ✅ Webhook : `/api/webhooks/stripe`
- ✅ Frontend : `PremiumModal`, `stripeService`, bouton TopBar
- ✅ Price ID : `price_1SwktzRqIDzuYjIqDyZLPgWE`
- ✅ Mode : TEST (à passer en PRODUCTION après validation)

### Pour passer en PRODUCTION :

1. Remplacer les clés TEST par les clés LIVE dans Render
2. Créer un nouveau webhook en mode LIVE sur Stripe Dashboard
3. Mettre à jour `STRIPE_WEBHOOK_SECRET` avec le nouveau secret
4. Changer le Price ID si besoin

---

## 🍎 2. Apple In-App Purchase (iOS)

### Étape 1 : Configuration App Store Connect

1. **Créer l'app sur App Store Connect** :
   - https://appstoreconnect.apple.com
   - Onglet "My Apps" → Créer une nouvelle app
   - Bundle ID : `com.dakanews.terminal` (ou similaire)

2. **Configurer les In-App Purchases** :
   - Onglet "Features" → In-App Purchases
   - Créer un **Auto-Renewable Subscription**
   - Reference Name : `DAKA News Premium Monthly`
   - Product ID : `com.dakanews.premium.monthly`
   - Prix : 4,99€
   - Durée : 1 mois

3. **Configurer les Server Notifications V2** :
   - Onglet "General" → App Information
   - Server Notifications : Ajouter l'URL du webhook
   - URL : `https://votre-backend.onrender.com/api/webhooks/apple`
   - Version : **Version 2** (important)

### Étape 2 : Code React Native (dans votre app iOS)

```typescript
import * as InAppPurchases from 'expo-in-app-purchases';

// 1. Acheter l'abonnement
async function buyPremiumiOS(userId: string) {
  try {
    await InAppPurchases.connectAsync();
    
    const products = await InAppPurchases.getProductsAsync(['com.dakanews.premium.monthly']);
    const product = products.results[0];
    
    // Acheter
    await InAppPurchases.purchaseItemAsync(product.productId);
    
    // Récupérer la transaction
    const purchases = await InAppPurchases.getPurchaseHistoryAsync();
    const latestPurchase = purchases.results[0];
    
    // 🔴 IMPORTANT : Enregistrer dans Supabase AVANT que le webhook arrive
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      platform: 'apple',
      apple_original_transaction_id: latestPurchase.originalTransactionIdentifier,
      apple_transaction_id: latestPurchase.transactionIdentifier,
      apple_product_id: product.productId,
      status: 'pending', // Sera mis à jour par le webhook
    });
    
    // Le webhook Apple va recevoir la notification et activer Premium
    
  } catch (error) {
    console.error('Erreur achat iOS:', error);
  }
}
```

### Étape 3 : Installation des dépendances backend

```bash
cd backend
npm install jsonwebtoken jwks-rsa
npm install --save-dev @types/jsonwebtoken @types/jwks-rsa
```

### Étape 4 : Test en Sandbox

- Créer un compte test dans App Store Connect (Users and Access → Sandbox Testers)
- Se connecter avec ce compte sur l'iPhone de test (Réglages → App Store → Sandbox Account)
- Faire un achat test (carte bancaire non débitée)

### Flux Apple :

1. User achète dans l'app iOS
2. App enregistre dans Supabase (`apple_original_transaction_id`)
3. Apple envoie webhook `INITIAL_BUY` ou `DID_RENEW`
4. Backend active Premium avec `activate_premium()`
5. User reçoit le badge Premium partout (web + apps)

---

## 🤖 3. Google Play In-App Purchase (Android)

### Étape 1 : Configuration Google Play Console

1. **Créer l'app sur Google Play Console** :
   - https://play.google.com/console
   - Créer une application
   - Package name : `com.dakanews.terminal`

2. **Configurer les abonnements** :
   - Onglet "Monétisation" → Produits → Abonnements
   - Créer un abonnement
   - Product ID : `premium_monthly`
   - Prix : 4,99€
   - Période de facturation : Mensuelle

3. **Configurer Google Cloud Pub/Sub** :
   - Aller sur https://console.cloud.google.com
   - Activer **Google Play Developer API**
   - Créer un **Topic Pub/Sub** : `play-subscriptions`
   - Créer une **Subscription** : `play-sub-webhook`
   - Endpoint : `https://votre-backend.onrender.com/api/webhooks/google`

4. **Configurer les Real-Time Developer Notifications** :
   - Retour sur Play Console
   - Monétisation → Real-time developer notifications
   - Topic name : `projects/YOUR_PROJECT_ID/topics/play-subscriptions`

### Étape 2 : Code React Native (dans votre app Android)

```typescript
import * as InAppPurchases from 'expo-in-app-purchases';

// 1. Acheter l'abonnement
async function buyPremiumAndroid(userId: string) {
  try {
    await InAppPurchases.connectAsync();
    
    const products = await InAppPurchases.getProductsAsync(['premium_monthly']);
    const product = products.results[0];
    
    // Acheter
    await InAppPurchases.purchaseItemAsync(product.productId);
    
    // Récupérer la transaction
    const purchases = await InAppPurchases.getPurchaseHistoryAsync();
    const latestPurchase = purchases.results[0];
    
    // 🔴 IMPORTANT : Enregistrer dans Supabase AVANT que le webhook arrive
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      platform: 'google',
      google_purchase_token: latestPurchase.purchaseToken,
      google_product_id: product.productId,
      status: 'pending', // Sera mis à jour par le webhook
    });
    
    // Le webhook Google va recevoir la notification et activer Premium
    
  } catch (error) {
    console.error('Erreur achat Android:', error);
  }
}
```

### Étape 3 : Installation des dépendances backend

```bash
cd backend
npm install google-auth-library
```

### Étape 4 : Test en mode Test

- Ajouter des testeurs dans Play Console (Paramètres → Accès aux tests)
- Installer l'app en mode test sur un appareil Android
- Faire un achat test (carte bancaire non débitée)

### Flux Google :

1. User achète dans l'app Android
2. App enregistre dans Supabase (`google_purchase_token`)
3. Google envoie webhook via Pub/Sub `SUBSCRIPTION_PURCHASED`
4. Backend active Premium avec `activate_premium()`
5. User reçoit le badge Premium partout (web + apps)

---

## 🗄️ 4. Migration de la Base de Données

**Fichier** : `backend/database/dual-system-migration.sql`

Exécuter ce fichier dans Supabase SQL Editor :

```sql
-- Ajoute les colonnes platform, apple_*, google_*
-- Crée les index pour les recherches
-- Crée les fonctions helper get_active_subscription() et has_active_subscription()
```

### Colonnes ajoutées à `subscriptions` :

| Colonne | Type | Description |
|---------|------|-------------|
| `platform` | TEXT | 'stripe', 'apple', ou 'google' |
| `apple_transaction_id` | TEXT | ID de transaction Apple (change à chaque renouvellement) |
| `apple_original_transaction_id` | TEXT | ID original Apple (unique et permanent) |
| `apple_product_id` | TEXT | Product ID Apple (ex: com.dakanews.premium.monthly) |
| `google_purchase_token` | TEXT | Token d'achat Google (unique par abonnement) |
| `google_order_id` | TEXT | Order ID Google |
| `google_product_id` | TEXT | Product ID Google (ex: premium_monthly) |

---

## 📱 5. Expérience Utilisateur

### Scénario 1 : Abonnement sur le site web

1. User clique "⭐ Passer Premium" sur le site
2. Modal s'ouvre → Clic "S'abonner"
3. Redirection vers Stripe Checkout
4. Paiement → Webhook Stripe → Premium activé
5. Badge ⭐ apparaît sur le site ET dans les apps mobiles

### Scénario 2 : Abonnement sur iPhone

1. User clique "Passer Premium" dans l'app iOS
2. Popup Apple native (Face ID / Touch ID)
3. Achat → Webhook Apple → Premium activé
4. Badge ⭐ apparaît dans l'app iOS ET sur le site web

### Scénario 3 : Résiliation

**Sur Stripe (web)** :
- User clique "⚙️ Gérer mon abonnement" → Stripe Portal
- Clic "Annuler l'abonnement" → Webhook `customer.subscription.deleted`
- Premium désactivé partout

**Sur Apple (iOS)** :
- User va dans Réglages iOS → Abonnements → DAKA News
- Clic "Annuler l'abonnement" → Webhook `EXPIRED`
- Premium désactivé partout

**Sur Google (Android)** :
- User va dans Play Store → Abonnements → DAKA News
- Clic "Annuler l'abonnement" → Webhook `SUBSCRIPTION_EXPIRED`
- Premium désactivé partout

---

## 🧪 6. Tests

### Test Stripe (Web) :

```bash
# Carte de test
4242 4242 4242 4242
Date : N'importe quelle date future
CVC : N'importe quel 3 chiffres
```

### Test Apple (iOS) :

- Utiliser un compte Sandbox Tester (créé dans App Store Connect)
- Aucune vraie carte débitée
- Renouvellement accéléré (1 mois = 5 minutes en Sandbox)

### Test Google (Android) :

- Ajouter un testeur dans Play Console
- Utiliser une licence de test
- Aucune vraie carte débitée

---

## 🚀 7. Déploiement

### 1. Exécuter la migration SQL dans Supabase

```sql
-- Copier/coller le contenu de dual-system-migration.sql
```

### 2. Installer les dépendances

```bash
cd backend
npm install jsonwebtoken jwks-rsa google-auth-library
npm install --save-dev @types/jsonwebtoken @types/jwks-rsa
```

### 3. Déployer sur Render

```bash
cd backend
git add .
git commit -m "feat: Dual System - Apple & Google IAP webhooks"
git push origin main
```

### 4. Configurer les webhooks dans les dashboards :

- **Stripe** : https://dashboard.stripe.com/webhooks
- **Apple** : https://appstoreconnect.apple.com
- **Google** : https://play.google.com/console

---

## 🎯 8. Phases de Déploiement Recommandées

### Phase 1 : Web uniquement (ACTUEL)
- ✅ Stripe TEST configuré
- ✅ Paiements web fonctionnels
- ✅ Validation du tunnel de conversion
- **Objectif** : Valider la demande et l'UX avant d'investir dans les apps

### Phase 2 : Apps natives (SI succès Phase 1)
- Développer React Native app iOS + Android
- Intégrer Apple IAP + Google IAP
- Publier sur App Store + Play Store
- **Objectif** : Maximiser la portée et les revenus

### Phase 3 : Production (APRÈS tests)
- Passer Stripe en mode LIVE
- Configurer webhooks LIVE pour Apple + Google
- Monitoring avec Sentry
- **Objectif** : Lancement officiel

---

## 📊 9. Monitoring

### Logs Backend :

```bash
# Stripe webhook
✅ Paiement réussi pour user: a2d1f4fd-74dd-40ff-b23d-ecc352c9f1a2
✅ Premium activé pour user: a2d1f4fd-74dd-40ff-b23d-ecc352c9f1a2

# Apple webhook
📱 Webhook Apple reçu
✅ JWT Apple validé: INITIAL_BUY
✅ Premium activé pour user: ...

# Google webhook
🤖 Webhook Google reçu
📦 Notification Google décodée: { notificationType: 4 }
✅ Premium activé pour user: ...
```

### Sentry :

- Capture automatique des erreurs webhook
- Alertes email si webhook échoue
- Dashboard pour suivre les conversions

---

## 🔒 10. Sécurité

### Stripe :
- ✅ Signature webhook validée avec `stripe.webhooks.constructEvent()`
- ✅ Secret stocké dans variables d'environnement Render

### Apple :
- ✅ JWT validé avec clés publiques Apple JWKS
- ✅ Vérification de l'issuer `https://appleid.apple.com`

### Google :
- ✅ Messages Pub/Sub avec authentification OAuth2
- ✅ Validation du format Base64 et décodage sécurisé

---

## ✅ Checklist finale

- [ ] Migration SQL exécutée dans Supabase
- [ ] Dépendances backend installées (`npm install`)
- [ ] Backend déployé sur Render
- [ ] Webhooks configurés sur Stripe Dashboard
- [ ] App créée sur App Store Connect (si Phase 2)
- [ ] Webhook Apple configuré (si Phase 2)
- [ ] App créée sur Play Console (si Phase 2)
- [ ] Pub/Sub configuré sur Google Cloud (si Phase 2)
- [ ] Webhook Google configuré (si Phase 2)
- [ ] Tests effectués sur les 3 plateformes
- [ ] Stripe passé en mode LIVE
- [ ] Monitoring Sentry actif

---

## 🆘 Support

En cas de problème :

1. Vérifier les logs backend (Render Dashboard)
2. Vérifier les webhooks (Dashboard Stripe/Apple/Google)
3. Tester avec les cartes/comptes de test
4. Vérifier Sentry pour les erreurs capturées

**Contacts** :
- Stripe Support : https://support.stripe.com
- Apple Developer : https://developer.apple.com/contact/
- Google Play Support : https://support.google.com/googleplay/android-developer

---

Bonne chance avec DAKA News Terminal ! 🚀📰
