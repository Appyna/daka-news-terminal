import React, { useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Animated } from 'react-native';
import { NewsCard } from './NewsCard';
import { Article } from '../types';
import { COLORS } from '../constants';

interface NewsColumnProps {
  sourceName: string;
  country: string;
  articles: Article[];
  focusedNewsId: string | null;
  onItemFocus: (id: string | null) => void;
  loading?: boolean;
}

export const NewsColumn: React.FC<NewsColumnProps> = ({
  sourceName,
  country,
  articles,
  focusedNewsId,
  onItemFocus,
  loading = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Transition fade lors changement de source
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [sourceName]);

  // Skeleton loader
  const renderSkeleton = () => (
    <View>
      {[...Array(5)].map((_, i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '80%', marginTop: 8 }]} />
          <View style={[styles.skeletonLine, { width: '60%', marginTop: 8 }]} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.column}>
      {/* Header avec nom de la source */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {country?.toUpperCase() || ''} - {sourceName || ''}
        </Text>
      </View>

      {/* Liste avec fade + skeleton */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {loading && articles.length === 0 ? (
          renderSkeleton()
        ) : (
          <FlatList
            data={articles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NewsCard
                article={item}
                isFocused={focusedNewsId === item.id}
                onPress={() => onItemFocus(focusedNewsId === item.id ? null : item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    flex: 1,
    width: '100%',
  },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerText: {
    color: COLORS.accentYellow1,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  list: {
    flex: 1,
  },
  skeletonCard: {
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  skeletonLine: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    width: '100%',
  },
});
