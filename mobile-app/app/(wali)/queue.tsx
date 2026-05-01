import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router as expoRouter } from 'expo-router';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import { COLORS, FONTS, SIZES, SPACING } from '../../src/utils/theme';

const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

export default function WaliQueueScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get('/dispensasi');
      // For Wali Kelas, active queue is specifically 'pending' status
      const queue = res.data.filter((t: any) => t.status === 'pending' && isToday(t.created_at));
      setTickets(queue);
    } catch (e) {} finally {
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar showAvatar={false} title="Antrean Validasi" showNotification={true} />

        <View style={styles.mainContent}>
          <View style={styles.headerArea}>
            <Text style={styles.sectionTitle}>Menunggu Validasi</Text>
            <Text style={styles.sectionSub}>Pengajuan dari siswa di kelas Anda.</Text>
          </View>

          <View style={styles.listContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
            ) : (
              <FlatList
                data={tickets}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TicketCard 
                    item={item} 
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  />
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada pengajuan izin saat ini.</Text>}
              />
            )}
          </View>
        </View>

        
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  safeArea: { flex: 1 },
  mainContent: { flex: 1 },
  headerArea: { padding: SPACING.md, paddingBottom: 0 },
  sectionTitle: { fontFamily: FONTS.heading, fontSize: 22, color: COLORS.textPrimary },
  sectionSub: { fontFamily: FONTS.bodyMedium, fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  listContainer: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  listContent: { paddingBottom: 100 },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
