import { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../src/utils/supabaseClient';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';
import ChatBubble from '../../src/components/ChatBubble';
import { COLORS, FONTS, SPACING, SHADOWS } from '../../src/utils/theme';

interface ChatMessage {
  id: string;
  sender_id: string;
  pesan: string;
  sender?: { name: string };
  created_at: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const fetchChats = async () => {
    try {
      const res = await api.get(`/dispensasi/${id}/chats`);
      setMessages(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchChats();

    const channel = supabase
      .channel(`chat_${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_chats',
          filter: `dispensasi_ticket_id=eq.${id}`,
        },
        (payload) => {
          fetchChats();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    try {
      await api.post(`/dispensasi/${id}/chats`, { pesan: newMsg });
      setNewMsg('');
      // No need to fetchChats() here, because the realtime listener will trigger it,
      // but we do it anyway for optimistic UI if we want, or just wait for the DB event.
      // We will rely on the realtime event to trigger the re-fetch for simplicity and consistency.
    } catch (e) {}
  };

  const isMe = (senderId: string) => senderId === user?.id;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Diskusi Tiket</Text>
          <View style={{ width: 64 }} />
        </View>

        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const time = new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
              return (
                <View style={styles.bubbleRow}>
                  {!isMe(item.sender_id) && <Text style={styles.senderName}>{item.sender?.name ?? 'Sistem'}</Text>}
                  <ChatBubble 
                    message={item.pesan} 
                    time={time} 
                    isMe={isMe(item.sender_id)} 
                  />
                </View>
              );
            }}
          />

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder="Tulis pesan..." 
                placeholderTextColor={COLORS.textMuted}
                value={newMsg} 
                onChangeText={setNewMsg}
                multiline 
              />
              <TouchableOpacity 
                style={styles.sendBtn} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  sendMessage();
                }}
              >
                <Text style={styles.sendText}>Kirim</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: SPACING.statusBar + 16,
    paddingBottom: 8,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 20,
  },
  backText: {
    fontFamily: FONTS.headingSemi,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontFamily: FONTS.heading,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleRow: {
    marginBottom: 4,
  },
  senderName: {
    fontFamily: FONTS.headingSemi,
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
    marginLeft: 16,
  },
  inputContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surfaceContainerHighest,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    padding: 4,
    ...SHADOWS.softCard,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: FONTS.body,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendText: {
    fontFamily: FONTS.headingSemi,
    color: COLORS.onPrimary,
    fontSize: 12,
  },
});
