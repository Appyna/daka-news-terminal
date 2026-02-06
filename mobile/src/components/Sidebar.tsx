import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Source } from '../types';
import { COLORS, FREE_SOURCES } from '../constants';

interface SidebarProps {
  selectedSource: string | null;
  onSourceSelect: (sourceName: string) => void;
  onSettingsPress: () => void;
  onPremiumPress: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  selectedSource, 
  onSourceSelect, 
  onSettingsPress,
  onPremiumPress 
}) => {
  const { profile } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  const isPremium = profile?.subscription_tier === 'PREMIUM';

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const data = await apiService.getSources();
      // Trier : sources gratuites en premier dans chaque catégorie
      const sorted = data.sort((a, b) => {
        const aFree = FREE_SOURCES.includes(a.name);
        const bFree = FREE_SOURCES.includes(b.name);
        if (aFree && !bFree) return -1;
        if (!aFree && bFree) return 1;
        return 0;
      });
      setSources(sorted);
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupByCountry = () => {
    const grouped: { [key: string]: Source[] } = {};
    sources.forEach(source => {
      if (!grouped[source.country]) {
        grouped[source.country] = [];
      }
      grouped[source.country].push(source);
    });
    return grouped;
  };

  const renderSource = (source: Source) => {
    const isFree = FREE_SOURCES.includes(source.name);
    const isLocked = !isFree && !isPremium;
    const isSelected = selectedSource === source.name;

    return (
      <TouchableOpacity
        key={source.id}
        style={[styles.sourceItem, isSelected && styles.sourceItemSelected]}
        onPress={() => {
          if (isLocked) {
            onPremiumPress();
          } else {
            onSourceSelect(source.name);
          }
        }}
      >
        <Text style={[styles.sourceText, isSelected && styles.sourceTextSelected]}>
          {source.name}
        </Text>
        {isLocked && <Text style={styles.lockIcon}>🔒</Text>}
      </TouchableOpacity>
    );
  };

  const renderCountrySection = ({ item }: { item: [string, Source[]] }) => {
    const [country, countrySources] = item;
    return (
      <View style={styles.countrySection}>
        <Text style={styles.countryTitle}>{country}</Text>
        {countrySources.map(renderSource)}
      </View>
    );
  };

  const groupedData = Object.entries(groupByCountry());

  return (
    <SafeAreaView edges={['left', 'top', 'bottom']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.liveContainer}>
          <Text style={styles.liveText}>Live</Text>
          <View style={styles.liveDot} />
        </View>
        <Text style={styles.subtitle}>Sélectionner une source d'infos</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.accentYellow1} />
        </View>
      ) : (
        <FlatList
          data={groupedData}
          renderItem={renderCountrySection}
          keyExtractor={(item) => item[0]}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.disclaimer}>
          Traductions automatiques (IA)
        </Text>
        <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark2,
    width: 300,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginRight: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  countrySection: {
    marginBottom: 16,
  },
  countryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  sourceItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sourceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  sourceTextSelected: {
    color: COLORS.accentYellow1,
    fontWeight: '600',
  },
  lockIcon: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  disclaimer: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.4)',
    flex: 1,
  },
  settingsButton: {
    padding: 4,
  },
  settingsIcon: {
    fontSize: 20,
  },
});
