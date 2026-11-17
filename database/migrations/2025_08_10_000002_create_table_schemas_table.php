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
        // Renamed from an unprefixed file; existing installs already have this table.
        if (Schema::hasTable('table_schemas')) {
            return;
        }

        Schema::create('table_schemas', function (Blueprint $table) {
            $table->id();
            $table->ulid('uid')->unique();
            $table->string('slug')->unique();
            $table->string('name')->nullable(false);
            $table->string('description')->nullable(true);
            $table->json('schema')->nullable(false);
            $table->json('extra_info')->nullable(true);
            $table->string('status')->default('unknown');
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
        // Intentionally empty: this file was renamed from an unprefixed migration.
        // On existing installs it ran as a no-op, so rolling it back must not drop
        // live data. Use migrate:fresh to rebuild from scratch.
    }
};
