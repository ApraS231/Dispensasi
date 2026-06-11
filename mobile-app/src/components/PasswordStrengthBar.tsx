import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

interface PasswordStrengthBarProps {
  password?: string;
}

const Segment = ({ isActive, activeColor, inactiveBg }: { isActive: boolean; activeColor: string; inactiveBg: string }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isActive ? 1 : 0, { duration: 250 });
  }, [isActive, activeColor]);

  const animatedStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      progress.value,
      [0, 1],
      [inactiveBg, activeColor]
    );
    return {
      backgroundColor: bg,
    };
  });

  return <Animated.View style={[styles.barSegment, animatedStyle]} />;
};

export default function PasswordStrengthBar({ password = '' }: PasswordStrengthBarProps) {
  const { colors, SIZES, SPACING, FONTS } = useTheme();

  if (!password) return null;

  // Visual strength assessment
  let score = 0;
  if (password.length > 0) score = 1;
  if (password.length >= 8) {
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
  }

  const getStrengthConfig = () => {
    switch (score) {
      case 1:
        return { label: 'Lemah', color: colors.error, activeCount: 1 };
      case 2:
        return { label: 'Cukup', color: colors.warning, activeCount: 2 };
      case 3:
        return { label: 'Baik', color: colors.info, activeCount: 3 };
      case 4:
        return { label: 'Kuat', color: colors.success, activeCount: 4 };
      default:
        return { label: '', color: colors.textMuted, activeCount: 0 };
    }
  };

  const { label, color, activeCount } = getStrengthConfig();
  const inactiveBg = isDark => isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(10, 65, 116, 0.08)';

  return (
    <View style={[styles.container, { marginBottom: SPACING.md }]}>
      <View style={[styles.barRow, { marginRight: SPACING.md }]}>
        {[1, 2, 3, 4].map((index) => (
          <Segment 
            key={index} 
            isActive={index <= activeCount} 
            activeColor={color} 
            inactiveBg={inactiveBg(colors.bgWhite === '#1A1A24')}
          />
        ))}
      </View>
      <Text style={[styles.label, { fontFamily: FONTS.bodyMedium, color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  barRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  barSegment: {
    flex: 1,
    height: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  label: {
    fontSize: 10,
    minWidth: 45,
    textAlign: 'right',
  },
});
