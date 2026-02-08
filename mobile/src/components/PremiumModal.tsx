import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { COLORS, FREE_SOURCES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
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
      // TODO: Implémenter Stripe checkout
      // const response = await apiService.createStripeCheckoutSession(user.id, profile.email);
      // Linking.openURL(response.url);
      console.log('Redirection vers Stripe...');
    } catch (err) {
      console.error('Erreur Stripe:', err);
    } finally {
      setLoading(false);
    }
  };

  if (showAuth) {
    return <AuthModal visible={true} onClose={() => setShowAuth(false)} redirectToPremium={true} initialTab="signup" />;
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
                Toute l'actualité en Israël et dans le monde, en français et en temps réel
              </Text>
            </View>

            {/* Fonctionnalités avec points jaunes */}
            <View style={styles.features}>
              <View style={styles.featureItem}>
                <View style={styles.bullet} />
                <Text style={styles.featureText}>20+ sources en Israël, en France et dans le monde</Text>
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
              <Text style={styles.price}>1,99€</Text>
              <Text style={styles.priceSubtext}>/mois</Text>
            </View>

            {/* CTA et Retour avec vrais boutons */}
            <View style={styles.actionsRow}>
              {user ? (
                <Pressable style={styles.ctaButton} onPress={redirectToCheckout}>
                  <Text style={styles.ctaText}>Accéder en illimité</Text>
                </Pressable>
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.accentYellow1,
    textAlign: 'center',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  features: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    paddingTop: 20,
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
    fontSize: 44,
    fontWeight: '700',
    color: COLORS.accentYellow1,
    letterSpacing: -1,
  },
  priceSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: -2,
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
