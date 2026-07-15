import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import SkeuCard from './SkeuCard';
import AvatarInitials from './AvatarInitials';

interface DailyLogCardProps {
  item: any;
}

export default function DailyLogCard({ item }: DailyLogCardProps) {
  const { colors, isDark, SIZES, SPACING, FONTS, shadows } = useTheme();
  const isScanned = item.is_scanned;

  return (
    <View style={[styles.cardWrapper, { marginBottom: SPACING.md }]}>
      <SkeuCard
        isGlass
        accentColor={isScanned ? colors.success : colors.warning}
        style={[
          styles.skeuCard,
          {
            padding: SPACING.sm, // 13px spacing-sm
            borderColor: colors.glassBorder,
          },
        ]}
      >
        <View style={styles.mainRow}>
          {/* Avatar with deep inset shadow */}
          <View style={[styles.avatarOuter, shadows.raised, { borderRadius: SIZES.radiusCard }]}>
            <AvatarInitials
              name={item.siswa?.name || 'S'}
              size={44}
              fontSize={16} // Modular scale text-body
            />
          </View>

          <View style={styles.contentCol}>
            <Text
              style={[
                styles.studentName,
                { fontFamily: FONTS.heading, fontSize: 16, color: colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {item.siswa?.name || 'Siswa'}
            </Text>
            <View style={styles.metaRow}>
              <View
                style={[
                  styles.typeBadge,
                  {
                    borderColor: isScanned ? 'rgba(6, 214, 160, 0.2)' : 'rgba(255, 209, 102, 0.2)',
                    borderRadius: SIZES.radiusBadge, // 8px
                  },
                ]}
              >
                <Text
                  style={[
                    styles.izinType,
                    {
                      fontFamily: FONTS.headingSemi,
                      fontSize: 10, // Modular scale text-caption
                      color: isScanned ? colors.success : colors.warning,
                    },
                  ]}
                >
                  {item.jenis_izin?.replace(/_/g, ' ')}
                </Text>
              </View>
              <Text
                style={[
                  styles.timeText,
                  { fontFamily: FONTS.body, fontSize: 10, color: colors.textMuted },
                ]}
              >
                {new Date(item.created_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <View style={styles.statusCol}>
            {isScanned ? (
              <View style={styles.scannedIcon}>
                <MaterialCommunityIcons name="check-decagram" size={24} color={colors.success} />
                <Text style={[styles.statusText, { fontFamily: FONTS.heading, color: colors.success }]}>EXIT</Text>
              </View>
            ) : (
              <View style={styles.pendingIcon}>
                <MaterialCommunityIcons name="clock-outline" size={24} color={colors.warning} />
                <Text style={[styles.statusText, { fontFamily: FONTS.heading, color: colors.warning }]}>WAIT</Text>
              </View>
            )}
          </View>
        </View>

        {isScanned && (
          <View style={[styles.footer, shadows.inset, { borderRadius: SIZES.radiusBadge }]}>
            <MaterialCommunityIcons name="account-check" size={12} color={colors.textMuted} />
            <Text
              style={[
                styles.footerText,
                { fontFamily: FONTS.bodyMedium, fontSize: 10, color: colors.textMuted },
              ]}
            >
              Verified by {item.scanner?.name?.split(' ')[0]} •{' '}
              {new Date(item.scanned_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )}
      </SkeuCard>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
  },
  skeuCard: {
    borderWidth: 1.5,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13, // golden ratio space-sm
  },
  avatarOuter: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  contentCol: {
    flex: 1,
  },
  studentName: {
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 0.5,
  },
  izinType: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeText: {},
  statusCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
  },
  scannedIcon: {
    alignItems: 'center',
  },
  pendingIcon: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10, // Modular scale text-caption
    letterSpacing: 1,
    marginTop: -2,
  },
  footer: {
    marginTop: 13,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    letterSpacing: 0.2,
  },
});
