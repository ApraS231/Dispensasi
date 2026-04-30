import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../utils/theme';

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
  onPress 
}: NotificationBannerProps) {
  
  const getStyleByType = () => {
    switch (type) {
      case 'success': return { icon: 'check', color: COLORS.success, bg: COLORS.successBg };
      case 'warning': return { icon: 'alert', color: COLORS.warning, bg: COLORS.warningBg };
      case 'error': return { icon: 'close-circle-outline', color: COLORS.error, bg: COLORS.errorBg };
      case 'info':
      default: return { icon: 'information', color: COLORS.info, bg: COLORS.infoBg };
    }
  };

  const styleConfig = getStyleByType();

  const content = (
    <View style={[
      styles.container, 
      !isRead && styles.containerUnread
    ]}>
      <View style={[styles.iconBox, { backgroundColor: styleConfig.bg }]}>
        <MaterialCommunityIcons name={styleConfig.icon as any} size={24} color={styleConfig.color} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !isRead && styles.textBold]}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>{message}</Text>
      </View>

      {!isRead && <View style={styles.unreadDot} />}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: SIZES.radiusLg,
    marginBottom: SPACING.sm,

    alignItems: 'center',
    ...SHADOWS.softCard,
  },
  containerUnread: {
    backgroundColor: COLORS.bgWhite,
    borderColor: COLORS.success,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  textBold: {
    fontFamily: FONTS.heading,
  },
  time: {
    fontFamily: FONTS.code,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  message: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginLeft: SPACING.sm,
    ...SHADOWS.softCard,
    shadowColor: COLORS.success,
  }
});
