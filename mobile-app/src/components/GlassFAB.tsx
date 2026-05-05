import { HapticFeedback } from '../../src/utils/haptics';
import { StyleSheet, TouchableWithoutFeedback, Animated, View } from 'react-native';
import React, { useRef, useEffect } from 'react';
import { COLORS, SHADOWS, SIZES, GLASS } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICONS } from '../utils/icons';
import { BlurView } from 'expo-blur';

export default function GlassFAB({ onPress, icon, style, bottom = 24 }: { onPress: () => void; icon?: keyof typeof MaterialCommunityIcons.glyphMap; style?: any; bottom?: number }) {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseValue]);

  const handlePressIn = () => {
    HapticFeedback.light();
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 15,
      bounciness: 10,
    }).start();
  };

  return (
    <TouchableWithoutFeedback onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        styles.wrapper,
        { bottom },
        style,
        { transform: [{ scale: Animated.multiply(scaleValue, pulseValue) }] }
      ]}>
        <BlurView intensity={GLASS.blurIntensity} tint={GLASS.tintColor} style={styles.container}>
          <View style={styles.inner}>
            <MaterialCommunityIcons name={icon || ICONS.add} size={28} color={COLORS.onPrimaryContainer} />
          </View>
        </BlurView>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: SIZES.radiusFull,
    shadowColor: COLORS.depthShadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  container: {
    width: 64,
    height: 64,
    borderRadius: SIZES.radiusFull, 
    backgroundColor: COLORS.surfaceContainerHigh, 
    borderWidth: 1.5,
    borderColor: COLORS.glassHighlight,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
    borderRadius: SIZES.radiusFull,
  }
});
