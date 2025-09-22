<?php

namespace Iquesters\UserInterface\Helpers;

class SchemaValidator
{
    /**
     * Build Laravel validation rules from your dynamic form schema
     */
    public static function buildRules(array $schema): array
    {
        $rules = [];

        if (empty($schema['fields']) || !is_array($schema['fields'])) {
            return $rules;
        }

        foreach ($schema['fields'] as $field) {
            $fieldRules = [];

            // ✅ Required
            if (!empty($field['required'])) {
                $fieldRules[] = 'required';
            } else {
                $fieldRules[] = 'nullable';
            }

            // ✅ Type-based rules
            switch ($field['type'] ?? '') {
                case 'email':
                    $fieldRules[] = 'email';
                    break;

                case 'number':
                    $fieldRules[] = 'numeric';
                    if (isset($field['min'])) $fieldRules[] = 'min:' . $field['min'];
                    if (isset($field['max'])) $fieldRules[] = 'max:' . $field['max'];
                    break;

                case 'file':
                    $fieldRules[] = 'file';
                    if (!empty($field['accept'])) {
                        $mimes = collect(explode(',', $field['accept']))
                            ->map(fn($ext) => trim($ext, '.'))
                            ->implode(',');
                        $fieldRules[] = 'mimes:' . $mimes;
                    }
                    if (!empty($field['maxSize'])) {
                        $fieldRules[] = 'max:' . intval($field['maxSize'] / 1024); // KB
                    }
                    break;

                case 'datetime-local':
                case 'date':
                case 'time':
                    $fieldRules[] = 'date';
                    break;

                case 'checkbox':
                    // array of values if multiple checkboxes
                    if (!empty($field['options']) && count($field['options']) > 1) {
                        $fieldRules[] = 'array';
                    }
                    break;
            }

            // ✅ Length rules
            if (isset($field['minLength'])) {
                $fieldRules[] = 'min:' . $field['minLength'];
            }
            if (isset($field['maxLength'])) {
                $fieldRules[] = 'max:' . $field['maxLength'];
            }

            // ✅ Regex pattern
            if (!empty($field['pattern'])) {
                $fieldRules[] = 'regex:/' . $field['pattern'] . '/';
            }

            // Assign to field ID
            $rules[$field['id']] = $fieldRules;
        }

        return $rules;
    }

    /**
     * Build custom messages from your form schema
     */
    public static function buildMessages(array $schema): array
    {
        $messages = [];

        if (empty($schema['fields']) || !is_array($schema['fields'])) {
            return $messages;
        }

        foreach ($schema['fields'] as $field) {
            if (!empty($field['messages']) && is_array($field['messages'])) {
                foreach ($field['messages'] as $rule => $message) {
                    $ruleKey = self::mapRuleKey($rule);
                    $messages[$field['id'] . '.' . $ruleKey] = $message;
                }
            }
        }

        return $messages;
    }

    /**
     * Map schema rule keys to Laravel validation keys
     */
    private static function mapRuleKey(string $key): string
    {
        return match ($key) {
            'minLength' => 'min',
            'maxLength' => 'max',
            'invalidType' => 'mimes',
            'maxSize' => 'max',
            'required' => 'required',
            default => $key,
        };
    }
}
