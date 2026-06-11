import React from 'react';
import { StyleSheet, View, Text, Modal } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  SlideInDown,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface SuccessOverlayProps {
  visible: boolean;
  title?: string;
  message?: string;
  isRegister?: boolean;
}

export default function SuccessOverlay({
  visible,
  title = 'Berhasil',
  message,
  isRegister = false,
}: SuccessOverlayProps) {
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(250)}
        style={[
          styles.overlay,
          {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.5)',
            padding: SPACING.lg,
          },
        ]}
      >
        <Animated.View
          entering={ZoomIn.duration(350).springify().damping(15)}
          style={styles.cardContainer}
        >
          <View
            style={[
              styles.solidCard,
              {
                borderRadius: SIZES.radiusGlassPanel,
                paddingVertical: SPACING.lg,
                paddingHorizontal: SPACING.md,
                backgroundColor: isDark ? '#1E1E2C' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                borderWidth: isDark ? 1.5 : 1,
              },
              shadows.embossedCard,
            ]}
          >
            <View style={styles.content}>
              {/* Minimal Checkmark Icon */}
              <View
                style={[
                  styles.iconCircle,
                  {
                    borderRadius: SIZES.radiusXl, // 34px
                    backgroundColor: isDark ? 'rgba(6, 214, 160, 0.12)' : 'rgba(6, 214, 160, 0.08)',
                    marginBottom: SPACING.md,
                  },
                ]}
              >
                <MaterialCommunityIcons name="check" size={32} color={colors.success} />
              </View>

              <Text
                style={[
                  styles.title,
                  {
                    fontFamily: FONTS.heading,
                    fontSize: 21, // Simpler text-h3 size
                    color: colors.textPrimary,
                    marginBottom: SPACING.xs,
                  },
                ]}
              >
                {title}
              </Text>

              {message ? (
                <Text
                  style={[
                    styles.message,
                    {
                      fontFamily: FONTS.body,
                      fontSize: 14, // Simpler body text size
                      color: colors.textSecondary,
                      marginBottom: isRegister ? SPACING.md : 0,
                    },
                  ]}
                >
                  {message}
                </Text>
              ) : null}

              {isRegister ? (
                <Animated.View
                  entering={SlideInDown.delay(200).duration(300)}
                  style={[
                    styles.infoBox,
                    {
                      backgroundColor: isDark ? 'rgba(123, 189, 232, 0.05)' : 'rgba(10, 65, 116, 0.03)',
                      borderColor: isDark ? 'rgba(123, 189, 232, 0.1)' : 'rgba(10, 65, 116, 0.05)',
                      borderRadius: SIZES.radius,
                      padding: SPACING.md,
                      marginTop: SPACING.sm,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color={colors.primary}
                    style={[styles.infoIcon, { marginRight: SPACING.sm }]}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text
                      style={[
                        styles.infoTitle,
                        {
                          fontFamily: FONTS.headingSemi,
                          fontSize: 14,
                          color: colors.primary,
                        },
                      ]}
                    >
                      Menunggu Persetujuan
                    </Text>
                    <Text
                      style={[
                        styles.infoDescription,
                        {
                          fontFamily: FONTS.body,
                          fontSize: 10,
                          color: colors.textMuted,
                        },
                      ]}
                    >
                      Permohonan masuk kelas Anda telah dikirimkan. Silakan hubungi Wali Kelas Anda untuk menyetujui pendaftaran ini.
                    </Text>
                  </View>
                </Animated.View>
              ) : null}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 320,
  },
  solidCard: {
    width: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    borderWidth: 1,
    width: '100%',
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    marginBottom: 4,
  },
  infoDescription: {
    lineHeight: 14,
  },
});
