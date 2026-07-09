<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PiketAttendanceLog extends Model
{
    use HasUuids;

    protected $table = 'log_kehadiran_piket';
    protected $primaryKey = 'id_log_kehadiran_piket';

    protected $appends = ['id', 'guru_id'];

    public function getIdAttribute()
    {
        return $this->attributes['id_log_kehadiran_piket'] ?? $this->id_log_kehadiran_piket ?? null;
    }

    public function getGuruIdAttribute()
    {
        return $this->attributes['id_guru'] ?? $this->id_guru ?? null;
    }

    protected $guarded = [];

    protected $casts = [
        'status_aktif' => 'boolean',
        'waktu_masuk' => 'datetime',
        'waktu_keluar' => 'datetime',
    ];

    public function guru()
    {
        return $this->belongsTo(User::class, 'id_guru', 'id_pengguna');
    }
}
