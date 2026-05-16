<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('charges', function (Blueprint $table) {
            $table->string('description')->nullable()->after('amount');
            $table->string('payment_method')->default('pix')->after('status'); // pix, boleto, cartao
            $table->timestamp('paid_at')->nullable()->after('payment_method');
            $table->decimal('fine_amount', 10, 2)->default(0)->after('paid_at');      // multa
            $table->decimal('interest_amount', 10, 2)->default(0)->after('fine_amount'); // juros
            $table->decimal('discount_amount', 10, 2)->default(0)->after('interest_amount'); // desconto
            $table->string('pix_key')->nullable()->after('discount_amount');
            $table->string('boleto_code')->nullable()->after('pix_key');
            $table->text('notes')->nullable()->after('boleto_code');
        });
    }

    public function down(): void
    {
        Schema::table('charges', function (Blueprint $table) {
            $table->dropColumn([
                'description', 'payment_method', 'paid_at',
                'fine_amount', 'interest_amount', 'discount_amount',
                'pix_key', 'boleto_code', 'notes'
            ]);
        });
    }
};