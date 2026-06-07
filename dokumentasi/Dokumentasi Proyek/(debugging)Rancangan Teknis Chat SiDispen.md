# **Arsitektur Teknis Modul Chat Real-Time (SiDispen)**

Dokumen ini merincikan spesifikasi teknis tingkat lanjut, arsitektur data, strategi keamanan, dan implementasi *edge-cases* untuk fitur "Ticket-Based Chat" di dalam aplikasi SiDispen. Modul ini dirancang dengan pendekatan **Hybrid CQRS (Command Query Responsibility Segregation)** ringan: menggunakan REST API terpusat untuk operasi *Write* (Command) dan WebSockets terdesentralisasi untuk operasi *Listen/Read* (Query).

## **1\. Tumpukan Teknologi & Justifikasi Arsitektural (Tech Stack)**

Pemilihan teknologi difokuskan pada pemisahan beban kerja (*workload separation*) untuk memastikan server tidak kelebihan beban saat lalu lintas tinggi:

* **Database & Pub/Sub Engine:** **Supabase (PostgreSQL)**.  
  * *Justifikasi:* Memanfaatkan *Logical Decoding* (wal2json) bawaan PostgreSQL untuk memancarkan event INSERT via WebSocket. Ini membebaskan server backend (Laravel) dari keharusan menjaga koneksi TCP/WebSocket yang memakan banyak RAM (seperti jika menggunakan Laravel WebSockets/Reverb).  
* **Backend Validation & Gatekeeper:** **Laravel 11**.  
  * *Justifikasi:* Bertindak sebagai *API Gateway* tunggal. Mengamankan integritas data, memvalidasi otorisasi (RBAC), menyimpan pesan, dan bertindak sebagai *trigger* untuk notifikasi *push* asinkron.  
* **Mobile Client:** **React Native (Expo)**.  
  * *Justifikasi:* Menggunakan pola *Inverted FlatList* (standar UX aplikasi chat modern seperti WhatsApp) yang dikombinasikan dengan KeyboardAvoidingView tingkat lanjut. State dikelola oleh Zustand untuk sinkronisasi antar komponen tanpa *prop-drilling*.  
* **Notification Engine:** **Expo Push Notifications API**.  
  * *Justifikasi:* Menjembatani APNs (Apple) dan FCM (Google) dengan satu REST API seragam, menghilangkan kebutuhan mengelola sertifikat keamanan native yang rumit di sisi Laravel.

## **2\. Struktur Database & Keamanan Lapis Ganda (Security & RLS)**

### **A. Skema Tabel ticket\_chats**

Tabel ini dioptimalkan untuk pembacaan riwayat pesan yang sangat cepat dengan menambahkan indeks pada relasi tiket.

CREATE TABLE ticket\_chats (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    dispensasi\_ticket\_id UUID NOT NULL REFERENCES dispensasi\_tickets(id) ON DELETE CASCADE,  
    sender\_id UUID NOT NULL REFERENCES users(id),  
    pesan TEXT NOT NULL,  
    is\_read BOOLEAN DEFAULT FALSE,  
    created\_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()  
);

\-- Indexing untuk mempercepat query pengambilan riwayat chat (Pagination)  
CREATE INDEX idx\_ticket\_chats\_on\_ticket\_id ON ticket\_chats(dispensasi\_ticket\_id);

### **B. Keamanan Saluran WebSocket (Row Level Security / RLS)**

Karena klien (aplikasi mobile) langsung mendengarkan (*listen*) ke database Supabase menggunakan Anon Key, kita harus mencegah eksploitasi di mana pengguna jahat menebak ID tiket pengguna lain untuk menyadap obrolan.

* **Mitigasi 1:** Menggunakan tipe data **UUID v4** untuk dispensasi\_ticket\_id. Entropi UUID sangat tinggi sehingga hampir mustahil untuk ditebak (brute-force).  
* **Mitigasi 2 (Opsional namun disarankan):** Mengaktifkan RLS di Supabase yang memvalidasi kustom JWT dari Laravel. Namun, pada arsitektur dasar ini, kerahasiaan bergantung pada pengiriman UUID melalui *channel* terenkripsi (WSS/HTTPS) dan larangan akses baca API riwayat (GET /api/chat) tanpa validasi RBAC Laravel.

