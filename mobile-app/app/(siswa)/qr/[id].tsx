import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import * as Brightness from 'expo-brightness';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../../src/utils/api';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS } from '../../../src/utils/theme';

const { width } = Dimensions.get('window');

export default function QRCodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(0.7)).current;

  // Pulse animation effect for the button
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.7, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, [pulseAnim]);

  // Brightness management effect
  useEffect(() => {
    let original: number | null = null;
    (async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === 'granted') {
          original = await Brightness.getBrightnessAsync();
          await Brightness.setBrightnessAsync(1); // Max brightness for scanning
        }
      } catch (e) {
        // Handle error gracefully if brightness API fails
      }
    })();
    return () => {
      if (original !== null) {
        Brightness.setBrightnessAsync(original).catch(() => {});
      }
    };
  }, []);

  // Fetch ticket details including user relations
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // Fetch detailed ticket, we need siswa and kelas relationships
        const res = await api.get(`/dispensasi/${id}`);
        setTicket(res.data);
      } catch (e) {
        // If single fetch fails, fallback to me
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
  if (!ticket?.qr_token) return <View style={styles.center}><Text style={styles.errorText}>QR Code belum tersedia. Tiket belum disetujui penuh.</Text></View>;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="close" size={20} color={COLORS.textSecondary} />
            <Text style={[styles.backText, { marginLeft: 4 }]}>Tutup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {/* Main Premium Card */}
          <View style={styles.card}>
            
            {/* Active Badge */}
            <View style={styles.activeBadgeWrapper}>
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeBadgeText}>IZIN AKTIF</Text>
              </View>
            </View>

            {/* QR Code Area with Frame */}
            {isExpired ? (
              <View style={[styles.qrContainer, { padding: 40, alignItems: 'center', justifyContent: 'center' }]}>
                <MaterialCommunityIcons name="clock-alert-outline" size={64} color={COLORS.error} />
                <Text style={{ fontFamily: FONTS.headingSemi, color: COLORS.error, marginTop: 10, fontSize: 18 }}>TICKET EXPIRED</Text>
              </View>
            ) : (
              <View style={styles.qrContainer}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />

                <View style={styles.qrBg}>
                  <QRCode
                    value={ticket.qr_token}
                    size={width * 0.55}
                    color={COLORS.bgWhite}
                    backgroundColor={COLORS.textPrimary}
                  />
                </View>
              </View>
            )}

            {/* Ticket Info */}
            <View style={styles.infoSection}>
              <Text style={styles.studentName}>{ticket.siswa?.name || 'Siswa'}</Text>
              <Text style={styles.studentClass}>
                {ticket.kelas?.nama_kelas || 'Kelas'} • {ticket.siswa?.email || 'Siswa'}
              </Text>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={styles.metaLabel}>TUJUAN</Text>
                  <Text style={styles.metaValue}>{ticket.jenis_izin?.replace(/_/g, ' ') || '-'}</Text>
                </View>
                <View style={styles.metaColRight}>
                  <Text style={styles.metaLabel}>BATAS WAKTU</Text>
                  <Text style={styles.metaValueHighlight}>{formatTime(ticket.waktu_selesai)}</Text>
                </View>
              </View>
            </View>
          </View>
      
          {/* Animated Valid Button */}
          <Animated.View style={[styles.validBtnWrapper, { opacity: pulseAnim }]}>
            <View style={styles.validBtn}>
              <Text style={styles.validBtnText}>IZIN VALID / SILAKAN KELUAR GERBANG</Text>
            </View>
          </Animated.View>
          
          <Text style={styles.token}>{ticket.qr_token}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1 },
  header: { 
    paddingHorizontal: SPACING.md, 
    paddingTop: SPACING.statusBar + SPACING.sm,
    paddingBottom: SPACING.lg 
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surfaceContainer,
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  backText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.bgWhite,
    borderRadius: SIZES.radiusXl,
    padding: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.softCard,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.xl,
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
    ...SHADOWS.softCard,
    shadowColor: COLORS.success,
  },
  activeBadgeText: {
    fontFamily: FONTS.labelCaps,
    color: COLORS.primary,
  },

  qrContainer: {
    padding: 12,
    position: 'relative',
    marginBottom: SPACING.xl,
  },
  // Corner Brackets for Scanner frame effect
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 24, height: 24, borderTopWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary, borderTopLeftRadius: 8 },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 24, height: 24, borderTopWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary, borderTopRightRadius: 8 },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 24, height: 24, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: COLORS.primary, borderBottomLeftRadius: 8 },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderBottomWidth: 4, borderRightWidth: 4, borderColor: COLORS.primary, borderBottomRightRadius: 8 },
  
  qrBg: {
    backgroundColor: COLORS.textPrimary, // Inverted colors
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
    backgroundColor: COLORS.outlineVariant,
    width: '100%',
    marginVertical: SPACING.lg,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    opacity: 0.5,
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
    paddingHorizontal: SPACING.lg,
  },
  validBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    ...SHADOWS.softCard,
  },
  validBtnText: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.onPrimary,
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
});
