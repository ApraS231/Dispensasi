import { HapticFeedback } from '../../src/utils/haptics';
import { useEffect, useState, useRef, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { compressImage } from '../../src/utils/imageHelper';
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
import ImageZoomModal from '../../src/components/ImageZoomModal';

interface ChatMessage {
  id: string;
  sender_id: string;
  pesan: string;
  sender?: { name: string; profile_photo_url?: string };
  created_at: string;
  attachment_url?: string | null;
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
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Pagination state
  const nextCursor = useRef<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const insets = useSafeAreaInsets();
  
  // Image zoom state
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [zoomVisible, setZoomVisible] = useState(false);
  
  // 1. Fetch Chat History
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
      console.error("Failed to fetch history:", e);
    } finally {
      if (isLoadMore) setIsLoadingMore(false);
    }
  };

  // 2. Real-time Subscription
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
        async (payload: any) => {
          // If it's from someone else, fetch the full object to get sender info
          if (payload.new.sender_id !== user?.id) {
            try {
              const { data: res } = await api.get(`/dispensasi/${id}/chats?limit=1`);
              if (res.data?.length > 0) {
                const newest = res.data[0];
                setMessages(prev => {
                  // Avoid duplicates
                  if (prev.find(m => m.id === newest.id)) return prev;
                  return [newest, ...prev];
                });
              }
            } catch (err) {
              console.error("Failed to fetch new message details:", err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handlePickChatImage = async () => {
    HapticFeedback.light();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const compressedUri = await compressImage(result.assets[0].uri);
      setSelectedImage({ ...result.assets[0], uri: compressedUri });
      HapticFeedback.success();
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() && !selectedImage) return;
    
    const tempId = Date.now().toString();
    const pendingMsg: ChatMessage = {
      id: tempId,
      sender_id: user?.id || '',
      pesan: newMsg,
      attachment_url: selectedImage?.uri,
      created_at: new Date().toISOString(),
      isPending: true
    };
    
    setMessages(prev => [pendingMsg, ...prev]);
    const currentMsg = newMsg;
    const currentImg = selectedImage;
    setNewMsg('');
    setSelectedImage(null);
    
    try {
      const formData = new FormData();
      if (currentMsg) formData.append('pesan', currentMsg);
      
      if (currentImg) {
        const localUri = currentImg.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('lampiran_chat', {
          uri: Platform.OS === 'ios' ? localUri.replace('file://', '') : localUri,
          name: filename,
          type
        } as any);
      }

      const { data: resData } = await api.post(`/dispensasi/${id}/chats`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessages(prev => prev.map(m => m.id === tempId ? { ...resData.data, isPending: false } : m));
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

  return (
    <View style={styles.container}>
        <LiquidBackground />
        {/* Header - Fixed container to ensure responsiveness */}
        <View style={{ height: SPACING.statusBar + 88, zIndex: 100 }}>
          <TopAppBar title="Detail Dispensasi" onBack={() => router.back()} />
        </View>
        
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <FlatList
            ref={flatListRef}
            data={[...messages].reverse()} // Reverse for normal display (oldest to newest)
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            inverted={false}
            onEndReached={() => fetchHistory(true)}
            onEndReachedThreshold={0.1}
            ListHeaderComponent={
              <TicketHeader 
                ticket={ticket} 
                isExpired={isExpired} 
                user={user} 
                actionLoading={actionLoading}
                onApprove={handleApprove}
                onReject={() => setIsRejecting(true)}
                onZoom={(url) => {
                  setZoomImage(url);
                  setZoomVisible(true);
                }}
              />
            }
            renderItem={({ item, index }) => (
              <MessageItem 
                item={item} 
                index={index} 
                messages={messages} 
                user={user} 
                onImagePress={(url) => {
                  setZoomImage(url);
                  setZoomVisible(true);
                }}
              />
            )}
            ListEmptyComponent={<EmptyChat />}
            onContentSizeChange={() => messages.length > 0 && flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {/* Quick Action Bar for Staff (Integrated in Chat) */}
          {!isExpired && (user?.role === 'wali_kelas' || user?.role === 'guru_piket' || user?.role === 'admin') && ticket?.status === 'pending' && (
            <BlurView intensity={30} tint="light" style={styles.quickActionContainer}>
              <View style={styles.quickActionRow}>
                <View style={styles.quickActionTextCol}>
                  <Text style={styles.quickActionLabel}>Keputusan Izin</Text>
                  <Text style={styles.quickActionSub}>Tinjau diskusi sebelum menyetujui</Text>
                </View>
                <View style={styles.quickActionBtnRow}>
                  <TouchableOpacity 
                    style={[styles.quickBtn, styles.quickReject]} 
                    onPress={() => setIsRejecting(true)}
                    disabled={actionLoading}
                  >
                    <MaterialCommunityIcons name="close" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.quickBtn, styles.quickApprove]} 
                    onPress={handleApprove}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-bold" size={18} color="#FFF" />
                        <Text style={styles.quickBtnTextApprove}>
                          {user?.role === 'wali_kelas' ? "Setujui" : "Terbitkan"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>
          )}

          {!isExpired ? (
            <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={styles.inputContainer}>
                {selectedImage && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                    <View style={styles.previewMeta}>
                      <Text style={styles.previewText}>Lampiran siap kirim</Text>
                      <TouchableOpacity onPress={() => setSelectedImage(null)}>
                        <Text style={styles.removeText}>Batalkan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                <View style={styles.simpleInputRow}>
                  {(user?.role === 'siswa' || user?.role === 'orang_tua') && (
                    <TouchableOpacity style={styles.simpleAttachBtn} onPress={handlePickChatImage}>
                      <MaterialCommunityIcons name="camera-outline" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                  
                  <TextInput
                    style={styles.simpleInput}
                    placeholder="Tulis pesan diskusi..."
                    placeholderTextColor={COLORS.textMuted}
                    value={newMsg}
                    onChangeText={setNewMsg}
                    multiline
                  />
                  
                  <TouchableOpacity 
                    style={styles.simpleSendBtn} 
                    onPress={sendMessage}
                    disabled={!newMsg.trim() && !selectedImage}
                  >
                    <MaterialCommunityIcons 
                      name="send" 
                      size={24} 
                      color={(!newMsg.trim() && !selectedImage) ? COLORS.textMuted : COLORS.primary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.expiredContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
              <Text style={styles.expiredTitle}>Sesi Diskusi Berakhir</Text>
              <Text style={styles.expiredSubtitle}>Tiket telah kadaluarsa (melebihi 12 jam).</Text>
            </View>
          )}
        </KeyboardAvoidingView>
        
        <RejectModal
          visible={isRejecting}
          onClose={() => setIsRejecting(false)}
          onSubmit={handleReject}
        />

        <ImageZoomModal 
          visible={zoomVisible}
          imageUrl={zoomImage}
          onClose={() => setZoomVisible(false)}
        />
      </View>
  );
}

// MEMOIZED COMPONENTS TO PREVENT RE-RENDERS
const TicketHeader = memo(({ ticket, isExpired, user, actionLoading, onApprove, onReject, onZoom }: any) => {
  if (!ticket) return null;
  
  return (
    <View style={styles.headerContent}>
      <View style={{ height: 10 + SPACING.statusBar }} />
      
      <SkeuCard isGlass style={styles.ticketCard}>
        <TicketCard item={ticket} />
        
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
        
        {ticket.lampiran_bukti ? (
          <View style={styles.attachmentSection}>
            <Text style={styles.attachmentLabel}>Foto Bukti Lampiran:</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={() => onZoom(ticket.lampiran_bukti)}>
              <SkeuCard style={styles.attachmentCard}>
                <Image 
                  source={{ uri: ticket.lampiran_bukti }} 
                  style={styles.attachmentPreview} 
                  contentFit="cover"
                  transition={300}
                />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.1)']} style={StyleSheet.absoluteFill} />
              </SkeuCard>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noAttachment}>
            <MaterialCommunityIcons name="image-off-outline" size={24} color={COLORS.textMuted} />
            <Text style={styles.noAttachmentText}>Tidak ada foto lampiran</Text>
          </View>
        )}

        {!isExpired && (user?.role === 'wali_kelas' || user?.role === 'guru_piket') && ticket.status === 'pending' && (
          <View style={styles.actionRow}>
            <BouncyButton title="Tolak" variant="danger" onPress={onReject} style={styles.actionBtn} loading={actionLoading} />
            <BouncyButton title={user?.role === 'wali_kelas' ? "Setujui" : "Terbitkan QR"} onPress={onApprove} style={styles.actionBtn} loading={actionLoading} />
          </View>
        )}

        {ticket.status === 'approved_final' && (
          <View style={styles.summarySection}>
            <View style={[styles.statusBanner, { backgroundColor: COLORS.successBg, borderColor: COLORS.success }]}>
              <MaterialCommunityIcons name="check-decagram" size={20} color={COLORS.success} />
              <Text style={[styles.statusBannerText, { color: COLORS.success }]}>IZIN DISETUJUI</Text>
            </View>
            {user?.role === 'siswa' && (
              <BouncyButton title="Lihat QR Code" onPress={() => router.push(`/(siswa)/qr/${ticket.id}`)} style={styles.qrBtn} />
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
              <Text style={styles.reasonText}>{ticket.catatan_penolakan || 'Tidak ada alasan spesifik yang diberikan.'}</Text>
            </View>
          </View>
        )}
      </SkeuCard>

      <View style={styles.chatHeaderSection}>
        <View style={[styles.chatHeaderLine, SHADOWS.inset]} />
        <Text style={styles.chatTitle}>Diskusi Terkait Tiket</Text>
        <View style={[styles.chatHeaderLine, SHADOWS.inset]} />
      </View>
    </View>
  );
});

const MessageItem = memo(({ item, index, messages, user, onImagePress }: any) => {
  const time = new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date(item.created_at).toDateString();
  const nextDate = messages[index + 1] ? new Date(messages[index + 1].created_at).toDateString() : null;
  const showDivider = currentDate !== nextDate;

  return (
    <View>
      <View style={styles.bubbleRow}>
        <ChatBubble 
          message={item.pesan} 
          time={time} 
          isMe={item.sender_id === user?.id} 
          isPending={item.isPending}
          isFailed={item.isFailed}
          senderName={item.sender?.name}
          profilePhotoUrl={item.sender?.profile_photo_url}
          attachmentUrl={item.attachment_url}
          onImagePress={onImagePress}
        />
      </View>
      {showDivider && (
        <View style={styles.dateDivider}>
          <View style={styles.dateLine} />
          <View style={styles.datePill}>
            <Text style={styles.dateDividerText}>
              {currentDate === new Date().toDateString() ? 'Hari Ini' : 
               currentDate === new Date(Date.now() - 86400000).toDateString() ? 'Kemarin' : 
               new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <View style={styles.dateLine} />
        </View>
      )}
    </View>
  );
});

const EmptyChat = memo(() => (
  <View style={styles.emptyContainer}>
    <MaterialCommunityIcons name="chat-outline" size={48} color="rgba(0,0,0,0.05)" />
    <Text style={styles.emptyChatText}>Belum ada pesan diskusi.</Text>
    <Text style={styles.emptyChatSub}>Mulai percakapan di bawah ini.</Text>
  </View>
));

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
  emptyContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyChatText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  emptyChatSub: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  attachmentSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  attachmentLabel: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  noAttachment: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noAttachmentText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  inputArea: {
    backgroundColor: COLORS.bgWhite,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  imagePreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  previewMeta: {
    flex: 1,
  },
  previewText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  removeText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: COLORS.error,
  },
  simpleInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 48,
  },
  simpleAttachBtn: {
    padding: 8,
  },
  simpleInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontFamily: FONTS.body,
    fontSize: 15,
    maxHeight: 100,
    color: COLORS.textPrimary,
  },
  simpleSendBtn: {
    padding: 8,
  },
  expiredContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  expiredTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  expiredSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  datePill: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 12,
  },
  dateDividerText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // QUICK ACTION STYLES
  quickActionContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  quickActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickActionTextCol: {
    flex: 1,
  },
  quickActionLabel: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  quickActionSub: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  quickActionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  quickReject: {
    width: 40,
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: 'rgba(239, 71, 111, 0.2)',
  },
  quickApprove: {
    backgroundColor: COLORS.primary,
    gap: 6,
    minWidth: 100,
    ...SHADOWS.raised,
  },
  quickBtnTextApprove: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: '#FFF',
  },
});
