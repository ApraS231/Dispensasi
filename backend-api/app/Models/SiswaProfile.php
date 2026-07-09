<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class SiswaProfile extends Model
{
    use HasUuids;

    protected $table = 'profil_siswa';
    protected $primaryKey = 'id_profil_siswa';

    protected $appends = ['id', 'user_id', 'kelas_id', 'orang_tua_id'];

    public function getIdAttribute()
    {
        return $this->attributes['id_profil_siswa'] ?? $this->id_profil_siswa ?? null;
    }

    public function getUserIdAttribute()
    {
        return $this->attributes['id_pengguna'] ?? $this->id_pengguna ?? null;
    }

    public function getKelasIdAttribute()
    {
        return $this->attributes['id_kelas'] ?? $this->id_kelas ?? null;
    }

    public function getOrangTuaIdAttribute()
    {
        return $this->attributes['id_orang_tua'] ?? $this->id_orang_tua ?? null;
    }

    protected $guarded = [];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id_pengguna');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas', 'id_kelas');
    }

    public function orangTua()
    {
        return $this->belongsTo(User::class, 'id_orang_tua', 'id_pengguna');
    }
}
