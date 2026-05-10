import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import TimelineNode from '../../src/components/TimelineNode';
import BouncyButton from '../../src/components/BouncyButton';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function OrtuDashboard() {
  const { user, logout } = useAuthStore();
  const scrollY = useSharedValue(0);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [showChildModal, setShowChildModal] = useState(false);

  const { data: children = [], isLoading: isLoadingChildren } = useQuery({
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
      return Array.isArray(data) ? data : (data.data || []);
    }
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const openChildProfile = (child: any) => {
    setSelectedChild(child);
    setShowChildModal(true);
  };

  const MemoizedHeader = useMemo(() => (
    <View style={commonStyles.mainContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      {/* Welcome Summary Section */}
      <View style={commonStyles.headerContainer}>
        <AnimatedEntrance delay={300} direction="down">
          <SkeuCard isGlass style={styles.summaryCard}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.summaryGradient}
            />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryGreeting}>Selamat Datang,</Text>
                <Text style={styles.summaryName}>{user?.name}</Text>
                <View style={styles.summaryBadges}>
                  <View style={styles.summaryBadge}>
                    <Text style={styles.summaryBadgeText}>{children.length} Anak Terhubung</Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 10 }}>
                <AvatarInitials name={user?.name || 'O'} size={50} fontSize={20} />
                <TouchableOpacity 
                  style={styles.fabSmall}
                  onPress={() => expoRouter.push('/(ortu)/pengajuan')}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryLight]}
                    style={styles.fabGradient}
                  >
                    <MaterialCommunityIcons name="plus" size={20} color={COLORS.bgWhite} />
                    <Text style={styles.fabText}>Izin</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
          </SkeuCard>
        </AnimatedEntrance>

        {/* Children Quick Access */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Anak Anda</Text>
          <TouchableOpacity onPress={() => expoRouter.push('/(ortu)/kelola-anak')}>
            <Text style={styles.actionText}>Kelola <MaterialCommunityIcons name="chevron-right" size={14} /></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.childrenGrid}>
          {children.map((child: any, index: number) => (
            <View key={child.id} style={{ width: children.length > 1 ? '48%' : '100%' }}>
              <AnimatedEntrance delay={450 + (index * 100)} direction="up">
                <TouchableOpacity onPress={() => openChildProfile(child)} activeOpacity={0.8}>
                  <SkeuCard style={styles.childGridCard}>
                    <AvatarInitials name={child.name} size={40} fontSize={16} />
                    <Text style={styles.childGridName} numberOfLines={1}>{child.name.split(' ')[0]}</Text>
                    <Text style={styles.childGridClass}>{child.kelas || 'N/A'}</Text>
                  </SkeuCard>
                </TouchableOpacity>
              </AnimatedEntrance>
            </View>
          ))}
        </View>
      </View>
 
      {/* Timeline Section Header */}
      <View style={styles.timelineHeaderRow}>
        <View style={styles.timelineTitleGroup}>
          <MaterialCommunityIcons name="history" size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Izin Terbaru</Text>
        </View>
        <TouchableOpacity onPress={() => expoRouter.push('/(ortu)/riwayat')} activeOpacity={0.6}>
          <Text style={styles.actionText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [children, user]);

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar 
          showAvatar={false} 
          title="Monitoring Orang Tua"
          showNotification={true} 
          scrollY={scrollY}
        />

        <RefreshableFlatList
          data={tickets.slice(0, 5)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollY={scrollY}
          ListHeaderComponent={MemoizedHeader}
          renderItem={({ item, index }) => {
            const date = new Date(item.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
            const isApprovedByWali = item.status === 'approved_by_wali' || item.status === 'approved_final';
            const isApprovedFinal = item.status === 'approved_final';
            const isRejected = item.status === 'rejected';
            
            return (
              <View style={{ paddingHorizontal: SPACING.md }}>
                <AnimatedEntrance delay={index < 3 ? 800 + (index * 200) : 0} direction="up" offset={20}>
                  <TouchableOpacity 
                    style={styles.ticketWrapper} 
                    activeOpacity={0.8}
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  >
                    <View style={styles.ticketHeader}>
                      <View style={styles.childIndicator}>
                        <AvatarInitials name={item.siswa?.name || 'S'} size={24} fontSize={10} />
                        <Text style={styles.indicatorName}>{item.siswa?.name?.split(' ')[0]}</Text>
                      </View>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{item.jenis_izin.replace(/_/g, ' ')}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.timelineCard}>
                      <View style={styles.dateLabelRow}>
                        <MaterialCommunityIcons name="calendar-clock" size={14} color={COLORS.textMuted} />
                        <Text style={styles.dateLabelText}>{date}</Text>
                      </View>
                      
                      <View style={styles.nodeList}>
                        <TimelineNode 
                          title="Pengajuan Dibuat" 
                          description={item.alasan}
                          time={new Date(item.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} 
                          status="past" 
                          icon="file-document-outline"
                        />
                        <TimelineNode 
                          title={isRejected && !isApprovedByWali ? "Ditolak Wali Kelas" : "Verifikasi Wali Kelas"} 
                          description={isRejected && !isApprovedByWali ? item.catatan_penolakan : "Menunggu verifikasi"}
                          time={isApprovedByWali || (isRejected && !isApprovedByWali) ? new Date(item.updated_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : "--:--"} 
                          status={isRejected && !isApprovedByWali ? 'rejected' : (isApprovedByWali ? 'past' : 'current')} 
                          icon="account-outline"
                        />
                        <TimelineNode 
                          title={isRejected && isApprovedByWali ? "Ditolak Guru Piket" : "Izin Keluar (Guru Piket)"} 
                          description={isRejected && isApprovedByWali ? item.catatan_penolakan : (isApprovedFinal ? "Siswa telah diizinkan keluar." : "Menunggu QR Code")}
                          time={isApprovedFinal || (isRejected && isApprovedByWali) ? new Date(item.updated_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : "--:--"} 
                          status={isRejected && isApprovedByWali ? 'rejected' : (isApprovedFinal ? 'final' : 'current')} 
                          icon="shield-check-outline"
                          isLast
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </AnimatedEntrance>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada riwayat izin anak Anda.</Text>}
        />
      </SafeAreaView>

      {/* Child Profile Modal */}
      <Modal
        visible={showChildModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowChildModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowChildModal(false)} />
          
          <View style={styles.modalContainer}>
            <SkeuCard style={styles.modalContent}>
              {selectedChild && (
                <View style={{ width: '100%', maxHeight: SCREEN_HEIGHT * 0.8 }}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.modalHeader}>
                      <View style={styles.avatarGlow}>
                        <AvatarInitials name={selectedChild.name} size={90} fontSize={34} />
                      </View>
                      <Text style={styles.modalName}>{selectedChild.name}</Text>
                      <View style={styles.modalBadge}>
                        <MaterialCommunityIcons name="school-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.modalBadgeText}>{selectedChild.kelas || 'Siswa'}</Text>
                      </View>
                    </View>

                    <View style={styles.modalStats}>
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>NIS</Text>
                        <Text style={styles.statValue}>{selectedChild.nis || '-'}</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Izin</Text>
                        <Text style={styles.statValue}>
                          {tickets.filter((t: any) => t.siswa_id === selectedChild.id).length} Kali
                        </Text>
                      </View>
                    </View>

                    {/* Recent Tickets Section in Modal */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Tiket Terbaru</Text>
                      {tickets.filter((t: any) => t.siswa_id === selectedChild.id).slice(0, 2).map((ticket: any) => (
                        <TouchableOpacity 
                          key={ticket.id} 
                          style={styles.modalTicketItem}
                          onPress={() => {
                            setShowChildModal(false);
                            expoRouter.push(`/ticket/${ticket.id}`);
                          }}
                        >
                          <View style={styles.modalTicketIcon}>
                            <MaterialCommunityIcons 
                              name={ticket.jenis_izin === 'sakit' ? 'hospital-box-outline' : 'exit-run'} 
                              size={20} 
                              color={COLORS.primary} 
                            />
                          </View>
                          <View style={styles.modalTicketMeta}>
                            <Text style={styles.modalTicketType}>{ticket.jenis_izin.replace(/_/g, ' ')}</Text>
                            <Text style={styles.modalTicketDate}>
                              {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </Text>
                          </View>
                          <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.modalActions}>
                      <BouncyButton 
                        title="Lihat Semua Riwayat"
                        icon="history"
                        onPress={() => {
                          setShowChildModal(false);
                          expoRouter.push('/(ortu)/riwayat');
                        }}
                        style={{ marginBottom: SPACING.md }}
                      />
                      <BouncyButton 
                        title="Tutup Detail"
                        variant="tonal"
                        onPress={() => setShowChildModal(false)}
                      />
                    </View>
                  </ScrollView>
                </View>
              )}
            </SkeuCard>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
  safeArea: { flex: 1 },
  listContent: { paddingBottom: 100 },
  
  // Summary Card
  summaryCard: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 0,
    marginBottom: SPACING.lg,
    ...SHADOWS.elevation3,
  },
  summaryGradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  summaryGreeting: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryName: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: '#FFFFFF',
    marginTop: 2,
  },
  summaryBadges: {
    flexDirection: 'row',
    marginTop: 12,
  },
  summaryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  summaryBadgeText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 11,
    color: '#FFFFFF',
  },

  // Sections
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  actionText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: COLORS.primary,
  },

  // Children Grid
  childrenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  childGridCard: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    width: '100%',
  },
  childGridName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  childGridClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Timeline Header
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  timelineTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Ticket Cards
  ticketWrapper: {
    marginBottom: SPACING.lg,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    paddingHorizontal: 8,
  },
  childIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicatorName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  typeBadge: {
    backgroundColor: 'rgba(10, 65, 116, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 10,
    color: COLORS.primary,
  },
  timelineCard: {
    ...SHADOWS.skeuShadow,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 24,
    padding: SPACING.md,
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.md,
    opacity: 0.7,
  },
  dateLabelText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  nodeList: {
    paddingLeft: 4,
  },

  emptyText: {
    fontFamily: FONTS.body,
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: SPACING.xxl,
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 450,
  },
  modalContent: {
    borderRadius: 36,
    padding: SPACING.xl,
    backgroundColor: '#FFFFFF',
    width: '100%',
    ...SHADOWS.elevation3,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarGlow: {
    ...SHADOWS.raised,
    borderRadius: 45,
    backgroundColor: COLORS.bgWhite,
  },
  modalName: {
    fontFamily: FONTS.heading,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  modalBadgeText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.primary,
  },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 65, 116, 0.04)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(10, 65, 116, 0.05)',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  statDivider: {
    width: 1,
    height: '70%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
    alignSelf: 'center',
  },
  modalSection: {
    marginBottom: 28,
  },
  modalSectionTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginLeft: 4,
  },
  modalTicketItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  modalTicketIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 65, 116, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTicketMeta: {
    flex: 1,
  },
  modalTicketType: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  modalTicketDate: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalActions: {
    width: '100%',
    paddingTop: 8,
  },
  fabSmall: {
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.elevation3,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  fabText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: COLORS.bgWhite,
  },
});
