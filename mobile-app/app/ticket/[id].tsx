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
import TicketCard from '../../src/components/TicketCard';
import { FONTS, SPACING, SIZES, GLASS } from '../../src/utils/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import ImageZoomModal from '../../src/components/ImageZoomModal';
import { useTheme } from '../../src/hooks/useTheme';
import { createCommonStyles } from '../../src/utils/commonStyles';

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
  const { colors, shadows, isDark } = useTheme();
  const commonStyles = createCommonStyles(colors);

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
  const [isInputFocused, setIsInputFocused] = useState(false);
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
        setMessages(prev => {
          // Merge lists and prevent duplicates
          const newMsgs = res.data.data.filter((m: ChatMessage) => !prev.find(p => p.id === m.id));
          return [...prev, ...newMsgs];
        });
      } else {
        setMessages(prev => {
          const pending = prev.filter(m => m.isPending || m.isFailed);
          const newMsgs = res.data.data;
          
          // Merge pending messages that are not already present in newMsgs
          const merged = [...newMsgs];
          pending.forEach(p => {
            if (!merged.some(m => m.id === p.id)) {
              merged.unshift(p);
            }
          });
          return merged;
        });
      }
      nextCursor.current = res.data.next_cursor;
    } catch (e) {
      console.error("Failed to fetch history:", e);
    } finally {
      if (isLoadMore) setIsLoadingMore(false);
    }
  };

  // 2. Short Polling Interval (every 5 seconds) as SQLite doesn't support Supabase Realtime
  useEffect(() => {
    fetchHistory();

    const interval = setInterval(() => {
      fetchHistory();
    }, 5000);

    return () => {
      clearInterval(interval);
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
      let response;
      if (currentImg) {
        const formData = new FormData();
        if (currentMsg) formData.append('pesan', currentMsg);
        
        const localUri = currentImg.uri;
        let filename = localUri.split('/').pop() || 'lampiran_chat.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const ext = match ? match[1].toLowerCase() : 'jpg';

        // Ensure proper filename extension for content URIs
        if (!filename.includes('.')) {
          filename += `.${ext === 'jpeg' ? 'jpg' : ext}`;
        }

        // Use standard MIME types (image/jpeg for jpg/jpeg, image/png for png)
        const type = ext === 'png' ? 'image/png' : 'image/jpeg';

        formData.append('lampiran_chat', {
          uri: localUri,
          name: filename,
          type
        } as any);
        response = await api.post(`/dispensasi/${id}/chats`, formData);
      } else {
        response = await api.post(`/dispensasi/${id}/chats`, { pesan: currentMsg });
      }

      const resData = response.data;
      
      setMessages(prev => prev.map(m => m.id === tempId ? { ...resData.data, isPending: false } : m));
    } catch (e) {
      console.error("Failed to send message:", e);
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
      <LinearGradient
        colors={[colors.bgPrimary, colors.bgSecondary]}
        style={[commonStyles.container, { justifyContent: 'center', alignItems: 'center' }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </LinearGradient>
    );
  }

  const isExpired = ticket?.created_at 
    ? (Date.now() - new Date(ticket.created_at).getTime()) > 12 * 60 * 60 * 1000 
    : false;

  return (
    <LinearGradient
      colors={[colors.bgPrimary, colors.bgSecondary]}
      style={styles.container}
    >
        {/* Header - Fixed container to ensure responsiveness */}
        <View style={{ height: SPACING.statusBar + 88, zIndex: 100 }}>
          <TopAppBar title="Detail Perizinan" onBack={() => router.back()} />
        </View>
        
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={[styles.quickActionContainer, { borderTopColor: colors.glassHighlight, backgroundColor: colors.glassSurface }]}>
              <View style={styles.quickActionRow}>
                <View style={styles.quickActionTextCol}>
                  <Text style={[styles.quickActionLabel, { color: colors.textPrimary }]}>Keputusan Izin</Text>
                  <Text style={[styles.quickActionSub, { color: colors.textMuted }]}>Tinjau diskusi sebelum menyetujui</Text>
                </View>
                <View style={styles.quickActionBtnRow}>
                  <TouchableOpacity 
                    style={[styles.quickBtn, styles.quickReject, { backgroundColor: colors.errorBg, borderColor: colors.error }]} 
                    onPress={() => setIsRejecting(true)}
                    disabled={actionLoading}
                  >
                    <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.quickBtn, styles.quickApprove, { backgroundColor: colors.primary }, shadows.raised]} 
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
            <View style={[styles.inputArea, { backgroundColor: colors.bgSecondary, borderTopColor: colors.glassHighlight, paddingBottom: Math.max(insets.bottom, 20) }]}>
              <View style={styles.inputContainer}>
                {selectedImage && (
                  <View style={[styles.imagePreviewContainer, { backgroundColor: colors.surface }]}>
                    <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                    <View style={styles.previewMeta}>
                      <Text style={[styles.previewText, { color: colors.textPrimary }]}>Lampiran siap kirim</Text>
                      <TouchableOpacity onPress={() => setSelectedImage(null)}>
                        <Text style={[styles.removeText, { color: colors.error }]}>Batalkan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                <View style={[
                  styles.simpleInputRow, 
                  { 
                    backgroundColor: isInputFocused ? colors.inputBgFocused : colors.inputBg,
                    borderColor: isInputFocused ? colors.inputBorderFocused : colors.inputBorder,
                  }
                ]}>
                  {(user?.role === 'siswa' || user?.role === 'orang_tua') && (
                    <TouchableOpacity style={styles.simpleAttachBtn} onPress={handlePickChatImage}>
                      <MaterialCommunityIcons name="camera-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  
                  <TextInput
                    style={[styles.simpleInput, { color: colors.textPrimary }]}
                    placeholder="Tulis pesan diskusi..."
                    placeholderTextColor={colors.textMuted}
                    value={newMsg}
                    onChangeText={setNewMsg}
                    multiline
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                  />
                  
                  <TouchableOpacity 
                    style={styles.simpleSendBtn} 
                    onPress={sendMessage}
                    disabled={!newMsg.trim() && !selectedImage}
                  >
                    <MaterialCommunityIcons 
                      name="send" 
                      size={24} 
                      color={(!newMsg.trim() && !selectedImage) ? colors.textMuted : colors.primary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={[styles.expiredContainer, { backgroundColor: colors.bgSecondary, paddingBottom: Math.max(insets.bottom, 20) }]}>
              <Text style={[styles.expiredTitle, { color: colors.textMuted }]}>Sesi Diskusi Berakhir</Text>
              <Text style={[styles.expiredSubtitle, { color: colors.textMuted }]}>Tiket telah kadaluarsa (melebihi 12 jam).</Text>
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
    </LinearGradient>
  );
}

// MEMOIZED COMPONENTS TO PREVENT RE-RENDERS
const TicketHeader = memo(({ ticket, isExpired, user, actionLoading, onApprove, onReject, onZoom }: any) => {
  if (!ticket) return null;
  const { colors, shadows, isDark, SIZES, SPACING, FONTS } = useTheme();
  
  const dateObj = ticket.created_at ? new Date(ticket.created_at) : new Date();
  const formattedDate = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.headerContent}>
      <View style={{ height: SPACING.sm }} />
      
      <SkeuCard isGlass style={styles.ticketCard}>
        {/* Date and Time Header */}
        <View style={[styles.ticketHeaderRow, { marginBottom: SPACING.sm }]}>
          <View style={styles.headerItem}>
            <MaterialCommunityIcons name="calendar" size={14} color={colors.textSecondary} />
            <Text style={[styles.headerText, { fontFamily: FONTS.bodyMedium, color: colors.textSecondary }]}>{formattedDate}</Text>
          </View>
          <View style={styles.headerItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.headerText, { fontFamily: FONTS.bodyMedium, color: colors.textSecondary }]}>{formattedTime}</Text>
          </View>
        </View>

        {/* Main Info */}
        <View style={styles.cardMainContent}>
          <View style={[styles.infoCol, { marginRight: SPACING.sm }]}>
            {ticket.siswa && (
              <Text style={[styles.studentName, { fontFamily: FONTS.headingSemi, color: colors.textPrimary }]}>{ticket.siswa.name}</Text>
            )}
            <Text style={[styles.typeText, { fontFamily: FONTS.heading, color: colors.primary }]}>{ticket.jenis_izin?.replace(/_/g, ' ')}</Text>
            <View style={styles.ticketReasonContainer}>
              <MaterialCommunityIcons name="format-quote-open" size={10} color={isDark ? '#7BBDE8' : colors.primaryMuted} style={{ marginRight: 4 }} />
              <Text style={[styles.ticketReasonText, { fontFamily: FONTS.body, color: colors.textSecondary }]} numberOfLines={2}>{ticket.alasan}</Text>
            </View>
          </View>
          <PillBadge status={ticket.status} />
        </View>
        
        <View style={styles.infoGrid}>
          <View style={[styles.infoItem, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="clock-start" size={16} color={colors.primary} />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Mulai</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{new Date(ticket.waktu_mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
          <View style={[styles.infoItem, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="clock-end" size={16} color={colors.primary} />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Selesai</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{new Date(ticket.waktu_selesai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={[styles.infoItem, { backgroundColor: colors.surface }]}>
            <MaterialCommunityIcons name="account-tie" size={16} color={colors.primary} />
            <View>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Wali Kelas</Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{ticket.wali_kelas?.name || '-'}</Text>
            </View>
          </View>
          {ticket.guru_piket && (
            <View style={[styles.infoItem, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons name="shield-account" size={16} color={colors.primary} />
              <View>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Guru Piket</Text>
                <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{ticket.guru_piket?.name || '-'}</Text>
              </View>
            </View>
          )}
        </View>
        
        {ticket.lampiran_bukti ? (
          <View style={styles.attachmentSection}>
            <Text style={[styles.attachmentLabel, { color: colors.textSecondary }]}>Foto Bukti Lampiran:</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={() => onZoom(ticket.lampiran_bukti)}>
              <View style={[styles.attachmentPreviewContainer, { borderColor: colors.glassHighlight }]}>
                <Image 
                  source={{ uri: ticket.lampiran_bukti }} 
                  style={styles.attachmentPreview} 
                  contentFit="cover"
                  transition={300}
                />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.15)']} style={StyleSheet.absoluteFill} />
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.noAttachment, { backgroundColor: colors.surface, borderColor: colors.glassHighlight }]}>
            <MaterialCommunityIcons name="image-off-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.noAttachmentText, { color: colors.textMuted }]}>Tidak ada foto lampiran</Text>
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
            <View style={[styles.statusBanner, { backgroundColor: colors.successBg, borderColor: colors.success }]}>
              <MaterialCommunityIcons name="check-decagram" size={20} color={colors.success} />
              <Text style={[styles.statusBannerText, { color: colors.success }]}>IZIN DISETUJUI</Text>
            </View>
            {user?.role === 'siswa' && (
              <BouncyButton title="Lihat QR Code" onPress={() => router.push(`/(siswa)/qr/${ticket.id}`)} style={styles.qrBtn} />
            )}
          </View>
        )}

        {ticket.status === 'rejected' && (
          <View style={styles.summarySection}>
            <View style={[styles.statusBanner, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
              <MaterialCommunityIcons name="close-circle" size={20} color={colors.error} />
              <Text style={[styles.statusBannerText, { color: colors.error }]}>IZIN DITOLAK</Text>
            </View>
            <View style={[styles.reasonCard, shadows.inset, { backgroundColor: colors.errorBg, borderColor: colors.error }]}>
              <View style={styles.reasonHeader}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={[styles.reasonLabel, { color: colors.error }]}>Alasan Penolakan:</Text>
              </View>
              <Text style={[styles.reasonText, { color: colors.textPrimary }]}>{ticket.catatan_penolakan || 'Tidak ada alasan spesifik yang diberikan.'}</Text>
            </View>
          </View>
        )}
      </SkeuCard>

      <View style={styles.chatHeaderSection}>
        <View style={[styles.chatHeaderLine, shadows.inset, { backgroundColor: colors.glassHighlight }]} />
        <Text style={[styles.chatTitle, { color: colors.textMuted }]}>Diskusi Terkait Tiket</Text>
        <View style={[styles.chatHeaderLine, shadows.inset, { backgroundColor: colors.glassHighlight }]} />
      </View>
    </View>
  );
});

const MessageItem = memo(({ item, index, messages, user, onImagePress }: any) => {
  const time = new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const currentDate = new Date(item.created_at).toDateString();
  const nextDate = messages[index + 1] ? new Date(messages[index + 1].created_at).toDateString() : null;
  const showDivider = currentDate !== nextDate;
  const { colors } = useTheme();

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
          <View style={[styles.dateLine, { backgroundColor: colors.glassHighlight }]} />
          <View style={[styles.datePill, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dateDividerText, { color: colors.textMuted }]}>
              {currentDate === new Date().toDateString() ? 'Hari Ini' : 
               currentDate === new Date(Date.now() - 86400000).toDateString() ? 'Kemarin' : 
               new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <View style={[styles.dateLine, { backgroundColor: colors.glassHighlight }]} />
        </View>
      )}
    </View>
  );
});

const EmptyChat = memo(() => {
  const { colors } = useTheme();
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="chat-outline" size={48} color={colors.textMuted} style={{ opacity: 0.3 }} />
      <Text style={[styles.emptyChatText, { color: colors.textPrimary }]}>Belum ada pesan diskusi.</Text>
      <Text style={[styles.emptyChatSub, { color: colors.textMuted }]}>Mulai percakapan di bawah ini.</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerContent: {
    padding: SPACING.md,
  },
  ticketCard: {
    marginBottom: SPACING.lg,
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    gap: 13,
  },
  headerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerText: {
    fontSize: 10,
  },
  cardMainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: SPACING.md,
  },
  infoCol: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    marginBottom: 2,
  },
  typeText: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  ticketReasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  ticketReasonText: {
    fontSize: 10,
    lineHeight: 14,
    flex: 1,
  },
  attachmentPreviewContainer: {
    borderWidth: 1.5,
    borderRadius: SIZES.radiusCard,
    overflow: 'hidden',
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    width: '100%',
    height: 200,
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
    padding: 8,
    borderRadius: SIZES.radius,
  },
  infoLabel: {
    fontFamily: FONTS.body,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontFamily: FONTS.headingSemi,
    fontSize: 12,
  },
  attachmentText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 13,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  attachmentPreview: {
    width: '100%',
    height: '100%',
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
    borderWidth: 1,
    borderRadius: SIZES.radius,
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
  },
  reasonText: {
    fontFamily: FONTS.body,
    fontSize: 14,
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
  },
  chatTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
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
  },
  emptyChatSub: {
    fontFamily: FONTS.body,
    fontSize: 13,
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
    marginBottom: 8,
  },
  noAttachment: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  noAttachmentText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
  },
  inputArea: {
    borderTopWidth: 1,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 13,
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
  },
  removeText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
  },
  simpleInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 48,
    borderWidth: 1,
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
  },
  simpleSendBtn: {
    padding: 8,
  },
  expiredContainer: {
    padding: 20,
    alignItems: 'center',
  },
  expiredTitle: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
  },
  expiredSubtitle: {
    fontFamily: FONTS.body,
    fontSize: 12,
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
  },
  datePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 13,
    marginHorizontal: 12,
  },
  dateDividerText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // QUICK ACTION STYLES
  quickActionContainer: {
    borderTopWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
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
  },
  quickActionSub: {
    fontFamily: FONTS.body,
    fontSize: 10,
  },
  quickActionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    height: 40,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  quickReject: {
    width: 40,
    borderWidth: 1,
  },
  quickApprove: {
    gap: 6,
    minWidth: 100,
  },
  quickBtnTextApprove: {
    fontFamily: FONTS.headingSemi,
    fontSize: 13,
    color: '#FFF',
  },
});
