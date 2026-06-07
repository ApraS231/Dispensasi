# **Arsitektur & Skema Push Notification (SiDispen)**

Dokumen ini merincikan spesifikasi teknis, alur data, skema berbasis peran (RBAC), dan langkah-langkah implementasi untuk fitur Push Notification di aplikasi mobile SiDispen.

## **1\. Tumpukan Teknologi (Tech Stack)**

Sistem notifikasi SiDispen menggunakan arsitektur *Server-to-Service* untuk menjamin pengiriman pesan lintas platform (iOS & Android) tanpa kerumitan konfigurasi *native*.

* **Notification Gateway:** **Expo Push Notifications API**.  
  * *Fungsi:* Menjembatani server backend kita dengan Apple Push Notification service (APNs) dan Firebase Cloud Messaging (FCM). Gratis, sangat cepat, dan mudah diintegrasikan.  
* **Backend Trigger:** **Laravel 11**.  
  * *Fungsi:* Menjalankan logika bisnis (kapan notifikasi harus dikirim, kepada siapa, dan apa isinya). Laravel menggunakan Illuminate\\Support\\Facades\\Http untuk menembak API Expo secara asinkron (*Queue*).  
* **Mobile Client:** **React Native (Expo) & expo-notifications**.  
  * *Fungsi:* Meminta izin (permissions) kepada OS HP pengguna, menghasilkan *Expo Push Token* unik, dan menangkap notifikasi baik saat aplikasi aktif (*foreground*) maupun tertutup (*background*).  
* **Database:** **Supabase (PostgreSQL)**.  
  * *Fungsi:* Menyimpan *Push Token* di tabel users dan menyimpan riwayat notifikasi (In-App Notification) di tabel notifications.

## **2\. Alur Data Notifikasi (Data Flow)**

Alur notifikasi dibagi menjadi dua fase utama: **Fase Registrasi Token** dan **Fase Eksekusi (Broadcast)**.

### **A. Fase Registrasi Token (Saat Login)**

1. **\[Mobile\]** Pengguna (Siswa/Guru) membuka aplikasi dan berhasil *Login*.  
2. **\[Mobile\]** Pustaka expo-notifications meminta izin kepada OS (iOS/Android). Jika diizinkan, aplikasi meminta token ke server Expo.  
3. **\[Mobile\]** Expo Server membalas dengan string token unik (Contoh: ExponentPushToken\[xxxxxxxxxxxxxxxxxxxxxx\]).  
4. **\[Mobile \-\> Backend\]** Aplikasi mengirim token tersebut ke API POST /api/user/device-token.  
5. **\[Backend \-\> Database\]** Laravel menyimpan token tersebut ke kolom device\_token di tabel users pada Supabase.

### **B. Fase Eksekusi (Contoh: Tiket Baru)**

1. **\[Siswa\]** Mengajukan form izin via aplikasi.  
2. **\[Backend\]** Laravel memproses data, melakukan *Auto-Assignment* mencari Guru Piket & Wali Kelas.  
3. **\[Backend \-\> Expo\]** Laravel menarik device\_token milik Guru Piket & Wali Kelas dari Supabase, lalu mengirim payload JSON ke https://exp.host/--/api/v2/push/send.  
4. **\[Expo \-\> APNs/FCM\]** Expo merutekan pesan ke server Apple atau Google.  
5. **\[APNs/FCM \-\> Device\]** OS HP Guru memunculkan *banner/pop-up* notifikasi berbunyi/bergetar.  
6. **\[Guru\]** Mengklik notifikasi, aplikasi SiDispen terbuka dan langsung diarahkan (*Deep Linking*) ke halaman Detail Tiket.

## **3\. Matriks Skema Notifikasi Berdasarkan Peran (Role-Based)**

Berikut adalah daftar kejadian (*events*) yang akan memicu notifikasi sesuai dengan peran pengguna:

### **1\. Peran: Wali Kelas**

| Event (Trigger) | Judul Notifikasi (Title) | Isi Pesan (Body) | Aksi Saat Diklik (Deep Link) |
| :---- | :---- | :---- | :---- |
| Siswa Mengajukan Izin | 📝 Izin Baru Kelas Anda | "\[Nama Siswa\] mengajukan izin \[Jenis Izin\]." | Buka /wali/tiket/\[id\] |
| Pesan Chat Baru | 💬 Pesan Baru | "\[Nama\]: \[Isi Pesan\]" | Buka /shared/ticket-detail/\[id\] |

### **2\. Peran: Guru Piket**

