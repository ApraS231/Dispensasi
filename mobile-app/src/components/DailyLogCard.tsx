import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS } from '../utils/theme';

interface DailyLogCardProps {
  item: any;
}

export default function DailyLogCard({ item }: DailyLogCardProps) {
  const isScanned = item.is_scanned;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.siswa?.name || 'Siswa'}</Text>
          <Text style={styles.izinType}>{item.jenis_izin?.replace(/_/g, ' ')}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isScanned ? COLORS.successBg : COLORS.warningBg }]}>
          <MaterialCommunityIcons
            name={isScanned ? "check-circle" : "clock-outline"}
            size={14}
            color={isScanned ? COLORS.success : COLORS.warning}
            style={styles.badgeIcon}
          />
          <Text style={[styles.badgeText, { color: isScanned ? COLORS.success : COLORS.warning }]}>
            {isScanned ? 'Telah Discan' : 'Menunggu Scan'}
          </Text>
        </View>
      </View>

      {isScanned && item.scanner && (
        <View style={styles.scannerInfo}>
          <MaterialCommunityIcons name="account-check" size={14} color={COLORS.textSecondary} />
          <Text style={styles.scannerText}>
            Discan oleh {item.scanner?.name} pada {new Date(item.scanned_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: SIZES.radius,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.softCard,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  studentName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  izinType: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusBadge,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 11,
  },
  scannerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
    borderStyle: 'dashed',
  },
  scannerText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});
