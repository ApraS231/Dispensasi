import { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router as expoRouter } from 'expo-router';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import FilterPill from '../../src/components/FilterPill';
import SearchBar from '../../src/components/SearchBar';
import SkeuCard from '../../src/components/SkeuCard';
import { FONTS, SPACING, GLASS } from '../../src/utils/theme';
import { createCommonStyles } from '../../src/utils/commonStyles';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../src/hooks/useTheme';

export default function OrtuRiwayatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('semua');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors, shadows, isDark } = useTheme();
  const commonStyles = createCommonStyles(colors);

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    refetch 
  } = useInfiniteQuery({
    queryKey: ['ortu-dispensasi-history', selectedDate?.toISOString().split('T')[0]],
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = { page: pageParam, per_page: 10 };
      if (selectedDate) {
        params.date = selectedDate.toISOString().split('T')[0];
      }
      const { data } = await api.get('/monitoring/anak', { params });
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage || Array.isArray(lastPage)) return undefined;
      return lastPage.current_page < lastPage.last_page ? lastPage.current_page + 1 : undefined;
    },
  });

  const allTickets = data?.pages.flatMap(page => {
    if (Array.isArray(page)) return page;
    return page?.data || [];
  }) || [];

  const filteredTickets = useMemo(() => {
    let result = allTickets;
    
    if (searchQuery.trim()) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(t => 
        (t.jenis_izin && t.jenis_izin.toLowerCase().includes(lowerQ)) ||
        (t.alasan && t.alasan.toLowerCase().includes(lowerQ)) ||
        (t.siswa?.name && t.siswa.name.toLowerCase().includes(lowerQ))
      );
    }
    
    if (activeFilter !== 'semua') {
        result = result.filter(t => t.status === activeFilter);
    }
    
    return result;
  }, [searchQuery, activeFilter, allTickets]);

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={commonStyles.container}
    >
      <SafeAreaView style={commonStyles.safeArea} edges={['bottom', 'left', 'right']}>
        
        <TopAppBar showAvatar={false} title="Riwayat Izin Anak" showNotification={true} />

        <View style={commonStyles.mainContent}>
          <View style={{ height: 88 + SPACING.statusBar }} />
          <BlurView intensity={GLASS.blurIntensity + 20} tint={isDark ? 'dark' : 'light'} style={[styles.searchSection, { borderBottomColor: colors.glassHighlight }]}>
            <SearchBar 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari izin, sakit, keperluan..."
            />

            <View style={styles.filterRow}>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)}
                style={[
                  styles.datePickerBtn, 
                  { 
                    backgroundColor: selectedDate ? colors.primary : colors.surface,
                    borderColor: selectedDate ? colors.primary : colors.glassBorder
                  }
                ]}
              >
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={20} 
                  color={selectedDate ? '#FFFFFF' : colors.primary} 
                />
                <Text style={[styles.datePickerText, { color: selectedDate ? '#FFFFFF' : colors.primary }]}>
                  {selectedDate ? selectedDate.toLocaleDateString('id-ID') : 'Pilih Tanggal'}
                </Text>
              </TouchableOpacity>

              {selectedDate && (
                <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.clearDateBtn}>
                  <MaterialCommunityIcons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.filterRow, { marginTop: SPACING.sm }]}>
              <FilterPill id="semua" label="Semua Status" isActive={activeFilter === 'semua'} onPress={setActiveFilter} />
              <FilterPill id="approved_final" label="Disetujui" isActive={activeFilter === 'approved_final'} onPress={setActiveFilter} />
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
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: SPACING.xl }} />
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
                onEndReached={() => {
                  if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => 
                  isFetchingNextPage ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: SPACING.md }} />
                  ) : null
                }
                ListEmptyComponent={<Text style={commonStyles.emptyText}>Tidak ditemukan riwayat izin.</Text>}
                onRefresh={refetch}
                refreshing={isLoading}
              />
            )}
          </View>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', alignItems: 'center' },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  datePickerText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
  clearDateBtn: {
    padding: 4,
  },
  listContainer: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
});
