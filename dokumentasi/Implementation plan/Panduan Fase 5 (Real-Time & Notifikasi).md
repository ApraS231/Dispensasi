# **Panduan Teknis Detail \- Fase 5: Integrasi Real-Time & Push Notifications**

Fase 5 adalah tahap kunci untuk menyelesaikan masalah utama penelitian Anda: **Latensi Persetujuan dan Kesenjangan Informasi**. Pada fase ini, kita mengimplementasikan WebSockets (via Supabase Realtime) untuk *Live Chat* dan integrasi Expo Push Notifications API melalui Laravel.

## **Langkah 1: Setup Supabase Real-Time (Untuk Fitur Chat)**

Alih-alih membebani server Laravel dengan WebSocket, kita akan memanfaatkan fitur Realtime bawaan dari database Supabase Anda untuk *Ticket Chat*.

### **A. Konfigurasi di Dashboard Supabase**

1. Buka Dashboard Supabase Anda.  
2. Masuk ke menu **Database** \-\> **Replication**.  
3. Pada bagian *Source*, aktifkan replikasi untuk tabel ticket\_chats. Ini akan membuat Supabase memancarkan event WebSocket setiap kali ada baris data baru (pesan baru) yang ditambahkan ke tabel tersebut.

### **B. Integrasi WebSocket di Mobile App (Expo)**

Pastikan Anda sudah menginstal klien Supabase di aplikasi React Native Anda.

\# Terminal di folder mobile-app  
npm install @supabase/supabase-js

Buat *listener* di dalam komponen halaman Chat Anda (misal app/(chat)/\[ticketId\].tsx):

import { useEffect, useState } from 'react';  
import { createClient } from '@supabase/supabase-js';  
import { FlatList, Text, View } from 'react-native';

// Inisialisasi Supabase Client (Gunakan URL & Anon Key dari Dashboard Supabase Anda)  
const supabase \= createClient('\[https://xyzcompany.supabase.co\](https://xyzcompany.supabase.co)', 'public-anon-key');

