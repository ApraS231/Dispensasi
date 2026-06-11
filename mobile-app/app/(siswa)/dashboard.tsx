import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import SkeuCard from '../../src/components/SkeuCard';
import TicketCard from '../../src/components/TicketCard';
import GlassFAB from '../../src/components/GlassFAB';
import TopAppBar from '../../src/components/TopAppBar';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import AnimatedCounter from '../../src/components/AnimatedCounter';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import LogoutButton from '../../src/components/LogoutButton';
import { FONTS, SIZES, SPACING, GLASS } from '../../src/utils/theme';
import { createCommonStyles } from '../../src/utils/commonStyles';
import { useTheme } from '../../src/hooks/useTheme';
import { BlurView } from 'expo-blur';
import { useSharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SiswaDashboard() {
  const { user, logout } = useAuthStore();
  const scrollY = useSharedValue(0);
  const { colors, isDark, shadows } = useTheme();
  const commonStyles = createCommonStyles(colors);

  const { data: ticketsData, isLoading, refetch } = useQuery({
    queryKey: ['dispensasi-me'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/me');
      return Array.isArray(data) ? data : (data?.data || []);
    }
  });

  const tickets = Array.isArray(ticketsData) ? ticketsData : (ticketsData as any)?.data || [];

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    expoRouter.replace('/login');
  };

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const MemoizedHeader = useMemo(() => (
    <View style={styles.headerWrapper}>
      {/* Spacer for Absolute TopAppBar */}
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      {/* Header Card */}
      <AnimatedEntrance delay={300} direction="down">
        <View style={styles.topCardContainer}>
          {/* Header Background Blobs */}
          <View style={styles.headerBlobContainer} pointerEvents="none">
            <View style={[styles.headerBlob, { backgroundColor: colors.primary, top: -20, left: -20 }]} />
            <View style={[styles.headerBlob, { backgroundColor: colors.secondary, bottom: -40, right: -20 }]} />
          </View>
          <SkeuCard style={styles.headerCard} isGlass>
            <View style={styles.headerRow}>
              <View style={styles.userInfo}>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>Halo,</Text>
                <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{user?.name ?? 'Siswa'}!</Text>
                <View style={[styles.kelasBadge, { backgroundColor: colors.primaryContainer, borderColor: colors.glassHighlight }]}>
                  <Text style={[styles.kelasBadgeText, { color: isDark ? '#7BBDE8' : colors.primary }]}>Kelas {(user as any)?.kelas?.nama_kelas || 'X'}</Text>
                </View>
              </View>
              <LogoutButton onPress={handleLogout} />
            </View>
            
            <View style={styles.statsContainer}>
              <BlurView intensity={GLASS.blurIntensity + 20} tint={GLASS.tintColor} style={[styles.badgeContainer, shadows.inset]}>
                <AnimatedCounter 
                  value={tickets.length} 
                  style={[styles.badgeText, { color: colors.textPrimary }]} 
                  delay={1000}
                />
                <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>Izin Bulan Ini</Text>
              </BlurView>
            </View>
          </SkeuCard>
        </View>
      </AnimatedEntrance>
 
      {/* List Area Header */}
      <View style={styles.sectionHeaderContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Riwayat Izin Terbaru</Text>
          <TouchableOpacity 
            onPress={() => expoRouter.push('/(siswa)/riwayat')}
            activeOpacity={0.6}
            style={[styles.seeAllButton, { backgroundColor: colors.primaryContainer, borderColor: colors.glassHighlight }]}
          >
            <Text style={[styles.seeAllText, { color: isDark ? '#7BBDE8' : colors.primary }]}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [user, tickets.length, colors, isDark, shadows]);

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={commonStyles.container}
    >
      <SafeAreaView style={commonStyles.safeArea} edges={['bottom', 'left', 'right']}>
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'S'} 
          showNotification={true} 
          scrollY={scrollY}
        />

        <View style={{ flex: 1, width: '100%' }}>
        <RefreshableFlatList
          data={tickets.slice(0, 5)} 
          keyExtractor={(item) => item.id}
          contentContainerStyle={[commonStyles.listContent, { width: '100%' }]}
          showsVerticalScrollIndicator={false}
          persistentScrollbar={false}
          overScrollMode="never"
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollY={scrollY}
          ListHeaderComponent={MemoizedHeader}
          renderItem={({ item, index }) => (
            <View style={{ paddingHorizontal: SPACING.md, width: '100%' }}>
              <AnimatedEntrance delay={index < 5 ? 800 + (index * 100) : 0} direction="up" offset={20}>
                <TicketCard 
                  item={item} 
                  onPress={() => expoRouter.push(`/ticket/${item.id}`)} 
                />
              </AnimatedEntrance>
            </View>
          )}
          ListEmptyComponent={<Text style={commonStyles.emptyText}>Belum ada pengajuan izin.</Text>}
        />
      </View>

        <GlassFAB 
          onPress={() => expoRouter.push('/(siswa)/pengajuan')} 
          style={styles.fabPosition}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    paddingBottom: SPACING.sm,
  },
  topCardContainer: {
    padding: SPACING.md,
    position: 'relative',
  },
  headerBlobContainer: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    bottom: SPACING.md,
    overflow: 'hidden',
    borderRadius: SIZES.radiusCard,
    opacity: 0.1,
  },
  headerBlob: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  fabPosition: {
    bottom: 110,
    right: 24,
  },
  headerCard: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  userInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  greeting: { 
    fontFamily: FONTS.bodyMedium, 
    fontSize: 16, 
  },
  name: { 
    fontFamily: FONTS.heading, 
    fontSize: 24, 
    marginTop: 2,
  },
  kelasBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  kelasBadgeText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  statsContainer: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radiusButton,
    overflow: 'hidden',
  },
  badgeText: { 
    fontFamily: FONTS.heading, 
    fontSize: 20, 
    marginRight: SPACING.sm,
  },
  badgeLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
  },
  sectionHeaderContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 18,
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
  },
  seeAllText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
  },
});

