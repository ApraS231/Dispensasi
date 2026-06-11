import { HapticFeedback } from '../../src/utils/haptics';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router as expoRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import { useApproveTicket, useRejectTicket } from '../../src/hooks/useDispensasiQueries';
import SkeuCard from '../../src/components/SkeuCard';
import TicketCard from '../../src/components/TicketCard';
import BouncyButton from '../../src/components/BouncyButton';
import RejectModal from '../../src/components/RejectModal';
import TopAppBar from '../../src/components/TopAppBar';
import AvatarInitials from '../../src/components/AvatarInitials';
import DonutChart from '../../src/components/DonutChart';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import LogoutButton from '../../src/components/LogoutButton';
import { FONTS, SIZES, SPACING, GLASS } from '../../src/utils/theme';
import { createCommonStyles } from '../../src/utils/commonStyles';
import { useTheme } from '../../src/hooks/useTheme';
import { BlurView } from 'expo-blur';
import { useSharedValue } from 'react-native-reanimated';

export default function WaliDashboard() {
  const { user, logout } = useAuthStore();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const scrollY = useSharedValue(0);
  const { colors, isDark, shadows } = useTheme();
  const commonStyles = createCommonStyles(colors);

  const approveMutation = useApproveTicket();
  const rejectMutation = useRejectTicket();

  const { data: pendingTicketsRaw, refetch: refetchPending } = useQuery({
    queryKey: ['dispensasi-pending'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/pending');
      const today = new Date().toDateString();
      const rawData = Array.isArray(data) ? data : data?.data || [];
      return rawData.filter((t: any) => new Date(t.created_at).toDateString() === today);
    }
  });
  const pendingTickets = pendingTicketsRaw || [];

  // Fetch real student data for donut chart
  const { data: kelasData, refetch: refetchKelas } = useQuery({
    queryKey: ['wali-siswa'],
    queryFn: async () => {
      const { data } = await api.get('/wali/siswa');
      return data;
    }
  });

  // Fetch all today's dispensasi (approved + pending) for accurate count
  const { data: classRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['wali-class-requests'],
    queryFn: async () => {
      const { data } = await api.get('/wali/class-requests');
      return data;
    }
  });

  const { data: allTickets = [], refetch: refetchAll } = useQuery({
    queryKey: ['dispensasi-wali-today'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi');
      const today = new Date().toDateString();
      return data.filter((t: any) => new Date(t.created_at).toDateString() === today);
    }
  });

  const totalStudents = kelasData?.siswa?.length || 0;
  const absentStudents = allTickets.length;
  const presentStudents = Math.max(0, totalStudents - absentStudents);

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

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPending(), refetchKelas(), refetchAll(), refetchRequests()]);
    setRefreshing(false);
  };

  const MemoizedHeader = useMemo(() => (
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
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>Kehadiran Kelas Anda</Text>
                <Text style={[styles.dateText, { color: colors.textPrimary }]}>{todayDate}</Text>
              </View>
              <LogoutButton onPress={handleLogout} />
            </View>
 
            <View style={styles.chartContainer}>
              <View style={styles.chartColLeft}>
                <DonutChart 
                  total={totalStudents} 
                  present={presentStudents} 
                  absent={absentStudents} 
                  size={120} 
                  strokeWidth={14} 
                />
              </View>
              
              <View style={styles.chartColRight}>
                <View style={[styles.legendItem, shadows.inset, { backgroundColor: colors.glassSurface, borderColor: colors.glassHighlight }]}>
                  <View style={[styles.legendColor, { backgroundColor: colors.primary }]} />
                  <View>
                    <Text style={[styles.legendTitle, { color: colors.textMuted }]}>Hadir</Text>
                    <Text style={[styles.legendValue, { color: colors.textPrimary }]}>{presentStudents} Siswa</Text>
                  </View>
                </View>
                
                <View style={[styles.legendItem, shadows.inset, { backgroundColor: colors.glassSurface, borderColor: colors.glassHighlight }]}>
                  <View style={[styles.legendColor, { backgroundColor: colors.textMuted }]} />
                  <View>
                    <Text style={[styles.legendTitle, { color: colors.textMuted }]}>Izin/Sakit</Text>
                    <Text style={[styles.legendValue, { color: colors.textPrimary }]}>{absentStudents} Siswa</Text>
                  </View>
                </View>
              </View>
            </View>
          </SkeuCard>
        </View>
      </AnimatedEntrance>
      
      {classRequests.length > 0 && (
        <AnimatedEntrance delay={450} direction="up">
          <TouchableOpacity 
            style={[styles.notificationBanner, { backgroundColor: colors.primaryContainer, borderColor: colors.glassHighlight }]}
            onPress={() => expoRouter.push('/(wali)/kelola-anak')}
          >
            <View style={[styles.notificationIcon, shadows.elevation2, { backgroundColor: colors.bgPrimary }]}>
              <MaterialCommunityIcons name="account-plus" size={24} color={colors.primary} />
            </View>
            <View style={styles.notificationTextContent}>
              <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>Permintaan Bergabung</Text>
              <Text style={[styles.notificationSub, { color: colors.textSecondary }]}>{classRequests.length} siswa menunggu persetujuan Anda</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </AnimatedEntrance>
      )}

      <View style={commonStyles.contentContainer}>
        <AnimatedEntrance delay={600} direction="up">
          <View style={commonStyles.sectionHeader}>
            <Text style={commonStyles.sectionTitle}>Menunggu Persetujuan</Text>
          </View>
        </AnimatedEntrance>
      </View>
    </View>
  ), [totalStudents, presentStudents, absentStudents, classRequests.length, colors, shadows, isDark]);

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={commonStyles.container}
    >
      <SafeAreaView style={commonStyles.safeArea} edges={['bottom', 'left', 'right']}>
        
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'W'} 
          title={`Kelas ${kelasData?.kelas || '-'}`}
          showNotification={true} 
          scrollY={scrollY}
        />

        <RefreshableFlatList
          data={pendingTickets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={commonStyles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollY={scrollY}
          ListHeaderComponent={MemoizedHeader}
          renderItem={({ item, index }) => (
            <View style={{ paddingHorizontal: SPACING.md }}>
              <AnimatedEntrance delay={index < 5 ? 800 + (index * 100) : 0} direction="up" offset={20}>
                <SkeuCard isGlass style={styles.ticketWrapper}>
                  {/* Clickable details section */}
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  >
                    <View style={styles.ticketHeaderRow}>
                      <AvatarInitials name={item.siswa?.name || 'Siswa'} size={40} fontSize={16} />
                      <View style={styles.ticketMeta}>
                        <Text style={[styles.ticketName, { color: colors.textPrimary }]}>{item.siswa?.name || 'Siswa'}</Text>
                        <Text style={[styles.ticketClass, { color: colors.textSecondary }]}>{item.kelas?.nama_kelas || 'Kelas'}</Text>
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
                    <BouncyButton 
                      title="Tolak" 
                      variant="danger" 
                      onPress={() => handleReject(item.id)} 
                      style={styles.actionBtn}
                    />
                    <BouncyButton 
                      title="Setujui" 
                      onPress={() => handleApprove(item.id)} 
                      style={styles.actionBtn}
                    />
                  </View>
                </SkeuCard>
              </AnimatedEntrance>
            </View>
          )}
          ListEmptyComponent={<Text style={commonStyles.emptyText}>Tidak ada tiket pending.</Text>}
        />
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
    borderRadius: 9999,
  },
  headerCard: {
    padding: SPACING.lg,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: SPACING.md 
  },
  greeting: { fontFamily: FONTS.bodyMedium, fontSize: 14 },
  dateText: { fontFamily: FONTS.heading, fontSize: 18, marginTop: 2 },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  chartColLeft: {
    flex: 1,
    alignItems: 'center',
  },
  chartColRight: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  legendTitle: {
    fontFamily: FONTS.labelCaps,
    fontSize: 9,
  },
  legendValue: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
  },
  ticketWrapper: {
    marginBottom: SPACING.lg,
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
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
  notificationBanner: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: SIZES.radiusMd,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notificationTextContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
  },
  notificationSub: {
    fontFamily: FONTS.body,
    fontSize: 12,
    marginTop: 2,
  },
});

