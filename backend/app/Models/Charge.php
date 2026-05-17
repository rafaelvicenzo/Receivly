<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Charge extends Model
{
    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_email',
        'customer_document',
        'description',
        'amount',
        'due_date',
        'status',
        'payment_method',
        'paid_at',
        'fine_amount',
        'interest_amount',
        'discount_amount',
        'pix_key',
        'boleto_code',
        'notes',
        'asaas_id',
        'asaas_status',
        'pix_qr_code',
        'pix_copy_paste',
        'boleto_url',
        'boleto_line',
        'invoice_url'
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_at'  => 'datetime',
        'amount'   => 'decimal:2',
        'fine_amount' => 'decimal:2',
        'interest_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getTotalAmountAttribute(): float
    {
        return $this->amount + $this->fine_amount + $this->interest_amount - $this->discount_amount;
    }
}
