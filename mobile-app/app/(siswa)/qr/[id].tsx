import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import api from '../../../src/utils/api';

export default function QRCodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        // Ambil dari list tiket saya, filter berdasarkan ID
        const res = await api.get('/dispensasi/me');
        const found = res.data.find((t: any) => t.id === id);
        setTicket(found);
      } catch (e) {} finally { setLoading(false); }
    };
    fetchTicket();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#F59E0B" /></View>;
  if (!ticket?.qr_code_token) return <View style={styles.center}><Text style={styles.errorText}>QR Code belum tersedia. Tiket belum disetujui.</Text></View>;

  return (
    <View style={styles.center}>
      <View style={styles.card}>
        <QRCode value={ticket.qr_code_token} size={250} color="black" backgroundColor="white" />
        <Text style={styles.label}>Tunjukkan ke Satpam</Text>
        <Text style={styles.token}>{ticket.qr_code_token}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', elevation: 4 },
  label: { marginTop: 20, fontSize: 16, fontWeight: '700', color: '#374151' },
  token: { marginTop: 8, fontSize: 10, color: '#9CA3AF', textAlign: 'center' },
  errorText: { color: '#EF4444', fontSize: 16, textAlign: 'center' },
});
