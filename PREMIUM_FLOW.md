# Flux Premium - Guide d'implémentation pour apps natives

## Vue d'ensemble

Ce document décrit comment implémenter le flux d'abonnement premium pour les applications natives **iOS** et **Android**. Le système utilise une approche "Dual System" avec des achats intégrés (In-App Purchases) pour chaque plateforme.

---

## Architecture générale

### Flux utilisateur

1. **Utilisateur non connecté clique sur une source premium**
   - Affichage du modal premium avec cadenas
   - Bouton "Accéder en illimité"

2. **Clic sur "Accéder en illimité"**
   - Affichage du modal d'authentification (signup/login)
   - Options natives : Sign in with Apple (iOS) / Sign in with Google (Android)

3. **Après connexion/inscription réussie**
   - Message de transition : "Compte créé avec succès ! Chargement des infos en illimité..."
   - Compte à rebours 2 secondes avec bouton "Continuer maintenant"

4. **Redirection vers In-App Purchase**
   - iOS : Ouverture du modal Apple IAP
   - Android : Ouverture du flux Google Play Billing

5. **Après achat réussi**
   - Webhook backend met à jour `subscriptions` table
   - App vérifie `premium_until > NOW()`
   - Déverrouillage de toutes les sources

---

## iOS - Implementation

### Prérequis

```bash
npm install react-native-iap @invertase/react-native-apple-authentication
```

### Configuration App Store Connect

1. Créer un **Subscription Group** nommé "DAKA News Premium"
2. Créer un **Auto-Renewable Subscription**
   - Product ID: `daka_news_premium_monthly`
   - Price: €1.99/month
   - Free trial: Non (optionnel : 7 jours)

3. Configurer **App Store Server Notifications V2**
   - URL: `https://daka-news-backend.onrender.com/api/webhooks/apple`
   - Version: V2
   - Événements: INITIAL_BUY, DID_RENEW, EXPIRED, REFUND

### Code d'authentification

```tsx
// src/services/AppleAuthService.ts
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { supabase } from './supabase';

export async function signInWithApple() {
  try {
    // 1. Demander l'authentification Apple
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    const { identityToken, nonce } = appleAuthRequestResponse;

    if (!identityToken) {
      throw new Error('Apple Sign-In failed - no identity token returned');
    }

    // 2. S'authentifier avec Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: identityToken,
      nonce,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error signing in with Apple:', error);
    throw error;
  }
}
```

### Code In-App Purchase

```tsx
// src/services/IAPService.ios.ts
import * as RNIap from 'react-native-iap';
import { supabase } from './supabase';

const PRODUCT_ID = 'daka_news_premium_monthly';

export async function initializeIAP() {
  try {
    await RNIap.initConnection();
    console.log('IAP Connection initialized');
  } catch (err) {
    console.error('Error initializing IAP:', err);
  }
}

export async function getSubscriptionProduct() {
  try {
    const products = await RNIap.getSubscriptions({ skus: [PRODUCT_ID] });
    return products[0];
  } catch (err) {
    console.error('Error getting products:', err);
    throw err;
  }
}

export async function purchaseSubscription() {
  try {
    const { user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Lancer l'achat
    const purchase = await RNIap.requestSubscription({
      sku: PRODUCT_ID,
      // Passer le user_id dans applicationUsername pour identification webhook
      applicationUsername: user.data.user?.id,
    });

    // 2. Vérifier la transaction
    if (purchase) {
      // 3. Finaliser la transaction
      await RNIap.finishTransaction({
        purchase,
        isConsumable: false,
      });

      console.log('Purchase successful:', purchase);
      return purchase;
    }
  } catch (err) {
    if (err.code === 'E_USER_CANCELLED') {
      console.log('User cancelled purchase');
    } else {
      console.error('Error purchasing subscription:', err);
    }
    throw err;
  }
}

// Écouter les mises à jour de transactions
export function setupPurchaseUpdateListener() {
  const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
    async (purchase: RNIap.SubscriptionPurchase) => {
      const receipt = purchase.transactionReceipt;
      
      if (receipt) {
        // Transaction réussie
        console.log('Purchase updated:', purchase);
        
        // Finaliser la transaction
        await RNIap.finishTransaction({
          purchase,
          isConsumable: false,
        });
        
        // Rafraîchir le statut premium de l'utilisateur
        await checkPremiumStatus();
      }
    }
  );

  const purchaseErrorSubscription = RNIap.purchaseErrorListener(
    (error: RNIap.PurchaseError) => {
      console.error('Purchase error:', error);
    }
  );

  return () => {
    purchaseUpdateSubscription.remove();
    purchaseErrorSubscription.remove();
  };
}

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const { user } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('premium_until')
      .eq('user_id', user.data.user?.id)
      .single();

    if (!subscription) return false;

    const isPremium = new Date(subscription.premium_until) > new Date();
    return isPremium;
  } catch (err) {
    console.error('Error checking premium status:', err);
    return false;
  }
}
```

