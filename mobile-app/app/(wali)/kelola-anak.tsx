import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router as expoRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { COLORS, FONTS, SIZES, SPACING } from '../../src/utils/theme';
import { HapticFeedback } from '../../src/utils/haptics';

export default function KelolaAnakWaliScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Main student list query
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['wali-siswa'],
    queryFn: async () => {
      const { data } = await api.get('/wali/siswa');
      return data;
    }
  });

  // Fetch Class Join Requests
  const { data: classRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ['wali-class-requests'],
    queryFn: async () => {
      const { data } = await api.get('/wali/class-requests');
      return data;
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
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, fontFamily: FONTS.body }}>Memuat data...</Text>
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.connected}</Text>
          <Text style={styles.statLabel}>Terhubung</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.warning }]}>{stats.unconnected}</Text>
          <Text style={styles.statLabel}>Belum</Text>
        </View>
      </View>

      {/* Join Requests */}
      {Array.isArray(classRequests) && classRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permintaan Masuk ({classRequests.length})</Text>
          {classRequests.map((req: any) => (
            <View key={req.id} style={styles.requestCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestName}>{req.siswa?.name || 'Siswa'}</Text>
                <Text style={styles.requestSub}>Ingin bergabung kelas</Text>
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity 
                  onPress={() => respondMutation.mutate({ id: req.id, status: 'rejected' })}
                  style={[styles.miniBtn, { backgroundColor: COLORS.errorBg }]}
                >
                  <MaterialCommunityIcons name="close" size={20} color={COLORS.error} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => respondMutation.mutate({ id: req.id, status: 'accepted' })}
                  style={[styles.miniBtn, { backgroundColor: COLORS.successBg }]}
                >
                  <MaterialCommunityIcons name="check" size={20} color={COLORS.success} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.filterRow}>
          {['all', 'connected', 'unconnected'].map((f) => (
            <TouchableOpacity 
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterBtn, 
                activeFilter === f && { backgroundColor: COLORS.primary }
              ]}
            >
              <Text style={[
                styles.filterText, 
                activeFilter === f && { color: '#FFFFFF' }
              ]}>
                {f === 'all' ? 'Semua' : f === 'connected' ? 'Terhubung' : 'Belum'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color={COLORS.textMuted} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Cari nama atau NIS..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => expoRouter.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelas {className}</Text>
        <View style={{ width: 48 }} />
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        onRefresh={onRefresh}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name?.charAt(0) || 'S'}</Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentSub}>NIS: {item.nis || '-'}</Text>
              <Text style={[
                styles.parentStatus, 
                { color: item.has_parent ? COLORS.success : COLORS.textMuted }
              ]}>
                {item.has_parent ? `✓ Ortu: ${item.parent_name}` : '✕ Belum Terhubung'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item)} style={styles.removeBtn}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>Tidak ada data siswa ditemukan.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    backgroundColor: '#F0F4F8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backBtn: { padding: 4 },
  headerTitle: { fontFamily: FONTS.heading, fontSize: 18, color: COLORS.primary },
  
  headerContent: { padding: SPACING.md },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    marginBottom: 20,
    // Basic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 1, height: '70%', backgroundColor: '#EEE' },
  
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.primary, marginBottom: 10 },
  requestCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  requestName: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  requestSub: { fontSize: 12, color: COLORS.textMuted },
  requestActions: { flexDirection: 'row', gap: 10 },
  miniBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  
  controlsContainer: { marginBottom: 10 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterText: { fontSize: 12, color: COLORS.textMuted },
  
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 46,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: COLORS.textPrimary },
  
  listContent: { paddingBottom: 50 },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  studentInfo: { flex: 1, marginLeft: 12 },
  studentName: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
  studentSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  parentStatus: { fontSize: 11, marginTop: 4 },
  removeBtn: { padding: 8 },
  emptyText: { color: COLORS.textMuted, marginTop: 20 },
});
