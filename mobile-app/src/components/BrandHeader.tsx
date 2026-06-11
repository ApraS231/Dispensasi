import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Image } from 'expo-image';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withDelay
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';

interface BrandHeaderProps {
  title?: string;
  subtitle: string;
  showLogo?: boolean;
}

export default function BrandHeader({ title = 'Sistem Perizinan Siswa', subtitle, showLogo = false }: BrandHeaderProps) {
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();
  
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  
  const textTranslateY = useSharedValue(15);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    if (showLogo) {
      logoScale.value = withSpring(1, { damping: 12, stiffness: 200 });
      logoOpacity.value = withTiming(1, { duration: 300 });
    }

    textTranslateY.value = withDelay(150, withSpring(0, { damping: 15, stiffness: 180 }));
    textOpacity.value = withDelay(150, withTiming(1, { duration: 350 }));
  }, [showLogo]);

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: textTranslateY.value }],
      opacity: textOpacity.value,
    };
  });

  return (
    <View style={[styles.container, { marginVertical: SPACING.md }]}>
      {showLogo && (
        <Animated.View style={[
          styles.logoContainer, 
          { 
            borderRadius: SIZES.radiusMd,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.45)',
            borderColor: colors.glassHighlight,
            shadowColor: colors.depthShadow,
          },
          shadows.elevation2,
          animatedLogoStyle
        ]}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>
      )}
      
      <Animated.View style={[styles.textContainer, animatedTextStyle]}>
        <Text style={[styles.title, { fontFamily: FONTS.heading, color: colors.primary }]}>{title}</Text>
        <Text style={[styles.subtitle, { fontFamily: FONTS.body, color: colors.textMuted }]}>{subtitle}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 13,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  logo: {
    width: 64,
    height: 64,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
});
