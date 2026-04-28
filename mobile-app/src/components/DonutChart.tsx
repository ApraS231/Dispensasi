import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS, FONTS } from '../utils/theme';

interface DonutChartProps {
  total: number;
  present: number;
  absent: number;
  size?: number;
  strokeWidth?: number;
}

export default function DonutChart({ total, present, absent, size = 160, strokeWidth = 20 }: DonutChartProps) {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate percentages
  const presentPercent = total > 0 ? (present / total) : 0;
  
  // Calculate dash offsets
  const presentOffset = circumference - (presentPercent * circumference);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle (Absent/Pending) */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={COLORS.surfaceContainerHighest}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Present/Approved Circle */}
        <G rotation="-90" origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={COLORS.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={presentOffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>

      {/* Center Text (Inner Cutout) */}
      <View style={[styles.innerCircle, { 
        width: size - (strokeWidth * 2), 
        height: size - (strokeWidth * 2),
        borderRadius: size / 2 
      }]}>
        <Text style={styles.centerValue}>{Math.round(presentPercent * 100)}%</Text>
        <Text style={styles.centerLabel}>Hadir</Text>
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
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.primary,
    lineHeight: 32,
  },
  centerLabel: {
    fontFamily: FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 1,
  }
});
