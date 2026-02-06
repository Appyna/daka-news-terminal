import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { COLORS, FREE_SOURCES } from '../constants';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ visible, onClose, onPurchase }) => {
  const freeSources = [
    { name: 'Ynet', country: 'Israel' },
    { name: 'BFM TV', country: 'France' },
    { name: 'BBC World', country: 'Monde' },
  ];

  const premiumFeatures = [
    'Accès illimité à toutes les sources',
    'Notifications push en temps réel',
    'Aucune publicité',
    'Support prioritaire',
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.container}>
          {/* Header gradient */}
          <View style={styles.headerGradient} />
          
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.emoji}>⭐</Text>
            <Text style={styles.title}>DAKA News Premium</Text>
            <Text style={styles.subtitle}>
              Accédez à toutes les sources d'infos en temps réel
            </Text>

            {/* Free sources */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sources gratuites</Text>
              {freeSources.map((source, index) => (
                <View key={index} style={styles.sourceItem}>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>GRATUIT</Text>
                  </View>
                  <Text style={styles.sourceName}>{source.name}</Text>
                  <Text style={styles.sourceCountry}>({source.country})</Text>
                </View>
              ))}
            </View>

            {/* Premium features */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Avec Premium</Text>
              {premiumFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={styles.price}>9,99 €</Text>
              <Text style={styles.priceSubtext}>par mois</Text>
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.ctaButton} onPress={onPurchase}>
              <Text style={styles.ctaText}>Devenir Premium</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Annulation possible à tout moment. Renouvellement automatique.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    backgroundColor: COLORS.dark2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
  },
  headerGradient: {
    height: 4,
    backgroundColor: COLORS.accentYellow1,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '300',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.accentYellow1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    width: '100%',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  freeBadge: {
    backgroundColor: COLORS.accentYellow1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 12,
  },
  freeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.dark1,
  },
  sourceName: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
    flex: 1,
  },
  sourceCountry: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.accentYellow1,
    marginRight: 12,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 15,
    color: COLORS.white,
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.accentYellow1,
  },
  priceSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  ctaButton: {
    backgroundColor: COLORS.accentYellow1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  ctaText: {
    color: COLORS.dark1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
