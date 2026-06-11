import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router as expoRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/utils/api';
import { FONTS, SIZES, SPACING } from '../../src/utils/theme';
import { HapticFeedback } from '../../src/utils/haptics';
import { useTheme } from '../../src/hooks/useTheme';
import { createCommonStyles } from '../../src/utils/commonStyles';
import SkeuCard from '../../src/components/SkeuCard';
import TopAppBar from '../../src/components/TopAppBar';
import SearchBar from '../../src/components/SearchBar';
import AvatarInitials from '../../src/components/AvatarInitials';
import FilterPill from '../../src/components/FilterPill';

export default function KelolaAnakWaliScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const { colors, isDark, shadows } = useTheme();
  const commonStyles = createCommonStyles(colors);

  // Main student list query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['wali-siswa'],
    queryFn: async () => {
      const { data } = await api.get('/wali/siswa');
      return data;
    }
  });

  const errorMessage = error
    ? (typeof (error as any).response?.data?.message === 'string'
        ? (error as any).response.data.message
        : typeof (error as any).message === 'string'
          ? (error as any).message
          : 'Terjadi kesalahan memuat data.')
    : null;

  // Fetch Class Join Requests
  const { data: classRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['wali-class-requests'],
    queryFn: async () => {
      const { data } = await api.get('/wali/class-requests');
      return data;
    }
  });

  const students = Array.isArray(data?.siswa) ? data.siswa : [];
  const classRequestsData = Array.isArray(classRequests) ? classRequests : [];
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

  const respondMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: 'accepted' | 'rejected' }) => {
      return await api.post(`/wali/class-requests/${id}/respond`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wali-siswa'] });
      queryClient.invalidateQueries({ queryKey: ['wali-class-requests'] });
      HapticFeedback.success();
      Alert.alert('Berhasil', 'Permintaan telah diproses.');
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
      Alert.alert('Berhasil', 'Siswa berhasil dikeluarkan.');
    }
  });

  const handleRemove = (siswa: any) => {
    Alert.alert(
      'Keluarkan Siswa',
      `Apakah Anda yakin ingin mengeluarkan ${siswa.name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya', style: 'destructive', onPress: () => removeStudentMutation.mutate(siswa.id) }
      ]
    );
  };

  const onRefresh = async () => {
    await refetch();
    await refetchRequests();
  };

  if (isLoading && !data) {
    return (
      <LinearGradient
        colors={[colors.bgPrimary, colors.bgSecondary]}
        style={[styles.container, styles.centered]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: SPACING.sm, fontFamily: FONTS.body, color: colors.textSecondary }}>Memuat data...</Text>
      </LinearGradient>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      {/* Stats Section */}
      <SkeuCard isGlass style={{ borderColor: colors.glassHighlight, marginBottom: SPACING.md }}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.glassHighlight }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: isDark ? '#7BBDE8' : colors.primary }]}>{stats.connected}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Terhubung</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.glassHighlight }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.warning }]}>{stats.unconnected}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Belum</Text>
          </View>
        </View>
      </SkeuCard>

      {/* Join Requests */}
      {classRequestsData.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Permintaan Masuk ({classRequestsData.length})</Text>
          {classRequestsData.map((req: any) => (
            <SkeuCard isGlass key={req.id} style={[styles.requestCard, { borderColor: colors.primary + '30' }]}>
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.requestName, { color: colors.textPrimary }]}>{req.siswa?.name || 'Siswa'}</Text>
                  <Text style={[styles.requestSub, { color: colors.textSecondary }]}>Ingin bergabung kelas</Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity 
                    onPress={() => respondMutation.mutate({ id: req.id, status: 'rejected' })}
                    style={[styles.miniBtn, { backgroundColor: colors.errorBg }]}
                  >
                    <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => respondMutation.mutate({ id: req.id, status: 'accepted' })}
                    style={[styles.miniBtn, { backgroundColor: colors.successBg }]}
                  >
                    <MaterialCommunityIcons name="check" size={20} color={colors.success} />
                  </TouchableOpacity>
                </View>
              </View>
            </SkeuCard>
          ))}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.filterRow}>
          <FilterPill 
            id="all" 
            label="Semua" 
            isActive={activeFilter === 'all'} 
            onPress={setActiveFilter} 
          />
          <FilterPill 
            id="connected" 
            label="Terhubung" 
            isActive={activeFilter === 'connected'} 
            onPress={setActiveFilter} 
          />
          <FilterPill 
            id="unconnected" 
            label="Belum" 
            isActive={activeFilter === 'unconnected'} 
            onPress={setActiveFilter} 
          />
        </View>

        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari nama atau NIS..."
        />
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
          title={`Kelas ${className}`}
          showAvatar={false}
          onBack={() => expoRouter.back()}
        />

        <FlatList
          style={{ flex: 1 }}
          data={filteredStudents}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: SPACING.md }}>
              <SkeuCard isGlass style={[styles.studentCard, { borderColor: colors.glassHighlight }]}>
                <View style={styles.cardRow}>
                  <AvatarInitials name={item.name} size={44} />
                  <View style={styles.studentInfo}>
                    <Text style={[styles.studentName, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.studentSub, { color: colors.textSecondary }]}>NIS: {item.nis || '-'}</Text>
                    <Text style={[
                      styles.parentStatus, 
                      { color: item.has_parent ? colors.success : colors.textMuted }
                    ]}>
                      {item.has_parent ? `✓ Ortu: ${item.parent_name}` : '✕ Belum Terhubung'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </SkeuCard>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: errorMessage ? colors.error : colors.textMuted }]}>
                {errorMessage || 'Tidak ada data siswa ditemukan.'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContent: { padding: SPACING.md },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 21, fontWeight: 'bold' },
  statLabel: { fontSize: 10, textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 1, height: 34 },
  
  section: { marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: SPACING.xs },
  requestCard: {
    marginBottom: SPACING.xs,
  },
  requestName: { fontSize: 16, fontWeight: 'bold' },
  requestSub: { fontSize: 10 },
  requestActions: { flexDirection: 'row', gap: SPACING.sm },
  miniBtn: { width: 34, height: 34, borderRadius: SIZES.radiusFull, alignItems: 'center', justifyContent: 'center' },
  
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  
  controlsContainer: { marginBottom: SPACING.xs },
  filterRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  
  listContent: { paddingBottom: 100 },
  studentCard: {
    marginBottom: SPACING.xs,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: 'bold', fontSize: 16 },
  studentInfo: { flex: 1, marginLeft: SPACING.sm },
  studentName: { fontSize: 16, fontWeight: 'bold' },
  studentSub: { fontSize: 10, marginTop: 1 },
  parentStatus: { fontSize: 10, marginTop: 4 },
  removeBtn: { padding: SPACING.xs },
  emptyText: { marginTop: SPACING.md },
});
