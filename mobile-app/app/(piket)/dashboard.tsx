import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { router as expoRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import SoftCard from '../../src/components/SoftCard';
import TicketCard from '../../src/components/TicketCard';
import MechanicalToggle from '../../src/components/MechanicalToggle';
import TopAppBar from '../../src/components/TopAppBar';
import AvatarInitials from '../../src/components/AvatarInitials';
import BouncyButton from '../../src/components/BouncyButton';
import { COLORS, FONTS, SIZES, SPACING, SHADOWS } from '../../src/utils/theme';

export default function PiketDashboard() {
  const { user, logout } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [pendingTickets, setPendingTickets] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [pendingRes, statusRes] = await Promise.all([
        api.get('/dispensasi/pending'),
        api.get('/piket/status')
      ]);
      setPendingTickets(pendingRes.data);
      setIsReady(statusRes.data.is_ready);
    } catch (e) {
      // Silently fail or handle error
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch (e) {}
    await SecureStore.deleteItemAsync('userToken');
    logout();
    expoRouter.replace('/login');
  };

  const toggleReady = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!isReady) {
        await api.post('/piket/ready');
        Alert.alert('Siap!', 'Anda sekarang dalam status READY. Tiket akan diarahkan ke Anda.');
      } else {
        await api.post('/piket/checkout');
        Alert.alert('Selesai', 'Shift piket Anda telah berakhir.');
      }
      setIsReady(!isReady);
    } catch (e) { Alert.alert('Error', 'Terjadi kesalahan server.'); }
  };

  const handleApprove = async (id: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await api.post(`/dispensasi/${id}/approve`);
      setPendingTickets(prev => prev.filter(t => t.id !== id));
    } catch (e: any) { Alert.alert('Gagal', e.response?.data?.message || 'Error'); }
  };

  const handleReject = async (id: string) => {
    if (Alert.prompt) {
      Alert.prompt('Alasan Penolakan', 'Masukkan catatan penolakan:', async (catatan) => {
        if (!catatan) return;
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await api.post(`/dispensasi/${id}/reject`, { catatan_penolakan: catatan });
          setPendingTickets(prev => prev.filter(t => t.id !== id));
        } catch (e) {}
      });
    } else {
      Alert.alert('Info', 'Gunakan fitur reject di perangkat yang mendukung prompt.');
    }
  };

  const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar 
          showAvatar={true} 
          avatarLabel={user?.name?.charAt(0)?.toUpperCase() || 'P'} 
          showNotification={true} 
        />

        <View style={styles.mainContent}>
          {/* Header Card */}
          <View style={styles.headerContainer}>
            <SoftCard style={styles.headerCard}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.greeting}>Status Piket Hari Ini</Text>
                  <Text style={styles.dateText}>{todayDate}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                  <Text style={styles.logoutText}>Keluar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.toggleContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Kehadiran</Text>
                  <Text style={[styles.toggleStatus, { color: isReady ? COLORS.primary : COLORS.textMuted }]}>
                    {isReady ? 'SEDANG BERTUGAS' : 'OFFLINE'}
                  </Text>
                </View>
                <MechanicalToggle 
                  value={isReady} 
                  onValueChange={toggleReady} 
                  labelOn="RDY" 
                  labelOff="OFF" 
                />
              </View>
            </SoftCard>
          </View>

          {/* Content Area */}
          <View style={styles.contentContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Antrean Persetujuan</Text>
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{pendingTickets.length}</Text>
              </View>
            </View>
            
            <FlatList
              data={pendingTickets}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.ticketWrapper}>
                  <View style={styles.ticketHeaderRow}>
                    <AvatarInitials name={item.siswa?.name || 'Siswa'} size={40} fontSize={16} />
                    <View style={styles.ticketMeta}>
                      <Text style={styles.ticketName}>{item.siswa?.name || 'Siswa'}</Text>
                      <Text style={styles.ticketClass}>{item.kelas?.nama_kelas || 'Kelas'}</Text>
                    </View>
                  </View>
                  
                  <TicketCard 
                    item={item} 
                    onPress={() => expoRouter.push(`/ticket/${item.id}`)}
                  />
                  
                  <View style={styles.actionRow}>
                    <BouncyButton 
                      title="Tolak" 
                      variant="danger" 
                      onPress={() => handleReject(item.id)} 
                      style={styles.actionBtn}
                    />
                    <BouncyButton 
                      title="Setujui" 
                      onPress={() => handleApprove(item.id)} 
                      style={styles.actionBtn}
                    />
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada antrean persetujuan.</Text>}
            />
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  mainContent: { flex: 1 },
  headerContainer: {
    padding: SPACING.md,
    zIndex: 10,
  },
  headerCard: {
    padding: SPACING.lg,
  },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: SPACING.xl 
  },
  greeting: { fontFamily: FONTS.headingSemi, fontSize: 18, color: COLORS.textPrimary },
  dateText: { fontFamily: FONTS.bodyMedium, fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.errorBg,
    borderRadius: SIZES.radius,
  },
  logoutText: { fontFamily: FONTS.headingSemi, color: COLORS.error, fontSize: 12 },
  
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: SPACING.md,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  toggleLabel: { fontFamily: FONTS.bodyMedium, fontSize: 12, color: COLORS.textSecondary },
  toggleStatus: { fontFamily: FONTS.heading, fontSize: 16, marginTop: 2 },
  
  contentContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: SPACING.md 
  },
  sectionTitle: { fontFamily: FONTS.headingSemi, fontSize: 18, color: COLORS.textPrimary },
  badgeCount: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: SPACING.sm,
  },
  badgeCountText: {
    fontFamily: FONTS.heading,
    fontSize: 12,
    color: COLORS.inverseSurface,
  },
  
  listContent: { paddingBottom: 100 },
  ticketWrapper: {
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: SIZES.radiusXl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.softCard,
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ticketMeta: {
    marginLeft: SPACING.sm,
  },
  ticketName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  ticketClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
    height: 48,
  },
  emptyText: { fontFamily: FONTS.body, textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 14 },
});
