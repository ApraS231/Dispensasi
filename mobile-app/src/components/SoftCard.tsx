import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SPACING, SHADOWS } from '../utils/theme';

interface SoftCardProps {
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function SoftCard({ children, style, onPress }: SoftCardProps) {
  return (
  <>
  {onPress ? (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      {children}
    </TouchableOpacity>
  ) : (
    <View style={[styles.card, style]}>
      {children}
    </View>
  )}
  </>
);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: SIZES.radiusCard,
    padding: SPACING.lg,
    ...SHADOWS.softCard,
      }
});
