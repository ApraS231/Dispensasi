<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class TicketChat extends Model
{
    use HasUuids;

    protected $table = 'obrolan_tiket';
    protected $primaryKey = 'id_obrolan_tiket';

    protected $appends = ['id', 'dispensasi_ticket_id', 'sender_id', 'is_read', 'attachment_url'];

    public function getIdAttribute()
    {
        return $this->attributes['id_obrolan_tiket'] ?? $this->id_obrolan_tiket ?? null;
    }

    public function getDispensasiTicketIdAttribute()
    {
        return $this->attributes['id_tiket_dispensasi'] ?? $this->id_tiket_dispensasi ?? null;
    }

    public function getSenderIdAttribute()
    {
        return $this->attributes['id_pengirim'] ?? $this->id_pengirim ?? null;
    }

    public function getIsReadAttribute()
    {
        return $this->attributes['sudah_dibaca'] ?? $this->sudah_dibaca ?? null;
    }

    public function getAttachmentUrlAttribute()
    {
        return $this->attributes['url_lampiran'] ?? $this->url_lampiran ?? null;
    }

    protected $guarded = [];

    protected $casts = [
        'sudah_dibaca' => 'boolean',
    ];

    public function ticket()
    {
        return $this->belongsTo(DispensasiTicket::class, 'id_tiket_dispensasi', 'id_tiket_dispensasi');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'id_pengirim', 'id_pengguna');
    }
}
