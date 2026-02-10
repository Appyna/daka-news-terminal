# 📱 CONFIGURATION APP STORE CONNECT - IN-APP PURCHASE

## ✅ **ÉTAPE 1 : CRÉER L'APP DANS APP STORE CONNECT**

### **1.1 - Se connecter**
- Aller sur : https://appstoreconnect.apple.com
- Se connecter avec ton Apple ID Developer

### **1.2 - Créer l'app**
1. Cliquer sur **"My Apps"**
2. Cliquer sur **"+"** (en haut à gauche)
3. Sélectionner **"New App"**
4. Remplir :
   - **Platform** : iOS
   - **Name** : `DAKA News`
   - **Primary Language** : French
   - **Bundle ID** : Sélectionner `com.dakanewsapp.dakanews` (créé dans Developer Portal)
   - **SKU** : `dakanews2026`
   - **User Access** : Full Access

5. Cliquer **"Create"**

---

## ✅ **ÉTAPE 2 : CRÉER L'ABONNEMENT AUTO-RENOUVELABLE**

### **2.1 - Aller dans Subscriptions**
1. Dans ton app, cliquer sur l'onglet **"Subscriptions"**
2. Cliquer sur **"+"** pour créer un Subscription Group
3. **Reference Name** : `DAKA News Premium`
4. Cliquer **"Create"**

### **2.2 - Créer le produit d'abonnement**
1. Dans le Subscription Group `DAKA News Premium`, cliquer **"+"**
2. Remplir :

**Product ID** :
```
com.dakanewsapp.dakanews.premium.monthly
```
⚠️ **IMPORTANT** : Ce Product ID doit EXACTEMENT correspondre à celui dans `IAPService.ts` :
```typescript
const PRODUCT_IDS = {
  ios: 'com.dakanewsapp.dakanews.premium.monthly',
  // ...
};
```

**Reference Name** :
```
DAKA News Premium Monthly
```

**Subscription Duration** :
- Sélectionner : **1 month**

---

## ✅ **ÉTAPE 3 : CONFIGURER LE PRIX**

### **3.1 - Ajouter le prix**
1. Dans la section **"Subscription Prices"**
2. Cliquer **"+"** pour ajouter un prix
3. Sélectionner **"France"**
4. Prix : **€1.99** (ou équivalent)
5. Sauvegarder

### **3.2 - Prix internationaux (optionnel)**
- Apple va automatiquement convertir pour les autres pays
- Tu peux personnaliser si besoin (ex: $1.99 aux USA)

---

## ✅ **ÉTAPE 4 : CONFIGURER LES MÉTADONNÉES**

### **4.1 - Subscription Display Name**
```
Premium
```

### **4.2 - Description**
```
Accédez à toutes les sources d'actualités internationales : Israël, France, Monde.

Inclus :
• 18 sources d'actualités en temps réel
• Traduction automatique en français
• Actualités d'Israël, France, Monde
• Sans publicité

Abonnement mensuel renouvelé automatiquement.
Vous pouvez annuler à tout moment depuis les Réglages iPhone.
```

### **4.3 - Promotional Image** (optionnel)
- Taille : 1600 x 900 pixels
- Tu peux sauter cette étape pour l'instant

---

## ✅ **ÉTAPE 5 : CONFIGURER LA PÉRIODE D'ESSAI (OPTIONNEL)**

Si tu veux offrir 7 jours gratuits :

1. Dans **"Subscription Prices"**, activer **"Introductory Offer"**
2. Type : **Free Trial**
3. Duration : **7 days**
4. Sauvegarder

⚠️ **Note** : Pour l'instant, on n'a PAS de période d'essai (prix direct 1,99€/mois)

---

## ✅ **ÉTAPE 6 : REVIEW INFORMATION**

### **6.1 - Subscription Review Information**
Apple a besoin de tester l'abonnement. Créer un compte de test :

1. **Review Notes** (optionnel) :
```
L'abonnement Premium déverrouille toutes les sources d'actualités.
Pour tester : 
- Lancer l'app
- Cliquer sur une source premium (ex: Le Monde)
- Cliquer "Accéder en illimité"
- L'abonnement se lance
```

2. **Screenshot (pour review)** : 
   - Capturer l'écran Premium Modal avec le prix visible
   - Format PNG, min 640x920

