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
  withTiming
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { HapticFeedback } from '../utils/haptics';

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
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();
  
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled || loading) return;
    HapticFeedback.light();
    setIsPressed(true);
    
    // 200ms tactile feedback feel using custom spring settings (§4A)
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    setIsPressed(false);
    
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const getVariantStyles = () => {
    // Buttons must have background alpha <= 0.4 (design.md §1)
    switch (variant) {
      case 'tonal':
        return { 
          bg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)', 
          text: colors.textSecondary, 
          border: colors.glassBorder,
          useGlass: true
        };
      case 'outlined':
        return { 
          bg: colors.glassSurface,
          text: colors.textPrimary,
          border: colors.glassHighlight,
          useGlass: true
        };
      case 'danger':
        return { 
          bg: 'rgba(239, 71, 111, 0.2)', // errorBg with alpha <= 0.4
          text: colors.error,
          border: 'rgba(239, 71, 111, 0.4)',
          useGlass: true
        };
      case 'primary':
      default:
        return { 
          bg: isDark ? 'rgba(123, 189, 232, 0.2)' : 'rgba(10, 65, 116, 0.2)', // primaryContainer-like alpha <= 0.4
          text: isDark ? '#7BBDE8' : '#0A4174', // readable primary text
          border: colors.glassHighlight,
          useGlass: true
        };
    }
  };

  const styleConfig = getVariantStyles();

  const InnerContent = () => (
    <View style={styles.contentRow} pointerEvents="none">
      {loading ? (
        <ActivityIndicator color={disabled ? colors.textMuted : styleConfig.text} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={20} 
              color={disabled ? colors.textMuted : styleConfig.text} 
              style={{ marginRight: SPACING.xs }} 
            />
          )}
          <Text style={[
            styles.text, 
            { 
              fontFamily: FONTS.headingSemi, 
              color: disabled ? colors.textMuted : styleConfig.text 
            }, 
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </View>
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
          minHeight: 55, // minimum 55px as per design.md §4A
          borderRadius: SIZES.radiusButton, // border-radius: 13px
          backgroundColor: disabled ? 'rgba(255, 255, 255, 0.04)' : styleConfig.bg,
          borderColor: styleConfig.border,
          borderTopWidth: isPressed ? 2 : 1, // simulated top border for inset/raised
          borderLeftWidth: isPressed ? 2 : 1,
          borderBottomWidth: isPressed ? 1 : 2,
          borderRightWidth: isPressed ? 1 : 2,
        },
        disabled 
          ? {} 
          : (isPressed ? shadows.inset : shadows.raised), // raised default, inset when pressed
        animatedStyle
      ]}>
        {styleConfig.useGlass && !disabled ? (
          <BlurView 
            intensity={12} // backdrop-filter blur(12px) as per design.md §4A
            tint={isDark ? 'dark' : 'light'}
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
    paddingHorizontal: 21,
    overflow: 'hidden', // Required for BlurView
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  text: {
    fontSize: 16, // Modular scale
    letterSpacing: 0.2,
  }
});
