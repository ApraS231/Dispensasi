import { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router as expoRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import FilterPill from '../../src/components/FilterPill';
import SearchBar from '../../src/components/SearchBar';
import LiquidBackground from '../../src/components/LiquidBackground';
import { COLORS, SPACING, GLASS } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';
import { BlurView } from 'expo-blur';

export default function WaliHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('semua');

  const { data: ticketsData, isLoading: loading } = useQuery({
    queryKey: ['dispensasi-wali-history'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi');
      return data;
    }
  });

  const filteredTickets = useMemo(() => {
    let result = ticketsData || [];
    
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => 
        (t.siswa?.name && t.siswa.name.toLowerCase().includes(lowerQ)) ||
        (t.jenis_izin && t.jenis_izin.toLowerCase().includes(lowerQ)) ||
        (t.alasan && t.alasan.toLowerCase().includes(lowerQ))
      );
    }
    
    if (timeFilter === 'hari_ini') {
      const today = new Date().toDateString();
      result = result.filter(t => new Date(t.created_at).toDateString() === today);
    }
    
    return result;
  }, [searchQuery, timeFilter, ticketsData]);

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      <SafeAreaView style={commonStyles.safeArea}>
        
        <TopAppBar showAvatar={false} title="Riwayat Izin Kelas" showNotification={true} />

        <View style={commonStyles.mainContent}>
          <View style={{ height: 88 + SPACING.statusBar }} />
          <BlurView intensity={GLASS.blurIntensity + 20} tint={GLASS.tintColor} style={styles.searchSection}>
            <SearchBar 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari nama siswa atau alasan..."
            />

            <View style={styles.filterRow}>
              <FilterPill id="semua" label="Semua Waktu" isActive={timeFilter === 'semua'} onPress={setTimeFilter} />
              <FilterPill id="hari_ini" label="Hari Ini" isActive={timeFilter === 'hari_ini'} onPress={setTimeFilter} />
            </View>
          </BlurView>

          <View style={styles.listContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
            ) : (
              <FlatList
                data={filteredTickets}
                keyExtractor={(item) => item.id}
                contentContainerStyle={commonStyles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TicketCard 
                    item={item} 
                    showName={true}
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  />
                )}
                ListEmptyComponent={<Text style={commonStyles.emptyText}>Tidak ditemukan riwayat izin.</Text>}
              />
            )}
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassHighlight,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
});
