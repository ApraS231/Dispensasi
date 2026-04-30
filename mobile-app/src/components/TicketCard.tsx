import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SoftCard from './SoftCard';
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

  const content = (
    <SoftCard style={styles.cardInner}>
      <View style={styles.headerRow}>
        <View style={styles.headerItem}>
          <MaterialCommunityIcons name={ICONS.calendar} size={14} color={COLORS.textSecondary} style={styles.icon} />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <View style={styles.headerItem}>
          <MaterialCommunityIcons name={ICONS.clock} size={14} color={COLORS.textSecondary} style={styles.icon} />
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.leftCol}>
          {showName && item.siswa && (
            <Text style={styles.studentName}>{item.siswa.name}</Text>
          )}
          <Text style={styles.typeText}>{item.jenis_izin?.replace(/_/g, ' ')}</Text>
          <Text style={styles.reasonText} numberOfLines={2}>{item.alasan}</Text>
        </View>
        <View style={styles.rightCol}>
          <PillBadge status={item.status} />
        </View>
      </View>
    </SoftCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        style={styles.wrapper}
        activeOpacity={0.8}
      >
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
    borderLeftWidth: 6,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    borderLeftColor: COLORS.primary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  dateText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  timeText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftCol: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  rightCol: {
    justifyContent: 'center',
  },
  studentName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  typeText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 15,
    color: COLORS.primary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  reasonText: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
  }
});
