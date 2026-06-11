import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { HapticFeedback } from '../utils/haptics';

export default function ThemeSelector() {
  const { colors, mode, setMode, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  // Determine selector container width dynamically
  const containerWidth = Math.min(windowWidth - SPACING.lg * 2, 400);
  const tabWidth = (containerWidth - 8) / 3; // 4px padding on each side

  const options: Array<{ id: 'light' | 'dark' | 'system'; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
    { id: 'light', label: 'Terang', icon: 'white-balance-sunny' },
    { id: 'dark', label: 'Gelap', icon: 'weather-night' },
    { id: 'system', label: 'Auto', icon: 'cellphone-cog' },
  ];

  const activeIndex = options.findIndex((opt) => opt.id === mode);

  // Animate the active indicator slide
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          translateX: withSpring(4 + activeIndex * tabWidth, { 
            damping: 18, 
            stiffness: 150 
          }) 
        }
      ],
    };
  });

  const handleSelect = (selectedMode: 'light' | 'dark' | 'system') => {
    HapticFeedback.selection();
    setMode(selectedMode);
  };

  return (
    <View style={[
      styles.outerContainer, 
      { 
        width: containerWidth, 
        marginTop: SPACING.md, 
        marginBottom: SPACING.lg 
      }
    ]}>
      {/* Glass Container */}
      <View style={[
        styles.container, 
        { 
          borderRadius: SIZES.radiusToggle || 21,
          borderColor: colors.glassBorder,
          borderWidth: 1.2,
        },
        shadows.skeuShadow
      ]}>
        <BlurView 
          intensity={20} 
          tint={isDark ? 'dark' : 'light'} 
          style={[styles.blur, { borderRadius: SIZES.radiusToggle || 21 }]}
        >
          {/* Animated Active Tab Background Indent (§4A/C) */}
          <Animated.View style={[
            styles.activeIndicator,
            { 
              width: tabWidth,
              borderRadius: (SIZES.radiusToggle || 21) - 4,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderBottomWidth: 1,
              borderRightWidth: 1,
              borderTopColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)',
              borderLeftColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.15)',
              borderBottomColor: colors.glassHighlight,
              borderRightColor: colors.glassHighlight,
            },
            animatedIndicatorStyle
          ]} />

          {/* Option Buttons */}
          <View style={styles.buttonsWrapper}>
            {options.map((option) => {
              const isActive = option.id === mode;
              return (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.8}
                  style={[styles.tabButton, { width: tabWidth }]}
                  onPress={() => handleSelect(option.id)}
                >
                  <MaterialCommunityIcons 
                    name={option.icon} 
                    size={18} 
                    color={isActive ? colors.primary : colors.textMuted} 
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[
                    styles.tabLabel, 
                    { 
                      fontFamily: isActive ? FONTS.headingSemi : FONTS.body,
                      color: isActive ? colors.textPrimary : colors.textMuted 
                    }
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignSelf: 'center',
  },
  container: {
    overflow: 'hidden',
  },
  blur: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 50,
  },
  activeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    zIndex: 1,
  },
  buttonsWrapper: {
    flexDirection: 'row',
    width: '100%',
    zIndex: 2,
  },
  tabButton: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 13,
  },
});
