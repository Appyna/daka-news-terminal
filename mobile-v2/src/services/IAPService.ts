import { Platform, Alert } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { supabase } from './supabaseClient';

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
      // Configuration RevenueCat avec votre API Key
      Purchases.configure({ 
        apiKey: Platform.OS === 'ios' 
          ? 'appl_JzBGrniAoiIvnDUEGYdBakscCdq' // iOS API Key prod RevenueCat
          : 'YOUR_GOOGLE_API_KEY' // À configurer plus tard pour Android
      });

      await this.loadProducts();
      this.setupPurchaseListener();

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Erreur initialisation RevenueCat:', error);
      throw error;
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      // Récupérer les offerings (packages) depuis RevenueCat
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current || offerings.current.availablePackages.length === 0) {
        return;
      }

      // Récupérer le package mensuel (vous le configurerez dans RevenueCat dashboard)
      const monthlyPackage = offerings.current.availablePackages.find(
        (pkg: PurchasesPackage) => pkg.identifier === '$rc_monthly'
      );

      if (monthlyPackage) {
        this.products = [{
          productId: monthlyPackage.product.identifier,
          title: monthlyPackage.product.title,
          description: monthlyPackage.product.description,
          price: monthlyPackage.product.priceString,
          currency: monthlyPackage.product.currencyCode,
        }];
      }
    } catch (error) {
      console.error('❌ Erreur chargement produits RevenueCat:', error);
    }
  }

  getProducts(): IAPProduct[] {
    return this.products;
  }

  async getLocalizedPrice(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.products.length > 0) {
      return this.products[0].price;
    }

    return '1,99 €'; // Prix par défaut
  }

  async purchasePremium(userId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Identifier l'utilisateur dans RevenueCat
      await Purchases.logIn(userId);

      // Récupérer les offerings
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current || offerings.current.availablePackages.length === 0) {
        throw new Error('Aucun abonnement disponible');
      }

      // Récupérer le package mensuel
      const monthlyPackage = offerings.current.availablePackages.find(
        (pkg: PurchasesPackage) => pkg.identifier === '$rc_monthly'
      );

      if (!monthlyPackage) {
        throw new Error('Package mensuel non trouvé');
      }

      // Lancer l'achat (StoreKit d'Apple s'ouvre ici - interface native)
      const purchaseResult = await Purchases.purchasePackage(monthlyPackage);

      // Sauvegarder dans Supabase
      await this.savePurchaseToSupabase(userId, purchaseResult.customerInfo);

      return true;
    } catch (error: any) {
      if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return false;
      }

      console.error('❌ Erreur achat RevenueCat:', error);
      Alert.alert('Erreur', error.message || 'Impossible de finaliser l\'achat. Réessayez plus tard.');
      return false;
    }
  }

  private setupPurchaseListener(): void {
    // RevenueCat gère automatiquement les updates de purchase
  }

  private async savePurchaseToSupabase(userId: string, customerInfo: CustomerInfo): Promise<void> {
    try {
      // ✅ CORRECTION : Vérifier activeSubscriptions au lieu d'entitlements
      const activeSubscriptions = Object.keys(customerInfo.activeSubscriptions);
      const isPremium = activeSubscriptions.length > 0;
      
      if (!isPremium) {
        return;
      }

      // ✅ RÉCUPÉRER LA VRAIE DATE D'EXPIRATION depuis RevenueCat
      // Essayer de récupérer depuis allExpirationDates (iOS fournit cette info)
      let expirationDate: string | null = null;
      
      // Pour iOS, RevenueCat expose les dates d'expiration dans allExpirationDates
      const allExpirationDates = customerInfo.allExpirationDates;
      if (allExpirationDates && Object.keys(allExpirationDates).length > 0) {
        // Prendre la première date d'expiration disponible
        const firstProductKey = Object.keys(allExpirationDates)[0];
        const expiryDate = allExpirationDates[firstProductKey];
        if (expiryDate) {
          expirationDate = new Date(expiryDate).toISOString();
        }
      }
      
      // Fallback : si pas de date disponible, calculer +30 jours
      if (!expirationDate) {
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + 30);
        expirationDate = expDate.toISOString();
      }

      // Sauvegarder dans subscriptions table
      const firstSubscriptionKey = activeSubscriptions[0];
      
      // ✅ Récupérer le vrai transaction ID depuis customerInfo
      let transactionId = customerInfo.originalAppUserId; // Fallback
      
      // Pour iOS, essayer de récupérer le dernier transaction ID
      if (Platform.OS === 'ios' && customerInfo.nonSubscriptionTransactions.length > 0) {
        // Prendre le dernier purchase
        const lastTransaction = customerInfo.nonSubscriptionTransactions[customerInfo.nonSubscriptionTransactions.length - 1];
        transactionId = lastTransaction.transactionIdentifier || transactionId;
      } else if (firstSubscriptionKey && firstSubscriptionKey !== '0') {
        transactionId = firstSubscriptionKey;
      }
      
      // ✅ CORRECTION : Utiliser les bonnes colonnes selon la plateforme
      const subscriptionData: any = {
        user_id: userId,
        platform: Platform.OS === 'ios' ? 'apple' : 'google',
        status: 'active',
        current_period_end: expirationDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Ajouter la colonne spécifique à la plateforme
      if (Platform.OS === 'ios') {
        subscriptionData.apple_transaction_id = transactionId;
      } else {
        subscriptionData.google_purchase_token = transactionId;
      }
      
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id,platform'
        });

      if (subError) {
        console.error('❌ Erreur sauvegarde subscription:', subError);
        throw subError;
      }

      // ✅ UPDATE PROFILE
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_premium: true,
          premium_until: expirationDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('❌ Erreur update profile:', profileError);
        throw profileError;
      }

      console.log('✅ Profile premium activé');
    } catch (error) {
      console.error('❌ Erreur sauvegarde Supabase:', error);
      throw error;
    }
  }

  async restorePurchases(userId: string): Promise<boolean> {
    try {
      // Identifier l'utilisateur
      await Purchases.logIn(userId);

      // Restaurer les achats
      const customerInfo = await Purchases.restorePurchases();

      // ✅ Vérifier via activeSubscriptions
      const activeSubscriptions = Object.keys(customerInfo.activeSubscriptions);
      const isPremium = activeSubscriptions.length > 0;

      if (isPremium) {
        await this.savePurchaseToSupabase(userId, customerInfo);
        Alert.alert('Succès', 'Vos achats ont été restaurés !');
        return true;
      } else {
        Alert.alert('Information', 'Aucun abonnement actif trouvé.');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erreur restauration:', error);
      Alert.alert('Erreur', 'Impossible de restaurer les achats.');
      return false;
    }
  }

  async checkSubscriptionStatus(userId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await Purchases.logIn(userId);
      const customerInfo = await Purchases.getCustomerInfo();
      
      // ✅ Vérifier via activeSubscriptions
      const activeSubscriptions = Object.keys(customerInfo.activeSubscriptions);
      const isPremium = activeSubscriptions.length > 0;
      
      if (isPremium) {
        // ✅ Sync avec Supabase à chaque vérification
        await this.savePurchaseToSupabase(userId, customerInfo);
      }

      return isPremium;
    } catch (error) {
      console.error('❌ Erreur vérification status:', error);
      return false;
    }
  }

  // ✅ NOUVELLE MÉTHODE : Vérifier et synchroniser au démarrage de l'app
  async syncPremiumStatusOnStartup(userId: string): Promise<void> {
    try {
      await this.checkSubscriptionStatus(userId);
    } catch (error) {
      console.error('❌ Erreur sync startup:', error);
    }
  }
}

export const iapService = new IAPService();
