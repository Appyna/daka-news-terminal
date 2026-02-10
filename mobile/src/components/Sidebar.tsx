import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, StatusBar, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants';
import Svg, { Path } from 'react-native-svg';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  currentCountry: string;
  currentSource: string;
  onSelectFlux: (country: string, source: string) => void;
  isPremium: boolean;
  onSettingsPress: () => void;
  onPremiumPress: () => void;
}

interface SourceItem {
  name: string;
  color: string;
  free_tier: boolean;
}

interface SourcesData {
  Israel: SourceItem[];
  France: SourceItem[];
  Monde: SourceItem[];
}

const LockIcon = () => (
  <Svg width={10} height={10} viewBox="0 0 12 16" fill={COLORS.accentYellow1}>
    <Path d="M10 5V3a4 4 0 00-8 0v2H1a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V6a1 1 0 00-1-1h-1zM4 3a2 2 0 114 0v2H4V3z" />
  </Svg>
);

export const Sidebar: React.FC<SidebarProps> = ({
  visible,
  onClose,
  currentCountry,
  currentSource,
  onSelectFlux,
  isPremium,
  onSettingsPress,
  onPremiumPress,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [sources, setSources] = useState<SourcesData>({ Israel: [], France: [], Monde: [] });
  const [loading, setLoading] = useState(true);

  // Charger les sources depuis l'API
  useEffect(() => {
    const loadSources = async () => {
      try {
        const response = await fetch('https://daka-news-backend.onrender.com/api/sources');
        const data = await response.json();
        if (data.success) {
          setSources(data.sources);
        }
      } catch (error) {
        console.error('Erreur chargement sources:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSources();
  }, []);

  useEffect(() => {
    if (visible) {
      // Réinitialiser la position AVANT d'animer
      slideAnim.setValue(-300);
      overlayOpacity.setValue(0);
      
      // Animer DOUCEMENT
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600, // Plus lent
          easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Courbe très douce
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, overlayOpacity]);

  const handleSourcePress = (country: string, sourceName: string, isFree: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isLocked = !isPremium && !isFree;
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onPremiumPress();
    } else {
      onSelectFlux(country, sourceName);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          }
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.liveIndicator}>
                <Text style={styles.liveGreenDot}>● </Text>LIVE
              </Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>
            <Text style={styles.headerSubtitle}>Sélectionner une source d'infos</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Chargement des sources...</Text>
              </View>
            ) : (
              Object.entries(sources).map(([country, sourcesList]) => (
                <View key={country} style={styles.categoryBlock}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryTitle}>• {country.toUpperCase()}</Text>
                  </View>
                  <View style={styles.sourcesContainer}>
                    {sourcesList.map((sourceItem) => {
                      const isLocked = !isPremium && !sourceItem.free_tier;
                      const isActive = currentCountry === country && currentSource === sourceItem.name;

                      return (
                        <Pressable
                          key={sourceItem.name}
                          onPress={() => handleSourcePress(country, sourceItem.name, sourceItem.free_tier)}
                          style={[styles.sourceRow, isActive && styles.sourceRowActive]}
                        >
                          <Text
                            style={[
                              styles.sourceText,
                              isActive && styles.sourceTextActive,
                              isLocked && styles.sourceTextLocked,
                            ]}
                            numberOfLines={1}
                          >
                            · {sourceItem.name}
                          </Text>
                          {isLocked && (
                            <View style={styles.lockIconContainer}>
                              <LockIcon />
                            </View>
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.aiDisclaimerText}>
              Actualités traduites par intelligence artificielle. Des erreurs peuvent survenir.
            </Text>
            <Pressable onPress={onSettingsPress} style={styles.settingsIcon} hitSlop={8}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={2}>
                <Path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </Svg>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-start',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 300,
    height: '100%',
    backgroundColor: '#1A1838', // COLORS.dark2 (spec exacte)
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  liveGreenDot: {
    color: '#00FF00',
    fontSize: 16,
  },
  closeButton: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '300',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  categoryBlock: {
    marginTop: 20,
  },
  categoryHeader: {
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentYellow1,
    letterSpacing: 0.8,
  },
  sourcesContainer: {
    gap: 0,
    paddingLeft: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: 'transparent',
  },
  sourceRowActive: {
    backgroundColor: 'rgba(245, 197, 24, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accentYellow1,
    shadowColor: COLORS.accentYellow1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sourceText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  sourceTextActive: {
    color: COLORS.accentYellow1,
    fontWeight: '600',
  },
  sourceTextLocked: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  lockIconContainer: {
    marginLeft: 8,
    paddingLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  aiDisclaimerText: {
    flex: 1,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 13,
    marginRight: 12,
  },
  settingsIcon: {
    padding: 4,
  },
});
