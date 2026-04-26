import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import api from '../../src/utils/api';

export default function PengajuanScreen() {
  const [jenisIzin, setJenisIzin] = useState('sakit');
  const [alasan, setAlasan] = useState('');
  const [loading, setLoading] = useState(false);

  const jenisOptions = ['sakit', 'keperluan_keluarga', 'lainnya'];

  const handleSubmit = async () => {
    if (!alasan.trim()) { Alert.alert('Perhatian', 'Alasan harus diisi.'); return; }
    setLoading(true);
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 jam dari sekarang
      await api.post('/dispensasi', {
        jenis_izin: jenisIzin,
        alasan,
        waktu_mulai: now.toISOString(),
        waktu_selesai: end.toISOString(),
      });
      Alert.alert('Berhasil', 'Dispensasi berhasil diajukan!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      Alert.alert('Gagal', error.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Jenis Izin</Text>
      <View style={styles.optionRow}>
        {jenisOptions.map((opt) => (
          <TouchableOpacity key={opt} style={[styles.optionBtn, jenisIzin === opt && styles.optionBtnActive]} onPress={() => setJenisIzin(opt)}>
            <Text style={[styles.optionText, jenisIzin === opt && styles.optionTextActive]}>{opt.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Alasan</Text>
      <TextInput style={styles.textarea} placeholder="Jelaskan alasan Anda..." value={alasan} onChangeText={setAlasan} multiline numberOfLines={4} textAlignVertical="top" />

      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitText}>{loading ? 'Mengirim...' : 'Ajukan Dispensasi'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8, marginTop: 16 },
  optionRow: { flexDirection: 'row', gap: 8 },
  optionBtn: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff' },
  optionBtnActive: { backgroundColor: '#F59E0B', borderColor: '#F59E0B' },
  optionText: { color: '#4B5563', textTransform: 'capitalize', fontWeight: '500' },
  optionTextActive: { color: '#fff' },
  textarea: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', padding: 14, fontSize: 15, minHeight: 120 },
  submitBtn: { backgroundColor: '#F59E0B', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
