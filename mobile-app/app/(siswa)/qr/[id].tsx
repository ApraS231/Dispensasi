import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../../src/utils/api';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS } from '../../../src/utils/theme';
import { commonStyles } from '../../../src/utils/commonStyles';
import SkeuCard from '../../../src/components/SkeuCard';
import LiquidBackground from '../../../src/components/LiquidBackground';

const { width } = Dimensions.get('window');

export default function QRCodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

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

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!ticket?.qr_token) return <View style={styles.center}><Text style={styles.errorText}>QR Code belum tersedia.</Text></View>;

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      <SafeAreaView style={commonStyles.safeArea}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <SkeuCard style={styles.backSkeu} isGlass>
              <MaterialCommunityIcons name="close" size={20} color={COLORS.textSecondary} />
              <Text style={styles.backText}>Tutup</Text>
            </SkeuCard>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <SkeuCard style={styles.card} isGlass accentColor={COLORS.success}>
            
            <View style={styles.activeBadgeWrapper}>
              {ticket.status === 'completed_exit' ? (
                <View style={[styles.activeBadge, { backgroundColor: COLORS.success, borderColor: COLORS.bgWhite }]}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={COLORS.bgWhite} style={{ marginRight: 6 }} />
                  <Text style={[styles.activeBadgeText, { color: COLORS.bgWhite }]}>SUDAH KELUAR</Text>
                </View>
              ) : (
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>IZIN AKTIF</Text>
                </View>
              )}
            </View>

            {isExpired && ticket.status !== 'completed_exit' ? (
              <View style={styles.expiredContainer}>
                <MaterialCommunityIcons name="clock-alert-outline" size={64} color={COLORS.error} />
                <Text style={styles.expiredText}>TICKET EXPIRED</Text>
              </View>
            ) : (
              <View style={styles.qrContainer}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />

                <View style={[styles.qrBg, ticket.status === 'completed_exit' && { opacity: 0.6 }]}>
                  <QRCode
                    value={ticket.qr_token}
                    size={width * 0.55}
                    color={COLORS.bgWhite}
                    backgroundColor={COLORS.textPrimary}
                  />
                  {ticket.status === 'completed_exit' && (
                    <View style={styles.scannedOverlay}>
                      <MaterialCommunityIcons name="check-circle" size={80} color={COLORS.success} />
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.infoSection}>
              <Text style={styles.studentName}>{ticket.siswa?.name || 'Siswa'}</Text>
              <Text style={styles.studentClass}>
                {ticket.kelas?.nama_kelas || 'Kelas'} • {ticket.siswa?.name?.split(' ')[0].toLowerCase()}@school.id
              </Text>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>TUJUAN</Text>
                  <Text style={styles.metaValue}>{ticket.jenis_izin?.replace(/_/g, ' ') || '-'}</Text>
                </View>
                <View style={styles.metaColRight}>
                  <Text style={styles.metaLabel}>
                    {ticket.status === 'completed_exit' ? 'WAKTU KELUAR' : 'BATAS WAKTU'}
                  </Text>
                  <Text style={[styles.metaValueHighlight, ticket.status === 'completed_exit' && { color: COLORS.success }]}>
                    {formatTime(ticket.status === 'completed_exit' ? ticket.scanned_at : ticket.waktu_selesai)}
                  </Text>
                </View>
              </View>

              {ticket.status === 'completed_exit' && (
                <View style={styles.verificationCard}>
                  <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.success} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.verifyLabel}>Diverifikasi Oleh Guru Piket</Text>
                    <Text style={styles.verifyValue}>{ticket.guru_piket?.name || 'Petugas Piket'}</Text>
                  </View>
                </View>
              )}
            </View>
          </SkeuCard>
      
          <Animated.View style={[styles.validBtnWrapper, { opacity: pulseAnim }]}>
            <SkeuCard 
              style={styles.validBtn} 
              accentColor={ticket.status === 'completed_exit' ? COLORS.success : COLORS.primary}
            >
              <Text style={[styles.validBtnText, ticket.status === 'completed_exit' && { color: COLORS.success }]}>
                {ticket.status === 'completed_exit' 
                  ? 'TELAH TERVERIFIKASI SISTEM' 
                  : 'IZIN VALID / SILAKAN KELUAR'}
              </Text>
            </SkeuCard>
          </Animated.View>
          
          <Text style={styles.token}>{ticket.qr_token}</Text>
        </View>
      </SafeAreaView>
    </View>
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
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.error, fontSize: 16, fontFamily: FONTS.headingSemi, textAlign: 'center' },
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
    backgroundColor: COLORS.successBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: SIZES.radiusBadge,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  activeDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  activeBadgeText: {
    fontFamily: FONTS.labelCaps,
    color: COLORS.primary,
  },
  expiredContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiredText: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.error,
    marginTop: 10,
    fontSize: 18,
  },
  qrContainer: {
    padding: 12,
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTopWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary, borderTopLeftRadius: 8 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTopWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary, borderTopRightRadius: 8 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary, borderBottomLeftRadius: 8 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottomWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary, borderBottomRightRadius: 8 },
  qrBg: {
    backgroundColor: COLORS.textPrimary,
    padding: SPACING.sm,
    borderRadius: SIZES.radius,
  },
  infoSection: {
    width: '100%',
  },
  studentName: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  studentClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.glassHighlight,
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
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  metaValueHighlight: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    color: COLORS.error,
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
    color: COLORS.primary,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  token: { 
    marginTop: SPACING.lg, 
    fontSize: 10, 
    fontFamily: FONTS.code, 
    color: COLORS.textMuted, 
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
    backgroundColor: 'rgba(7, 190, 184, 0.05)',
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(7, 190, 184, 0.2)',
    gap: 12,
  },
  verifyLabel: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  verifyValue: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.success,
  },
});

