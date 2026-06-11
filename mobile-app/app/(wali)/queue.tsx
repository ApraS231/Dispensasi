import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router as expoRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/utils/api';
import { useApproveTicket, useRejectTicket } from '../../src/hooks/useDispensasiQueries';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import SkeuCard from '../../src/components/SkeuCard';
import BouncyButton from '../../src/components/BouncyButton';
import RejectModal from '../../src/components/RejectModal';
import SearchBar from '../../src/components/SearchBar';
import AvatarInitials from '../../src/components/AvatarInitials';
import { HapticFeedback } from '../../src/utils/haptics';
import { FONTS, SIZES, SPACING } from '../../src/utils/theme';
import { createCommonStyles } from '../../src/utils/commonStyles';
import { useTheme } from '../../src/hooks/useTheme';

export default function WaliQueueScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const { colors, isDark, shadows } = useTheme();
  const commonStyles = createCommonStyles(colors);

  const approveMutation = useApproveTicket();
  const rejectMutation = useRejectTicket();

  const { data: queue = [], isLoading, refetch } = useQuery({
    queryKey: ['dispensasi-wali-queue'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/pending');
      return data;
    }
  });

  const queueData = Array.isArray(queue) ? queue : [];

  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return queueData;
    const lowerQ = searchQuery.toLowerCase();
    return queueData.filter((item: any) => 
      (item.siswa?.name || '').toLowerCase().includes(lowerQ) ||
      (item.siswa?.nis || '').toString().includes(lowerQ) ||
      (item.alasan || '').toLowerCase().includes(lowerQ)
    );
  }, [queueData, searchQuery]);

  const handleApprove = async (id: string) => {
    try {
      HapticFeedback.success();
      await approveMutation.mutateAsync(id);
      Alert.alert('Berhasil', 'Izin berhasil disetujui.');
      refetch();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan.');
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
      Alert.alert('Berhasil', 'Izin berhasil ditolak.');
      refetch();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan.');
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      <SkeuCard isGlass style={styles.infoCard}>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Daftar pengajuan izin dari siswa Anda yang memerlukan persetujuan wali kelas. Anda dapat memverifikasi atau menolak langsung di bawah.
        </Text>
      </SkeuCard>

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Cari nama siswa atau alasan..."
      />

      <View style={commonStyles.sectionHeader}>
        <Text style={commonStyles.sectionTitle}>Menunggu Persetujuan ({filteredQueue.length})</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={commonStyles.container}
    >
      <SafeAreaView style={commonStyles.safeArea} edges={['bottom', 'left', 'right']}>
        <TopAppBar 
          showAvatar={false} 
          title="Antrean Persetujuan" 
          showNotification={true}
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
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: SPACING.md, marginBottom: SPACING.lg }}>
              <SkeuCard style={styles.ticketWrapper}>
                <View style={styles.ticketHeaderRow}>
                  <AvatarInitials name={item.siswa?.name || 'Siswa'} size={40} fontSize={16} />
                  <View style={styles.ticketMeta}>
                    <Text style={[styles.ticketName, { color: colors.textPrimary }]}>{item.siswa?.name || 'Siswa'}</Text>
                    <Text style={[styles.ticketClass, { color: colors.textSecondary }]}>{item.kelas?.nama_kelas || 'Kelas'}</Text>
                  </View>
                  <View style={[styles.ledDot, { backgroundColor: colors.warning, shadowColor: colors.warning }]} />
                </View>

                <TicketCard 
                  item={item} 
                  onPress={() => expoRouter.push(`/ticket/${item.id}`)} 
                  flat={true}
                />

                <View style={styles.actionRow}>
                  <BouncyButton 
                    title="Tolak" 
                    variant="danger" 
                    onPress={() => handleReject(item.id)} 
                    style={styles.actionBtn}
                    loading={rejectMutation.isPending && rejectMutation.variables?.id === item.id}
                  />
                  <BouncyButton 
                    title="Setujui" 
                    onPress={() => handleApprove(item.id)} 
                    style={styles.actionBtn}
                    loading={approveMutation.isPending && approveMutation.variables === item.id}
                  />
                </View>
              </SkeuCard>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={commonStyles.emptyText}>Tidak ada antrean persetujuan saat ini.</Text>
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
});
