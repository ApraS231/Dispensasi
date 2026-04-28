import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES, SPACING, SHADOWS } from '../utils/theme';

interface SoftCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function SoftCard({ children, style }: SoftCardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SIZES.radiusCard,
    padding: SPACING.lg,
    ...SHADOWS.softCard,
  }
});
