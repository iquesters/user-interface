<?php

namespace Iquesters\UserInterface\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Iquesters\Foundation\Models\BusinessEntity;
use Iquesters\Foundation\System\Http\ApiResponse;
use Iquesters\Foundation\System\Traits\Loggable;
use Throwable;

class DynamicBusinessEntityController extends Controller
{
    use Loggable;

    /**
     * Namespaces searched in order when resolving a table name to an Eloquent model.
     * Add any package namespaces that register models your business entities may reference.
     */
    protected array $modelNamespaces = [
        'App\\Models\\',
        'Iquesters\\UserManagement\\Models\\',
        'Iquesters\\Organisation\\Models\\',
        'Iquesters\\Foundation\\Models\\',
        'Spatie\\Permission\\Models\\',
    ];

    // =========================================================================
    // Public endpoint
    // =========================================================================

    /**
     * GET /api/business-entity/list/{business_entity_name}
     *
     * Fetches all records for the primary entity of a business entity definition,
     * with meta fields and related entities attached according to field_mapping.
     */
    public function list(Request $request, string $business_entity_name)
    {
        try {
            $businessEntity  = $this->resolveBusinessEntity($business_entity_name);
            $mapping         = $this->parseFieldMapping($businessEntity);
            $adjacency       = $this->buildAdjacencyList($mapping['relationships']);
            [$offset, $length, $page] = $this->parsePagination($request);

            [$totalCount, $records] = $this->fetchPrimaryRecords(
                $mapping['primary_entity'],
                $mapping['entity_config_map'],
                $adjacency,
                $offset,
                $length
            );

            if ($records->isNotEmpty()) {
                $records = $this->attachMetaToRecords(
                    $mapping['primary_entity'],
                    $records,
                    $mapping['entity_config_map'][$mapping['primary_entity']]['meta_fields'] ?? []
                );

                $records = $this->attachRelationships(
                    $mapping['primary_entity'],
                    $records,
                    $mapping['entity_config_map'],
                    $adjacency,
                    [$mapping['primary_entity']]
                );
            }

            $this->logInfo(sprintf(
                'DynamicBusinessEntityController@list | business_entity=%s | primary=%s | total=%d | offset=%d | length=%d',
                $business_entity_name,
                $mapping['primary_entity'],
                $totalCount,
                $offset,
                $length
            ));

            return ApiResponse::success(
                $records,
                'Request successful',
                200,
                [
                    'pagination' => [
                        'total' => $totalCount,
                        'per_page' => $length,
                        'current_page' => $page,
                        'last_page' => (int) ceil($totalCount / $length),
                        'has_more' => ($page * $length) < $totalCount,
                    ]
                ]
            );
        } catch (Throwable $e) {
            $this->logError(sprintf(
                'DynamicBusinessEntityController@list error | business_entity=%s | message=%s | file=%s | line=%d',
                $business_entity_name,
                $e->getMessage(),
                $e->getFile(),
                $e->getLine()
            ));

            return ApiResponse::error('Something went wrong while processing business entity data.', 500);
        }
    }

    public function show(
        Request $request,
        string $business_entity_name,
        string $data_uid
    ) {
        try {

            $businessEntity = $this->resolveBusinessEntity(
                $business_entity_name
            );

            $mapping = $this->parseFieldMapping(
                $businessEntity
            );

            $adjacency = $this->buildAdjacencyList(
                $mapping['relationships']
            );

            $record = $this->fetchPrimaryRecord(
                $mapping['primary_entity'],
                $mapping['entity_config_map'],
                $adjacency,
                $data_uid
            );

            if (! $record) {
                return ApiResponse::error(
                    'Record not found',
                    404
                );
            }

            $records = collect([$record]);

            $records = $this->attachMetaToRecords(
                $mapping['primary_entity'],
                $records,
                $mapping['entity_config_map'][$mapping['primary_entity']]['meta_fields'] ?? []
            );

            $records = $this->attachRelationships(
                $mapping['primary_entity'],
                $records,
                $mapping['entity_config_map'],
                $adjacency,
                [$mapping['primary_entity']]
            );

            return ApiResponse::success(
                $records->first(),
                'Request successful'
            );
        } catch (Throwable $e) {

            $this->logError(sprintf(
                'DynamicBusinessEntityController@show error | business_entity=%s | data_uid=%s | message=%s',
                $business_entity_name,
                $data_uid,
                $e->getMessage()
            ));

            return ApiResponse::error(
                'Something went wrong while processing business entity data.',
                500
            );
        }
    }

