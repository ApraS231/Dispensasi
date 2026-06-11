import React, { useEffect } from 'react';
import { View, StyleSheet, Text, TextInput } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface DonutChartProps {
  total: number;
  present: number;
  absent: number;
  size?: number;
  strokeWidth?: number;
  delay?: number;
}

export default function DonutChart({
  total,
  present,
  absent,
  size = 160,
  strokeWidth = 20,
  delay = 500,
}: DonutChartProps) {
  const { colors, FONTS } = useTheme();
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    const timeout = setTimeout(() => {
      progress.value = withTiming(total > 0 ? present / total : 0, {
        duration: 1500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    }, delay);
    return () => clearTimeout(timeout);
  }, [present, total]);

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference - progress.value * circumference,
    };
  });

  // Efficient animated text using useDerivedValue and AnimatedTextInput
  const animatedTextProps = useAnimatedProps(() => {
    const percent = Math.round(progress.value * 100);
    return {
      text: `${percent}%`,
    } as any;
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.surfaceContainerHighest}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.3}
        />

        {/* Present/Approved Circle */}
        <G rotation="-90" origin={`${center}, ${center}`}>
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animatedProps={animatedCircleProps}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>

      {/* Center Text Wrapper */}
      <View
        style={[
          styles.innerCircle,
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: size / 2,
          },
        ]}
      >
        <AnimatedTextInput
          underlineColorAndroid="transparent"
          editable={false}
          value="0%"
          style={[
            styles.centerValue,
            {
              fontFamily: FONTS.heading,
              fontSize: 26, // Modular scale text-h2
              color: colors.primary,
            },
          ]}
          animatedProps={animatedTextProps}
        />
        <Text style={[styles.centerLabel, { fontFamily: FONTS.labelCaps, color: colors.textMuted }]}>Hadir</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    zIndex: 2,
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  centerValue: {
    textAlign: 'center',
    padding: 0,
    margin: 0,
    width: '100%',
  },
  centerLabel: {
    fontSize: 10,
    letterSpacing: 1,
    marginTop: -4,
  },
});
