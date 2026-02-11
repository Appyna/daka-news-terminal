# 🚀 Migration Base de Données : Support Multi-Plateformes

## 📋 Contexte

Cette migration ajoute le support pour distinguer les abonnements selon leur plateforme d'origine (Stripe, Apple In-App Purchase, Google Play Billing).

## ⚠️ IMPORTANT : À FAIRE AVANT LE LANCEMENT

Cette migration **DOIT** être exécutée dans Supabase **AVANT** le lancement public de l'application pour éviter les doubles abonnements.

## 📂 Fichier de migration

`migration-add-platform-to-subscriptions.sql`

## 🎯 Colonnes ajoutées

| Colonne | Type | Description |
|---------|------|-------------|
| `platform` | TEXT | 'stripe', 'apple', 'google' (défaut: 'stripe') |
| `apple_transaction_id` | TEXT | ID transaction Apple (IAP) |
| `apple_original_transaction_id` | TEXT | ID transaction originale Apple |
| `google_purchase_token` | TEXT | Token achat Google Play |
| `google_order_id` | TEXT | ID commande Google Play |

## 📝 Étapes d'exécution

### 1. Se connecter à Supabase

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Sélectionner le projet DAKA News Terminal
3. Cliquer sur "SQL Editor" dans le menu de gauche

### 2. Exécuter la migration

1. Copier tout le contenu de `migration-add-platform-to-subscriptions.sql`
2. Le coller dans l'éditeur SQL
3. Cliquer sur "Run" (en bas à droite)
4. Vérifier qu'il n'y a **aucune erreur**

### 3. Vérifier la migration

Exécuter cette requête pour vérifier :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name IN ('platform', 'apple_transaction_id', 'google_purchase_token');
```

**Résultat attendu :**

```
column_name              | data_type
-------------------------|-----------
platform                 | text
apple_transaction_id     | text
google_purchase_token    | text
```

### 4. Mettre à jour les abonnements existants (si nécessaire)

Si vous avez déjà des utilisateurs Premium via Stripe :

```sql
-- Tous les abonnements existants sont déjà 'stripe' par défaut
-- Vérifier :
SELECT platform, COUNT(*) 
FROM subscriptions 
WHERE status = 'active'
GROUP BY platform;
```

## ✅ Logique implémentée dans le code

### **Web (React)**

- `PremiumModal` : Détecte si l'utilisateur est déjà Premium
  - Si Premium via **Stripe** → Bouton "Gérer mon abonnement" → Stripe Portal
  - Si Premium via **Apple** → Bouton "Ouvrir App Store" → Réglages Apple
  - Si Premium via **Google** → Bouton "Ouvrir Google Play" → Réglages Google

- `TopBar` : Bouton "Gérer mon abonnement"
  - Détecte automatiquement la plateforme
  - Redirige vers le bon portail

### **Mobile (React Native)**

- `PremiumModal` : Même logique que web
  - Utilise `Linking.openURL()` pour ouvrir les stores

- `App.tsx` → `handleManageSubscription` :
  - Récupère `subscription.platform` depuis Supabase
  - Redirige vers le bon store

### **Backend (Webhooks)**

- `webhooks.ts` (Stripe) : Insère `platform: 'stripe'`
- `IAPService.ts` (Mobile) : Insère `platform: 'apple'` ou `'google'`
- `apple-webhooks.ts` : Gère les événements Apple
- `google-webhooks.ts` : Gère les événements Google

## 🛡️ Protection contre les doubles abonnements

### **Avant cette migration :**
❌ Un utilisateur pouvait s'abonner via Stripe **ET** via App Store → Payé 2 fois

### **Après cette migration :**
✅ Si l'utilisateur est déjà Premium :
- Le popup Premium affiche "Vous êtes déjà Premium !"
- Affiche un message selon la plateforme d'origine
- Propose un bouton pour gérer l'abonnement existant
- **Empêche de payer une deuxième fois**

## 📊 Flux de redirection

```
User clique "Gérer mon abonnement"
          ↓
Requête SQL: SELECT platform FROM subscriptions WHERE user_id = X
          ↓
┌─────────┬──────────┬──────────────┐
│ Stripe  │  Apple   │    Google    │
└─────────┴──────────┴──────────────┘
    ↓          ↓            ↓
Portal     App Store    Play Store
Stripe     Settings     Settings
```

## 🔗 URLs de gestion

| Plateforme | URL |
|------------|-----|
| **Stripe** | `https://billing.stripe.com/p/session/...` (généré dynamiquement) |
| **Apple** | `https://apps.apple.com/account/subscriptions` |
| **Google** | `https://play.google.com/store/account/subscriptions` |

## 🚨 Que faire en cas d'erreur lors de la migration ?

### Erreur : "column already exists"

```sql
-- C'est bon signe ! Les colonnes existent déjà
-- Vérifier que la migration a déjà été appliquée :
SELECT * FROM subscriptions LIMIT 1;
```

### Erreur : "permission denied"

Vous n'avez pas les droits suffisants. Utilisez le **Owner** du projet Supabase pour exécuter la migration.

### Erreur : "syntax error"

Vérifier que vous avez copié **TOUT** le contenu du fichier SQL sans modification.

## 📱 Test après migration

### Test Web :

1. Se connecter sur [https://daka-news-terminal.vercel.app](https://daka-news-terminal.vercel.app)
2. Créer un compte ou se connecter
3. S'abonner via Stripe
4. Vérifier dans Supabase :

```sql
SELECT user_id, platform, status 
FROM subscriptions 
WHERE user_id = 'VOTRE_USER_ID';
```

**Attendu :** `platform = 'stripe'`

5. Cliquer sur "Gérer mon abonnement" → Doit ouvrir le Stripe Portal

### Test Mobile :

1. Ouvrir l'app sur TestFlight
2. S'abonner via In-App Purchase
3. Vérifier dans Supabase :

```sql
SELECT user_id, platform, apple_transaction_id 
FROM subscriptions 
WHERE user_id = 'VOTRE_USER_ID';
```

**Attendu :** `platform = 'apple'`, `apple_transaction_id` rempli

4. Cliquer sur "Gérer mon abonnement" → Doit ouvrir l'App Store

## ✅ Checklist finale

- [ ] Migration SQL exécutée dans Supabase
- [ ] Vérification des colonnes réussie
- [ ] Code web déployé sur Vercel
- [ ] Code mobile mis à jour (nouvelle build TestFlight à venir)
- [ ] Test abonnement Stripe sur web : ✅
- [ ] Test abonnement Apple sur mobile : ⏳
- [ ] Test "Gérer mon abonnement" web : ✅
- [ ] Test "Gérer mon abonnement" mobile : ⏳

## 📞 Support

En cas de problème, vérifier :
1. Les logs Supabase (section "Logs" dans le dashboard)
2. Les logs backend Render (https://dashboard.render.com)
3. Les logs console browser (F12 → Console)
4. Les logs mobile (Xcode console / Android Logcat)
