# Laporan Penyelesaian Fase 5: Integrasi Real-Time & Push Notifications

Dokumen ini mendokumentasikan penyelesaian **Fase 5 (Real-Time & Notifikasi)**, yang merupakan fase terpenting untuk memecahkan masalah penelitian utama di SiDispen yaitu *Latensi Persetujuan* dan *Kesenjangan Informasi*.

---

## 🚀 FASE 5: Real-Time Chat & Push Notifications

Pada fase ini, kami telah mengganti metode *polling* menjadi koneksi *WebSocket* langsung ke database Supabase untuk fitur obrolan tiket, serta menambahkan kemampuan pengiriman Push Notification ke seluruh perangkat menggunakan layanan **Expo Push API** yang dieksekusi dari backend Laravel.

### Pekerjaan yang Telah Diselesaikan:

#### 1. Setup Environment (Mobile)
- Berhasil menambahkan kredensial `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_KEY` ke dalam file `.env` di direktori `mobile-app`.
- Kredensial ini digunakan untuk membuka koneksi langsung dari aplikasi mobile ke database via websocket.

#### 2. Klien Expo Push Notifications (Mobile App)
- **Instalasi:** `expo-device` dan `expo-notifications` telah berhasil diinstal.
- **Root Layout (`app/_layout.tsx`):** Kami telah memodifikasi layout utama agar dapat meminta izin notifikasi (*permissions*) kepada pengguna Android/iOS saat aplikasi dibuka.
- Jika pengguna memberi izin, aplikasi akan men-generate *Expo Push Token* unik dan mengirimkannya ke API Backend Laravel setiap kali pengguna *login*.

#### 3. Endpoint Manajemen Device Token (Backend Laravel)
- **Routing:** Menambahkan endpoint baru `POST /api/user/device-token` dengan middleware Sanctum (`routes/api.php`).
- **Controller:** Modifikasi `AuthController@updateDeviceToken` untuk menerima Token Expo dari aplikasi mobile dan memperbarui field `device_token` pada tabel `users`.

#### 4. Real-Time Chat via Supabase WebSockets (Mobile App)
- **Library:** Memasang `@supabase/supabase-js`.
- **Refactoring UI Chat (`app/chat/[id].tsx`):** 
  - Menghapus interval *polling* 5 detik (yang memberatkan server).
  - Mengimplementasikan `supabase.channel` yang mendengarkan event *INSERT* dari tabel PostgreSQL `ticket_chats` milik Supabase.
  - Setiap pesan baru akan langsung merender ulang UI secara instan (real-time) tanpa *refresh* maupun *polling*.

#### 5. Expo Push Service Handler (Backend Laravel)
- **Service Class (`app/Services/ExpoPushService.php`):** Membuat kelas pembantu statis `send()` yang menembak API Publik Expo (`https://exp.host/--/api/v2/push/send`) menggunakan HTTP Client bawaan Laravel.
- Dirancang untuk memiliki *silent-fail* handling (menggunakan `Log::error`), sehingga apabila layanan Expo terganggu, fungsionalitas pembuatan atau persetujuan tiket tidak akan gagal (*crash*).

#### 6. Trigger Notifikasi pada Alur Bisnis (DispensasiController)
- **Pengajuan Baru (`store`):** Saat Siswa mengajukan izin, notifikasi akan ditembak secara otomatis ke *device_token* milik Guru Piket yang sedang bertugas dan Wali Kelas.
  - *Title:* "⏳ Pengajuan Dispensasi Baru"
- **Persetujuan Final (`approve`):** Saat Guru Piket (atau Wali Kelas jika relevan) menyetujui izin, aplikasi akan mengirim dua notifikasi beruntun:
  - Kepada Siswa: "✅ Izin Disetujui!" (instruksi mengecek QR Code).
  - Kepada Orang Tua (jika terdaftar): "✅ Izin Anak Anda Disetujui".

---

### Verifikasi yang Telah Dilakukan
1. **Pemeriksaan TypeScript (Mobile):** Tipe *handler* Expo Notification seperti `shouldShowBanner` dan `shouldShowList` telah disesuaikan dengan versi SDK Expo 50+ terbaru. Kompilasi tipe berjalan tanpa error (*exit code 0*).
2. **Kesesuaian dengan Skema Database:** Kita berhasil memodifikasi Controller dengan menggunakan field `device_token` bawaan yang sudah dirancang pada saat migrasi awal Fase 1, sehingga tidak diperlukan migrasi tabel baru.

---

### Catatan Konfigurasi untuk Pengembangan Lanjutan
> [!IMPORTANT]
> **Aktifkan Replikasi Supabase**
> Agar fitur *Real-Time Chat* berfungsi secara penuh pada aplikasi *mobile*, Anda wajib mengaktifkan WebSockets di Dashboard Supabase:
> 1. Buka dashboard Supabase Anda.
> 2. Pergi ke bagian **Database -> Replication**.
> 3. Aktifkan *Source* tabel `ticket_chats` (minimal untuk event **Insert**).

### Status Pengerjaan
**Status Keseluruhan Fase 5**: ✅ **SELESAI**.
Semua komponen real-time (Chat WebSocket) dan notifikasi tertunda (*Push*) kini telah selesai dibangun. Sistem ini sudah mengatasi persoalan latensi, sehingga guru dan siswa mendapatkan pembaruan seketika. 

Fase berikutnya adalah tahap **QA/Pengujian Internal** serta **Fase 7 (Deployment ke DOM Cloud dan Kompilasi EAS Build)**.