| Event (Trigger) | Judul Notifikasi (Title) | Isi Pesan (Body) | Aksi Saat Diklik (Deep Link) |
| :---- | :---- | :---- | :---- |
| Wali Kelas Approve (Tiket Masuk Antrean Piket) | ⏳ Butuh Persetujuan Final | "Izin \[Nama Siswa\] menunggu validasi Anda." | Buka /piket/tiket/\[id\] |
| Pesan Chat Baru | 💬 Pesan Baru | "\[Nama\]: \[Isi Pesan\]" | Buka /shared/ticket-detail/\[id\] |

### **3\. Peran: Siswa**

| Event (Trigger) | Judul Notifikasi (Title) | Isi Pesan (Body) | Aksi Saat Diklik (Deep Link) |
| :---- | :---- | :---- | :---- |
| Izin Disetujui (Final) | ✅ Izin Disetujui\! | "QR Code terbit. Silakan menuju meja piket." | Buka /siswa/qr-code/\[id\] |
| Izin Ditolak | ❌ Izin Ditolak | "Maaf, izin Anda ditolak. Ketuk untuk detail." | Buka /siswa/tiket/\[id\] |
| Pesan Chat Baru | 💬 Pertanyaan dari Guru | "\[Nama Guru\]: \[Isi Pesan\]" | Buka /shared/ticket-detail/\[id\] |

### **4\. Peran: Orang Tua**

| Event (Trigger) | Judul Notifikasi (Title) | Isi Pesan (Body) | Aksi Saat Diklik (Deep Link) |
| :---- | :---- | :---- | :---- |
| Anak Mengajukan Izin | ℹ️ Info Kehadiran | "Anak Anda, \[Nama\], mengajukan izin sekolah." | Buka /ortu/log/\[id\] |
| Izin Disetujui | ✅ Izin Diverifikasi | "Sekolah telah menyetujui izin anak Anda." | Buka /ortu/log/\[id\] |
| Anak Keluar Gerbang (QR Discan) | 🚪 Anak Keluar Sekolah | "\[Nama\] baru saja tervalidasi keluar gerbang." | Buka /ortu/log/\[id\] |

## **4\. Langkah Implementasi: Setup Supabase & Backend**

### **A. Persiapan Database (Supabase)**

Pastikan kolom dan tabel pendukung sudah ada (sesuai DBML di Fase 1):

1. Pastikan tabel users memiliki kolom device\_token (Tipe: VARCHAR).  
2. Pastikan tabel notifications tersedia untuk menyimpan *log* notifikasi (agar pengguna bisa melihat riwayat notifikasi di dalam aplikasi meskipun *push* di HP terhapus).

### **B. Service Backend (Laravel)**

Buat *class* khusus di Laravel untuk menangani komunikasi dengan Expo API.

1. Buat file app/Services/ExpoPushService.php:

namespace App\\Services;

use Illuminate\\Support\\Facades\\Http;  
use Illuminate\\Support\\Facades\\Log;

class ExpoPushService  
{  
    public static function send($tokens, $title, $body, $data \= \[\])  
    {  
        // Pastikan token bentuknya array  
        $tokens \= is\_array($tokens) ? $tokens : \[$tokens\];  
          
        // Buat format payload sesuai dokumentasi Expo  
        $messages \= \[\];  
        foreach ($tokens as $token) {  
            if (empty($token)) continue;  
              
            $messages\[\] \= \[  
                'to' \=\> $token,  
                'sound' \=\> 'default',  
                'title' \=\> $title,  
                'body' \=\> $body,  
                'data' \=\> $data, // Contoh: \['url' \=\> '/siswa/qr-code/123'\]  
            \];  
        }

        if (empty($messages)) return;

        try {  
            // Tembak API Expo  
            Http::withHeaders(\[  
                'Accept' \=\> 'application/json',  
                'Accept-Encoding' \=\> 'gzip, deflate',  
                'Content-Type' \=\> 'application/json',  
            \])-\>post('\[https://exp.host/--/api/v2/push/send\](https://exp.host/--/api/v2/push/send)', $messages);  
              
        } catch (\\Exception $e) {  
            Log::error("Expo Push Notification Error: " . $e-\>getMessage());  
        }  
    }  
}

2. **Trigger di Controller:** Panggil *service* ini di bagian logika yang tepat (misal: saat DispensasiController@store atau approve).

## **5\. Langkah Implementasi: Setup Mobile App (Expo)**

### **A. Instalasi Pustaka**

Jalankan di dalam folder mobile-app:

npx expo install expo-notifications expo-device expo-constants

### **B. Membuat Custom Hook (usePushNotifications.ts)**

Buat file *helper* di folder src/hooks/usePushNotifications.ts untuk memisahkan logika yang panjang dari UI komponen.

