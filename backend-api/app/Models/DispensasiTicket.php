<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class DispensasiTicket extends Model
{
    use HasUuids;

    protected $table = 'tiket_dispensasi';
    protected $primaryKey = 'id_tiket_dispensasi';

    protected $appends = [
        'id', 'siswa_id', 'kelas_id', 'wali_kelas_id', 'guru_piket_id',
        'piket_attendance_id', 'qr_code_token', 'qr_token', 'scanned_at',
        'scanner_id', 'expires_at', 'is_scanned'
    ];

    public function getIdAttribute()
    {
        return $this->attributes['id_tiket_dispensasi'] ?? $this->id_tiket_dispensasi ?? null;
    }

    public function getSiswaIdAttribute()
    {
        return $this->attributes['id_siswa'] ?? $this->id_siswa ?? null;
    }

    public function getKelasIdAttribute()
    {
        return $this->attributes['id_kelas'] ?? $this->id_kelas ?? null;
    }

    public function getWaliKelasIdAttribute()
    {
        return $this->attributes['id_wali_kelas'] ?? $this->id_wali_kelas ?? null;
    }

    public function getGuruPiketIdAttribute()
    {
        return $this->attributes['id_guru_piket'] ?? $this->id_guru_piket ?? null;
    }

    public function getPiketAttendanceIdAttribute()
    {
        return $this->attributes['id_log_kehadiran_piket'] ?? $this->id_log_kehadiran_piket ?? null;
    }

    public function getQrCodeTokenAttribute()
    {
        return $this->attributes['token_qr_code'] ?? $this->token_qr_code ?? null;
    }

    public function getQrTokenAttribute()
    {
        return $this->attributes['token_qr'] ?? $this->token_qr ?? null;
    }

    public function getScannedAtAttribute()
    {
        return $this->attributes['waktu_pindai'] ?? $this->waktu_pindai ?? null;
    }

    public function getScannerIdAttribute()
    {
        return $this->attributes['id_pemindai'] ?? $this->id_pemindai ?? null;
    }

    public function getExpiresAtAttribute()
    {
        return $this->attributes['kedaluwarsa_pada'] ?? $this->kedaluwarsa_pada ?? null;
    }

    public function getIsScannedAttribute()
    {
        return $this->attributes['sudah_dipindai'] ?? $this->sudah_dipindai ?? null;
    }

    protected $guarded = [];

    protected $casts = [
        'waktu_mulai' => 'datetime',
        'waktu_selesai' => 'datetime',
        'waktu_pindai' => 'datetime',
        'kedaluwarsa_pada' => 'datetime',
        'sudah_dipindai' => 'boolean',
    ];

    public function isExpired()
    {
        return $this->kedaluwarsa_pada && now()->greaterThan($this->kedaluwarsa_pada);
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'id_siswa', 'id_pengguna');
    }

    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'id_kelas', 'id_kelas');
    }

    public function waliKelas()
    {
        return $this->belongsTo(User::class, 'id_wali_kelas', 'id_pengguna');
    }

    public function guruPiket()
    {
        return $this->belongsTo(User::class, 'id_guru_piket', 'id_pengguna');
    }

    public function scanner()
    {
        return $this->belongsTo(User::class, 'id_pemindai', 'id_pengguna');
    }

    public function piketLog()
    {
        return $this->belongsTo(PiketAttendanceLog::class, 'id_log_kehadiran_piket', 'id_log_kehadiran_piket');
    }

    public function chats()
    {
        return $this->hasMany(TicketChat::class, 'id_tiket_dispensasi', 'id_tiket_dispensasi');
    }
}
