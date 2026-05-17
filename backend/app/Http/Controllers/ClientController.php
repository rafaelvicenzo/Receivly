<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Services\AsaasService;

class ClientController extends Controller
{
    private AsaasService $asaas;

    public function __construct(AsaasService $asaas)
    {
        $this->asaas = $asaas;
    }

    public function index(Request $request)
    {
        $query = $request->user()->clients()->orderBy('name');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%")
                  ->orWhere('document', 'like', "%{$request->search}%");
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'nullable|email',
            'phone'         => 'nullable|string|max:20',
            'document'      => 'nullable|string|max:20',
            'document_type' => 'nullable|in:cpf,cnpj',
            'address'       => 'nullable|string',
            'city'          => 'nullable|string',
            'state'         => 'nullable|string|max:2',
            'zip_code'      => 'nullable|string|max:10',
            'notes'         => 'nullable|string',
        ]);

        $client = Client::create([
            'user_id'       => $request->user()->id,
            'name'          => $request->name,
            'email'         => $request->email,
            'phone'         => $request->phone,
            'document'      => $request->document,
            'document_type' => $request->document_type ?? 'cpf',
            'address'       => $request->address,
            'city'          => $request->city,
            'state'         => $request->state,
            'zip_code'      => $request->zip_code,
            'status'        => 'active',
            'notes'         => $request->notes,
        ]);

        try {
            $asaasCustomer = $this->asaas->createCustomer([
                'name'     => $client->name,
                'email'    => $client->email,
                'phone'    => $client->phone,
                'document' => $client->document,
            ]);

            if (isset($asaasCustomer['id'])) {
                $client->update(['asaas_customer_id' => $asaasCustomer['id']]);
            }
        } catch (\Exception $e) {
            // Não bloqueia o cadastro se o Asaas falhar
        }

        return response()->json($client, 201);
    }

    public function show(Request $request, $id)
    {
        $client = $request->user()->clients()->findOrFail($id);
        return response()->json($client);
    }

    public function update(Request $request, $id)
    {
        $client = $request->user()->clients()->findOrFail($id);

        $request->validate([
            'name'          => 'sometimes|string|max:255',
            'email'         => 'nullable|email',
            'phone'         => 'nullable|string|max:20',
            'document'      => 'nullable|string|max:20',
            'document_type' => 'nullable|in:cpf,cnpj',
            'address'       => 'nullable|string',
            'city'          => 'nullable|string',
            'state'         => 'nullable|string|max:2',
            'zip_code'      => 'nullable|string|max:10',
            'status'        => 'nullable|in:active,inactive',
            'notes'         => 'nullable|string',
        ]);

        $client->update($request->all());

        return response()->json($client);
    }

    public function destroy(Request $request, $id)
    {
        $client = $request->user()->clients()->findOrFail($id);
        $client->delete();

        return response()->json(['message' => 'Cliente excluído com sucesso.']);
    }
}