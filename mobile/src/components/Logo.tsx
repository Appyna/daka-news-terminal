import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

export const Logo: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.daka}>DAKA</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>NEWS</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  daka: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -1,
    color: COLORS.white,
  },
  badge: {
    backgroundColor: COLORS.accentYellow1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dark2,
    letterSpacing: 0,
  },
});
