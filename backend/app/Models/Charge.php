<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Charge extends Model
{
    protected $fillable = ['amount', 'due_date', 'status'];

    public function user()
{
    return $this->belongsTo(User::class);
}
}
