<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Charge;
use App\Models\Client;

class AiChatController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500'
        ]);

        $user = $request->user();
        $context = $this->buildContext($user);

        $systemPrompt = "Você é um assistente financeiro inteligente do sistema Receivly, uma plataforma de cobranças brasileira. Responda sempre em português, de forma clara e objetiva. Use os dados fornecidos para dar insights reais. Seja direto e use no máximo 3 parágrafos.";

        $userPrompt = "Dados financeiros do usuário:
{$context}

Pergunta: {$request->message}";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.groq.api_key'),
                'Content-Type'  => 'application/json',
            ])->post(config('services.groq.url'), [
                'model'    => 'llama-3.1-8b-instant',
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $userPrompt],
                ],
                'max_tokens'  => 512,
                'temperature' => 0.7,
            ]);

            \Log::info('Groq status: ' . $response->status());
            \Log::info('Groq response: ' . $response->body());

            $data = $response->json();
            $text = $data['choices'][0]['message']['content'] ?? 'Não consegui processar sua pergunta.';

            return response()->json(['response' => $text]);

        } catch (\Exception $e) {
            \Log::error('Groq error: ' . $e->getMessage());
            return response()->json(['response' => 'Erro ao conectar com a IA. Tente novamente.'], 500);
        }
    }

    private function buildContext($user): string
    {
        $charges = $user->charges()->get();
        $clients = $user->clients()->get();

        $totalCharges  = $charges->count();
        $totalPending  = $charges->where('status', 'pending')->sum('amount');
        $totalOverdue  = $charges->where('status', 'overdue')->sum('amount');
        $totalPaid     = $charges->where('status', 'paid')->sum('amount');
        $overdueCount  = $charges->where('status', 'overdue')->count();
        $totalClients  = $clients->count();

        $topOverdue = $charges->where('status', 'overdue')
            ->sortByDesc('amount')
            ->take(3)
            ->map(fn($c) => "{$c->customer_name}: R$ {$c->amount}")
            ->implode(', ');

        $inadimplencia = $totalCharges > 0 ? round(($overdueCount / $totalCharges) * 100, 1) : 0;

        return "
- Total de clientes: {$totalClients}
- Total de cobranças: {$totalCharges}
- Valor pendente: R$ " . number_format($totalPending, 2, ',', '.') . "
- Valor vencido: R$ " . number_format($totalOverdue, 2, ',', '.') . "
- Valor recebido: R$ " . number_format($totalPaid, 2, ',', '.') . "
- Cobranças vencidas: {$overdueCount}
- Taxa de inadimplência: {$inadimplencia}%
- Maiores devedores: {$topOverdue}
        ";
    }
}