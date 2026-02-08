import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, Linking, ActivityIndicator, Text, PanResponder, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { TopBar } from './src/components/TopBar';
import { Sidebar } from './src/components/Sidebar';
import { NewsColumn } from './src/components/NewsColumn';
import { AuthModal } from './src/components/AuthModal';
import { PremiumModal } from './src/components/PremiumModal';
import { SettingsModal } from './src/components/SettingsModal';
import { apiService } from './src/services/apiService';
import { Article, Source } from './src/types';
import { COLORS, FREE_SOURCES } from './src/constants';
import { registerForPushNotifications, addNotificationReceivedListener, addNotificationResponseReceivedListener } from './src/services/notificationService';
import Constants from 'expo-constants';

interface NewsColumnData {
  id: string;
  sourceName: string;
  country: string;
  articles: Article[];
  color: string;
}

function MainApp() {
  const { user, profile } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [currentCountry, setCurrentCountry] = useState('Israel');
  const [currentSource, setCurrentSource] = useState('Ynet');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedNewsId, setFocusedNewsId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const isPremium = profile?.subscription_tier === 'PREMIUM';

  // 🔔 Enregistrer les notifications au démarrage
  useEffect(() => {
    registerForPushNotifications().then(async token => {
      if (token) {
        const deviceId = Constants.installationId || Constants.sessionId || 'unknown-device';
        console.log('📱 Push token obtenu:', token);
        console.log('📱 Device ID:', deviceId);
        try {
          await apiService.savePushToken(deviceId, token, user?.id);
          console.log('✅ Token sauvegardé dans le backend (user:', user ? 'connecté' : 'anonyme', ')');
        } catch (error) {
          console.error('❌ Erreur save token:', error);
        }
      }
    });

    // Écouter les notifications reçues quand l'app est ouverte
    const receivedListener = addNotificationReceivedListener(notification => {
      console.log('🔔 Notification reçue:', notification);
      Alert.alert(
        notification.request.content.title || 'Nouvelle notification',
        notification.request.content.body || '',
        [{ text: 'OK' }]
      );
    });

    // Écouter les notifications cliquées (app fermée/background)
    const responseListener = addNotificationResponseReceivedListener(response => {
      console.log('👆 Notification cliquée:', response);
      // TODO: Naviguer vers l'article si l'ID est dans les données
      const articleId = response.notification.request.content.data?.articleId;
      if (articleId) {
        setFocusedNewsId(articleId as string);
      }
    });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, [user]);

  // Geste swipe pour ouvrir le sidebar
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Détecter si le geste commence depuis le bord gauche (< 30px)
        return evt.nativeEvent.pageX < 30;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Activer si swipe horizontal significatif
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 30;
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Si swipe vers la droite > 80px, ouvrir le sidebar
        if (gestureState.dx > 80) {
          setSidebarVisible(true);
        }
      },
    })
  ).current;

  // Charger les sources
  useEffect(() => {
    loadSources();
  }, []);

  // Charger les articles de la source sélectionnée
  useEffect(() => {
    if (currentSource) {
      loadArticles(currentSource);
      const interval = setInterval(() => loadArticles(currentSource), 3 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentSource]);

  const loadSources = async () => {
    try {
      const data = await apiService.getSources();
      setSources(data);
    } catch (error) {
      console.error('Error loading sources:', error);
    }
  };

  const loadArticles = async (sourceName: string) => {
    setLoading(true);
    try {
      const data = await apiService.getFeeds(sourceName);
      const sorted = data.sort((a, b) => 
        new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime()
      );
      setArticles(sorted);
    } catch (error) {
      console.error(`Error loading ${sourceName}:`, error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFlux = (country: string, sourceName: string) => {
    const isFree = FREE_SOURCES.includes(sourceName);
    if (!isFree && !isPremium) {
      setPremiumModalVisible(true);
      setSidebarVisible(false);
    } else {
      setCurrentCountry(country);
      setCurrentSource(sourceName);
      setFocusedNewsId(null);
      setSidebarVisible(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      const { url } = await apiService.createStripePortalSession(user.id);
      Linking.openURL(url);
    } catch (error) {
      console.error('Error creating portal:', error);
    }
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="light" />
      
      <TopBar
        onAuthPress={() => setAuthModalVisible(true)}
        onPremiumPress={() => setPremiumModalVisible(true)}
        onManageSubscription={handleManageSubscription}
        onMenuPress={() => setSidebarVisible(true)}
      />

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        currentCountry={currentCountry}
        currentSource={currentSource}
        onSelectFlux={handleSelectFlux}
        isPremium={isPremium}
        onSettingsPress={() => {
          setSidebarVisible(false);
          setSettingsModalVisible(true);
        }}
        onPremiumPress={() => {
          setSidebarVisible(false);
          setPremiumModalVisible(true);
        }}
      />

      <View style={styles.main}>
        <NewsColumn
          sourceName={currentSource}
          country={currentCountry}
          articles={articles}
          focusedNewsId={focusedNewsId}
          onItemFocus={setFocusedNewsId}
          loading={loading}
        />
      </View>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      <PremiumModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
      />

      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark1,
  },
  main: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.accentYellow1,
    fontSize: 14,
    fontWeight: '600',
  },
});
