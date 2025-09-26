<?php

namespace Iquesters\UserInterface\Support;

use Illuminate\Support\Facades\Log;
use Iquesters\UserInterface\Constants\FormValidationStatus;

class DynamicFormSchema
{
    /**
     * Generate Laravel validation rules from schema
     */
    public static function toRules(array $schema): array
    {
        $rules = [];

        foreach ($schema['fields'] as $field) {
            $fieldRules = [];

            // Required or nullable
            $fieldRules[] = !empty($field['required']) ? FormValidationStatus::REQUIRED : 'nullable';

            // Data type rules
            if (!empty($field['type'])) {
                switch ($field['type']) {
                    case FormValidationStatus::EMAIL:
                        $fieldRules[] = 'email';
                        break;
                    case FormValidationStatus::NUMBER:
                        $fieldRules[] = 'numeric';
                        break;
                    case FormValidationStatus::DATE:
                    case FormValidationStatus::DATE_TIME_LOCAL:
                        $fieldRules[] = 'date';
                        break;
                    case FormValidationStatus::FILE:
                        if (!empty($field['accept'])) {
                            // Convert .jpg,.png to jpg,png
                            $mimes = implode(',', array_map(fn($ext) => ltrim($ext, '.'), explode(',', $field['accept'])));
                            $fieldRules[] = 'mimes:' . $mimes;
                        }
                        if (!empty($field['maxSize'])) {
                            $fieldRules[] = 'max:' . ($field['maxSize'] / 1024); // max in KB
                        }
                        break;
                }
            }

            // min/max length for text, password, textarea
            if (!empty($field['minLength'])) {
                $fieldRules[] = 'min:' . $field['minLength'];
            }
            if (!empty($field['maxLength'])) {
                $fieldRules[] = 'max:' . $field['maxLength'];
            }

            // min/max for number
            if (!empty($field['min'])) {
                $fieldRules[] = 'min:' . $field['min'];
            }
            if (!empty($field['max'])) {
                $fieldRules[] = 'max:' . $field['max'];
            }

            // Regex pattern
            // if (!empty($field['pattern'])) {
            //     $pattern = $field['pattern'];

            //     // Escape dashes in character classes
            //     $pattern = preg_replace_callback('/\[(.*?)\]/', function ($matches) {
            //         return '[' . str_replace('-', '\-', $matches[1]) . ']';
            //     }, $pattern);

            //     $fieldRules[] = 'regex:/' . $pattern . '/';
            // }

           if (!empty($field['pattern'])) {
                $pattern = $field['pattern'];
                // wrap with # delimiter
                $wrapped = '#' . $pattern . '#';
                if (@preg_match($wrapped, '') === false) {
                    // invalid regex, skip or 
                    Log::info("Invalid regex pattern for field {$field['id']}: {$pattern}");
                } else {
                    $fieldRules[] = 'regex:' . $wrapped;
                }
            }

            $rules[$field['id']] = $fieldRules;
        }

        Log::info('Generated Validation Rules: ' . json_encode($rules));
        return $rules;
    }

    /**
     * Generate Laravel validation messages from schema
     */
    public static function toMessages(array $schema): array
    {
        $messages = [];

        // foreach ($schema['fields'] as $field) {
        //     $fieldId = $field['id'];
        //     $fieldMessages = $field['messages'] ?? [];

        //     // Map custom messages only if present
        //     if (!empty($fieldMessages['required'])) {
        //         $messages["{$fieldId}.required"] = $fieldMessages['required'];
        //     }
        //     if (!empty($fieldMessages['minLength'])) {
        //         $messages["{$fieldId}.min"] = $fieldMessages['minLength'];
        //     }
        //     if (!empty($fieldMessages['maxLength'])) {
        //         $messages["{$fieldId}.max"] = $fieldMessages['maxLength'];
        //     }
        //     if (!empty($fieldMessages['pattern'])) {
        //         $messages["{$fieldId}.regex"] = $fieldMessages['pattern'];
        //     }
        //     if (!empty($fieldMessages['min'])) {
        //         $messages["{$fieldId}.min"] = $fieldMessages['min'];
        //     }
        //     if (!empty($fieldMessages['max'])) {
        //         $messages["{$fieldId}.max"] = $fieldMessages['max'];
        //     }
        //     if (!empty($fieldMessages['invalidType'])) {
        //         $messages["{$fieldId}.mimes"] = $fieldMessages['invalidType'];
        //     }
        // }

        // Map schema keys → Laravel validation rules
        $ruleMessageMap = [
            FormValidationStatus::REQUIRED   => 'required',
            FormValidationStatus::MIN_LENGTH => 'min',
            FormValidationStatus::MAX_LENGTH => 'max',
            FormValidationStatus::PATTERN    => 'regex',
            FormValidationStatus::MIN        => 'min',
            FormValidationStatus::MAX        => 'max',
            FormValidationStatus::INVALIDTYPE => 'mimes', // can move to constants if you want
        ];

        foreach ($schema['fields'] as $field) {
            $fieldId       = $field['id'];
            $fieldMessages = $field['messages'] ?? [];

            foreach ($ruleMessageMap as $schemaKey => $laravelRule) {
                if (!empty($fieldMessages[$schemaKey])) {
                    $messages["{$fieldId}.{$laravelRule}"] = $fieldMessages[$schemaKey];
                }
            }
        }

        Log::info('Generated Validation Messages: ' . json_encode($messages));
        return $messages;
    }
}
