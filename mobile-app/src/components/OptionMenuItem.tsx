import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../hooks/useTheme';

interface OptionMenuItemProps {
  icon: any;
  label: string;
  onPress: () => void;
  isDanger?: boolean;
}

export default function OptionMenuItem({ icon, label, onPress, isDanger = false }: OptionMenuItemProps) {
  const { colors, isDark, SIZES, SPACING, FONTS } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.optionBtn,
        {
          paddingVertical: SPACING.sm, // 13px
          paddingHorizontal: SPACING.xs, // 8px
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView
        intensity={24} // design.md blur(24px)
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.optionIconBox,
          {
            borderRadius: SIZES.radius, // 13px border-radius
            backgroundColor: isDanger ? colors.errorBg : colors.glassSurface,
            marginRight: SPACING.md, // 21px
            borderColor: isDanger ? colors.error : colors.glassBorder,
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={20} color={isDanger ? colors.error : colors.textPrimary} />
      </BlurView>
      <Text
        style={[
          styles.optionLabel,
          {
            fontFamily: FONTS.headingSemi,
            fontSize: 16, // Modular scale text-body
            color: isDanger ? colors.error : colors.textPrimary,
          },
        ]}
      >
        {label}
      </Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted} style={styles.optionChevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionLabel: {
    flex: 1,
  },
  optionChevron: {
    opacity: 0.5,
  },
});
