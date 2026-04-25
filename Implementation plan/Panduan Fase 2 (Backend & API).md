# **Panduan Teknis Detail \- Fase 2: Pengembangan Backend & API (Laravel)**

Pada Fase 2 ini, kita akan membangun pondasi logika bisnis di Laravel. Karena tabel sudah dibuat di Supabase (PostgreSQL) pada Fase 1, fokus kita di sini adalah membuat **Model (Eloquent)**, **Sistem Autentikasi (Sanctum)**, **Middleware (Role)**, dan **Controller (Logika API)**.

## **Langkah 1: Persiapan Model & Relasi (Eloquent)**

Karena struktur database sudah ada di Supabase, kita perlu membuat Model Laravel untuk setiap tabel dan mendefinisikan relasinya.

Jalankan perintah berikut di terminal (dalam folder backend-api):

php artisan make:model Kelas  
php artisan make:model SiswaProfile  
php artisan make:model PiketSchedule  
php artisan make:model PiketAttendanceLog  
php artisan make:model DispensasiTicket  
php artisan make:model TicketChat  
php artisan make:model Notification

**Contoh Definisi Relasi pada Model DispensasiTicket.php:**

Buka file app/Models/DispensasiTicket.php dan sesuaikan:

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Concerns\\HasUuids;  
use Illuminate\\Database\\Eloquent\\Model;

class DispensasiTicket extends Model  
{  
    use HasUuids; // Menggunakan UUID dari Supabase

    protected $guarded \= \[\];

    // Relasi ke Siswa  
    public function siswa() {  
        return $this-\>belongsTo(User::class, 'siswa\_id');  
    }

    // Relasi ke Wali Kelas  
    public function waliKelas() {  
        return $this-\>belongsTo(User::class, 'wali\_kelas\_id');  
    }

    // Relasi ke Guru Piket  
    public function guruPiket() {  
        return $this-\>belongsTo(User::class, 'guru\_piket\_id');  
    }

    // Relasi ke Chat  
    public function chats() {  
        return $this-\>hasMany(TicketChat::class);  
    }  
}

*(Lakukan hal serupa untuk mendefinisikan relasi belongsTo atau hasMany di Model lainnya sesuai DBML).*

## **Langkah 2: Autentikasi API dengan Sanctum**

Kita perlu membuat fitur Login untuk aplikasi mobile agar mendapatkan Token Akses.

1. Buat Controller Autentikasi:

php artisan make:controller Api/AuthController

2. Isi AuthController.php:

namespace App\\Http\\Controllers\\Api;

use App\\Http\\Controllers\\Controller;  
use Illuminate\\Http\\Request;  
use App\\Models\\User;  
use Illuminate\\Support\\Facades\\Hash;

class AuthController extends Controller  
{  
    public function login(Request $request)  
    {  
        $request-\>validate(\[  
            'email' \=\> 'required|email',  
            'password' \=\> 'required',  
            'device\_token' \=\> 'nullable|string' // Dari Expo untuk Push Notif  
        \]);

        $user \= User::where('email', $request-\>email)-\>first();

        if (\!$user || \!Hash::check($request-\>password, $user-\>password)) {  
            return response()-\>json(\['message' \=\> 'Kredensial salah'\], 401);  
        }

        // Update device\_token jika ada  
        if ($request-\>has('device\_token')) {  
            $user-\>update(\['device\_token' \=\> $request-\>device\_token\]);  
        }

        $token \= $user-\>createToken('mobile-app-token')-\>plainTextToken;

        return response()-\>json(\[  
            'user' \=\> $user,  
            'token' \=\> $token  
        \]);  
    }

    public function logout(Request $request)  
    {  
        $request-\>user()-\>currentAccessToken()-\>delete();  
        return response()-\>json(\['message' \=\> 'Logout berhasil'\]);  
    }  
}

## **Langkah 3: Membuat Middleware Role-Based Access Control (RBAC)**

Kita perlu membatasi API (misal: hanya guru piket yang bisa klik *approve*).

1. Buat Middleware:

php artisan make:middleware CheckRole

2. Buka app/Http/Middleware/CheckRole.php:

namespace App\\Http\\Middleware;

