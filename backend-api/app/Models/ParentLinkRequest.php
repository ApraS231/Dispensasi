<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ParentLinkRequest extends Model
{
    use HasUuids;
    
    protected $guarded = [];

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }
}
