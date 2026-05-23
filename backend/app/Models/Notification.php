<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data'    => 'array',
        'read_at' => 'datetime',
    ];

    // ─── Helpers estáticos para criar notificações de qualquer lugar do sistema ───

    public static function cobrancaVencida(int $userId, string $cliente, string $valor, int $cobrancaId): self
    {
        return self::create([
            'user_id'     => $userId,
            'type'        => 'cobranca',
            'title'       => 'Cobrança vencida',
            'description' => "{$cliente} — R$ {$valor}",
            'data'        => ['cobranca_id' => $cobrancaId],
        ]);
    }

    public static function pagamentoConfirmado(int $userId, string $cliente, string $valor, string $metodo): self
    {
        return self::create([
            'user_id'     => $userId,
            'type'        => 'pagamento',
            'title'       => 'Pagamento confirmado',
            'description' => "{$cliente} — R$ {$valor} via {$metodo}",
        ]);
    }

    public static function lembrete(int $userId, string $mensagem): self
    {
        return self::create([
            'user_id'     => $userId,
            'type'        => 'lembrete',
            'title'       => 'Lembrete',
            'description' => $mensagem,
        ]);
    }

    public static function sistema(int $userId, string $titulo, string $descricao): self
    {
        return self::create([
            'user_id'     => $userId,
            'type'        => 'sistema',
            'title'       => $titulo,
            'description' => $descricao,
        ]);
    }
}