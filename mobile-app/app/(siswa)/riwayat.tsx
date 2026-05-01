import { HapticFeedback } from '../../src/utils/haptics';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router as expoRouter } from 'expo-router';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SiswaRiwayatScreen() {
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
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

  useEffect(() => {
    let result = tickets;
    
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
    
    setFilteredTickets(result);
  }, [searchQuery, activeFilter, timeFilter, tickets, currentMonth, currentYear]);

  const FilterPill = ({ id, label, isTime = false }: { id: string, label: string, isTime?: boolean }) => {
    const isActive = isTime ? timeFilter === id : activeFilter === id;
    return (
      <TouchableOpacity 
        style={[styles.filterPill, isActive && styles.filterPillActive]}
        onPress={() => {
          HapticFeedback.light();
          if (isTime) setTimeFilter(id); else setActiveFilter(id);
        }}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar showAvatar={false} title="Riwayat Izin" showNotification={true} />

        <View style={styles.mainContent}>
          <View style={styles.searchSection}>
            <View style={styles.summaryCard}>
              <View>
                <Text style={styles.summaryTitle}>Total Izin Bulan Ini</Text>
                <Text style={styles.summaryValue}>{thisMonthTicketsCount} Kali</Text>
              </View>
              <MaterialCommunityIcons name="calendar-month" size={32} color={COLORS.textPrimary} />
            </View>

            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput 
                style={styles.searchInput}
                placeholder="Cari izin, sakit, keperluan..."
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

            <View style={[styles.filterRow, { marginBottom: SPACING.sm }]}>
              <FilterPill id="semua" label="Semua Waktu" isTime={true} />
              <FilterPill id="bulan_ini" label="Bulan Ini" isTime={true} />
            </View>
            <View style={styles.filterRow}>
              <FilterPill id="semua" label="Semua" />
              <FilterPill id="approved_final" label="Disetujui" />
              <FilterPill id="pending" label="Proses" />
              <FilterPill id="rejected" label="Ditolak" />
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
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primaryContainer,
    padding: SPACING.md,
    borderRadius: SIZES.radiusCard,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    marginBottom: SPACING.md,
  },
  summaryTitle: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.textPrimary },
  summaryValue: { fontFamily: FONTS.heading, fontSize: 24, color: COLORS.textPrimary, marginTop: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    borderRadius: SIZES.radiusButton,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    marginBottom: SPACING.md,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  searchIcon: { fontSize: 16, marginRight: SPACING.sm, opacity: 0.5 },
  searchInput: { flex: 1, fontFamily: FONTS.body, fontSize: 14, color: COLORS.textPrimary },
  clearBtn: { padding: SPACING.xs },
  clearText: { fontSize: 14, color: COLORS.textMuted },
  filterRow: { flexDirection: 'row', gap: SPACING.sm },
  filterPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusButton,
    backgroundColor: COLORS.surfaceContainerLowest, borderWidth: 2, borderColor: '#1A1A1A',
  },
  filterPillActive: { backgroundColor: COLORS.secondaryContainer, borderColor: '#1A1A1A' },
  filterText: { fontFamily: FONTS.headingSemi, fontSize: 12, color: COLORS.textSecondary },
  filterTextActive: { color: COLORS.onSecondaryContainer },
  listContainer: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  listContent: { paddingBottom: 100 },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
