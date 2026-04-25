# **Rencana Implementasi (Implementation Plan) Aplikasi SiDispen**

Dokumen ini menguraikan tahapan-tahapan teknis dan manajerial untuk membangun dan meluncurkan Sistem Dispensasi Digital (SiDispen) berbasis arsitektur *Mobile* (Expo) dan *Backend API* (Laravel \+ Supabase). Rencana ini disusun agar selaras dengan skema database yang telah dirancang.

## **Fase 1: Persiapan dan Inisialisasi Proyek (Minggu 1-2)**

Fase ini berfokus pada penyiapan *environment* pengembangan dan repositori kode.

* \[ \] **Setup Repositori & Version Control:** Membuat *repository* Git (misal: GitHub/GitLab) dengan struktur *monorepo* atau *multi-repo* terpisah untuk Backend, Web Admin, dan Mobile App.  
* \[ \] **Setup Database (Supabase):** \* Membuat proyek baru di Supabase.  
  * Menerjemahkan skema DBML menjadi tabel-tabel di Supabase (mengeksekusi SQL Query dari *DB Diagram*).  
  * Mengatur konfigurasi keamanan RLS (*Row Level Security*) dasar jika diperlukan.  
* \[ \] **Setup Backend (Laravel):**  
  * Inisialisasi *project* Laravel versi terbaru.  
  * Konfigurasi koneksi database ke Supabase PostgreSQL.  
  * Instalasi dan konfigurasi **Laravel Sanctum** untuk otentikasi API.  
* \[ \] **Setup Mobile App (Expo):**  
  * Inisialisasi *project* Expo menggunakan template TypeScript.  
  * Instalasi **Gluestack UI** dan konfigurasi tema *default*.  
  * Setup *routing/navigation* menggunakan React Navigation atau Expo Router.

## **Fase 2: Pengembangan Backend & API (Minggu 3-5)**

Fase ini membangun pondasi logika bisnis dan REST API di Laravel.

* \[ \] **Autentikasi & Otorisasi:**  
  * Membuat *endpoint* Login/Logout.  
  * Membuat *Middleware* berbasis *Role* (Siswa, Orang Tua, Guru Piket, Wali Kelas, Admin).  
* \[ \] **API Master Data (CRUD):**  
  * API Manajemen *Users*, *Siswa Profiles*, dan *Kelas*.  
  * API Manajemen *Piket Schedules*.  
* \[ \] **API Transaksi Inti (Sistem Tiket):**  
  * Logika **Auto-Assignment**: *Endpoint* pembuatan tiket yang otomatis mendeteksi Wali Kelas dari tabel kelas dan Guru Piket dari tabel piket\_attendance\_logs.  
  * *Endpoint* untuk *Approval* dan *Rejection* oleh guru.  
  * Logika *Generate QR Code Token* saat status berubah menjadi approved\_final.  
* \[ \] **API Dukungan (Log, Chat, Notifikasi):**  
  * *Endpoint* absensi piket (tombol "Ready").  
  * *Endpoint* rekapitulasi data (berdasarkan filter role).  
  * *Endpoint* untuk CRUD *Ticket Chats*.

## **Fase 3: Pengembangan Web Admin (Minggu 6-7)**

Membangun antarmuka untuk Admin menggunakan Laravel Blade atau React (tergantung preferensi, namun terintegrasi dengan backend).

* \[ \] **Dashboard Utama:** Menampilkan metrik dan statistik dispensasi sekolah.  
* \[ \] **Manajemen Master Data:** Form UI untuk menginput dan mengedit data Guru, Siswa, Kelas, dan relasi Orang Tua.  
* \[ \] **Manajemen Jadwal Piket:** Antarmuka kalender/tabel untuk mengatur *shift* Guru Piket.  
* \[ \] **Monitoring Log:** Tabel pencarian (*searchable & filterable*) untuk memantau seluruh tiket dispensasi yang terjadi.

## **Fase 4: Pengembangan Aplikasi Mobile (Minggu 8-11)**

Membangun antarmuka untuk pengguna harian (Siswa, Guru, Orang Tua) menggunakan Expo & Gluestack UI.

* \[ \] **Autentikasi UI:** Layar Login dan penanganan sesi (menyimpan token API di *SecureStore*).  
* \[ \] **Navigasi Dinamis:** Menyesuaikan *Bottom Tab* atau *Drawer* sesuai *role* user yang sedang *login*.  
* \[ \] **Modul Siswa:**  
  * Form pengajuan izin (jenis izin, alasan, upload lampiran foto surat).  
  * Halaman riwayat tiket & detail status.  
  * Halaman Tampilan QR Code untuk izin yang *Approved Final*.  
* \[ \] **Modul Guru (Piket & Wali Kelas):**  
  * Implementasi tombol "Ready" untuk Guru Piket.  
  * Daftar tiket *pending* yang butuh persetujuan.  
  * Form persetujuan/penolakan (dengan opsi input catatan).  
  * Layar rekapitulasi siswa izin.  
* \[ \] **Modul Orang Tua:**  
  * Dashboard monitoring status perizinan anak.  
* \[ \] **Fitur Chat Terintegrasi:** Membangun antarmuka *chat bubble* di dalam detail tiket untuk klarifikasi masalah.

## **Fase 5: Integrasi Fitur Real-Time (Minggu 12\)**

Fase ini menghubungkan logika *real-time* dan notifikasi.

* \[ \] **Integrasi Supabase Real-Time (WebSockets):** Mengaktifkan *subscription* pada tabel ticket\_chats agar pesan chat masuk secara instan tanpa perlu *refresh*.  
* \[ \] **Push Notifications (Expo Notifications):**  
  * Menyimpan device\_token ke database saat user login di perangkat mobile.  
  * Membuat *Service* di Laravel untuk menembakkan notifikasi via Expo Push API ketika ada *trigger* (tiket baru, status berubah, chat baru).

## **Fase 6: Pengujian (Testing) & Debugging (Minggu 13-14)**

Memastikan aplikasi berjalan sesuai skenario (Black Box Testing).

* \[ \] **Pengujian Unit & API:** Memastikan setiap *endpoint* merespons dengan benar dan aman dari akses tanpa izin.  
* \[ \] **Pengujian Skenario Lengkap:** Menjalankan tes dari login siswa \-\> pengajuan \-\> notifikasi guru piket \-\> tekan "Ready" \-\> approve \-\> muncul QR Code \-\> notifikasi ortu.  
* \[ \] **UAT (User Acceptance Testing):** Menguji aplikasi dengan perwakilan pengguna sebenarnya (1-2 guru dan beberapa siswa) untuk mendapatkan masukan UI/UX.

## **Fase 7: Peluncuran (Deployment & Cutover) (Minggu 15-16)**

Membawa aplikasi dari status *development* ke status *production*.

* \[ \] **Deployment Backend & Web Admin:** Mengunggah Laravel ke *production server* (VPS/Cloud) dan memastikan Supabase diatur ke mode *production*.  
* \[ \] **Build Mobile App:** \* Membangun file instalasi Android (.apk / .aab).  
  * Membangun file instalasi iOS (opsional, via TestFlight/App Store).  
* \[ \] **Pelatihan Pengguna:** Membuat panduan singkat atau melakukan sosialisasi kepada guru, satpam (untuk scan QR), siswa, dan orang tua.  
* \[ \] **Go-Live:** Peluncuran resmi sistem di sekolah untuk menggantikan sistem kertas.