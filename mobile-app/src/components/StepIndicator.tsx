import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  stepLabels?: string[];
}

const StepDot = ({
  step,
  isActive,
  isCompleted,
}: {
  step: number;
  isActive: boolean;
  isCompleted: boolean;
}) => {
  const { colors, SIZES, FONTS } = useTheme();
  const scale = useSharedValue(1);
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.15 : 1, { damping: 15, stiffness: 200 });
    colorProgress.value = withTiming(isCompleted ? 2 : isActive ? 1 : 0, { duration: 300 });
  }, [isActive, isCompleted]);

  const animatedCircleStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      colorProgress.value,
      [0, 1, 2],
      ['rgba(10, 65, 116, 0.08)', colors.primary, colors.success]
    );

    const border = interpolateColor(
      colorProgress.value,
      [0, 1, 2],
      [colors.secondary, colors.primary, colors.success]
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: bg,
      borderColor: border,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dotCircle,
        animatedCircleStyle,
        {
          borderRadius: SIZES.radiusFull,
        },
      ]}
    >
      {isCompleted ? (
        <MaterialCommunityIcons name="check" size={16} color={colors.onPrimary} />
      ) : (
        <Text
          style={[
            styles.dotText,
            {
              fontFamily: FONTS.headingSemi,
              fontSize: 10, // Modular scale text-caption
              color: isActive ? colors.onPrimary : colors.textMuted,
            },
          ]}
        >
          {step}
        </Text>
      )}
    </Animated.View>
  );
};

const ConnectorLine = ({ isCompleted }: { isCompleted: boolean }) => {
  const { colors, SIZES, SPACING } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(isCompleted ? 1 : 0, { duration: 300 });
  }, [isCompleted]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View
      style={[
        styles.lineConnector,
        {
          marginHorizontal: SPACING.xs,
          borderRadius: SIZES.radiusSm, // 8px
        },
      ]}
    >
      <Animated.View style={[styles.lineFill, { backgroundColor: colors.success }, animatedStyle]} />
    </View>
  );
};

export default function StepIndicator({
  currentStep,
  totalSteps = 2,
  stepLabels = ['Data Pribadi', 'Akun & Kelas'],
}: StepIndicatorProps) {
  const { colors, SIZES, SPACING, FONTS } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: SPACING.xs, marginBottom: SPACING.md }]}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const isLast = step === totalSteps;

          return (
            <React.Fragment key={step}>
              <StepDot step={step} isActive={isActive} isCompleted={isCompleted} />
              {!isLast && <ConnectorLine isCompleted={isCompleted} />}
            </React.Fragment>
          );
        })}
      </View>
      {stepLabels && (
        <View style={[styles.labelsRow, { marginTop: SPACING.sm }]}>
          {stepLabels.map((label, index) => {
            const step = index + 1;
            const isCurrent = step === currentStep;
            return (
              <Text
                key={step}
                style={[
                  styles.labelText,
                  {
                    fontFamily: isCurrent ? FONTS.bodyMedium : FONTS.body,
                    fontSize: 10, // Modular scale text-caption
                    color: isCurrent ? colors.primary : colors.textMuted,
                  },
                ]}
              >
                {label}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '50%',
  },
  dotCircle: {
    width: 32,
    height: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotText: {},
  lineConnector: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(10, 65, 116, 0.08)',
    overflow: 'hidden',
  },
  lineFill: {
    height: '100%',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
  },
  labelText: {
    textAlign: 'center',
    flex: 1,
  },
});
