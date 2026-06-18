<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DispensasiController;
use App\Http\Controllers\Api\PiketController;
use App\Http\Controllers\Api\TicketChatController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Master\UserController;
use App\Http\Controllers\Api\Master\KelasController;
use App\Http\Controllers\Api\Master\SiswaProfileController;
use App\Http\Controllers\Api\Master\PiketScheduleController;
use App\Http\Controllers\Api\ParentLinkController;
use App\Http\Controllers\Api\WaliKelasController;


use App\Http\Controllers\Api\ProfileController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/kelas', [KelasController::class, 'index']);

Route::get('/diagnose-s3', function () {
    $results = [];
    $results['disk_driver'] = config('filesystems.disks.supabase.driver');
    $results['bucket'] = config('filesystems.disks.supabase.bucket');
    $results['endpoint'] = config('filesystems.disks.supabase.endpoint');
    $results['has_access_key'] = !empty(config('filesystems.disks.supabase.key'));
    $results['has_secret_key'] = !empty(config('filesystems.disks.supabase.secret'));
    $results['region'] = config('filesystems.disks.supabase.region');
    $results['has_url'] = !empty(config('filesystems.disks.supabase.url'));

    try {
        $disk = \Illuminate\Support\Facades\Storage::disk('supabase');
        $filename = 'diagnose_test_' . time() . '.jpg';
        $content = base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=');
        
        $writeResult = $disk->put($filename, $content);
        $results['write_result'] = $writeResult ? 'Success' : 'Failed';
        
        if ($writeResult) {
            $url = $disk->url($filename);
            $results['generated_url'] = $url;
            
            $response = \Illuminate\Support\Facades\Http::get($url);
            $results['http_status'] = $response->status();
            $results['http_body_length'] = strlen($response->body());
            
            // Delete it
            $deleteResult = $disk->delete($filename);
            $results['delete_result'] = $deleteResult ? 'Success' : 'Failed';
        }
        $results['status'] = 'OK';
    } catch (\Exception $e) {
        $results['status'] = 'ERROR';
        $results['error_message'] = $e->getMessage();
        if ($e->getPrevious()) {
            $results['previous_error'] = $e->getPrevious()->getMessage();
        }
    }

    return response()->json($results);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile
    Route::post('/profile/update', [ProfileController::class, 'update']);
    Route::post('/profile/update-password', [ProfileController::class, 'updatePassword']);
    
    // Route::get('/kelas', [KelasController::class, 'index']); // Moved out to public for register
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/user/device-token', [AuthController::class, 'updateDeviceToken']);

    // MASTER DATA (Admin Only)
    Route::middleware('role:admin')->prefix('master')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::apiResource('kelas', KelasController::class);
        Route::apiResource('siswa-profiles', SiswaProfileController::class);
        Route::apiResource('piket-schedules', PiketScheduleController::class);
    });

    // SISWA & ORANG TUA (Bisa buat pengajuan)
    Route::middleware('role:siswa,orang_tua')->group(function () {
        Route::post('/dispensasi', [DispensasiController::class, 'store']);
    });

    Route::middleware('role:siswa')->group(function () {
        Route::get('/dispensasi/me', [DispensasiController::class, 'myTickets']);
        Route::get('/siswa/parent-requests', [ParentLinkController::class, 'pendingRequests']);
        Route::post('/siswa/parent-requests/{id}/respond', [ParentLinkController::class, 'respondRequest']);
    });

    // GURU PIKET
    Route::middleware('role:guru_piket')->group(function () {
        Route::get('/piket/status', [PiketController::class, 'getStatus']);
        Route::get('/piket/queue', [PiketController::class, 'getQueue']);
        Route::post('/piket/validate-qr', [PiketController::class, 'validateQR']);
    Route::get('/piket/daily-log', [PiketController::class, 'getDailyLog']);
    });

    // GURU PIKET ATAU WALI KELAS (Approval Flow)
    Route::middleware('role:guru_piket,wali_kelas')->group(function () {
        Route::get('/dispensasi', [DispensasiController::class, 'index']);
        Route::get('/dispensasi/pending', [DispensasiController::class, 'pending']);
        Route::post('/dispensasi/{id}/approve', [DispensasiController::class, 'approve']);
        Route::post('/dispensasi/{id}/reject', [DispensasiController::class, 'reject']);
    });

    // WALI KELAS ONLY
    Route::middleware('role:wali_kelas')->group(function () {
        Route::get('/wali/siswa', [WaliKelasController::class, 'getSiswaKelas']);
        Route::get('/wali/search-siswa', [WaliKelasController::class, 'searchSiswa']);
        Route::post('/wali/tambah-siswa', [WaliKelasController::class, 'tambahSiswa']);
        Route::delete('/wali/hapus-siswa/{id}', [WaliKelasController::class, 'hapusSiswa']);
        Route::get('/wali/laporan-izin', [WaliKelasController::class, 'laporanIzin']);
        
        // Class Join Requests
        Route::get('/wali/class-requests', [WaliKelasController::class, 'getClassRequests']);
        Route::post('/wali/class-requests/{id}/respond', [WaliKelasController::class, 'respondClassRequest']);
    });

    // ORANG TUA
    Route::middleware('role:orang_tua')->group(function () {
        Route::get('/monitoring/anak', [DispensasiController::class, 'monitoringAnak']);
        Route::get('/ortu/children', [DispensasiController::class, 'getChildren']);
        Route::get('/ortu/recent-tickets', [DispensasiController::class, 'monitoringAnak']);
        Route::get('/ortu/search-siswa', [ParentLinkController::class, 'searchSiswa']);
        Route::get('/ortu/kelas', [ParentLinkController::class, 'getKelas']);
        Route::post('/ortu/link-request', [ParentLinkController::class, 'sendRequest']);
        Route::get('/ortu/link-requests', [ParentLinkController::class, 'myRequests']);
        Route::delete('/ortu/link-request/{id}', [ParentLinkController::class, 'cancelRequest']);
    });

    // TICKET CHATS & NOTIFICATIONS (All Authenticated Users)
    Route::get('/dispensasi/{id}/chats', [TicketChatController::class, 'index']);
    Route::post('/dispensasi/{id}/chats', [TicketChatController::class, 'store']);
    
    Route::get('/dispensasi/{id}', [DispensasiController::class, 'show']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'update']);
});
