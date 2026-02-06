import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

export const Logo: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>DAKA</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accentYellow1,
    letterSpacing: 1,
  },
});
