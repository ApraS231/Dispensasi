import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

interface PillBadgeProps {
  status: string;
}

export default function PillBadge({ status }: PillBadgeProps) {
  const { colors, SIZES, SPACING, FONTS } = useTheme();
  const pulse = useSharedValue(1);

  const isPending = ['pending', 'waiting_piket', 'approved_by_wali'].includes(status);

  useEffect(() => {
    if (isPending) {
      pulse.value = withRepeat(
        withTiming(1.1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = 1;
    }
  }, [isPending, status]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: interpolate(pulse.value, [1, 1.1], [1, 0.7]),
    };
  });

  const getBadgeConfig = () => {
    switch (status) {
      case 'approved_final':
        return {
          color: colors.success,
          label: 'DISETUJUI',
          bg: colors.successBg,
        };
      case 'rejected':
        return {
          color: colors.error,
          label: 'DITOLAK',
          bg: colors.errorBg,
        };
      case 'pending':
      case 'waiting_piket':
      case 'approved_by_wali':
        return {
          color: colors.warning,
          label: 'PROSES',
          bg: colors.warningBg,
        };
      default:
        return {
          color: colors.textMuted,
          label: status.toUpperCase().replace('_', ' '),
          bg: 'rgba(0,0,0,0.05)',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            borderColor: config.color + '40',
            backgroundColor: config.color + '15',
            borderRadius: SIZES.radiusBadge,
            paddingHorizontal: SPACING.xs, // 8px golden ratio xs
            paddingVertical: 4, // micro spacing allowed as per tolerance
          },
        ]}
      >
        <Animated.View
          style={[
            styles.dot,
            { backgroundColor: config.color, borderRadius: SIZES.radiusFull },
            isPending && animatedStyle,
          ]}
        />
        <Text style={[styles.text, { fontFamily: FONTS.headingSemi, color: config.color }]}>{config.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  dot: {
    width: 6,
    height: 6,
    marginRight: 6,
  },
  text: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
