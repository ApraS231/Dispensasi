import { HapticFeedback } from '../../src/utils/haptics';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router as expoRouter, useFocusEffect } from 'expo-router';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';

export default function PiketHistoryScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/dispensasi');
      const history = res.data.filter((t: any) => t.status === 'approved_final' || t.status === 'rejected');
      setTickets(history);
      setFilteredTickets(history);
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      const result = tickets.filter(t => 
        (t.siswa?.name && t.siswa.name.toLowerCase().includes(lowerQ)) ||
        (t.jenis_izin && t.jenis_izin.replace(/_/g, ' ').toLowerCase().includes(lowerQ))
      );
      setFilteredTickets(result);
    } else {
      setFilteredTickets(tickets);
    }
  }, [searchQuery, tickets]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar showAvatar={false} title="Riwayat Dispensasi" showNotification={true} />

        <View style={styles.mainContent}>
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput 
                style={styles.searchInput}
                placeholder="Cari nama siswa atau jenis izin..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
                  <Text style={styles.clearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.listContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
            ) : (
              <FlatList
                data={filteredTickets}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TicketCard 
                    item={item} 
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  />
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>Tidak ditemukan riwayat tiket.</Text>}
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
  searchSection: {
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.xs,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgWhite,
    borderRadius: SIZES.radiusLg, paddingHorizontal: SPACING.md, height: 48,
     ...SHADOWS.softCard,
  },
  searchIcon: { fontSize: 16, marginRight: SPACING.sm, opacity: 0.5 },
  searchInput: { flex: 1, fontFamily: FONTS.body, fontSize: 14, color: COLORS.textPrimary },
  clearBtn: { padding: SPACING.xs },
  clearText: { fontSize: 14, color: COLORS.textMuted },
  listContainer: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  listContent: { paddingBottom: 100 },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
