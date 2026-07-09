<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PiketSchedule extends Model
{
    use HasUuids;

    protected $table = 'jadwal_piket';
    protected $primaryKey = 'id_jadwal_piket';

    protected $appends = ['id', 'guru_id'];

    public function getIdAttribute()
    {
        return $this->attributes['id_jadwal_piket'] ?? $this->id_jadwal_piket ?? null;
    }

    public function getGuruIdAttribute()
    {
        return $this->attributes['id_guru'] ?? $this->id_guru ?? null;
    }

    protected $guarded = [];

    public function guru()
    {
        return $this->belongsTo(User::class, 'id_guru', 'id_pengguna');
    }
}
