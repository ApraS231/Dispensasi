# Laporan Implementasi UI/UX SiDispen (Fase 1: Foundation)

Dokumen ini merupakan laporan penyelesaian dan dokumentasi teknis dari Fase 1 perombakan antarmuka (UI) aplikasi mobile SiDispen untuk mengadopsi sistem desain **Skeuo-Glass** secara penuh.

## 1. Perubahan Arsitektur Dasar

### A. Penggunaan Font: Plus Jakarta Sans
Berdasarkan *Design System* (Stitch) dan keputusan pengembangan, aplikasi telah sepenuhnya bermigrasi menggunakan **Plus Jakarta Sans** sebagai tipografi utama.
- **Kelebihan**: Font geometris modern dengan tingkat keterbacaan tinggi untuk interface digital, memberikan kesan "teknologi masa kini" yang kuat.
- **Implementasi**: Paket `@expo-google-fonts/plus-jakarta-sans` telah diinstal. Font dimuat secara asinkron di dalam file root `app/_layout.tsx` menggunakan `useFonts` hook untuk 4 ketebalan: Regular (400), Medium (500), SemiBold (600), dan Bold (700).

### B. Transisi ke Bottom Tab Navigation
Aplikasi telah meninggalkan pola navigasi Stack tunggal dan beralih ke arsitektur **Bottom Tab Navigation** berbasis *file-routing* dari Expo Router.
- **Alasan**: Memberikan pengalaman navigasi dashboard standar industri di mana pengguna dapat berpindah konteks utama (seperti Dashboard, Riwayat, Profil) dengan satu sentuhan ibu jari tanpa perlu menggunakan tombol *back*.
- **Implementasi**: Layout untuk setiap grup *role* (`(siswa)/_layout.tsx`, `(piket)/_layout.tsx`, dll) diubah dari `<Stack>` ke sistem `<Tabs>`. 

## 2. Pembaruan Design System Tokens (`theme.ts`)

File tema utama telah dibangun ulang untuk menampung token-token desain baru yang sesuai dengan pedoman Skeuo-Glass dan Golden Ratio:

1. **Warna Dominan & Material (60/30/10 Ratio)**:
   - *Surface / Dominan (60%)*: Ditambahkan variasi warna `surface` dari `#f5fceb` hingga `#eff6e5`.
   - *Glass / Sekunder (30%)*: Menambahkan `glassHighlight` (`rgba(255, 255, 255, 0.8)`) untuk efek specular/pantulan cahaya kaca pada sisi atas komponen.
   - *Aksen (10%)*: Mempertahankan `#50EB63` (Hijau Terang) dan `#EBD350` (Kuning Emas) untuk focal points.
2. **Typography Presets**: Dibuat pemetaan ukuran font `h1`, `h2`, `h3`, `bodyLg`, `bodyMd`, dan khusus untuk `labelCaps` (huruf kapital dengan *letter-spacing* lebar 0.6px).
3. **Spacing & Sizing**: Skala spasi (`sm`, `md`, `lg`) dinormalisasi dengan kelipatan 8px, sesuai dengan *Golden Grid*.

## 3. Komponen UI Universal Baru

### A. `TopAppBar.tsx`
Komponen *header* universal yang menggantikan header default dari router.
- **Fungsi**: Digunakan di semua halaman dashboard utama.
- **Struktur**: Menampilkan Avatar (kiri), Judul "SiDispen" (tengah), dan Ikon Lonceng Notifikasi (kanan).
- **Styling**: Memiliki padding atas dinamis `SPACING.statusBar` untuk menghindari *notch/status bar* di perangkat Android/iOS, serta transparan agar efek latar belakang tembus (*glassmorphism*) dapat bekerja maksimal.

### B. `BottomTabBar.tsx`
Komponen navigasi kustom per *role* pengguna.
- **Fungsi**: Menampilkan daftar tab yang berbeda-beda untuk Siswa, Guru Piket, Wali Kelas, dan Orang Tua.
- **Desain**: Ikon besar dengan label teks yang di-*uppercase*. Tab yang aktif ditandai dengan latar belakang warna `surfaceContainerLow` dan opacity penuh pada ikon.
- **Konfigurasi Tab**: 
  - *Siswa*: HOME, HISTORY, PERMIT, PROFILE
  - *Guru Piket/Wali*: DASHBOARD, QUEUE, HISTORY, PROFILE
  - *Orang Tua*: Beranda, Riwayat, Profil

### C. `AvatarInitials.tsx`
Komponen pembuat avatar berbasis teks secara otomatis.
- **Fungsi**: Ditampilkan pada `TopAppBar`, tiket antrean di halaman Guru Piket, dan Profil Orang Tua jika user belum mengunggah foto profil.
- **Logika Warna**: Menghasilkan salah satu dari 8 warna palet secara deterministik dengan algoritma *hashing* berbasis *string* nama pengguna, sehingga satu user selalu mendapatkan warna latar avatar yang konsisten.
- **Teks**: Mengambil 1 atau 2 huruf inisial dari nama dengan cerdas (contoh: "Ahmad Faisal" -> "AF").

## 4. Kesimpulan Fase 1
Fase 1 meletakkan fondasi kritis. Semua dependensi UI inti telah diganti dan siap digunakan oleh halaman-halaman yang akan dibangun pada fase selanjutnya. Seluruh komponen lama yang direferensikan ke font *Poppins/Inter* secara otomatis mengadopsi font baru via `theme.ts`.
