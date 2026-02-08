import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
} from 'react-native';
import { COLORS } from '../constants';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const [showLegal, setShowLegal] = useState<'cgu' | 'privacy' | null>(null);

  const handleContact = () => {
    Linking.openURL('mailto:dakanewsapp@gmail.com');
  };

  const renderLegalContent = () => {
    if (!showLegal) return null;

    const title = showLegal === 'cgu' ? 'Conditions Générales' : 'Politique de Confidentialité';
    const content = showLegal === 'cgu'
      ? 'Contenu des CGU/CGV à rédiger...\n\nVeuillez accepter nos conditions d\'utilisation.'
      : 'Contenu de la Politique de Confidentialité à rédiger...\n\nNous respectons votre vie privée.';

    return (
      <Modal visible animationType="slide" transparent onRequestClose={() => setShowLegal(null)}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setShowLegal(null)} />
          
          <View style={styles.legalContainer}>
            <View style={styles.headerGradient} />
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowLegal(null)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.legalContent}>
              <Text style={styles.legalTitle}>{title}</Text>
              <Text style={styles.legalText}>{content}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={onClose} />
          
          <View style={styles.container}>
            <View style={styles.headerGradient} />
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content}>
              <TouchableOpacity style={styles.item} onPress={() => setShowLegal('cgu')}>
                <Text style={styles.itemText}>Conditions Générales (CGU/CGV)</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.item} onPress={() => setShowLegal('privacy')}>
                <Text style={styles.itemText}>Politique de Confidentialité</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.item} onPress={handleContact}>
                <Text style={styles.itemText}>Contactez-nous</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {renderLegalContent()}
    </>
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
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
  },
  legalContainer: {
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
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  itemText: {
    fontSize: 16,
    color: COLORS.white,
  },
  arrow: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  footer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: 24,
  },
  legalContent: {
    padding: 24,
  },
  legalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accentYellow1,
    marginBottom: 20,
  },
  legalText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 22,
  },
});
