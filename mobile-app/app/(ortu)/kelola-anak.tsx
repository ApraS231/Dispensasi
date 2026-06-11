import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router as expoRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/utils/api';
import { FONTS, SIZES, SPACING } from '../../src/utils/theme';
import TopAppBar from '../../src/components/TopAppBar';
import SkeuCard from '../../src/components/SkeuCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import BouncyButton from '../../src/components/BouncyButton';
import SearchBar from '../../src/components/SearchBar';
import PillBadge from '../../src/components/PillBadge';
import { useTheme } from '../../src/hooks/useTheme';

export default function KelolaAnakScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelasId, setSelectedKelasId] = useState<string | number | null>(null);
  const [showKelasPicker, setShowKelasPicker] = useState(false);
  const { colors, isDark, shadows } = useTheme();

  // Queries
  const { data: children = [], isLoading: isLoadingChildren, error: errorChildren, refetch: refetchChildren } = useQuery({
    queryKey: ['ortu-children'],
    queryFn: async () => {
      const { data } = await api.get('/ortu/children');
      return data;
    }
  });

  const errorChildrenMessage = errorChildren
    ? (typeof (errorChildren as any).response?.data?.message === 'string'
        ? (errorChildren as any).response.data.message
        : typeof (errorChildren as any).message === 'string'
          ? (errorChildren as any).message
          : 'Terjadi kesalahan memuat data anak.')
    : null;

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

  // Safe Array Checks
  const childrenData = Array.isArray(children) ? children : [];
  const requestsData = Array.isArray(requests) ? requests : [];
  const kelasListData = Array.isArray(kelasList) ? kelasList : [];
  const searchResultsData = Array.isArray(searchResults) ? searchResults : [];

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
      <MaterialCommunityIcons name={icon as any} size={20} color={colors.primary} style={{ marginRight: 8 }} />
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      {/* Section A: Anak Saya */}
      <View>
        {renderSectionHeader('Anak Saya', 'account-child')}
        {childrenData.length === 0 ? (
          <View style={[
            styles.emptyCard, 
            { 
              borderColor: errorChildrenMessage ? colors.error : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10, 65, 116, 0.15)'),
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(10, 65, 116, 0.02)'
            }
          ]}>
            <Text style={[styles.emptyText, { color: errorChildrenMessage ? colors.error : colors.textMuted }]}>
              {errorChildrenMessage || 'Belum ada anak yang terhubung.'}
            </Text>
          </View>
        ) : (
          childrenData.map((child: any) => (
            <SkeuCard key={child.id} isGlass style={styles.childCard}>
              <View style={styles.cardRow}>
                <AvatarInitials name={child.name} size={44} />
                <View style={styles.itemMeta}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]}>{child.name || 'Siswa'}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{child.kelas || '-'} • NIS: {child.nis || '-'}</Text>
                </View>
                <PillBadge status="approved_final" />
              </View>
            </SkeuCard>
          ))
        )}
      </View>

      {/* Section B: Permintaan Tertunda */}
      <View style={{ marginTop: SPACING.lg }}>
        {renderSectionHeader('Permintaan Tertunda', 'clock-outline')}
        {requestsData.length === 0 ? (
          <Text style={[styles.subEmptyText, { color: colors.textMuted }]}>Tidak ada permintaan aktif.</Text>
        ) : (
          requestsData.map((req: any) => (
            <SkeuCard key={req.id} isGlass style={styles.childCard}>
              <View style={styles.cardRow}>
                <AvatarInitials name={req.siswa?.name} size={44} />
                <View style={styles.itemMeta}>
                  <Text style={[styles.itemName, { color: colors.textPrimary }]}>{req.siswa?.name || 'Siswa'}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Menunggu konfirmasi siswa...</Text>
                </View>
                <TouchableOpacity onPress={() => handleCancelRequest(req.id)}>
                  <PillBadge status="rejected" />
                </TouchableOpacity>
              </View>
            </SkeuCard>
          ))
        )}
      </View>

      {/* Section C: Cari Siswa Baru */}
      <View style={{ marginTop: SPACING.lg }}>
        {renderSectionHeader('Tambah Anak', 'account-plus-outline')}
        <View style={styles.searchContainer}>
          <TouchableOpacity 
            style={[styles.kelasPicker, shadows.inset]} 
            onPress={() => setShowKelasPicker(!showKelasPicker)}
          >
            <Text style={[styles.kelasPickerText, { color: colors.textPrimary }]}>
              {selectedKelasId 
                ? kelasListData.find((k: any) => k.id === selectedKelasId)?.nama_kelas 
                : 'Pilih Kelas'}
            </Text>
            <MaterialCommunityIcons name={showKelasPicker ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {showKelasPicker && (
            <View style={[
              styles.kelasDropdown, 
              shadows.skeuShadow,
              { 
                backgroundColor: isDark ? colors.bgSecondary : colors.bgPrimary, 
                borderColor: colors.outlineVariant 
              }
            ]}>
              <TouchableOpacity 
                style={[styles.kelasItem, { borderBottomColor: colors.outlineVariant }]} 
                onPress={() => { setSelectedKelasId(null); setShowKelasPicker(false); }}
              >
                <Text style={[styles.kelasItemText, { color: colors.textPrimary }, !selectedKelasId && { color: colors.primary, fontFamily: FONTS.headingSemi }]}>Semua Kelas</Text>
              </TouchableOpacity>
              {kelasListData.map((kelas: any) => (
                <TouchableOpacity 
                  key={kelas.id} 
                  style={[styles.kelasItem, { borderBottomColor: colors.outlineVariant }]} 
                  onPress={() => { setSelectedKelasId(kelas.id); setShowKelasPicker(false); }}
                >
                  <Text style={[styles.kelasItemText, { color: colors.textPrimary }, selectedKelasId === kelas.id && { color: colors.primary, fontFamily: FONTS.headingSemi }]}>{kelas.nama_kelas}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
            <ActivityIndicator color={colors.primary} style={{ marginTop: SPACING.md }} />
          ) : searchResultsData.length > 0 ? (
            searchResultsData.map((siswa: any) => (
              <SkeuCard key={siswa.id} isGlass style={styles.childCard}>
                <View style={styles.cardRow}>
                  <AvatarInitials name={siswa.name} size={44} />
                  <View style={styles.itemMeta}>
                    <Text style={[styles.itemName, { color: colors.textPrimary }]}>{siswa.name || 'Siswa'}</Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{siswa.kelas || '-'}</Text>
                  </View>
                  <BouncyButton 
                    title="Hubungkan" 
                    onPress={() => handleConnect(siswa)}
                    variant="tonal"
                    loading={sendRequestMutation.isPending && sendRequestMutation.variables === siswa.id}
                  />
                </View>
              </SkeuCard>
            ))
          ) : (searchQuery.length > 2 || selectedKelasId) ? (
            <Text style={[styles.subEmptyText, { color: colors.textMuted }]}>Siswa tidak ditemukan atau sudah terhubung.</Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <TopAppBar 
          title="Kelola Profil Anak" 
          onBack={() => expoRouter.back()} 
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingChildren || isLoadingRequests}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          {renderHeader()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  },
  
  childCard: {
    marginBottom: SPACING.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  itemMeta: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontFamily: FONTS.heading,
    fontSize: 16,
  },
  itemSub: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    marginTop: 2,
  },
  
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusCard,
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  emptyText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
  },
  subEmptyText: {
    fontFamily: FONTS.body,
    fontSize: 16,
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
    height: 55,
    borderRadius: SIZES.radiusButton,
  },
  kelasPickerText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
  },
  kelasDropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    maxHeight: 200,
    zIndex: 100,
    borderRadius: SIZES.radiusCard,
    borderWidth: 1,
    overflow: 'hidden',
  },
  kelasItem: {
    padding: SPACING.md,
    borderBottomWidth: 0.5,
  },
  kelasItemText: {
    fontFamily: FONTS.body,
    fontSize: 16,
  },
  
  resultsContainer: {
    marginTop: SPACING.sm,
    minHeight: 100,
  }
});
