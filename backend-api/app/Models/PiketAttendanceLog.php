<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PiketAttendanceLog extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'status_aktif' => 'boolean',
        'waktu_masuk' => 'datetime',
        'waktu_keluar' => 'datetime',
    ];

    public function guru()
    {
        return $this->belongsTo(User::class, 'guru_id');
    }
}