---

## ✅ **ÉTAPE 7 : CRÉER UN COMPTE TESTEUR (SANDBOX)**

### **7.1 - Aller dans App Store Connect → Users and Access**
1. Cliquer sur **"Sandbox Testers"** (menu gauche)
2. Cliquer **"+"** pour ajouter un testeur
3. Remplir :
   - **First Name** : Test
   - **Last Name** : Daka
   - **Email** : `testdaka+sandbox@gmail.com` (doit être un email valide non utilisé sur App Store)
   - **Password** : Choisir un mot de passe fort
   - **Country** : France
   - **App Store Territory** : France

4. Cliquer **"Invite"**

### **7.2 - Confirmer l'email**
- Aller dans la boîte mail `testdaka+sandbox@gmail.com`
- Cliquer sur le lien de confirmation Apple

### **7.3 - Tester sur ton iPhone**
1. **Déconnecter ton Apple ID réel** :
   - Réglages → App Store → Se déconnecter (SEULEMENT App Store, pas iCloud)
   
2. **Lancer l'app DAKA News** (via EAS Build)

3. **Cliquer sur Premium** → L'abonnement se lance

4. **Se connecter avec le compte Sandbox** :
   - Email : `testdaka+sandbox@gmail.com`
   - Mot de passe : (celui que tu as créé)

5. **Confirmer l'achat** → Tu paieras **0€** (mode test)

6. **Vérifier** : L'app doit afficher "Premium activé"

---

## ✅ **ÉTAPE 8 : SOUMETTRE POUR REVIEW (APRÈS TESTS)**

Une fois que tout fonctionne en Sandbox :

1. Dans App Store Connect, aller dans **"Subscriptions"**
2. Cliquer sur ton produit `Premium Monthly`
3. Cliquer **"Submit for Review"**
4. Apple review l'abonnement (délai : 1-3 jours)

---

## ⚠️ **ATTENTION : WEBHOOK SERVEUR (IMPORTANT)**

Pour recevoir les notifications d'abonnement (renouvellement, annulation), configurer :

### **URL Webhook** :
```
https://daka-news-backend.onrender.com/api/webhooks/apple
```

### **Configuration** :
1. App Store Connect → Apps → DAKA News
2. **"App Information"** → **"App Store Server Notifications"**
3. **Version** : V2
4. **Production Server URL** : `https://daka-news-backend.onrender.com/api/webhooks/apple`
5. **Sandbox Server URL** : (même URL pour tests)

6. **Events à cocher** :
   - ✅ INITIAL_BUY (premier achat)
   - ✅ DID_RENEW (renouvellement)
   - ✅ EXPIRED (expiration)
   - ✅ DID_FAIL_TO_RENEW (échec paiement)
   - ✅ REFUND (remboursement)

---

## 📊 **RÉCAPITULATIF FINAL**

| Étape | Statut | Notes |
|-------|--------|-------|
| ✅ Créer app dans App Store Connect | À FAIRE | Name: DAKA News, Bundle: com.dakanewsapp.dakanews |
| ✅ Créer Subscription Group | À FAIRE | Name: DAKA News Premium |
| ✅ Créer produit abonnement | À FAIRE | Product ID: com.dakanewsapp.dakanews.premium.monthly |
| ✅ Configurer prix | À FAIRE | €1.99/mois |
| ✅ Ajouter métadonnées | À FAIRE | Nom, description |
| ✅ Créer compte Sandbox | À FAIRE | testdaka+sandbox@gmail.com |
| ✅ Tester avec EAS Build | À FAIRE | Après build development |
| ✅ Configurer webhooks | À FAIRE | URL backend /api/webhooks/apple |
| ✅ Soumettre pour review | À FAIRE | Après tests réussis |

---

## 🚀 **PROCHAINES ÉTAPES**

1. ✅ **Maintenant** : Créer le build development avec `eas build --profile development --platform ios`
2. ✅ **Installer sur iPhone** : Scanner QR code du build
3. ✅ **Tester l'abonnement** : Avec compte Sandbox
4. ✅ **Si tout fonctionne** : Soumettre pour review App Store

**Le code IAP est déjà intégré dans l'app ! Il attend juste que tu configures App Store Connect** 🎉
