import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, PanResponder, Alert, Linking, Text } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { TopBar } from './src/components/TopBar';
import { Sidebar } from './src/components/Sidebar';
import { NewsColumn } from './src/components/NewsColumn';
import { AuthModal } from './src/components/AuthModal';
import { PremiumModal } from './src/components/PremiumModal';
import { SettingsModal } from './src/components/SettingsModal';
import { Logo } from './src/components/Logo';
import { apiService } from './src/services/apiService';
// import { iapService } from './src/services/IAPService'; // TODO: Réactiver après fix Expo IAP
import { Article } from './src/types';
import { COLORS, FREE_SOURCES } from './src/constants';
import { registerForPushNotifications, addNotificationReceivedListener, addNotificationResponseReceivedListener } from './src/services/notificationService';
import Constants from 'expo-constants';
import { supabase } from './src/services/supabaseClient';

// Initialiser Sentry
Sentry.init({
  dsn: Constants.expoConfig?.extra?.sentry?.dsn,
  debug: false, // Mettre à true pour debug
  tracesSampleRate: 1.0, // 100% des transactions (ajuster à 0.2 en prod si besoin)
  environment: __DEV__ ? 'development' : 'production',
});

function MainApp() {
  const { user, profile, isPremium, loading: authLoading } = useAuth();
  const [currentCountry, setCurrentCountry] = useState('Israel');
  const [currentSource, setCurrentSource] = useState('Ynet');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedNewsId, setFocusedNewsId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Initialiser IAP au démarrage
  useEffect(() => {
    // TODO: Réactiver après fix Expo IAP
    /*
    const initIAP = async () => {
      try {
        await iapService.initialize();
        console.log('✅ IAP initialisé');
      } catch (err) {
        console.error('❌ Erreur init IAP:', err);
      }
    };

    initIAP();

    return () => {
      iapService.disconnect();
    };
    */
  }, []);

  // Enregistrer les notifications
  useEffect(() => {
    registerForPushNotifications()
      .then(async token => {
        
        if (token) {
          const deviceId = Constants.installationId || Constants.sessionId || 'unknown-device';
          console.log('� Push token enregistré');
          
          try {
            const { error } = await supabase
              .from('user_push_tokens')
              .upsert({
                device_id: deviceId,
                push_token: token,
                user_id: user?.id || null,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'device_id',
                ignoreDuplicates: false
              });
            
            if (error && error.code !== '23505') {
              console.error('❌ Erreur sauvegarde token:', error);
            } else {
              console.log('✅ Token sauvegardé');
            }
          } catch (error: any) {
            console.error('❌ Exception:', error);
          }
        }
      });

    const receivedListener = addNotificationReceivedListener(notification => {
      console.log('🔔 Notification reçue:', notification);
      Alert.alert(
        notification.request.content.title || 'Notification',
        notification.request.content.body || '',
        [{ text: 'OK' }]
      );
    });

    const responseListener = addNotificationResponseReceivedListener(() => {
      console.log('👆 Notification cliquée');
    });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, [user]);

  // Swipe pour ouvrir sidebar
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.pageX < 30,
      onMoveShouldSetPanResponder: (evt, gestureState) => 
        Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 30,
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 80) {
          setSidebarVisible(true);
        }
      },
    })
  ).current;

  // Charger articles de la source sélectionnée
  useEffect(() => {
    if (currentSource) {
      loadArticles(currentSource);
      const interval = setInterval(() => loadArticles(currentSource), 3 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentSource]);

  const loadArticles = async (sourceName: string, isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const data = await apiService.getNews();
      const filtered = data.articles.filter((a: Article) => a.source === sourceName);
      const sorted = filtered.sort((a: Article, b: Article) => 
        new Date(b.pub_date).getTime() - new Date(a.pub_date).getTime()
      );
      setArticles(sorted);
      setError(null);
    } catch (error: any) {
      console.error(`Error loading ${sourceName}:`, error);
      const errorMsg = error.message === 'Request timeout' 
        ? 'La requête a expiré. Vérifiez votre connexion.'
        : 'Impossible de charger les articles. Vérifiez votre connexion.';
      setError(errorMsg);
      setArticles([]);
      
      // Afficher alerte seulement si pas en refresh
      if (!isRefreshing) {
        Alert.alert(
          'Erreur de connexion',
          errorMsg,
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Réessayer', onPress: () => loadArticles(sourceName) }
          ]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (currentSource) {
      loadArticles(currentSource, true);
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
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('platform')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const platform = sub?.platform || 'stripe';

      if (platform === 'stripe') {
        Alert.alert('Info', 'Gestion disponible sur web');
      } else if (platform === 'apple') {
        Linking.openURL('https://apps.apple.com/account/subscriptions');
      } else if (platform === 'google') {
        Linking.openURL('https://play.google.com/store/account/subscriptions');
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
      Alert.alert('Erreur', 'Impossible d\'ouvrir la page de gestion');
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
          refreshing={refreshing}
          onRefresh={handleRefresh}
          error={error}
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
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
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
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.dark1,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.accentYellow1,
    letterSpacing: 6,
  },
  logoSubtext: {
    fontSize: 22,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 10,
    marginTop: -4,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 24,
  },
});
