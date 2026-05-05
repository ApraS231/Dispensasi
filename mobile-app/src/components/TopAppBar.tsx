import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  interpolate,
  Extrapolation,
  SharedValue
} from 'react-native-reanimated';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS, GLASS } from '../utils/theme';
import { ICONS } from '../utils/icons';

interface TopAppBarProps {
  showAvatar?: boolean;
  avatarLabel?: string;
  showNotification?: boolean;
  title?: string;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  onBack?: () => void;
  scrollY?: SharedValue<number>;
  rightComponent?: React.ReactNode;
}

export default function TopAppBar({
  showAvatar = true,
  avatarLabel,
  showNotification = true,
  title = 'SiDispen',
  onNotificationPress,
  onAvatarPress,
  onBack,
  scrollY,
  rightComponent,
}: TopAppBarProps) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 1.5 - pulse.value,
  }));

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const height = interpolate(scrollY.value, [0, 100], [SPACING.statusBar + 88, SPACING.statusBar + 64], Extrapolation.CLAMP);
    return { height };
  });

  const animatedContentStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const opacity = interpolate(scrollY.value, [0, 80], [1, 0.9], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [0, 80], [1, 0.95], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const handleNotification = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      router.push('/notifications' as any);
    }
  };

  const handleAvatar = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else {
      router.push('/profile' as any);
    }
  };

  return (
    <Animated.View style={[styles.outerContainer, animatedContainerStyle, SHADOWS.toolbarShadow]}>
      <BlurView intensity={GLASS.blurIntensity + 10} tint={GLASS.tintColor} style={StyleSheet.absoluteFill} />
      
      {/* Top Lighting Highlight */}
      <LinearGradient
        colors={['rgba(255,255,255,0.4)', 'transparent']}
        style={styles.topLight}
      />

      <Animated.View style={[styles.content, animatedContentStyle]}>
        <View style={styles.leftSection}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <MaterialCommunityIcons name={ICONS.back} size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : (
            showAvatar && (
              <TouchableOpacity style={styles.avatarWrapper} onPress={handleAvatar} activeOpacity={0.7}>
                <View style={styles.avatarRing}>
                  <View style={styles.avatarInner}>
                    {avatarLabel ? (
                      <Text style={styles.avatarText}>{avatarLabel}</Text>
                    ) : (
                      <MaterialCommunityIcons name="account" size={24} color={COLORS.primary} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          )}
        </View>

        <View style={styles.centerSection}>
          <Text style={styles.engravedTitle} numberOfLines={1}>{title}</Text>
        </View>

        <View style={styles.rightSection}>
          {rightComponent ? rightComponent : (
            showNotification && (
              <TouchableOpacity style={styles.notificationBtn} onPress={handleNotification} activeOpacity={0.7}>
                <View style={styles.iconHousing}>
                  <MaterialCommunityIcons name={ICONS.notification} size={22} color={COLORS.textPrimary} />
                  <View style={styles.dotWrapper}>
                    <Animated.View style={[styles.notificationPulse, pulseStyle]} />
                    <View style={styles.notificationDot} />
                  </View>
                </View>
              </TouchableOpacity>
            )
          )}
        </View>
      </Animated.View>

      {/* Bottom Lip shadow */}
      <View style={styles.bottomLip} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: SPACING.statusBar + 88,
    backgroundColor: COLORS.surfaceContainer,
    overflow: 'hidden',
  },
  topLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.statusBar,
  },
  leftSection: {
    width: 60 as any,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 60 as any,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    ...SHADOWS.elevation3,
  },
  avatarRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 18,
    color: COLORS.onPrimaryContainer,
  },
  backBtn: {
    ...SHADOWS.inset, // Recessed look
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.glassSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  engravedTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHousing: {
    ...SHADOWS.raised,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.glassSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.glassHighlight,
  },
  dotWrapper: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  notificationPulse: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
  },
  bottomLip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderTopWidth: 1,
    borderTopColor: COLORS.glassHighlight,
  },
});

