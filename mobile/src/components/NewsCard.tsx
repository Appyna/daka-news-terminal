import React from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Article } from '../types';
import { COLORS } from '../constants';

interface NewsCardProps {
  article: Article;
  isFocused: boolean;
  onPress: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, isFocused, onPress }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleShare = async (e: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `DAKA News | ${article.source} · ${article.title}\n\nhttps://daka-news.com`,
        // Note: L'image sera ajoutée dans le build production (pas disponible dans Expo Go)
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const isRTL = article.country === 'Israel';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        isFocused ? styles.cardFocused : (pressed && styles.cardPressed),
      ]}
    >
      {/* Header: time + source + share button */}
      <View style={[styles.header, isFocused && styles.headerFocused]}>
        <Text style={styles.time}>{formatTime(article.pub_date)}</Text>
        
        <View style={styles.headerRight}>
          {isFocused && (
            <Pressable onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareIcon}>↗</Text>
              <Text style={styles.shareText}>Partager</Text>
            </Pressable>
          )}
          <Text style={styles.sourceBadge}>{article.source}</Text>
        </View>
      </View>

      {/* Titre */}
      <Text
        style={[styles.title, isFocused && styles.titleFocused]}
        numberOfLines={isFocused ? undefined : 3}
      >
        {article.title}
      </Text>

      {/* Texte source (si focusé et pas France) */}
      {isFocused && article.title_original && article.country !== 'France' && (
        <View style={styles.sourceSection}>
          <Text style={styles.sourceLabel}>TEXTE SOURCE</Text>
          <Text
            style={[
              styles.sourceContent,
              isRTL && styles.sourceContentRTL,
            ]}
          >
            {article.title_original}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14, // p-3.5 = 14px
  },
  cardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 14,
    paddingVertical: 24, // py-6 = 24px
    shadowColor: COLORS.accentYellow1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0.4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8, // mb-2 = 8px
  },
  headerFocused: {
    marginBottom: 16, // mb-4 = 16px
  },
  time: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'transparent',
    marginTop: -6,
  },
  shareIcon: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  shareText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sourceBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 14, // text-sm
    fontWeight: '700',
    color: COLORS.white,
    lineHeight: 18,
  },
  titleFocused: {
    color: COLORS.accentYellow1,
    marginBottom: 16, // mb-4
  },
  sourceSection: {
    marginTop: 20, // mt-5
    paddingTop: 16, // pt-4
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sourceLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 6,
  },
  sourceContent: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 18,
  },
  sourceContentRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
