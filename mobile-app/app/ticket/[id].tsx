import { HapticFeedback } from '../../src/utils/haptics';
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Alert, KeyboardAvoidingView, Platform, TextInput, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../src/utils/api';
import { supabase } from '../../src/utils/supabaseClient';
import { useAuthStore } from '../../src/stores/authStore';
import { useApproveTicket, useRejectTicket } from '../../src/hooks/useDispensasiQueries';
import TopAppBar from '../../src/components/TopAppBar';
import SkeuCard from '../../src/components/SkeuCard';
import AvatarInitials from '../../src/components/AvatarInitials';
import BouncyButton from '../../src/components/BouncyButton';
import RejectModal from '../../src/components/RejectModal';
import PillBadge from '../../src/components/PillBadge';
import ChatBubble from '../../src/components/ChatBubble';
import LiquidBackground from '../../src/components/LiquidBackground';
import TicketCard from '../../src/components/TicketCard';
import { COLORS, FONTS, SPACING, SIZES, SHADOWS, GLASS } from '../../src/utils/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatMessage {
  id: string;
  sender_id: string;
  pesan: string;
  sender?: { name: string; profile_photo_url?: string };
  created_at: string;
  isPending?: boolean;
  isFailed?: boolean;
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: ticket, isLoading: loading, refetch: refetchTicket } = useQuery({
    queryKey: ['dispensasi', id],
    queryFn: async () => {
      const { data } = await api.get(`/dispensasi/${id}`);
      return data;
    }
  });

  const approveMutation = useApproveTicket();
  const rejectMutation = useRejectTicket();

  const [actionLoading, setActionLoading] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  // Pagination state
  const nextCursor = useRef<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
    }
  };

  useEffect(() => {
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
            api.get(`/dispensasi/${id}/chats?limit=1`).then(res => {
              if (res.data?.data?.length > 0) {
                const newest = res.data.data[0];
                setMessages(prev => [newest, ...prev]);
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

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    
    const tempId = Date.now().toString();
    const pendingMsg: ChatMessage = {
      id: tempId,
      sender_id: user?.id || '',
      pesan: newMsg,
      created_at: new Date().toISOString(),
      isPending: true
    };
    
    setMessages(prev => [pendingMsg, ...prev]);
    setNewMsg('');
    
    try {
      await api.post(`/dispensasi/${id}/chats`, { pesan: pendingMsg.pesan });
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isPending: false } : m));
    } catch (e) {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, isPending: false, isFailed: true } : m));
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      HapticFeedback.success();
      await approveMutation.mutateAsync(id);
      Alert.alert('Berhasil', 'Izin telah disetujui.');
      refetchTicket();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (catatan: string) => {
    setIsRejecting(false);
    setActionLoading(true);
    rejectMutation.mutate({ id, catatan }, {
      onSuccess: () => {
        HapticFeedback.success();
        Alert.alert('Berhasil', 'Izin telah ditolak.');
        refetchTicket();
      },
      onSettled: () => setActionLoading(false)
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isExpired = ticket?.created_at 
    ? (Date.now() - new Date(ticket.created_at).getTime()) > 12 * 60 * 60 * 1000 
    : false;

  const ListFooter = () => {
    if (!ticket) return null;
    
    return (
      <View style={styles.headerContent}>
        <View style={{ height: 88 + SPACING.statusBar }} />
        
        {/* Main Ticket Info */}
        <SkeuCard isGlass style={styles.ticketCard}>
          <TicketCard item={ticket} />
          
          {/* Detail Informasi */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-start" size={16} color={COLORS.primary} />
              <View>
                <Text style={styles.infoLabel}>Mulai</Text>
                <Text style={styles.infoValue}>{new Date(ticket.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-end" size={16} color={COLORS.primary} />
              <View>
                <Text style={styles.infoLabel}>Selesai</Text>
                <Text style={styles.infoValue}>{new Date(ticket.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="account-tie" size={16} color={COLORS.primary} />
              <View>
                <Text style={styles.infoLabel}>Wali Kelas</Text>
                <Text style={styles.infoValue}>{ticket.wali_kelas?.name || '-'}</Text>
              </View>
            </View>
            {ticket.guru_piket && (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="shield-account" size={16} color={COLORS.primary} />
                <View>
                  <Text style={styles.infoLabel}>Guru Piket</Text>
                  <Text style={styles.infoValue}>{ticket.guru_piket?.name || '-'}</Text>
                </View>
              </View>
            )}
          </View>
          
          {ticket.lampiran_path && (
            <SkeuCard isGlass style={styles.attachmentCard}>
              <Text style={styles.attachmentText}>Lampiran Bukti:</Text>
              <Image 
                source={{ uri: ticket.lampiran_url }} 
                style={styles.attachmentPreview} 
                resizeMode="cover"
              />
            </SkeuCard>
          )}

          {/* Action Buttons (Only for non-expired pending tickets) */}
          {!isExpired && user?.role !== 'siswa' && ticket.status === 'pending' && (
            <View style={styles.actionRow}>
              <BouncyButton 
                title="Tolak" 
                variant="danger" 
                onPress={() => setIsRejecting(true)} 
                style={styles.actionBtn}
                loading={actionLoading}
              />
              <BouncyButton 
                title={user?.role === 'wali_kelas' ? "Setujui" : "Terbitkan QR"} 
                onPress={handleApprove} 
                style={styles.actionBtn}
                loading={actionLoading}
              />
            </View>
          )}

          {/* Post-Approval/Rejection Summary for Expired or Processed Tickets */}
          {ticket.status === 'approved_final' && (
            <View style={styles.summarySection}>
              <View style={[styles.statusBanner, { backgroundColor: COLORS.successBg, borderColor: COLORS.success }]}>
                <MaterialCommunityIcons name="check-decagram" size={20} color={COLORS.success} />
                <Text style={[styles.statusBannerText, { color: COLORS.success }]}>IZIN DISETUJUI</Text>
              </View>
              {user?.role === 'siswa' && (
                <BouncyButton 
                  title="Lihat QR Code" 
                  onPress={() => router.push(`/(siswa)/qr/${id}`)}
                  style={styles.qrBtn}
                />
              )}
            </View>
          )}

          {ticket.status === 'rejected' && (
            <View style={styles.summarySection}>
              <View style={[styles.statusBanner, { backgroundColor: COLORS.errorBg, borderColor: COLORS.error }]}>
                <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.error} />
                <Text style={[styles.statusBannerText, { color: COLORS.error }]}>IZIN DITOLAK</Text>
              </View>
              <View style={[styles.reasonCard, SHADOWS.inset]}>
                <View style={styles.reasonHeader}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color={COLORS.error} />
                  <Text style={styles.reasonLabel}>Alasan Penolakan:</Text>
                </View>
                <Text style={styles.reasonText}>{ticket.catatan || 'Tidak ada alasan spesifik yang diberikan.'}</Text>
              </View>
            </View>
          )}
        </SkeuCard>

        {/* Chat History Header */}
        <View style={styles.chatHeaderSection}>
          <View style={[styles.chatHeaderLine, SHADOWS.inset]} />
          <Text style={styles.chatTitle}>Diskusi Terkait Tiket</Text>
          <View style={[styles.chatHeaderLine, SHADOWS.inset]} />
        </View>
        {isLoadingMore && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginTop: 8 }} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        <TopAppBar title="Detail Dispensasi" onBack={() => router.back()} />

        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  {item.sender_id !== user?.id && <Text style={styles.senderName}>{item.sender?.name ?? 'Sistem'}</Text>}
                  <ChatBubble 
                    message={item.pesan} 
                    time={time} 
                    isMe={item.sender_id === user?.id} 
                    isPending={item.isPending}
                    isFailed={item.isFailed}
                    senderName={item.sender?.name}
                    profilePhotoUrl={item.sender?.profile_photo_url}
                  />
                </View>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyChatText}>Belum ada diskusi untuk tiket ini.</Text>}
          />

          {!isExpired ? (
            <BlurView intensity={GLASS.blurIntensity + 30} tint={GLASS.tintColor} style={styles.inputArea}>
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, SHADOWS.inset]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ketik pesan..."
                    placeholderTextColor={COLORS.textMuted}
                    value={newMsg}
                    onChangeText={setNewMsg}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.sendBtn}
                    onPress={() => {
                      HapticFeedback.light();
                      sendMessage();
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryLight]}
                      style={StyleSheet.absoluteFill}
                    />
                    <MaterialCommunityIcons name="send" size={18} color={COLORS.bgWhite} />
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          ) : (
            <BlurView intensity={GLASS.blurIntensity + 10} tint="light" style={styles.expiredContainer}>
              <MaterialCommunityIcons name="lock" size={20} color={COLORS.textMuted} style={{ marginBottom: 4 }} />
              <Text style={styles.expiredTitle}>Sesi Diskusi Berakhir</Text>
              <Text style={styles.expiredSubtitle}>Tiket telah kadaluarsa (melebihi 12 jam).</Text>
            </BlurView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <RejectModal
        visible={isRejecting}
        onClose={() => setIsRejecting(false)}
        onSubmit={handleReject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgWhite },
  safeArea: { flex: 1 },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    padding: SPACING.md,
  },
  ticketCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  attachmentCard: {
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.glassHighlight,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    alignItems: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 8,
    borderRadius: SIZES.radius,
  },
  infoLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  attachmentText: {
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontSize: 13,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  attachmentPreview: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radiusMd,
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
  summarySection: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  statusBannerText: {
    fontFamily: FONTS.heading,
    fontSize: 14,
    letterSpacing: 1,
  },
  reasonCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.errorBg,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    borderColor: 'rgba(239, 71, 111, 0.1)',
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reasonLabel: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: COLORS.error,
  },
  reasonText: {
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    paddingLeft: 22, // Align with icon
  },
  chatHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  chatHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  chatTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: COLORS.textMuted,
    marginHorizontal: SPACING.md,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  bubbleRow: {
    marginBottom: SPACING.sm,
  },
  senderName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 4,
    marginLeft: 58, // Align with bubble when avatar is present
  },
  emptyChatText: {
    fontFamily: FONTS.body,
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: SPACING.xl,
    transform: [{ scaleY: -1 }], 
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: COLORS.glassHighlight,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    width: '100%',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center', // Center vertically for single line
    backgroundColor: COLORS.glassSurface,
    borderRadius: SIZES.radiusXl,
    padding: 4,
    borderWidth: 1.5,
    borderColor: COLORS.glassHighlight,
    minHeight: 48,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    paddingRight: 48,
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 5,
    bottom: 3.5, // Centered vertically in a 48px height (48-38)/2 - border?
    overflow: 'hidden',
    ...SHADOWS.elevation3,
  },
  expiredContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.glassHighlight,
    paddingBottom: 40,
  },
  expiredTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  expiredSubtitle: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});
