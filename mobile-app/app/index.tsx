import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withDelay,
  withRepeat,
  withSequence
} from 'react-native-reanimated';
import { useAuthStore } from '../src/stores/authStore';
import { useTheme } from '../src/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

const Dot = ({ delay, color }: { delay: number; color: string }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        true
      )
    );
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return <Animated.View style={[styles.dot, { backgroundColor: color }, animatedStyle]} />;
};

export default function IndexScreen() {
  const { user, isLoading } = useAuthStore();
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();
  const [isAnimationReady, setIsAnimationReady] = useState(false);

  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  
  const textTranslateY = useSharedValue(15);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 150 });
    logoOpacity.value = withTiming(1, { duration: 450 });

    textTranslateY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 150 }));
    textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

    const timer = setTimeout(() => {
      setIsAnimationReady(true);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLoading || !isAnimationReady) return;

    if (!user) {
      router.replace('/login');
    } else {
      switch (user.role) {
        case 'siswa':
          router.replace('/(siswa)/dashboard');
          break;
        case 'guru_piket':
          router.replace('/(piket)/dashboard');
          break;
        case 'wali_kelas':
          router.replace('/(wali)/dashboard');
          break;
        case 'orang_tua':
          router.replace('/(ortu)/dashboard');
          break;
        default:
          router.replace('/login');
      }
    }
  }, [user, isLoading, isAnimationReady]);

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
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
      <View style={[styles.content, { padding: SPACING.xl }]}>
        <Animated.View style={[
          styles.logoContainer, 
          {
            borderRadius: SIZES.radiusLg,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.45)',
            borderColor: colors.glassHighlight,
            shadowColor: colors.depthShadow,
          },
          shadows.elevation3,
          animatedLogoStyle
        ]}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={{ width: 72, height: 72 }}
            contentFit="contain"
          />
        </Animated.View>
        
        <Animated.View style={[styles.textContainer, animatedTextStyle]}>
          <Text style={[styles.title, { fontFamily: FONTS.heading, color: colors.primary }]}>Sistem Perizinan Siswa</Text>
          <Text style={[styles.subtitle, { fontFamily: FONTS.bodyMedium, color: colors.textMuted }]}>Sistem Perizinan Siswa SMAN 3</Text>
        </Animated.View>

        <View style={styles.loadingContainer}>
          <Dot delay={0} color={colors.primary} />
          <Dot delay={150} color={colors.primary} />
          <Dot delay={300} color={colors.primary} />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: 21, // SPACING.md
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  logo: {
    width: 88,
    height: 88,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 55, // SPACING.xl
  },
  title: {
    fontSize: 36,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: { 
    marginTop: 6, 
    fontSize: 14, 
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
});
