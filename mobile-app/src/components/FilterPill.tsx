import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/useTheme';
import { HapticFeedback } from '../utils/haptics';

interface FilterPillProps {
  id: string;
  label: string;
  isActive: boolean;
  onPress: (id: string) => void;
}

export default function FilterPill({ id, label, isActive, onPress }: FilterPillProps) {
  const { colors, isDark, SIZES, SPACING, FONTS } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => {
        HapticFeedback.light();
        onPress(id);
      }}
      activeOpacity={0.8}
    >
      <BlurView
        intensity={24} // design.md blur(24px)
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.filterPill,
          {
            borderRadius: SIZES.radiusButton,
            paddingHorizontal: SPACING.sm, // 13px golden ratio spacing
            paddingVertical: SPACING.xs, // 8px golden ratio spacing
            backgroundColor: isActive
              ? (isDark ? 'rgba(123, 189, 232, 0.2)' : 'rgba(10, 65, 116, 0.15)')
              : colors.glassSurface,
            borderColor: isActive
              ? (isDark ? '#7BBDE8' : '#0A4174')
              : colors.glassBorder,
          },
        ]}
      >
        <Text
          style={[
            styles.filterText,
            {
              fontFamily: FONTS.headingSemi,
              fontSize: 10, // Modular scale text-caption
              color: isActive
                ? (isDark ? '#EAEEF3' : '#001D39')
                : colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterPill: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  filterText: {},
});
