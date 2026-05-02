import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// We create moving blobs to simulate a liquid mesh background
export default function LiquidBackground() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

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
  }, []);

  const translate1X = anim1.interpolate({ inputRange: [0, 1], outputRange: [-100, 100] });
  const translate1Y = anim1.interpolate({ inputRange: [0, 1], outputRange: [-50, 150] });

  const translate2X = anim2.interpolate({ inputRange: [0, 1], outputRange: [100, -100] });
  const translate2Y = anim2.interpolate({ inputRange: [0, 1], outputRange: [150, -50] });

  const translate3X = anim3.interpolate({ inputRange: [0, 1], outputRange: [-50, 50] });
  const translate3Y = anim3.interpolate({ inputRange: [0, 1], outputRange: [50, -50] });

  const scale1 = anim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
  const scale2 = anim2.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const scale3 = anim3.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.1] });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#BDD8E9', '#7BBDE8', '#4E8EA2']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Liquid Blob 1 */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: '#6EA2B3',
            top: height * 0.1,
            left: width * 0.1,
            transform: [{ translateX: translate1X }, { translateY: translate1Y }, { scale: scale1 }]
          }
        ]}
      />

      {/* Liquid Blob 2 */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: '#49769F',
            top: height * 0.5,
            right: width * 0.1,
            transform: [{ translateX: translate2X }, { translateY: translate2Y }, { scale: scale2 }]
          }
        ]}
      />

      {/* Liquid Blob 3 */}
      <Animated.View
        style={[
          styles.blob,
          {
            backgroundColor: '#0A4174',
            bottom: height * 0.1,
            left: width * 0.3,
            transform: [{ translateX: translate3X }, { translateY: translate3Y }, { scale: scale3 }]
          }
        ]}
      />

      {/* Glass Overlay to blur the blobs nicely */}
      <View style={[StyleSheet.absoluteFill, styles.overlay]} />
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
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.6,
    // Add some soft shadow to blobs
    shadowColor: '#001D39',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    // In a real device we'd use expo-blur, but a semi-transparent white helps the look
  }
});
