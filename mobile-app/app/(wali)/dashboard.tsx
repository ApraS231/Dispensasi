import { HapticFeedback } from '../../src/utils/haptics';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { router as expoRouter } from 'expo-router';
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
import LiquidBackground from '../../src/components/LiquidBackground';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import LogoutButton from '../../src/components/LogoutButton';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';
import { BlurView } from 'expo-blur';
import { useSharedValue } from 'react-native-reanimated';

export default function WaliDashboard() {
  const { user, logout } = useAuthStore();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const scrollY = useSharedValue(0);

  const approveMutation = useApproveTicket();
  const rejectMutation = useRejectTicket();

  const { data: pendingTickets = [], refetch: refetchPending } = useQuery({
    queryKey: ['dispensasi-pending'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/pending');
      return data;
    }
  });

  const totalStudents = 36;
  const absentStudents = pendingTickets.length;
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
    await refetchPending();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={commonStyles.mainContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      <AnimatedEntrance delay={300} direction="down">
        <View style={commonStyles.headerContainer}>
          <SkeuCard style={styles.headerCard} isGlass>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Kehadiran Kelas Anda</Text>
                <Text style={styles.dateText}>{todayDate}</Text>
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
                <View style={[styles.legendItem, SHADOWS.inset]}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
                  <View>
                    <Text style={styles.legendTitle}>Hadir</Text>
                    <Text style={styles.legendValue}>{presentStudents} Siswa</Text>
                  </View>
                </View>
                
                <View style={[styles.legendItem, SHADOWS.inset]}>
                  <View style={[styles.legendColor, { backgroundColor: COLORS.textMuted }]} />
                  <View>
                    <Text style={styles.legendTitle}>Izin/Sakit</Text>
                    <Text style={styles.legendValue}>{absentStudents} Siswa</Text>
                  </View>
                </View>
              </View>
            </View>
          </SkeuCard>
        </View>
      </AnimatedEntrance>

      <View style={commonStyles.contentContainer}>
        <AnimatedEntrance delay={600} direction="up">
          <View style={commonStyles.sectionHeader}>
            <Text style={commonStyles.sectionTitle}>Menunggu Persetujuan</Text>
          </View>
        </AnimatedEntrance>
      </View>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      <SafeAreaView style={commonStyles.safeArea}>
        
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'W'} 
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
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <View style={{ paddingHorizontal: SPACING.md }}>
              <AnimatedEntrance delay={800 + (index * 100)} direction="up" offset={20}>
                <SkeuCard isGlass style={styles.ticketWrapper}>
                  <View style={styles.ticketHeaderRow}>
                    <AvatarInitials name={item.siswa?.name || 'Siswa'} size={40} fontSize={16} />
                    <View style={styles.ticketMeta}>
                      <Text style={styles.ticketName}>{item.siswa?.name || 'Siswa'}</Text>
                      <Text style={styles.ticketClass}>{item.kelas?.nama_kelas || 'Kelas'}</Text>
                    </View>
                    <View style={styles.ledDot} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    padding: SPACING.lg,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: SPACING.md 
  },
  greeting: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.textSecondary },
  dateText: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.textPrimary, marginTop: 2 },
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
    backgroundColor: COLORS.glassSurface,
    padding: SPACING.sm,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
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
    color: COLORS.textMuted,
  },
  legendValue: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  ticketWrapper: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
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
    color: COLORS.textPrimary,
  },
  ticketClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ledDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.warning,
    shadowColor: COLORS.warning,
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
});