use Closure;  
use Illuminate\\Http\\Request;

class CheckRole  
{  
    public function handle(Request $request, Closure $next, ...$roles)  
    {  
        if (\!in\_array($request-\>user()-\>role, $roles)) {  
            return response()-\>json(\['message' \=\> 'Akses ditolak. Anda tidak memiliki izin.'\], 403);  
        }  
        return $next($request);  
    }  
}

3. Daftarkan alias middleware ini di bootstrap/app.php (Jika pakai Laravel 11):

\-\>withMiddleware(function (Middleware $middleware) {  
    $middleware-\>alias(\[  
        'role' \=\> \\App\\Http\\Middleware\\CheckRole::class,  
    \]);  
})

## **Langkah 4: Logika "Auto-Assignment" Tiket Dispensasi**

Ini adalah fitur krusial (Logika Inti). Saat siswa membuat tiket, backend otomatis mencari wali kelas dan guru piket yang *Ready*.

1. Buat Controller:

php artisan make:controller Api/DispensasiController

2. Isi metode store di DispensasiController.php:

public function store(Request $request)  
{  
    $request-\>validate(\[  
        'jenis\_izin' \=\> 'required|string',  
        'alasan' \=\> 'required|string',  
        'waktu\_mulai' \=\> 'required|date',  
        'waktu\_selesai' \=\> 'required|date',  
    \]);

    $siswa \= $request-\>user();  
    $profilSiswa \= \\App\\Models\\SiswaProfile::where('user\_id', $siswa-\>id)-\>with('kelas')-\>first();

    // 1\. Dapatkan Wali Kelas Otomatis  
    $waliKelasId \= $profilSiswa-\>kelas-\>wali\_kelas\_id ?? null;

    // 2\. Dapatkan Guru Piket yang sedang "Ready"  
    $piketAktif \= \\App\\Models\\PiketAttendanceLog::where('status\_aktif', true)-\>latest()-\>first();  
    $guruPiketId \= $piketAktif ? $piketAktif-\>guru\_id : null;  
    $piketAttendanceId \= $piketAktif ? $piketAktif-\>id : null;

    // 3\. Buat Tiket  
    $tiket \= \\App\\Models\\DispensasiTicket::create(\[  
        'siswa\_id' \=\> $siswa-\>id,  
        'kelas\_id' \=\> $profilSiswa-\>kelas\_id,  
        'wali\_kelas\_id' \=\> $waliKelasId,  
        'guru\_piket\_id' \=\> $guruPiketId,  
        'piket\_attendance\_id' \=\> $piketAttendanceId,  
        'jenis\_izin' \=\> $request-\>jenis\_izin,  
        'alasan' \=\> $request-\>alasan,  
        'waktu\_mulai' \=\> $request-\>waktu\_mulai,  
        'waktu\_selesai' \=\> $request-\>waktu\_selesai,  
        'status' \=\> 'pending'  
    \]);

    // TODO: Trigger Push Notification ke $waliKelasId dan $guruPiketId

    return response()-\>json(\['message' \=\> 'Tiket berhasil diajukan', 'data' \=\> $tiket\], 201);  
}

## **Langkah 5: Logika Approval & QR Code**

Tambahkan metode untuk Guru menyetujui tiket di DispensasiController.php.

use Illuminate\\Support\\Str; // Untuk generate UUID/String unik

public function approve(Request $request, $id)  
{  
    $tiket \= \\App\\Models\\DispensasiTicket::findOrFail($id);  
    $user \= $request-\>user();

    // Jika yang approve adalah Wali Kelas  
    if ($user-\>role \=== 'wali\_kelas' && $tiket-\>wali\_kelas\_id \=== $user-\>id) {  
        $tiket-\>update(\['status' \=\> 'approved\_by\_wali'\]);  
    }  
    // Jika yang approve adalah Guru Piket  
    else if ($user-\>role \=== 'guru\_piket' && $tiket-\>guru\_piket\_id \=== $user-\>id) {  
        // Jika sudah di-approve wali, maka final. Jika tidak butuh wali, langsung final (sesuaikan SOP sekolah)  
        $tiket-\>update(\[  
            'status' \=\> 'approved\_final',  
            'qr\_code\_token' \=\> (string) Str::uuid() // Generate token unik untuk dirender jadi QR Code di HP  
        \]);  
    } else {  
        return response()-\>json(\['message' \=\> 'Anda tidak berhak menyetujui tiket ini'\], 403);  
    }

    return response()-\>json(\['message' \=\> 'Tiket disetujui', 'data' \=\> $tiket\]);  
}

