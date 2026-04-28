import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SIZES } from '../utils/theme';

interface PillBadgeProps {
  status: string;
}

export default function PillBadge({ status }: PillBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'approved_final':
        return { bg: COLORS.primaryContainer, text: COLORS.onPrimaryContainer, label: 'DISETUJUI' };
      case 'rejected':
        return { bg: COLORS.errorBg, text: COLORS.error, label: 'DITOLAK' };
      case 'approved_by_wali':
      case 'approved_by_piket':
      case 'pending':
        return { bg: COLORS.tertiaryContainer, text: COLORS.onTertiaryContainer, label: 'DIPROSES' };
      default:
        return { bg: COLORS.surfaceContainerHighest, text: COLORS.textSecondary, label: status.toUpperCase() };
    }
  };

  const styleConfig = getBadgeStyle();

  return (
    <View style={[styles.badge, { backgroundColor: styleConfig.bg }]}>
      <Text style={[styles.badgeText, { color: styleConfig.text }]}>
        {styleConfig.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: SIZES.radiusBadge,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 10,
    letterSpacing: 0.5,
  }
});
