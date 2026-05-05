import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SIZES, GLASS } from '../utils/theme';
import { HapticFeedback } from '../utils/haptics';

interface FilterPillProps {
  id: string;
  label: string;
  isActive: boolean;
  onPress: (id: string) => void;
}

export default function FilterPill({ id, label, isActive, onPress }: FilterPillProps) {
  return (
    <TouchableOpacity 
      onPress={() => {
        HapticFeedback.light();
        onPress(id);
      }}
      activeOpacity={0.8}
    >
      <BlurView 
        intensity={GLASS.blurIntensity} 
        tint={GLASS.tintColor} 
        style={[
          styles.filterPill, 
          isActive ? styles.filterPillActive : null
        ]}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.radiusButton,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
    overflow: 'hidden',
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryContainer,
    borderColor: COLORS.primaryLight,
  },
  filterText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.onPrimaryContainer,
  },
});
