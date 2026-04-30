import { HapticFeedback } from '../../src/utils/haptics';
import React, { useRef } from 'react';
import { 
  Text, 
  StyleSheet, 
  Animated, 
  Pressable, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator 
} from 'react-native';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICONS } from '../utils/icons';

interface BouncyButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'tonal' | 'outlined' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
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
  
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    HapticFeedback.light();
    
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 15,
      bounciness: 10,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'tonal':
        return { 
          bg: COLORS.secondaryContainer, 
          text: COLORS.onSecondaryContainer, 
          border: 'transparent'
        };
      case 'outlined':
        return { 
          bg: 'transparent', 
          text: COLORS.primary, 
          border: COLORS.outlineVariant
        };
      case 'danger':
        return { 
          bg: COLORS.error, 
          text: COLORS.bgWhite, 
          border: 'transparent'
        };
      case 'primary':
      default:
        return { 
          bg: COLORS.primary, 
          text: COLORS.onPrimary, 
          border: 'transparent'
        };
    }
  };

  const styleConfig = getVariantStyles();

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
          borderColor: disabled ? 'transparent' : styleConfig.border,
          borderWidth: variant === 'outlined' ? 1 : 0
        },
        { transform: [{ scale: scaleAnim }] }
      ]}>
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
