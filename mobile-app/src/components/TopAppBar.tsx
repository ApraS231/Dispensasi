import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS } from '../utils/theme';
import { ICONS } from '../utils/icons';

interface TopAppBarProps {
  showAvatar?: boolean;
  avatarLabel?: string;
  showNotification?: boolean;
  title?: string;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  onBack?: () => void;
}

export default function TopAppBar({
  showAvatar = true,
  avatarLabel,
  showNotification = true,
  title = 'SiDispen',
  onNotificationPress,
  onAvatarPress,
  onBack,
}: TopAppBarProps) {
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
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <MaterialCommunityIcons name={ICONS.back} size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
        {showAvatar && !onBack ? (
          <TouchableOpacity style={styles.avatarBtn} onPress={handleAvatar} activeOpacity={0.7}>
            {avatarLabel ? (
              <Text style={styles.avatarText}>{avatarLabel}</Text>
            ) : (
              <MaterialCommunityIcons name="account-circle" size={32} color={COLORS.primary} />
            )}
          </TouchableOpacity>
        ) : (
          !onBack && <View style={styles.placeholder} />
        )}
      </View>

      <Text style={styles.title}>{title}</Text>

      {showNotification ? (
        <TouchableOpacity style={styles.iconBtn} onPress={handleNotification} activeOpacity={0.7}>
          <MaterialCommunityIcons name={ICONS.notification} size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    paddingTop: SPACING.statusBar + SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    height: SPACING.statusBar + 64,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 48,
  },
  iconBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  avatarText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 18,
    color: COLORS.onPrimaryContainer,
  },
  title: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.textPrimary,
    letterSpacing: 0,
  },
  placeholder: {
    width: 48,
    height: 48,
  },
});