### Intégration dans le PremiumModal (iOS)

```tsx
// src/components/PremiumModal.native.tsx
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { signInWithApple } from '../services/AppleAuthService';
import { purchaseSubscription, getSubscriptionProduct } from '../services/IAPService.ios';

export function PremiumModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [productPrice, setProductPrice] = useState('€1.99');

  useEffect(() => {
    if (isOpen && !user) {
      // Charger le prix du produit
      getSubscriptionProduct().then(product => {
        if (product) {
          setProductPrice(product.localizedPrice);
        }
      });
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (user && showTransition) {
      // Démarrer le compte à rebours
      const timer = setTimeout(() => {
        handlePurchase();
      }, 2000);

      const interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [user, showTransition]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithApple();
      // Après connexion réussie, afficher transition
      setShowTransition(true);
    } catch (err) {
      console.error('Sign in error:', err);
      Alert.alert('Erreur', 'Impossible de se connecter');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      await purchaseSubscription();
      Alert.alert('Succès', 'Abonnement activé !');
      onClose();
    } catch (err) {
      console.error('Purchase error:', err);
      Alert.alert('Erreur', 'Impossible de finaliser l\'achat');
    } finally {
      setLoading(false);
    }
  };

  if (showTransition) {
    return (
      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.transitionCard}>
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkIcon}>✓</Text>
            </View>
            <Text style={styles.title}>Compte créé avec succès !</Text>
            <Text style={styles.subtitle}>Chargement des infos en illimité...</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handlePurchase}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Redirection...' : `Continuer maintenant (${countdown}s)`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Accès Premium</Text>
          
          {/* Liste des bénéfices */}
          <View style={styles.benefits}>
            <Text style={styles.benefit}>Accès à 20+ sources d'information</Text>
            <Text style={styles.benefit}>Actualités 24/7 en temps réel</Text>
            <Text style={styles.benefit}>Traduction automatique en français</Text>
            <Text style={styles.benefit}>Sans engagement</Text>
          </View>

          <Text style={styles.price}>{productPrice}/mois</Text>

          {!user ? (
            <TouchableOpacity
              style={styles.button}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Continuer avec Apple</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={handlePurchase}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>S'abonner</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
```

---

## Android - Implementation

### Prérequis

```bash
npm install react-native-iap @react-native-google-signin/google-signin
```

### Configuration Google Play Console

1. Créer un **Subscription** dans "Monétisation"
   - Product ID: `daka_news_premium_monthly`
   - Price: €1.99/month
   - Billing period: 1 month
   - Free trial: Non (optionnel : 7 jours)

2. Configurer **Real-Time Developer Notifications**
   - Créer un Topic Pub/Sub sur Google Cloud
   - URL backend: `https://daka-news-backend.onrender.com/api/webhooks/google`
   - Activer les notifications dans Play Console

3. Configurer **Google Sign-In**
   - Créer OAuth 2.0 Client ID dans Google Cloud Console
   - Type: Android
   - Ajouter SHA-1 de votre keystore

