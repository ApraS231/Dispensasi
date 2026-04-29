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
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (e) {
      console.log('Error fetching notifications', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAllAsRead = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
        await api.post('/notifications/mark-all-read');
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
        console.log('Error mark all read', e);
    }
  };

  const handlePress = async (item: any) => {
    Haptics.selectionAsync();

    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));

    // Mark as read in backend if not read yet
    if (!item.is_read) {
        try {
            await api.put(`/notifications/${item.id}/read`);
        } catch(e) {
            console.log('Error read notif', e);
        }
    }

    // Deep link based on type
    if (item.reference_id) {
        if (item.tipe === 'chat') {
            router.push(`/chat/${item.reference_id}`);
        } else {
            router.push(`/ticket/${item.reference_id}`);
        }
    }
  };

  const mapType = (tipe: string) => {
      if (['new_ticket', 'ticket_forwarded'].includes(tipe)) return 'warning';
      if (['ticket_approved', 'qr_validated'].includes(tipe)) return 'success';
      if (['ticket_rejected'].includes(tipe)) return 'error';
      return 'info';
  }

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
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onRefresh={onRefresh}
              refreshing={refreshing}
              renderItem={({ item }) => {
                const time = new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                return (
                  <NotificationBanner 
                    title={item.title}
                    message={item.body}
                    type={mapType(item.tipe)}
                    time={time}
                    isRead={item.is_read}
                    onPress={() => handlePress(item)}
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
