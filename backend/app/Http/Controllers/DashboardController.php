<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function metrics(Request $request)
    {
        $user = $request->user();
        $charges = $user->charges();
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        $totalPending = (clone $charges)->where('status', 'pending')->sum('amount');
        $totalOverdue = (clone $charges)->where('status', 'overdue')->sum('amount');
        $totalPaidMonth = (clone $charges)
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$startOfMonth, $endOfMonth])
            ->sum('amount');
        $totalCharges = (clone $charges)->count();
        $overdueCount = (clone $charges)->where('status', 'overdue')->count();
        $inadimplencia = $totalCharges > 0 ? round(($overdueCount / $totalCharges) * 100, 1) : 0;

        $recentCharges = (clone $charges)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id', 'customer_name', 'amount', 'due_date', 'status']);

        $totalClients = $user->clients()->count();

        return response()->json([
            'total_pending'      => $totalPending,
            'total_overdue'      => $totalOverdue,
            'total_paid_month'   => $totalPaidMonth,
            'inadimplencia'      => $inadimplencia,
            'total_charges'      => $totalCharges,
            'overdue_count'      => $overdueCount,
            'total_clients'      => $totalClients,
            'recent_charges'     => $recentCharges,
        ]);
    }

    public function chartData(Request $request)
{
    $user = $request->user();
    $days = [];

    for ($i = 29; $i >= 0; $i--) {
        $date = Carbon::now()->subDays($i);
        $received = $user->charges()
            ->where('status', 'paid')
            ->whereDate('paid_at', $date)
            ->sum('amount');

        $days[] = [
            'label' => $date->format('d/m'),
            'value' => (float) $received,
        ];
    }

    return response()->json($days);
}
}