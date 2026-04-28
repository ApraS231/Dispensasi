import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Alert, KeyboardAvoidingView, Platform, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { supabase } from '../../src/utils/supabaseClient';
import { useAuthStore } from '../../src/stores/authStore';
import TopAppBar from '../../src/components/TopAppBar';
import SoftCard from '../../src/components/SoftCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import BouncyButton from '../../src/components/BouncyButton';
import PillBadge from '../../src/components/PillBadge';
import ChatBubble from '../../src/components/ChatBubble';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS } from '../../src/utils/theme';

interface ChatMessage {
  id: string;
  sender_id: string;
  pesan: string;
  sender?: { name: string };
  created_at: string;
  isPending?: boolean;
  isFailed?: boolean;
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  // Pagination state
  const nextCursor = useRef<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/dispensasi/${id}`);
      setTicket(res.data);
    } catch (e) {}
  };

  const fetchHistory = async (isLoadMore = false) => {
    if (isLoadMore && (!nextCursor.current || isLoadingMore)) return;
    if (isLoadMore) setIsLoadingMore(true);
    
    try {
      const url = isLoadMore 
        ? `/dispensasi/${id}/chats?cursor=${nextCursor.current}` 
        : `/dispensasi/${id}/chats`;
        
      const res = await api.get(url);
      
      if (isLoadMore) {
        setMessages(prev => [...prev, ...res.data.data]);
      } else {
        setMessages(res.data.data);
      }
      nextCursor.current = res.data.next_cursor;
    } catch (e) {
    } finally {
      if (isLoadMore) setIsLoadingMore(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
    fetchHistory();

    const channel = supabase
      .channel(`chat_room_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_chats',
          filter: `dispensasi_ticket_id=eq.${id}`,
        },
        (payload: any) => {
          if (payload.new.sender_id !== user?.id) {
            // Fetch just the new message to get the sender relations
            api.get(`/dispensasi/${id}/chats?limit=1`).then(res => {
              if (res.data?.data?.length > 0) {
                const newest = res.data.data[0];
                setMessages(prev => {
                  if (prev.find(m => m.id === newest.id)) return prev;
                  return [newest, ...prev];
                });
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleAction = async (action: 'approve_wali' | 'approve_final' | 'reject') => {
    setActionLoading(true);
    try {
      if (action !== 'reject') {
        await api.post(`/dispensasi/${id}/${action}`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Berhasil', 'Tiket telah diperbarui.');
      } else {
        Alert.prompt('Catatan Penolakan', 'Berikan alasan penolakan:', async (catatan) => {
          if (!catatan) return;
          await api.post(`/dispensasi/${id}/reject`, { catatan_penolakan: catatan });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Berhasil', 'Tiket telah ditolak.');
          fetchTicket();
        });
        return;
      }
      fetchTicket();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setActionLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender_id: user!.id,
      pesan: newMsg,
      created_at: new Date().toISOString(),
      isPending: true
    };
    
    setMessages(prev => [optimisticMsg, ...prev]);
    setNewMsg('');

    try {
      const res = await api.post(`/dispensasi/${id}/chats`, { pesan: optimisticMsg.pesan });
      setMessages(prev => prev.map(msg => msg.id === tempId ? res.data.data : msg));
    } catch (e) {
      setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, isFailed: true, isPending: false } : msg));
    }
  };

  const retryMessage = async (msg: ChatMessage) => {
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isFailed: false, isPending: true } : m));
    try {
      const res = await api.post(`/dispensasi/${id}/chats`, { pesan: msg.pesan });
      setMessages(prev => prev.map(m => m.id === msg.id ? res.data.data : m));
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isFailed: true, isPending: false } : m));
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!ticket) return <View style={styles.center}><Text>Tiket tidak ditemukan</Text></View>;

  const userRole = user?.role;
  const student = ticket.student || ticket.siswa;
  const kelas = ticket.kelas?.nama_kelas;

  const ListFooter = () => (
    <View style={styles.ticketDetailsContainer}>
      <View style={styles.scrollContent}>
          <SoftCard style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.studentInfo}>
                <AvatarInitials name={student?.name || '?'} size={48} fontSize={20} />
                <View style={styles.studentText}>
                  <Text style={styles.studentName}>{student?.name}</Text>
                  <Text style={styles.studentClass}>Kelas {kelas}</Text>
                </View>
              </View>
              <PillBadge status={ticket.status} />
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.label}>ALASAN IZIN</Text>
              <Text style={styles.value}>{ticket.alasan}</Text>
            </View>

            {ticket.lampiran_bukti && (
              <View style={styles.attachmentPreview}>
                <MaterialCommunityIcons name="paperclip" size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.attachmentText}>Ada Lampiran Foto</Text>
              </View>
            )}

            {(userRole === 'wali_kelas' && ticket.status === 'pending') && (
              <View style={styles.actionRow}>
                <BouncyButton 
                  title="Tolak" 
                  variant="danger" 
                  onPress={() => handleAction('reject')} 
                  style={styles.actionBtn}
                />
                <BouncyButton 
                  title="Setujui" 
                  onPress={() => handleAction('approve_wali')} 
                  style={styles.actionBtn}
                />
              </View>
            )}

            {(userRole === 'guru_piket' && ticket.status === 'approved_by_wali') && (
              <View style={styles.actionRow}>
                <BouncyButton 
                  title="Tolak" 
                  variant="danger" 
                  onPress={() => handleAction('reject')} 
                  style={styles.actionBtn}
                />
                <BouncyButton 
                  title="Cetak & Setujui" 
                  onPress={() => handleAction('approve_final')} 
                  style={styles.actionBtn}
                />
              </View>
            )}
            
            {ticket.status === 'approved_final' && user?.role === 'siswa' && (
              <BouncyButton 
                title="Lihat QR Code" 
                variant="tonal"
                onPress={() => router.push(`/(siswa)/qr/${id}`)}
                style={styles.qrBtn}
              />
            )}
          </SoftCard>
      </View>
      <Text style={styles.chatTitle}>Diskusi Terkait Tiket</Text>
      {isLoadingMore && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 8 }} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        
        <TopAppBar title="Detail Dispensasi" onBack={() => router.back()} />

        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            inverted={true}
            onEndReached={() => fetchHistory(true)}
            onEndReachedThreshold={0.5}
            ListFooterComponent={ListFooter}
            renderItem={({ item }) => {
              const time = new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              return (
                <View style={styles.bubbleRow}>
                  {! (item.sender_id === user?.id) && <Text style={styles.senderName}>{item.sender?.name ?? 'Sistem'}</Text>}
                  <ChatBubble 
                    message={item.pesan} 
                    time={time} 
                    isMe={item.sender_id === user?.id} 
                    isPending={item.isPending}
                    isFailed={item.isFailed}
                    onRetry={() => retryMessage(item)}
                  />
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyChatText}>Belum ada diskusi untuk tiket ini.</Text>}
          />

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder="Kirim pesan terkait tiket ini..." 
                placeholderTextColor={COLORS.textMuted}
                value={newMsg} 
                onChangeText={setNewMsg}
                multiline 
              />
              <TouchableOpacity 
                style={[styles.sendBtn, { right: 4, bottom: 4 }]} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  sendMessage();
                }}
              >
                <MaterialCommunityIcons name="send" size={20} color={COLORS.bgWhite} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surfaceContainerLowest },
  safeArea: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  ticketDetailsContainer: {
    marginBottom: SPACING.md,
  },
  card: {
    padding: SPACING.lg,
    backgroundColor: COLORS.bgWhite,
    borderRadius: SIZES.radiusXl,
    ...SHADOWS.softCard,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentText: {
    marginLeft: SPACING.sm,
  },
  studentName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  studentClass: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    marginVertical: SPACING.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    opacity: 0.5,
  },
  infoRow: {
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.labelCaps,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  value: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    padding: SPACING.sm,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    marginBottom: SPACING.md,
  },
  attachmentText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
  },
  qrBtn: {
    marginTop: SPACING.lg,
  },
  chatTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    textAlign: 'center',
  },
  bubbleRow: {
    marginBottom: SPACING.xs,
  },
  senderName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
    marginLeft: 16,
  },
  emptyChatText: {
    fontFamily: FONTS.body,
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: SPACING.xl,
    transform: [{ scaleY: -1 }], 
  },
  inputContainer: {
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? SPACING.md : SPACING.lg,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderTopWidth: 1,
    borderTopColor: COLORS.outlineVariant,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.bgWhite,
    borderRadius: SIZES.radiusXl,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: SPACING.md,
    paddingTop: 14,
    paddingBottom: 14,
    paddingRight: 48,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    ...SHADOWS.softCard,
  },
});