export default function TicketChatScreen({ ticketId }) {  
  const \[messages, setMessages\] \= useState(\[\]);

  useEffect(() \=\> {  
    // 1\. Fetch pesan awal via API Laravel (atau Supabase)  
    // fetchMessages();

    // 2\. Berlangganan (Subscribe) ke perubahan tabel secara Real-Time via WebSocket  
    const channel \= supabase  
      .channel('realtime\_chat')  
      .on(  
        'postgres\_changes',  
        {  
          event: 'INSERT', // Dengarkan hanya jika ada data chat baru  
          schema: 'public',  
          table: 'ticket\_chats',  
          filter: \`dispensasi\_ticket\_id=eq.${ticketId}\`, // Hanya untuk tiket ini  
        },  
        (payload) \=\> {  
          console.log('Pesan baru diterima\!', payload);  
          // Tambahkan pesan baru ke layar tanpa perlu refresh\!  
          setMessages((prevMessages) \=\> \[...prevMessages, payload.new\]);  
        }  
      )  
      .subscribe();

    // 3\. Bersihkan koneksi saat keluar dari layar chat  
    return () \=\> {  
      supabase.removeChannel(channel);  
    };  
  }, \[ticketId\]);

  return (  
    \<View\>  
      \<FlatList   
         data={messages}  
         renderItem={({item}) \=\> \<Text\>{item.pesan}\</Text\>}  
         keyExtractor={(item) \=\> item.id}  
      /\>  
    \</View\>  
  );  
}

## **Langkah 2: Setup Klien Push Notification (Mobile App)**

Agar HP pengguna bisa menerima notifikasi saat aplikasi ditutup, kita harus mendaftarkan perangkat mereka ke server Expo Push.

\# Terminal di folder mobile-app  
npx expo install expo-notifications expo-device

### **Modifikasi Layar Login atau Komponen Utama (app/\_layout.tsx):**

import \* as Device from 'expo-device';  
import \* as Notifications from 'expo-notifications';  
import { useEffect } from 'react';  
import api from '../src/utils/api'; // Axios instance Anda

// Atur perilaku notifikasi saat aplikasi sedang dibuka (Foreground)  
Notifications.setNotificationHandler({  
  handleNotification: async () \=\> ({  
    shouldShowAlert: true,  
    shouldPlaySound: true,  
    shouldSetBadge: false,  
  }),  
});

export async function registerForPushNotificationsAsync() {  
  let token;  
  if (Device.isDevice) {  
    const { status: existingStatus } \= await Notifications.getPermissionsAsync();  
    let finalStatus \= existingStatus;  
      
    if (existingStatus \!== 'granted') {  
      const { status } \= await Notifications.requestPermissionsAsync();  
      finalStatus \= status;  
    }  
      
    if (finalStatus \!== 'granted') {  
      alert('Gagal mendapatkan izin untuk push notification\!');  
      return;  
    }  
      
    // Dapatkan Expo Push Token yang unik untuk HP ini  
    token \= (await Notifications.getExpoPushTokenAsync({  
      projectId: "ID\_PROYEK\_EXPO\_ANDA\_DI\_APP\_JSON"  
    })).data;  
      
    console.log("Expo Push Token:", token);  
  } else {  
    alert('Harus menggunakan perangkat fisik untuk Push Notifications');  
  }  
  return token;  
}

*Catatan: Panggil fungsi registerForPushNotificationsAsync() ini saat user berhasil Login, lalu kirimkan token tersebut ke backend Laravel (kolom device\_token di tabel users).*

## **Langkah 3: Setup Service Pengirim Notifikasi (Backend Laravel)**

Di sisi Laravel, kita tidak perlu menginstal *package* yang berat. Kita cukup menggunakan HTTP Client bawaan Laravel (Illuminate\\Support\\Facades\\Http) untuk memanggil API milik Expo.

### **Buat Service Class di Laravel:**

Buat folder dan file baru di app/Services/ExpoPushService.php:

namespace App\\Services;

use Illuminate\\Support\\Facades\\Http;  
use Illuminate\\Support\\Facades\\Log;

class ExpoPushService  
{  
    /\*\*  
     \* Fungsi untuk mengirim notifikasi ke Expo  
     \* \* @param string|array $to (Satu token string atau array token)  
     \* @param string $title (Judul Notif)  
     \* @param string $body (Isi pesan)  
     \* @param array $data (Data tambahan opsional, misal ID tiket)  
     \*/  
    public static function send($to, $title, $body, $data \= \[\])  
    {  
        if (empty($to)) return false;

        $payload \= \[  
            'to' \=\> $to,  
            'title' \=\> $title,  
            'body' \=\> $body,  
            'data' \=\> $data,  
            'sound' \=\> 'default'  
        \];

        try {  
            $response \= Http::withHeaders(\[  
                'Accept' \=\> 'application/json',  
                'Accept-Encoding' \=\> 'gzip, deflate',  
                'Content-Type' \=\> 'application/json',  
            \])-\>post('\[https://exp.host/--/api/v2/push/send\](https://exp.host/--/api/v2/push/send)', $payload);

            return $response-\>json();  
        } catch (\\Exception $e) {  
            Log::error('Gagal kirim Expo Push: ' . $e-\>getMessage());  
            return false;  
        }  
    }  
}

## **Langkah 4: Trigger Notifikasi pada Alur Bisnis (Controller Laravel)**

Sekarang, kita sisipkan fungsi pengiriman notifikasi ini ke dalam alur *Approval* atau Pengajuan di Controller yang kita buat di Fase 2\.

### **Contoh 1: Notifikasi saat Siswa Baru Saja Mengajukan Izin (di DispensasiController@store)**

use App\\Services\\ExpoPushService;  
use App\\Models\\User;

// ... (kode insert tiket dari Fase 2\) ...

// Dapatkan Device Token dari Wali Kelas dan Guru Piket  
$guruTokens \= User::whereIn('id', \[$tiket-\>wali\_kelas\_id, $tiket-\>guru\_piket\_id\])  
                  \-\>whereNotNull('device\_token')  
                  \-\>pluck('device\_token')  
                  \-\>toArray();

if (\!empty($guruTokens)) {  
    // Tembak Notifikasi ke HP Guru  
    ExpoPushService::send(  
        $guruTokens,   
        '⏳ Pengajuan Dispensasi Baru',   
        "{$siswa-\>name} mengajukan izin: {$request-\>jenis\_izin}.",  
        \['ticket\_id' \=\> $tiket-\>id, 'type' \=\> 'new\_ticket'\]  
    );  
}

return response()-\>json(\['message' \=\> 'Tiket berhasil diajukan'\]);

### **Contoh 2: Notifikasi saat Guru Menyetujui Izin (di DispensasiController@approve)**

use App\\Services\\ExpoPushService;  
use App\\Models\\SiswaProfile;

// ... (logika update status menjadi approved\_final dari Fase 2\) ...

// Kirim ke HP Siswa  
$tokenSiswa \= $tiket-\>siswa-\>device\_token;  
if ($tokenSiswa) {  
    ExpoPushService::send(  
        $tokenSiswa,  
        '✅ Izin Disetujui\!',  
        'Izin Anda telah disetujui. Buka aplikasi untuk melihat QR Code.',  
        \['ticket\_id' \=\> $tiket-\>id, 'type' \=\> 'ticket\_approved'\]  
    );  
}

// Opsional: Kirim juga ke HP Orang Tua  
$profil \= SiswaProfile::where('user\_id', $tiket-\>siswa\_id)-\>first();  
if ($profil && $profil-\>orang\_tua\_id) {  
    $tokenOrtu \= User::find($profil-\>orang\_tua\_id)-\>device\_token;  
    if ($tokenOrtu) {  
         ExpoPushService::send(  
            $tokenOrtu,  
            '✅ Izin Anak Anda Disetujui',  
            "Izin sekolah {$tiket-\>siswa-\>name} telah diverifikasi oleh sekolah.",  
        );  
    }  
}

return response()-\>json(\['message' \=\> 'Tiket disetujui'\]);

## **Ceklis Penyelesaian Fase 5**

* \[ \] Fitur WebSocket Supabase (Replication) telah aktif di *dashboard*.  
* \[ \] Aplikasi Mobile sukses mendengarkan *event payload* pesan baru di layar Chat secara sinkronus.  
* \[ \] Fungsi registerForPushNotificationsAsync berjalan di Mobile dan berhasil meminta izin (*permission*) kepada OS Android/iOS.  
* \[ \] Backend Laravel berhasil mengeksekusi ExpoPushService::send() tanpa memblokir/menggagalkan proses pembuatan tiket (*silent error handling* melalui Log::error).  
* \[ \] Saat diuji di perangkat fisik (bukan simulator web), notifikasi pop-up muncul di atas layar ketika tiket baru diajukan atau disetujui.

Keberhasilan fase ini menandakan bahwa **Latensi Persetujuan** dan **Kesenjangan Informasi** yang menjadi masalah utama dalam Tugas Akhir Anda telah **terselesaikan 100% secara teknis**. Pengguna tidak perlu membuang waktu membuka aplikasi, informasi akan datang langsung ke layar ponsel mereka secara proaktif\!