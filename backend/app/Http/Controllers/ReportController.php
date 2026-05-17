<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $charges = $user->charges()->get();

        // Receita por mês (últimos 6 meses)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $label = $month->format('M/y');

            $received = $charges->where('status', 'paid')
                ->filter(fn($c) => Carbon::parse($c->paid_at)->format('Y-m') === $month->format('Y-m'))
                ->sum('amount');

            $expected = $charges
                ->filter(fn($c) => Carbon::parse($c->due_date)->format('Y-m') === $month->format('Y-m'))
                ->sum('amount');

            $monthlyData[] = [
                'label'    => $label,
                'received' => round($received, 2),
                'expected' => round($expected, 2),
            ];
        }

        // Distribuição por status
        $total    = $charges->count();
        $paid     = $charges->where('status', 'paid')->count();
        $pending  = $charges->where('status', 'pending')->count();
        $overdue  = $charges->where('status', 'overdue')->count();
        $cancelled = $charges->where('status', 'cancelled')->count();

        // Distribuição por forma de pagamento
        $byMethod = [
            'pix'    => $charges->where('payment_method', 'pix')->count(),
            'boleto' => $charges->where('payment_method', 'boleto')->count(),
            'cartao' => $charges->where('payment_method', 'cartao')->count(),
        ];

        // Top devedores
        $topDebtors = $charges->where('status', 'overdue')
            ->groupBy('customer_name')
            ->map(fn($group) => [
                'name'   => $group->first()->customer_name,
                'amount' => round($group->sum('amount'), 2),
                'count'  => $group->count(),
            ])
            ->sortByDesc('amount')
            ->take(5)
            ->values();

        // Top pagadores
        $topPayers = $charges->where('status', 'paid')
            ->groupBy('customer_name')
            ->map(fn($group) => [
                'name'   => $group->first()->customer_name,
                'amount' => round($group->sum('amount'), 2),
                'count'  => $group->count(),
            ])
            ->sortByDesc('amount')
            ->take(5)
            ->values();

        // Ticket médio
        $avgTicket = $total > 0 ? round($charges->avg('amount'), 2) : 0;

        // Taxa de inadimplência
        $inadimplencia = $total > 0 ? round(($overdue / $total) * 100, 1) : 0;

        return response()->json([
            'monthly_data'   => $monthlyData,
            'status_dist'    => compact('paid', 'pending', 'overdue', 'cancelled', 'total'),
            'by_method'      => $byMethod,
            'top_debtors'    => $topDebtors,
            'top_payers'     => $topPayers,
            'avg_ticket'     => $avgTicket,
            'inadimplencia'  => $inadimplencia,
            'total_received' => round($charges->where('status', 'paid')->sum('amount'), 2),
            'total_overdue'  => round($charges->where('status', 'overdue')->sum('amount'), 2),
            'total_pending'  => round($charges->where('status', 'pending')->sum('amount'), 2),
        ]);
    }
}