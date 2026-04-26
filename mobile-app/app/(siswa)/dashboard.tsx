import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';

export default function SiswaDashboard() {
  const { user, logout } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/dispensasi/me');
      setTickets(res.data);
    } catch (e) {}
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    router.replace('/login');
  };

  const statusColor = (s: string) => {
    if (s === 'approved_final') return '#10B981';
    if (s === 'rejected') return '#EF4444';
    if (s.includes('approved')) return '#3B82F6';
    return '#F59E0B';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Halo, {user?.name ?? 'Siswa'} 👋</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutText}>Keluar</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.ajukanBtn} onPress={() => router.push('/(siswa)/pengajuan')}>
        <Text style={styles.ajukanText}>+ Ajukan Dispensasi Baru</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Riwayat Dispensasi</Text>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => item.status === 'approved_final' && item.qr_code_token ? router.push(`/(siswa)/qr/${item.id}`) : null}
          >
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>{item.jenis_izin}</Text>
              <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.cardAlasan} numberOfLines={2}>{item.alasan}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Belum ada dispensasi.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  logoutText: { color: '#EF4444', fontWeight: '600' },
  ajukanBtn: { backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 24 },
  ajukanText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardLabel: { fontSize: 14, fontWeight: '600', color: '#4B5563', textTransform: 'capitalize' },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  cardAlasan: { fontSize: 13, color: '#6B7280' },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 32, fontSize: 14 },
});
