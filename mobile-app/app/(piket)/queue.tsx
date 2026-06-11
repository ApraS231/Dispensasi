import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router as expoRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePiketQueue } from '../../src/hooks/usePiketQueries';
import { useApproveTicket, useRejectTicket } from '../../src/hooks/useDispensasiQueries';
import TopAppBar from '../../src/components/TopAppBar';
import SkeuCard from '../../src/components/SkeuCard';
import BouncyButton from '../../src/components/BouncyButton';
import RejectModal from '../../src/components/RejectModal';
import SearchBar from '../../src/components/SearchBar';
import AvatarInitials from '../../src/components/AvatarInitials';
import { HapticFeedback } from '../../src/utils/haptics';
import { FONTS, SIZES, SPACING } from '../../src/utils/theme';
import { createCommonStyles } from '../../src/utils/commonStyles';
import { useTheme } from '../../src/hooks/useTheme';

export default function PiketQueueScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const { colors, isDark, shadows } = useTheme();
  const commonStyles = createCommonStyles(colors);

  const { data: queueData, isLoading, refetch } = usePiketQueue();
  const approveMutation = useApproveTicket();
  const rejectMutation = useRejectTicket();

  const queue = queueData?.data || [];
  const isActiveShift = queueData?.is_active_shift ?? false;

  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return queue;
    const lowerQ = searchQuery.toLowerCase();
    return queue.filter((item: any) => 
      (item.siswa?.name || '').toLowerCase().includes(lowerQ) ||
      (item.siswa?.nis || '').toString().includes(lowerQ) ||
      (item.alasan || '').toLowerCase().includes(lowerQ)
    );
  }, [queue, searchQuery]);

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
    <View style={styles.headerContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      <SkeuCard isGlass style={styles.infoCard}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Daftar pengajuan izin dari siswa yang memerlukan validasi piket. Anda dapat memverifikasi atau menolak langsung di bawah.
        </Text>
      </SkeuCard>

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Cari nama siswa atau alasan..."
      />

      <View style={commonStyles.sectionHeader}>
        <Text style={commonStyles.sectionTitle}>Menunggu Validasi ({filteredQueue.length})</Text>
      </View>
    </View>
  );

  // UI STATE 1: Di luar jam kerja (Terkunci)
  if (!isActiveShift && !isLoading) {
    return (
      <LinearGradient
        colors={[colors.bgPrimary, colors.bgSecondary]}
        style={commonStyles.container}
      >
        <SafeAreaView style={commonStyles.safeArea} edges={['bottom', 'left', 'right']}>
          <TopAppBar 
            title="Antrean Piket" 
            showAvatar={false} 
            showNotification={false} 
            onBack={() => expoRouter.back()}
          />
          <View style={styles.lockedContainer}>
            <View style={styles.lockedCardWrapper}>
              <SkeuCard isGlass style={styles.lockedCard}>
                <View style={{ paddingVertical: SPACING.sm, alignItems: 'center', width: '100%' }}>
                  <View style={[styles.lockIconContainer, { backgroundColor: colors.primaryContainer, borderColor: colors.glassHighlight }]}>
                    <MaterialCommunityIcons name="lock-clock" size={56} color={colors.primary} />
                  </View>
                  <Text style={[styles.lockedTitle, { color: colors.textPrimary }]}>Di Luar Jadwal Shift</Text>
                  <Text style={[styles.lockedSubtitle, { color: colors.textSecondary }]}>
                    Maaf, saat ini Anda sedang tidak dalam jadwal tugas piket. 
                    Antrean tiket hanya dapat diakses pada jam kerja yang telah ditentukan.
                  </Text>
                  <BouncyButton 
                    title="Kembali ke Dashboard" 
                    onPress={() => expoRouter.replace('/(piket)/dashboard')} 
                    style={{ marginTop: SPACING.xl, width: '100%' }}
                    variant="primary"
                  />
                </View>
              </SkeuCard>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={commonStyles.container}
    >
      <SafeAreaView style={commonStyles.safeArea} edges={['bottom', 'left', 'right']}>
        <TopAppBar 
          title="Antrean Piket" 
          showAvatar={false} 
          showNotification={false} 
          onBack={() => expoRouter.back()}
        />

        <FlatList
          style={{ flex: 1 }}
          data={filteredQueue}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => {
            const dateObj = item.created_at ? new Date(item.created_at) : new Date();
            const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
            const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            return (
              <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
                <SkeuCard isGlass style={styles.ticketWrapper}>
                  {/* Clickable Ticket Details */}
                  <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  >
                    {/* Header Row: Student Info */}
                    <View style={styles.ticketHeaderRow}>
                      <AvatarInitials name={item.siswa?.name || 'Siswa'} size={40} fontSize={16} />
                      <View style={styles.ticketMeta}>
                        <Text style={[styles.ticketName, { color: colors.textPrimary }]}>{item.siswa?.name || 'Siswa'}</Text>
                        <Text style={[styles.ticketClass, { color: colors.textSecondary }]}>{item.kelas?.nama_kelas || item.siswa?.kelas?.nama_kelas || 'Kelas'}</Text>
                      </View>
                      <View style={[styles.ledDot, { backgroundColor: colors.warning, shadowColor: colors.warning }]} />
                    </View>
                    
                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: colors.glassHighlight }]} />

                    {/* Date and Time Row */}
                    <View style={[styles.permitHeaderRow, { marginBottom: SPACING.xs }]}>
                      <View style={styles.headerItem}>
                        <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
                        <Text style={[styles.headerText, { fontFamily: FONTS.bodyMedium, color: colors.textSecondary }]}>{formattedDate}</Text>
                      </View>
                      <View style={styles.headerItem}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.headerText, { fontFamily: FONTS.bodyMedium, color: colors.textSecondary }]}>{formattedTime}</Text>
                      </View>
                    </View>

                    {/* Permit Type */}
                    <Text style={[styles.typeText, { fontFamily: FONTS.heading, color: colors.primary }]}>
                      {item.jenis_izin?.replace(/_/g, ' ')}
                    </Text>

                    {/* Reason Quote */}
                    <View style={styles.reasonContainer}>
                      <MaterialCommunityIcons name="format-quote-open" size={10} color={isDark ? '#7BBDE8' : colors.primaryMuted} style={{ marginRight: 4 }} />
                      <Text style={[styles.reasonText, { fontFamily: FONTS.body, color: colors.textSecondary }]} numberOfLines={2}>
                        {item.alasan}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Actions Row */}
                  <View style={styles.actionRow}>
                    <BouncyButton 
                      title="Tolak" 
                      variant="danger" 
                      onPress={() => handleReject(item.id)} 
                      style={styles.actionBtn}
                      loading={rejectMutation.isPending && rejectMutation.variables?.id === item.id}
                    />
                    <BouncyButton 
                      title="Setujui & Claim" 
                      onPress={() => handleApprove(item.id)} 
                      style={styles.actionBtn}
                      loading={approveMutation.isPending && approveMutation.variables === item.id}
                    />
                  </View>
                </SkeuCard>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="check-circle-outline" size={64} color={colors.success} style={{ opacity: 0.5 }} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Antrean Kosong</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Hore! Tidak ada tiket yang perlu divalidasi saat ini.</Text>
            </View>
          }
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
  headerContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  infoCard: {
    marginBottom: SPACING.md,
  },
  infoText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  ticketWrapper: {
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    marginTop: SPACING.md,
  },
  emptyText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 88 + SPACING.statusBar,
  },
  lockedCardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  lockedCard: {
    alignItems: 'center',
  },
  lockIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
  },
  lockedTitle: {
    fontFamily: FONTS.heading,
    fontSize: 21,
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  permitHeaderRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
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
    marginTop: 4,
  },
  reasonText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
});
