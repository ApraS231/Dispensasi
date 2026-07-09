<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClassJoinRequest extends Model
{
    use HasUuids;

    protected $table = 'permintaan_gabung_kelas';
    protected $primaryKey = 'id_permintaan_gabung_kelas';

    protected $appends = ['id', 'siswa_id', 'kelas_id'];

    public function getIdAttribute()
    {
        return $this->attributes['id_permintaan_gabung_kelas'] ?? $this->id_permintaan_gabung_kelas ?? null;
    }

    public function getSiswaIdAttribute()
    {
        return $this->attributes['id_siswa'] ?? $this->id_siswa ?? null;
    }

    public function getKelasIdAttribute()
    {
        return $this->attributes['id_kelas'] ?? $this->id_kelas ?? null;
    }

    protected $guarded = [];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'id_siswa', 'id_pengguna');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas', 'id_kelas');
    }
}
