import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS } from '../utils/theme';
import { ICONS } from '../utils/icons';

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

export default function BottomTabBar({ tabs, activeTab, onTabPress }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => onTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
              <MaterialCommunityIcons 
                name={isActive ? tab.activeIcon : tab.icon} 
                size={24} 
                color={isActive ? COLORS.onPrimaryContainer : COLORS.textSecondary} 
              />
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Pre-defined tab configurations per role
export const SISWA_TABS: TabItem[] = [
  { name: 'dashboard', label: 'HOME', icon: 'home-outline', activeIcon: 'home' },
  { name: 'riwayat', label: 'HISTORY', icon: 'clock-outline', activeIcon: 'clock' },
  { name: 'pengajuan', label: 'PERMIT', icon: 'file-document-outline', activeIcon: 'file-document' },
  { name: 'profile', label: 'PROFILE', icon: 'account-outline', activeIcon: 'account' },
];

export const PIKET_TABS: TabItem[] = [
  { name: 'dashboard', label: 'DASHBOARD', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
  { name: 'queue', label: 'QUEUE', icon: 'format-list-bulleted', activeIcon: 'format-list-bulleted' },
  { name: 'history', label: 'HISTORY', icon: 'clock-outline', activeIcon: 'clock' },
  { name: 'profile', label: 'PROFILE', icon: 'account-outline', activeIcon: 'account' },
];

export const WALI_TABS: TabItem[] = [
  { name: 'dashboard', label: 'DASHBOARD', icon: 'view-dashboard-outline', activeIcon: 'view-dashboard' },
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
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 12,
    paddingHorizontal: 8,
    ...SHADOWS.elevation2,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: COLORS.primaryContainer,
  },
  label: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  activeLabel: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.textPrimary,
  },
});
