import { HapticFeedback } from '../../src/utils/haptics';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router as expoRouter } from 'expo-router';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import FilterPill from '../../src/components/FilterPill';
import SearchBar from '../../src/components/SearchBar';
import SkeuCard from '../../src/components/SkeuCard';
import { COLORS, FONTS, SIZES, SPACING, GLASS } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LiquidBackground from '../../src/components/LiquidBackground';
import { BlurView } from 'expo-blur';

import GlassFAB from '../../src/components/GlassFAB';

export default function SiswaRiwayatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('semua');
  const [timeFilter, setTimeFilter] = useState('semua');

  const { data: ticketsData, isLoading: loading } = useQuery({
    queryKey: ['dispensasi-me'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/me');
      return data;
    }
  });

  const tickets = ticketsData || [];

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthTicketsCount = tickets.filter((t: any) => {
    const d = new Date(t.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const filteredTickets = useMemo(() => {
    let result = ticketsData || [];
    
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => 
        (t.jenis_izin && t.jenis_izin.replace(/_/g, ' ').toLowerCase().includes(lowerQ)) ||
        (t.alasan && t.alasan.toLowerCase().includes(lowerQ))
      );
    }
    
    if (activeFilter !== 'semua') {
      if (activeFilter === 'pending') {
        result = result.filter(t => t.status === 'pending' || t.status === 'approved_by_wali');
      } else {
        result = result.filter(t => t.status === activeFilter);
      }
    }

    if (timeFilter === 'bulan_ini') {
      result = result.filter(t => {
        const d = new Date(t.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }
    
    return result;
  }, [searchQuery, activeFilter, timeFilter, ticketsData, currentMonth, currentYear]);

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      <TopAppBar showAvatar={false} title="Riwayat Izin" showNotification={true} />

      <View style={commonStyles.mainContent}>
        <View style={{ height: 88 + SPACING.statusBar }} />
        <BlurView intensity={GLASS.blurIntensity + 20} tint={GLASS.tintColor} style={styles.searchSection}>
          <SkeuCard style={styles.summaryCard} isGlass>
            <View>
              <Text style={styles.summaryTitle}>Total Izin Bulan Ini</Text>
              <Text style={styles.summaryValue}>{thisMonthTicketsCount} Kali</Text>
            </View>
            <MaterialCommunityIcons name="calendar-month" size={32} color={COLORS.textPrimary} />
          </SkeuCard>

          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari izin, sakit, keperluan..."
          />

          <View style={[styles.filterRow, { marginBottom: SPACING.sm }]}>
            <FilterPill id="semua" label="Semua Waktu" isActive={timeFilter === 'semua'} onPress={setTimeFilter} />
            <FilterPill id="bulan_ini" label="Bulan Ini" isActive={timeFilter === 'bulan_ini'} onPress={setTimeFilter} />
          </View>
          <View style={styles.filterRow}>
            <FilterPill id="semua" label="Semua" isActive={activeFilter === 'semua'} onPress={setActiveFilter} />
            <FilterPill id="approved_final" label="Disetujui" isActive={activeFilter === 'approved_final'} onPress={setActiveFilter} />
            <FilterPill id="pending" label="Proses" isActive={activeFilter === 'pending'} onPress={setActiveFilter} />
            <FilterPill id="rejected" label="Ditolak" isActive={activeFilter === 'rejected'} onPress={setActiveFilter} />
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
                  onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                />
              )}
              ListEmptyComponent={<Text style={commonStyles.emptyText}>Tidak ditemukan riwayat izin.</Text>}
            />
          )}
        </View>
      </View>

      <GlassFAB 
        onPress={() => {
          HapticFeedback.light();
          expoRouter.push('/(siswa)/pengajuan');
        }}
        bottom={110}
      />
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
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    marginVertical: 0,
    marginBottom: SPACING.md,
  },
  summaryTitle: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.textPrimary },
  summaryValue: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.textPrimary, marginTop: 4 },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  listContainer: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
});
