import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated, Dimensions, LayoutChangeEvent } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS } from '../utils/theme';
import { HapticFeedback } from './../utils/haptics';

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
      <View style={styles.container} onLayout={onLayout}>
        <Animated.View
          style={[
            styles.slider,
            {
              width: tabWidth - 16, // padding adjustment
              transform: [{ translateX: slideAnim }],
            },
          ]}
        />
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
                  color={isActive ? COLORS.textPrimary : COLORS.textMuted}
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
      </View>
    </View>
  );
}

export const SISWA_TABS: TabItem[] = [
  { name: 'dashboard', label: 'HOME', icon: 'home-outline', activeIcon: 'home' },
  { name: 'riwayat', label: 'HISTORY', icon: 'clock-outline', activeIcon: 'clock' },
  { name: 'pengajuan', label: 'PERMIT', icon: 'file-document-outline', activeIcon: 'file-document' },
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
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 32 : 24,
    left: SPACING.md,
    right: SPACING.md,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: SIZES.radiusLg,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#8D99AE',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  slider: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    height: 40,
    zIndex: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontFamily: FONTS.headingSemi,
    fontSize: 10,
    color: COLORS.textPrimary,
    marginLeft: 4,
  },
});
