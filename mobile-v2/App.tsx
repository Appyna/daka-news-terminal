import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, PanResponder, Alert, Linking, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as TrackingTransparency from 'expo-tracking-transparency';
import mobileAds from 'react-native-google-mobile-ads';
import { init, track } from '@amplitude/analytics-react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { TopBar } from './src/components/TopBar';
import { Sidebar } from './src/components/Sidebar';
import { NewsColumn } from './src/components/NewsColumn';
import { AuthModal } from './src/components/AuthModal';
import { PremiumModal } from './src/components/PremiumModal';
import { SettingsModal } from './src/components/SettingsModal';
import { Logo } from './src/components/Logo';
import { AdBanner } from './src/components/AdBanner';
import { useInterstitialAds } from './src/services/AdService';
import { apiService } from './src/services/apiService';
import { iapService } from './src/services/IAPService';
import { Article } from './src/types';
import { COLORS, FREE_SOURCES } from './src/constants';
import { registerForPushNotifications, addNotificationReceivedListener, addNotificationResponseReceivedListener } from './src/services/notificationService';
import Constants from 'expo-constants';
import { supabase } from './src/services/supabaseClient';

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
  const [hasRequestedTracking, setHasRequestedTracking] = useState(false);

  // ✅ Initialiser AdMob au démarrage
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('✅ AdMob initialized:', adapterStatuses);
      })
      .catch(error => {
        console.error('❌ AdMob initialization error:', error);
      });
  }, []);

  // ✅ Initialiser Amplitude Analytics et logger app_open
  useEffect(() => {
    const initAnalytics = () => {
      try {
        // Initialisation synchrone pour v1.5.46
        init('8f63ff00db47ed0d87fd3e308c40239b', undefined, {
          trackingOptions: {
            ipAddress: false,
          },
        });
        track('app_open');
        console.log('✅ Amplitude Analytics initialized');
      } catch (error) {
        console.warn('⚠️ Amplitude Analytics error:', error);
      }
    };
    initAnalytics();
  }, []);

  // ✅ Activer les interstitielles automatiques
  useInterstitialAds();

  // ✅ Demander ATT après que l'app soit chargée ET visible
  useEffect(() => {
    const requestTracking = async () => {
      // Éviter les demandes multiples
      if (hasRequestedTracking) return;
      
      try {
        // 1. Vérifier d'abord le status actuel
        const { status: currentStatus } = await TrackingTransparency.getTrackingPermissionsAsync();
        console.log('📊 ATT Status actuel:', currentStatus);
        
        // Si déjà déterminé, ne pas redemander
        if (currentStatus !== 'undetermined') {
          console.log('✅ ATT déjà déterminé:', currentStatus);
          setHasRequestedTracking(true);
          return;
        }
        
        // 2. Attendre que l'UI soit complètement stable
        console.log('⏳ Attente 8 secondes pour stabilité UI...');
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        // 3. Demander la permission
        console.log('🔔 Demande de permission ATT...');
        const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
        console.log('📊 ATT Status après demande:', status);
        
        setHasRequestedTracking(true);
        
        if (status === 'granted') {
          console.log('✅ Tracking autorisé par l\'utilisateur');
        } else {
          console.log('❌ Tracking refusé par l\'utilisateur');
        }
      } catch (error) {
        console.error('❌ Erreur ATT:', error);
        setHasRequestedTracking(true); // Marquer comme tenté même en cas d'erreur
      }
    };

    // Uniquement demander quand l'app est stable
    if (!loading && !authLoading && !hasRequestedTracking) {
      requestTracking();
    }
  }, [loading, authLoading, hasRequestedTracking]);

  // ✅ Initialiser IAP et synchroniser le statut premium au démarrage
  useEffect(() => {
    const initIAPAndSync = async () => {
      try {
        await iapService.initialize();
        console.log('✅ IAP initialisé');

        // Si utilisateur connecté, vérifier et synchroniser le statut premium
        if (user?.id) {
          await iapService.syncPremiumStatusOnStartup(user.id);
        }
      } catch (err) {
        console.error('❌ Erreur init IAP:', err);
      }
    };

    initIAPAndSync();
  }, []);

  // ✅ Re-synchroniser le statut premium quand l'utilisateur se connecte
  useEffect(() => {
    if (user?.id && !authLoading) {
      const syncPremium = async () => {
        try {
          await iapService.syncPremiumStatusOnStartup(user.id);
        } catch (err) {
          console.error('❌ Erreur sync premium:', err);
        }
      };
      
      syncPremium();
    }
  }, [user?.id, authLoading]);

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
        ? 'La requête a expiré. Glissez vers le bas pour actualiser ou vérifiez votre connexion.'
        : 'Impossible de charger les articles. Glissez vers le bas pour actualiser ou vérifiez votre connexion.';
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
    // ✅ Build 26 : Toutes les sources sont accessibles gratuitement
    setCurrentCountry(country);
    setCurrentSource(sourceName);
    setFocusedNewsId(null);
    setSidebarVisible(false);
    
    // ✅ Logger l'événement screen_view pour Amplitude Analytics
    try {
      track('screen_view', {
        source: sourceName,
        country: country,
      });
    } catch (error) {
      console.warn('⚠️ Analytics track error:', error);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    try {
      console.log('🔧 Gestion abonnement - User ID:', user.id);
      
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('platform')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      console.log('🔍 Subscription data:', sub);
      console.log('🔍 Subscription error:', subError);

      const platform = sub?.platform || 'stripe';
      console.log('📱 Platform détectée:', platform);

      if (platform === 'stripe') {
        Alert.alert('Info', 'Gestion disponible sur web');
      } else if (platform === 'apple') {
        console.log('🍎 Ouverture réglages iOS...');
        const url = 'https://apps.apple.com/account/subscriptions';
        const canOpen = await Linking.canOpenURL(url);
        console.log('🔗 Can open URL?', canOpen);
        
        if (canOpen) {
          await Linking.openURL(url);
          console.log('✅ URL ouverte');
        } else {
          Alert.alert('Erreur', 'Impossible d\'ouvrir les réglages');
        }
      } else if (platform === 'google') {
        Linking.openURL('https://play.google.com/store/account/subscriptions');
      }
    } catch (error) {
      console.error('❌ Error managing subscription:', error);
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

      {/* ✅ Bannière publicitaire en bas */}
      <AdBanner />

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
