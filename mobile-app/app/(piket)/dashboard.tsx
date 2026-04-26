import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';

export default function PiketDashboard() {
  const { user, logout } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [pendingTickets, setPendingTickets] = useState<any[]>([]);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    router.replace('/login');
  };

  const toggleReady = async () => {
    try {
      if (!isReady) {
        await api.post('/piket/ready');
        Alert.alert('Siap!', 'Anda sekarang dalam status READY. Tiket akan diarahkan ke Anda.');
      } else {
        await api.post('/piket/checkout');
        Alert.alert('Selesai', 'Shift piket Anda telah berakhir.');
      }
      setIsReady(!isReady);
    } catch (e) { Alert.alert('Error', 'Terjadi kesalahan server.'); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/dispensasi/${id}/approve`);
      Alert.alert('Berhasil', 'Tiket disetujui.');
      setPendingTickets(prev => prev.filter(t => t.id !== id));
    } catch (e: any) { Alert.alert('Gagal', e.response?.data?.message || 'Error'); }
  };

  const handleReject = async (id: string) => {
    Alert.prompt?.('Alasan Penolakan', 'Masukkan catatan penolakan:', async (catatan) => {
      try {
        await api.post(`/dispensasi/${id}/reject`, { catatan_penolakan: catatan });
        setPendingTickets(prev => prev.filter(t => t.id !== id));
      } catch (e) {}
    }) || Alert.alert('Info', 'Gunakan fitur reject di perangkat yang mendukung prompt.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {user?.name ?? 'Guru'} 👋</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutText}>Keluar</Text></TouchableOpacity>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Status Piket:</Text>
        <TouchableOpacity style={[styles.toggleBtn, isReady ? styles.toggleBtnDanger : styles.toggleBtnSuccess]} onPress={toggleReady}>
          <Text style={styles.toggleText}>{isReady ? '🛑 Akhiri Shift' : '✅ Set Ready'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Tiket Menunggu Persetujuan</Text>
      <FlatList
        data={pendingTickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardName}>{item.siswa?.name ?? 'Siswa'}</Text>
            <Text style={styles.cardInfo}>{item.jenis_izin} — {item.alasan}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(item.id)}>
                <Text style={styles.btnText}>Setujui</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                <Text style={styles.btnText}>Tolak</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada tiket pending.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  logoutText: { color: '#EF4444', fontWeight: '600' },
  statusCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, elevation: 2 },
  statusLabel: { fontSize: 16, fontWeight: '600', color: '#374151' },
  toggleBtn: { borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  toggleBtnSuccess: { backgroundColor: '#10B981' },
  toggleBtnDanger: { backgroundColor: '#EF4444' },
  toggleText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  cardInfo: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 12, textTransform: 'capitalize' },
  cardActions: { flexDirection: 'row', gap: 8 },
  approveBtn: { flex: 1, backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  rejectBtn: { flex: 1, backgroundColor: '#EF4444', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 32, fontSize: 14 },
});
