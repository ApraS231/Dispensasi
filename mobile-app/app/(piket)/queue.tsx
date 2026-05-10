import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router as expoRouter } from 'expo-router';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePiketQueue } from '../../src/hooks/usePiketQueries';
import { useApproveTicket, useRejectTicket } from '../../src/hooks/useDispensasiQueries';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import SkeuCard from '../../src/components/SkeuCard';
import LiquidBackground from '../../src/components/LiquidBackground';
import AvatarInitials from '../../src/components/AvatarInitials';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import BouncyButton from '../../src/components/BouncyButton';
import RejectModal from '../../src/components/RejectModal';
import { HapticFeedback } from '../../src/utils/haptics';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';
import { useSharedValue } from 'react-native-reanimated';

export default function PiketQueueScreen() {
  const scrollY = useSharedValue(0);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { data: queueData, isLoading, refetch } = usePiketQueue();
  const approveMutation = useApproveTicket();
  const rejectMutation = useRejectTicket();

  const queue = queueData?.data || [];
  const isActiveShift = queueData?.is_active_shift ?? false;

  const handleApprove = async (id: string) => {
    try {
      HapticFeedback.success();
      await approveMutation.mutateAsync(id);
      Alert.alert('Berhasil', 'Tiket berhasil disetujui dan diklaim oleh Anda.');
    } catch (e: any) {
      if (e.response?.status === 409) {
        Alert.alert('Terlambat', 'Tiket ini sudah diproses oleh Guru Piket lain.');
        refetch();
      } else {
        Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan saat menyetujui tiket.');
      }
    }
  };

  const handleReject = (id: string) => {
    setRejectingId(id);
  };

  const confirmReject = async (catatan: string) => {
    if (!rejectingId) return;
    const id = rejectingId;
    setRejectingId(null);
    try {
      HapticFeedback.success();
      await rejectMutation.mutateAsync({ id, catatan });
      Alert.alert('Berhasil', 'Tiket berhasil ditolak.');
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan saat menolak tiket.');
    }
  };

  const renderHeader = () => (
    <View style={commonStyles.mainContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      <View style={commonStyles.headerContainer}>
        <AnimatedEntrance delay={300} direction="down">
          <Text style={styles.title}>Meja Piket</Text>
          <Text style={styles.subtitle}>
            {isActiveShift 
              ? `Ada ${queue.length} tiket menunggu validasi Anda.` 
              : 'Antrean akan otomatis terbuka saat jadwal shift Anda dimulai.'}
          </Text>
        </AnimatedEntrance>
      </View>
    </View>
  );

  // UI STATE 1: Di luar jam kerja (Terkunci)
  if (!isActiveShift && !isLoading) {
    return (
      <View style={commonStyles.container}>
        <LiquidBackground />
        <SafeAreaView style={commonStyles.safeArea}>
          <TopAppBar 
            title="Antrean Piket" 
            showAvatar={false} 
            showNotification={false} 
            scrollY={scrollY}
            onBack={() => expoRouter.back()}
          />
          <View style={styles.lockedContainer}>
            <AnimatedEntrance delay={300} direction="up">
              <SkeuCard isGlass style={styles.lockedCard}>
                <View style={styles.lockIconContainer}>
                  <MaterialCommunityIcons name="lock-clock" size={64} color={COLORS.textMuted} />
                </View>
                <Text style={styles.lockedTitle}>Di Luar Jadwal Shift</Text>
                <Text style={styles.lockedSubtitle}>
                  Maaf, saat ini Anda sedang tidak dalam jadwal tugas piket. 
                  Antrean tiket hanya dapat diakses pada jam kerja yang telah ditentukan.
                </Text>
                <BouncyButton 
                  title="Kembali ke Dashboard" 
                  onPress={() => expoRouter.back()} 
                  style={{ marginTop: SPACING.xl, width: '100%' }}
                  variant="outlined"
                />
              </SkeuCard>
            </AnimatedEntrance>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      
      {/* Header - Fixed container to ensure responsiveness */}
      <View style={{ height: SPACING.statusBar + 88, zIndex: 100 }}>
        <TopAppBar 
          title="Antrean Piket" 
          showAvatar={false} 
          showNotification={false} 
          scrollY={scrollY}
          onBack={() => expoRouter.back()}
        />
      </View>

      <View style={commonStyles.safeArea}>
        <RefreshableFlatList
          data={queue}
          keyExtractor={(item: any) => item.id}
          refreshing={isLoading}
          onRefresh={refetch}
          scrollY={scrollY}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[commonStyles.listContent, { paddingBottom: 100 }]}
          renderItem={({ item, index }: any) => (
            <View style={{ paddingHorizontal: SPACING.md }}>
              <AnimatedEntrance delay={400 + (index * 100)} direction="up" offset={20}>
                <View style={styles.ticketCard}>
                  <TicketCard 
                    item={item} 
                    showName={true}
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
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
                      disabled={approveMutation.isPending && approveMutation.variables === item.id}
                    >
                      {approveMutation.isPending && approveMutation.variables === item.id ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                          <Text style={styles.miniBtnTextApprove}>Setujui & Claim</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </AnimatedEntrance>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="check-circle-outline" size={64} color={COLORS.success} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyTitle}>Antrean Kosong</Text>
              <Text style={styles.emptyText}>Hore! Tidak ada tiket yang perlu divalidasi saat ini.</Text>
            </View>
          }
        />
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
  title: {
    fontFamily: FONTS.heading,
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  ticketCard: {
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
    flex: 2,
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
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  lockedCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.glassSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  lockedTitle: {
    fontFamily: FONTS.heading,
    fontSize: 22,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 22,
  },
});
