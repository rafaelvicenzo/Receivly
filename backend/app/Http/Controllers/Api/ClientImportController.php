<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use League\Csv\Reader;

class ClientImportController extends Controller
{
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $csv  = Reader::createFromPath($file->getPathname(), 'r');
        $csv->setHeaderOffset(0);

        $imported = 0;
        $skipped  = 0;
        $errors   = [];

        foreach ($csv->getRecords() as $index => $row) {
            $row = array_map('trim', $row);

            if (empty($row['nome'] ?? $row['name'] ?? null)) {
                $errors[] = "Linha " . ($index + 2) . ": nome obrigatório.";
                $skipped++;
                continue;
            }

            try {
                Client::updateOrCreate(
                    [
                        'user_id'  => $request->user()->id,
                        'document' => $row['cpf_cnpj'] ?? $row['document'] ?? null,
                    ],
                    [
                        'user_id'  => $request->user()->id,
                        'name'     => $row['nome']     ?? $row['name'],
                        'email'    => $row['email']    ?? null,
                        'phone'    => $row['telefone'] ?? $row['phone'] ?? null,
                        'document' => $row['cpf_cnpj'] ?? $row['document'] ?? null,
                        'address'  => $row['endereco'] ?? $row['address'] ?? null,
                        'city'     => $row['cidade']   ?? $row['city']    ?? null,
                        'state'    => $row['estado']   ?? $row['state']   ?? null,
                        'status'   => 'active',
                    ]
                );
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Linha " . ($index + 2) . ": " . $e->getMessage();
                $skipped++;
            }
        }

        return response()->json([
            'imported' => $imported,
            'skipped'  => $skipped,
            'errors'   => $errors,
        ]);
    }
}