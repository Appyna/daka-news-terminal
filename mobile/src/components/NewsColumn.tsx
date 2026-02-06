import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { NewsCard } from './NewsCard';
import { Article } from '../types';
import { COLORS } from '../constants';

interface NewsColumnProps {
  sourceName: string;
  articles: Article[];
  loading: boolean;
  focusedNewsId: string | null;
  onItemPress: (item: Article) => void;
}

export const NewsColumn: React.FC<NewsColumnProps> = ({
  sourceName,
  articles,
  loading,
  focusedNewsId,
  onItemPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{sourceName}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.accentYellow1} />
        </View>
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NewsCard
              item={item}
              isFocused={focusedNewsId === item.id}
              onPress={() => onItemPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 320,
    backgroundColor: COLORS.dark1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accentYellow1,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});
