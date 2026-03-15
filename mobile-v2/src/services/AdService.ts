import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ 
  ? TestIds.INTERSTITIAL 
  : 'ca-app-pub-9184646133625988/2386893406';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: false,
});

export const useInterstitialAds = () => {
  const appState = useRef(AppState.currentState);
  const initialTimerRef = useRef<NodeJS.Timeout>();
  const recurringTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Charger la première pub
    interstitial.load();

    // Événements
    const loadedListener = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Interstitial ad loaded');
    });

    const errorListener = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('❌ Interstitial ad error:', error);
      interstitial.load(); // Recharger
    });

    const closedListener = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('📱 Interstitial ad closed');
      interstitial.load(); // Recharger pour la prochaine
    });

    // Timer initial (30s)
    initialTimerRef.current = setTimeout(() => {
      if (interstitial.loaded) {
        interstitial.show();
      }
      
      // Timer récurrent (2 minutes)
      recurringTimerRef.current = setInterval(() => {
        if (interstitial.loaded) {
          interstitial.show();
        }
      }, 120000); // 2 minutes
    }, 30000); // 30 secondes

    // Cleanup
    return () => {
      loadedListener();
      errorListener();
      closedListener();
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current);
      if (recurringTimerRef.current) clearInterval(recurringTimerRef.current);
    };
  }, []);
};
