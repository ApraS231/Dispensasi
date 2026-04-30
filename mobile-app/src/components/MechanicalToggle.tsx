import { HapticFeedback } from '../../src/utils/haptics';
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../utils/theme';

interface MechanicalToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  labelOff?: string;
  labelOn?: string;
}

export default function MechanicalToggle({ value, onValueChange, labelOff = 'OFF', labelOn = 'ON' }: MechanicalToggleProps) {
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
    outputRange: [COLORS.surfaceContainerHighest, COLORS.primary]
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 56]
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5]
  });

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View style={[styles.container, { backgroundColor }]}>
        {!value && <View style={styles.innerShadow} />}
        <Animated.View style={[styles.glow, { opacity: shadowOpacity, shadowColor: COLORS.primary, borderColor: COLORS.primary }]} />
        <View style={styles.labels}>
          <Text style={styles.label}>{labelOn}</Text>
          <Text style={styles.label}>{labelOff}</Text>
        </View>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  innerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  labels: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  label: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: '#1F2937',
  },
  knob: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    ...SHADOWS.softCard,
  }
});
