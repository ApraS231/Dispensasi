# **Panduan Teknis Detail \- Fase 1: Persiapan & Inisialisasi Proyek (SiDispen)**

Dokumen ini adalah panduan teknis langkah demi langkah untuk melakukan inisialisasi awal proyek SiDispen. Panduan ini berfokus pada pengaturan *workspace*, database Supabase, backend Laravel, dan aplikasi mobile Expo.

## **Persyaratan Sistem (Prerequisites)**

Pastikan perangkat pengembang (PC/Laptop) sudah terinstal:

* **PHP** (Minimal versi 8.2) & **Composer**  
* **Node.js** (LTS version, misal 20.x) & **npm/yarn**  
* **Git**  
* Akun **Supabase** (Bisa daftar gratis di supabase.com)

## **Langkah 1: Setup Workspace & Version Control**

Kita akan menggunakan struktur *monorepo* sederhana (satu folder utama berisi folder backend dan mobile) agar lebih mudah dikelola.

\# 1\. Buat folder utama proyek  
mkdir sidispen-project  
cd sidispen-project

\# 2\. Inisialisasi Git  
git init

\# 3\. Buat file .gitignore global (opsional tapi disarankan)  
touch .gitignore

## **Langkah 2: Setup Database (Supabase)**

Supabase menggunakan PostgreSQL. Kita akan menyiapkan proyek di *dashboard* Supabase.

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard) dan klik **"New Project"**.  
2. Beri nama proyek (contoh: sidispen-db), buat *database password* yang kuat, dan pilih region terdekat (misal: Singapore). Klik **"Create new project"**.  
3. Tunggu beberapa menit hingga *database* siap.  
4. Buka menu **Project Settings \> Database**. Catat informasi koneksi berikut untuk Laravel nanti:  
   * **Host**  
   * **Port** (biasanya 5432 atau 6543\)  
   * **Database Name** (postgres)  
   * **User** (postgres)  
   * **Password** (yang Anda buat di langkah 2\)  
5. Buka menu **SQL Editor** di panel kiri. Salin skema DBML yang telah kita ubah menjadi SQL (Anda bisa menggunakan fitur *Export to PostgreSQL* di dbdiagram.io) dan jalankan (*Run*) di SQL Editor Supabase untuk membuat tabel-tabel secara otomatis.

## **Langkah 3: Setup Backend & API (Laravel)**

Kita akan menginisialisasi Laravel sebagai penyedia REST API.

\# 1\. Install Laravel via Composer (berada di dalam folder sidispen-project)  
composer create-project laravel/laravel backend-api

\# 2\. Masuk ke folder backend  
cd backend-api

\# 3\. Install Laravel Sanctum untuk Autentikasi API  
php artisan install:api  
\# (Pilih 'yes' jika diminta untuk menjalankan migrasi awal)

**Konfigurasi Koneksi Database Supabase di Laravel:**

Buka file .env di dalam folder backend-api dan ubah bagian koneksi database agar mengarah ke Supabase:

DB\_CONNECTION=pgsql  
DB\_HOST=aws-0-ap-southeast-1.pooler.supabase.com \# Ganti sesuai host Supabase Anda  
DB\_PORT=6543 \# Pastikan port sesuai (biasanya 6543 untuk connection pooling Supabase)  
DB\_DATABASE=postgres  
DB\_USERNAME=postgres.xxxxxx \# Ganti sesuai username Supabase Anda  
DB\_PASSWORD=password\_database\_anda \# Ganti dengan password Anda

**Uji Coba Backend:**

\# Jalankan server lokal Laravel  
php artisan serve  
\# Backend berjalan di: http://localhost:8000

## **Langkah 4: Setup Mobile App (Expo & Gluestack UI)**

Selanjutnya, kita menyiapkan proyek aplikasi mobile menggunakan Expo. Buka terminal baru agar server Laravel tetap berjalan.

\# 1\. Kembali ke folder root proyek  
cd ..

\# 2\. Inisialisasi proyek Expo dengan template TypeScript  
npx create-expo-app mobile-app \-t expo-template-blank-typescript

\# 3\. Masuk ke folder mobile  
cd mobile-app

