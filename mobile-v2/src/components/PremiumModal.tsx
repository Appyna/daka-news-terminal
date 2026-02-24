import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, FREE_SOURCES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { apiService } from '../services/apiService';
import { supabase } from '../services/supabaseClient';
import { iapService } from '../services/IAPService';
import Svg, { Path, Circle } from 'react-native-svg';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  wasInSignupFlow?: boolean;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ visible, onClose, wasInSignupFlow = false }) => {
  const { user, profile } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [loading, setLoading] = useState(false);
  const [localizedPrice, setLocalizedPrice] = useState('1,99 €');
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSub, setLoadingSub] = useState(false);

  const isPremium = Boolean(
    profile?.is_premium &&
    (!profile.premium_until || new Date(profile.premium_until) > new Date())
  );

  // Charger l'abonnement si Premium
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user || !isPremium) return;
      
      setLoadingSub(true);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();
        
        if (!error && data) {
          setSubscription(data);
        }
      } catch (err) {
        console.error('Erreur chargement abonnement:', err);
      } finally {
        setLoadingSub(false);
      }
    };

    if (visible) {
      fetchSubscription();
    }
  }, [user, isPremium, visible]);

  // 🎯 Récupérer le prix localisé au chargement du modal
  useEffect(() => {
    if (visible) {
      fetchLocalizedPrice();
    }
  }, [visible]);

  const fetchLocalizedPrice = async () => {
    try {
      const price = await iapService.getLocalizedPrice();
      setLocalizedPrice(price);
    } catch (error) {
      console.warn('Failed to fetch localized price, using default', error);
    } finally {
      setLoadingPrice(false);
    }
  };

  // Si l'utilisateur vient de s'inscrire, montrer l'écran de transition
  useEffect(() => {
    if (visible && wasInSignupFlow && user) {
      setShowTransition(true);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            redirectToCheckout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [visible, wasInSignupFlow, user]);

  const redirectToCheckout = async () => {
    if (!user || !profile) return;
    setLoading(true);
    
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Utiliser l'IAP natif sur mobile
        console.log('💳 Lancement IAP natif...');
        const success = await iapService.purchasePremium(user.id);
        if (success) {
          // ✅ Forcer le rechargement du profil après achat
          setTimeout(async () => {
            await iapService.syncPremiumStatusOnStartup(user.id);
            Alert.alert(
              'Succès',
              'Votre abonnement Premium a été activé ! Redémarrez l\'app pour voir vos sources premium.',
              [{ text: 'OK', onPress: onClose }]
            );
          }, 2000); // Attendre 2s pour laisser RevenueCat traiter
          console.log('✅ Abonnement Premium activé');
        }
      } else {
        // Stripe web pour le web
        console.log('💳 Lancement Stripe checkout (web)...');
        const response = await apiService.createStripeCheckoutSession(user.id, profile.email);
        Linking.openURL(response.url);
        console.log('✅ Redirection vers Stripe checkout');
      }
    } catch (err) {
      console.error('❌ Erreur paiement:', err);
      Alert.alert('Erreur', (err as Error).message || 'Impossible de finaliser le paiement. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  if (showAuth) {
    return <AuthModal visible={true} onClose={() => setShowAuth(false)} redirectToPremium={true} initialTab="signup" />;
  }

  // Si déjà Premium, ne rien afficher (gestion via TopBar uniquement)
  if (isPremium && user) {
    return null;
  }

  if (showTransition) {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.transitionContainer}>
            {/* Checkmark jaune */}
            <View style={styles.checkmarkCircle}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 6L9 17l-5-5"
                  stroke={COLORS.accentYellow1}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>

            <Text style={styles.transitionTitle}>Compte créé avec succès !</Text>
            <Text style={styles.transitionSubtitle}>
              Vous allez être redirigé vers la page de paiement dans {countdown} secondes...
            </Text>

            <Pressable
              style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
              onPress={redirectToCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.dark1} />
              ) : (
                <Text style={styles.ctaText}>Poursuivre →</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalContainer}>
            {/* Barre jaune en haut */}
            <View style={styles.topBar} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                Accédez à toutes les actualités mondiales en temps réel en Français
              </Text>
            </View>

            {/* Fonctionnalités avec points jaunes */}
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <View style={styles.bullet} />
                <Text style={styles.featureText}>20 sources en Israël, en France et dans le monde</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.bullet} />
                <Text style={styles.featureText}>Infos en continu 24h/24 • 7j/7 en français</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.bullet} />
                <Text style={styles.featureText}>Notifications pour rester alerté</Text>
              </View>
              <View style={styles.featureItem}>
                <View style={styles.bullet} />
                <Text style={styles.featureText}>Sans engagement — annulez quand vous le souhaitez</Text>
              </View>
            </View>

            {/* Prix */}
            <View style={styles.pricingSection}>
              {loadingPrice ? (
                <ActivityIndicator color={COLORS.accentYellow1} size="small" />
              ) : (
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{localizedPrice}</Text>
                  <Text style={styles.priceSubtext}> /mois</Text>
                </View>
              )}
            </View>

            {/* CTA et Retour avec vrais boutons */}
            <View style={styles.actionsRow}>
              {user ? (
                <>
                  <Pressable 
                    style={[styles.ctaButton, loading && styles.ctaButtonLoading]} 
                    onPress={redirectToCheckout}
                    disabled={loading}
                  >
                    <View style={styles.ctaContent}>
                      {loading && (
                        <ActivityIndicator 
                          color={COLORS.dark1} 
                          size="small" 
                          style={styles.ctaSpinner}
                        />
                      )}
                      <Text style={styles.ctaText}>Accéder en illimité</Text>
                    </View>
                  </Pressable>
                </>
              ) : (
                <Pressable style={styles.ctaButton} onPress={() => setShowAuth(true)}>
                  <Text style={styles.ctaText}>Accéder en illimité</Text>
                </Pressable>
              )}
            </View>

            <Pressable style={styles.backButton} onPress={onClose}>
              <Text style={styles.backText}>Retour</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Pressable>
    </Modal>
  );
};

const Feature = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={COLORS.accentYellow1}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#1F1D3A',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
  },
  topBar: {
    height: 6,
    backgroundColor: COLORS.accentYellow1,
  },
  header: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(245, 197, 24, 0.15)',
  },
  headerTitle: {
    fontSize: 19.5,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 26,
  },
  features: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    paddingTop: 28,
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.accentYellow1,
    marginTop: 7,
    flexShrink: 0,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
    lineHeight: 21,
  },
  pricingSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  price: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.accentYellow1,
    letterSpacing: -1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  priceSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  priceIsrael: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 8,
  },
  actionsRow: {
    paddingHorizontal: 28,
    paddingTop: 4,
    paddingBottom: 12,
  },
  ctaButton: {
    backgroundColor: COLORS.accentYellow1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: COLORS.accentYellow1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  restoreButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  restoreText: {
    color: COLORS.accentYellow1,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  ctaButtonLoading: {
    opacity: 0.8,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSpinner: {
    marginRight: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    color: COLORS.dark1,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 15,
  },
  backButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    paddingBottom: 20,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  // Transition screen styles
  transitionContainer: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: COLORS.dark2,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.accentYellow1,
  },
  transitionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  transitionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
});
