import { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router as expoRouter } from 'expo-router';
import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../../src/utils/api';
import TopAppBar from '../../src/components/TopAppBar';
import TicketCard from '../../src/components/TicketCard';
import SearchBar from '../../src/components/SearchBar';
import { FONTS, SPACING, GLASS } from '../../src/utils/theme';
import { createCommonStyles } from '../../src/utils/commonStyles';
import { useTheme } from '../../src/hooks/useTheme';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function WaliHistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors, isDark } = useTheme();
  const commonStyles = createCommonStyles(colors);

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    refetch 
  } = useInfiniteQuery({
    queryKey: ['dispensasi-wali-history', selectedDate?.toISOString().split('T')[0]],
    queryFn: async ({ pageParam = 1 }) => {
      const params: any = { page: pageParam, per_page: 10 };
      if (selectedDate) {
        params.date = selectedDate.toISOString().split('T')[0];
      }
      const { data } = await api.get('/dispensasi', { params });
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
        (t.siswa?.name && t.siswa.name.toLowerCase().includes(lowerQ)) ||
        (t.jenis_izin && t.jenis_izin.toLowerCase().includes(lowerQ)) ||
        (t.alasan && t.alasan.toLowerCase().includes(lowerQ))
      );
    }
    
    return result;
  }, [searchQuery, allTickets]);

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
        
        <TopAppBar showAvatar={false} title="Riwayat Izin Kelas" showNotification={true} />

        <View style={commonStyles.mainContent}>
          <View style={{ height: 88 + SPACING.statusBar }} />
          <BlurView intensity={GLASS.blurIntensity + 20} tint={isDark ? 'dark' : 'light'} style={[styles.searchSection, { borderBottomColor: colors.glassHighlight }]}>
            <SearchBar 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari nama siswa atau alasan..."
            />

            <View style={styles.filterRow}>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)}
                style={[
                  styles.datePickerBtn, 
                  { 
                    backgroundColor: selectedDate ? colors.primary : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                    borderColor: selectedDate ? colors.primary : colors.primary + '30'
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
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 21,
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
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
});
