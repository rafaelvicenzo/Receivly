<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Charge;

class ChargeController extends Controller
{
    public function store(Request $request)
    {
        return Charge::create($request->all());
    }

    public function index()
    {
        return \App\Models\Charge::all();
    }
}
