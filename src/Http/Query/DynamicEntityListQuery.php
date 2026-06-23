<?php

namespace Iquesters\UserInterface\Http\Query;

use Illuminate\Database\Query\Builder;
use Illuminate\Support\Collection;
use Iquesters\Foundation\System\Traits\Loggable;
use Throwable;

class DynamicEntityListQuery
{
    use Loggable;

    public function __construct(
        private Builder $query,
        private string $entity,
        private array $mainFieldDefinitions,
        private array $metaFieldDefinitions,
        private ?string $metaTable
    ) {}

    public function applyFilters(mixed $filters): static
    {
        try {
            if (! is_array($filters)) {
                return $this;
            }

            foreach ($filters as $key => $value) {
                if (! is_string($key) || $value === null || $value === '') {
                    continue;
                }

                if (array_key_exists($key, $this->mainFieldDefinitions)) {
                    $this->applyMainColumnFilter($key, $value);
                } elseif ($this->metaTable && array_key_exists($key, $this->metaFieldDefinitions)) {
                    $this->applyMetaFilter($key, $value);
                } else {
                    $this->logDebug(sprintf(
                        'DynamicEntityListQuery@applyFilters skipped unknown key | entity=%s | key=%s',
                        $this->entity,
                        $key
                    ));
                }
            }

            return $this;
        } catch (Throwable $e) {
            $this->logError(sprintf(
                'DynamicEntityListQuery@applyFilters failed | entity=%s | error=%s',
                $this->entity,
                $e->getMessage()
            ));

            throw $e;
        }
    }

    public function applySort(?string $column, string $direction = 'asc'): static
    {
        try {
            if (! $column) {
                return $this;
            }

            $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';

            if (array_key_exists($column, $this->mainFieldDefinitions)) {
                $this->query->orderBy($column, $direction);
                return $this;
            }

            if ($this->metaTable && array_key_exists($column, $this->metaFieldDefinitions)) {
                $type = $this->metaFieldDefinitions[$column]['type'] ?? 'string';

                if ($this->isStringSortableType($type)) {
                    $this->applyMetaSort($column, $direction);
                } else {
                    $this->logWarning(sprintf(
                        'DynamicEntityListQuery@applySort skipped non-string meta sort | entity=%s | column=%s | type=%s',
                        $this->entity,
                        $column,
                        $type
                    ));
                }

                return $this;
            }

            $this->logDebug(sprintf(
                'DynamicEntityListQuery@applySort skipped unknown sort column | entity=%s | column=%s',
                $this->entity,
                $column
            ));

            return $this;
        } catch (Throwable $e) {
            $this->logError(sprintf(
                'DynamicEntityListQuery@applySort failed | entity=%s | column=%s | error=%s',
                $this->entity,
                $column ?? 'null',
                $e->getMessage()
            ));

            throw $e;
        }
    }

    public function count(): int
    {
        try {
            return $this->query->count();
        } catch (Throwable $e) {
            $this->logError(sprintf(
                'DynamicEntityListQuery@count failed | entity=%s | error=%s',
                $this->entity,
                $e->getMessage()
            ));

            throw $e;
        }
    }

    public function paginate(int $offset, int $length): Collection
    {
        try {
            return $this->query->offset($offset)->limit($length)->get();
        } catch (Throwable $e) {
            $this->logError(sprintf(
                'DynamicEntityListQuery@paginate failed | entity=%s | offset=%d | length=%d | error=%s',
                $this->entity,
                $offset,
                $length,
                $e->getMessage()
            ));

            throw $e;
        }
    }

    private function applyMainColumnFilter(string $key, mixed $value): void
    {
        $type = $this->mainFieldDefinitions[$key]['type'] ?? 'string';
        $this->query->where($key, $this->castFilterValue($value, $type));
    }

    private function applyMetaFilter(string $key, mixed $value): void
    {
        $metaTable = $this->metaTable;

        $this->query->whereIn('id', function (Builder $sub) use ($metaTable, $key, $value) {
            $sub->select('ref_parent')
                ->from($metaTable)
                ->where('meta_key', $key)
                ->where('meta_value', (string) $value);
        });
    }

    private function applyMetaSort(string $key, string $direction): void
    {
        $direction = strtoupper($direction);

        $this->query->orderByRaw(
            "(SELECT `meta_value` FROM `{$this->metaTable}` WHERE `ref_parent` = `{$this->entity}`.`id` AND `meta_key` = ? LIMIT 1) {$direction}",
            [$key]
        );
    }

    private function isStringSortableType(string $type): bool
    {
        return in_array(strtolower($type), ['string', 'varchar', 'text', 'char'], true);
    }

    private function castFilterValue(mixed $value, string $fieldType): mixed
    {
        return match (strtolower($fieldType)) {
            'integer', 'bigint', 'mediumint', 'smallint', 'tinyint' => is_numeric($value) ? (int) $value : $value,
            'decimal', 'float', 'double', 'real' => is_numeric($value) ? (float) $value : $value,
            'boolean', 'bool' => filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $value,
            default => $value,
        };
    }
}
