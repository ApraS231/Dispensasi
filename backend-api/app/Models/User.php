<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasUuids;

    protected $table = 'pengguna';
    protected $primaryKey = 'id_pengguna';

    protected $appends = ['id', 'name', 'role', 'profile_photo_url', 'device_token'];

    public function getIdAttribute()
    {
        return $this->attributes['id_pengguna'] ?? $this->id_pengguna ?? null;
    }

    public function getNameAttribute()
    {
        return $this->attributes['nama'] ?? $this->nama ?? null;
    }

    public function getRoleAttribute()
    {
        return $this->attributes['peran'] ?? $this->peran ?? null;
    }

    public function getProfilePhotoUrlAttribute()
    {
        return $this->attributes['url_foto_profil'] ?? $this->url_foto_profil ?? null;
    }

    public function getDeviceTokenAttribute()
    {
        return $this->attributes['token_perangkat'] ?? $this->token_perangkat ?? null;
    }

    protected $guarded = [];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Menentukan siapa yang berhak masuk ke panel admin Filament
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->peran === 'admin';
    }

    public function siswaProfile()
    {
        return $this->hasOne(SiswaProfile::class, 'id_pengguna');
    }

    public function kelasWali()
    {
        return $this->hasOne(Kelas::class, 'id_wali_kelas');
    }

    public function jadwalPiket()
    {
        return $this->hasMany(PiketSchedule::class, 'id_guru');
    }

    public function piketLogs()
    {
        return $this->hasMany(PiketAttendanceLog::class, 'id_guru');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'id_pengguna');
    }
}
