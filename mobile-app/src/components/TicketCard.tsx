import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SkeuCard from './SkeuCard';
import PillBadge from './PillBadge';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../utils/theme';
import { ICONS } from '../utils/icons';

interface TicketCardProps {
  item: any;
  onPress?: () => void;
  showName?: boolean;
}

export default function TicketCard({ item, onPress, showName }: TicketCardProps) {
  const dateObj = item.created_at ? new Date(item.created_at) : new Date();
  const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const getAccentColor = () => {
    switch (item.status) {
      case 'approved_final':
        return COLORS.success;
      case 'rejected':
        return COLORS.error;
      case 'pending':
      case 'waiting_piket':
      case 'approved_by_wali':
        return COLORS.warning;
      default:
        return COLORS.primary;
    }
  };

  const content = (
    <SkeuCard accentColor={getAccentColor()} style={styles.cardInner} isGlass>
      <View style={styles.headerRow}>
        <View style={styles.headerItem}>
          <MaterialCommunityIcons name={ICONS.calendar} size={14} color={COLORS.textSecondary} />
          <Text style={styles.headerText}>{formattedDate}</Text>
        </View>
        <View style={styles.headerItem}>
          <MaterialCommunityIcons name={ICONS.clock} size={14} color={COLORS.textSecondary} />
          <Text style={styles.headerText}>{formattedTime}</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={styles.infoCol}>
          {showName && item.siswa && (
            <Text style={styles.studentName}>{item.siswa.name}</Text>
          )}
          <Text style={styles.typeText}>{item.jenis_izin?.replace(/_/g, ' ')}</Text>
          <View style={styles.reasonContainer}>
            <MaterialCommunityIcons name="format-quote-open" size={10} color={COLORS.primaryLight} style={{ marginRight: 4 }} />
            <Text style={styles.reasonText} numberOfLines={2}>{item.alasan}</Text>
          </View>
        </View>
        <PillBadge status={item.status} />
      </View>
    </SkeuCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.wrapper}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{content}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.md,
  },
  cardInner: {
    padding: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    gap: 16,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  studentName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  typeText: {
    fontFamily: FONTS.heading,
    fontSize: 17,
    color: COLORS.primary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 6,
    borderRadius: 6,
    marginTop: 2,
  },
  reasonText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
    flex: 1,
  }
});
