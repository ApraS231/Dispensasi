import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SIZES, GLASS } from '../utils/theme';
import { HapticFeedback } from '../utils/haptics';

interface LogoutButtonProps {
  onPress: () => void;
  variant?: 'pill' | 'inline';
}

export default function LogoutButton({ onPress, variant = 'pill' }: LogoutButtonProps) {
  const handlePress = () => {
    HapticFeedback.medium();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <BlurView 
        intensity={GLASS.blurIntensity} 
        tint={GLASS.tintColor} 
        style={[
          styles.logoutBtn,
          variant === 'inline' && styles.logoutBtnInline
        ]}
      >
        <Text style={styles.logoutText}>Keluar</Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusButton,
    borderWidth: 1,
    borderColor: COLORS.error,
    overflow: 'hidden',
    backgroundColor: COLORS.errorBg,
  },
  logoutBtnInline: {
    // Add specific styles if needed for inline version
  },
  logoutText: { 
    fontFamily: FONTS.headingSemi, 
    color: COLORS.error,
    fontSize: 12 
  },
});
