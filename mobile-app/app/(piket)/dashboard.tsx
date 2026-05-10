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
import BouncyButton from '../../src/components/BouncyButton';
import RejectModal from '../../src/components/RejectModal';
import LiquidBackground from '../../src/components/LiquidBackground';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import AnimatedCounter from '../../src/components/AnimatedCounter';
import RefreshableScrollView from '../../src/components/RefreshableScrollView';
import LogoutButton from '../../src/components/LogoutButton';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';
import { BlurView } from 'expo-blur';
import { useSharedValue } from 'react-native-reanimated';

export default function PiketDashboard() {
  const { user, logout } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const scrollY = useSharedValue(0);

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
    <View style={commonStyles.container}>
      <LiquidBackground />
      
      {/* Header - Fixed container to ensure responsiveness */}
      <View style={{ height: SPACING.statusBar + 88, zIndex: 100 }}>
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'P'} 
          showNotification={true} 
          scrollY={scrollY}
        />
      </View>

      <View style={commonStyles.safeArea}>
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
                  <View style={[styles.headerBlob, { backgroundColor: COLORS.primary, top: -20, left: -20 }]} />
                  <View style={[styles.headerBlob, { backgroundColor: COLORS.secondary, bottom: -40, right: -20 }]} />
                </View>

                <SkeuCard style={styles.headerCard}>
                  <View style={styles.headerTop}>
                    <View>
                      <Text style={styles.greeting}>Status Piket Hari Ini</Text>
                      <Text style={styles.dateText}>{todayDate}</Text>
                    </View>
                    <LogoutButton onPress={handleLogout} />
                  </View>

                  <View style={[styles.toggleContainer, SHADOWS.inset]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleLabel}>Kehadiran</Text>
                      <Text style={[styles.toggleStatus, { color: isReady ? COLORS.primary : COLORS.textMuted }]}>
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
                          <View style={styles.scanBtn}>
                            <MaterialCommunityIcons name="qrcode-scan" size={24} color={COLORS.onPrimary} />
                            <Text style={styles.scanBtnText}>Pindai QR Siswa Keluar</Text>
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
                  <View style={styles.badgeCount}>
                    <Text style={styles.badgeCountText}>{pendingTickets.length}</Text>
                  </View>
                </View>
              </AnimatedEntrance>
              
              {useMemo(() => (
                pendingTickets.length > 0 ? pendingTickets.map((item: any, index: number) => (
                  <AnimatedEntrance key={item.id} delay={index < 5 ? 600 + (index * 100) : 0} direction="up" offset={20}>
                    <View style={styles.ticketWrapper}>
                      <TicketCard 
                        item={item} 
                        onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                        showName={true}
                      />
                      
                      <View style={styles.actionRow}>
                        <TouchableOpacity 
                          style={[styles.miniActionBtn, styles.miniReject]} 
                          onPress={() => handleReject(item.id)}
                        >
                          <MaterialCommunityIcons name="close" size={20} color={COLORS.error} />
                          <Text style={styles.miniBtnTextReject}>Tolak</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.miniActionBtn, styles.miniApprove]} 
                          onPress={() => handleApprove(item.id)}
                        >
                          <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                          <Text style={styles.miniBtnTextApprove}>Setujui & Terbitkan</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </AnimatedEntrance>
                )) : (
                  <Text style={commonStyles.emptyText}>Tidak ada antrean persetujuan.</Text>
                )
              ), [pendingTickets])}
            </View>

            <View style={[commonStyles.contentContainer, { marginTop: SPACING.xl }]}>
              <AnimatedEntrance delay={800} direction="up">
                <SkeuCard style={{ padding: SPACING.md }}>
                  <View style={[commonStyles.sectionHeader, { marginBottom: SPACING.lg }]}>
                    <View style={styles.sectionTitleRow}>
                      <MaterialCommunityIcons name="history" size={20} color={COLORS.primary} />
                      <Text style={commonStyles.sectionTitle}>Log Hari Ini</Text>
                    </View>
                    <TouchableOpacity onPress={() => expoRouter.push('/(piket)/history')}>
                      <Text style={styles.seeAllText}>Lihat Semua</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={[styles.statItem, SHADOWS.inset]}>
                      <Text style={styles.statLabel}>TOTAL</Text>
                      <AnimatedCounter value={dailyLogStats.total} style={styles.statValue} delay={1200} />
                    </View>
                    <View style={[styles.statItem, SHADOWS.inset]}>
                      <Text style={[styles.statLabel, { color: COLORS.success }]}>EXIT</Text>
                      <AnimatedCounter value={dailyLogStats.scanned} style={[styles.statValue, { color: COLORS.success }]} delay={1400} />
                    </View>
                    <View style={[styles.statItem, SHADOWS.inset]}>
                      <Text style={[styles.statLabel, { color: COLORS.warning }]}>WAIT</Text>
                      <AnimatedCounter value={dailyLogStats.total - dailyLogStats.scanned} style={[styles.statValue, { color: COLORS.warning }]} delay={1600} />
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
                          <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={COLORS.textMuted} />
                          <Text style={styles.emptyLogText}>Belum ada aktivitas hari ini</Text>
                        </View>
                      )
                    ), [dailyLogs])}
                  </View>
                </SkeuCard>
              </AnimatedEntrance>
            </View>

          </View>
        </RefreshableScrollView>

        <GlassFAB onPress={() => expoRouter.push('/scan-qr')} icon="qrcode-scan" style={{ bottom: 100 }} />
      </View>

      <RejectModal
        visible={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onSubmit={confirmReject}
      />
    </View>
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
    color: COLORS.textSecondary,
  },
  dateText: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glassSurface,
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  toggleLabel: {
    fontFamily: FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: SIZES.radiusButton,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  scanBtnText: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.onPrimary,
    fontSize: 16,
  },
  badgeCount: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: SPACING.sm,
  },
  badgeCountText: {
    fontFamily: FONTS.heading,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  ticketWrapper: {
    marginBottom: SPACING.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: -8,
    paddingHorizontal: 4,
    marginBottom: 8,
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
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 71, 111, 0.1)',
  },
  miniApprove: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.raised,
  },
  miniBtnTextReject: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: COLORS.error,
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
    color: COLORS.primary,
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
    backgroundColor: COLORS.glassSurface,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontFamily: FONTS.labelCaps,
    fontSize: 9,
    color: COLORS.textMuted,
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
    color: COLORS.textMuted,
  },
});

