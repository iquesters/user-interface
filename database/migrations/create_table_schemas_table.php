<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('table_schemas', function (Blueprint $table) {
            $table->id();
            $table->ulid('uid')->unique();
            $table->string('slug')->unique();
            $table->string('name')->nullable(false);
            $table->string('description')->nullable(true);
            $table->json('schema')->nullable(false);
            $table->json('extra_info')->nullable(true);
            $table->tinyInteger('status')->default(0);
            $table->bigInteger('created_by')->default(0);
            $table->bigInteger('updated_by')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('table_schemas');
    }
};
