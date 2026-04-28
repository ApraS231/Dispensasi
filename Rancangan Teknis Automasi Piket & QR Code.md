# **Arsitektur Teknis Automasi Piket & Validasi QR Code**

Dokumen ini merincikan spesifikasi teknis untuk dua modul kritis: **Sistem Distribusi Tiket Otomatis (Auto-Routing)** berdasarkan jadwal server, dan **Sistem Validasi Gerbang (Gatekeeper)** menggunakan QR Code.

## **1\. Tumpukan Teknologi (Tech Stack)**

* **Backend & Logic Engine:** **Laravel 11**. Menggunakan *Carbon* untuk komputasi zona waktu (Timezone) yang akurat, dan *Eloquent ORM* untuk pencarian jadwal aktif.  
* **Mobile Client (Frontend):** **React Native (Expo)**.  
  * react-native-qrcode-svg: Untuk me-render/menggambar string token menjadi gambar QR 2D di layar HP Siswa.  
  * expo-camera: Digunakan oleh Guru Piket untuk memindai layar HP Siswa.  
* **Database:** **PostgreSQL (Supabase)**. Menyimpan jadwal master dan token kriptografis QR.

## **2\. Definisi Peran (Role-Based Workflow)**

Modul ini melibatkan transisi data melintasi 3 peran utama:

1. **Admin (Web):** *Data Entry*. Membuat Master Jadwal Piket (Hari, Jam Mulai, Jam Selesai, dan Nama Guru Piket).  
2. **Wali Kelas (Mobile):** *Lapis Persetujuan 1*. Menyetujui alasan izin akademik. Persetujuan ini menjadi *trigger* (pemicu) tiket dilempar ke Guru Piket aktif.  
3. **Guru Piket (Mobile):** *Lapis Persetujuan 2 & Validator Akhir*. Menerima tiket ke *dashboard*\-nya secara otomatis berdasarkan jadwal server. Setelah Guru Piket menyetujui secara sistem, QR Code akan terbit di HP Siswa. Saat Siswa menghadap ke meja piket untuk keluar, Guru Piket membuka fitur "Kamera Pindai", menyorot HP Siswa, dan mengunci tiket menjadi status "Telah Keluar".

## **3\. Parameter Keberhasilan (Success Metrics & KPIs)**

1. **Auto-Routing Accuracy (100%):** Sistem tidak boleh melempar tiket ke Guru Piket yang jadwalnya sudah lewat atau belum dimulai (Berdasarkan Waktu Indonesia / Waktu Server lokal).  
2. **Scan Latency (\< 1 Detik):** Kecepatan dari kamera Guru Piket memindai QR Code hingga muncul status "Valid/Invalid" di layar harus instan.  
3. **Cryptographic Security (Anti-Fraud):** Siswa tidak bisa men- *screenshot* QR Code teman dan menggunakannya. QR Code menggunakan UUID V4 unik per tiket, bukan ID Siswa.

## **4\. Perubahan Skema Database (Supabase)**

Kita membutuhkan penyesuaian pada tabel master jadwal dan penambahan kolom pelacakan QR di tabel tiket.

\-- 1\. Tabel Master Jadwal Piket (Dikelola Admin)  
CREATE TABLE piket\_schedules (  
    id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),  
    guru\_id UUID NOT NULL REFERENCES users(id),  
    hari\_dalam\_minggu INTEGER NOT NULL, \-- 1=Senin, 2=Selasa, dst  
    jam\_mulai TIME NOT NULL, \-- Contoh: '07:00:00'  
    jam\_selesai TIME NOT NULL, \-- Contoh: '12:00:00'  
    is\_active BOOLEAN DEFAULT TRUE  
);

\-- 2\. Modifikasi Tabel Tiket (dispensasi\_tickets)  
ALTER TABLE dispensasi\_tickets  
ADD COLUMN qr\_token UUID UNIQUE, \-- Token rahasia di dalam QR Code  
ADD COLUMN scanned\_at TIMESTAMP WITH TIME ZONE, \-- Waktu validasi di gerbang  
ADD COLUMN scanner\_id UUID REFERENCES users(id); \-- Guru Piket yang memindai

## **5\. Implementasi Backend (Laravel API)**

