import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, FlatList, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { TopBar } from './src/components/TopBar';
import { Sidebar } from './src/components/Sidebar';
import { NewsColumn } from './src/components/NewsColumn';
import { AuthModal } from './src/components/AuthModal';
import { PremiumModal } from './src/components/PremiumModal';
import { SettingsModal } from './src/components/SettingsModal';
import { apiService } from './src/services/apiService';
import { Article } from './src/types';
import { COLORS, FREE_SOURCES } from './src/constants';

function MainApp() {
  const { user, profile } = useAuth();
  const [selectedSource, setSelectedSource] = useState<string | null>('Ynet');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [focusedNewsId, setFocusedNewsId] = useState<string | null>(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [premiumModalVisible, setPremiumModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  const isPremium = profile?.subscription_tier === 'PREMIUM';

  useEffect(() => {
    if (selectedSource) {
      loadArticles(selectedSource);
    }
  }, [selectedSource]);

  const loadArticles = async (sourceName: string) => {
    setLoading(true);
    try {
      const data = await apiService.getFeeds(sourceName);
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceSelect = (sourceName: string) => {
    const isFree = FREE_SOURCES.includes(sourceName);
    if (!isFree && !isPremium) {
      setPremiumModalVisible(true);
    } else {
      setSelectedSource(sourceName);
      setFocusedNewsId(null);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      setPremiumModalVisible(false);
      setAuthModalVisible(true);
      return;
    }

    try {
      const { url } = await apiService.createStripeCheckoutSession(user.id);
      Linking.openURL(url);
    } catch (error) {
      console.error('Error creating checkout:', error);
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
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <TopBar
        onAuthPress={() => setAuthModalVisible(true)}
        onPremiumPress={() => setPremiumModalVisible(true)}
        onManageSubscription={handleManageSubscription}
      />

      <View style={styles.main}>
        <Sidebar
          selectedSource={selectedSource}
          onSourceSelect={handleSourceSelect}
          onSettingsPress={() => setSettingsModalVisible(true)}
          onPremiumPress={() => setPremiumModalVisible(true)}
        />

        <NewsColumn
          sourceName={selectedSource || ''}
          articles={articles}
          loading={loading}
          focusedNewsId={focusedNewsId}
          onItemPress={(item) => setFocusedNewsId(prev => prev === item.id ? null : item.id)}
        />
      </View>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      <PremiumModal
        visible={premiumModalVisible}
        onClose={() => setPremiumModalVisible(false)}
        onPurchase={handlePurchase}
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
    flexDirection: 'row',
  },
});
