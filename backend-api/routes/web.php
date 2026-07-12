<?php

use App\Http\Controllers\Auth\RegistrationController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/register-ortu', [RegistrationController::class, 'create'])->name('register.ortu');
Route::post('/register-ortu', [RegistrationController::class, 'store'])->name('register.ortu.store');
Route::get('/register-ortu/success', [RegistrationController::class, 'success'])->name('register.success');

Route::get('/debug-log', function () {
    $logPath = storage_path('logs/laravel.log');
    if (!file_exists($logPath)) {
        return "Log file not found.";
    }
    $lines = file($logPath);
    $lastLines = array_slice($lines, -100);
    return response(implode("", $lastLines), 200, ['Content-Type' => 'text/plain']);
});
