# Laporan Penyelesaian Fase 3: Web Admin Panel (Filament PHP)

Dokumen ini merekapitulasi seluruh pekerjaan yang telah diselesaikan pada **Fase 3 (Pengembangan Web Admin)**, beserta kendala teknis yang terjadi dan solusinya.

---

## 🎯 FASE 3: Pengembangan Web Admin Panel (Filament PHP)

Pada fase ini, kami membangun antarmuka *Dashboard Admin* berbasis web menggunakan **Filament PHP** yang berjalan di atas proyek Laravel yang sama dengan API Backend. Admin Sekolah kini bisa mengakses panel melalui `http://localhost:8000/admin`.

### **Pekerjaan yang Telah Diselesaikan:**

1. **Instalasi Filament PHP v5.6**
   - Paket `filament/filament` berhasil dipasang via Composer beserta seluruh dependensinya (Livewire, Alpine.js, Tailwind, dsb).
   - Panel Admin diinisiasi dengan ID `admin` dan terdaftar di `AdminPanelProvider`.

2. **Konfigurasi Otorisasi Admin (FilamentUser)**
   - Model `User` di-*update* untuk mengimplementasikan *interface* `FilamentUser`.
   - Metode `canAccessPanel()` telah dikonfigurasi agar **hanya** *user* dengan `role === 'admin'` yang bisa login ke dashboard web.
   - Akun Admin pertama telah di-*seed* melalui Tinker:
     - **Email:** `admin@sekolah.com`
     - **Password:** `password123`

3. **CRUD Master Data (4 Resources)**
   - **UserResource** (`/admin/users`): CRUD Manajemen Pengguna lengkap dengan:
     - Formulir: Nama, Email, Password (opsional saat edit), Role (via *dropdown Select*).
     - Tabel: Badge berwarna per role, filter berdasarkan role, *searchable*.
   - **KelasResource** (`/admin/kelas`): CRUD Manajemen Kelas dengan:
     - Formulir: Nama Kelas, Tingkat (X/XI/XII via *dropdown*), Wali Kelas (relasi *searchable*).
     - Tabel: Menampilkan nama wali kelas dari relasi.
   - **PiketScheduleResource** (`/admin/piket-schedules`): CRUD Jadwal Piket dengan:
     - Formulir: Guru Piket (relasi), Hari (Senin-Sabtu), Jam Mulai, Jam Selesai (*TimePicker*).
     - Tabel: Menampilkan nama guru dari relasi.

4. **Modul Monitoring Dispensasi (Read-Only)**
   - **DispensasiTicketResource** (`/admin/dispensasi-tickets`):
     - Tabel monitoring menampilkan: Tanggal, Nama Siswa, Kelas, Jenis Izin (badge), dan Status (badge berwarna).
     - Filter: Status tiket dan jenis izin.
     - Tombol "Create" **dinonaktifkan** (`canCreate: false`) — Admin hanya bisa memantau.
     - Halaman View tersedia untuk melihat detail tiket.

5. **Widget Dashboard Statistik (StatsOverview)**
   - Widget otomatis muncul di halaman utama Dashboard (`/admin`) menampilkan:
     - **Total Tiket Bulan Ini**: Hitungan `dispensasi_tickets` bulan berjalan.
     - **Menunggu Persetujuan**: Hitungan tiket berstatus `pending`.
     - **Siswa Terdaftar**: Hitungan total akun siswa.

6. **Verifikasi Route**
   - Seluruh 14+ rute admin panel berhasil dimuat tanpa *error* melalui `php artisan route:list --path=admin`.

### **Kendala (Issues) & Solusi (Resolutions):**

1. **[Versi Filament Tidak Kompatibel]**
   - **Kendala:** Panduan asli menggunakan constraint `filament/filament:"^3.2"`, namun Laravel 11 membutuhkan Filament v5+ (yang mendukung `illuminate/console ^11.0`). Hasilnya: `Your requirements could not be resolved to an installable set of packages`.
   - **Solusi:** Menggunakan `composer require filament/filament -W` tanpa constraint versi, yang otomatis menginstal versi **v5.6** yang kompatibel dengan Laravel 11.

2. **[Perubahan Arsitektur Filament v5 vs v3]**
   - **Kendala:** Struktur kode di Filament v5 berbeda signifikan dari v3 yang didokumentasikan di panduan. Filament v5 memisahkan logika Form dan Table ke dalam kelas terpisah (`Schemas/` dan `Tables/`) alih-alih *inline* di Resource.
   - **Solusi:** Menyesuaikan seluruh kustomisasi (Select, Badge, Filter, Relationship) ke arsitektur baru v5.

---

### **Struktur File yang Dibuat/Dimodifikasi:**

```
backend-api/
├── app/
│   ├── Filament/
│   │   ├── Resources/
│   │   │   ├── Users/
│   │   │   │   ├── UserResource.php
│   │   │   │   ├── Schemas/UserForm.php          ← Kustom
│   │   │   │   ├── Tables/UsersTable.php          ← Kustom
│   │   │   │   └── Pages/...
│   │   │   ├── Kelas/
│   │   │   │   ├── KelasResource.php
│   │   │   │   ├── Schemas/KelasForm.php          ← Kustom
│   │   │   │   ├── Tables/KelasTable.php          ← Kustom
│   │   │   │   └── Pages/...
│   │   │   ├── PiketSchedules/
│   │   │   │   ├── PiketScheduleResource.php
│   │   │   │   ├── Schemas/PiketScheduleForm.php  ← Kustom
│   │   │   │   ├── Tables/PiketSchedulesTable.php ← Kustom
│   │   │   │   └── Pages/...
│   │   │   └── DispensasiTickets/
│   │   │       ├── DispensasiTicketResource.php   ← Read-Only
│   │   │       ├── Tables/DispensasiTicketsTable.php ← Kustom
│   │   │       └── Pages/...
│   │   └── Widgets/
│   │       └── StatsOverview.php                  ← Dashboard Stats
│   ├── Models/User.php                            ← + FilamentUser
│   └── Providers/Filament/AdminPanelProvider.php
```

---

### **Cara Mengakses Panel Admin:**

```bash
cd "C:\laragon\www\SIdispen (SMA 3)\backend-api"
php artisan serve
```
Lalu buka browser: **http://localhost:8000/admin**
- Login: `admin@sekolah.com` / `password123`

---

**Status Keseluruhan Fase 3**: ✅ **SELESAI**. Panel Admin Web berbasis Filament PHP telah rampung. Sistem kini siap untuk dilanjutkan ke **Fase 4: Pengembangan Mobile App (Expo)**.