## **3\. Alur Penggunaan & Alur Data (Hybrid Data Flow)**

Berikut adalah siklus hidup (*lifecycle*) pesanan end-to-end dengan detail penanganan kegagalan (*fault tolerance*):

**Fase 1: Inisiasi (Write/Command via API)**

1. **\[UX\]** Pengguna mengetik pesan dan menekan "Kirim". UI seketika merender pesan di layar dengan status *translucent* (Optimistic UI Update).  
2. **\[Mobile \-\> API\]** Aplikasi mengirim HTTP POST /api/chat.  
3. **\[Backend\]** Laravel memvalidasi RBAC. Jika valid, eksekusi INSERT.  
4. **\[Error Handling\]** Jika HTTP gagal (misal: koneksi putus), UI akan menghapus *Optimistic UI* dan menampilkan ikon tanda seru merah ❗ (Gagal kirim, tap untuk ulangi).

**Fase 2: Notifikasi Background (Push)**

5\. **\[Backend \-\> Expo Server\]** Laravel menembakkan HTTP POST ke Expo Push API. Proses ini dibungkus dalam *Laravel Queue* (Antrean Jobs) agar respons API ke pengirim (HTTP 200 OK) tidak tertahan oleh latensi *network* ke server Expo.

**Fase 3: Sinkronisasi Klien (Read/Query via WebSocket)**

6\. **\[Database \-\> Supabase Realtime\]** *Replication* memicu event INSERT.

7\. **\[Supabase \-\> Mobile\]** Supabase me-*broadcast* baris data ke klien.

8\. **\[Mobile\]** Listener menolak *event* jika ID pengirim (sender\_id) sama dengan ID pengguna saat ini (untuk mencegah duplikasi *render* karena *Optimistic UI* sudah merender pesan tersebut).

## **4\. Spesifikasi Kontrak API (API Specifications)**

### **A. Endpoint Kirim Pesan (POST)**

* **URL:** POST /api/chat  
* **Headers:** Authorization: Bearer {token}  
* **Payload Request:**  
  {  
    "ticket\_id": "9a3b2c1d-...",  
    "pesan": "Mohon segera ke ruang piket."  
  }

* **Response (200 OK):**  
  {  
    "status": "success",  
    "data": {  
      "id": "8f2a1b...",  
      "dispensasi\_ticket\_id": "9a3b2c1d-...",  
      "sender\_id": "7c1e...",  
      "pesan": "Mohon segera ke ruang piket.",  
      "created\_at": "2026-04-28T10:30:00Z"  
    }  
  }

### **B. Endpoint Riwayat Pesan / Pagination (GET)**

* **URL:** GET /api/chat/{ticket\_id}?cursor={last\_message\_id}\&limit=20  
* **Fungsi:** Menarik riwayat pesan saat ruang chat pertama kali dibuka, atau saat pengguna melakukan *scroll* ke atas (Infinite Pagination). Mengembalikan array pesan yang diurutkan secara *Descending* (terbaru di atas).

## **5\. Implementasi Frontend (React Native & UX Details)**

Pendalaman implementasi *Infinite Scroll* dan *Optimistic UI* di aplikasi Expo:

