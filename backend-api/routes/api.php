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


Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/user/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
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

    // SISWA
    Route::middleware('role:siswa')->group(function () {
        Route::post('/dispensasi', [DispensasiController::class, 'store']);
        Route::get('/dispensasi/me', [DispensasiController::class, 'myTickets']);
        Route::get('/siswa/parent-requests', [ParentLinkController::class, 'pendingRequests']);
        Route::post('/siswa/parent-requests/{id}/respond', [ParentLinkController::class, 'respondRequest']);
    });

    // GURU PIKET
    Route::middleware('role:guru_piket')->group(function () {
        Route::get('/piket/status', [PiketController::class, 'getStatus']);
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
