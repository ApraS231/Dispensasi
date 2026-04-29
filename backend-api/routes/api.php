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

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
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
    });

    // GURU PIKET
    Route::middleware('role:guru_piket')->group(function () {
        Route::get('/piket/status', [PiketController::class, 'getStatus']);
        Route::post('/piket/validate-qr', [PiketController::class, 'validateQR']);
    });

    // GURU PIKET ATAU WALI KELAS (Approval Flow)
    Route::middleware('role:guru_piket,wali_kelas')->group(function () {
        Route::get('/dispensasi', [DispensasiController::class, 'index']);
        Route::get('/dispensasi/pending', [DispensasiController::class, 'pending']);
        Route::post('/dispensasi/{id}/approve', [DispensasiController::class, 'approve']);
        Route::post('/dispensasi/{id}/reject', [DispensasiController::class, 'reject']);
    });

    // ORANG TUA
    Route::middleware('role:orang_tua')->group(function () {
        Route::get('/monitoring/anak', [DispensasiController::class, 'monitoringAnak']);
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
