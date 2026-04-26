import { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../../src/utils/api';
import { useAuthStore } from '../../src/stores/authStore';

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
    // 1. Initial fetch via API
    fetchChats();

    // 2. Subscribe to realtime updates via Supabase WebSocket
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';
    
    if (supabaseUrl && supabaseKey) {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);

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
            console.log('Pesan baru diterima via realtime!', payload);
            // Fetch chats again to get the sender's relation (eager loading). 
            // In a highly optimized setup, we would just append the payload, 
            // but we need the sender name which is not in the raw insert payload.
            fetchChats(); 
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, isMe(item.sender_id) ? styles.bubbleMe : styles.bubbleOther]}>
            {!isMe(item.sender_id) && <Text style={styles.senderName}>{item.sender?.name ?? '...'}</Text>}
            <Text style={[styles.msgText, isMe(item.sender_id) && { color: '#fff' }]}>{item.pesan}</Text>
          </View>
        )}
      />
      <View style={styles.inputRow}>
        <TextInput style={styles.input} placeholder="Tulis pesan..." value={newMsg} onChangeText={setNewMsg} />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  bubble: { maxWidth: '80%', borderRadius: 14, padding: 12, marginVertical: 4, marginHorizontal: 12 },
  bubbleMe: { backgroundColor: '#F59E0B', alignSelf: 'flex-end' },
  bubbleOther: { backgroundColor: '#fff', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E5E7EB' },
  senderName: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 2 },
  msgText: { fontSize: 14, color: '#1F2937' },
  inputRow: { flexDirection: 'row', padding: 8, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E5E7EB' },
  input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  sendBtn: { backgroundColor: '#F59E0B', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center', marginLeft: 8 },
  sendText: { color: '#fff', fontWeight: '700' },
});
