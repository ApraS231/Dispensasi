import { HapticFeedback } from '../../src/utils/haptics';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router as expoRouter } from 'expo-router';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';

export default function WaliHistoryScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [timeFilter, setTimeFilter] = useState('semua'); // 'semua', 'hari_ini', 'minggu_ini'

  const FilterPill = ({ id, label }: { id: string, label: string }) => {
    const isActive = timeFilter === id;
    return (
      <TouchableOpacity
        style={[styles.filterPill, isActive && styles.filterPillActive]}
        onPress={() => {
          HapticFeedback.light();
          setTimeFilter(id);
        }}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };


  const fetchData = async () => {
    try {
      const res = await api.get('/dispensasi');
      const history = res.data.filter((t: any) => t.status !== 'pending'); // Show processed
      setTickets(history);
      setFilteredTickets(history);
    } catch (e) {} finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    let result = tickets;

    // Text search filter
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t =>
        (t.siswa?.name && t.siswa.name.toLowerCase().includes(lowerQ)) ||
        (t.jenis_izin && t.jenis_izin.replace(/_/g, ' ').toLowerCase().includes(lowerQ))
      );
    }

    // Time filter
    const today = new Date();
    today.setHours(0,0,0,0);

    if (timeFilter === 'hari_ini') {
      result = result.filter(t => {
        const d = new Date(t.created_at);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
      });
    } else if (timeFilter === 'minggu_ini') {
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
      result = result.filter(t => {
        const d = new Date(t.created_at);
        return d >= firstDay;
      });
    }

    setFilteredTickets(result);
  }, [searchQuery, timeFilter, tickets]);


  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar showAvatar={false} title="Riwayat Kelas" showNotification={true} />

        <View style={styles.mainContent}>
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput 
                style={styles.searchInput}
                placeholder="Cari siswa atau jenis izin..."
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
            <View style={styles.filterRow}>
              <FilterPill id="semua" label="Semua" />
              <FilterPill id="hari_ini" label="Hari Ini" />
              <FilterPill id="minggu_ini" label="Minggu Ini" />
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
                ListEmptyComponent={<Text style={styles.emptyText}>Tidak ditemukan riwayat izin.</Text>}
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
  searchSection: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, paddingBottom: SPACING.xs },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgWhite,
    borderRadius: SIZES.radiusButton, paddingHorizontal: SPACING.md, height: 48,
    borderWidth: 2, borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
    marginBottom: SPACING.md,
  },
  filterRow: { flexDirection: 'row', gap: SPACING.sm },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusButton,
    backgroundColor: COLORS.surfaceContainerLowest, borderWidth: 2, borderColor: '#1A1A1A',
  },
  filterPillActive: { backgroundColor: COLORS.primaryContainer, borderColor: '#1A1A1A' },
  filterText: { fontFamily: FONTS.headingSemi, fontSize: 12, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.onPrimaryContainer },
  searchIcon: { fontSize: 16, marginRight: SPACING.sm, opacity: 0.5 },
  searchInput: { flex: 1, fontFamily: FONTS.body, fontSize: 14, color: COLORS.textPrimary },
  clearBtn: { padding: SPACING.xs },
  clearText: { fontSize: 14, color: COLORS.textMuted },
  listContainer: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  listContent: { paddingBottom: 100 },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
