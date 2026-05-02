import { HapticFeedback } from '../../src/utils/haptics';
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Dimensions } from 'react-native';
import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import { useApproveTicket, useRejectTicket } from '../../src/hooks/useDispensasiQueries';
import SoftCard from '../../src/components/SoftCard';
import TicketCard from '../../src/components/TicketCard';
import BouncyButton from '../../src/components/BouncyButton';
import RejectModal from '../../src/components/RejectModal';
import TopAppBar from '../../src/components/TopAppBar';
import AvatarInitials from '../../src/components/AvatarInitials';
import DonutChart from '../../src/components/DonutChart';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';

export default function WaliDashboard() {
  const { user, logout } = useAuthStore();
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const approveMutation = useApproveTicket();
  const rejectMutation = useRejectTicket();

  const { data: pendingTickets = [], refetch: refetchPending } = useQuery({
    queryKey: ['dispensasi-pending'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/pending'); // Wali class should only see their students
      return data;
    }
  });

  // Assume total students = 36 for UI demo if not provided by backend yet
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'W'} 
          showNotification={true} 
        />

        <View style={styles.mainContent}>
          {/* Header Card */}
          <View style={styles.headerContainer}>
            <SoftCard style={styles.headerCard}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.greeting}>Kehadiran Kelas Anda</Text>
                  <Text style={styles.dateText}>{todayDate}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                  <Text style={styles.logoutText}>Keluar</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.chartContainer}>
                <View style={styles.chartColLeft}>
                  <DonutChart 
                    total={totalStudents} 
                    present={presentStudents} 
                    absent={absentStudents} 
                    size={130} 
                    strokeWidth={16} 
                  />
                </View>
                
                <View style={styles.chartColRight}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
                    <View>
                      <Text style={styles.legendTitle}>Hadir</Text>
                      <Text style={styles.legendValue}>{presentStudents} Siswa</Text>
                    </View>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: COLORS.surfaceContainerHigh }]} />
                    <View>
                      <Text style={styles.legendTitle}>Izin/Sakit</Text>
                      <Text style={[styles.legendValue, { color: COLORS.textSecondary }]}>{absentStudents} Siswa</Text>
                    </View>
                  </View>
                </View>
              </View>
            </SoftCard>
          </View>

          {/* Content Area */}
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Menunggu Verifikasi Anda</Text>
            </View>
            
            <FlatList
              data={pendingTickets}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.ticketWrapper}>
                  <View style={styles.ticketHeaderRow}>
                    <AvatarInitials name={item.siswa?.name || 'Siswa'} size={40} fontSize={16} />
                    <View style={styles.ticketMeta}>
                      <Text style={styles.ticketName}>{item.siswa?.name || 'Siswa'}</Text>
                      <Text style={styles.ticketClass}>{item.kelas?.nama_kelas || 'Kelas'}</Text>
                    </View>
                    
                    {/* LED Dot */}
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
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada tiket pending.</Text>}
            />
          </View>
        </View>

        
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
  container: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1 },
  mainContent: { flex: 1 },
  headerContainer: {
    padding: SPACING.md,
    zIndex: 10,
  },
  headerCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.tertiaryContainer, // Gold/Amber background
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: SPACING.lg 
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
  
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  chartColLeft: {
    flex: 1,
    alignItems: 'center',
  },
  chartColRight: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: SPACING.md,
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    padding: SPACING.sm,
    borderRadius: SIZES.radiusButton,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  legendTitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  legendValue: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.primary,
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
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
