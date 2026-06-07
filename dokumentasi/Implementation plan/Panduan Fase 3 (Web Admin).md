# **Panduan Teknis Detail \- Fase 3: Pengembangan Web Admin (Laravel)**

Pada Fase 3 ini, kita akan membangun antarmuka web khusus untuk **Admin Sekolah**. Kita akan menggunakan **Filament PHP** (versi 3), sebuah panel admin berbasis TALL stack (Tailwind, Alpine.js, Laravel, Livewire) yang sangat cepat diimplementasikan untuk kebutuhan CRUD (Create, Read, Update, Delete) dan *monitoring* data.

Admin panel ini akan berjalan di *project* Laravel yang sama dengan API Anda, namun diakses melalui *browser* (misalnya: http://localhost:8000/admin).

## **Langkah 1: Instalasi Panel Admin (Filament PHP)**

Pastikan terminal Anda berada di dalam folder backend-api.

\# 1\. Install Filament melalui Composer  
composer require filament/filament:"^3.2" \-W

\# 2\. Jalankan perintah instalasi panel Filament  
php artisan filament:install \--panels

Setelah instalasi selesai, panel admin Anda sebenarnya sudah bisa diakses di rute /admin, namun kita perlu mengatur otorisasi agar hanya *role* admin yang bisa masuk.

## **Langkah 2: Konfigurasi Akses Admin (Otorisasi)**

Kita harus memastikan hanya *user* dengan *role* admin yang diizinkan untuk *login* ke *dashboard* web ini.

1. Buka file Model User (app/Models/User.php).  
2. Implementasikan *interface* FilamentUser.

namespace App\\Models;

use Filament\\Models\\Contracts\\FilamentUser;  
use Filament\\Panel;  
use Illuminate\\Foundation\\Auth\\User as Authenticatable;

class User extends Authenticatable implements FilamentUser  
{  
    // ... trait dan relasi lainnya

    /\*\*  
     \* Menentukan siapa yang berhak masuk ke panel admin Filament  
     \*/  
    public function canAccessPanel(Panel $panel): bool  
    {  
        // Hanya user dengan role 'admin' yang bisa mengakses web admin  
        return $this-\>role \=== 'admin';  
    }  
}

3. Buat satu akun Admin pertama menggunakan *Tinker* atau *Seeder*:

php artisan tinker

Lalu jalankan perintah ini di dalam *tinker*:

App\\Models\\User::create(\['name' \=\> 'Super Admin', 'email' \=\> 'admin@sekolah.com', 'password' \=\> bcrypt('password123'), 'role' \=\> 'admin'\]);  
exit;

Sekarang Anda bisa mencoba *login* ke http://localhost:8000/admin.

## **Langkah 3: Pembuatan CRUD Master Data**

Filament dapat membuat halaman *list*, *create*, *edit*, dan *delete* hanya dengan satu perintah terminal (disebut *Resource*).

Jalankan perintah-perintah berikut di terminal:

\# Membuat CRUD untuk Manajemen Pengguna (Guru, Siswa, Ortu)  
php artisan make:filament-resource User

\# Membuat CRUD untuk Manajemen Kelas  
php artisan make:filament-resource Kelas

\# Membuat CRUD untuk Manajemen Jadwal Piket  
php artisan make:filament-resource PiketSchedule

**Konfigurasi Tampilan Tabel (Contoh Manajemen Kelas):**

Buka file yang baru saja terbuat di app/Filament/Resources/KelasResource.php. Sesuaikan bagian form dan table:

use Filament\\Forms;  
use Filament\\Tables;  
use Filament\\Forms\\Components\\TextInput;  
use Filament\\Forms\\Components\\Select;  
use Filament\\Tables\\Columns\\TextColumn;

// Pada method form():  
public static function form(Form $form): Form  
{  
    return $form  
        \-\>schema(\[  
            TextInput::make('nama\_kelas')-\>required(),  
            TextInput::make('tingkat')-\>required(),  
            Select::make('wali\_kelas\_id')  
                \-\>relationship('waliKelas', 'name') // Mengambil nama wali kelas  
                \-\>searchable()  
                \-\>required(),  
        \]);  
}

// Pada method table():  
public static function table(Table $table): Table  
{  
    return $table  
        \-\>columns(\[  
            TextColumn::make('nama\_kelas')-\>sortable()-\>searchable(),  
            TextColumn::make('tingkat')-\>sortable(),  
            TextColumn::make('waliKelas.name')-\>label('Wali Kelas')-\>searchable(),  
        \]);  
}

*(Lakukan konfigurasi Form dan Table yang mirip untuk UserResource dan PiketScheduleResource sesuai kolom di DBML).*

## **Langkah 4: Pembuatan Modul Monitoring Log Dispensasi**

Admin butuh memantau semua tiket dispensasi yang terjadi di sekolah. Kita akan membuat *Resource* untuk tiket, namun sifatnya **Read-Only** (Admin tidak boleh mengedit atau membuat tiket secara manual).

php artisan make:filament-resource DispensasiTicket \--view

Buka app/Filament/Resources/DispensasiTicketResource.php dan atur agar tabel ini informatif:

use Filament\\Tables\\Columns\\TextColumn;  
use Filament\\Tables\\Columns\\BadgeColumn;

public static function table(Table $table): Table  
{  
    return $table  
        \-\>columns(\[  
            TextColumn::make('created\_at')-\>dateTime()-\>label('Tanggal')-\>sortable(),  
            TextColumn::make('siswa.name')-\>label('Nama Siswa')-\>searchable(),  
            TextColumn::make('kelas.nama\_kelas')-\>label('Kelas'),  
            TextColumn::make('jenis\_izin'),  
            TextColumn::make('status')  
                \-\>badge()  
                \-\>color(fn (string $state): string \=\> match ($state) {  
                    'pending' \=\> 'warning',  
                    'approved\_by\_wali' \=\> 'info',  
                    'approved\_by\_piket' \=\> 'info',  
                    'approved\_final' \=\> 'success',  
                    'rejected' \=\> 'danger',  
                }),  
        \])  
        \-\>defaultSort('created\_at', 'desc'); // Urutkan dari yang terbaru  
}

// Hilangkan tombol "Create" agar admin tidak bisa membuat tiket  
public static function canCreate(): bool  
{  
    return false;  
}

## **Langkah 5: Pembuatan Widget Dashboard (Statistik)**

Admin perlu melihat statistik ringkas di halaman depan *dashboard* (seperti jumlah tiket bulan ini). Kita akan membuat *Widget* (Stats Overview).

php artisan make:filament-widget StatsOverview \--stats-overview

Buka file app/Filament/Widgets/StatsOverview.php:

namespace App\\Filament\\Widgets;

use App\\Models\\DispensasiTicket;  
use App\\Models\\User;  
use Filament\\Widgets\\StatsOverviewWidget as BaseWidget;  
use Filament\\Widgets\\StatsOverviewWidget\\Stat;

class StatsOverview extends BaseWidget  
{  
    protected function getStats(): array  
    {  
        return \[  
            Stat::make('Total Tiket Bulan Ini', DispensasiTicket::whereMonth('created\_at', now()-\>month)-\>count())  
                \-\>description('Seluruh perizinan')  
                \-\>descriptionIcon('heroicon-m-document-text')  
                \-\>color('primary'),  
                  
            Stat::make('Menunggu Persetujuan', DispensasiTicket::where('status', 'pending')-\>count())  
                \-\>description('Butuh tindakan guru')  
                \-\>descriptionIcon('heroicon-m-clock')  
                \-\>color('warning'),  
                  
            Stat::make('Siswa Terdaftar', User::where('role', 'siswa')-\>count())  
                \-\>description('Total akun siswa')  
                \-\>color('success'),  
        \];  
    }  
}

## **Ceklis Penyelesaian Fase 3**

* \[ \] Laravel Filament telah terinstal.  
* \[ \] User dengan role admin berhasil login ke rute /admin.  
* \[ \] User dengan role non-admin ditolak saat mengakses /admin.  
* \[ \] Menu CRUD Master Data (User, Kelas, Jadwal Piket) muncul di *sidebar* dan berfungsi (Create, Read, Update, Delete).  
* \[ \] Menu Monitoring "Dispensasi Ticket" muncul sebagai tabel yang bisa difilter/dicari, tetapi tombol *Create* dinonaktifkan.  
* \[ \] Terdapat statistik visual (Widget) di halaman depan *Dashboard* Admin.

Jika fase ini selesai, sistem *Backend* dan antarmuka *Admin* Anda sudah 100% siap. Anda sekarang memiliki pondasi API untuk aplikasi mobile, sekaligus sistem manajemen data untuk pihak sekolah. Langkah selanjutnya adalah fokus total pada pengembangan antarmuka HP (Aplikasi Mobile Expo) di **Fase 4**\!