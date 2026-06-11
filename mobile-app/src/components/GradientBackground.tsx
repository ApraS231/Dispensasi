import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

export default function GradientBackground() {
  const { colors, isDark } = useTheme();

  const gradientColors = isDark
    ? ['#1A1A24', '#12121B', '#0D0D14'] as const
    : ['#F0F4F8', '#E8EFF5', '#E6EEF4'] as const;

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -2, // Make sure it sits behind everything (even card blurs)
  },
});
