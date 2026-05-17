<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('charges', function (Blueprint $table) {
            $table->string('asaas_id')->nullable()->after('boleto_code');
            $table->string('asaas_status')->nullable()->after('asaas_id');
            $table->text('pix_qr_code')->nullable()->after('asaas_status');
            $table->string('pix_copy_paste')->nullable()->after('pix_qr_code');
            $table->string('boleto_url')->nullable()->after('pix_copy_paste');
            $table->string('boleto_line')->nullable()->after('boleto_url');
            $table->string('invoice_url')->nullable()->after('boleto_line');
        });
    }

    public function down(): void
    {
        Schema::table('charges', function (Blueprint $table) {
            $table->dropColumn([
                'asaas_id', 'asaas_status', 'pix_qr_code',
                'pix_copy_paste', 'boleto_url', 'boleto_line', 'invoice_url'
            ]);
        });
    }
};