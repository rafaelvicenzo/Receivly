<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Charge;

class ChargeController extends Controller
{
public function store(Request $request)
{
    return Charge::create([
        'amount' => $request->amount,
        'due_date' => $request->due_date,
        'user_id' => $request->user()->id,
        'status' => 'pending'
    ]);
}

        public function index(Request $request)
{
    $charges = $request->user()->charges;

    foreach ($charges as $charge) {
        $this->updateStatus($charge);
    }

    return $charges;
}

    private function updateStatus($charge)
    {
        if ($charge->status === 'paid') {
            return;
        }

        if (now()->greaterThan($charge->due_date)) {
            $charge->status = 'overdue';
        } else {
            $charge->status = 'pending';
        }

        $charge->save();
    }
}
