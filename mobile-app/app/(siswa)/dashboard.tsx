import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { router as expoRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import SoftCard from '../../src/components/SoftCard';
import TicketCard from '../../src/components/TicketCard';
import GlassFAB from '../../src/components/GlassFAB';
import TopAppBar from '../../src/components/TopAppBar';
import { COLORS, FONTS, SIZES, SPACING } from '../../src/utils/theme';

export default function SiswaDashboard() {
  const { user, logout } = useAuthStore();
  const { data: ticketsData, isLoading } = useQuery({
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'S'} 
          showNotification={true} 
        />

        <View style={styles.mainContent}>
          {/* Header Card */}
          <View style={styles.headerContainer}>
            <SoftCard style={styles.headerCard}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.greeting}>Halo,</Text>
                  <Text style={styles.name}>{user?.name ?? 'Siswa'}!</Text>
                  <Text style={styles.kelasBadge}>Kelas {(user as any)?.kelas?.nama_kelas || 'X'}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                  <Text style={styles.logoutText}>Keluar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.statsContainer}>
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{tickets.length}</Text>
                  <Text style={styles.badgeLabel}>Izin Bulan Ini</Text>
                </View>
              </View>
            </SoftCard>
          </View>

          {/* List Area */}
          <View style={styles.listContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Riwayat Izin Terbaru</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={tickets.slice(0, 5)} // only show 5 recent
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TicketCard 
                  item={item} 
                  onPress={() => expoRouter.push(`/ticket/${item.id}`)} 
                />
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Belum ada pengajuan izin.</Text>}
            />
          </View>
        </View>

        <GlassFAB onPress={() => expoRouter.push('/(siswa)/pengajuan')} />

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  safeArea: { flex: 1 },
  mainContent: {
    flex: 1,
  },
  headerContainer: {
    padding: SPACING.md,
    zIndex: 10,
  },
  headerCard: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primaryContainer, // Vibrant yellow
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
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
    fontFamily: FONTS.labelCaps,
    fontSize: 11,
    color: COLORS.bgWhite,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    marginTop: SPACING.xs,
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radiusButton,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoutText: { 
    fontFamily: FONTS.headingSemi, 
    color: COLORS.inverseOnSurface,
    fontSize: 12 
  },
  statsContainer: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SIZES.radiusButton,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
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
  
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  sectionTitle: { 
    fontFamily: FONTS.headingSemi, 
    fontSize: 18, 
    color: COLORS.textPrimary 
  },
  seeAllText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  listContent: { 
    paddingBottom: 100 
  },
  emptyText: { 
    fontFamily: FONTS.body, 
    textAlign: 'center', 
    color: COLORS.textMuted, 
    marginTop: SPACING.xl, 
    fontSize: 14 
  },
});
