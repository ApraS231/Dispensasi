import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router as expoRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../../src/utils/theme';
import TopAppBar from '../../src/components/TopAppBar';
import SkeuCard from '../../src/components/SkeuCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import BouncyButton from '../../src/components/BouncyButton';
import SearchBar from '../../src/components/SearchBar';
import PillBadge from '../../src/components/PillBadge';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import LiquidBackground from '../../src/components/LiquidBackground';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import { useSharedValue } from 'react-native-reanimated';

export default function KelolaAnakScreen() {
  const scrollY = useSharedValue(0);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState<string | null>(null);
  const [showKelasPicker, setShowKelasPicker] = useState(false);

  // Queries
  const { data: children = [], isLoading: isLoadingChildren, refetch: refetchChildren } = useQuery({
    queryKey: ['ortu-children'],
    queryFn: async () => {
      const { data } = await api.get('/ortu/children');
      return data;
    }
  });

  const { data: requests = [], isLoading: isLoadingRequests, refetch: refetchRequests } = useQuery({
    queryKey: ['ortu-link-requests'],
    queryFn: async () => {
      const { data } = await api.get('/ortu/link-requests');
      return data;
    }
  });

  const { data: kelasList = [] } = useQuery({
    queryKey: ['ortu-kelas'],
    queryFn: async () => {
      const { data } = await api.get('/ortu/kelas');
      return data;
    }
  });

  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ['ortu-search-siswa', searchQuery, selectedKelasId],
    queryFn: async () => {
      if (!searchQuery && !selectedKelasId) return [];
      const { data } = await api.get('/ortu/search-siswa', {
        params: { q: searchQuery, kelas_id: selectedKelasId }
      });
      return data;
    },
    enabled: searchQuery.length > 2 || selectedKelasId !== null
  });

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: async (siswaId: string) => {
      return await api.post('/ortu/link-request', { siswa_id: siswaId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ortu-link-requests'] });
      Alert.alert('Berhasil', 'Permintaan hubungan akun telah dikirim ke siswa.');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal mengirim permintaan.';
      Alert.alert('Gagal', message);
    }
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return await api.delete(`/ortu/link-request/${requestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ortu-link-requests'] });
    }
  });

  const onRefresh = async () => {
    await Promise.all([refetchChildren(), refetchRequests()]);
  };

  const handleConnect = (siswa: any) => {
    Alert.alert(
      'Hubungkan Akun',
      `Apakah Anda yakin ingin menghubungkan akun dengan ${siswa.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Hubungkan', onPress: () => sendRequestMutation.mutate(siswa.id) }
      ]
    );
  };

  const handleCancelRequest = (requestId: string) => {
    Alert.alert(
      'Batalkan Permintaan',
      'Apakah Anda yakin ingin membatalkan permintaan ini?',
      [
        { text: 'Tidak', style: 'cancel' },
        { text: 'Ya, Batalkan', onPress: () => cancelRequestMutation.mutate(requestId) }
      ]
    );
  };

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <MaterialCommunityIcons name={icon as any} size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      {/* Section A: Anak Saya */}
      <AnimatedEntrance delay={100} direction="up">
        {renderSectionHeader('Anak Saya', 'account-child')}
        {children.length === 0 ? (
          <SkeuCard isGlass style={styles.emptyCard}>
            <Text style={styles.emptyText}>Belum ada anak yang terhubung.</Text>
          </SkeuCard>
        ) : (
          children.map((child: any, index: number) => (
            <AnimatedEntrance key={child.id} delay={200 + index * 50} direction="up">
              <SkeuCard isGlass style={styles.childCard}>
                <AvatarInitials name={child.name} size={44} />
                <View style={styles.itemMeta}>
                  <Text style={styles.itemName}>{child.name}</Text>
                  <Text style={styles.itemSub}>{child.kelas} • NIS: {child.nis}</Text>
                </View>
                <PillBadge status="approved_final" />
              </SkeuCard>
            </AnimatedEntrance>
          ))
        )}
      </AnimatedEntrance>

      {/* Section B: Permintaan Tertunda */}
      <AnimatedEntrance delay={400} direction="up">
        <View style={{ marginTop: SPACING.lg }}>
          {renderSectionHeader('Permintaan Tertunda', 'clock-outline')}
          {requests.length === 0 ? (
            <Text style={styles.subEmptyText}>Tidak ada permintaan aktif.</Text>
          ) : (
            requests.map((req: any, index: number) => (
              <AnimatedEntrance key={req.id} delay={500 + index * 50} direction="up">
                <SkeuCard isGlass style={styles.childCard}>
                  <AvatarInitials name={req.siswa?.name} size={44} />
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemName}>{req.siswa?.name}</Text>
                    <Text style={styles.itemSub}>Menunggu konfirmasi siswa...</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleCancelRequest(req.id)}>
                    <PillBadge status="rejected" />
                  </TouchableOpacity>
                </SkeuCard>
              </AnimatedEntrance>
            ))
          )}
        </View>
      </AnimatedEntrance>

      {/* Section C: Cari Siswa Baru */}
      <AnimatedEntrance delay={700} direction="up">
        <View style={{ marginTop: SPACING.lg }}>
          {renderSectionHeader('Tambah Anak', 'account-plus-outline')}
          <View style={styles.searchContainer}>
            <TouchableOpacity 
              style={styles.kelasPicker} 
              onPress={() => setShowKelasPicker(!showKelasPicker)}
            >
              <Text style={styles.kelasPickerText}>
                {selectedKelasId 
                  ? kelasList.find((k: any) => k.id === selectedKelasId)?.nama_kelas 
                  : 'Pilih Kelas'}
              </Text>
              <MaterialCommunityIcons name={showKelasPicker ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {showKelasPicker && (
              <SkeuCard isGlass style={styles.kelasDropdown}>
                <TouchableOpacity 
                  style={styles.kelasItem} 
                  onPress={() => { setSelectedKelasId(null); setShowKelasPicker(false); }}
                >
                  <Text style={[styles.kelasItemText, !selectedKelasId && { color: COLORS.primary, fontFamily: FONTS.headingSemi }]}>Semua Kelas</Text>
                </TouchableOpacity>
                {kelasList.map((kelas: any) => (
                  <TouchableOpacity 
                    key={kelas.id} 
                    style={styles.kelasItem} 
                    onPress={() => { setSelectedKelasId(kelas.id); setShowKelasPicker(false); }}
                  >
                    <Text style={[styles.kelasItemText, selectedKelasId === kelas.id && { color: COLORS.primary, fontFamily: FONTS.headingSemi }]}>{kelas.nama_kelas}</Text>
                  </TouchableOpacity>
                ))}
              </SkeuCard>
            )}

            <View style={{ marginTop: SPACING.sm }}>
              <SearchBar 
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari nama siswa..."
              />
            </View>
          </View>

          <View style={styles.resultsContainer}>
            {isSearching ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.md }} />
            ) : searchResults.length > 0 ? (
              searchResults.map((siswa: any, index: number) => (
                <AnimatedEntrance key={siswa.id} delay={index * 50} direction="up">
                  <SkeuCard isGlass style={styles.childCard}>
                    <AvatarInitials name={siswa.name} size={44} />
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemName}>{siswa.name}</Text>
                      <Text style={styles.itemSub}>{siswa.kelas}</Text>
                    </View>
                    <BouncyButton 
                      title="Hubungkan" 
                      onPress={() => handleConnect(siswa)}
                      variant="tonal"
                      loading={sendRequestMutation.isPending && sendRequestMutation.variables === siswa.id}
                    />
                  </SkeuCard>
                </AnimatedEntrance>
              ))
            ) : (searchQuery.length > 2 || selectedKelasId) ? (
              <Text style={styles.subEmptyText}>Siswa tidak ditemukan atau sudah terhubung.</Text>
            ) : null}
          </View>
        </View>
      </AnimatedEntrance>
    </View>
  );

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        <TopAppBar 
          title="Kelola Profil Anak" 
          onBack={() => expoRouter.back()} 
          scrollY={scrollY}
        />

        <RefreshableFlatList
          data={[]}
          keyExtractor={() => 'dummy'}
          renderItem={null}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshing={isLoadingChildren || isLoadingRequests}
          onRefresh={onRefresh}
          scrollY={scrollY}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
  safeArea: { flex: 1 },
  listContent: { paddingBottom: SPACING.xl },
  headerContent: { paddingHorizontal: SPACING.md },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: SIZES.radiusCard,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  itemMeta: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontFamily: FONTS.heading,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  itemSub: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusCard,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
  },
  emptyText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  subEmptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  
  searchContainer: {
    zIndex: 20,
  },
  kelasPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: SIZES.radiusButton,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  kelasPickerText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  kelasDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    maxHeight: 200,
    zIndex: 100,
    borderRadius: SIZES.radiusCard,
    borderColor: COLORS.primaryLight,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: COLORS.bgWhite,
  },
  kelasItem: {
    padding: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.glassHighlight,
  },
  kelasItemText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  
  resultsContainer: {
    marginTop: SPACING.sm,
    minHeight: 100,
  }
});
