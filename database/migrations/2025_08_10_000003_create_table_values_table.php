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
        if (Schema::hasTable('form_values')) {
            return;
        }

        Schema::create('form_values', function (Blueprint $table) {
            $table->id();
            $table->string('form_uid')->nullable(); // optional unique form identifier
            $table->string('field_key');
            $table->text('field_value')->nullable();
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
