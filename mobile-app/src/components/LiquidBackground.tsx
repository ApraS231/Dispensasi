import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

// Liquid mesh background optimized for performance
// Removed BlurView as it causes significant lag on Android
export default function LiquidBackground() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const anim4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    createAnimation(anim1, 20000).start();
    createAnimation(anim2, 25000).start();
    createAnimation(anim3, 22000).start();
    createAnimation(anim4, 28000).start();
  }, []);

  const translate1X = anim1.interpolate({ inputRange: [0, 1], outputRange: [-50, 100] });
  const translate1Y = anim1.interpolate({ inputRange: [0, 1], outputRange: [-30, 80] });

  const translate2X = anim2.interpolate({ inputRange: [0, 1], outputRange: [100, -50] });
  const translate2Y = anim2.interpolate({ inputRange: [0, 1], outputRange: [120, -30] });

  const translate3X = anim3.interpolate({ inputRange: [0, 1], outputRange: [-30, 60] });
  const translate3Y = anim3.interpolate({ inputRange: [0, 1], outputRange: [40, -60] });

  const translate4X = anim4.interpolate({ inputRange: [0, 1], outputRange: [60, -30] });
  const translate4Y = anim4.interpolate({ inputRange: [0, 1], outputRange: [-60, 100] });

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[COLORS.bgWhite, '#E6EEF4', '#DDE6F0']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Optimized Liquid Blobs (Fewer and with low opacity to avoid BlurView requirement) */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: COLORS.primaryMuted,
            top: height * 0.1,
            left: width * 0.1,
            width: 350, height: 350, borderRadius: 175,
            opacity: 0.15,
            transform: [{ translateX: translate1X }, { translateY: translate1Y }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: COLORS.secondary,
            top: height * 0.4,
            right: width * 0.05,
            width: 300, height: 300, borderRadius: 150,
            opacity: 0.1,
            transform: [{ translateX: translate2X }, { translateY: translate2Y }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: COLORS.primary,
            bottom: height * 0.05,
            left: width * 0.2,
            width: 400, height: 400, borderRadius: 200,
            opacity: 0.12,
            transform: [{ translateX: translate3X }, { translateY: translate3Y }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: COLORS.tertiary,
            top: height * -0.1,
            right: width * 0.2,
            width: 250, height: 250, borderRadius: 125,
            opacity: 0.08,
            transform: [{ translateX: translate4X }, { translateY: translate4Y }]
          }
        ]}
      />

      {/* Frosted Glass simulation using LinearGradient overlay instead of BlurView */}
      <LinearGradient
        colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.7)']}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  }
});
