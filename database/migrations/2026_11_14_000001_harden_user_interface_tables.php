<?php

use Illuminate\Database\Migrations\Migration;
use Iquesters\Foundation\Database\SchemaHardening;

/** Platform review D7: created_by / updated_by as nullable foreign keys to users. */
return new class extends Migration
{
    private array $auditTables = ['form_schemas', 'table_schemas'];

    public function up(): void
    {
        foreach ($this->auditTables as $table) {
            SchemaHardening::auditForeignKeys($table);
        }
    }

    public function down(): void
    {
        foreach ($this->auditTables as $table) {
            SchemaHardening::dropAuditForeignKeys($table);
        }
    }
};
