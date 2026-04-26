<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Charge;

class ChargeController extends Controller
{
    public function store(Request $request)
{
    return response()->json([
        'user' => $request->user()
    ]);
}

    public function index(Request $request)
{
    return $request->user()->charges;
}
}