    // =========================================================================
    // Step 1 — Resolve the BusinessEntity record
    // =========================================================================

    protected function resolveBusinessEntity(string $businessEntityName): BusinessEntity
    {
        $record = BusinessEntity::where('slug', $businessEntityName)
            ->orWhere('uid', $businessEntityName)
            ->orWhere('business_entity_name', $businessEntityName)
            ->first();

        if (! $record) {
            throw new \RuntimeException("Business entity '{$businessEntityName}' not found.");
        }

        return $record;
    }

    // =========================================================================
    // Step 2 — Parse and validate field_mapping
    // =========================================================================

    protected function parseFieldMapping(BusinessEntity $businessEntity): array
    {
        $mapping = $businessEntity->field_mapping;

        if (empty($mapping) || empty($mapping['entities'])) {
            throw new \InvalidArgumentException('Business entity has no field mapping configured.');
        }

        $primaryEntity = $mapping['primary_entity'] ?? null;

        if (! $primaryEntity) {
            throw new \InvalidArgumentException('Business entity has no primary entity defined.');
        }

        $entityConfigMap = collect($mapping['entities'])
            ->sortBy('sort_order')
            ->keyBy('entity')
            ->toArray();

        $relationships = $mapping['relationships'] ?? [];

        $this->validateMappingTables(
            $entityConfigMap,
            $relationships
        );

        return [
            'primary_entity' => $primaryEntity,
            'entity_config_map' => $entityConfigMap,
            'relationships' => $relationships,
        ];
    }

    protected function validateMappingTables(array $entityConfigMap, array $relationships): void
    {
        foreach ($entityConfigMap as $tableName => $_) {
            if (! Schema::hasTable($tableName)) {
                throw new \RuntimeException("Table '{$tableName}' referenced in field mapping does not exist.");
            }
        }

        foreach ($relationships as $rel) {
            if (! empty($rel['through']) && ! Schema::hasTable($rel['through'])) {
                throw new \RuntimeException("Pivot table '{$rel['through']}' referenced in relationship does not exist.");
            }
        }
    }

    // =========================================================================
    // Step 3 — Build adjacency list from global relationships
    // =========================================================================

    /**
     * Returns: [ source_entity => [ relationship, … ], … ]
     */
    protected function buildAdjacencyList(array $relationships): array
    {
        $adjacency = [];

        foreach ($relationships as $rel) {
            $adjacency[$rel['source_entity']][] = $rel;
        }

        return $adjacency;
    }

    // =========================================================================
    // Step 4 — Fetch primary entity records via Eloquent
    // =========================================================================

    protected function fetchPrimaryRecords(
        string $primaryEntity,
        array $entityConfigMap,
        array $adjacency,
        int $offset,
        int $length
    ): array {
        $config      = $entityConfigMap[$primaryEntity];
        $sourceKeys  = $this->outgoingSourceKeys($primaryEntity, $adjacency);
        $selectCols  = $this->resolveSelectColumns($primaryEntity, $config['fields'] ?? [], $sourceKeys);

        $model      = $this->resolveModelInstance($primaryEntity);
        $totalCount = $model->newQuery()->count();
        $records    = $model->newQuery()
            ->select($selectCols)
            ->offset($offset)
            ->limit($length)
            ->get();

        return [$totalCount, $records];
    }

    protected function fetchPrimaryRecord(
        string $primaryEntity,
        array $entityConfigMap,
        array $adjacency,
        string $dataUid
    ): ?object {
        $config = $entityConfigMap[$primaryEntity];

        $sourceKeys = $this->outgoingSourceKeys(
            $primaryEntity,
            $adjacency
        );

        $selectCols = $this->resolveSelectColumns(
            $primaryEntity,
            $config['fields'] ?? [],
            $sourceKeys
        );

        $model = $this->resolveModelInstance(
            $primaryEntity
        );

        $referenceColumn = $this->resolveReferenceColumn(
            $primaryEntity,
            $dataUid
        );

        return $model->newQuery()
            ->select($selectCols)
            ->where($referenceColumn, $dataUid)
            ->first();
    }

    protected function resolveReferenceColumn(
        string $entity,
        string $dataUid
    ): string {
        $hasUid = Schema::hasColumn($entity, 'uid');
        $hasId = Schema::hasColumn($entity, 'id');

        if ($hasUid && is_numeric($dataUid)) {
            throw new \InvalidArgumentException(
                "This table uses 'uid' as the primary reference. Please pass a valid UID instead of an ID."
            );
        }

        if ($hasUid) {
            return 'uid';
        }

        if ($hasId) {
            return 'id';
        }

        throw new \InvalidArgumentException(
            "Table {$entity} has no 'uid' or 'id' column."
        );
    }

