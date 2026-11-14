<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Platform review D6: form_values was only written by the form-builder test
 * pages and holds no data that needs keeping. Form data is stored by the
 * generic entity API in each entity's own table instead.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('form_values');
    }

    public function down(): void
    {
        if (Schema::hasTable('form_values')) {
            return;
        }

        Schema::create('form_values', function (Blueprint $table) {
            $table->id();
            $table->string('form_uid')->nullable();
            $table->string('field_key');
            $table->text('field_value')->nullable();
            $table->timestamps();
        });
    }
};
