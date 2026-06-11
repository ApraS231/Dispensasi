import React, { useRef, useEffect } from 'react';
import { StyleSheet, TouchableWithoutFeedback, Animated, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICONS } from '../utils/icons';
import { BlurView } from 'expo-blur';
import { HapticFeedback } from '../../src/utils/haptics';

export default function GlassFAB({ 
  onPress, 
  icon, 
  style, 
  bottom = 21 
}: { 
  onPress: () => void; 
  icon?: keyof typeof MaterialCommunityIcons.glyphMap; 
  style?: any; 
  bottom?: number 
}) {
  const { colors, isDark, SIZES, shadows } = useTheme();
  
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
        { 
          bottom,
          shadowColor: colors.depthShadow,
        },
        shadows.skeuShadow,
        style,
        { transform: [{ scale: Animated.multiply(scaleValue, pulseValue) }] }
      ]}>
        <BlurView 
          intensity={24} 
          tint={isDark ? 'dark' : 'light'} 
          style={[
            styles.container, 
            { 
              borderRadius: SIZES.radiusFull,
              backgroundColor: colors.glassSurface,
              borderColor: colors.glassHighlight,
            }
          ]}
        >
          <View style={[styles.inner, { backgroundColor: colors.primaryContainer, borderRadius: SIZES.radiusFull }]}>
            <MaterialCommunityIcons name={icon || ICONS.add} size={28} color={colors.primary} />
          </View>
        </BlurView>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 21, // SPACING.md
    width: 64,
    height: 64,
    borderRadius: 9999,
  },
  container: {
    width: 64,
    height: 64,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
