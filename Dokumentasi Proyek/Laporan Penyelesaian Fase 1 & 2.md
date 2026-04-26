# Laporan Penyelesaian Proyek SiDispen (Fase 1 & Fase 2)

Dokumen ini merekapitulasi seluruh pekerjaan yang telah diselesaikan pada **Fase 1 (Persiapan & Inisialisasi)** dan **Fase 2 (Backend API & Logika)**, beserta catatan kendala (*blockers*) teknis yang terjadi selama proses pengembangan dan solusi yang diterapkan.

---

## 🎯 FASE 1: Persiapan & Inisialisasi Proyek

Pada fase ini, fondasi *monorepo* (Backend dan Mobile) diletakkan dan dihubungkan ke *database* Cloud.

### **Pekerjaan yang Telah Diselesaikan:**
1. **Struktur Direktori**: Pembuatan struktur *monorepo* utama untuk `backend-api` (Laravel) dan `mobile-app` (Expo TypeScript).
2. **Setup Database**: Database Supabase berhasil dikonfigurasi. Skema awal (DBML) diterjemahkan dan dijalankan di Supabase.
3. **Konfigurasi Lingkungan (`.env`)**: Konfigurasi kredensial (Database Host, Port Pooling 6543, User, Password) telah dipasangkan di Laravel dan Mobile App.
4. **Pemasangan Pustaka Dasar**: Instalasi paket navigasi (`expo-router`, dsb) di ranah Mobile.

### **Kendala (Issues) & Solusi (Resolutions):**
1. **[Disk Space / ENOSPC Error]**
   - **Kendala**: Proses inisialisasi awal (ekstraksi paket `npm` dan `composer`) gagal secara sistem dengan pesan *"ENOSPC: no space left on device"*.
   - **Solusi**: Ruang penyimpanan di `C:` sangat kritis (tersisa ~117MB). Masalah diselesaikan setelah membersihkan memori dan *cache* hingga mendapatkan *free space* ~6.8 GB. File `vendor` dan `node_modules` yang korup dihapus dan diinstal ulang.
2. **[GitHub Rate-Limit pada Composer]**
   - **Kendala**: Proses unduhan *dependency* Laravel melalui otomatisasi terhenti dan sangat lambat karena limitasi permintaan API (*rate-limit*) ke server GitHub dari PC lokal, mengakibatkan *timeout*.
   - **Solusi**: Pemasangan dilanjutkan melalui eksekusi manual (atau dengan bantuan Personal Access Token) via terminal lokal hingga sinkronisasi berhasil secara penuh.
3. **[TTY Error pada Gluestack-UI]**
   - **Kendala**: Instalasi UI Framework `npx gluestack-ui init` di Mobile *crash* dengan *Error: TTY initialization failed*. Skrip CLI dari pustaka versi terbaru tidak mengizinkan penjalanan secara latar belakang (*background automation*).
   - **Solusi**: Harus dieksekusi secara manual secara langsung oleh *User* lewat *Command Prompt* lokal yang memiliki *interface* terminal interaktif.

---

## 🎯 FASE 2: Backend & Pengembangan API (Laravel)

Pada fase ini, kami membangun seluruh tulang punggung logika aplikasi, relasi model, keamanan, dan *endpoints* untuk konsumsi aplikasi klien.

### **Pekerjaan yang Telah Diselesaikan:**
1. **Migrasi Terintegrasi (Supabase & Laravel)**: Pembuatan berkas *migration* Laravel yang telah dimodifikasi menggunakan tipe `UUID` dan `ForeignUuid` secara ketat untuk menyesuaikan dengan relasi Supabase.
2. **Integrasi Eloquent Models**: 8 Model utama (`User`, `Kelas`, `SiswaProfile`, `PiketSchedule`, `PiketAttendanceLog`, `DispensasiTicket`, `TicketChat`, `Notification`) berhasil disusun dengan *traits* `HasUuids` beserta metode relasi tabel antar entitas.
3. **Sistem Autentikasi (Sanctum)**: Berhasil membangun `AuthController` untuk men-generate token login aplikasi *Mobile*. Token dari *Personal Access Token* telah mendukung format UUID (`uuidMorphs`).
4. **Role-Based Access Control (RBAC)**: Pembuatan dan pendaftaran *Middleware* `CheckRole` yang secara otomatis memblokir *endpoint* bila parameter peran (*role*) tidak selaras.
5. **API Master Data**: Penyediaan Endpoint CRUD untuk Admin (`/api/master/*`) yang mengelola Data Kelas, Jadwal, Profil Siswa, dan Pengguna.
6. **Logika Transaksi Inti (Dispensasi)**:
   - Fitur **Auto-Assignment**: API pengajuan izin otomatis mencocokkan siswa dengan ID Wali Kelasnya dan ID Guru Piket yang lognya sedang `Ready`.
   - Fitur **Approval**: Validasi tiket dengan otorisasi, perubahan status persetujuan, hingga *generate token QR Code*.
   - Fitur obrolan langsung (*TicketChats*) dan notifikasi (*Notifications*).
7. **Mapping Routes**: Validasi 40 *Endpoints* melalui `php artisan route:list` dengan konfigurasi yang terbebas dari kesalahan sistem (0 *Syntax Errors*).

### **Kendala (Issues) & Solusi (Resolutions):**
1. **[PDO PgSQL Driver Not Found]**
   - **Kendala**: Eksekusi perintah sinkronisasi struktur *database* `php artisan migrate:fresh` gagal total dengan melempar exception `PDOException: could not find driver`. Hal ini terjadi karena *binary* PHP lokal (Laragon versi 8.4) secara *default* tidak mengaktifkan modul konektor PostgreSQL.
   - **Solusi**: Melacak *binary file* yang digunakan, memodifikasi isi file `C:\laragon\bin\php\php-8.4\php.ini`, serta menghilangkan komentar (un-comment) pada baris `extension=pdo_pgsql` dan `extension=pgsql`. Setelah *override*, migrasi berhasil dipasang di *Supabase* jarak jauh dengan kecepatan ~2-4 detik per tabel.

---

**Status Keseluruhan**: **SIAP**. Fondasi Aplikasi dan Backend telah rampung secara fungsional. Proyek siap untuk dilanjutkan ke ranah *Front-End* melalui iterasi Fase berikutnya.