    // =========================================================================
    // Step 5 — Attach meta fields
    // =========================================================================

    protected function attachMetaToRecords(
        string $entity,
        Collection $records,
        array $metaFieldDefinitions
    ): Collection {
        if (empty($metaFieldDefinitions)) {
            return $records->map(function ($record) {
                $record->meta = (object) [];
                return $record;
            });
        }

        $metaTable = $this->resolveMetaTable($entity);

        if (! $metaTable) {
            return $records->map(function ($record) {
                $record->meta = (object) [];
                return $record;
            });
        }

        $parentIds     = $records->pluck('id')->filter()->values();
        $requestedKeys = array_column($metaFieldDefinitions, 'meta_key');

        $metaRows = DB::table($metaTable)
            ->whereIn('ref_parent', $parentIds)
            ->whereIn('meta_key', $requestedKeys)
            ->get(['ref_parent', 'meta_key', 'meta_value']);

        $grouped = $metaRows->groupBy('ref_parent');

        return $records->map(function ($record) use ($grouped) {
            $flat = [];
            foreach ($grouped[$record->id] ?? collect() as $item) {
                $flat[$item->meta_key] = $item->meta_value;
            }
            $record->meta = (object) $flat;
            return $record;
        });
    }

    // =========================================================================
    // Step 6 — Attach related entities (dispatcher)
    // =========================================================================

    protected function attachRelationships(
        string $currentEntity,
        Collection $records,
        array $entityConfigMap,
        array $adjacency,
        array $visited
    ): Collection {
        if (! isset($adjacency[$currentEntity])) {
            return $records;
        }

        foreach ($adjacency[$currentEntity] as $relationship) {
            $targetEntity = $relationship['target_entity'];

            if (in_array($targetEntity, $visited, true)) {
                continue;
            }

            if (! isset($entityConfigMap[$targetEntity])) {
                $this->logWarning("Relationship references '{$targetEntity}' which is not in field mapping — skipping.");
                continue;
            }

            if (! Schema::hasTable($targetEntity)) {
                $this->logWarning("Relationship references table '{$targetEntity}' which does not exist — skipping.");
                continue;
            }

            // Route to the through/pivot handler when a pivot table is declared,
            // regardless of the type label. Type only controls plurality (singular vs plural).
            $records = ! empty($relationship['through'])
                ? $this->attachThroughRelationship($records, $relationship, $entityConfigMap, $adjacency, $visited)
                : $this->attachDirectRelationship($records, $relationship, $entityConfigMap, $adjacency, $visited);
        }

        return $records;
    }

    // =========================================================================
    // Step 6a — Direct relationship (belongs_to / has_one / has_many)
    // =========================================================================

    protected function attachDirectRelationship(
        Collection $records,
        array $relationship,
        array $entityConfigMap,
        array $adjacency,
        array $visited
    ): Collection {
        $targetEntity = $relationship['target_entity'];
        $relType      = $relationship['type'];
        $sourceKey    = $relationship['source_key'];
        $targetKey    = $relationship['target_key'];
        $relationKey  = $this->resolveRelationKey($targetEntity, $relType);
        $newVisited   = array_merge($visited, [$targetEntity]);

        $targetConfig    = $entityConfigMap[$targetEntity];
        $outgoingKeys    = $this->outgoingSourceKeys($targetEntity, $adjacency, $newVisited);
        $selectCols      = $this->resolveSelectColumns(
            $targetEntity,
            $targetConfig['fields'] ?? [],
            array_merge([$targetKey], $outgoingKeys)
        );

        $sourceValues = $this->pluckSourceValues($records, $sourceKey);

        if ($sourceValues->isEmpty()) {
            return $this->attachEmpty($records, $relationKey, $relType);
        }

        $relatedRecords = $this->resolveModelInstance($targetEntity)
            ->newQuery()
            ->select($selectCols)
            ->whereIn($targetKey, $sourceValues)
            ->get();

        $relatedRecords = $this->attachMetaToRecords($targetEntity, $relatedRecords, $targetConfig['meta_fields'] ?? []);
        $relatedRecords = $this->attachRelationships($targetEntity, $relatedRecords, $entityConfigMap, $adjacency, $newVisited);

        $grouped  = $relatedRecords->groupBy(fn($r) => $r->{$targetKey} ?? null);
        $isPlural = $this->isPlural($relType);

        return $records->map(function ($record) use ($grouped, $sourceKey, $relationKey, $isPlural) {
            $matches                = $grouped[$record->{$sourceKey} ?? null] ?? collect();
            $record->{$relationKey} = $isPlural ? $matches->values() : $matches->first();
            return $record;
        });
    }

