import { HapticFeedback } from '../../src/utils/haptics';
import React, { useState } from 'react';
import { 
  Text, 
  StyleSheet, 
  Pressable, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  View,
  StyleProp
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

interface BouncyButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'tonal' | 'outlined' | 'danger';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export default function BouncyButton({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  loading = false,
  icon
}: BouncyButtonProps) {
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled || loading) return;
    HapticFeedback.light();
    setIsPressed(true);
    
    scale.value = withSpring(0.92, { damping: 12, stiffness: 400 });
    opacity.value = withTiming(0.85, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    setIsPressed(false);
    
    scale.value = withSpring(1, { damping: 10, stiffness: 300, mass: 0.8 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'tonal':
        return { 
          bg: COLORS.secondaryContainer, 
          text: COLORS.onSecondaryContainer, 
          border: COLORS.glassBorder,
          useGlass: true
        };
      case 'outlined':
        return { 
          bg: COLORS.glassSurface,
          text: COLORS.textPrimary,
          border: COLORS.glassHighlight,
          useGlass: true
        };
      case 'danger':
        return { 
          bg: COLORS.error, 
          text: COLORS.onPrimary,
          border: COLORS.glassBorder,
          useGlass: false
        };
      case 'primary':
      default:
        return { 
          bg: COLORS.primary, 
          text: COLORS.onPrimary, 
          border: COLORS.glassBorder,
          useGlass: false
        };
    }
  };

  const styleConfig = getVariantStyles();

  const InnerContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={disabled ? COLORS.textMuted : styleConfig.text} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={20} 
              color={disabled ? COLORS.textMuted : styleConfig.text} 
              style={styles.icon} 
            />
          )}
          <Text style={[
            styles.text, 
            { color: disabled ? COLORS.textMuted : styleConfig.text }, 
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={style}
    >
      <Animated.View style={[
        styles.container,
        { 
          backgroundColor: disabled ? COLORS.surfaceContainerHigh : styleConfig.bg,
          borderColor: styleConfig.border,
          borderWidth: 1.5,
        },
        SHADOWS.raised,
        animatedStyle
      ]}>
        {styleConfig.useGlass ? (
          <BlurView 
            intensity={GLASS.blurIntensity} 
            tint={GLASS.tintColor}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <InnerContent />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.lg,
    borderRadius: SIZES.radiusButton,
    minHeight: 48,
    overflow: 'hidden', // Important for BlurView
  },
  text: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    letterSpacing: 0.1,
  },
  icon: {
    marginRight: SPACING.sm,
  }
});
