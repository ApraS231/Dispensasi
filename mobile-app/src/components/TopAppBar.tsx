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
    backgroundColor: COLORS.bgWhite,
    borderBottomWidth: 2,
    borderBottomColor: '#1A1A1A',
    height: SPACING.statusBar + 64,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 48,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusButton,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusButton, // Boxy
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
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
