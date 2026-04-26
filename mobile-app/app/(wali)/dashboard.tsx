import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';

export default function WaliDashboard() {
  const { user, logout } = useAuthStore();
  const [pendingTickets, setPendingTickets] = useState<any[]>([]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    router.replace('/login');
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/dispensasi/${id}/approve`);
      Alert.alert('Berhasil', 'Tiket disetujui oleh Wali Kelas.');
      setPendingTickets(prev => prev.filter(t => t.id !== id));
    } catch (e: any) { Alert.alert('Gagal', e.response?.data?.message || 'Error'); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {user?.name ?? 'Wali Kelas'} 👋</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutText}>Keluar</Text></TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Tiket Menunggu Persetujuan Wali</Text>
      <FlatList
        data={pendingTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>{item.siswa?.name ?? 'Siswa'}</Text>
            <Text style={styles.cardInfo}>{item.jenis_izin} — {item.alasan}</Text>
            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
              <Text style={styles.btnText}>Setujui</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada tiket pending.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  logoutText: { color: '#EF4444', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  cardInfo: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 12, textTransform: 'capitalize' },
  approveBtn: { backgroundColor: '#8B5CF6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 32, fontSize: 14 },
});
