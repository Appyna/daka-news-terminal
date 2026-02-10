import React from 'react';
import { View, Text, Pressable, StyleSheet, Share, Platform, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Article } from '../types';
import { COLORS } from '../constants';
import Svg, { Path } from 'react-native-svg';

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
        message: `${article.title}\n\nSource: ${article.source}\n${article.link}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenSource = (e: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (article.link) {
      Linking.openURL(article.link);
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
      {/* Header: time + source */}
      <View style={[styles.header, isFocused && styles.headerFocused]}>
        <Text style={styles.time}>{formatTime(article.pub_date)}</Text>
        <Text style={styles.sourceBadge}>{article.source}</Text>
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

      {/* Boutons d'action (si focusé) */}
      {isFocused && (
        <View style={styles.actionsContainer}>
          <Pressable 
            onPress={handleOpenSource} 
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              pressed && styles.actionButtonPressed
            ]}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                stroke={COLORS.dark1}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.primaryButtonText}>Voir l'article d'origine</Text>
          </Pressable>

          <Pressable 
            onPress={handleShare} 
            style={({ pressed }) => [
              styles.actionButton,
              styles.secondaryButton,
              pressed && styles.actionButtonPressed
            ]}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                stroke={COLORS.white}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.secondaryButtonText}>Partager</Text>
          </Pressable>
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
  // Nouveau: Actions container
  actionsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  primaryButton: {
    backgroundColor: COLORS.accentYellow1,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark1,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});
