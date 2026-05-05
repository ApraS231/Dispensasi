import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import Animated, { 
  useSharedValue, 
  useDerivedValue, 
  withTiming, 
  Easing,
  useAnimatedProps
} from 'react-native-reanimated';

// Since we want to animate text, we can use useDerivedValue and a simple state 
// or a custom Reanimated text component. For simplicity and reliability across platforms,
// we'll use a local state synced with a timing animation.

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
  delay?: number;
}

export default function AnimatedCounter({ 
  value, 
  duration = 1500, 
  style,
  prefix = '',
  suffix = '',
  delay = 0
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const count = useSharedValue(0);

  useEffect(() => {
    // Start animation after delay
    const timeout = setTimeout(() => {
      count.value = withTiming(value, {
        duration,
        easing: Easing.out(Easing.quad),
      });
    }, delay);

    return () => clearTimeout(timeout);
  }, [value]);

  // Use a listener to update local state for the display
  // In a more complex app, we might use a custom AnimatedText component
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.round(count.value) !== displayValue) {
        setDisplayValue(Math.round(count.value));
      }
      if (count.value === value) {
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [displayValue, value]);

  return (
    <Text style={style}>
      {prefix}{displayValue}{suffix}
    </Text>
  );
}
