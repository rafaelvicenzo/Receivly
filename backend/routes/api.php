<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChargeController;

Route::get('/charges', [ChargeController::class, 'index']);
Route::post('/charges', [ChargeController::class, 'store']);