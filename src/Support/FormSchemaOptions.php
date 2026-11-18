<?php

namespace Iquesters\UserInterface\Support;

use Iquesters\Foundation\Models\MasterData;

/**
 * Fills in select/radio/checkbox options that a form schema loads from data
 * instead of listing them, when the schema is served to the browser.
 *
 *   "optionsFrom": {
 *       "master_data": "theme",          // active children of this master data key
 *       "exclude": ["current_theme"],    // optional: child keys to leave out
 *       "empty": "Application default"   // optional: first option with value ""
 *   }
 *
 * Each option is {value: child key, label: child value}. Fields that already
 * list "options" are left alone.
 */
final class FormSchemaOptions
{
    /**
     * @param  mixed  $schema  decoded schema (object from json_decode, or array)
     */
    public static function expand(mixed $schema): mixed
    {
        if (is_object($schema) && isset($schema->fields) && is_array($schema->fields)) {
            foreach ($schema->fields as $field) {
                if (is_object($field) && ! empty($field->optionsFrom) && empty($field->options)) {
                    $field->options = self::resolve((array) $field->optionsFrom);
                }
            }
        } elseif (is_array($schema) && isset($schema['fields']) && is_array($schema['fields'])) {
            foreach ($schema['fields'] as $index => $field) {
                if (is_array($field) && ! empty($field['optionsFrom']) && empty($field['options'])) {
                    $schema['fields'][$index]['options'] = self::resolve((array) $field['optionsFrom']);
                }
            }
        }

        return $schema;
    }

    /** @return list<array{value: string, label: string}> */
    public static function resolve(array $source): array
    {
        $options = [];

        if (isset($source['empty'])) {
            $options[] = ['value' => '', 'label' => (string) $source['empty']];
        }

        if (! empty($source['master_data'])) {
            $parentId = MasterData::where('key', $source['master_data'])->where('status', 'active')->value('id');

            if ($parentId) {
                MasterData::where('parent_id', $parentId)
                    ->where('status', 'active')
                    ->whereNotIn('key', (array) ($source['exclude'] ?? []))
                    ->orderBy('value')
                    ->get(['key', 'value'])
                    ->each(function ($row) use (&$options) {
                        $options[] = ['value' => (string) $row->key, 'label' => (string) ($row->value ?? $row->key)];
                    });
            }
        }

        return $options;
    }
}
