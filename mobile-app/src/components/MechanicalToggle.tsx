import { HapticFeedback } from '../../src/utils/haptics';
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface MechanicalToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  labelOff?: string;
  labelOn?: string;
}

export default function MechanicalToggle({
  value,
  onValueChange,
  labelOff = 'OFF',
  labelOn = 'ON',
}: MechanicalToggleProps) {
  const { colors, SIZES, SPACING, FONTS, shadows } = useTheme();
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: false, // color interpolation doesn't support native driver
      friction: 5,
    }).start();
  }, [value]);

  const handlePress = () => {
    HapticFeedback.medium();
    onValueChange(!value);
  };

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceContainerHighest, colors.primaryLight],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 56],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          styles.container,
          shadows.inset,
          {
            borderRadius: SIZES.radiusToggle,
            backgroundColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.glow,
            {
              borderRadius: SIZES.radiusToggle,
              opacity: shadowOpacity,
              shadowColor: colors.primaryLight,
              borderColor: colors.primaryLight,
            },
          ]}
        />
        <View style={[styles.labels, { paddingHorizontal: SPACING.sm }]}>
          <Text style={[styles.label, { fontFamily: FONTS.headingSemi, color: colors.textPrimary }]}>
            {labelOn}
          </Text>
          <Text style={[styles.label, { fontFamily: FONTS.headingSemi, color: colors.textPrimary }]}>
            {labelOff}
          </Text>
        </View>
        <Animated.View
          style={[
            styles.knob,
            shadows.raised,
            {
              borderRadius: SIZES.radius, // 13px border-radius knob
              backgroundColor: colors.bgWhite,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
  },
  labels: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10, // Modular scale text-caption
  },
  knob: {
    width: 36,
    height: 36,
    position: 'absolute',
  },
});
