import React from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform } from 'react-native';
import { Article } from '../types';
import { COLORS } from '../constants';

interface NewsCardProps {
  item: Article;
  isFocused: boolean;
  onPress: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, isFocused, onPress }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.title}\n\n${item.link}`,
        url: Platform.OS === 'ios' ? item.link : undefined,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const isRTL = item.country === 'Israel';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isFocused && styles.cardFocused,
        pressed && !isFocused && styles.cardPressed,
      ]}
    >
      <View style={isFocused ? styles.contentFocused : styles.content}>
        {/* Header: Heure + Source + Share button */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.time}>{formatTime(item.pub_date)}</Text>
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceText}>{item.source}</Text>
            </View>
          </View>
          
          {isFocused && (
            <Pressable onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareIcon}>↗</Text>
              <Text style={styles.shareText}>Partager</Text>
            </Pressable>
          )}
        </View>

        {/* Titre */}
        <Text 
          style={[styles.title, isFocused && styles.titleFocused]}
          numberOfLines={isFocused ? undefined : 3}
        >
          {item.title}
        </Text>

        {/* Texte source (si focusé et pas France) */}
        {isFocused && item.translation && item.country !== 'France' && (
          <View style={styles.sourceSection}>
            <Text style={styles.sourceLabel}>TEXTE SOURCE</Text>
            <Text 
              style={[
                styles.sourceContent,
                isRTL && styles.sourceContentRTL
              ]}
            >
              {item.translation}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'transparent',
    marginBottom: 1,
  },
  cardPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: COLORS.accentYellow1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 0.4,
    elevation: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  contentFocused: {
    paddingHorizontal: 14,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginRight: 8,
  },
  sourceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
    textTransform: 'uppercase',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.accentYellow1,
  },
  shareIcon: {
    fontSize: 14,
    color: COLORS.accentYellow1,
    marginRight: 4,
  },
  shareText: {
    fontSize: 12,
    color: COLORS.accentYellow1,
    fontWeight: '600',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
    lineHeight: 20,
  },
  titleFocused: {
    color: COLORS.accentYellow1,
    marginBottom: 16,
  },
  sourceSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sourceLabel: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.25)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
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
