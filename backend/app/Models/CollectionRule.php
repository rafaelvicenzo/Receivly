<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CollectionRule extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'enabled',
        'is_default',
        'steps'
    ];

    protected $casts = [
        'enabled'    => 'boolean',
        'is_default' => 'boolean',
        'steps'      => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}