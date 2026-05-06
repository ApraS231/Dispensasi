import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { router as expoRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../../src/utils/theme';
import TopAppBar from '../../src/components/TopAppBar';
import SkeuCard from '../../src/components/SkeuCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import SearchBar from '../../src/components/SearchBar';
import PillBadge from '../../src/components/PillBadge';
import LiquidBackground from '../../src/components/LiquidBackground';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import FilterPill from '../../src/components/FilterPill';
import GlassFAB from '../../src/components/GlassFAB';
import { useSharedValue } from 'react-native-reanimated';
import { HapticFeedback } from '../../src/utils/haptics';

export default function KelolaAnakWaliScreen() {
  const scrollY = useSharedValue(0);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Main student list query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wali-siswa'],
    queryFn: async () => {
      const { data } = await api.get('/wali/siswa');
      return data;
    }
  });

  // Search students for adding
  const { data: searchResults = [], isFetching: isSearching } = useQuery({
    queryKey: ['wali-search-siswa', studentSearchQuery],
    queryFn: async () => {
      if (studentSearchQuery.length < 3) return [];
      const { data } = await api.get('/wali/search-siswa', { params: { q: studentSearchQuery } });
      return data;
    },
    enabled: studentSearchQuery.length >= 3
  });

  // Fetch Class Join Requests
  const { data: classRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['wali-class-requests'],
    queryFn: async () => {
      const { data } = await api.get('/wali/class-requests');
      return data;
    }
  });

  // Mutations
  const respondClassRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'accepted' | 'rejected' }) => {
      return await api.post(`/wali/class-requests/${id}/respond`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wali-siswa'] });
      queryClient.invalidateQueries({ queryKey: ['wali-class-requests'] });
      HapticFeedback.success();
    },
    onError: (error: any) => {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
    }
  });

  const students = data?.siswa || [];
  const className = data?.kelas || '-';

  const stats = useMemo(() => {
    const total = students.length;
    const connected = students.filter((s: any) => s.has_parent).length;
    const unconnected = total - connected;
    return { total, connected, unconnected };
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = students;
    
    if (activeFilter === 'connected') {
      result = result.filter((s: any) => s.has_parent);
    } else if (activeFilter === 'unconnected') {
      result = result.filter((s: any) => !s.has_parent);
    }

    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter((s: any) => 
        (s.name?.toLowerCase() || '').includes(lowerQ) || 
        (s.nis?.toString() || '').includes(lowerQ)
      );
    }

    return result;
  }, [students, activeFilter, searchQuery]);

  // Mutations
  const addStudentMutation = useMutation({
    mutationFn: async (siswaId: string) => {
      return await api.post('/wali/tambah-siswa', { siswa_id: siswaId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wali-siswa'] });
      setIsAddModalVisible(false);
      setStudentSearchQuery('');
      HapticFeedback.success();
      Alert.alert('Berhasil', 'Siswa berhasil ditambahkan ke kelas.');
    },
    onError: (error: any) => {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
    }
  });

  const removeStudentMutation = useMutation({
    mutationFn: async (siswaId: string) => {
      return await api.delete(`/wali/hapus-siswa/${siswaId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wali-siswa'] });
      HapticFeedback.success();
    }
  });

  const handleRemove = (siswa: any) => {
    Alert.alert(
      'Keluarkan Siswa',
      `Apakah Anda yakin ingin mengeluarkan ${siswa.name} dari kelas?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Ya, Keluarkan', 
          style: 'destructive',
          onPress: () => removeStudentMutation.mutate(siswa.id) 
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      <SkeuCard isGlass style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.connected}</Text>
          <Text style={styles.statLabel}>Ortu✓</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.unconnected}</Text>
          <Text style={styles.statLabel}>Belum</Text>
        </View>
      </SkeuCard>

      {classRequests.length > 0 && (
        <View style={styles.requestSection}>
          <Text style={styles.sectionTitle}>Permintaan Bergabung ({classRequests.length})</Text>
          {classRequests.map((req: any) => (
            <SkeuCard key={req.id} isGlass style={styles.requestCard}>
              <AvatarInitials name={req.siswa?.name} size={40} />
              <View style={styles.requestMeta}>
                <Text style={styles.requestName}>{req.siswa?.name || 'Siswa'}</Text>
                <Text style={styles.requestSub}>Ingin bergabung ke kelas ini</Text>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity 
                  onPress={() => respondClassRequestMutation.mutate({ id: req.id, status: 'rejected' })}
                  style={[styles.actionBtn, { backgroundColor: COLORS.error + '20' }]}
                >
                  <MaterialCommunityIcons name="close" size={20} color={COLORS.error} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => respondClassRequestMutation.mutate({ id: req.id, status: 'accepted' })}
                  style={[styles.actionBtn, { backgroundColor: COLORS.success + '20' }]}
                >
                  <MaterialCommunityIcons name="check" size={20} color={COLORS.success} />
                </TouchableOpacity>
              </View>
            </SkeuCard>
          ))}
        </View>
      )}

      <View style={styles.filterSection}>
        <FlatList 
          data={[
            { id: 'all', label: 'Semua' },
            { id: 'connected', label: 'Terhubung Ortu' },
            { id: 'unconnected', label: 'Belum Terhubung' }
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ marginRight: SPACING.sm }}>
              <FilterPill 
                id={item.id}
                label={item.label}
                isActive={activeFilter === item.id}
                onPress={setActiveFilter}
              />
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: SPACING.md }}
        />
      </View>

      <SearchBar 
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Cari nama atau NIS..."
      />
    </View>
  );

  const renderItem = React.useCallback(({ item, index }: { item: any, index: number }) => (
    <View style={styles.cardWrapper}>
      <SkeuCard style={styles.studentCard}>
        <AvatarInitials name={item.name} size={44} />
        <View style={styles.itemMeta}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemSub}>NIS: {item.nis || '-'}</Text>
          {item.has_parent ? (
            <Text style={styles.parentName}>
              <MaterialCommunityIcons name="account-heart" size={12} color={COLORS.primary} /> {item.parent_name}
            </Text>
          ) : (
            <Text style={[styles.parentName, { color: COLORS.textMuted }]}>Belum terhubung ortu</Text>
          )}
        </View>
        <View style={styles.actionSection}>
          <PillBadge status={item.has_parent ? 'approved_final' : 'pending'} />
          <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
            <MaterialCommunityIcons name="account-remove-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </SkeuCard>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        <TopAppBar 
          title={`Kelas ${className}`} 
          onBack={() => expoRouter.back()} 
          scrollY={scrollY}
        />

        <RefreshableFlatList
          data={filteredStudents}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          scrollY={scrollY}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-search-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Tidak ada data siswa.</Text>
              </View>
            ) : null
          }
        />

        <GlassFAB onPress={() => setIsAddModalVisible(true)} icon="account-plus-outline" />

        <Modal
          visible={isAddModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <SkeuCard isGlass style={styles.modalInner}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Tambah Siswa ke Kelas</Text>
                  <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                    <MaterialCommunityIcons name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>

                <SearchBar 
                  value={studentSearchQuery}
                  onChangeText={setStudentSearchQuery}
                  placeholder="Cari nama siswa (min 3 huruf)..."
                />

                <View style={styles.searchResultsList}>
                  {isSearching ? (
                    <ActivityIndicator color={COLORS.primary} />
                  ) : studentSearchQuery.length >= 3 && searchResults.length === 0 ? (
                    <Text style={styles.emptyText}>Siswa tidak ditemukan.</Text>
                  ) : (
                    <FlatList 
                      data={searchResults}
                      keyExtractor={(item: any) => item.id}
                      renderItem={({ item }) => (
                        <TouchableOpacity 
                          style={styles.searchResultItem}
                          onPress={() => addStudentMutation.mutate(item.id)}
                        >
                          <AvatarInitials name={item.name} size={36} />
                          <View style={styles.searchResultMeta}>
                            <Text style={styles.searchResultName}>{item.name}</Text>
                            <Text style={styles.searchResultEmail}>{item.email}</Text>
                          </View>
                          <MaterialCommunityIcons name="plus-circle-outline" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>
              </SkeuCard>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
  safeArea: { flex: 1 },
  listContent: { paddingBottom: 100 },
  headerContent: { paddingHorizontal: SPACING.md },
  
  statsCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: SIZES.radiusCard,
    marginBottom: SPACING.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.glassHighlight,
  },
  
  filterSection: {
    marginBottom: SPACING.sm,
  },
  
  cardWrapper: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
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
  parentName: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 4,
  },
  actionSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  removeBtn: {
    padding: 4,
  },
  
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
    width: '100%',
  },
  modalInner: {
    flex: 1,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  searchResultsList: {
    flex: 1,
    marginTop: SPACING.md,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassHighlight,
  },
  searchResultMeta: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  searchResultName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  searchResultEmail: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  requestSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    marginLeft: 4,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.primary + '05',
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  requestMeta: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  requestName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  requestSub: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
