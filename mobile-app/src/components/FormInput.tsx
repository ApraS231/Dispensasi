import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  TouchableOpacity,
  StyleProp,
  ViewStyle
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolateColor,
  FadeInDown,
  FadeOutUp
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { HapticFeedback } from '../utils/haptics';

interface FormInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  error?: string;
  isValid?: boolean;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function FormInput({
  label,
  icon,
  error,
  isValid,
  isPassword = false,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}: FormInputProps) {
  const { colors, isDark, SIZES, SPACING, FONTS } = useTheme();
  
  const [isFocused, setIsFocused] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);
  
  const focusProgress = useSharedValue(0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 200 });
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 200 });
    if (onBlur) onBlur(e);
  };

  const toggleSecureEntry = () => {
    HapticFeedback.light();
    setSecureTextEntry(!secureTextEntry);
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    // Interpolated background color for input wrapper (§4C)
    const bg = interpolateColor(
      focusProgress.value,
      [0, 1],
      [
        isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.05)',
        isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.08)'
      ]
    );

    // Inset border colors (simulating physical depth inset shadows)
    const borderTopLeftColor = error 
      ? colors.error 
      : isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.15)';
      
    const borderBottomRightColor = error
      ? colors.error
      : isFocused
        ? colors.primary // Highlight slightly when focused
        : isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.85)';

    return {
      backgroundColor: bg,
      borderTopColor: borderTopLeftColor,
      borderLeftColor: borderTopLeftColor,
      borderBottomColor: borderBottomRightColor,
      borderRightColor: borderBottomRightColor,
    };
  });

  return (
    <View style={[styles.container, { marginBottom: SPACING.md }, containerStyle]}>
      <Text style={[styles.label, { fontFamily: FONTS.bodyMedium, color: colors.textPrimary }]}>{label}</Text>
      
      <Animated.View style={[
        styles.inputWrapper, 
        { 
          height: 55, // 55px height as per design.md §4C
          borderRadius: SIZES.radiusInput, // border-radius: 13px
          paddingHorizontal: SPACING.sm,
          borderTopWidth: 2.5, // simulated inset depth borders
          borderLeftWidth: 2.5,
          borderBottomWidth: 1.5,
          borderRightWidth: 1.5,
        },
        animatedContainerStyle
      ]}>
        <MaterialCommunityIcons 
          name={icon} 
          size={20} 
          color={error ? colors.error : isFocused ? colors.primary : colors.textMuted} 
          style={styles.leftIcon} 
        />
        
        <TextInput
          {...props}
          secureTextEntry={secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={colors.textMuted}
          style={[styles.textInput, { fontFamily: FONTS.body, color: colors.textPrimary }]}
        />

        {isPassword ? (
          <TouchableOpacity onPress={toggleSecureEntry} style={styles.rightIcon}>
            <MaterialCommunityIcons 
              name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.textMuted} 
            />
          </TouchableOpacity>
        ) : isValid && !error ? (
          <View style={styles.rightIcon}>
            <MaterialCommunityIcons 
              name="check-circle" 
              size={20} 
              color={colors.success} 
            />
          </View>
        ) : null}
      </Animated.View>

      {error ? (
        <Animated.View 
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(150)}
          style={styles.errorContainer}
        >
          <MaterialCommunityIcons 
            name="alert-circle-outline" 
            size={14} 
            color={colors.error} 
            style={styles.errorIcon} 
          />
          <Text style={[styles.errorText, { fontFamily: FONTS.body, color: colors.error }]}>{error}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 10,
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  rightIcon: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingLeft: 4,
  },
  errorIcon: {
    marginRight: 4,
  },
  errorText: {
    fontSize: 10,
  },
});