import React, { useState, useEffect, useRef } from 'react';  
import { KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';  
import { supabase } from '../../../src/utils/supabaseClient';  
import api from '../../../src/utils/api';

export default function TicketChatScreen({ ticketId, currentUser }) {  
  const \[messages, setMessages\] \= useState(\[\]);  
  const \[isLoadingMore, setIsLoadingMore\] \= useState(false);  
  const \[inputText, setInputText\] \= useState('');  
    
  // Ref untuk menyimpan kursor halaman selanjutnya  
  const nextCursor \= useRef(null); 

  // 1\. Fetch Riwayat Chat (Initial Load & Pagination)  
  const fetchHistory \= async (isLoadMore \= false) \=\> {  
    if (isLoadMore) setIsLoadingMore(true);  
    try {  
        const res \= await api.get(\`/chat/${ticketId}?cursor=${nextCursor.current}\`);  
        const fetchedMessages \= res.data.data;  
          
        if (isLoadMore) {  
            // Append ke data lama  
            setMessages(prev \=\> \[...prev, ...fetchedMessages\]);  
        } else {  
            // Initial load  
            setMessages(fetchedMessages);  
        }  
        nextCursor.current \= res.data.next\_cursor; // Update cursor dari backend  
    } catch (e) {  
        console.error("Gagal memuat riwayat", e);  
    } finally {  
        setIsLoadingMore(false);  
    }  
  };

  useEffect(() \=\> {  
    fetchHistory(); // Panggilan pertama kali

    // 2\. Realtime WebSocket Subscription  
    const channel \= supabase.channel(\`chat\_${ticketId}\`)  
      .on('postgres\_changes', { event: 'INSERT', schema: 'public', table: 'ticket\_chats', filter: \`dispensasi\_ticket\_id=eq.${ticketId}\` },  
        (payload) \=\> {  
          // Cegah duplikasi jika ini pesan milik kita sendiri (ditangani oleh Optimistic UI)  
          if (payload.new.sender\_id \!== currentUser.id) {  
             setMessages(prev \=\> \[payload.new, ...prev\]);  
          }  
        }  
      ).subscribe();

    return () \=\> { supabase.removeChannel(channel); };  
  }, \[ticketId\]);

  // 3\. Fungsi Kirim (Optimistic UI)  
  const handleSend \= async () \=\> {  
    if (\!inputText.trim()) return;  
      
    const tempId \= \`temp-${Date.now()}\`;  
    const newMsg \= {  
        id: tempId,  
        sender\_id: currentUser.id,  
        pesan: inputText,  
        created\_at: new Date().toISOString(),  
        isPending: true // Flag untuk UI (Skeuo-Glass: tampilkan warna pudar)  
    };  
      
    // UI langsung diperbarui (Instant feedback)  
    setMessages(prev \=\> \[newMsg, ...prev\]);  
    setInputText('');

    try {  
        // Tembak API sebenarnya  
        const response \= await api.post('/chat', { ticket\_id: ticketId, pesan: newMsg.pesan });  
          
        // Ganti ID sementara dengan ID asli dari Database, hapus status pending  
        setMessages(prev \=\> prev.map(msg \=\> msg.id \=== tempId ? { ...response.data.data } : msg));  
    } catch (e) {  
        // Jika gagal, ubah status menjadi failed agar user bisa mengulang  
        setMessages(prev \=\> prev.map(msg \=\> msg.id \=== tempId ? { ...msg, isFailed: true } : msg));  
    }  
  };

  return (  
    \<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS \=== 'ios' ? 'padding' : undefined}\>  
      \<FlatList  
        data={messages}  
        inverted={true}  
        onEndReached={() \=\> { if(nextCursor.current) fetchHistory(true) }} // Infinite scroll ke atas  
        onEndReachedThreshold={0.5}  
        ListFooterComponent={isLoadingMore ? \<ActivityIndicator size="small" color="\#50EB63" /\> : null}  
        keyExtractor={(item) \=\> item.id}  
        renderItem={({ item }) \=\> (  
            // Render komponen dengan pengecekan item.isPending dan item.isFailed  
            \<GlassBubble message={item} isMe={item.sender\_id \=== currentUser.id} /\>  
        )}  
      /\>  
      {/\* ... Input Component ... \*/}  
    \</KeyboardAvoidingView\>  
  );  
}

## **6\. Skenario Edge Cases (Penanganan Kegagalan Khusus)**

1. **Jaringan Tidak Stabil (Network Fluctuation):** Klien Supabase-JS memiliki mekanisme *auto-reconnect* eksponensial. Jika WebSocket terputus, ia akan mencoba menyambung ulang tanpa intervensi pengguna. Selama terputus, pesan yang dikirim pengguna tetap dikelola melalui HTTP POST, memastikan tidak ada pesan yang ditelan sistem (meskipun tidak ada indikator "sedang mengetik" untuk sementara).  
2. **Pemutusan Koneksi Saat Background (App Killed/Sleep):** OS Mobile (iOS/Android) sering "mematikan" WebSocket saat aplikasi diminimalkan untuk menghemat baterai. *Fallback* utama sistem ini adalah **Push Notification**. Jika pengguna tidak sedang mendengarkan WebSocket, Push Notif akan membangunkan OS untuk menampilkan *banner* pesan di atas layar. Saat pengguna mengetuk *banner* dan aplikasi terbuka, aplikasi akan memanggil fetchHistory() dari API, menarik semua pesan yang terlewatkan selama koneksi WebSocket mati.