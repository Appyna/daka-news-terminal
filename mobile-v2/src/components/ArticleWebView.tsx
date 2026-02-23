import React, { useState, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../constants';
import { translateWithNLLB } from '../services/nllbService';
import { applyTranslationRules } from '../services/translationRules';
import { useNLLBModel } from '../hooks/useNLLBModel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ArticleWebViewProps {
  visible: boolean;
  url: string;
  category: string; // 'Israel', 'France', 'Monde'
  onClose: () => void;
}

export const ArticleWebView: React.FC<ArticleWebViewProps> = ({ 
  visible, 
  url, 
  category,
  onClose 
}) => {
  const webViewRef = useRef<WebView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // 0 = original, 1 = translated
  
  const { isModelReady, isDownloading, downloadProgress } = useNLLBModel();
  
  // Masquer bouton Traduire pour catégorie France
  const showTranslateButton = category !== 'France';

  /**
   * Extrait tout le texte de la page web
   */
  const extractPageText = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const jsCode = `
        (function() {
          var text = document.body.innerText;
          window.ReactNativeWebView.postMessage(text);
        })();
        true;
      `;
      
      // Handler temporaire pour recevoir le message
      let messageReceived = false;
      const handleMessage = (event: any) => {
        if (!messageReceived) {
          messageReceived = true;
          resolve(event.nativeEvent.data);
        }
      };
      
      // Injection avec handler onMessage
      const originalOnMessage = webViewRef.current?.props.onMessage;
      if (webViewRef.current) {
        (webViewRef.current as any).props = {
          ...webViewRef.current.props,
          onMessage: handleMessage,
        };
      }
      
      webViewRef.current?.injectJavaScript(jsCode);
      
      // Timeout sécurité (5 secondes)
      setTimeout(() => {
        if (!messageReceived) {
          resolve('');
          // Restaurer handler original
          if (webViewRef.current && originalOnMessage) {
            (webViewRef.current as any).props.onMessage = originalOnMessage;
          }
        }
      }, 5000);
    });
  }, []);

  /**
   * Lance la traduction de l'article
   */
  const handleTranslate = useCallback(async () => {
    // Si déjà traduit, basculer vers page traduite
    if (translatedText) {
      scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
      setCurrentPage(1);
      return;
    }

    // Vérifier si modèle prêt
    if (!isModelReady) {
      if (isDownloading) {
        Alert.alert(
          'Téléchargement en cours',
          `Le modèle de traduction est en cours de téléchargement (${downloadProgress}%). Veuillez patienter...`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Modèle non disponible',
          'Le modèle de traduction n\'est pas encore disponible. Veuillez réessayer dans quelques instants.',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    setIsTranslating(true);

    try {
      // 1. Extraire texte de la page
      const pageText = await extractPageText();
      
      if (!pageText || pageText.trim().length === 0) {
        throw new Error('Impossible d\'extraire le texte de l\'article');
      }

      // 2. Traduire avec NLLB selon la catégorie
      let rawTranslation: string;
      if (category === 'Israel') {
        rawTranslation = await translateWithNLLB(pageText, 'he', 'fr');
      } else if (category === 'Monde') {
        rawTranslation = await translateWithNLLB(pageText, 'en', 'fr');
      } else {
        throw new Error('Catégorie non supportée pour traduction');
      }

      // 3. Appliquer règles de post-traitement (scripts regex)
      const refinedTranslation = applyTranslationRules(
        rawTranslation, 
        category as 'Israel' | 'Monde'
      );

      // 4. Sauvegarder et afficher
      setTranslatedText(refinedTranslation);
      setIsTranslating(false);
      
      // Basculer vers page traduite
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
        setCurrentPage(1);
      }, 100);

    } catch (error) {
      setIsTranslating(false);
      console.error('Translation error:', error);
      Alert.alert(
        'Erreur de traduction',
        'Impossible de traduire cet article. Veuillez réessayer.',
        [{ text: 'OK' }]
      );
    }
  }, [
    translatedText, 
    isModelReady, 
    isDownloading, 
    downloadProgress, 
    category, 
    extractPageText
  ]);

  /**
   * Revenir à la page originale
   */
  const handleBackToOriginal = useCallback(() => {
    scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    setCurrentPage(0);
  }, []);

  /**
   * Gestion du scroll manuel (swipe)
   */
  const handleScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentPage(page);
  }, []);

  /**
   * Détermine le texte du bouton selon page active
   */
  const getButtonText = () => {
    if (currentPage === 1) {
      return 'Revenir à l\'original';
    }
    return 'Traduire';
  };

  const getButtonAction = () => {
    if (currentPage === 1) {
      return handleBackToOriginal;
    }
    return handleTranslate;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header avec bouton Traduire/Revenir */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>← Retour</Text>
          </TouchableOpacity>
          
          {showTranslateButton && !isTranslating && (
            <TouchableOpacity 
              style={styles.translateButton} 
              onPress={getButtonAction()}
            >
              <Text style={styles.translateText}>{getButtonText()}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Loading overlay pendant traduction */}
        {isTranslating && (
          <View style={styles.translatingOverlay}>
            <ActivityIndicator size="large" color={COLORS.accentYellow1} />
            <Text style={styles.translatingText}>Traduction en cours...</Text>
          </View>
        )}

        {/* ScrollView horizontal : Page originale ←→ Page traduite */}
        {!isTranslating && (
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            scrollEnabled={translatedText !== null}
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Page 1 : WebView originale */}
            <View style={styles.page}>
              <WebView
                ref={webViewRef}
                source={{ uri: url }}
                style={styles.webview}
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.loading}>
                    <ActivityIndicator size="large" color={COLORS.accentYellow1} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                  </View>
                )}
              />
            </View>

            {/* Page 2 : Traduction (si disponible) */}
            {translatedText && (
              <View style={styles.page}>
                <ScrollView style={styles.translationScroll}>
                  <Text style={styles.translatedText}>{translatedText}</Text>
                </ScrollView>
              </View>
            )}
          </ScrollView>
        )}
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  translateText: {
    color: COLORS.accentYellow1,
    fontSize: 16,
    fontWeight: '600',
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
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
  translatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.dark1,
    zIndex: 1000,
  },
  translatingText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginTop: 16,
  },
  translationScroll: {
    flex: 1,
    backgroundColor: COLORS.dark1,
  },
  translatedText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    padding: 20,
  },
});

