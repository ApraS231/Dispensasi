import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS } from '../utils/theme';

const { width, height } = Dimensions.get('window');

// Liquid mesh background with noise/blur overlay for skeuomorphism + glass effect
export default function LiquidBackground() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;
  const anim4 = useRef(new Animated.Value(0)).current;
  const anim5 = useRef(new Animated.Value(0)).current;

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

    createAnimation(anim1, 15000).start();
    createAnimation(anim2, 20000).start();
    createAnimation(anim3, 18000).start();
    createAnimation(anim4, 22000).start();
    createAnimation(anim5, 25000).start();
  }, []);

  const translate1X = anim1.interpolate({ inputRange: [0, 1], outputRange: [-100, 150] });
  const translate1Y = anim1.interpolate({ inputRange: [0, 1], outputRange: [-50, 150] });

  const translate2X = anim2.interpolate({ inputRange: [0, 1], outputRange: [150, -100] });
  const translate2Y = anim2.interpolate({ inputRange: [0, 1], outputRange: [200, -50] });

  const translate3X = anim3.interpolate({ inputRange: [0, 1], outputRange: [-50, 100] });
  const translate3Y = anim3.interpolate({ inputRange: [0, 1], outputRange: [50, -100] });

  const translate4X = anim4.interpolate({ inputRange: [0, 1], outputRange: [100, -50] });
  const translate4Y = anim4.interpolate({ inputRange: [0, 1], outputRange: [-100, 150] });

  const translate5X = anim5.interpolate({ inputRange: [0, 1], outputRange: [-150, 50] });
  const translate5Y = anim5.interpolate({ inputRange: [0, 1], outputRange: [100, -50] });

  const scale1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const scale2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] });
  const scale3 = anim3.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.2] });
  const scale4 = anim4.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.3] });
  const scale5 = anim5.interpolate({ inputRange: [0, 1], outputRange: [1.1, 0.9] });

  return (
    <View style={styles.container} pointerEvents="none">
      <LinearGradient
        colors={[COLORS.bgWhite, '#E6EEF4', '#DDE6F0']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Liquid Blobs */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: COLORS.primaryMuted,
            top: height * 0.1,
            left: width * 0.1,
            width: 350, height: 350, borderRadius: 175,
            transform: [{ translateX: translate1X }, { translateY: translate1Y }, { scale: scale1 }]
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
            transform: [{ translateX: translate2X }, { translateY: translate2Y }, { scale: scale2 }]
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
            transform: [{ translateX: translate3X }, { translateY: translate3Y }, { scale: scale3 }]
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
            transform: [{ translateX: translate4X }, { translateY: translate4Y }, { scale: scale4 }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: COLORS.primaryLight,
            bottom: height * 0.3,
            left: width * -0.2,
            width: 320, height: 320, borderRadius: 160,
            transform: [{ translateX: translate5X }, { translateY: translate5Y }, { scale: scale5 }]
          }
        ]}
      />

      {/* Glass Overlay to blur the blobs and add noise texture */}
      <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, styles.noiseOverlay]} />
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
    opacity: 0.65,
  },
  noiseOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
});
