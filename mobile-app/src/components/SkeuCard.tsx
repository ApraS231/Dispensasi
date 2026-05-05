import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS, SIZES, SPACING, SHADOWS, GLASS } from '../utils/theme';

interface SkeuCardProps {
  children: React.ReactNode;
  accentColor?: string;
  showAccentStrip?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  isGlass?: boolean;
  blurIntensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export default function SkeuCard({ 
  children, 
  accentColor, 
  showAccentStrip = !!accentColor, 
  onPress, 
  style,
  isGlass = false,
  blurIntensity = GLASS.blurIntensity,
  tint = GLASS.tintColor as any
}: SkeuCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const CardSurface = isGlass ? BlurView : View;
  const surfaceProps = isGlass ? { intensity: blurIntensity, tint: tint } : {};

  const content = (
    <Animated.View style={[
      styles.card, 
      SHADOWS.embossedCard,
      animatedStyle,
      style
    ]}>
      <CardSurface {...surfaceProps} style={styles.surface}>
        {/* Light Source Highlights (Top-Left) */}
        <View style={styles.topHighlight} pointerEvents="none" />
        <View style={styles.leftHighlight} pointerEvents="none" />
        
        {/* Accent Strip */}
        {showAccentStrip && (
          <View style={[styles.accentStrip, { backgroundColor: accentColor || COLORS.primary }]} pointerEvents="none">
            <View style={styles.accentGlow} />
          </View>
        )}
        
        {/* Texture Overlay */}
        <View style={styles.textureOverlay} pointerEvents="none" />
        
        <View style={[styles.content, showAccentStrip && styles.contentWithAccent]}>
          {children}
        </View>
        
        {/* Bottom Lip Shadow */}
        <View style={styles.bottomLip} pointerEvents="none" />
      </CardSurface>
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable 
        onPress={onPress} 
        onPressIn={handlePressIn} 
        onPressOut={handlePressOut}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: SIZES.radiusCard,
    overflow: 'hidden',
  },
  surface: {
    flexDirection: 'row',
    borderRadius: SIZES.radiusCard,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  contentWithAccent: {
    paddingLeft: SPACING.md + 6,
  },
  accentStrip: {
    width: 6,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
  accentGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: '40%',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 5,
  },
  leftHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 5,
  },
  bottomLip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    zIndex: 5,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.02)',
    opacity: 0.1,
    zIndex: 1,
  }
});
