import React, { useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withDelay, 
  withTiming, 
  withSpring,
  Easing 
} from 'react-native-reanimated';

interface AnimatedEntranceProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  offset?: number;
  type?: 'timing' | 'spring';
}

export default function AnimatedEntrance({ 
  children, 
  delay = 0, 
  duration = 600, 
  direction = 'up',
  offset = 30,
  type = 'spring'
}: AnimatedEntranceProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(direction === 'left' ? -offset : direction === 'right' ? offset : 0);
  const translateY = useSharedValue(direction === 'up' ? offset : direction === 'down' ? -offset : 0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    if (type === 'timing') {
      opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
      translateX.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.back(1)) }));
      translateY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.back(1)) }));
      scale.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.quad) }));
    } else {
      opacity.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 100 }));
      translateX.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
      translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
      scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 100 }));
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