### **A. Logika "Auto-Assignment" Tanpa Cron Job (Pendekatan Dinamis)**

Daripada membuat sistem *Cron Job* yang mengubah status "Ready" setiap menit (yang rawan *bug* server mati), kita menggunakan **Dynamic Query**. Sistem akan mencari Guru Piket mana yang sedang bertugas *pada detik tiket tersebut disetujui oleh Wali Kelas*.

// app/Http/Controllers/Api/TicketApprovalController.php

public function approveWaliKelas(Request $request, $ticketId) {  
    $ticket \= DispensasiTicket::findOrFail($ticketId);  
      
    // 1\. Dapatkan Waktu Server Saat Ini  
    $now \= now();  
    $hariIni \= $now-\>dayOfWeekIso; // 1 (Senin) \- 7 (Minggu)  
    $jamIni \= $now-\>format('H:i:s');

    // 2\. Cari Guru Piket yang jadwalnya cocok dengan DETIK INI  
    $activeSchedule \= PiketSchedule::where('hari\_dalam\_minggu', $hariIni)  
        \-\>where('jam\_mulai', '\<=', $jamIni)  
        \-\>where('jam\_selesai', '\>=', $jamIni)  
        \-\>where('is\_active', true)  
        \-\>first();

    if (\!$activeSchedule) {  
        return response()-\>json(\['message' \=\> 'Tidak ada Guru Piket yang bertugas saat ini.'\], 404);  
    }

    // 3\. Auto-Assignment & Update Status  
    $ticket-\>update(\[  
        'status' \=\> 'waiting\_piket',  
        'guru\_piket\_id' \=\> $activeSchedule-\>guru\_id // Di-assign ke guru piket yang ditemukan  
    \]);

    // 4\. Trigger Push Notification ke Guru Piket  
    // ... logic Expo Push Service ...

    return response()-\>json(\['message' \=\> 'Disetujui. Tiket diteruskan ke Guru Piket.'\]);  
}

### **B. Logika Penerbitan & Validasi QR Code**

// 1\. Saat Guru Piket Menyetujui (Generate Token)  
public function approvePiket(Request $request, $ticketId) {  
    $ticket \= DispensasiTicket::findOrFail($ticketId);  
      
    // Generate UUID V4 yang sangat acak dan mustahil ditebak  
    $ticket-\>update(\[  
        'status' \=\> 'approved\_final',  
        'qr\_token' \=\> \\Illuminate\\Support\\Str::uuid()   
    \]);  
    // ... Notif ke HP Siswa bahwa QR sudah terbit ...  
}

// 2\. Saat Guru Piket Memindai QR Code  
public function validateQR(Request $request) {  
    $request-\>validate(\['qr\_token' \=\> 'required|uuid'\]);

    $ticket \= DispensasiTicket::where('qr\_token', $request-\>qr\_token)-\>first();

    if (\!$ticket) {  
        return response()-\>json(\['valid' \=\> false, 'message' \=\> 'QR Code Palsu / Tidak Dikenali'\], 404);  
    }

    if ($ticket-\>scanned\_at \!== null) {  
        return response()-\>json(\['valid' \=\> false, 'message' \=\> 'QR Code ini sudah pernah dipakai\!'\], 400);  
    }

    // Jika Valid, kunci tiket  
    $ticket-\>update(\[  
        'status' \=\> 'completed\_exit',  
        'scanned\_at' \=\> now(),  
        'scanner\_id' \=\> $request-\>user()-\>id  
    \]);

    return response()-\>json(\['valid' \=\> true, 'message' \=\> 'Izin Sah. Siswa divalidasi untuk keluar.', 'data' \=\> $ticket\]);  
}

## **6\. Implementasi Mobile App (Expo / React Native)**

### **A. Tampilan QR Code (Role: Siswa)**

Menggunakan tema *Liquid Glass*, QR code diletakkan di tengah layar layaknya ID Card fisik.

npm install react-native-qrcode-svg

