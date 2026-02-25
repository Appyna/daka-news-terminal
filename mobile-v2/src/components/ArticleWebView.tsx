import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../constants';

interface ArticleWebViewProps {
  visible: boolean;
  url: string;
  category: string;
  onClose: () => void;
}

export const ArticleWebView: React.FC<ArticleWebViewProps> = ({ visible, url, category, onClose }) => {
  const [isTranslated, setIsTranslated] = useState(false);

  // Déterminer la langue source selon la catégorie
  const getSourceLanguage = () => {
    if (category === 'Israel') return 'he'; // Hébreu
    if (category === 'Monde') return 'en'; // Anglais
    return null; // France = pas de traduction
  };

  const sourceLang = getSourceLanguage();
  const shouldShowTranslateButton = sourceLang !== null;

  // URL à afficher (originale ou traduite)
  const displayUrl = isTranslated && sourceLang
    ? `https://translate.google.com/translate?sl=${sourceLang}&tl=fr&u=${encodeURIComponent(url)}`
    : url;

  const handleToggleTranslation = () => {
    setIsTranslated(!isTranslated);
  };

  // Reset translation state when modal closes
  const handleClose = () => {
    setIsTranslated(false);
    onClose();
  };
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>← Retour</Text>
          </TouchableOpacity>
          
          {shouldShowTranslateButton && (
            <TouchableOpacity 
              style={styles.translateButton} 
              onPress={handleToggleTranslation}
            >
              <Text style={styles.translateMainText}>
                {isTranslated ? 'Revenir à l\'original' : 'Traduire'}
              </Text>
              {!isTranslated && (
                <Text style={styles.translateSubText}>Google Traduction</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <WebView
          source={{ uri: displayUrl }}
          style={styles.webview}
          key={displayUrl}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={COLORS.accentYellow1} />
              <Text style={styles.loadingText}>Chargement...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark1,
  },
  header: {
    height: 56,
    backgroundColor: COLORS.dark2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeText: {
    color: COLORS.accentYellow1,
    fontSize: 16,
    fontWeight: '600',
  },
  translateButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.accentYellow1,
    borderRadius: 6,
    alignItems: 'center',
  },
  translateMainText: {
    color: COLORS.accentYellow1,
    fontSize: 14,
    fontWeight: '600',
  },
  translateSubText: {
    color: COLORS.accentYellow1,
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  webview: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.dark1,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    marginTop: 12,
  },
});
