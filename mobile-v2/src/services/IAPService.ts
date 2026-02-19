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
      
      console.log('✅ RevenueCat configuré');

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
        console.warn('⚠️ Aucun offering disponible');
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

        console.log('✅ Produits RevenueCat chargés:', this.products);
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

      console.log(`🛒 Achat lancé pour: ${monthlyPackage.product.identifier}`);

      // Lancer l'achat (StoreKit d'Apple s'ouvre ici - interface native)
      const purchaseResult = await Purchases.purchasePackage(monthlyPackage);

      console.log('✅ Achat réussi:', purchaseResult);

      // Sauvegarder dans Supabase
      await this.savePurchaseToSupabase(userId, purchaseResult.customerInfo);

      return true;
    } catch (error: any) {
      if (error.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        console.log('ℹ️ Achat annulé par l\'utilisateur');
        return false;
      }

      console.error('❌ Erreur achat RevenueCat:', error);
      Alert.alert('Erreur', error.message || 'Impossible de finaliser l\'achat. Réessayez plus tard.');
      return false;
    }
  }

  private setupPurchaseListener(): void {
    // RevenueCat gère automatiquement les updates de purchase
    console.log('🔔 Listener RevenueCat actif');
  }

  private async savePurchaseToSupabase(userId: string, customerInfo: CustomerInfo): Promise<void> {
    try {
      // Vérifier si l'utilisateur a un abonnement actif
      const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      const expirationDate = customerInfo.entitlements.active['premium']?.expirationDate;

      if (!isPremium) {
        console.warn('⚠️ Aucun abonnement actif trouvé');
        return;
      }

      // Récupérer les infos de transaction
      const allTransactions = customerInfo.nonSubscriptionTransactions;
      const latestTransaction = allTransactions && allTransactions.length > 0 
        ? allTransactions[allTransactions.length - 1] 
        : null;

      // Sauvegarder dans subscriptions table
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          platform: Platform.OS === 'ios' ? 'apple' : 'google',
          subscription_id: latestTransaction?.transactionIdentifier || customerInfo.originalAppUserId,
          status: 'active',
          current_period_end: expirationDate || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,platform'
        });

      if (subError) {
        console.error('❌ Erreur sauvegarde subscription:', subError);
        throw subError;
      }

      // Activer le premium dans profiles
      const { error: profileError } = await supabase.rpc('activate_premium', {
        p_user_id: userId,
        p_duration_days: 30
      });

      if (profileError) {
        console.error('❌ Erreur activation premium:', profileError);
        throw profileError;
      }

      console.log('✅ Premium activé pour user:', userId);
    } catch (error) {
      console.error('❌ Erreur sauvegarde Supabase:', error);
      throw error;
    }
  }

  async restorePurchases(userId: string): Promise<boolean> {
    try {
      console.log('🔄 Restauration des achats...');

      // Identifier l'utilisateur
      await Purchases.logIn(userId);

      // Restaurer les achats
      const customerInfo = await Purchases.restorePurchases();

      // Vérifier si Premium actif
      const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';

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
      await Purchases.logIn(userId);
      const customerInfo = await Purchases.getCustomerInfo();
      
      const isPremium = typeof customerInfo.entitlements.active['premium'] !== 'undefined';
      
      if (isPremium) {
        // Sync avec Supabase
        await this.savePurchaseToSupabase(userId, customerInfo);
      }

      return isPremium;
    } catch (error) {
      console.error('❌ Erreur vérification status:', error);
      return false;
    }
  }
}

export const iapService = new IAPService();
