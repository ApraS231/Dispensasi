import { HapticFeedback } from '../src/utils/haptics';
import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import api from '../src/utils/api';
import NotificationBanner from '../src/components/NotificationBanner';
import { COLORS, FONTS, SPACING, SIZES, GLASS } from '../src/utils/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ICONS } from '../src/utils/icons';
import LiquidBackground from '../src/components/LiquidBackground';
import { BlurView } from 'expo-blur';
import TopAppBar from '../src/components/TopAppBar';

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
    HapticFeedback.medium();
    try {
        await api.post('/notifications/mark-all-read');
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
        console.log('Error mark all read', e);
    }
  };

  const handlePress = async (item: any) => {
    HapticFeedback.selection();

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
    if (item.tipe === 'parent_link') {
        router.push('/(siswa)/parent-requests');
    } else if (item.tipe === 'parent_link_response') {
        router.push('/(ortu)/kelola-anak');
    } else if (item.reference_id) {
        // Semua tipe terkait tiket (chat, approved, rejected, new)
        router.push(`/ticket/${item.reference_id}`);
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
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar 
          title="Notifikasi" 
          onBack={() => router.back()} 
          showNotification={false}
          rightComponent={
            notifications.some(n => !n.is_read) ? (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={styles.readAllText}>Baca Semua</Text>
              </TouchableOpacity>
            ) : null
          }
        />

        <View style={styles.content}>
          <View style={{ height: 88 + SPACING.statusBar }} />
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
                  <MaterialCommunityIcons name="mailbox-open-outline" size={64} color={COLORS.textMuted} style={{ marginBottom: SPACING.md, opacity: 0.5 }} />
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
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
  safeArea: { flex: 1 },
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
  emptyText: {
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    fontSize: 15,
  }
});