    // =========================================================================
    // Step 6b — Through/pivot relationship (has_many_through / has_one_through)
    //
    // Relationship shape:
    // {
    //   "type":               "has_many_through",
    //   "source_entity":      "users",
    //   "target_entity":      "roles",
    //   "through":            "model_has_roles",
    //   "source_key":         "id",
    //   "through_source_key": "model_id",
    //   "through_target_key": "role_id",
    //   "target_key":         "id",
    //   "through_conditions": [["model_type", "=", "App\\Models\\User"]]
    // }
    // =========================================================================

    protected function attachThroughRelationship(
        Collection $records,
        array $relationship,
        array $entityConfigMap,
        array $adjacency,
        array $visited
    ): Collection {
        $targetEntity      = $relationship['target_entity'];
        $relType           = $relationship['type'];
        $throughTable      = $relationship['through'];
        $sourceKey         = $relationship['source_key'];
        $throughSourceKey  = $relationship['through_source_key'];
        $throughTargetKey  = $relationship['through_target_key'];
        $targetKey         = $relationship['target_key'];
        $throughConditions = $relationship['through_conditions'] ?? [];
        $relationKey       = $this->resolveRelationKey($targetEntity, $relType);
        $newVisited        = array_merge($visited, [$targetEntity]);

        if (! Schema::hasTable($throughTable)) {
            $this->logWarning("Pivot table '{$throughTable}' does not exist — skipping through-relation to '{$targetEntity}'.");
            return $this->attachEmpty($records, $relationKey, $relType);
        }

        $sourceValues = $this->pluckSourceValues($records, $sourceKey);

        if ($sourceValues->isEmpty()) {
            return $this->attachEmpty($records, $relationKey, $relType);
        }

        // Fetch pivot rows
        $pivotRows = $this->fetchPivotRows(
            $throughTable,
            $throughSourceKey,
            $throughTargetKey,
            $sourceValues,
            $throughConditions
        );

        if ($pivotRows->isEmpty()) {
            return $this->attachEmpty($records, $relationKey, $relType);
        }

        // Fetch target entity records
        $targetConfig   = $entityConfigMap[$targetEntity];
        $outgoingKeys   = $this->outgoingSourceKeys($targetEntity, $adjacency, $newVisited);
        $selectCols     = $this->resolveSelectColumns(
            $targetEntity,
            $targetConfig['fields'] ?? [],
            array_merge([$targetKey], $outgoingKeys)
        );

        $targetIds = $pivotRows->pluck($throughTargetKey)->filter()->unique()->values();

        $targetRecords = $this->resolveModelInstance($targetEntity)
            ->newQuery()
            ->select($selectCols)
            ->whereIn($targetKey, $targetIds)
            ->get();

        $targetRecords = $this->attachMetaToRecords($targetEntity, $targetRecords, $targetConfig['meta_fields'] ?? []);
        $targetRecords = $this->attachRelationships($targetEntity, $targetRecords, $entityConfigMap, $adjacency, $newVisited);

        // Map pivot: source_value → [target_ids]
        $pivotMap  = $pivotRows
            ->groupBy($throughSourceKey)
            ->map(fn($rows) => $rows->pluck($throughTargetKey)->unique()->values());

        // Map target records: target_key_value → record
        $targetMap = $targetRecords->keyBy(fn($r) => $r->{$targetKey});
        $isPlural  = $this->isPlural($relType);

        return $records->map(function ($record) use ($pivotMap, $targetMap, $sourceKey, $relationKey, $isPlural) {
            $matchedTargetIds = $pivotMap[$record->{$sourceKey} ?? null] ?? collect();

            $matched = $matchedTargetIds
                ->map(fn($id) => $targetMap[$id] ?? null)
                ->filter()
                ->values();

            $record->{$relationKey} = $isPlural ? $matched : $matched->first();
            return $record;
        });
    }

    // =========================================================================
    // Eloquent model resolution
    // =========================================================================

