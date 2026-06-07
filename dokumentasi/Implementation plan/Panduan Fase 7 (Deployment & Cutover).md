# **Panduan Teknis Detail \- Fase 7: Peluncuran (Deployment) & Cutover**

Fase 7 adalah tahap akhir di mana kita memindahkan aplikasi dari lingkungan pengembangan lokal (komputer Anda) ke server publik (*production*) agar dapat diakses secara *online* oleh seluruh pihak sekolah.

Kita akan menggunakan **DOM Cloud** untuk *hosting* Backend Laravel, **EAS Build** untuk membangun aplikasi Mobile Android, dan mempertahankan **Supabase** sebagai *Database* utama.

## **Langkah 1: Persiapan Repositori (GitHub/GitLab)**

DOM Cloud melakukan *deployment* dengan cara menarik (*pull*) kode sumber (source code) langsung dari repositori Git.

1. Pastikan seluruh kode backend Laravel Anda sudah di-*commit* tanpa *error*.  
2. *Push* kode tersebut ke repositori GitHub atau GitLab (bisa disetel *Private*).  
3. Pastikan folder vendor, node\_modules, dan file .env **TIDAK** ikut ter-*push* (harus masuk di .gitignore).

## **Langkah 2: Deployment Backend & Web Admin di DOM Cloud**

DOM Cloud menyediakan cara instan untuk menjalankan Laravel.

### **A. Pembuatan Host Baru**

