import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-9184646133625988/2386893406';

let interstitial: InterstitialAd | null = null;
let lastAdShown = 0;
let initialTimer: NodeJS.Timeout | null = null;
let recurringTimer: NodeJS.Timeout | null = null;

// Créer et charger une interstitielle
const loadInterstitial = () => {
  if (interstitial) {
    interstitial = null;
  }

  interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    console.log('✅ Interstitial ad loaded');
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('🚪 Interstitial ad closed');
    lastAdShown = Date.now();
    loadInterstitial(); // Recharger pour la prochaine
  });

  interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    console.log('❌ Interstitial ad error:', error);
    loadInterstitial(); // Réessayer
  });

  interstitial.load();
};

// Afficher l'interstitielle si elle est prête
export const showInterstitialAd = async () => {
  const now = Date.now();
  const timeSinceLastAd = now - lastAdShown;

  // Bloquer si moins de 2 minutes depuis la dernière pub
  if (lastAdShown > 0 && timeSinceLastAd < 120000) {
    console.log('⏳ Interstitial ad cooldown:', Math.round((120000 - timeSinceLastAd) / 1000), 'seconds remaining');
    return;
  }

  if (interstitial && interstitial.loaded) {
    await interstitial.show();
  } else {
    console.log('⚠️ Interstitial ad not ready yet');
  }
};

// Hook pour gérer les interstitielles automatiques
export const useInterstitialAds = () => {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Charger la première interstitielle
    loadInterstitial();

    // Timer initial : afficher après 30 secondes
    initialTimer = setTimeout(() => {
      showInterstitialAd();

      // Puis toutes les 2 minutes
      recurringTimer = setInterval(() => {
        showInterstitialAd();
      }, 120000); // 2 minutes
    }, 30000); // 30 secondes

    // Écouter quand l'app revient au premier plan
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App is now active');
        showInterstitialAd(); // Afficher quand l'user revient
      }
      appState.current = nextAppState;
    });

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (recurringTimer) clearInterval(recurringTimer);
      subscription.remove();
      if (interstitial) {
        interstitial = null;
      }
    };
  }, []);

  return { showInterstitialAd };
};
