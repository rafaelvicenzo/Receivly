<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Charge;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function asaas(Request $request)
    {
        $event = $request->input('event');
        $payment = $request->input('payment');

        Log::info('Webhook Asaas recebido: ' . $event, $payment ?? []);

        if (!$event || !$payment) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $asaasId = $payment['id'] ?? null;

        if (!$asaasId) {
            return response()->json(['message' => 'No payment ID'], 400);
        }

        $charge = Charge::where('asaas_id', $asaasId)->first();

        if (!$charge) {
            Log::warning('Webhook: cobrança não encontrada para asaas_id: ' . $asaasId);
            return response()->json(['message' => 'Charge not found'], 404);
        }

        switch ($event) {
            case 'PAYMENT_RECEIVED':
            case 'PAYMENT_CONFIRMED':
                $charge->update([
                    'status'       => 'paid',
                    'paid_at'      => now(),
                    'asaas_status' => 'RECEIVED',
                ]);
                Log::info('Cobrança ' . $charge->id . ' marcada como paga via webhook.');
                break;

            case 'PAYMENT_OVERDUE':
                $charge->update([
                    'status'       => 'overdue',
                    'asaas_status' => 'OVERDUE',
                ]);
                break;

            case 'PAYMENT_DELETED':
            case 'PAYMENT_REFUNDED':
                $charge->update([
                    'status'       => 'cancelled',
                    'asaas_status' => $event === 'PAYMENT_REFUNDED' ? 'REFUNDED' : 'DELETED',
                ]);
                break;
        }

        return response()->json(['message' => 'Webhook processed']);
    }
}