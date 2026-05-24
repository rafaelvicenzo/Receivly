<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChargeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CollectionRuleController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\ScoreController;
use App\Http\Controllers\AiChatController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ClientImportController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/webhook/asaas', [WebhookController::class, 'asaas']);
Route::get('/auth/{provider}/redirect',  [SocialAuthController::class, 'redirect']);
Route::get('/auth/{provider}/callback',  [SocialAuthController::class, 'callback']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);

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

    Route::get('/collection-rules', [CollectionRuleController::class, 'index']);
    Route::post('/collection-rules', [CollectionRuleController::class, 'store']);
    Route::put('/collection-rules/{id}', [CollectionRuleController::class, 'update']);
    Route::delete('/collection-rules/{id}', [CollectionRuleController::class, 'destroy']);
    Route::get('/collection-rules/default', [CollectionRuleController::class, 'getDefault']);
    Route::patch('/collection-rules/{id}/set-default', [CollectionRuleController::class, 'setDefault']);
    Route::get('/score/client/{clientId}', [ScoreController::class, 'calculate']);
    Route::get('/score/all', [ScoreController::class, 'calculateForAll']);
    Route::post('/ai/chat', [AiChatController::class, 'chat']);
    Route::get('/reports', [ReportController::class, 'index']);

    Route::get('/dashboard/chart', [DashboardController::class, 'chartData']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/clients/import', [ClientImportController::class, 'import']);
});