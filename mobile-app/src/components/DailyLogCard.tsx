import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS, GLASS } from '../utils/theme';
import { BlurView } from 'expo-blur';
import SkeuCard from './SkeuCard';
import AvatarInitials from './AvatarInitials';

interface DailyLogCardProps {
  item: any;
}

export default function DailyLogCard({ item }: { item: any }) {
  const isScanned = item.is_scanned;

  return (
    <View style={styles.cardWrapper}>
      <SkeuCard 
        isGlass 
        accentColor={isScanned ? COLORS.success : COLORS.warning} 
        style={styles.skeuCard}
      >
        <View style={styles.mainRow}>
          {/* Avatar with deep inset shadow */}
          <View style={styles.avatarOuter}>
            <AvatarInitials 
              name={item.siswa?.name || 'S'} 
              size={44} 
              fontSize={18} 
            />
          </View>
          
          <View style={styles.contentCol}>
            <Text style={styles.studentName} numberOfLines={1}>{item.siswa?.name || 'Siswa'}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, { borderColor: isScanned ? 'rgba(7, 190, 184, 0.2)' : 'rgba(255, 159, 28, 0.2)' }]}>
                <Text style={[styles.izinType, { color: isScanned ? COLORS.success : COLORS.warning }]}>
                  {item.jenis_izin?.replace(/_/g, ' ')}
                </Text>
              </View>
              <Text style={styles.timeText}>
                {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={styles.statusCol}>
             {isScanned ? (
               <View style={styles.scannedIcon}>
                 <MaterialCommunityIcons name="check-decagram" size={24} color={COLORS.success} />
                 <Text style={[styles.statusText, { color: COLORS.success }]}>EXIT</Text>
               </View>
             ) : (
               <View style={styles.pendingIcon}>
                 <MaterialCommunityIcons name="clock-outline" size={24} color={COLORS.warning} />
                 <Text style={[styles.statusText, { color: COLORS.warning }]}>WAIT</Text>
               </View>
             )}
          </View>
        </View>

        {isScanned && (
          <View style={[styles.footer, SHADOWS.inset]}>
            <MaterialCommunityIcons name="account-check" size={12} color={COLORS.textMuted} />
            <Text style={styles.footerText}>
              Verified by {item.scanner?.name?.split(' ')[0]} • {new Date(item.scanned_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      </SkeuCard>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  skeuCard: {
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarOuter: {
    ...SHADOWS.elevation3,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  contentCol: {
    flex: 1,
  },
  studentName: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.textPrimary,
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
    borderRadius: 6,
    borderWidth: 0.5,
  },
  izinType: {
    fontFamily: FONTS.headingSemi,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
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
    fontFamily: FONTS.heading,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: -2,
  },
  footer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.2,
  },
});
