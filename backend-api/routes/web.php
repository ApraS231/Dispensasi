<?php

use App\Http\Controllers\Auth\RegistrationController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/register-ortu', [RegistrationController::class, 'create'])->name('register.ortu');
Route::post('/register-ortu', [RegistrationController::class, 'store'])->name('register.ortu.store');
Route::get('/register-ortu/success', [RegistrationController::class, 'success'])->name('register.success');
