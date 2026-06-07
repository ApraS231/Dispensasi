# SiDispen Local Setup Guide

Panduan ini menjelaskan langkah-langkah untuk menjalankan aplikasi SiDispen di lingkungan lokal Anda.

## Prasyarat (Prerequisites)
Pastikan perangkat Anda sudah terinstal:
- **PHP** >= 8.2
- **Composer**
- **Node.js** >= 18 (Rekomendasi versi LTS)
- **MySQL** (Bisa menggunakan Laragon, XAMPP, atau Docker)
- **Expo Go** (Instal di HP Anda dari Play Store/App Store)

---

## 1. Persiapan Backend (Laravel)

1. **Masuk ke direktori backend:**
   ```bash
   cd backend-api
   ```

2. **Instal dependensi PHP:**
   ```bash
   composer install
   ```

3. **Salin file environment:**
   ```bash
   cp .env.example .env
   ```

4. **Generate Application Key:**
   ```bash
   php artisan key:generate
   ```

5. **Konfigurasi Database (Supabase):**
   Buka file `.env` dan sesuaikan pengaturan database menggunakan kredensial Supabase Anda:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=aws-1-ap-northeast-1.pooler.supabase.com # Sesuaikan dengan Host Supabase Anda
   DB_PORT=5432
   DB_DATABASE=postgres
   DB_USERNAME=postgres.[PROJECT_REF]
   DB_PASSWORD=[PASSWORD_DATABASE_ANDA]
   ```
   *Catatan: Anda dapat menemukan informasi ini di Dashboard Supabase pada menu Settings > Database.*

6. **Jalankan Migrasi dan Seeder:**
   ```bash
   php artisan migrate --seed
   ```

7. **Jalankan Server Backend:**
   ```bash
   php artisan serve --host=0.0.0.0
   ```
   *Catatan: Menggunakan `--host=0.0.0.0` sangat penting agar aplikasi mobile di HP fisik dapat mengakses API melalui jaringan Wi-Fi yang sama.*

---

## 2. Persiapan Mobile App (Expo)

1. **Masuk ke direktori mobile app:**
   ```bash
   cd ../mobile-app
   ```

2. **Instal dependensi Node.js:**
   ```bash
   npm install
   ```

3. **Konfigurasi Alamat API:**
   Buka file `.env` di folder `mobile-app`. Ganti IP address dengan IP lokal komputer Anda:
   ```env
   EXPO_PUBLIC_API_URL=http://<IP_KOMPUTER_ANDA>:8000/api
   ```
   *Contoh: `http://192.168.1.5:8000/api`*

4. **Jalankan Expo Server:**
   ```bash
   npx expo start
   ```

5. **Menjalankan di Perangkat:**
   - Gunakan aplikasi **Expo Go** di HP Anda.
   - Scan QR code yang muncul di terminal.
   - Pastikan HP dan Komputer terhubung ke jaringan Wi-Fi yang sama.

---

## Tips Troubleshooting
- **Koneksi API Gagal:** Pastikan Firewall di komputer Anda mengizinkan port 8000.
- **Node Modules Error:** Jika terjadi error saat instalasi, coba hapus folder `node_modules` dan `package-lock.json`, lalu jalankan `npm install` kembali.
- **Clear Cache:** Jika Expo tidak menampilkan perubahan terbaru, jalankan `npx expo start -c`.
