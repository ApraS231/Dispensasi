<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DispensasiTicket extends Model
{
    use HasUuids;

    protected $guarded = [];

    protected $casts = [
        'waktu_mulai' => 'datetime',
        'waktu_selesai' => 'datetime',
        'scanned_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_scanned' => 'boolean',
    ];

    public function isExpired()
    {
        return $this->expires_at && now()->greaterThan($this->expires_at);
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    public function waliKelas()
    {
        return $this->belongsTo(User::class, 'wali_kelas_id');
    }

    public function guruPiket()
    {
        return $this->belongsTo(User::class, 'guru_piket_id');
    }

    public function scanner()
    {
        return $this->belongsTo(User::class, 'scanner_id');
    }

    public function piketLog()
    {
        return $this->belongsTo(PiketAttendanceLog::class, 'piket_attendance_id');
    }

    public function chats()
    {
        return $this->hasMany(TicketChat::class, 'dispensasi_ticket_id');
    }
}
