import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SkeuCard from './SkeuCard';
import PillBadge from './PillBadge';
import { useTheme } from '../hooks/useTheme';
import { ICONS } from '../utils/icons';
import { SPACING } from '../utils/theme';

interface TicketCardProps {
  item: any;
  onPress?: () => void;
  showName?: boolean;
  flat?: boolean;
}

export default function TicketCard({ item, onPress, showName, flat = false }: TicketCardProps) {
  const { colors, isDark, SIZES, FONTS, shadows } = useTheme();
  
  const dateObj = item.created_at ? new Date(item.created_at) : new Date();
  const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const content = (
    <View>
      <View style={[styles.headerRow, { marginBottom: SPACING.sm }]}>
        <View style={styles.headerItem}>
          <MaterialCommunityIcons name={ICONS.calendar} size={14} color={colors.textSecondary} />
          <Text style={[styles.headerText, { fontFamily: FONTS.bodyMedium, color: colors.textSecondary }]}>{formattedDate}</Text>
        </View>
        <View style={styles.headerItem}>
          <MaterialCommunityIcons name={ICONS.clock} size={14} color={colors.textSecondary} />
          <Text style={[styles.headerText, { fontFamily: FONTS.bodyMedium, color: colors.textSecondary }]}>{formattedTime}</Text>
        </View>
      </View>

      <View style={styles.mainContent}>
        <View style={[styles.infoCol, { marginRight: SPACING.sm }]}>
          {showName && item.siswa && (
            <Text style={[styles.studentName, { fontFamily: FONTS.headingSemi, color: colors.textPrimary }]}>{item.siswa.name}</Text>
          )}
          <Text style={[styles.typeText, { fontFamily: FONTS.heading, color: colors.primary }]}>
            {item.jenis_izin === 'dispensasi' ? 'perizinan' : item.jenis_izin?.replace(/_/g, ' ')}
          </Text>
          <View style={styles.reasonContainer}>
            <MaterialCommunityIcons name="format-quote-open" size={10} color={isDark ? '#7BBDE8' : colors.primaryMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.reasonText, { fontFamily: FONTS.body, color: colors.textSecondary }]} numberOfLines={2}>{item.alasan}</Text>
          </View>
        </View>
        <PillBadge status={item.status} />
      </View>
    </View>
  );

  if (flat) {
    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.wrapper, { marginBottom: SPACING.md }]}>
          {content}
        </TouchableOpacity>
      );
    }
    return <View style={[styles.wrapper, { marginBottom: SPACING.md }]}>{content}</View>;
  }

  return (
    <View style={[styles.wrapper, { marginBottom: SPACING.md }]}>
      <SkeuCard style={styles.cardInner} isGlass showAccentStrip={false} onPress={onPress}>
        {content}
      </SkeuCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  cardInner: {
    padding: 0, // padding is handled by card itself
  },
  headerRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: {
    fontSize: 10,
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoCol: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    marginBottom: 2,
  },
  typeText: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  reasonText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  }
});
