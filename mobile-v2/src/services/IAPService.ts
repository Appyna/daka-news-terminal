import { Platform, Alert } from 'react-native';
// import * as RNIap from 'react-native-iap'; // TODO: Réactiver après fix Expo IAP
import { supabase } from './supabaseClient';
import { IAP_PRODUCT_IDS } from '../constants';

// Mock temporaire pour compilation (IAP désactivé)
const RNIap = {
  initConnection: async () => {},
  clearTransactionIOS: async () => {},
  getSubscriptions: async (...args: any[]) => [],
  requestSubscription: async (...args: any[]) => null,
  finishTransaction: async (...args: any[]) => {},
  acknowledgePurchaseAndroid: async (...args: any[]) => {},
  purchaseUpdatedListener: (...args: any[]) => ({ remove: () => {} }),
  purchaseErrorListener: (...args: any[]) => ({ remove: () => {} }),
  getAvailablePurchases: async () => [],
  endConnection: async () => {},
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

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await RNIap.initConnection();
      console.log('✅ IAP connection établie');

      if (Platform.OS === 'ios') {
        await RNIap.clearTransactionIOS();
      }

      await this.loadProducts();
      this.setupPurchaseListener();

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Erreur initialisation IAP:', error);
      throw error;
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      const productId = Platform.OS === 'ios' ? IAP_PRODUCT_IDS.ios : IAP_PRODUCT_IDS.android;
      const products = await RNIap.getSubscriptions({ skus: [productId] });

      if (!products || products.length === 0) {
        console.warn('⚠️ Aucun produit IAP trouvé');
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

  getProducts(): IAPProduct[] {
    return this.products;
  }

  async purchasePremium(userId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const productId = Platform.OS === 'ios' ? IAP_PRODUCT_IDS.ios : IAP_PRODUCT_IDS.android;
      console.log(`🛒 Achat lancé pour: ${productId}`);

      const purchase: any = await RNIap.requestSubscription({ sku: productId });

      console.log('✅ Achat réussi:', purchase);
      
      if (!purchase) {
        throw new Error('Aucun achat retourné');
      }

      await this.savePurchaseToSupabase(userId, purchase);

      if (Platform.OS === 'ios') {
        await RNIap.finishTransaction({ purchase, isConsumable: false });
      } else {
        await RNIap.acknowledgePurchaseAndroid({ purchaseToken: purchase.purchaseToken });
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

  private setupPurchaseListener(): void {
    RNIap.purchaseUpdatedListener((purchase: any) => {
      console.log('🔔 Achat reçu:', purchase);
    });

    RNIap.purchaseErrorListener((error: any) => {
      console.warn('⚠️ Erreur achat:', error);
    });
  }

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
        // Activer Premium
        await supabase
          .from('profiles')
          .update({
            is_premium: true,
            premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('id', userId);
        
        console.log('✅ Premium activé dans Supabase');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde purchase:', error);
    }
  }

  async restorePurchases(userId: string): Promise<boolean> {
    try {
      console.log('🔄 Restauration des achats...');
      const purchases = await RNIap.getAvailablePurchases();

      if (purchases.length === 0) {
        Alert.alert('Aucun achat trouvé', 'Aucun abonnement actif trouvé.');
        return false;
      }

      for (const purchase of purchases) {
        await this.savePurchaseToSupabase(userId, purchase);
      }

      Alert.alert('Succès', 'Vos achats ont été restaurés !');
      return true;
    } catch (error) {
      console.error('❌ Erreur restauration achats:', error);
      Alert.alert('Erreur', 'Impossible de restaurer vos achats.');
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await RNIap.endConnection();
      this.isInitialized = false;
      console.log('✅ IAP connection fermée');
    } catch (error) {
      console.error('❌ Erreur déconnexion IAP:', error);
    }
  }
}

export const iapService = new IAPService();
