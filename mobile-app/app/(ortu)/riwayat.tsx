import { HapticFeedback } from '../../src/utils/haptics';
import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router as expoRouter, useFocusEffect } from 'expo-router';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';

export default function OrtuRiwayatScreen() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('semua'); // 'semua', 'approved_final', 'rejected', 'pending'

  const fetchData = async () => {
    try {
      const res = await api.get('/monitoring/anak');
      setTickets(res.data);
      setFilteredTickets(res.data);
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
    let result = tickets;
    
    // Filter by text
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => 
        (t.jenis_izin && t.jenis_izin.replace(/_/g, ' ').toLowerCase().includes(lowerQ)) ||
        (t.alasan && t.alasan.toLowerCase().includes(lowerQ))
      );
    }
    
    // Filter by status tab
    if (activeFilter !== 'semua') {
      if (activeFilter === 'pending') {
        result = result.filter(t => t.status === 'pending' || t.status === 'approved_by_wali');
      } else {
        result = result.filter(t => t.status === activeFilter);
      }
    }
    
    setFilteredTickets(result);
  }, [searchQuery, activeFilter, tickets]);

  const FilterPill = ({ id, label }: { id: string, label: string }) => {
    const isActive = activeFilter === id;
    return (
      <TouchableOpacity 
        style={[styles.filterPill, isActive && styles.filterPillActive]}
        onPress={() => {
          HapticFeedback.light();
          setActiveFilter(id);
        }}
      >
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar 
          showAvatar={false} 
          title="Riwayat Lengkap"
          showNotification={true} 
        />

        <View style={styles.mainContent}>
          
          <View style={styles.searchSection}>
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
    backgroundColor: COLORS.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgWhite,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SPACING.md,
    height: 48,

    marginBottom: SPACING.md,
    ...SHADOWS.softCard,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearBtn: {
    padding: SPACING.xs,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHighest,

  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.onPrimary,
  },
  
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  listContent: { paddingBottom: 100 },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