import QRCode from 'react-native-qrcode-svg';  
// ...  
export default function ShowQRScreen({ ticket }) {  
  // Hanya tampilkan jika status sudah final dan qr\_token tersedia  
  if (ticket.status \!== 'approved\_final' || \!ticket.qr\_token) return \<Loader /\>;

  return (  
     \<Box bg="$white" p="$6" borderRadius="$2xl" style={{ elevation: 5 }}\>  
        {/\* Mengubah UUID dari backend menjadi gambar Barcode 2D \*/}  
        \<QRCode  
           value={ticket.qr\_token} // Ini yang akan dibaca oleh HP Guru Piket  
           size={250}  
           color="black"  
           backgroundColor="transparent"  
        /\>  
        \<Text mt="$4" fontFamily="Poppins" fontWeight="bold"\>Tunjukkan ini ke Guru Piket\</Text\>  
     \</Box\>  
  );  
}

### **B. Pemindai QR (Role: Guru Piket)**

Menggunakan pustaka kamera resmi Expo. Layar akan membuka kamera belakang secara penuh.

npx expo install expo-camera

import { CameraView, useCameraPermissions } from 'expo-camera';  
import { useState } from 'react';  
import api from '../../src/utils/api';

export default function QRScannerScreen() {  
  const \[permission, requestPermission\] \= useCameraPermissions();  
  const \[scanned, setScanned\] \= useState(false);

  // Jika izin belum diberikan, tampilkan tombol Minta Izin  
  if (\!permission?.granted) return \<Button onPress={requestPermission}\>\<Text\>Buka Kamera\</Text\>\</Button\>;

  // Fungsi yang dipanggil otomatis saat kamera mendeteksi pola QR Code  
  const handleBarCodeScanned \= async ({ type, data }) \=\> {  
    setScanned(true); // Kunci kamera agar tidak scan berkali-kali  
      
    try {  
      // Kirim data UUID hasil pindaian ke Laravel  
      const res \= await api.post('/qr/validate', { qr\_token: data });  
      alert("✅ BERHASIL: " \+ res.data.message);   
      // Layar hijau / Suara Beep Sukses  
    } catch (err) {  
      alert("❌ DITOLAK: " \+ err.response.data.message);  
      // Layar merah / Suara Beep Gagal  
    } finally {  
      // Delay sedikit sebelum membuka kamera lagi  
      setTimeout(() \=\> setScanned(false), 2000);   
    }  
  };

  return (  
    \<Box flex={1}\>  
      \<CameraView  
        style={{ flex: 1 }}  
        facing="back"  
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}  
        barcodeScannerSettings={{  
          barcodeTypes: \["qr"\], // Fokus hanya mencari QR Code  
        }}  
      \>  
        {/\* Layout UI Pembidik (Crosshair) bergaya Kaca (Skeuo-Glass) di sini \*/}  
      \</CameraView\>  
    \</Box\>  
  );  
}

### **Analisis Keunggulan Pendekatan Ini:**

1. **Hilangnya Fitur "Set Ready" Manual:** Dengan memindahkan logika ke Backend (Mencari jadwal yang cocok pada waktu now()), Guru Piket terbebas dari tugas administratif menekan tombol di aplikasi. Ini sejalan dengan prinsip *automation* yang cerdas. Di *dashboard* Guru Piket, desain antarmuka cukup diubah menjadi tulisan status: **"Jadwal Anda Sedang Aktif"** atau **"Belum Masuk Jadwal"**.  
2. **Keamanan QR Tingkat Tinggi:** Kita menggunakan UUID v4 (Contoh: e4b52c1a-...) sebagai nilai QR, bukan ID Tiket (Contoh: 123). Mengapa? Jika kita menggunakan ID Tiket, siswa nakal bisa membuat QR Code palsu (menggunakan aplikasi pihak ketiga) dengan nomor 124 atau 125 untuk mengelabui pos jaga. Dengan UUID, kode tersebut tidak mungkin bisa ditebak (karena *random*).  
3. **Mencegah Penggunaan Ulang (Reusability Prevented):** Begitu dipindai oleh Guru Piket, kolom scanned\_at akan terisi tanggal. Jika anak tersebut memberikan tangkapan layar (Screenshot) QR Code-nya ke temannya, saat temannya memindai HP di hadapan Guru Piket, sistem akan menolak dengan peringatan: "QR Code ini sudah pernah dipakai\!".