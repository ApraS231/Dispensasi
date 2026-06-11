import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AvatarInitialsProps {
  name?: string;
  size?: number;
  fontSize?: number;
}

export default function AvatarInitials({ name, size = 40, fontSize = 16 }: AvatarInitialsProps) {
  const { colors, SIZES, shadows } = useTheme();

  return (
    <LinearGradient
      colors={[colors.secondaryContainer, colors.surfaceContainer]}
      style={[
        styles.container,
        shadows.glassPanel,
        {
          width: size,
          height: size,
          borderRadius: SIZES.radiusFull, // Perfectly circular
          borderColor: colors.glassHighlight,
        },
      ]}
    >
      <MaterialCommunityIcons 
        name="account" 
        size={size * 0.6} 
        color={colors.textPrimary} 
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
});
