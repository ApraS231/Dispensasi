import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/useTheme';
import { HapticFeedback } from '../utils/haptics';

interface LogoutButtonProps {
  onPress: () => void;
  variant?: 'pill' | 'inline';
}

export default function LogoutButton({ onPress, variant = 'pill' }: LogoutButtonProps) {
  const { colors, isDark, SIZES, SPACING, FONTS } = useTheme();

  const handlePress = () => {
    HapticFeedback.medium();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <BlurView
        intensity={24} // design.md blur(24px)
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.logoutBtn,
          {
            paddingHorizontal: SPACING.sm, // 13px spacing-sm
            paddingVertical: SPACING.xs, // 8px spacing-xs
            borderRadius: SIZES.radiusButton,
            borderColor: colors.error,
            backgroundColor: colors.errorBg,
          },
          variant === 'inline' && styles.logoutBtnInline,
        ]}
      >
        <Text style={[styles.logoutText, { fontFamily: FONTS.headingSemi, color: colors.error }]}>Keluar</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  logoutBtnInline: {
    // Add specific styles if needed for inline version
  },
  logoutText: {
    fontSize: 10, // Modular scale text-caption
  },
});
