import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTheme } from '../hooks/useTheme';
import { ICONS } from '../utils/icons';
import { useHeaderStore } from '../stores/headerStore';
import { useAuthStore } from '../stores/authStore';
import api from '../utils/api';

interface TopAppBarProps {
  showAvatar?: boolean;
  avatarLabel?: string;
  showNotification?: boolean;
  title?: string;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  onBack?: () => void;
  scrollY?: any;
  rightComponent?: React.ReactNode;
  isGlobal?: boolean;
}

export default function TopAppBar({
  showAvatar = true,
  avatarLabel,
  showNotification = true,
  title = 'Sistem Perizinan Siswa',
  onNotificationPress,
  onAvatarPress,
  onBack,
  scrollY,
  rightComponent,
  isGlobal = false,
}: TopAppBarProps) {
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();
  
  const setHeaderProps = useHeaderStore((state) => state.setHeaderProps);
  const setHasGlobalHeader = useHeaderStore((state) => state.setHasGlobalHeader);
  const hasGlobalHeader = useHeaderStore((state) => state.hasGlobalHeader);
  const globalProps = useHeaderStore();

  const [unreadCount, setUnreadCount] = useState(0);
  const token = useAuthStore((state) => state.token);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count ?? 0);
    } catch (e) {
      console.log('Error fetching unread count', e);
    }
  }, [token]);

  // Fetch immediately when screen is focused (for the active header)
  useFocusEffect(
    useCallback(() => {
      // Only fetch in the instance that actually renders
      const isRendered = isGlobal || !hasGlobalHeader;
      if (!isRendered || !token) return;

      fetchUnreadCount();

      // Poll every 15 seconds
      const interval = setInterval(fetchUnreadCount, 15000);

      return () => {
        clearInterval(interval);
      };
    }, [isGlobal, hasGlobalHeader, token, fetchUnreadCount])
  );

  // Set the global header active state
  useEffect(() => {
    if (isGlobal) {
      setHasGlobalHeader(true);
      return () => {
        setHasGlobalHeader(false);
      };
    }
  }, [isGlobal]);

  // If this is a local instance rendered inside a screen, portal the props to the global store and render nothing.
  useFocusEffect(
    useCallback(() => {
      if (!isGlobal && hasGlobalHeader) {
        setHeaderProps({
          title,
          showAvatar,
          showNotification,
          onBack,
          rightComponent,
        });
      }
    }, [isGlobal, hasGlobalHeader, title, showAvatar, showNotification, onBack, rightComponent])
  );

  if (!isGlobal && hasGlobalHeader) {
    return null;
  }

  // Determine active props depending on whether it is global or local
  const activeProps = isGlobal ? globalProps : {
    title,
    showAvatar,
    showNotification,
    onBack,
    rightComponent,
  };

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
    } else {
      router.push('/profile' as any);
    }
  };

  return (
    <View
      style={[
        styles.outerContainer,
        {
          height: SPACING.statusBar + 88,
          backgroundColor: isDark ? colors.bgPrimary : '#0A4174', // Fallback color
          borderBottomWidth: isDark ? 1 : 0,
          borderBottomColor: isDark ? colors.outlineVariant : 'transparent',
        },
        shadows.toolbarShadow,
      ]}
    >
      {/* Opaque Solid Gradient Background */}
      <LinearGradient
        colors={isDark ? [colors.bgPrimary, colors.bgSecondary] : ['#0A4174', '#062d52']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.content,
          {
            paddingHorizontal: SPACING.md,
            paddingTop: SPACING.statusBar,
          },
        ]}
      >
        <View style={styles.leftSection}>
          {activeProps.onBack && (
            <TouchableOpacity
              onPress={activeProps.onBack}
              style={[
                styles.backBtn,
                {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: SIZES.radiusFull,
                },
              ]}
            >
              <MaterialCommunityIcons name={ICONS.back} size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerSection}>
          <View style={styles.titleWrapper}>
            <Image 
              source={require('../../assets/images/logo.png')} 
              style={styles.headerLogo}
              contentFit="contain"
            />
            <Text
              style={[
                styles.titleText,
                {
                  fontFamily: FONTS.heading,
                  fontSize: 21, // Modular scale text-h3
                  color: '#FFFFFF',
                },
              ]}
              numberOfLines={1}
            >
              {activeProps.title}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          {activeProps.rightComponent ? (
            activeProps.rightComponent
          ) : (
            activeProps.showNotification && (
              <TouchableOpacity style={styles.notificationBtn} onPress={handleNotification} activeOpacity={0.7}>
                <View
                  style={[
                    styles.iconHousing,
                    {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: SIZES.radius, // 13px
                    },
                  ]}
                >
                  <MaterialCommunityIcons name={ICONS.notification} size={22} color="#FFFFFF" />
                  {unreadCount > 0 && (
                    <View style={styles.dotWrapper}>
                      <View
                        style={[
                          styles.notificationDot,
                          {
                            backgroundColor: colors.error,
                            borderColor: isDark ? colors.bgPrimary : '#0A4174',
                            borderRadius: SIZES.radiusFull,
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    width: 60,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 44,
    height: 44,
  },
  avatarRing: {
    width: 44,
    height: 44,
    padding: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },
  avatarInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 28,
    height: 28,
  },
  titleText: {
    textAlign: 'center',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHousing: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dotWrapper: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderWidth: 1.5,
  },
});
