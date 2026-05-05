import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS, SPACING, GLASS, SHADOWS } from '../utils/theme';

interface OptionMenuItemProps {
  icon: any;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

export default function OptionMenuItem({ icon, label, onPress, isDanger = false }: OptionMenuItemProps) {
  return (
    <TouchableOpacity style={styles.optionBtn} onPress={onPress} activeOpacity={0.7}>
      <BlurView 
        intensity={GLASS.blurIntensity} 
        tint={GLASS.tintColor} 
        style={[
          styles.optionIconBox, 
          isDanger && { backgroundColor: COLORS.errorBg }
        ]}
      >
        <MaterialCommunityIcons name={icon} size={20} color={isDanger ? COLORS.error : COLORS.textPrimary} />
      </BlurView>
      <Text style={[styles.optionLabel, isDanger && { color: COLORS.error }]}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.textMuted} style={styles.optionChevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  optionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.glassSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
    overflow: 'hidden',
  },
  optionLabel: {
    flex: 1,
    fontFamily: FONTS.headingSemi,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  optionChevron: {
    opacity: 0.5,
  },
});