1. Buka situs [DOM Cloud](https://domcloud.co/) dan *login* ke *dashboard*.  
2. Klik tombol **"Create Host"** (atau ikon Plus).  
3. Isi konfigurasi dasar:  
   * **Domain:** Pilih sub-domain yang tersedia (contoh: sidispen.domcloud.dev) atau gunakan domain sekolah Anda jika punya.  
   * **Template:** Pilih template **Laravel**.  
   * **Source:** Masukkan tautan repositori GitHub Anda (contoh: https://github.com/username/sidispen-backend). Berikan otorisasi jika repositori Anda *Private*.

### **B. Mengatur Script Deployment**

DOM Cloud menggunakan script konfigurasi YAML. Biasanya, saat memilih template Laravel, DOM Cloud sudah otomatis membuatkannya, namun pastikan scriptnya terlihat seperti ini:

source: '\[github.com/username/sidispen-backend\](https://github.com/username/sidispen-backend)'  
features:  
  \- php  
  \- node  
nginx:  
  root: public  
  fastcgi: on  
commands:  
  \- composer install \--optimize-autoloader \--no-dev  
  \- npm install  
  \- npm run build  
  \- php artisan config:cache  
  \- php artisan route:cache  
  \- php artisan view:cache

*Klik **Create** dan tunggu beberapa menit hingga DOM Cloud selesai menarik kode dan menginstal dependensi.*

### **C. Konfigurasi Database (Penting: Gunakan Supabase\!)**

DOM Cloud memang menyediakan database bawaan (MariaDB), namun **kita WAJIB tetap menggunakan Supabase (PostgreSQL)** karena fitur *Real-Time WebSocket* Chat kita berjalan di Supabase.

1. Di Dashboard DOM Cloud, buka menu **Files** atau **Web SSH**.  
2. Cari file .env (atau salin dari .env.example ke .env).  
3. Sesuaikan baris koneksi database persis seperti di lokal Anda (Fase 1):

APP\_ENV=production  
APP\_DEBUG=false  
APP\_URL=\[https://sidispen.domcloud.dev\](https://sidispen.domcloud.dev) \# Ganti dengan domain DOM Cloud Anda

DB\_CONNECTION=pgsql  
DB\_HOST=aws-0-ap-southeast-1.pooler.supabase.com  
DB\_PORT=6543  
DB\_DATABASE=postgres  
DB\_USERNAME=postgres.xxxxxx  
DB\_PASSWORD=password\_supabase\_anda

4. Jalankan perintah ini di Terminal/SSH DOM Cloud untuk menyegarkan konfigurasi:  
   php artisan optimize:clear

Sekarang, Web Admin dan API Anda sudah *live* dan bisa diakses di internet\!

## **Langkah 3: Build & Publish Aplikasi Mobile (Expo)**

Sekarang backend sudah *live* di internet, kita harus memperbarui alamat API di aplikasi mobile dan membungkusnya menjadi file .apk (Android) agar bisa dibagikan ke pengguna.

### **A. Perbarui URL API**

Buka file .env di dalam folder mobile-app Anda, dan ubah IP lokal menjadi domain DOM Cloud:

\# Sebelumnya: EXPO\_PUBLIC\_API\_URL=\[http://10.0.2.2:8000/api\](http://10.0.2.2:8000/api)  
EXPO\_PUBLIC\_API\_URL=\[https://sidispen.domcloud.dev/api\](https://sidispen.domcloud.dev/api)

### **B. Membangun File APK (EAS Build)**

Kita akan menggunakan Expo Application Services (EAS) untuk mem-*build* APK di server (Cloud Build), sehingga tidak membebani RAM laptop Anda.

1. Buka terminal di folder mobile-app.  
2. Install EAS CLI (jika belum): npm install \-g eas-cli  
3. Login ke akun Expo: eas login  
4. Konfigurasi proyek: eas build:configure (Pilih Android).  
5. Buka file eas.json yang baru saja dibuat, dan tambahkan profil "preview" untuk APK murni:

{  
  "build": {  
    "preview": {  
      "android": {  
        "buildType": "apk"  
      }  
    },  
    "production": {}  
  }  
}

6. Jalankan proses Build:  
   eas build \-p android \--profile preview

7. Tunggu sekitar 10-15 menit. Setelah selesai, terminal akan memberikan Anda **tautan (link) untuk mengunduh file .apk**.

## **Langkah 4: Proses Cutover (Peralihan Sistem) & Sosialisasi**

*Cutover* adalah strategi mematikan sistem lama (kertas manual) dan menyalakan sistem baru (SiDispen) secara resmi.

1. **Persiapan Data Master (Admin):**  
   * Buka *dashboard* DOM Cloud Anda (https://sidispen.domcloud.dev/admin).  
   * Input/Import semua data Guru (beserta *role*\-nya), data Siswa, data Wali Kelas, dan Jadwal Piket bulan ini.  
2. **Sosialisasi & Distribusi APK:**  
   * Kumpulkan Guru Piket, Satpam, dan Wali Kelas. Minta mereka mengunduh .apk SiDispen.  
   * Pandu cara melakukan *Login* (sediakan panduan *default password*), dan ajarkan cara menekan tombol **"Ready"**.  
   * Sosialisasikan ke grup Siswa dan Orang Tua beserta tautan unduhan APK.  
3. **Hari H (Go-Live):**  
   * Umumkan bahwa formulir dispensasi kertas ditiadakan.  
   * Satpam diinstruksikan hanya membuka gerbang sekolah untuk siswa yang dapat menunjukkan **QR Code** layar HP dari dalam aplikasi SiDispen.

## **Ceklis Penyelesaian Fase 7**

* \[ \] Kode *Backend* sukses di-*push* ke GitHub/GitLab.  
* \[ \] *Deployment* DOM Cloud berhasil (status *Running* / *Green*).  
* \[ \] File .env di DOM Cloud sudah terhubung ke database **Supabase**.  
* \[ \] Panel Admin Filament bisa diakses via *domain online* tanpa *error* 500\.  
* \[ \] *Endpoint API* (/api/login) merespons dengan baik dari internet.  
* \[ \] Proses *EAS Build* berhasil dan menghasilkan file .apk.  
* \[ \] Aplikasi Mobile di HP bisa sukses Login dan menembak API ke server DOM Cloud.  
* \[ \] Sosialisasi ke Siswa, Satpam, dan Guru telah dilakukan.

**Selamat\! Sistem Informasi Dispensasi Anda kini telah beroperasi secara penuh (Live).** Anda sekarang dapat mengumpulkan data dari berjalannya sistem ini untuk menyusun Bab Kesimpulan di laporan Tugas Akhir Anda.