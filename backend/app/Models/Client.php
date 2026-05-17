<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'document',
        'document_type',
        'address',
        'city',
        'state',
        'zip_code',
        'status',
        'notes',
        'asaas_customer_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function charges()
    {
        return $this->hasMany(Charge::class);
    }
}