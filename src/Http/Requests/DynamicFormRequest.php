<?php

namespace Iquesters\UserInterface\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Iquesters\UserInterface\Support\FormSchema;
use Illuminate\Support\Facades\DB;

abstract class DynamicFormRequest extends FormRequest
{
    /**
     * Each form request must provide UID
     */
    abstract protected function uid(): string;

    protected function schema(): array
    {
        $schema = DB::table('form_schemas')
            ->where('uid', $this->uid())
            ->first();

        if (!$schema) {
            return [];
        }

        return json_decode($schema->schema, true);
    }

    public function rules(): array
    {
        $schema = $this->schema();
        return $schema ? FormSchema::toRules($schema) : [];
    }

    public function messages(): array
    {
        $schema = $this->schema();
        return $schema ? FormSchema::toMessages($schema) : [];
    }
}
