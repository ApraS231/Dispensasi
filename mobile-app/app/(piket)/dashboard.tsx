import { HapticFeedback } from '../../src/utils/haptics';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import { useApproveTicket, useRejectTicket } from '../../src/hooks/useDispensasiQueries';
import { useTogglePiketStatus, usePiketQueue } from '../../src/hooks/usePiketQueries';
import DailyLogCard from '../../src/components/DailyLogCard';
import SkeuCard from '../../src/components/SkeuCard';
import TicketCard from '../../src/components/TicketCard';
import MechanicalToggle from '../../src/components/MechanicalToggle';
import TopAppBar from '../../src/components/TopAppBar';
import GlassFAB from '../../src/components/GlassFAB';
import AvatarInitials from '../../src/components/AvatarInitials';
import BouncyButton from '../../src/components/BouncyButton';
import RejectModal from '../../src/components/RejectModal';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import AnimatedCounter from '../../src/components/AnimatedCounter';
import RefreshableScrollView from '../../src/components/RefreshableScrollView';
import LogoutButton from '../../src/components/LogoutButton';
import { FONTS, SIZES, SPACING, GLASS } from '../../src/utils/theme';
import { createCommonStyles } from '../../src/utils/commonStyles';
import { useTheme } from '../../src/hooks/useTheme';
import { BlurView } from 'expo-blur';
import { useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PiketDashboard() {
  const { user, logout } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const scrollY = useSharedValue(0);
  const { colors, isDark, shadows } = useTheme();
  const commonStyles = createCommonStyles(colors);

  const approveMutation = useApproveTicket();
  const rejectMutation = useRejectTicket();
  const toggleStatusMutation = useTogglePiketStatus();

  const { data: queueData, refetch: refetchQueue } = usePiketQueue(isReady);
  const pendingTickets = queueData?.data || [];

  const { data: statusData, refetch: refetchStatus } = useQuery({
    queryKey: ['piket-status'],
    queryFn: async () => {
      const { data } = await api.get('/piket/status');
      return data;
    }
  });

  const { data: logsData, refetch: refetchLogs } = useQuery({
    queryKey: ['piket-daily-log'],
    queryFn: async () => {
      const { data } = await api.get('/piket/daily-log');
      return data;
    }
  });

  useEffect(() => {
    if (statusData) {
      setIsReady(statusData.is_ready);
    }
  }, [statusData]);

  const dailyLogs = logsData?.data || [];
  const dailyLogStats = {
    total: logsData?.total || 0,
    scanned: logsData?.scanned_count || 0
  };

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    expoRouter.replace('/login');
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchQueue(), refetchStatus(), refetchLogs()]);
    setRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    try {
      HapticFeedback.success();
      await approveMutation.mutateAsync(id);
      Alert.alert('Berhasil', 'Izin berhasil disetujui');
    } catch (e: any) { 
      if (e.response?.status === 409) {
        Alert.alert('Terlambat', 'Tiket ini sudah diproses oleh Guru Piket lain.');
        refetchQueue();
      } else {
        Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan'); 
      }
    }
  };

  const handleReject = async (id: string) => {
    setRejectingId(id);
  };

  const confirmReject = async (catatan: string) => {
    if (!rejectingId) return;
    const id = rejectingId;
    setRejectingId(null);
    try {
      HapticFeedback.success();
      await rejectMutation.mutateAsync({ id, catatan });
      Alert.alert('Berhasil', 'Izin berhasil ditolak');
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={commonStyles.container}
    >
      <SafeAreaView style={commonStyles.safeArea} edges={['bottom', 'left', 'right']}>
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'P'} 
          showNotification={true} 
          scrollY={scrollY}
        />

        <RefreshableScrollView 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          scrollY={scrollY}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View style={commonStyles.mainContent}>
            <View style={{ height: 88 + SPACING.statusBar }} />
            
            <AnimatedEntrance delay={300} direction="down">
              <View style={commonStyles.headerContainer}>
                {/* Header Background Blobs */}
                <View style={styles.headerBlobContainer} pointerEvents="none">
                  <View style={[styles.headerBlob, { backgroundColor: colors.primary, top: -20, left: -20 }]} />
                  <View style={[styles.headerBlob, { backgroundColor: colors.secondary, bottom: -40, right: -20 }]} />
                </View>

                <SkeuCard style={styles.headerCard}>
                  <View style={styles.headerTop}>
                    <View>
                      <Text style={[styles.greeting, { color: colors.textSecondary }]}>Status Piket Hari Ini</Text>
                      <Text style={[styles.dateText, { color: colors.textPrimary }]}>{todayDate}</Text>
                    </View>
                    <LogoutButton onPress={handleLogout} />
                  </View>

                  <View style={[styles.toggleContainer, shadows.inset, { backgroundColor: colors.glassSurface, borderColor: colors.glassHighlight }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.toggleLabel, { color: colors.textMuted }]}>Kehadiran</Text>
                      <Text style={[styles.toggleStatus, { color: isReady ? colors.primary : colors.textMuted }]}>
                        {isReady ? 'SEDANG BERTUGAS' : 'ISTIRAHAT'}
                      </Text>
                    </View>
                    <MechanicalToggle
                      value={isReady}
                      onValueChange={async (val) => {
                        HapticFeedback.light();
                        setIsReady(val);
                        try {
                          await toggleStatusMutation.mutateAsync(val);
                        } catch (e) {
                          setIsReady(!val);
                        }
                      }}
                    />
                  </View>

                  {isReady && (
                    <AnimatedEntrance delay={300}>
                      <View style={styles.scanActionRow}>
                        <TouchableOpacity onPress={() => expoRouter.push('/scan-qr')} activeOpacity={0.8}>
                          <View style={[styles.scanBtn, { backgroundColor: colors.primary, borderColor: colors.glassHighlight }]}>
                            <MaterialCommunityIcons name="qrcode-scan" size={24} color={colors.onPrimary} />
                            <Text style={[styles.scanBtnText, { color: colors.onPrimary }]}>Pindai QR Siswa Keluar</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </AnimatedEntrance>
                  )}
                </SkeuCard>
              </View>
            </AnimatedEntrance>

            <View style={commonStyles.contentContainer}>
              <AnimatedEntrance delay={500} direction="up">
                <View style={commonStyles.sectionHeader}>
                  <Text style={commonStyles.sectionTitle}>Antrean Persetujuan</Text>
                  <View style={[styles.badgeCount, { backgroundColor: colors.warning }]}>
                    <Text style={[styles.badgeCountText, { color: colors.textPrimary }]}>{pendingTickets.length}</Text>
                  </View>
                </View>
              </AnimatedEntrance>
              
              {useMemo(() => (
                pendingTickets.length > 0 ? pendingTickets.map((item: any, index: number) => (
                  <AnimatedEntrance key={item.id} delay={index < 5 ? 600 + (index * 100) : 0} direction="up" offset={20}>
                    <SkeuCard isGlass style={styles.ticketWrapper}>
                      {/* Clickable details section */}
                      <TouchableOpacity 
                        activeOpacity={0.8}
                        onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                      >
                        {/* Header Row: Student Info */}
                        <View style={styles.ticketHeaderRow}>
                          <AvatarInitials name={item.siswa?.name || 'S'} size={40} fontSize={16} />
                          <View style={styles.ticketMeta}>
                            <Text style={[styles.ticketName, { color: colors.textPrimary }]}>{item.siswa?.name || 'Siswa'}</Text>
                            <Text style={[styles.ticketClass, { color: colors.textSecondary }]}>{item.kelas?.nama_kelas || item.siswa?.kelas?.nama_kelas || 'Kelas'}</Text>
                          </View>
                          <View style={[styles.ledDot, { backgroundColor: colors.warning, shadowColor: colors.warning }]} />
                        </View>
                        
                        {/* Divider */}
                        <View style={[styles.divider, { backgroundColor: colors.glassHighlight }]} />

                        {/* Permit Info */}
                        <View style={[styles.permitHeaderRow, { marginBottom: SPACING.xs }]}>
                          <View style={styles.headerItem}>
                            <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
                            <Text style={[styles.headerText, { fontFamily: FONTS.bodyMedium, color: colors.textSecondary }]}>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                            </Text>
                          </View>
                          <View style={styles.headerItem}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                            <Text style={[styles.headerText, { fontFamily: FONTS.bodyMedium, color: colors.textSecondary }]}>
                              {item.created_at ? new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </Text>
                          </View>
                        </View>

                        <Text style={[styles.typeText, { fontFamily: FONTS.heading, color: colors.primary }]}>
                          {item.jenis_izin?.replace(/_/g, ' ')}
                        </Text>
                        
                        <View style={[
                          styles.reasonContainer, 
                          { 
                            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)',
                            borderRadius: SIZES.radiusSm || 8,
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                          }
                        ]}>
                          <MaterialCommunityIcons name="format-quote-open" size={10} color={isDark ? '#7BBDE8' : colors.primaryMuted} style={{ marginRight: 4 }} />
                          <Text style={[styles.reasonText, { fontFamily: FONTS.body, color: colors.textSecondary }]} numberOfLines={2}>
                            {item.alasan}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Action buttons */}
                      <View style={styles.actionRow}>
                        <TouchableOpacity 
                          style={[styles.miniActionBtn, styles.miniReject, { backgroundColor: colors.errorBg }]} 
                          onPress={() => handleReject(item.id)}
                        >
                          <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                          <Text style={[styles.miniBtnTextReject, { color: colors.error }]}>Tolak</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.miniActionBtn, { backgroundColor: colors.primary }, shadows.raised]} 
                          onPress={() => handleApprove(item.id)}
                        >
                          <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                          <Text style={styles.miniBtnTextApprove}>Setujui & Terbitkan</Text>
                        </TouchableOpacity>
                      </View>
                    </SkeuCard>
                  </AnimatedEntrance>
                )) : (
                  <Text style={commonStyles.emptyText}>Tidak ada antrean persetujuan.</Text>
                )
              ), [pendingTickets, colors, shadows, isDark])}
            </View>

            <View style={[commonStyles.contentContainer, { marginTop: SPACING.xl }]}>
              <AnimatedEntrance delay={800} direction="up">
                <SkeuCard style={{ padding: SPACING.md }}>
                  <View style={[commonStyles.sectionHeader, { marginBottom: SPACING.lg }]}>
                    <View style={styles.sectionTitleRow}>
                      <MaterialCommunityIcons name="history" size={20} color={colors.primary} />
                      <Text style={commonStyles.sectionTitle}>Log Hari Ini</Text>
                    </View>
                    <TouchableOpacity onPress={() => expoRouter.push('/(piket)/history')}>
                      <Text style={[styles.seeAllText, { color: colors.primary }]}>Lihat Semua</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={[styles.statItem, shadows.inset, { backgroundColor: colors.glassSurface, borderColor: colors.glassHighlight }]}>
                      <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL</Text>
                      <AnimatedCounter value={dailyLogStats.total} style={[styles.statValue, { color: colors.textPrimary }]} delay={1200} />
                    </View>
                    <View style={[styles.statItem, shadows.inset, { backgroundColor: colors.glassSurface, borderColor: colors.glassHighlight }]}>
                      <Text style={[styles.statLabel, { color: colors.success }]}>EXIT</Text>
                      <AnimatedCounter value={dailyLogStats.scanned} style={[styles.statValue, { color: colors.success }]} delay={1400} />
                    </View>
                    <View style={[styles.statItem, shadows.inset, { backgroundColor: colors.glassSurface, borderColor: colors.glassHighlight }]}>
                      <Text style={[styles.statLabel, { color: colors.warning }]}>WAIT</Text>
                      <AnimatedCounter value={dailyLogStats.total - dailyLogStats.scanned} style={[styles.statValue, { color: colors.warning }]} delay={1600} />
                    </View>
                  </View>

                  <View style={styles.logList}>
                    {useMemo(() => (
                      dailyLogs.length > 0 ? dailyLogs.slice(0, 8).map((item: any, index: number) => (
                        <AnimatedEntrance key={item.id} delay={index < 5 ? 1000 + (index * 50) : 0} direction="up" offset={10}>
                          <DailyLogCard item={item} />
                        </AnimatedEntrance>
                      )) : (
                        <View style={styles.emptyLogContainer}>
                          <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={colors.textMuted} />
                          <Text style={[styles.emptyLogText, { color: colors.textMuted }]}>Belum ada aktivitas hari ini</Text>
                        </View>
                      )
                    ), [dailyLogs, colors])}
                  </View>
                </SkeuCard>
              </AnimatedEntrance>
            </View>

          </View>
        </RefreshableScrollView>

        <GlassFAB onPress={() => expoRouter.push('/scan-qr')} icon="qrcode-scan" style={{ bottom: 100 }} />
      </SafeAreaView>

      <RejectModal
        visible={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onSubmit={confirmReject}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerBlobContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: SIZES.radiusCard,
    opacity: 0.1,
  },
  headerBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  headerCard: {
    padding: SPACING.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
  },
  dateText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
  },
  toggleLabel: {
    fontFamily: FONTS.labelCaps,
    fontSize: 11,
  },
  toggleStatus: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    marginTop: 2,
  },
  scanActionRow: {
    marginTop: SPACING.lg,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radiusButton,
    gap: SPACING.sm,
    borderWidth: 1,
  },
  scanBtnText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
  },
  badgeCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: SPACING.sm,
  },
  badgeCountText: {
    fontFamily: FONTS.heading,
    fontSize: 12,
  },
  ticketWrapper: {
    marginBottom: SPACING.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: SPACING.md,
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    position: 'relative',
  },
  ticketMeta: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  ticketName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 15,
  },
  ticketClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  ledDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
    opacity: 0.15,
  },
  permitHeaderRow: {
    flexDirection: 'row',
    gap: 13,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: {
    fontSize: 10,
  },
  typeText: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    marginTop: 2,
  },
  reasonText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  miniActionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  miniReject: {
    borderWidth: 1,
    borderColor: 'rgba(239, 71, 111, 0.1)',
  },
  miniBtnTextReject: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
  },
  miniBtnTextApprove: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: '#FFF',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seeAllText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 24,
  },
  statLabel: {
    fontFamily: FONTS.labelCaps,
    fontSize: 9,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  logList: {
    gap: 2,
  },
  emptyLogContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    gap: 8,
  },
  emptyLogText: {
    fontFamily: FONTS.body,
    fontSize: 14,
  },
});

