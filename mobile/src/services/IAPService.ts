/**
 * Service unifié pour les achats In-App (Apple & Google)
 * Gère automatiquement la détection de plateforme et les webhooks
 */

import { Platform, Alert } from 'react-native';
import * as RNIap from 'react-native-iap';
import { supabase } from './supabaseClient';

// Product IDs configurés dans App Store Connect et Google Play Console
const PRODUCT_IDS = {
  ios: 'com.dakanews.premium.monthly', // ✅ Créé dans App Store Connect
  android: 'premium_monthly', // ✅ Créé dans Google Play Console
};

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
}

class IAPService {
  private isInitialized = false;
  private products: IAPProduct[] = [];

  /**
   * Initialiser la connexion avec Apple/Google
   * Appeler au démarrage de l'app
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Connecter aux stores
      const result = await RNIap.initConnection();
      console.log('✅ IAP connection établie:', result);

      // iOS uniquement : Clear transactions non finalisées
      if (Platform.OS === 'ios') {
        await RNIap.clearTransactionIOS();
      }

      // Charger les produits disponibles
      await this.loadProducts();

      // Écouter les achats (webhooks internes)
      this.setupPurchaseListener();

      this.isInitialized = true;
      console.log('✅ IAPService initialisé');
    } catch (error) {
      console.error('❌ Erreur initialisation IAP:', error);
      throw error;
    }
  }

  /**
   * Charger les produits depuis App Store / Play Store
   */
  private async loadProducts(): Promise<void> {
    try {
      const productId = Platform.OS === 'ios' ? PRODUCT_IDS.ios : PRODUCT_IDS.android;
      
      // Fetch subscriptions (pas products, car c'est un abonnement)
      const products = await RNIap.getSubscriptions({ skus: [productId] });

      if (products.length === 0) {
        console.warn('⚠️ Aucun produit IAP trouvé. As-tu configuré App Store Connect / Play Console ?');
        return;
      }

      this.products = products.map((p: any) => ({
        productId: p.productId,
        title: p.title,
        description: p.description,
        price: p.localizedPrice,
        currency: p.currency,
      }));

      console.log('✅ Produits IAP chargés:', this.products);
    } catch (error) {
      console.error('❌ Erreur chargement produits IAP:', error);
    }
  }

  /**
   * Récupérer les produits disponibles
   */
  getProducts(): IAPProduct[] {
    return this.products;
  }

  /**
   * Lancer l'achat (ouvre le modal natif Apple/Google)
   */
  async purchasePremium(userId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const productId = Platform.OS === 'ios' ? PRODUCT_IDS.ios : PRODUCT_IDS.android;

      console.log(`🛒 Achat lancé pour: ${productId}`);

      // Lancer l'achat (ouvre modal natif)
      const purchase = await RNIap.requestSubscription({
        sku: productId,
        ...(Platform.OS === 'android' && {
          subscriptionOffers: [{ sku: productId, offerToken: '' }]
        })
      });

      console.log('✅ Achat réussi:', purchase);

      // Sauvegarder dans Supabase
      await this.savePurchaseToSupabase(userId, purchase);

      // Finaliser la transaction (IMPORTANT)
      if (Platform.OS === 'ios') {
        await RNIap.finishTransaction({ purchase, isConsumable: false });
      } else {
        await RNIap.acknowledgePurchaseAndroid({ purchaseToken: purchase.purchaseToken || '' });
      }

      return true;
    } catch (error: any) {
      if (error.code === 'E_USER_CANCELLED') {
        console.log('ℹ️ Achat annulé par l\'utilisateur');
        return false;
      }

      console.error('❌ Erreur achat IAP:', error);
      Alert.alert('Erreur', 'Impossible de finaliser l\'achat. Réessayez plus tard.');
      return false;
    }
  }

  /**
   * Écouter les achats (webhook interne)
   */
  private setupPurchaseListener(): void {
    // Écoute des achats réussis
    const purchaseUpdateSubscription = RNIap.purchaseUpdatedListener((purchase: any) => {
      console.log('🔔 Achat reçu:', purchase);
      
      // Validation du reçu (optionnel mais recommandé)
      // Tu peux envoyer le receipt au backend pour validation serveur
      this.validatePurchase(purchase);
    });

    // Écoute des erreurs d'achat
    const purchaseErrorSubscription = RNIap.purchaseErrorListener((error: any) => {
      console.warn('⚠️ Erreur achat:', error);
    });

    // Cleanup (à appeler lors du unmount de l'app)
    // purchaseUpdateSubscription.remove();
    // purchaseErrorSubscription.remove();
  }

  /**
   * Sauvegarder l'achat dans Supabase
   */
  private async savePurchaseToSupabase(userId: string, purchase: any): Promise<void> {
    try {
      const platform = Platform.OS === 'ios' ? 'apple' : 'google';
      
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          platform,
          ...(Platform.OS === 'ios' && {
            apple_transaction_id: purchase.transactionId,
            apple_original_transaction_id: purchase.originalTransactionId,
          }),
          ...(Platform.OS === 'android' && {
            google_purchase_token: purchase.purchaseToken,
            google_order_id: purchase.orderId,
          }),
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Erreur sauvegarde Supabase:', error);
      } else {
        // Activer Premium directement
        await supabase.rpc('activate_premium', {
          user_id_param: userId,
          months: 1,
        });
        console.log('✅ Premium activé dans Supabase');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde purchase:', error);
    }
  }

  /**
   * Valider un achat (optionnel : validation serveur)
   */
  private async validatePurchase(purchase: any): Promise<void> {
    // Tu peux envoyer le receipt au backend pour validation côté serveur
    // Cela évite les fraudes (achats fake)
    
    console.log('ℹ️ Validation purchase (TODO: envoyer au backend)');
    
    // Exemple: POST /api/iap/validate avec purchase.transactionReceipt
  }

  /**
   * Restaurer les achats (bouton "Restaurer" pour users qui ont réinstallé l'app)
   */
  async restorePurchases(userId: string): Promise<boolean> {
    try {
      console.log('🔄 Restauration des achats...');

      const purchases = await RNIap.getAvailablePurchases();

      if (purchases.length === 0) {
        Alert.alert('Aucun achat trouvé', 'Aucun abonnement actif n\'a été trouvé sur ce compte Apple/Google.');
        return false;
      }

      console.log('✅ Achats trouvés:', purchases);

      // Sauvegarder chaque achat dans Supabase
      for (const purchase of purchases) {
        await this.savePurchaseToSupabase(userId, purchase);
      }

      Alert.alert('Succès', 'Vos achats ont été restaurés avec succès !');
      return true;
    } catch (error) {
      console.error('❌ Erreur restauration achats:', error);
      Alert.alert('Erreur', 'Impossible de restaurer vos achats.');
      return false;
    }
  }

  /**
   * Vérifier si l'utilisateur a un abonnement actif (local)
   */
  async checkActiveSubscription(): Promise<boolean> {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      return purchases.length > 0;
    } catch (error) {
      console.error('❌ Erreur check subscription:', error);
      return false;
    }
  }

  /**
   * Déconnecter (cleanup)
   */
  async disconnect(): Promise<void> {
    try {
      await RNIap.endConnection();
      this.isInitialized = false;
      console.log('✅ IAP déconnecté');
    } catch (error) {
      console.error('❌ Erreur déconnexion IAP:', error);
    }
  }
}

// Export singleton
export const iapService = new IAPService();
