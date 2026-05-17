<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Charge;

class ScoreController extends Controller
{
    public function calculate(Request $request, $clientId)
    {
        $client = $request->user()->clients()->findOrFail($clientId);
        $charges = Charge::where('user_id', $request->user()->id)
            ->where('customer_document', $client->document)
            ->get();

        $score = $this->calculateScore($charges);
        $analysis = $this->generateAnalysis($score, $charges);

        return response()->json([
            'client_id'    => $client->id,
            'client_name'  => $client->name,
            'score'        => $score['value'],
            'risk'         => $score['risk'],
            'risk_label'   => $score['risk_label'],
            'factors'      => $score['factors'],
            'analysis'     => $analysis,
            'total_charges'=> $charges->count(),
            'paid'         => $charges->where('status', 'paid')->count(),
            'overdue'      => $charges->where('status', 'overdue')->count(),
            'pending'      => $charges->where('status', 'pending')->count(),
        ]);
    }

    public function calculateForAll(Request $request)
    {
        $clients = $request->user()->clients()->where('status', 'active')->get();
        $scores = [];

        foreach ($clients as $client) {
            $charges = Charge::where('user_id', $request->user()->id)
                ->where('customer_document', $client->document)
                ->get();

            $score = $this->calculateScore($charges);
            $scores[] = [
                'client_id'   => $client->id,
                'client_name' => $client->name,
                'score'       => $score['value'],
                'risk'        => $score['risk'],
                'risk_label'  => $score['risk_label'],
            ];
        }

        usort($scores, fn($a, $b) => $a['score'] <=> $b['score']);

        return response()->json($scores);
    }

    private function calculateScore($charges): array
    {
        if ($charges->count() === 0) {
            return [
                'value'      => 50,
                'risk'       => 'medium',
                'risk_label' => 'Sem histórico',
                'factors'    => ['Sem histórico de cobranças para análise']
            ];
        }

        $score = 100;
        $factors = [];

        $total = $charges->count();
        $paid = $charges->where('status', 'paid')->count();
        $overdue = $charges->where('status', 'overdue')->count();
        $pending = $charges->where('status', 'pending')->count();

        // Taxa de pagamento
        $paymentRate = $total > 0 ? ($paid / $total) * 100 : 0;
        if ($paymentRate >= 90) {
            $factors[] = 'Excelente histórico de pagamentos';
        } elseif ($paymentRate >= 70) {
            $score -= 15;
            $factors[] = 'Bom histórico mas com alguns atrasos';
        } elseif ($paymentRate >= 50) {
            $score -= 30;
            $factors[] = 'Histórico de pagamentos irregular';
        } else {
            $score -= 50;
            $factors[] = 'Histórico de pagamentos ruim';
        }

        // Cobranças vencidas
        if ($overdue > 0) {
            $overdueRate = ($overdue / $total) * 100;
            if ($overdueRate > 50) {
                $score -= 30;
                $factors[] = "Alta taxa de inadimplência ({$overdue} cobranças vencidas)";
            } elseif ($overdueRate > 25) {
                $score -= 20;
                $factors[] = "{$overdue} cobranças vencidas";
            } else {
                $score -= 10;
                $factors[] = "Poucas cobranças vencidas ({$overdue})";
            }
        }

        // Valor total em aberto
        $totalOverdue = $charges->where('status', 'overdue')->sum('amount');
        if ($totalOverdue > 1000) {
            $score -= 15;
            $factors[] = 'Alto valor em aberto: R$ ' . number_format($totalOverdue, 2, ',', '.');
        } elseif ($totalOverdue > 500) {
            $score -= 8;
            $factors[] = 'Valor em aberto: R$ ' . number_format($totalOverdue, 2, ',', '.');
        }

        // Cobranças recentes
        $recentCharges = $charges->where('created_at', '>=', now()->subDays(30));
        $recentOverdue = $recentCharges->where('status', 'overdue')->count();
        if ($recentOverdue > 0) {
            $score -= 10;
            $factors[] = "Inadimplência recente ({$recentOverdue} nos últimos 30 dias)";
        }

        // Garante score entre 0 e 100
        $score = max(0, min(100, $score));

        if ($score >= 80) {
            $risk = 'low';
            $riskLabel = 'Baixo Risco';
        } elseif ($score >= 50) {
            $risk = 'medium';
            $riskLabel = 'Médio Risco';
        } else {
            $risk = 'high';
            $riskLabel = 'Alto Risco';
        }

        return [
            'value'      => $score,
            'risk'       => $risk,
            'risk_label' => $riskLabel,
            'factors'    => $factors
        ];
    }

    private function generateAnalysis($score, $charges): string
    {
        $total = $charges->count();
        $paid = $charges->where('status', 'paid')->count();
        $overdue = $charges->where('status', 'overdue')->count();
        $value = $score['value'];
        $risk = $score['risk'];

        if ($total === 0) {
            return 'Cliente sem histórico de cobranças. Recomenda-se cautela inicial e acompanhamento próximo nos primeiros pagamentos.';
        }

        if ($risk === 'low') {
            return "Cliente com excelente histórico financeiro. Score {$value}/100. De {$total} cobranças, {$paid} foram pagas em dia. Baixo risco de inadimplência. Pode receber condições especiais de pagamento.";
        } elseif ($risk === 'medium') {
            return "Cliente com histórico moderado. Score {$value}/100. De {$total} cobranças, {$paid} foram pagas e {$overdue} estão em atraso. Recomenda-se monitoramento e cobrança preventiva antes do vencimento.";
        } else {
            return "Cliente com alto risco de inadimplência. Score {$value}/100. De {$total} cobranças, {$overdue} estão vencidas. Recomenda-se cobrança antecipada, exigência de garantias ou pagamento à vista.";
        }
    }
}