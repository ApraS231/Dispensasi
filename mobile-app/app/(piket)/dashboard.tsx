import { HapticFeedback } from '../../src/utils/haptics';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView, ScrollView } from 'react-native';
import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import { useApproveTicket, useRejectTicket } from '../../src/hooks/useDispensasiQueries';
import { useTogglePiketStatus } from '../../src/hooks/usePiketQueries';
import DailyLogCard from '../../src/components/DailyLogCard';
import SoftCard from '../../src/components/SoftCard';
import TicketCard from '../../src/components/TicketCard';
import MechanicalToggle from '../../src/components/MechanicalToggle';
import TopAppBar from '../../src/components/TopAppBar';
import GlassFAB from '../../src/components/GlassFAB';
import AvatarInitials from '../../src/components/AvatarInitials';
import BouncyButton from '../../src/components/BouncyButton';
import RejectModal from '../../src/components/RejectModal';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';

export default function PiketDashboard() {
  const { user, logout } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const approveMutation = useApproveTicket();
  const rejectMutation = useRejectTicket();
  const toggleStatusMutation = useTogglePiketStatus();

  const { data: pendingTickets = [], refetch: refetchPending } = useQuery({
    queryKey: ['dispensasi-pending'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/pending');
      return data;
    }
  });

  const { data: statusData } = useQuery({
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

  const handleApprove = async (id: string) => {
    try {
      HapticFeedback.success();
      await approveMutation.mutateAsync(id);
      Alert.alert('Berhasil', 'Izin berhasil disetujui');
    } catch (e: any) { Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan'); }
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'P'} 
          showNotification={true} 
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={styles.mainContent}>
            {/* Header Card Status Piket */}
            <View style={styles.headerContainer}>
              <SoftCard style={styles.headerCard}>
                <View style={styles.headerTop}>
                  <View>
                    <Text style={styles.greeting}>Status Piket Hari Ini</Text>
                    <Text style={styles.dateText}>{todayDate}</Text>
                  </View>
                  <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Keluar</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.toggleContainer}>
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

                {/* Scan Button */}
                {isReady && (
                  <View style={styles.scanActionRow}>
                    <TouchableOpacity style={styles.scanBtn} onPress={() => expoRouter.push('/scan-qr')}>
                      <MaterialCommunityIcons name="qrcode-scan" size={24} color={COLORS.onPrimary} />
                      <Text style={styles.scanBtnText}>Pindai QR Siswa Keluar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </SoftCard>
            </View>

            {/* Antrean Persetujuan Area */}
            <View style={styles.contentContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Antrean Persetujuan</Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{pendingTickets.length}</Text>
                </View>
              </View>
              
              {pendingTickets.length > 0 ? pendingTickets.map((item) => (
                <View key={item.id} style={styles.ticketWrapper}>
                  <View style={styles.ticketHeaderRow}>
                    <AvatarInitials name={item.siswa?.name || 'Siswa'} size={40} fontSize={16} />
                    <View style={styles.ticketMeta}>
                      <Text style={styles.ticketName}>{item.siswa?.name || 'Siswa'}</Text>
                      <Text style={styles.ticketClass}>{item.kelas?.nama_kelas || 'Kelas'}</Text>
                    </View>
                  </View>
                  
                  <TicketCard 
                    item={item} 
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  />
                  
                  <View style={styles.actionRow}>
                    <BouncyButton 
                      title="Tolak" 
                      variant="danger" 
                      onPress={() => handleReject(item.id)} 
                      style={styles.actionBtn}
                    />
                    <BouncyButton 
                      title="Setujui & Terbitkan QR"
                      onPress={() => handleApprove(item.id)} 
                      style={styles.actionBtn}
                    />
                  </View>
                </View>
              )) : (
                <Text style={styles.emptyText}>Tidak ada antrean persetujuan.</Text>
              )}
            </View>

            {/* Log Hari Ini Area inside a Card Container */}
            <View style={[styles.contentContainer, { marginTop: SPACING.xl }]}>
              <SoftCard>
                <View style={[styles.sectionHeader, { marginBottom: SPACING.md }]}>
                  <Text style={styles.sectionTitle}>Log Hari Ini</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: SPACING.lg }}>
                  <View style={[styles.statCard, { backgroundColor: COLORS.primaryContainer }]}>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{dailyLogStats.total}</Text>
                    <Text style={styles.statLabel}>Total Izin</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: COLORS.secondaryContainer }]}>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{dailyLogStats.scanned}</Text>
                    <Text style={styles.statLabel}>Telah Keluar</Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: COLORS.tertiaryContainer }]}>
                    <Text style={[styles.statValue, { color: COLORS.textPrimary }]}>{dailyLogStats.total - dailyLogStats.scanned}</Text>
                    <Text style={styles.statLabel}>Menunggu</Text>
                  </View>
                </View>

                {dailyLogs.length > 0 ? dailyLogs.map((item) => (
                  <DailyLogCard key={item.id} item={item} />
                )) : (
                  <Text style={styles.emptyText}>Belum ada log hari ini.</Text>
                )}
              </SoftCard>
            </View>

          </View>
        </ScrollView>

        <GlassFAB onPress={() => expoRouter.push('/scan-qr')} icon="qrcode-scan" style={{ bottom: 100 }} />
      </SafeAreaView>

      <RejectModal
        visible={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onSubmit={confirmReject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    padding: SPACING.sm,
    alignItems: 'center',
    borderRadius: SIZES.radiusCard,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 24,
  },
  statLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: '#1A1A1A',
    marginTop: 2,
  },
  container: { flex: 1 },
  safeArea: { flex: 1 },
  mainContent: { flex: 1 },
  headerContainer: {
    padding: SPACING.md,
    zIndex: 10,
  },
  headerCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.secondaryContainer, // Teal background
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: SPACING.xl 
  },
  greeting: { fontFamily: FONTS.headingSemi, fontSize: 18, color: COLORS.textPrimary },
  dateText: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.errorBg,
    borderRadius: SIZES.radius,
  },
  logoutText: { fontFamily: FONTS.headingSemi, color: COLORS.error, fontSize: 12 },
  
  toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.surfaceContainerLow,
      padding: SPACING.md,
      borderRadius: SIZES.radiusCard,

      shadowColor: '#1A1A1A',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
  toggleLabel: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.textSecondary },
  toggleStatus: { fontFamily: FONTS.heading, fontSize: 14, marginTop: 2 },

  scanActionRow: {
    marginTop: SPACING.md,
  },
  scanBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.primary,
      paddingVertical: SPACING.md,
      borderRadius: SIZES.radiusButton,
      gap: SPACING.sm,

      shadowColor: '#1A1A1A',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
  scanBtnText: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.inverseOnSurface,
    fontSize: 16,
  },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SPACING.md 
  },
  sectionTitle: { fontFamily: FONTS.headingSemi, fontSize: 18, color: COLORS.textPrimary },
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
    color: COLORS.inverseSurface,
  },
  
  listContent: { paddingBottom: 100 },
  ticketWrapper: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: SIZES.radiusXl,
    padding: SPACING.md,

    ...SHADOWS.softCard,
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ticketMeta: {
    marginLeft: SPACING.sm,
  },
  ticketName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  ticketClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
