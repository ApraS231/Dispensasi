import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import SoftCard from '../../src/components/SoftCard';
import TimelineNode from '../../src/components/TimelineNode';
import TopAppBar from '../../src/components/TopAppBar';
import AvatarInitials from '../../src/components/AvatarInitials';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';

export default function OrtuDashboard() {
  const { user, logout } = useAuthStore();
  const children = (user as any)?.anak || [];
  const { data: tickets = [], isLoading: loading } = useQuery({
    queryKey: ['monitoring-anak'],
    queryFn: async () => {
      const { data } = await api.get('/monitoring/anak');
      return data;
    }
  });


  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    expoRouter.replace('/login');
  };

  const child = tickets.length > 0 && tickets[0].siswa ? tickets[0].siswa : null;
  const childClass = tickets.length > 0 && tickets[0].kelas ? tickets[0].kelas.nama_kelas : 'Siswa';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'O'} 
          showNotification={true} 
        />

        <View style={styles.mainContent}>
          {/* Header Area */}
          <View style={styles.headerContainer}>
            <View style={styles.greetingRow}>
              <View>
                <Text style={styles.greeting}>Pantau Aktivitas Anak</Text>
                <Text style={styles.name}>{user?.name ?? 'Orang Tua'}</Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Keluar</Text>
              </TouchableOpacity>
            </View>

            {/* Child Profile Card */}
            {children.map((child: any) => (
              <SoftCard style={styles.childCard} key={child.id}>
                <View style={styles.childHeaderRow}><AvatarInitials name={child.name} size={48} fontSize={20} />
                <View style={styles.childMeta}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childClass}>NIS: {child.nis || '-'}</Text>
                </View>
                <View style={styles.childAction}>
                  <Text style={styles.childActionText}>Profil ➔</Text>
                </View></View>
              </SoftCard>
            ))}
          </View>

          {/* Timeline Content */}
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Izin Terbaru</Text>
              <TouchableOpacity onPress={() => expoRouter.push('/(ortu)/riwayat')}>
                <Text style={styles.seeAllText}>Riwayat Lengkap</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={tickets.slice(0, 3)} // Show only 3 recent on dashboard
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const date = new Date(item.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
                const isApprovedByWali = item.status === 'approved_by_wali' || item.status === 'approved_final';
                const isApprovedFinal = item.status === 'approved_final';
                const isRejected = item.status === 'rejected';
                
                return (
                  <TouchableOpacity 
                    style={styles.ticketWrapper} 
                    activeOpacity={0.8}
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  >
                    <View style={styles.ticketHeader}>
                      <Text style={styles.dateHeader}>{date}</Text>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{item.jenis_izin.replace(/_/g, ' ')}</Text>
                      </View>
                    </View>
                    
                    <SoftCard style={styles.timelineCard}>
                      <View>
                        <TimelineNode 
                          title="Pengajuan Dibuat" 
                          description={item.alasan}
                          time={new Date(item.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} 
                          status="past" 
                          icon="file-document-outline"
                        />
                        <TimelineNode 
                          title={isRejected && !isApprovedByWali ? "Ditolak Wali Kelas" : "Verifikasi Wali Kelas"} 
                          description={isRejected && !isApprovedByWali ? item.catatan_penolakan : "Menunggu verifikasi dari wali kelas"}
                          time={isApprovedByWali || (isRejected && !isApprovedByWali) ? new Date(item.updated_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : "Wait"} 
                          status={isRejected && !isApprovedByWali ? 'rejected' : (isApprovedByWali ? 'past' : 'current')} 
                          icon="account-outline"
                        />
                        <TimelineNode 
                          title={isRejected && isApprovedByWali ? "Ditolak Guru Piket" : "Izin Keluar (Guru Piket)"} 
                          description={isRejected && isApprovedByWali ? item.catatan_penolakan : (isApprovedFinal ? "QR Code telah dicetak dan siswa bisa keluar." : "Menunggu pencetakan QR oleh piket")}
                          time={isApprovedFinal || (isRejected && isApprovedByWali) ? new Date(item.updated_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : "Wait"} 
                          status={isRejected && isApprovedByWali ? 'rejected' : (isApprovedFinal ? 'final' : 'current')} 
                          icon="shield-check-outline"
                          isLast
                        />
                      </View>
                    </SoftCard>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyText}>Anak Anda belum memiliki catatan izin.</Text>}
            />
          </View>
        </View>

        
      </SafeAreaView>
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
  greetingRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  greeting: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.textSecondary },
  name: { fontFamily: FONTS.headingSemi, fontSize: 20, color: COLORS.textPrimary },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radiusButton,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoutText: { fontFamily: FONTS.headingSemi, color: COLORS.inverseOnSurface, fontSize: 12 },
  
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.secondaryContainer, // Teal/Mint
  },
  childHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  childMeta: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  childName: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  childClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  childAction: {
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusButton,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  childActionText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 11,
    color: COLORS.textPrimary,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: SPACING.md 
  },
  sectionTitle: { fontFamily: FONTS.headingSemi, fontSize: 18, color: COLORS.textPrimary },
  seeAllText: { fontFamily: FONTS.headingSemi, fontSize: 13, color: COLORS.textPrimary },
  
  listContent: { paddingBottom: 100 },
  ticketWrapper: {
    marginBottom: SPACING.xl,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingHorizontal: 4,
  },
  dateHeader: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  typeBadge: {
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusButton,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeBadgeText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.textPrimary,
  },
  timelineCard: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
