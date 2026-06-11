import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { BlurView } from 'expo-blur';

interface NotificationBannerProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  time: string;
  isRead?: boolean;
  onPress?: () => void;
}

export default function NotificationBanner({
  title,
  message,
  type = 'info',
  time,
  isRead = false,
  onPress,
}: NotificationBannerProps) {
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();

  const getStyleByType = () => {
    switch (type) {
      case 'success':
        return { icon: 'check', color: colors.success, bg: colors.successBg };
      case 'warning':
        return { icon: 'alert', color: colors.warning, bg: colors.warningBg };
      case 'error':
        return { icon: 'close-circle-outline', color: colors.error, bg: colors.errorBg };
      case 'info':
      default:
        return { icon: 'information', color: colors.info, bg: colors.infoBg };
    }
  };

  const styleConfig = getStyleByType();

  const content = (
    <BlurView
      intensity={24} // design.md blur(24px)
      tint={isDark ? 'dark' : 'light'}
      style={[
        styles.container,
        {
          borderRadius: SIZES.radiusLg,
          padding: SPACING.md,
          borderColor: isRead ? colors.glassHighlight : colors.primaryLight,
          backgroundColor: isRead ? colors.glassSurface : colors.surfaceContainerHighest,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          shadows.inset,
          {
            backgroundColor: styleConfig.bg,
            borderRadius: SIZES.radiusLg, // 21px
            marginRight: SPACING.md,
          },
        ]}
      >
        <MaterialCommunityIcons name={styleConfig.icon as any} size={24} color={styleConfig.color} />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              {
                fontFamily: isRead ? FONTS.headingSemi : FONTS.heading,
                fontSize: 16, // Modular scale text-body
                color: colors.textPrimary,
                paddingRight: SPACING.sm,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.time,
              {
                fontFamily: FONTS.code,
                fontSize: 10, // Modular scale text-caption
                color: colors.textMuted,
              },
            ]}
          >
            {time}
          </Text>
        </View>
        <Text
          style={[
            styles.message,
            {
              fontFamily: FONTS.bodyMedium,
              fontSize: 16, // Modular scale text-body
              color: colors.textSecondary,
            },
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>

      {!isRead && (
        <View style={[styles.unreadDotContainer, { marginLeft: SPACING.sm }]}>
          <View style={[styles.unreadDotGlow, { backgroundColor: colors.primary, borderRadius: SIZES.radiusSm }]} />
          <View style={[styles.unreadDot, { backgroundColor: colors.primary, borderRadius: SIZES.radiusSm }]} />
        </View>
      )}
    </BlurView>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[
          styles.shadowWrapper,
          shadows.glassPanel,
          {
            marginBottom: SPACING.sm,
            borderRadius: SIZES.radiusLg,
          },
        ]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        styles.shadowWrapper,
        shadows.glassPanel,
        {
          marginBottom: SPACING.sm,
          borderRadius: SIZES.radiusLg,
        },
      ]}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {},
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  iconBox: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  title: {
    flex: 1,
  },
  time: {},
  message: {
    lineHeight: 20,
  },
  unreadDotContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    zIndex: 2,
  },
  unreadDotGlow: {
    position: 'absolute',
    width: 16,
    height: 16,
    opacity: 0.3,
    zIndex: 1,
  },
});
