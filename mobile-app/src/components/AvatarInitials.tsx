import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarInitialsProps {
  name?: string;
  size?: number;
  fontSize?: number;
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0]?.[0] || '?').toUpperCase();
}

export default function AvatarInitials({ name, size = 40, fontSize = 16 }: AvatarInitialsProps) {
  const initials = getInitials(name);

  return (
    <LinearGradient
      colors={[COLORS.secondaryContainer, COLORS.surfaceContainer]}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2, // Circular instead of boxy
        },
      ]}
    >
      <Text style={[styles.text, { fontSize }]}>{initials}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    ...SHADOWS.glassPanel,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.glassHighlight,
  },
  text: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.textPrimary,
  },
});