import { useState, useEffect, useRef } from 'react';  
import \* as Device from 'expo-device';  
import \* as Notifications from 'expo-notifications';  
import Constants from 'expo-constants';  
import { Platform } from 'react-native';  
import api from '../utils/api'; // Axios instance Anda

// Konfigurasi agar notif muncul di atas layar (heads-up) walau aplikasi sedang dibuka  
Notifications.setNotificationHandler({  
  handleNotification: async () \=\> ({  
    shouldShowAlert: true,  
    shouldPlaySound: true,  
    shouldSetBadge: false,  
  }),  
});

export const usePushNotifications \= () \=\> {  
  const \[expoPushToken, setExpoPushToken\] \= useState('');  
  const \[notification, setNotification\] \= useState\<Notifications.Notification | false\>(false);  
  const notificationListener \= useRef\<Notifications.Subscription\>();  
  const responseListener \= useRef\<Notifications.Subscription\>();

  useEffect(() \=\> {  
    // 1\. Minta Izin & Generate Token  
    registerForPushNotificationsAsync().then(token \=\> {  
        if (token) {  
            setExpoPushToken(token);  
            // Simpan token ke database Laravel via API  
            api.post('/user/device-token', { device\_token: token }).catch(console.error);  
        }  
    });

    // 2\. Listener: Saat notifikasi masuk dan aplikasi sedang aktif (Foreground)  
    notificationListener.current \= Notifications.addNotificationReceivedListener(notification \=\> {  
      setNotification(notification);  
    });

    // 3\. Listener: Saat notifikasi DITEKAN (Background/Killed state) \-\> Deep Linking  
    responseListener.current \= Notifications.addNotificationResponseReceivedListener(response \=\> {  
      const data \= response.notification.request.content.data;  
      // Logika pindah halaman berdasarkan data.url  
      if (data && data.url) {  
         // router.push(data.url); // Menggunakan expo-router  
      }  
    });

    return () \=\> {  
      if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);  
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);  
    };  
  }, \[\]);

  return { expoPushToken, notification };  
};

// Fungsi inti untuk mendapatkan token  
async function registerForPushNotificationsAsync() {  
  let token;

  if (Platform.OS \=== 'android') {  
    await Notifications.setNotificationChannelAsync('default', {  
      name: 'default',  
      importance: Notifications.AndroidImportance.MAX,  
      vibrationPattern: \[0, 250, 250, 250\],  
      lightColor: '\#50EB63', // Warna hijau Skeuo-Glass palet Anda  
    });  
  }

  if (Device.isDevice) {  
    const { status: existingStatus } \= await Notifications.getPermissionsAsync();  
    let finalStatus \= existingStatus;  
    if (existingStatus \!== 'granted') {  
      const { status } \= await Notifications.requestPermissionsAsync();  
      finalStatus \= status;  
    }  
    if (finalStatus \!== 'granted') {  
      alert('Gagal mendapatkan izin Push Notification\!');  
      return;  
    }  
      
    // Ambil Project ID dari app.json secara dinamis  
    const projectId \= Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;  
    token \= (await Notifications.getExpoPushTokenAsync({ projectId })).data;  
  } else {  
    console.log('Harus menggunakan Physical Device untuk Push Notif');  
  }

  return token;  
}

### **C. Menerapkan Hook di Aplikasi Utama**

Panggil *hook* ini di *entry point* aplikasi Anda, misalnya di app/\_layout.tsx (jika menggunakan Expo Router) atau App.tsx agar ia berjalan di *background* sejak aplikasi dibuka.

// app/\_layout.tsx  
import { Slot } from 'expo-router';  
import { GluestackUIProvider } from '@gluestack-ui/themed';  
import { usePushNotifications } from '../src/hooks/usePushNotifications';

export default function RootLayout() {  
  // Hook ini akan otomatis meminta izin, generate token, dan menyimpannya di DB  
  const { expoPushToken } \= usePushNotifications(); 

  return (  
    \<GluestackUIProvider\>  
      \<Slot /\>  
    \</GluestackUIProvider\>  
  );  
}

## **6\. Kesimpulan Strategi**

Dengan memisahkan layanan Expo Push melalui *Laravel Backend*, kita memastikan bahwa perangkat seluler tidak dibebani oleh komputasi pencarian pengguna. Laravel bertindak sebagai komandan pusat (*brain*) yang tahu persis *kapan* dan *kepada siapa* notifikasi harus ditembakkan, sementara Expo (React Native) murni berfungsi sebagai pendengar dan pengarah (*router*) ketika notifikasi tersebut ditekan.