## **Langkah 6: Logika Guru Piket "Ready"**

Buat PiketController untuk mengatur sesi shift guru piket.

php artisan make:controller Api/PiketController

Isi dengan fungsi setReady:

public function setReady(Request $request)  
{  
    $user \= $request-\>user();

    // Matikan shift sebelumnya yang mungkin masih aktif tapi lupa dimatikan  
    \\App\\Models\\PiketAttendanceLog::where('guru\_id', $user-\>id)  
        \-\>where('status\_aktif', true)  
        \-\>update(\['status\_aktif' \=\> false, 'waktu\_keluar' \=\> now()\]);

    // Buat sesi shift baru  
    $log \= \\App\\Models\\PiketAttendanceLog::create(\[  
        'guru\_id' \=\> $user-\>id,  
        'waktu\_masuk' \=\> now(),  
        'status\_aktif' \=\> true  
    \]);

    return response()-\>json(\['message' \=\> 'Anda sekarang bertugas (Ready).', 'data' \=\> $log\]);  
}

## **Langkah 7: Mendaftarkan Routes (API Endpoints)**

Buka file routes/api.php dan kelompokkan *endpoint* berdasarkan autentikasi dan *role*.

use Illuminate\\Support\\Facades\\Route;  
use App\\Http\\Controllers\\Api\\AuthController;  
use App\\Http\\Controllers\\Api\\DispensasiController;  
use App\\Http\\Controllers\\Api\\PiketController;

// Public Route  
Route::post('/login', \[AuthController::class, 'login'\]);

// Protected Routes (Harus Bawa Token Sanctum)  
Route::middleware('auth:sanctum')-\>group(function () {  
    Route::post('/logout', \[AuthController::class, 'logout'\]);  
      
    // Fitur Siswa  
    Route::middleware('role:siswa')-\>group(function () {  
        Route::post('/dispensasi', \[DispensasiController::class, 'store'\]);  
        Route::get('/dispensasi/me', \[DispensasiController::class, 'myTickets'\]);  
    });

    // Fitur Guru Piket  
    Route::middleware('role:guru\_piket')-\>group(function () {  
        Route::post('/piket/ready', \[PiketController::class, 'setReady'\]);  
        Route::post('/piket/checkout', \[PiketController::class, 'setCheckout'\]);  
    });

    // Fitur Approval (Guru Piket ATAU Wali Kelas)  
    Route::middleware('role:guru\_piket,wali\_kelas')-\>group(function () {  
        Route::post('/dispensasi/{id}/approve', \[DispensasiController::class, 'approve'\]);  
        Route::post('/dispensasi/{id}/reject', \[DispensasiController::class, 'reject'\]);  
    });

    // Fitur Orang Tua (Monitoring)  
    Route::middleware('role:orang\_tua')-\>group(function () {  
        Route::get('/monitoring/anak', \[DispensasiController::class, 'monitoringAnak'\]);  
    });  
});

## **Ceklis Penyelesaian Fase 2**

* \[ \] Model dan relasinya sudah didefinisikan.  
* \[ \] AuthController berfungsi menghasilkan token Sanctum.  
* \[ \] Middleware CheckRole sukses memblokir akses jika role tidak sesuai.  
* \[ \] Logika *Auto-Assignment* berjalan dan merekam guru\_piket\_id serta wali\_kelas\_id dengan benar ke DB.  
* \[ \] Token *QR Code* berhasil di-*generate* saat status mencapai approved\_final.

Jika Anda telah menyelesaikan *routing* dan *controller* ini, Backend Anda secara teori sudah bisa melayani aplikasi mobile. Langkah selanjutnya adalah beralih ke Expo untuk mendesain antarmuka aplikasinya\!