### Code d'authentification

```tsx
// src/services/GoogleAuthService.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

export async function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // From Google Cloud Console
    offlineAccess: true,
  });
}

export async function signInWithGoogle() {
  try {
    // 1. Vérifier si Google Play Services est disponible
    await GoogleSignin.hasPlayServices();

    // 2. Demander l'authentification Google
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();

    // 3. S'authentifier avec Supabase
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: tokens.idToken,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}
```

### Code In-App Purchase

```tsx
// src/services/IAPService.android.ts
import * as RNIap from 'react-native-iap';
import { supabase } from './supabase';

const SUBSCRIPTION_SKU = 'daka_news_premium_monthly';

export async function initializeIAP() {
  try {
    await RNIap.initConnection();
    console.log('IAP Connection initialized');
  } catch (err) {
    console.error('Error initializing IAP:', err);
  }
}

export async function getSubscriptionProduct() {
  try {
    const subscriptions = await RNIap.getSubscriptions({ skus: [SUBSCRIPTION_SKU] });
    return subscriptions[0];
  } catch (err) {
    console.error('Error getting subscriptions:', err);
    throw err;
  }
}

export async function purchaseSubscription() {
  try {
    const { user } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Lancer l'achat
    const purchase = await RNIap.requestSubscription({
      sku: SUBSCRIPTION_SKU,
      // Passer le user_id dans obfuscatedAccountId pour identification webhook
      obfuscatedAccountIdAndroid: user.data.user?.id,
    });

    // 2. Vérifier la transaction
    if (purchase) {
      // 3. Acknowledgment de la transaction (OBLIGATOIRE sur Android)
      if (purchase.purchaseStateAndroid === 1 && !purchase.isAcknowledgedAndroid) {
        await RNIap.acknowledgePurchaseAndroid({
          token: purchase.purchaseToken,
          developerPayload: purchase.developerPayloadAndroid,
        });
      }

      console.log('Purchase successful:', purchase);
      return purchase;
    }
  } catch (err) {
    if (err.code === 'E_USER_CANCELLED') {
      console.log('User cancelled purchase');
    } else {
      console.error('Error purchasing subscription:', err);
    }
    throw err;
  }
}

export function setupPurchaseUpdateListener() {
  const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
    async (purchase: RNIap.SubscriptionPurchase) => {
      console.log('Purchase updated:', purchase);
      
      // Acknowledge la transaction si nécessaire
      if (purchase.purchaseStateAndroid === 1 && !purchase.isAcknowledgedAndroid) {
        try {
          await RNIap.acknowledgePurchaseAndroid({
            token: purchase.purchaseToken,
          });
          console.log('Purchase acknowledged');
          
          // Rafraîchir le statut premium
          await checkPremiumStatus();
        } catch (err) {
          console.error('Error acknowledging purchase:', err);
        }
      }
    }
  );

  const purchaseErrorSubscription = RNIap.purchaseErrorListener(
    (error: RNIap.PurchaseError) => {
      console.error('Purchase error:', error);
    }
  );

  return () => {
    purchaseUpdateSubscription.remove();
    purchaseErrorSubscription.remove();
  };
}

export async function checkPremiumStatus(): Promise<boolean> {
  try {
    const { user } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('premium_until')
      .eq('user_id', user.data.user?.id)
      .single();

    if (!subscription) return false;

    const isPremium = new Date(subscription.premium_until) > new Date();
    return isPremium;
  } catch (err) {
    console.error('Error checking premium status:', err);
    return false;
  }
}
```

### Intégration dans le PremiumModal (Android)

```tsx
// src/components/PremiumModal.native.tsx
// Similaire à iOS mais avec Google Sign-In au lieu d'Apple

import { signInWithGoogle } from '../services/GoogleAuthService';
import { purchaseSubscription, getSubscriptionProduct } from '../services/IAPService.android';

const handleSignIn = async () => {
  try {
    setLoading(true);
    await signInWithGoogle();
    setShowTransition(true);
  } catch (err) {
    console.error('Sign in error:', err);
    Alert.alert('Erreur', 'Impossible de se connecter');
  } finally {
    setLoading(false);
  }
};

// Le reste est identique à l'implémentation iOS
```

