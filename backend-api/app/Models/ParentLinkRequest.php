<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ParentLinkRequest extends Model
{
    use HasUuids;

    protected $table = 'permintaan_hubung_ortu';
    protected $primaryKey = 'id_permintaan_hubung_ortu';

    protected $appends = ['id', 'parent_id', 'siswa_id'];

    public function getIdAttribute()
    {
        return $this->attributes['id_permintaan_hubung_ortu'] ?? $this->id_permintaan_hubung_ortu ?? null;
    }

    public function getParentIdAttribute()
    {
        return $this->attributes['id_orang_tua'] ?? $this->id_orang_tua ?? null;
    }

    public function getSiswaIdAttribute()
    {
        return $this->attributes['id_siswa'] ?? $this->id_siswa ?? null;
    }
    
    protected $guarded = [];

    public function parent()
    {
        return $this->belongsTo(User::class, 'id_orang_tua', 'id_pengguna');
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'id_siswa', 'id_pengguna');
    }
}