\# 4\. Install Gluestack UI dan dependensinya  
npx gluestack-ui init  
\# (Ikuti instruksi di terminal, pilih konfigurasi default/recommended)

\# 5\. Install pustaka navigasi (Expo Router direkomendasikan)  
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

**Konfigurasi Koneksi API di Mobile App:**

Buat file .env di dalam folder mobile-app untuk menyimpan URL backend Laravel.

\# Jika menggunakan emulator Android, gunakan 10.0.2.2. Jika physical device, gunakan IP Local (misal 192.168.x.x)  
EXPO\_PUBLIC\_API\_URL=\[http://10.0.2.2:8000/api\](http://10.0.2.2:8000/api)

**Struktur Folder Dasar Mobile (Saran):**

Buat folder src di dalam mobile-app untuk mengelompokkan kode:

mobile-app/  
├── src/  
│   ├── app/         \# Untuk routing (Expo Router)  
│   ├── components/  \# Komponen UI Gluestack yang dapat digunakan ulang  
│   ├── services/    \# Fungsi untuk fetch API Axios  
│   ├── stores/      \# State management (Zustand/Redux)  
│   └── utils/       \# Helper functions  
├── app.json  
└── package.json

**Uji Coba Mobile App:**

# Jalankan server Expo  
npx expo start  
# Tekan 'a' untuk buka di Emulator Android, 'i' untuk iOS, atau scan QR dengan aplikasi Expo Go di HP

## **Troubleshooting & Kendala Instalasi (Catatan Eksekusi Fase 1)**

Dalam eksekusi riil, terdapat beberapa limitasi *environment* yang mungkin terjadi dan harus diselesaikan secara manual melalui terminal lokal:

### 1. Kendala Composer (Backend)
- **Error:** Proses `composer install` atau `composer create-project` berjalan sangat lambat, tertahan di proses `Syncing into cache`, atau muncul pesan _"Could not authenticate against github.com"_.
- **Penyebab:** Terkena *rate-limit* dari API GitHub (karena unduhan terlalu banyak tanpa token). Composer terpaksa mengunduh *source code* via Git Clone satu per satu alih-alih menggunakan arsip ZIP (*dist*).
- **Solusi:** 
  1. Hapus folder `vendor` dan file `composer.lock` jika instalasi sempat terhenti/korup.
  2. Buka terminal secara manual di folder `backend-api` dan jalankan `composer install`. 
  3. Biarkan proses berjalan hingga selesai perlahan, ATAU masukkan Personal Access Token (PAT) GitHub jika terminal memintanya untuk mempercepat unduhan.

### 2. Kendala Gluestack UI (Mobile)
- **Error:** Eksekusi `npx gluestack-ui init` gagal dengan pesan _"SystemError [ERR_TTY_INIT_FAILED]: TTY initialization failed"_.
- **Penyebab:** Script CLI Gluestack UI versi 3 ke atas mewajibkan adanya terminal yang interaktif (TTY) untuk menampilkan animasi *Welcome* dan menanyakan opsi konfigurasi kepada pengguna. Script ini akan *crash* jika dijalankan oleh *automation script* di belakang layar tanpa pseudo-TTY.
- **Solusi:**
  1. Buka Command Prompt / PowerShell secara langsung.
  2. Arahkan ke `cd "mobile-app"`.
  3. Jalankan `npx gluestack-ui init` secara manual.
  4. Tekan `ENTER` pada setiap prompt konfigurasi untuk menggunakan opsi *default*.

## **Ceklis Penyelesaian Fase 1**

* \[x\] Repositori git telah dibuat.  
* \[x\] Proyek Supabase aktif dan tabel sudah di-*generate*.  
* \[x\] Laravel berhasil diinstal, terkoneksi ke Supabase, dan bisa dijalankan (php artisan serve).  
* \[x\] Expo berhasil diinstal beserta Gluestack UI dan bisa dirender di emulator/perangkat asli.

Jika semua ceklis di atas telah terpenuhi, proyek siap dilanjutkan ke **Fase 2: Pengembangan API Master Data dan Autentikasi** di Laravel.