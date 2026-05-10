import { HapticFeedback } from '../../src/utils/haptics';
import { useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import GlassFAB from '../../src/components/GlassFAB';

export default function SiswaRiwayatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('semua');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    refetch 
  } = useInfiniteQuery({
    queryKey: ['dispensasi-me', selectedDate?.toISOString().split('T')[0]],
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = { page: pageParam, per_page: 10 };
      if (selectedDate) {
        params.date = selectedDate.toISOString().split('T')[0];
      }
      const { data } = await api.get('/dispensasi/me', { params });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined,
  });

  const allTickets = data?.pages.flatMap(page => page.data) || [];

  const filteredTickets = useMemo(() => {
    let result = allTickets;
    
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
    
    return result;
  }, [searchQuery, activeFilter, allTickets]);

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const clearDate = () => {
    setSelectedDate(null);
  };

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      <TopAppBar showAvatar={false} title="Riwayat Izin" showNotification={true} />

      <View style={commonStyles.mainContent}>
        <View style={{ height: 88 + SPACING.statusBar }} />
        
        <BlurView intensity={GLASS.blurIntensity + 20} tint={GLASS.tintColor} style={styles.searchSection}>
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari izin, sakit, keperluan..."
          />

          <View style={styles.filterRow}>
            <TouchableOpacity 
              onPress={() => setShowDatePicker(true)}
              style={[styles.datePickerBtn, selectedDate && styles.datePickerBtnActive]}
            >
              <MaterialCommunityIcons 
                name="calendar" 
                size={20} 
                color={selectedDate ? '#FFFFFF' : COLORS.primary} 
              />
              <Text style={[styles.datePickerText, selectedDate && { color: '#FFFFFF' }]}>
                {selectedDate ? selectedDate.toLocaleDateString('id-ID') : 'Pilih Tanggal'}
              </Text>
            </TouchableOpacity>

            {selectedDate && (
              <TouchableOpacity onPress={clearDate} style={styles.clearDateBtn}>
                <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.filterRow, { marginTop: SPACING.sm }]}>
            <FilterPill id="semua" label="Semua Status" isActive={activeFilter === 'semua'} onPress={setActiveFilter} />
            <FilterPill id="approved_final" label="Disetujui" isActive={activeFilter === 'approved_final'} onPress={setActiveFilter} />
            <FilterPill id="pending" label="Proses" isActive={activeFilter === 'pending'} onPress={setActiveFilter} />
            <FilterPill id="rejected" label="Ditolak" isActive={activeFilter === 'rejected'} onPress={setActiveFilter} />
          </View>
        </BlurView>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <View style={styles.listContainer}>
          {isLoading ? (
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
              onEndReached={() => {
                if (hasNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() => 
                isFetchingNextPage ? (
                  <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: SPACING.md }} />
                ) : null
              }
              ListEmptyComponent={<Text style={commonStyles.emptyText}>Tidak ditemukan riwayat izin.</Text>}
              onRefresh={refetch}
              refreshing={isLoading}
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
  filterRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', alignItems: 'center' },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    gap: 8,
  },
  datePickerBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  datePickerText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.primary,
  },
  clearDateBtn: {
    padding: 4,
  },
  listContainer: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
});