---

## Webhooks Backend

Les webhooks sont déjà implémentés dans le backend :

### Apple Webhook
- **Endpoint**: `/api/webhooks/apple`
- **Fichier**: `backend/src/routes/apple-webhooks.ts`
- **Gestion**: INITIAL_BUY, DID_RENEW, EXPIRED, REFUND
- **Validation**: JWT avec clés publiques Apple

### Google Webhook
- **Endpoint**: `/api/webhooks/google`
- **Fichier**: `backend/src/routes/google-webhooks.ts`
- **Gestion**: SUBSCRIPTION_PURCHASED, RENEWED, EXPIRED, REVOKED
- **Validation**: Pub/Sub authentication

---

## Base de données

La table `subscriptions` contient déjà les colonnes nécessaires :

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  platform TEXT NOT NULL, -- 'stripe' | 'apple' | 'google'
  
  -- Stripe
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Apple
  apple_transaction_id TEXT,
  apple_original_transaction_id TEXT UNIQUE,
  apple_product_id TEXT,
  
  -- Google
  google_purchase_token TEXT UNIQUE,
  google_order_id TEXT,
  google_product_id TEXT,
  
  premium_until TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Points d'attention

### iOS Spécifique

1. **App Store Review**
   - Fournir un compte de test dans App Store Connect
   - Documenter le flux d'achat dans les notes de review
   - S'assurer que le bouton "Restore Purchases" est visible

2. **Sandbox Testing**
   - Créer des comptes sandbox dans App Store Connect
   - Les transactions sandbox ne sont PAS envoyées au webhook de production
   - Utiliser un environnement de test séparé

3. **Receipt Validation**
   - Le backend valide automatiquement les receipts via le webhook
   - Pas besoin de validation côté client

### Android Spécifique

1. **Google Play Console**
   - Tester avec des comptes de test (License Testing)
   - Publier au moins en Internal Testing pour activer les IAP
   - Les achats test sont gratuits et annulés automatiquement après 5 minutes

2. **Acknowledgment Obligatoire**
   - **CRITIQUE**: Toujours acknowledge les achats dans les 3 jours
   - Sinon Google Play rembourse automatiquement
   - Le code ci-dessus gère ça automatiquement

3. **Obfuscated Account ID**
   - Passer le `user_id` pour lier l'achat au compte
   - Permet au webhook d'identifier l'utilisateur

---

## Testing

### Test complet du flux

1. **Désinstaller/réinstaller l'app** pour reset le cache IAP
2. **Lancer l'app sans connexion**
3. **Cliquer sur une source premium** → Modal premium s'affiche
4. **Cliquer "Accéder en illimité"** → Modal authentification
5. **Se connecter avec Apple/Google** → Transition message
6. **Attendre 2s ou cliquer "Continuer"** → Modal IAP natif
7. **Compléter l'achat** → Webhook met à jour la DB
8. **Vérifier que toutes les sources sont déverrouillées**

### Vérifier le statut premium

```tsx
import { checkPremiumStatus } from './services/IAPService';

// Dans App.tsx
useEffect(() => {
  const checkStatus = async () => {
    const isPremium = await checkPremiumStatus();
    console.log('Is Premium:', isPremium);
  };
  
  checkStatus();
  
  // Vérifier toutes les 5 minutes
  const interval = setInterval(checkStatus, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

---

## Références

- [React Native IAP Documentation](https://github.com/dooboolab-community/react-native-iap)
- [Apple In-App Purchase](https://developer.apple.com/in-app-purchase/)
- [Google Play Billing](https://developer.android.com/google/play/billing)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## Support

Pour toute question sur l'implémentation :
1. Vérifier les logs du backend sur Render
2. Vérifier les transactions dans App Store Connect / Google Play Console
3. Tester les webhooks avec ngrok en local avant de déployer
