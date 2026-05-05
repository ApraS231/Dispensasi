import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import SkeuCard from '../../src/components/SkeuCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import TopAppBar from '../../src/components/TopAppBar';
import LiquidBackground from '../../src/components/LiquidBackground';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import LogoutButton from '../../src/components/LogoutButton';
import TimelineNode from '../../src/components/TimelineNode';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';

export default function OrtuDashboard() {
  const { user, logout } = useAuthStore();
  const scrollY = useSharedValue(0);

  const { data: children, isLoading: isLoadingChildren } = useQuery({
    queryKey: ['ortu-children'],
    queryFn: async () => {
      const { data } = await api.get('/ortu/children');
      return data;
    }
  });

  const { data: tickets = [], isLoading: isLoadingTickets, refetch } = useQuery({
    queryKey: ['ortu-recent-tickets'],
    queryFn: async () => {
      const { data } = await api.get('/ortu/recent-tickets');
      return data;
    }
  });

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    expoRouter.replace('/login');
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={commonStyles.mainContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      <View style={commonStyles.headerContainer}>
        {children?.map((child: any, index: number) => (
          <AnimatedEntrance key={child.id} delay={300 + (index * 100)} direction="down">
            <TouchableOpacity onPress={() => expoRouter.push(`/(ortu)/child/${child.id}`)}>
              <SkeuCard isGlass style={styles.childCard}>
                <View style={styles.childHeaderRow}>
                  <AvatarInitials name={child.name} size={48} fontSize={20} />
                  <View style={styles.childMeta}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childClass}>NIS: {child.nis || '-'}</Text>
                  </View>
                  <View style={styles.childAction}>
                    <Text style={styles.childActionText}>Profil <MaterialCommunityIcons name="arrow-right" size={12} color={COLORS.textPrimary} /></Text>
                  </View>
                </View>
              </SkeuCard>
            </TouchableOpacity>
          </AnimatedEntrance>
        ))}
      </View>

      {/* Timeline Content */}
      <View style={styles.contentContainer}>
        <AnimatedEntrance delay={600} direction="up">
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Izin Terbaru</Text>
            <TouchableOpacity onPress={() => expoRouter.push('/(ortu)/riwayat')}>
              <Text style={styles.seeAllText}>Riwayat Lengkap</Text>
            </TouchableOpacity>
          </View>
        </AnimatedEntrance>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'O'} 
          showNotification={true} 
          scrollY={scrollY}
        />

        <RefreshableFlatList
          data={tickets.slice(0, 3)} // Show only 3 recent on dashboard
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollY={scrollY}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => {
            const date = new Date(item.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
            const isApprovedByWali = item.status === 'approved_by_wali' || item.status === 'approved_final';
            const isApprovedFinal = item.status === 'approved_final';
            const isRejected = item.status === 'rejected';
            
            return (
              <View style={{ paddingHorizontal: SPACING.md }}>
                <AnimatedEntrance delay={800 + (index * 200)} direction="up" offset={20}>
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
                    
                    <BlurView intensity={GLASS.blurIntensity} tint={GLASS.tintColor} style={styles.timelineCard}>
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
                    </BlurView>
                  </TouchableOpacity>
                </AnimatedEntrance>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Anak Anda belum memiliki catatan izin.</Text>}
        />
      </SafeAreaView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
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
    borderRadius: SIZES.radiusButton,
    borderWidth: 1,
    borderColor: COLORS.error,
    overflow: 'hidden',
    backgroundColor: COLORS.errorBg,
  },
  logoutText: { fontFamily: FONTS.headingSemi, color: COLORS.error, fontSize: 12 },
  
  childCard: {
    ...SHADOWS.glassPanel,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SIZES.radiusCard,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusButton,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
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
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusButton,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  typeBadgeText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.primary,
  },
  timelineCard: {
    ...SHADOWS.glassPanel,
    padding: SPACING.md,
    paddingTop: SPACING.lg,
    borderRadius: SIZES.radiusCard,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
    overflow: 'hidden',
  },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});