    /**
     * Dynamically resolves an Eloquent model instance for a given table name.
     *
     * Resolution order:
     *   1. Search $modelNamespaces for a class whose base name matches the
     *      studly-singular form of the table (e.g. "users" → "User").
     *   2. If no registered model is found, return a generic anonymous Eloquent
     *      model bound to the table so queries still use the ORM pipeline.
     */
    protected function resolveModelInstance(string $tableName): Model
    {
        $modelClass = $this->findModelClass($tableName);

        if ($modelClass) {
            return new $modelClass;
        }

        return $this->makeDynamicModel($tableName);
    }

    protected function findModelClass(string $tableName): ?string
    {
        $modelName = Str::studly(Str::singular($tableName));

        foreach ($this->modelNamespaces as $namespace) {
            $class = $namespace . $modelName;
            if (class_exists($class)) {
                return $class;
            }
        }

        return null;
    }

    /**
     * Returns a generic Eloquent model bound to $tableName.
     * Used as a fallback when no registered model class is found.
     */
    protected function makeDynamicModel(string $tableName): Model
    {
        return new class($tableName) extends Model {
            public $timestamps = false;

            public function __construct(string $table = '')
            {
                parent::__construct();
                if ($table) {
                    $this->setTable($table);
                }
            }
        };
    }

    // =========================================================================
    // Pivot helper
    // =========================================================================

    protected function fetchPivotRows(
        string $throughTable,
        string $throughSourceKey,
        string $throughTargetKey,
        Collection $sourceValues,
        array $throughConditions
    ): Collection {
        $query = DB::table($throughTable)
            ->select([$throughSourceKey, $throughTargetKey])
            ->whereIn($throughSourceKey, $sourceValues);

        foreach ($throughConditions as [$col, $op, $val]) {
            $query->where($col, $op, $val);
        }

        return $query->get();
    }

    // =========================================================================
    // Shared helpers
    // =========================================================================

    protected function parsePagination(Request $request): array
    {
        $offset = max((int) $request->get('offset', 0), 0);
        $length = max((int) $request->get('length', 50), 1);
        $page   = (int) floor($offset / $length) + 1;

        return [$offset, $length, $page];
    }

    protected function pluckSourceValues(Collection $records, string $sourceKey): Collection
    {
        return $records
            ->pluck($sourceKey)
            ->filter(fn($v) => ! is_null($v) && $v !== '')
            ->unique()
            ->values();
    }

    protected function attachEmpty(Collection $records, string $relationKey, string $relType): Collection
    {
        $empty = $this->emptyRelationValue($relType);

        return $records->map(function ($record) use ($relationKey, $empty) {
            $record->{$relationKey} = $empty;
            return $record;
        });
    }

    protected function resolveSelectColumns(
        string $entity,
        array $fieldDefinitions,
        array $additionalColumns = []
    ): array {
        $tableColumns  = Schema::getColumnListing($entity);
        $requestedCols = array_column($fieldDefinitions, 'field');
        $selected = [];

        if (in_array('id', $tableColumns, true)) {
            $selected[] = 'id';
        }

        if (in_array('uid', $tableColumns, true)) {
            $selected[] = 'uid';
        }

        foreach (array_merge($requestedCols, $additionalColumns) as $col) {
            if ($col && in_array($col, $tableColumns, true) && ! in_array($col, $selected, true)) {
                $selected[] = $col;
            }
        }

        return $selected;
    }

    protected function outgoingSourceKeys(
        string $entity,
        array $adjacency,
        array $visited = []
    ): array {
        if (! isset($adjacency[$entity])) {
            return [];
        }

        $keys = [];
        foreach ($adjacency[$entity] as $rel) {
            if (! in_array($rel['target_entity'], $visited, true)) {
                $keys[] = $rel['source_key'];
            }
        }

        return array_unique($keys);
    }

    protected function resolveRelationKey(string $targetEntity, string $relType): string
    {
        return $this->isPlural($relType) ? $targetEntity : Str::singular($targetEntity);
    }

    /**
     * Determines whether a relationship yields a collection.
     * Through relationships use the same base types (has_many, belongs_to_many)
     * — the pivot strategy is handled separately via the 'through' key.
     */
    protected function isPlural(string $relType): bool
    {
        return in_array($relType, ['has_many', 'belongs_to_many'], true);
    }

    protected function emptyRelationValue(string $relType): mixed
    {
        return $this->isPlural($relType) ? collect() : null;
    }

    protected function resolveMetaTable(string $entity): ?string
    {
        $candidates = [
            "{$entity}_metas",
            "{$entity}_meta",
            Str::singular($entity) . '_meta',
            Str::singular($entity) . '_metas',
        ];

        return collect($candidates)->first(fn($t) => Schema::hasTable($t));
    }
}
