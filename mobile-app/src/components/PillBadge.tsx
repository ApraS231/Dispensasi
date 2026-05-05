import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate,
  Easing
} from 'react-native-reanimated';
import { COLORS, FONTS, SIZES } from '../utils/theme';
import { BlurView } from 'expo-blur';

interface PillBadgeProps {
  status: string;
}

export default function PillBadge({ status }: PillBadgeProps) {
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
          color: COLORS.success, 
          label: 'DISETUJUI', 
          bg: COLORS.successBg 
        };
      case 'rejected':
        return { 
          color: COLORS.error, 
          label: 'DITOLAK', 
          bg: COLORS.errorBg 
        };
      case 'pending':
      case 'waiting_piket':
      case 'approved_by_wali':
        return { 
          color: COLORS.warning, 
          label: 'PROSES', 
          bg: COLORS.warningBg 
        };
      default:
        return { 
          color: COLORS.textMuted, 
          label: status.toUpperCase().replace('_', ' '), 
          bg: 'rgba(0,0,0,0.05)' 
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="light" style={[styles.badge, { borderColor: config.color + '40' }]}>
        <Animated.View style={[
          styles.dot, 
          { backgroundColor: config.color },
          isPending && animatedStyle
        ]} />
        <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
      </BlurView>
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: SIZES.radiusBadge,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontFamily: FONTS.headingSemi,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
