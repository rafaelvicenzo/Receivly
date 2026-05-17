<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class AsaasService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = config('services.asaas.api_key');
        $this->baseUrl = config('services.asaas.url');
    }

    private function http()
    {
        return Http::withHeaders([
            'accept'       => 'application/json',
            'content-type' => 'application/json',
            'access_token' => $this->apiKey,
        ])->baseUrl($this->baseUrl);
    }

    // CLIENTES
    public function createCustomer(array $data)
    {
        $response = $this->http()->post('/customers', [
            'name'              => $data['name'],
            'email'             => $data['email'] ?? null,
            'phone'             => $data['phone'] ?? null,
            'cpfCnpj'           => $data['document'] ?? null,
            'notificationDisabled' => false,
        ]);

        return $response->json();
    }

    // COBRANÇAS
    public function createCharge(array $data)
    {
        $response = $this->http()->post('/payments', [
            'customer'    => $data['asaas_customer_id'],
            'billingType' => strtoupper($data['payment_method'] === 'pix' ? 'PIX' : ($data['payment_method'] === 'boleto' ? 'BOLETO' : 'CREDIT_CARD')),
            'value'       => $data['amount'],
            'dueDate'     => $data['due_date'],
            'description' => $data['description'] ?? null,
        ]);

        return $response->json();
    }

    public function getCharge(string $asaasId)
    {
        return $this->http()->get("/payments/{$asaasId}")->json();
    }

    public function deleteCharge(string $asaasId)
    {
        return $this->http()->delete("/payments/{$asaasId}")->json();
    }

    public function getPixQrCode(string $asaasId)
    {
        return $this->http()->get("/payments/{$asaasId}/pixQrCode")->json();
    }

    public function getBoletoUrl(string $asaasId)
    {
        return $this->http()->get("/payments/{$asaasId}/identificationField")->json();
    }
}