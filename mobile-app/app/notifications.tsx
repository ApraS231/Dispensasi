import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import api from '../src/utils/api';
import NotificationBanner from '../src/components/NotificationBanner';
import { COLORS, FONTS, SPACING, SIZES } from '../src/utils/theme';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      // Endpoint should fetch from user notifications table or Expo push history
      // For now, simulate with a standard API call if backend has it
      // const res = await api.get('/notifications');
      // setNotifications(res.data);
      
      // Simulating data for UI demonstration purposes
      setTimeout(() => {
        setNotifications([
          {
            id: '1',
            title: 'Izin Disetujui!',
            message: 'Izin atas nama Budi (Keperluan Keluarga) telah disetujui oleh Wali Kelas.',
            type: 'success',
            created_at: new Date().toISOString(),
            is_read: false,
          },
          {
            id: '2',
            title: 'Pengajuan Baru',
            message: 'Terdapat pengajuan dispensasi baru dari Kelas X-IPA 1 menunggu persetujuan Anda.',
            type: 'warning',
            created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hr ago
            is_read: true,
          },
          {
            id: '3',
            title: 'Izin Ditolak',
            message: 'Izin sakit Anda ditolak karena alasan kurang jelas. Silakan ajukan ulang.',
            type: 'error',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            is_read: true,
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // await api.post('/notifications/mark-read');
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handlePress = (id: string) => {
    Haptics.selectionAsync();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    // Usually route to ticket detail if related
    // router.push(`/ticket/${ticket_id}`);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifikasi</Text>
          {notifications.some(n => !n.is_read) ? (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.readAllText}>Baca Semua</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 64 }} />
          )}
        </View>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const time = new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                return (
                  <NotificationBanner 
                    title={item.title}
                    message={item.message}
                    type={item.type as any}
                    time={time}
                    isRead={item.is_read}
                    onPress={() => handlePress(item.id)}
                  />
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📭</Text>
                  <Text style={styles.emptyText}>Belum ada notifikasi saat ini.</Text>
                </View>
              }
            />
          )}
        </View>
        
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.statusBar + SPACING.sm,
    paddingBottom: SPACING.md,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  backIcon: { fontSize: 18, color: COLORS.textPrimary, fontWeight: 'bold' },
  headerTitle: {
    fontFamily: FONTS.heading,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  readAllText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: COLORS.primary,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    fontSize: 15,
  }
});
