<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class PiketSchedule extends Model
{
    use HasUuids;

    protected $guarded = [];

    public function guru()
    {
        return $this->belongsTo(User::class, 'guru_id');
    }
}
