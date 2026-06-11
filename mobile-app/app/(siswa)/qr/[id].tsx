import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../../src/utils/api';
import { FONTS, SPACING, SIZES } from '../../../src/utils/theme';
import { createCommonStyles } from '../../../src/utils/commonStyles';
import { useTheme } from '../../../src/hooks/useTheme';
import SkeuCard from '../../../src/components/SkeuCard';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function QRCodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0.7)).current;
  const { colors, isDark, shadows } = useTheme();
  const commonStyles = createCommonStyles(colors);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    let original: number | null = null;
    (async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          original = await Brightness.getBrightnessAsync();
          await Brightness.setBrightnessAsync(1);
        }
      } catch (e) {}
    })();
    return () => {
      if (original !== null) {
        Brightness.setBrightnessAsync(original).catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await api.get(`/dispensasi/${id}`);
        setTicket(res.data);
      } catch (e) {
        try {
           const res = await api.get('/dispensasi/me');
           const found = res.data.find((t: any) => t.id === id);
           setTicket(found);
        } catch (e2) {}
      } finally { setLoading(false); }
    };
    fetchTicket();
  }, [id]);

  const isExpired = ticket?.expires_at
    ? new Date() > new Date(ticket.expires_at)
    : false;

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.bgPrimary, colors.bgSecondary]} style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </LinearGradient>
    );
  }
  if (!ticket?.qr_token) {
    return (
      <LinearGradient colors={[colors.bgPrimary, colors.bgSecondary]} style={styles.center}>
        <Text style={[styles.errorText, { color: colors.error }]}>QR Code belum tersedia.</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={commonStyles.container}
    >
      <SafeAreaView style={commonStyles.safeArea}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <SkeuCard style={styles.backSkeu} isGlass>
              <MaterialCommunityIcons name="close" size={20} color={colors.textSecondary} />
              <Text style={[styles.backText, { color: colors.textSecondary }]}>Tutup</Text>
            </SkeuCard>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <SkeuCard style={styles.card} isGlass accentColor={colors.success}>
            
            <View style={styles.activeBadgeWrapper}>
              {ticket.status === 'completed_exit' ? (
                <View style={[styles.activeBadge, { backgroundColor: colors.success, borderColor: colors.bgPrimary }]}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={[styles.activeBadgeText, { color: '#FFFFFF' }]}>SUDAH KELUAR</Text>
                </View>
              ) : (
                <View style={[styles.activeBadge, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
                  <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
                  <Text style={[styles.activeBadgeText, { color: colors.primary }]}>IZIN AKTIF</Text>
                </View>
              )}
            </View>

            {isExpired && ticket.status !== 'completed_exit' ? (
              <View style={styles.expiredContainer}>
                <MaterialCommunityIcons name="clock-alert-outline" size={64} color={colors.error} />
                <Text style={[styles.expiredText, { color: colors.error }]}>TICKET EXPIRED</Text>
              </View>
            ) : (
              <View style={styles.qrContainer}>
                <View style={[styles.cornerTL, { borderColor: colors.primary }]} />
                <View style={[styles.cornerTR, { borderColor: colors.primary }]} />
                <View style={[styles.cornerBL, { borderColor: colors.primary }]} />
                <View style={[styles.cornerBR, { borderColor: colors.primary }]} />

                <View style={[styles.qrBg, { backgroundColor: colors.textPrimary }, ticket.status === 'completed_exit' && { opacity: 0.6 }]}>
                  <QRCode
                    value={ticket.qr_token}
                    size={width * 0.55}
                    color={colors.bgPrimary}
                    backgroundColor={colors.textPrimary}
                  />
                  {ticket.status === 'completed_exit' && (
                    <View style={styles.scannedOverlay}>
                      <MaterialCommunityIcons name="check-circle" size={80} color={colors.success} />
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.infoSection}>
              <Text style={[styles.studentName, { color: colors.textPrimary }]}>{ticket.siswa?.name || 'Siswa'}</Text>
              <Text style={[styles.studentClass, { color: colors.textSecondary }]}>
                {ticket.kelas?.nama_kelas || 'Kelas'} • {ticket.siswa?.name?.split(' ')[0].toLowerCase()}@school.id
              </Text>

              <View style={[styles.divider, { backgroundColor: colors.glassHighlight }]} />

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>TUJUAN</Text>
                  <Text style={[styles.metaValue, { color: colors.textPrimary }]}>{ticket.jenis_izin?.replace(/_/g, ' ') || '-'}</Text>
                </View>
                <View style={styles.metaColRight}>
                  <Text style={[styles.metaLabel, { color: colors.textMuted }]}>
                    {ticket.status === 'completed_exit' ? 'WAKTU KELUAR' : 'BATAS WAKTU'}
                  </Text>
                  <Text style={[styles.metaValueHighlight, { color: ticket.status === 'completed_exit' ? colors.success : colors.error }]}>
                    {formatTime(ticket.status === 'completed_exit' ? ticket.scanned_at : ticket.waktu_selesai)}
                  </Text>
                </View>
              </View>

              {ticket.status === 'completed_exit' && (
                <View style={[styles.verificationCard, { backgroundColor: isDark ? 'rgba(7, 190, 184, 0.05)' : 'rgba(7, 190, 184, 0.1)', borderColor: colors.successBg }]}>
                  <MaterialCommunityIcons name="shield-check" size={20} color={colors.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.verifyLabel, { color: colors.textMuted }]}>Diverifikasi Oleh Guru Piket</Text>
                    <Text style={[styles.verifyValue, { color: colors.success }]}>{ticket.guru_piket?.name || 'Petugas Piket'}</Text>
                  </View>
                </View>
              )}
            </View>
          </SkeuCard>
      
          <Animated.View style={[styles.validBtnWrapper, { opacity: pulseAnim }]}>
            <SkeuCard 
              style={styles.validBtn} 
              accentColor={ticket.status === 'completed_exit' ? colors.success : colors.primary}
            >
              <Text style={[styles.validBtnText, { color: ticket.status === 'completed_exit' ? colors.success : colors.primary }]}>
                {ticket.status === 'completed_exit' 
                  ? 'TELAH TERVERIFIKASI SISTEM' 
                  : 'IZIN VALID / SILAKAN KELUAR'}
              </Text>
            </SkeuCard>
          </Animated.View>
          
          <Text style={[styles.token, { color: colors.textMuted }]}>{ticket.qr_token}</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { 
    paddingHorizontal: SPACING.md, 
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg 
  },
  backSkeu: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginVertical: 0,
  },
  backText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    marginLeft: 4,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, fontFamily: FONTS.headingSemi, textAlign: 'center' },
  card: {
    width: '100%',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  activeBadgeWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: SIZES.radiusBadge,
    borderWidth: 1,
  },
  activeDot: {
    width: 8, height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  activeBadgeText: {
    fontFamily: FONTS.labelCaps,
  },
  expiredContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiredText: {
    fontFamily: FONTS.headingSemi,
    marginTop: 10,
    fontSize: 18,
  },
  qrContainer: {
    padding: 12,
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 8 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 8 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 8 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 8 },
  qrBg: {
    padding: SPACING.sm,
    borderRadius: SIZES.radius,
  },
  infoSection: {
    width: '100%',
  },
  studentName: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 4,
  },
  studentClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: SPACING.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: { flex: 1 },
  metaColRight: { flex: 1, alignItems: 'flex-end' },
  metaLabel: {
    fontFamily: FONTS.labelCaps,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    textTransform: 'capitalize',
  },
  metaValueHighlight: {
    fontFamily: FONTS.heading,
    fontSize: 14,
  },
  validBtnWrapper: {
    width: '100%',
    marginTop: SPACING.md,
  },
  validBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginVertical: 0,
  },
  validBtnText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  token: { 
    marginTop: SPACING.lg, 
    fontSize: 10, 
    fontFamily: FONTS.code, 
    textAlign: 'center', 
    letterSpacing: 2 
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: SIZES.radius,
  },
  verificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    marginTop: SPACING.lg,
    borderWidth: 1,
    gap: 12,
  },
  verifyLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  verifyValue: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
  },
});

