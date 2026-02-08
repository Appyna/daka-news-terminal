import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { NewsCard } from './NewsCard';
import { Article } from '../types';
import { COLORS } from '../constants';

interface NewsColumnProps {
  sourceName: string;
  country: string;
  articles: Article[];
  focusedNewsId: string | null;
  onItemFocus: (id: string | null) => void;
}

export const NewsColumn: React.FC<NewsColumnProps> = ({
  sourceName,
  country,
  articles,
  focusedNewsId,
  onItemFocus,
}) => {
  return (
    <View style={styles.column}>
      {/* Header avec nom de la source */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {country?.toUpperCase() || ''} - {sourceName || ''}
        </Text>
      </View>

      {/* Liste des articles en plein écran */}
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
});
