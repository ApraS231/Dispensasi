import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions, LayoutChangeEvent } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS, GLASS } from '../utils/theme';
import { HapticFeedback } from './../utils/haptics';
import { BlurView } from 'expo-blur';

export interface TabItem {
  name: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  activeIcon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface BottomTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

const { width } = Dimensions.get('window');

export default function BottomTabBar({ tabs, activeTab, onTabPress }: BottomTabBarProps) {
  const [containerWidth, setContainerWidth] = useState(width - SPACING.md * 2);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const tabWidth = containerWidth / tabs.length;
  const activeIndex = tabs.findIndex(t => t.name === activeTab) >= 0 ? tabs.findIndex(t => t.name === activeTab) : 0;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * tabWidth,
      useNativeDriver: true,
      bounciness: 12,
      speed: 14,
    }).start();
  }, [activeTab, containerWidth]);

  const handlePress = (tabName: string) => {
    HapticFeedback.light();
    onTabPress(tabName);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.outerContainer}>
      <BlurView intensity={GLASS.blurIntensity + 30} tint={GLASS.tintColor} style={styles.container} onLayout={onLayout}>
        <View style={styles.grooveBackground} />
        
        <Animated.View
          style={[
            styles.slider,
            {
              width: tabWidth - 16, // padding adjustment
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <View style={styles.sliderHighlight} />
        </Animated.View>
        
        {tabs.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => handlePress(tab.name)}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrapper}>
                <MaterialCommunityIcons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? COLORS.primary : COLORS.textMuted}
                />
              </View>
              {isActive && (
                <Text style={styles.activeLabel}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

export const SISWA_TABS: TabItem[] = [
  { name: 'dashboard', label: 'HOME', icon: 'home-outline', activeIcon: 'home' },
  { name: 'riwayat', label: 'HISTORY', icon: 'clock-outline', activeIcon: 'clock' },
  { name: 'profile', label: 'PROFILE', icon: 'account-outline', activeIcon: 'account' },
];

export const PIKET_TABS: TabItem[] = [
  { name: 'dashboard', label: 'HOME', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
  { name: 'queue', label: 'QUEUE', icon: 'format-list-bulleted', activeIcon: 'format-list-bulleted' },
  { name: 'history', label: 'HISTORY', icon: 'clock-outline', activeIcon: 'clock' },
  { name: 'profile', label: 'PROFILE', icon: 'account-outline', activeIcon: 'account' },
];

export const WALI_TABS: TabItem[] = [
  { name: 'dashboard', label: 'HOME', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
  { name: 'queue', label: 'QUEUE', icon: 'format-list-bulleted', activeIcon: 'format-list-bulleted' },
  { name: 'history', label: 'HISTORY', icon: 'clock-outline', activeIcon: 'clock' },
  { name: 'profile', label: 'PROFILE', icon: 'account-outline', activeIcon: 'account' },
];

export const ORTU_TABS: TabItem[] = [
  { name: 'dashboard', label: 'BERANDA', icon: 'home-outline', activeIcon: 'home' },
  { name: 'riwayat', label: 'RIWAYAT', icon: 'clock-outline', activeIcon: 'clock' },
  { name: 'profile', label: 'PROFIL', icon: 'account-outline', activeIcon: 'account' },
];

const styles = StyleSheet.create({
  outerContainer: {
    ...SHADOWS.skeuShadow,
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: SIZES.radiusGlassPanel,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.glassHighlight,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: SIZES.radiusGlassPanel,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  grooveBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: SIZES.radiusGlassPanel,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  slider: {
    ...SHADOWS.raised,
    position: 'absolute',
    top: 10,
    bottom: 10,
    left: 8,
    backgroundColor: COLORS.glassSurface,
    borderRadius: SIZES.radiusToggle,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
    overflow: 'hidden',
  },
  sliderHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.innerGlow,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 48,
    zIndex: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontFamily: FONTS.headingSemi,
    fontSize: 11,
    color: COLORS.primary,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});
