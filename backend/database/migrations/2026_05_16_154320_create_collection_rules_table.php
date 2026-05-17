<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collection_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name')->default('Régua Padrão');
            $table->boolean('enabled')->default(true);
            $table->boolean('is_default')->default(false);
            $table->json('steps');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collection_rules');
    }
};