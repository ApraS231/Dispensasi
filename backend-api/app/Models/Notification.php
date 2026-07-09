<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasUuids;

    protected $table = 'notifikasi';
    protected $primaryKey = 'id_notifikasi';

    protected $appends = ['id', 'user_id', 'title', 'body', 'reference_id', 'is_read'];

    public function getIdAttribute()
    {
        return $this->attributes['id_notifikasi'] ?? $this->id_notifikasi ?? null;
    }

    public function getUserIdAttribute()
    {
        return $this->attributes['id_pengguna'] ?? $this->id_pengguna ?? null;
    }

    public function getTitleAttribute()
    {
        return $this->attributes['judul'] ?? $this->judul ?? null;
    }

    public function getBodyAttribute()
    {
        return $this->attributes['isi'] ?? $this->isi ?? null;
    }

    public function getReferenceIdAttribute()
    {
        return $this->attributes['id_referensi'] ?? $this->id_referensi ?? null;
    }

    public function getIsReadAttribute()
    {
        return $this->attributes['sudah_dibaca'] ?? $this->sudah_dibaca ?? null;
    }

    protected $guarded = [];

    protected $casts = [
        'sudah_dibaca' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id_pengguna');
    }
}
