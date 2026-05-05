import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  withSpring,
  interpolate,
  Extrapolation,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING } from '../utils/theme';

const REFRESH_THRESHOLD = 80;

interface LiquidRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function LiquidRefreshControl({ refreshing, onRefresh }: LiquidRefreshControlProps) {
  // This component will be controlled by the scroll position of the parent ScrollView/FlatList
  // For now, let's create a standalone version that can be triggered.
  
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    if (refreshing) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = 0;
    }
  }, [refreshing]);

  const animatedCircleStyle = useAnimatedStyle(() => {
    const scale = interpolate(pulse.value, [0, 1], [1, 1.3], Extrapolation.CLAMP);
    const opacity = interpolate(pulse.value, [0, 1], [1, 0.5], Extrapolation.CLAMP);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, animatedCircleStyle]} />
      <View style={styles.innerCircle}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93"
            stroke={COLORS.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  circle: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.3,
  },
  innerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
});
