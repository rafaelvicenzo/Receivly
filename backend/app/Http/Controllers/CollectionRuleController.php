<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CollectionRule;

class CollectionRuleController extends Controller
{
    public function index(Request $request)
    {
        $rules = $request->user()->collectionRules()->orderBy('created_at')->get();
        return response()->json($rules);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'enabled' => 'boolean',
            'steps'   => 'required|array',
        ]);

        $rule = CollectionRule::create([
            'user_id'    => $request->user()->id,
            'name'       => $request->name,
            'enabled'    => $request->enabled ?? true,
            'is_default' => false,
            'steps'      => $request->steps,
        ]);

        return response()->json($rule, 201);
    }

    public function update(Request $request, $id)
    {
        $rule = $request->user()->collectionRules()->findOrFail($id);

        $request->validate([
            'name'    => 'sometimes|string|max:255',
            'enabled' => 'boolean',
            'steps'   => 'sometimes|array',
        ]);

        $rule->update($request->all());

        return response()->json($rule);
    }

    public function destroy(Request $request, $id)
    {
        $rule = $request->user()->collectionRules()->findOrFail($id);
        $rule->delete();

        return response()->json(['message' => 'Régua excluída com sucesso.']);
    }

    public function getDefault(Request $request)
    {
        $rule = $request->user()->collectionRules()->where('is_default', true)->first();

        if (!$rule) {
            $rule = $this->createDefaultRule($request->user()->id);
        }

        return response()->json($rule);
    }

    public function setDefault(Request $request, $id)
    {
        $request->user()->collectionRules()->update(['is_default' => false]);
        $rule = $request->user()->collectionRules()->findOrFail($id);
        $rule->update(['is_default' => true]);

        return response()->json($rule);
    }

    private function createDefaultRule(int $userId): CollectionRule
    {
        return CollectionRule::create([
            'user_id'    => $userId,
            'name'       => 'Régua Padrão',
            'enabled'    => true,
            'is_default' => true,
            'steps'      => [
                [
                    'id'       => 1,
                    'days'     => -5,
                    'timing'   => 'before',
                    'channel'  => 'whatsapp',
                    'enabled'  => true,
                    'message'  => 'Olá {nome}! 👋 Sua fatura de *R$ {valor}* vence em *5 dias* ({vencimento}). Pague agora e evite juros! 💳'
                ],
                [
                    'id'       => 2,
                    'days'     => 0,
                    'timing'   => 'due',
                    'channel'  => 'whatsapp',
                    'enabled'  => true,
                    'message'  => 'Olá {nome}! ⚠️ Sua fatura de *R$ {valor}* vence *hoje*! Não deixe passar. Pague agora: {link}'
                ],
                [
                    'id'       => 3,
                    'days'     => 1,
                    'timing'   => 'after',
                    'channel'  => 'whatsapp',
                    'enabled'  => true,
                    'message'  => 'Olá {nome}, sua fatura de *R$ {valor}* venceu ontem. Regularize agora para evitar juros e multa. 📋'
                ],
                [
                    'id'       => 4,
                    'days'     => 3,
                    'timing'   => 'after',
                    'channel'  => 'whatsapp',
                    'enabled'  => true,
                    'message'  => 'Olá {nome}, identificamos um atraso de *3 dias* na sua fatura de *R$ {valor}*. Entre em contato para regularizar. 🙏'
                ],
                [
                    'id'       => 5,
                    'days'     => 7,
                    'timing'   => 'after',
                    'channel'  => 'whatsapp',
                    'enabled'  => false,
                    'message'  => '{nome}, sua fatura está em atraso há *7 dias*. Valor: *R$ {valor}*. Precisamos regularizar essa situação urgentemente.'
                ],
            ]
        ]);
    }
}