<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChargeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/charges', [ChargeController::class, 'index']);
    Route::post('/charges', [ChargeController::class, 'store']);
    Route::get('/charges/{id}', [ChargeController::class, 'show']);
    Route::put('/charges/{id}', [ChargeController::class, 'update']);
    Route::delete('/charges/{id}', [ChargeController::class, 'destroy']);
    Route::patch('/charges/{id}/pay', [ChargeController::class, 'markAsPaid']);

    Route::get('/clients', [ClientController::class, 'index']);
    Route::post('/clients', [ClientController::class, 'store']);
    Route::get('/clients/{id}', [ClientController::class, 'show']);
    Route::put('/clients/{id}', [ClientController::class, 'update']);
    Route::delete('/clients/{id}', [ClientController::class, 'destroy']);
});