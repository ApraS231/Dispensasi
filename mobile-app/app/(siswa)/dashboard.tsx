import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import SkeuCard from '../../src/components/SkeuCard';
import TicketCard from '../../src/components/TicketCard';
import GlassFAB from '../../src/components/GlassFAB';
import TopAppBar from '../../src/components/TopAppBar';
import LiquidBackground from '../../src/components/LiquidBackground';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import AnimatedCounter from '../../src/components/AnimatedCounter';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import LogoutButton from '../../src/components/LogoutButton';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS, GLASS } from '../../src/utils/theme';
import { commonStyles } from '../../src/utils/commonStyles';
import { BlurView } from 'expo-blur';
import { useSharedValue } from 'react-native-reanimated';

export default function SiswaDashboard() {
  const { user, logout } = useAuthStore();
  const scrollY = useSharedValue(0);

  const { data: ticketsData, isLoading, refetch } = useQuery({
    queryKey: ['dispensasi-me'],
    queryFn: async () => {
      const { data } = await api.get('/dispensasi/me');
      return data;
    }
  });

  const tickets = ticketsData || [];

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

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      {/* Spacer for Absolute TopAppBar */}
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      {/* Header Card */}
      <AnimatedEntrance delay={300} direction="down">
        <View style={styles.topCardContainer}>
          <SkeuCard style={styles.headerCard} isGlass>
            <View style={styles.headerRow}>
              <View style={styles.userInfo}>
                <Text style={styles.greeting}>Halo,</Text>
                <Text style={styles.name} numberOfLines={1}>{user?.name ?? 'Siswa'}!</Text>
                <View style={styles.kelasBadge}>
                  <Text style={styles.kelasBadgeText}>Kelas {(user as any)?.kelas?.nama_kelas || 'X'}</Text>
                </View>
              </View>
              <LogoutButton onPress={handleLogout} />
            </View>
            
            <View style={styles.statsContainer}>
              <BlurView intensity={GLASS.blurIntensity + 20} tint={GLASS.tintColor} style={[styles.badgeContainer, SHADOWS.inset]}>
                <AnimatedCounter 
                  value={tickets.length} 
                  style={styles.badgeText} 
                  delay={1000}
                />
                <Text style={styles.badgeLabel}>Izin Bulan Ini</Text>
              </BlurView>
            </View>
          </SkeuCard>
        </View>
      </AnimatedEntrance>
 
      {/* List Area Header */}
      <View style={styles.sectionHeaderContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.historyTitle}>Riwayat Izin Terbaru</Text>
          <TouchableOpacity 
            onPress={() => expoRouter.push('/(siswa)/riwayat')}
            activeOpacity={0.6}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <LiquidBackground />
      
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
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <View style={{ paddingHorizontal: SPACING.md, width: '100%' }}>
              <AnimatedEntrance delay={800 + (index * 100)} direction="up" offset={20}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    paddingBottom: SPACING.sm,
  },
  topCardContainer: {
    padding: SPACING.md,
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
    color: COLORS.textPrimary
  },
  name: { 
    fontFamily: FONTS.heading, 
    fontSize: 24, 
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  kelasBadge: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  kelasBadgeText: {
    fontFamily: FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.primary,
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
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  badgeLabel: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textPrimary,
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
    color: COLORS.textPrimary,
  },
  seeAllButton: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  seeAllText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: COLORS.primary,
  },
});

