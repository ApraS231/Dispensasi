<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    use HasUuids;

    protected $table = 'kelas';
    protected $primaryKey = 'id_kelas';

    protected $appends = ['id', 'wali_kelas_id'];

    public function getIdAttribute()
    {
        return $this->attributes['id_kelas'] ?? $this->id_kelas ?? null;
    }

    public function getWaliKelasIdAttribute()
    {
        return $this->attributes['id_wali_kelas'] ?? $this->id_wali_kelas ?? null;
    }

    protected $guarded = [];

    public function waliKelas()
    {
        return $this->belongsTo(User::class, 'id_wali_kelas', 'id_pengguna');
    }

    public function siswaProfiles()
    {
        return $this->hasMany(SiswaProfile::class, 'id_kelas', 'id_kelas');
    }
}
