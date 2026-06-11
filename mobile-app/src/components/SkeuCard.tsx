import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';

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
  blurIntensity = 24, // Optimized as per design.md §4B
  tint
}: SkeuCardProps) {
  const { colors, isDark, SIZES, SPACING, shadows } = useTheme();
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

  const resolvedTint = tint || (isDark ? 'dark' : 'light');

  const content = (
    <Animated.View style={[
      styles.card, 
      { borderRadius: SIZES.radiusCard },
      shadows.embossedCard,
      animatedStyle,
      style
    ]}>
      {/* Middle clipping container to fix Android shadow-overflow conflict */}
      <View style={{ borderRadius: SIZES.radiusCard, overflow: 'hidden', width: '100%' }}>
        {isGlass ? (
          <BlurView 
            intensity={blurIntensity} 
            tint={resolvedTint} 
            style={styles.surface}
          >
            {/* Diagonal Glass Gradient background (§4B) */}
            <LinearGradient
              colors={
                isDark 
                  ? ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.03)']
                  : ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.10)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderRadius: SIZES.radiusCard }]}
            />
            
            {/* Light Source Highlights (Top-Left) */}
            <View style={[styles.topHighlight, { backgroundColor: colors.glassHighlight }]} pointerEvents="none" />
            <View style={[styles.leftHighlight, { backgroundColor: colors.glassHighlight }]} pointerEvents="none" />
            
            {/* Accent Strip */}
            {showAccentStrip && (
              <View style={[styles.accentStrip, { backgroundColor: accentColor || colors.primary }]} pointerEvents="none">
                <View style={styles.accentGlow} />
              </View>
            )}
            
            {/* Texture Overlay */}
            <View style={[styles.textureOverlay, { borderRadius: SIZES.radiusCard }]} pointerEvents="none" />
            
            <View style={[styles.content, { padding: SIZES.radiusCard }, showAccentStrip && styles.contentWithAccent]}>
              {children}
            </View>
            
            {/* Bottom Lip Shadow */}
            <View style={[styles.bottomLip, { backgroundColor: colors.glassShadow }]} pointerEvents="none" />
          </BlurView>
        ) : (
          <View style={[styles.surface, { backgroundColor: colors.surface }]}>
            {/* Solid Card content */}
            {showAccentStrip && (
              <View style={[styles.accentStrip, { backgroundColor: accentColor || colors.primary }]} pointerEvents="none" />
            )}
            <View style={[styles.content, { padding: SIZES.radiusCard }, showAccentStrip && styles.contentWithAccent]}>
              {children}
            </View>
          </View>
        )}
      </View>
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
  },
  surface: {
    flexDirection: 'row',
    width: '100%',
  },
  content: {
    flex: 1,
  },
  contentWithAccent: {
    paddingLeft: 27, // SIZES.radiusCard (21) + 6px strip width
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
    zIndex: 5,
  },
  leftHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 5,
  },
  bottomLip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1.5,
    zIndex: 5,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.02)',
    opacity: 0.05,
    zIndex: 1,
  }
});
