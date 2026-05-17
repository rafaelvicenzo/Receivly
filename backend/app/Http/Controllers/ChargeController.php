<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Charge;
use App\Models\Client;
use App\Services\AsaasService;
use Illuminate\Support\Facades\Log;

class ChargeController extends Controller
{
    private AsaasService $asaas;

    public function __construct(AsaasService $asaas)
    {
        $this->asaas = $asaas;
    }

    public function index(Request $request)
    {
        $charges = $request->user()->charges()->orderBy('due_date', 'asc')->get();

        foreach ($charges as $charge) {
            $this->updateStatus($charge);
        }

        return response()->json($charges);
    }

    public function store(Request $request)
{
    $request->validate([
        'customer_name'     => 'required|string|max:255',
        'customer_email'    => 'nullable|email',
        'customer_document' => 'nullable|string|max:20',
        'description'       => 'nullable|string',
        'amount'            => 'required|numeric|min:0.01',
        'due_date'          => 'required|date',
        'payment_method'    => 'nullable|in:pix,boleto,cartao',
        'notes'             => 'nullable|string',
        'client_id'         => 'nullable|exists:clients,id',
    ]);

    $charge = Charge::create([
        'user_id'           => $request->user()->id,
        'customer_name'     => $request->customer_name,
        'customer_email'    => $request->customer_email,
        'customer_document' => $request->customer_document,
        'description'       => $request->description,
        'amount'            => $request->amount,
        'due_date'          => $request->due_date,
        'status'            => 'pending',
        'payment_method'    => $request->payment_method ?? 'pix',
        'notes'             => $request->notes,
    ]);

    Log::info('Iniciando integração Asaas para cobrança: ' . $charge->id);

    try {
        $asaasCustomer = $this->asaas->createCustomer([
            'name'     => $request->customer_name,
            'email'    => $request->customer_email,
            'document' => $request->customer_document,
        ]);

        Log::info('Asaas customer response: ' . json_encode($asaasCustomer));

        $asaasCustomerId = $asaasCustomer['id'] ?? null;

        if ($asaasCustomerId) {
            $asaasCharge = $this->asaas->createCharge([
                'asaas_customer_id' => $asaasCustomerId,
                'amount'            => $request->amount,
                'due_date'          => $request->due_date,
                'description'       => $request->description,
                'payment_method'    => $request->payment_method ?? 'pix',
            ]);

            Log::info('Asaas charge response: ' . json_encode($asaasCharge));

            if (isset($asaasCharge['id'])) {
                $updateData = [
                    'asaas_id'     => $asaasCharge['id'],
                    'asaas_status' => $asaasCharge['status'] ?? null,
                    'invoice_url'  => $asaasCharge['invoiceUrl'] ?? null,
                ];

                if ($request->payment_method === 'pix') {
                    $pix = $this->asaas->getPixQrCode($asaasCharge['id']);
                    Log::info('Asaas pix response: ' . json_encode($pix));
                    $updateData['pix_qr_code']   = $pix['encodedImage'] ?? null;
                    $updateData['pix_copy_paste'] = $pix['payload'] ?? null;
                }

                if ($request->payment_method === 'boleto') {
                    $boleto = $this->asaas->getBoletoUrl($asaasCharge['id']);
                    $updateData['boleto_line'] = $boleto['identificationField'] ?? null;
                    $updateData['boleto_url']  = $asaasCharge['bankSlipUrl'] ?? null;
                }

                $charge->update($updateData);
            }
        }
    } catch (\Exception $e) {
        Log::error('Asaas error: ' . $e->getMessage());
        Log::error($e->getTraceAsString());
    }

    return response()->json($charge, 201);
}

    public function show(Request $request, $id)
    {
        $charge = $request->user()->charges()->findOrFail($id);
        return response()->json($charge);
    }

    public function update(Request $request, $id)
    {
        $charge = $request->user()->charges()->findOrFail($id);

        $request->validate([
            'customer_name'     => 'sometimes|string|max:255',
            'customer_email'    => 'nullable|email',
            'customer_document' => 'nullable|string|max:20',
            'description'       => 'nullable|string',
            'amount'            => 'sometimes|numeric|min:0.01',
            'due_date'          => 'sometimes|date',
            'payment_method'    => 'nullable|in:pix,boleto,cartao',
            'status'            => 'sometimes|in:pending,paid,overdue,cancelled',
            'notes'             => 'nullable|string',
        ]);

        $data = $request->except(['user_id']);

        if ($request->status === 'paid' && !$charge->paid_at) {
            $data['paid_at'] = now();
        }

        $charge->update($data);

        return response()->json($charge);
    }

    public function destroy(Request $request, $id)
    {
        $charge = $request->user()->charges()->findOrFail($id);

        if ($charge->asaas_id) {
            try {
                $this->asaas->deleteCharge($charge->asaas_id);
            } catch (\Exception $e) {}
        }

        $charge->delete();

        return response()->json(['message' => 'Cobrança excluída com sucesso.']);
    }

    public function markAsPaid(Request $request, $id)
    {
        $charge = $request->user()->charges()->findOrFail($id);
        $charge->update([
            'status'  => 'paid',
            'paid_at' => now(),
        ]);

        return response()->json($charge);
    }

    private function updateStatus(Charge $charge)
    {
        if ($charge->status === 'paid' || $charge->status === 'cancelled') {
            return;
        }

        if (now()->greaterThan($charge->due_date)) {
            $charge->update(['status' => 'overdue']);
        }
    }
}