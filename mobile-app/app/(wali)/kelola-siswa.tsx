import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router as expoRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';
import TopAppBar from '../../src/components/TopAppBar';
import SkeuCard from '../../src/components/SkeuCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import SearchBar from '../../src/components/SearchBar';
import PillBadge from '../../src/components/PillBadge';
import LiquidBackground from '../../src/components/LiquidBackground';
import AnimatedEntrance from '../../src/components/AnimatedEntrance';
import RefreshableFlatList from '../../src/components/RefreshableFlatList';
import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

export default function KelolaSiswaScreen() {
  const scrollY = useSharedValue(0);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['wali-siswa'],
    queryFn: async () => {
      const { data } = await api.get('/wali/siswa');
      return data;
    }
  });

  const students = data?.siswa || [];
  const className = data?.kelas || '-';

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const lowerQ = searchQuery.toLowerCase();
    return students.filter((s: any) => 
      s.name.toLowerCase().includes(lowerQ) || 
      s.nis.includes(lowerQ)
    );
  }, [students, searchQuery]);

  const stats = useMemo(() => {
    const total = students.length;
    const connected = students.filter((s: any) => s.has_parent).length;
    return { total, connected };
  }, [students]);

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={{ height: 88 + SPACING.statusBar }} />
      
      <AnimatedEntrance delay={100} direction="up">
        <SkeuCard isGlass style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Siswa</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.connected}</Text>
            <Text style={styles.statLabel}>Terhubung Ortu</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.textMuted }]}>{className}</Text>
            <Text style={styles.statLabel}>Kelas</Text>
          </View>
        </SkeuCard>
      </AnimatedEntrance>

      <AnimatedEntrance delay={200} direction="up">
        <View style={styles.searchSection}>
          <SearchBar 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari nama atau NIS..."
          />
        </View>
      </AnimatedEntrance>
    </View>
  );

  const renderItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.cardWrapper}>
      <AnimatedEntrance delay={300 + index * 50} direction="up">
        <SkeuCard isGlass style={styles.studentCard}>
          <AvatarInitials name={item.name} size={44} />
          <View style={styles.itemMeta}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemSub}>NIS: {item.nis}</Text>
            {item.has_parent && (
              <Text style={styles.parentName}>
                <MaterialCommunityIcons name="account-heart" size={12} color={COLORS.primary} /> {item.parent_name}
              </Text>
            )}
          </View>
          <PillBadge status={item.has_parent ? 'approved_final' : 'pending'} />
        </SkeuCard>
      </AnimatedEntrance>
    </View>
  );

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        <TopAppBar 
          title="Data Siswa Kelas" 
          onBack={() => expoRouter.back()} 
          scrollY={scrollY}
        />

        <RefreshableFlatList
          data={filteredStudents}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isLoading}
          scrollY={scrollY}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="account-search-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>Tidak ada data siswa ditemukan.</Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
  safeArea: { flex: 1 },
  listContent: { paddingBottom: SPACING.xl },
  headerContent: { paddingHorizontal: SPACING.md },
  
  statsCard: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderRadius: SIZES.radiusCard,
    marginBottom: SPACING.md,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: FONTS.heading,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.glassHighlight,
  },
  
  searchSection: {
    marginBottom: SPACING.md,
  },
  
  cardWrapper: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: SIZES.radiusCard,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
  },
  itemMeta: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontFamily: FONTS.heading,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  itemSub: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  parentName: {
    fontFamily: FONTS.body,
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 4,
  },
  
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 8,
  }
});
