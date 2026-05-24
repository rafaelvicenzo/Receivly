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

        $user    = $request->user();
        $context = $this->buildContext($user);

        $systemPrompt = "Você é um assistente financeiro do Receivly, plataforma brasileira de cobranças.
Regras obrigatórias:
- Responda SEMPRE em português
- Máximo de 2 frases curtas por resposta
- Seja direto e objetivo, sem introduções como 'Claro!' ou 'Ótima pergunta!'
- Use os dados financeiros fornecidos para dar respostas precisas
- Valores em reais: use o formato R$ 1.000,00
- Nunca repita a pergunta do usuário
- Se não souber, diga em uma frase";

        $userPrompt = "Dados financeiros:\n{$context}\n\nPergunta: {$request->message}";

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
                'max_tokens'  => 120,
                'temperature' => 0.4,
            ]);

            $data = $response->json();
            $text = $data['choices'][0]['message']['content'] ?? 'Não consegui processar sua pergunta.';

            return response()->json(['response' => trim($text)]);

        } catch (\Exception $e) {
            \Log::error('Groq error: ' . $e->getMessage());
            return response()->json(['response' => 'Erro ao conectar com a IA. Tente novamente.'], 500);
        }
    }

    private function buildContext($user): string
    {
        $charges = $user->charges()->get();
        $clients = $user->clients()->get();

        $totalCharges = $charges->count();
        $totalPending = $charges->where('status', 'pending')->sum('amount');
        $totalOverdue = $charges->where('status', 'overdue')->sum('amount');
        $totalPaid    = $charges->where('status', 'paid')->sum('amount');
        $overdueCount = $charges->where('status', 'overdue')->count();
        $totalClients = $clients->count();

        $topOverdue = $charges->where('status', 'overdue')
            ->sortByDesc('amount')
            ->take(3)
            ->map(fn($c) => "{$c->customer_name}: R$ " . number_format($c->amount, 2, ',', '.'))
            ->implode(', ');

        $inadimplencia = $totalCharges > 0
            ? round(($overdueCount / $totalCharges) * 100, 1)
            : 0;

        return "Clientes: {$totalClients} | Cobranças: {$totalCharges} | "
            . "Recebido: R$ " . number_format($totalPaid, 2, ',', '.') . " | "
            . "Pendente: R$ " . number_format($totalPending, 2, ',', '.') . " | "
            . "Vencido: R$ " . number_format($totalOverdue, 2, ',', '.') . " | "
            . "Inadimplência: {$inadimplencia}% | "
            . "Top devedores: {$topOverdue}";
    }
}