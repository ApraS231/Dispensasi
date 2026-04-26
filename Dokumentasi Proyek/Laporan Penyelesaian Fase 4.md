# Laporan Penyelesaian Fase 4: Pengembangan Aplikasi Mobile (Expo)

Dokumen ini merekapitulasi seluruh pekerjaan yang telah diselesaikan pada **Fase 4 (Pengembangan UI Aplikasi Mobile)**, beserta kendala teknis dan solusinya.

---

## 🎯 FASE 4: Pengembangan Aplikasi Mobile (Expo + React Native)

Pada fase ini, kami membangun antarmuka aplikasi mobile untuk **4 peran pengguna**: Siswa, Guru Piket, Wali Kelas, dan Orang Tua. Aplikasi menggunakan **Expo Router** (file-based routing) dengan navigasi dinamis berdasarkan role.

### **Pekerjaan yang Telah Diselesaikan:**

1. **Instalasi Dependensi Tambahan**
   - `axios` — HTTP Client untuk komunikasi dengan Laravel API
   - `zustand` — State Management global (simpan user yang sedang login)
   - `expo-secure-store` — Penyimpanan Token API secara aman di device
   - `react-native-qrcode-svg` — Library render QR Code native

2. **Konfigurasi API & Auth Infrastructure**
   - **`src/utils/api.ts`**: Axios instance dengan interceptor otomatis yang menyematkan Bearer Token dari SecureStore ke setiap request.
   - **`src/stores/authStore.ts`**: Zustand store untuk mengelola state autentikasi global (user, token, loading, logout).

3. **Root Layout & Role-Based Navigation**
   - **`app/_layout.tsx`**: Root layout yang mengecek token saat startup. Jika valid, redirect ke dashboard sesuai role.
   - **`app/index.tsx`**: Splash/loading screen yang melakukan routing berdasarkan role user.
   - **`app/login.tsx`**: Layar login dengan integrasi Sanctum API. Setelah berhasil login, token disimpan ke SecureStore dan user di-redirect ke dashboard sesuai role.

4. **Modul Siswa** (`app/(siswa)/`)
   - **Dashboard** (`dashboard.tsx`): Menampilkan greeting, tombol ajukan dispensasi baru, dan riwayat tiket dengan badge status berwarna.
   - **Form Pengajuan** (`pengajuan.tsx`): Form dengan pilihan jenis izin (sakit/keluarga/lainnya), textarea alasan, dan submit ke API.
   - **QR Code** (`qr/[id].tsx`): Menampilkan QR Code dari `qr_code_token` untuk tiket yang berstatus `approved_final`.

5. **Modul Guru Piket** (`app/(piket)/`)
   - **Dashboard** (`dashboard.tsx`): Tombol toggle Ready/Checkout untuk menandai shift piket. Daftar tiket pending dengan tombol Setujui dan Tolak.

6. **Modul Wali Kelas** (`app/(wali)/`)
   - **Dashboard** (`dashboard.tsx`): Daftar tiket siswa yang menunggu persetujuan wali kelas dengan tombol approval.

7. **Modul Orang Tua** (`app/(ortu)/`)
   - **Dashboard** (`dashboard.tsx`): Monitoring riwayat dispensasi anak-anak yang terdaftar.

8. **UI Chat Tiket** (`app/chat/[id].tsx`)
   - Antarmuka obrolan mirip WhatsApp yang terhubung ke `TicketChatController`.
   - Menggunakan polling 5 detik (akan diupgrade ke WebSocket real-time di Fase 5).

### **Kendala (Issues) & Solusi (Resolutions):**

1. **[PowerShell && Operator]**
   - **Kendala:** Operator `&&` untuk menjalankan beberapa perintah npm berurutan tidak didukung di PowerShell versi lama.
   - **Solusi:** Menjalankan setiap perintah npm secara terpisah (`npm install axios zustand ...` dan `npx expo install expo-secure-store`).

2. **[Missing @types/react-native]**
   - **Kendala:** TypeScript compiler mengeluarkan warning `TS7016: Could not find a declaration file for module 'react-native'`. Ini adalah kondisi standar di project Expo (tipe sudah disediakan oleh Expo sendiri).
   - **Solusi:** Menambahkan `skipLibCheck: true` dan `noImplicitAny: false` di `tsconfig.json` untuk menekan warning non-kritis ini.

---

### **Struktur File yang Dibuat:**

```
mobile-app/
├── app/
│   ├── _layout.tsx                 ← Root Layout + Auth Check
│   ├── index.tsx                   ← Splash + Role-based Redirect
│   ├── login.tsx                   ← Login Screen (Sanctum)
│   ├── (siswa)/
│   │   ├── _layout.tsx             ← Stack Navigator (amber)
│   │   ├── dashboard.tsx           ← Riwayat Dispensasi
│   │   ├── pengajuan.tsx           ← Form Pengajuan
│   │   └── qr/[id].tsx            ← QR Code Viewer
│   ├── (piket)/
│   │   ├── _layout.tsx             ← Stack Navigator (blue)
│   │   └── dashboard.tsx           ← Ready Toggle + Approval
│   ├── (wali)/
│   │   ├── _layout.tsx             ← Stack Navigator (violet)
│   │   └── dashboard.tsx           ← Wali Approval
│   ├── (ortu)/
│   │   ├── _layout.tsx             ← Stack Navigator (green)
│   │   └── dashboard.tsx           ← Monitoring Anak
│   └── chat/
│       └── [id].tsx                ← Chat UI (Polling)
├── src/
│   ├── utils/api.ts                ← Axios + Token Interceptor
│   └── stores/authStore.ts         ← Zustand Auth Store
└── tsconfig.json                   ← Updated
```

---

### **Warna Tema Per Role:**
| Role | Warna Header | Hex |
|---|---|---|
| Siswa | Amber | `#F59E0B` |
| Guru Piket | Blue | `#3B82F6` |
| Wali Kelas | Violet | `#8B5CF6` |
| Orang Tua | Green | `#10B981` |

---

### **Cara Menjalankan Aplikasi Mobile:**

```bash
cd "C:\laragon\www\SIdispen (SMA 3)\mobile-app"
npx expo start
```
Kemudian scan QR Code dengan Expo Go di HP atau tekan `a` untuk emulator Android.

> **Penting:** Pastikan Laravel server berjalan (`php artisan serve`) agar API bisa diakses dari aplikasi mobile. Untuk emulator Android, gunakan `http://10.0.2.2:8000/api` di `.env`.

---

**Status Keseluruhan Fase 4**: ✅ **SELESAI**. Seluruh antarmuka mobile untuk 4 role pengguna telah terbangun dengan integrasi API. Proyek siap dilanjutkan ke **Fase 5: Real-Time & Push Notifications**.
