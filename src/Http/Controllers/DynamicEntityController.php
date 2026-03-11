<?php

namespace Iquesters\UserInterface\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Iquesters\Foundation\System\Http\ApiResponse;
use Iquesters\Foundation\System\Traits\Loggable;
use Iquesters\UserInterface\Constants\EntityStatus;
use Throwable;

class DynamicEntityController extends Controller
{
    use Loggable;

    protected array $sensitiveResponseFields = [
        'password',
        'remember_token',
        'token',
        'access_token',
        'refresh_token',
        'secret',
        'api_key',
    ];

    protected array $reservedPayloadKeys = [
        '_token',
        '_method',
        'meta',
    ];

    public function list(string $entity)
    {
        try {
            $this->ensureEntityTableExists($entity);

            $offset = max((int) request()->get('offset', 0), 0);
            $length = max((int) request()->get('length', 50), 1);
            $page = (int) floor($offset / $length) + 1;

            $query = DB::table($entity);
            $totalCount = $query->count();
            $data = $query->offset($offset)->limit($length)->get();
            $data = $this->attachMetaData($entity, $data);

            return ApiResponse::paginated(
                $data,
                $totalCount,
                $length,
                $page,
                'Request successful'
            );
        } catch (Throwable $e) {
            return $this->handleException($e, $entity);
        }
    }

    public function show(string $entity, string $data_uid)
    {
        try {
            $this->ensureEntityTableExists($entity);

            $query = DB::table($entity);
            $referenceColumn = $this->resolveReferenceColumn($entity, $data_uid);
            $record = $query->where($referenceColumn, $data_uid)->first();

            if (! $record) {
                return ApiResponse::error(
                    'Record not found',
                    404,
                    ['entity' => $entity, 'data_uid' => $data_uid]
                );
            }

            $record = $this->attachMetaData($entity, collect([$record]))->first();
            $record = $this->sanitizeRecordForResponse($record);

            return ApiResponse::success($record, 'Request successful');
        } catch (Throwable $e) {
            return $this->handleException($e, $entity, $data_uid);
        }
    }

    public function store(Request $request, string $entity)
    {
        try {
            $this->logStoreRequest($request, $entity);

            $schema = $this->resolveEntitySchema($request, $entity);
            $mainData = $this->prepareMainData($schema['payload'], $schema['column_types'], $schema['table_columns']);
            $metaData = $this->extractMetaData($schema['payload'], $schema['table_columns'], $request->input('meta', []));

            $this->ensureStorePayloadIsNotEmpty($mainData, $metaData);

            $record = $this->createEntityRecord($entity, $mainData, $metaData);

            $this->logInfo(sprintf(
                'Dynamic entity record created | file=%s | entity=%s | record_id=%s | timestamp=%s',
                __FILE__,
                $entity,
                (string) ($record->id ?? 'null'),
                now()->toDateTimeString()
            ));

            $record = $this->attachMetaData($entity, collect([$record]))->first();
            $record = $this->sanitizeRecordForResponse($record);

            return ApiResponse::success($record, 'Record created successfully');
        } catch (Throwable $e) {
            return $this->handleException($e, $entity);
        }
    }

    public function update(Request $request, string $entity, string $data_uid)
    {
        try {
            $this->logUpdateRequest($request, $entity, $data_uid);

            $schema = $this->resolveEntitySchema($request, $entity);
            $mainData = $this->prepareUpdateData($schema['payload'], $schema['column_types'], $schema['table_columns']);
            $metaData = $this->extractMetaData($schema['payload'], $schema['table_columns'], $request->input('meta', []));

            $this->ensureStorePayloadIsNotEmpty($mainData, $metaData);

            $record = $this->updateEntityRecord($entity, $data_uid, $mainData, $metaData);

            $this->logInfo(sprintf(
                'Dynamic entity record updated | file=%s | entity=%s | record_id=%s | reference=%s | timestamp=%s',
                __FILE__,
                $entity,
                (string) ($record->id ?? 'null'),
                $data_uid,
                now()->toDateTimeString()
            ));

            $record = $this->attachMetaData($entity, collect([$record]))->first();
            $record = $this->sanitizeRecordForResponse($record);

            return ApiResponse::success($record, 'Record updated successfully');
        } catch (Throwable $e) {
            return $this->handleException($e, $entity, $data_uid);
        }
    }

    public function delete(string $entity, string $data_uid)
    {
        try {
            $this->logDeleteRequest($entity, $data_uid);

            $record = $this->softDeleteEntityRecord($entity, $data_uid);

            $this->logInfo(sprintf(
                'Dynamic entity record soft deleted | file=%s | entity=%s | record_id=%s | reference=%s | timestamp=%s',
                __FILE__,
                $entity,
                (string) ($record->id ?? 'null'),
                $data_uid,
                now()->toDateTimeString()
            ));

            $record = $this->attachMetaData($entity, collect([$record]))->first();
            $record = $this->sanitizeRecordForResponse($record);

            return ApiResponse::success($record, 'Record deleted successfully');
        } catch (Throwable $e) {
            return $this->handleException($e, $entity, $data_uid);
        }
    }

    protected function logStoreRequest(Request $request, string $entity): void
    {
        $this->logInfo(sprintf(
            'DynamicEntityController@store invoked | file=%s | entity=%s | request_keys=%s | timestamp=%s',
            __FILE__,
            $entity,
            json_encode(array_keys($request->all())),
            now()->toDateTimeString()
        ));
    }

    protected function logUpdateRequest(Request $request, string $entity, string $dataUid): void
    {
        $this->logInfo(sprintf(
            'DynamicEntityController@update invoked | file=%s | entity=%s | data_uid=%s | request_keys=%s | timestamp=%s',
            __FILE__,
            $entity,
            $dataUid,
            json_encode(array_keys($request->all())),
            now()->toDateTimeString()
        ));
    }

    protected function logDeleteRequest(string $entity, string $dataUid): void
    {
        $this->logInfo(sprintf(
            'DynamicEntityController@delete invoked | file=%s | entity=%s | data_uid=%s | timestamp=%s',
            __FILE__,
            $entity,
            $dataUid,
            now()->toDateTimeString()
        ));
    }

    protected function resolveEntitySchema(Request $request, string $entity): array
    {
        $this->ensureEntityTableExists($entity);

        $payload = $request->except($this->reservedPayloadKeys);
        $tableColumns = Schema::getColumnListing($entity);
        $columnTypes = $this->getColumnTypes($entity, $tableColumns);

        // The store endpoint stays generic by deriving writable columns and types at runtime.
        $this->logDebug(sprintf(
            'Dynamic entity store schema resolved | entity=%s | table_columns=%s | column_types=%s | meta_keys=%s',
            $entity,
            json_encode($tableColumns),
            json_encode($columnTypes),
            json_encode(array_keys((array) $request->input('meta', [])))
        ));

        return [
            'payload' => $payload,
            'table_columns' => $tableColumns,
            'column_types' => $columnTypes,
        ];
    }

    protected function prepareMainData(array $payload, array $columnTypes, array $tableColumns): array
    {
        $mainData = $this->extractMainTableData($payload, $columnTypes);

        return $this->applySystemDefaults($mainData, $tableColumns, false);
    }

    protected function prepareUpdateData(array $payload, array $columnTypes, array $tableColumns): array
    {
        $mainData = $this->extractMainTableData($payload, $columnTypes);
        unset($mainData['id'], $mainData['uid']);

        return $this->applySystemDefaults($mainData, $tableColumns, true);
    }

    protected function ensureStorePayloadIsNotEmpty(array $mainData, array $metaData): void
    {
        if (empty($mainData) && empty($metaData)) {
            throw new \InvalidArgumentException('Request payload is empty.');
        }
    }

    protected function createEntityRecord(string $entity, array $mainData, array $metaData): object
    {
        return DB::transaction(function () use ($entity, $mainData, $metaData) {
            $recordId = DB::table($entity)->insertGetId($mainData);

            $this->logInfo(sprintf(
                'Dynamic entity main row inserted | entity=%s | record_id=%s | main_columns=%s',
                $entity,
                (string) $recordId,
                json_encode(array_keys($mainData))
            ));

            // Meta rows are saved in the same transaction so partial writes do not survive failures.
            $this->storeMetaData($entity, $recordId, $metaData);

            return DB::table($entity)->where('id', $recordId)->first();
        });
    }

    protected function updateEntityRecord(string $entity, string $dataUid, array $mainData, array $metaData): object
    {
        return DB::transaction(function () use ($entity, $dataUid, $mainData, $metaData) {
            $referenceColumn = $this->resolveReferenceColumn($entity, $dataUid);
            $existingRecord = DB::table($entity)->where($referenceColumn, $dataUid)->first();

            if (! $existingRecord) {
                throw new \RuntimeException('Record not found');
            }

            $mainData = $this->applyMissingCreateAuditDefaults($mainData, $existingRecord);

            if (! empty($mainData)) {
                DB::table($entity)
                    ->where('id', $existingRecord->id)
                    ->update($mainData);

                $this->logInfo(sprintf(
                    'Dynamic entity main row updated | entity=%s | record_id=%s | reference=%s | main_columns=%s',
                    $entity,
                    (string) $existingRecord->id,
                    $dataUid,
                    json_encode(array_keys($mainData))
                ));
            }

            $this->upsertMetaData($entity, $existingRecord->id, $metaData);

            return DB::table($entity)->where('id', $existingRecord->id)->first();
        });
    }

    protected function softDeleteEntityRecord(string $entity, string $dataUid): object
    {
        $this->ensureEntityTableExists($entity);

        $tableColumns = Schema::getColumnListing($entity);

        if (! in_array('status', $tableColumns, true)) {
            throw new \InvalidArgumentException("Table {$entity} does not support soft delete because it has no status column.");
        }

        return DB::transaction(function () use ($entity, $dataUid, $tableColumns) {
            $referenceColumn = $this->resolveReferenceColumn($entity, $dataUid);
            $existingRecord = DB::table($entity)->where($referenceColumn, $dataUid)->first();

            if (! $existingRecord) {
                throw new \RuntimeException('Record not found');
            }

            DB::table($entity)
                ->where('id', $existingRecord->id)
                ->update($this->buildSoftDeletePayload($tableColumns));

            return DB::table($entity)->where('id', $existingRecord->id)->first();
        });
    }

    protected function buildSoftDeletePayload(array $tableColumns): array
    {
        $userId = auth()->id() ?? 0;
        $timestamp = now();
        $payload = [
            'status' => EntityStatus::DELETED,
        ];

        $columnValueMap = [
            'updated_by' => $userId,
            'updated_at' => $timestamp,
            'deleted_by' => $userId,
            'deleted_at' => $timestamp,
        ];

        foreach ($columnValueMap as $column => $value) {
            if (in_array($column, $tableColumns, true)) {
                $payload[$column] = $value;
            }
        }

        return $payload;
    }

    protected function applyMissingCreateAuditDefaults(array $data, object $existingRecord): array
    {
        if (property_exists($existingRecord, 'created_at') && empty($existingRecord->created_at) && ! array_key_exists('created_at', $data)) {
            $data['created_at'] = now();
        }

        if (property_exists($existingRecord, 'created_by') && empty($existingRecord->created_by) && ! array_key_exists('created_by', $data)) {
            $data['created_by'] = auth()->id() ?? 0;
        }

        return $data;
    }

    protected function ensureEntityTableExists(string $entity): void
    {
        if (! $entity) {
            throw new \InvalidArgumentException('Entity name is required');
        }

        if (! Schema::hasTable($entity)) {
            $this->logWarning("Entity fetch failed: Table '{$entity}' not found");
            throw new \RuntimeException("Table {$entity} does not exist");
        }
    }

    protected function extractMainTableData(array $payload, array $columnTypes): array
    {
        $data = [];

        foreach ($payload as $key => $value) {
            if (! array_key_exists($key, $columnTypes)) {
                continue;
            }

            $data[$key] = $this->normalizeValueForColumn($key, $value, $columnTypes[$key]);
        }

        return $data;
    }

    protected function extractMetaData(array $payload, array $tableColumns, mixed $explicitMeta = []): array
    {
        $metaData = [];

        foreach ($payload as $key => $value) {
            if (in_array($key, $tableColumns, true)) {
                continue;
            }

            $metaData[$key] = $value;
        }

        if (is_array($explicitMeta)) {
            foreach ($explicitMeta as $key => $value) {
                if (is_int($key) && is_array($value) && isset($value['meta_key'])) {
                    $metaData[$value['meta_key']] = $value['meta_value'] ?? null;
                    continue;
                }

                $metaData[$key] = $value;
            }
        }

        return $metaData;
    }

    protected function applySystemDefaults(array $data, array $tableColumns, bool $isUpdate = false): array
    {
        $userId = auth()->id() ?? 0;
        $timestamp = now();

        if (! $isUpdate) {
            if (in_array('uid', $tableColumns, true) && empty($data['uid'])) {
                $data['uid'] = (string) Str::ulid();
            }

            if (in_array('status', $tableColumns, true) && ! array_key_exists('status', $data)) {
                $data['status'] = EntityStatus::ACTIVE;
            }

            if (in_array('created_by', $tableColumns, true) && ! array_key_exists('created_by', $data)) {
                $data['created_by'] = $userId;
            }

            if (in_array('created_at', $tableColumns, true) && ! array_key_exists('created_at', $data)) {
                $data['created_at'] = $timestamp;
            }
        }

        if (in_array('updated_by', $tableColumns, true) && ! array_key_exists('updated_by', $data)) {
            $data['updated_by'] = $userId;
        }

        if (in_array('updated_at', $tableColumns, true) && ! array_key_exists('updated_at', $data)) {
            $data['updated_at'] = $timestamp;
        }

        return $data;
    }

    protected function storeMetaData(string $entity, int $recordId, array $metaData): void
    {
        $metaTable = $this->resolveMetaTable($entity);

        if (! $metaTable || empty($metaData)) {
            return;
        }

        $metaColumns = Schema::getColumnListing($metaTable);
        $userId = auth()->id() ?? 0;

        foreach ($metaData as $key => $value) {
            $row = [
                'ref_parent' => $recordId,
                'meta_key' => $key,
                'meta_value' => $this->normalizeMetaValue($value),
            ];

            if (in_array('status', $metaColumns, true)) {
                $row['status'] = EntityStatus::ACTIVE;
            }

            if (in_array('created_by', $metaColumns, true)) {
                $row['created_by'] = $userId;
            }

            if (in_array('updated_by', $metaColumns, true)) {
                $row['updated_by'] = $userId;
            }

            DB::table($metaTable)->insert($row);

            $this->logDebug(sprintf(
                'Dynamic entity meta row inserted | entity=%s | meta_table=%s | record_id=%s | meta_key=%s',
                $entity,
                $metaTable,
                (string) $recordId,
                (string) $key
            ));
        }
    }

    protected function upsertMetaData(string $entity, int $recordId, array $metaData): void
    {
        $metaTable = $this->resolveMetaTable($entity);

        if (! $metaTable || empty($metaData)) {
            return;
        }

        $metaColumns = Schema::getColumnListing($metaTable);
        $userId = auth()->id() ?? 0;
        $timestamp = now();

        foreach ($metaData as $key => $value) {
            $existingMeta = DB::table($metaTable)
                ->where('ref_parent', $recordId)
                ->where('meta_key', $key)
                ->first();

            $row = $this->buildMetaUpsertRow($metaColumns, $value, $userId, $timestamp, (bool) $existingMeta);

            DB::table($metaTable)->updateOrInsert(
                [
                    'ref_parent' => $recordId,
                    'meta_key' => $key,
                ],
                $row
            );

            $this->logDebug(sprintf(
                'Dynamic entity meta row upserted | entity=%s | meta_table=%s | record_id=%s | meta_key=%s',
                $entity,
                $metaTable,
                (string) $recordId,
                (string) $key
            ));
        }
    }

    protected function buildMetaUpsertRow(
        array $metaColumns,
        mixed $value,
        int $userId,
        mixed $timestamp,
        bool $metaExists
    ): array {
        $row = [
            'meta_value' => $this->normalizeMetaValue($value),
        ];

        $columnValueMap = [
            'status' => EntityStatus::ACTIVE,
            'updated_by' => $userId,
            'updated_at' => $timestamp,
        ];

        foreach ($columnValueMap as $column => $columnValue) {
            if (in_array($column, $metaColumns, true)) {
                $row[$column] = $columnValue;
            }
        }

        if (! $metaExists) {
            foreach ([
                'created_by' => $userId,
                'created_at' => $timestamp,
            ] as $column => $columnValue) {
                if (in_array($column, $metaColumns, true)) {
                    $row[$column] = $columnValue;
                }
            }
        }

        return $row;
    }

    protected function resolveReferenceColumn(string $entity, string $dataUid): string
    {
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

        throw new \InvalidArgumentException("Table {$entity} has no 'uid' or 'id' column to filter by.");
    }

    protected function attachMetaData(string $entity, $data)
    {
        $metaTable = $this->resolveMetaTable($entity);

        if (! $metaTable || $data->isEmpty()) {
            return $data;
        }

        $parentIds = $data
            ->pluck('id')
            ->filter()
            ->values();

        if ($parentIds->isEmpty()) {
            return $data->map(function ($item) {
                $item->meta = [];
                return $item;
            });
        }

        $metaData = DB::table($metaTable)
            ->whereIn('ref_parent', $parentIds)
            ->get();

        $groupedMeta = $metaData->groupBy('ref_parent');

        return $data->map(function ($item) use ($groupedMeta) {
            $item->meta = $groupedMeta[$item->id] ?? [];
            return $item;
        });
    }

    protected function resolveMetaTable(string $entity): ?string
    {
        $possibleMetaTables = [
            "{$entity}_metas",
            "{$entity}_meta",
            Str::singular($entity) . '_meta',
            Str::singular($entity) . '_metas',
        ];

        return collect($possibleMetaTables)
            ->first(fn ($table) => Schema::hasTable($table));
    }

    protected function getColumnTypes(string $entity, array $columns): array
    {
        $types = [];

        foreach ($columns as $column) {
            $types[$column] = Schema::getColumnType($entity, $column);
        }

        return $types;
    }

    protected function normalizeValueForColumn(string $column, mixed $value, string $columnType): mixed
    {
        if ($value === '' && ! in_array($columnType, ['string', 'text', 'mediumtext', 'longtext'], true)) {
            return null;
        }

        if ($value === null) {
            return null;
        }

        if ($column === 'password' && is_string($value) && $value !== '') {
            return Hash::needsRehash($value) ? Hash::make($value) : $value;
        }

        // Column types come from the schema, so normalization stays table-agnostic.
        return match ($columnType) {
            'integer', 'bigint', 'mediumint', 'smallint', 'tinyint' => $this->normalizeIntegerValue($column, $value),
            'float', 'double', 'decimal', 'real' => $this->normalizeFloatValue($column, $value),
            'boolean', 'bool' => $this->normalizeBooleanValue($column, $value),
            'json' => $this->normalizeJsonValue($column, $value),
            'date' => $this->normalizeDateValue($column, $value, 'Y-m-d'),
            'datetime', 'timestamp' => $this->normalizeDateValue($column, $value, 'Y-m-d H:i:s'),
            'time' => $this->normalizeDateValue($column, $value, 'H:i:s'),
            'string', 'text', 'mediumtext', 'longtext', 'char', 'varchar', 'uuid', 'ulid' => $this->normalizeStringValue($value),
            default => is_array($value) ? json_encode($value) : $value,
        };
    }

    protected function normalizeIntegerValue(string $column, mixed $value): ?int
    {
        if (is_bool($value)) {
            return $value ? 1 : 0;
        }

        if (! is_numeric($value)) {
            throw new \InvalidArgumentException("Column {$column} expects an integer value.");
        }

        return (int) $value;
    }

    protected function normalizeFloatValue(string $column, mixed $value): ?float
    {
        if (! is_numeric($value)) {
            throw new \InvalidArgumentException("Column {$column} expects a numeric value.");
        }

        return (float) $value;
    }

    protected function normalizeBooleanValue(string $column, mixed $value): bool
    {
        $normalized = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        if ($normalized === null) {
            throw new \InvalidArgumentException("Column {$column} expects a boolean value.");
        }

        return $normalized;
    }

    protected function normalizeJsonValue(string $column, mixed $value): string
    {
        if (is_string($value)) {
            json_decode($value, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \InvalidArgumentException("Column {$column} expects valid JSON.");
            }

            return $value;
        }

        return json_encode($value);
    }

    protected function normalizeDateValue(string $column, mixed $value, string $format): string
    {
        try {
            return Carbon::parse($value)->format($format);
        } catch (Throwable) {
            throw new \InvalidArgumentException("Column {$column} has an invalid date/time value.");
        }
    }

    protected function normalizeStringValue(mixed $value): string
    {
        if (is_array($value)) {
            return json_encode($value);
        }

        return (string) $value;
    }

    protected function normalizeMetaValue(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return is_array($value) ? json_encode($value) : (string) $value;
    }

    protected function sanitizeRecordForResponse(object $record): object
    {
        foreach ($this->sensitiveResponseFields as $field) {
            if (property_exists($record, $field)) {
                unset($record->{$field});
            }
        }

        if (! isset($record->meta) || ! is_iterable($record->meta)) {
            return $record;
        }

        foreach ($record->meta as $metaItem) {
            if (! isset($metaItem->meta_key)) {
                continue;
            }

            if ($this->isSensitiveFieldName((string) $metaItem->meta_key)) {
                $metaItem->meta_value = '***REDACTED***';
            }
        }

        return $record;
    }

    protected function isSensitiveFieldName(string $field): bool
    {
        $normalizedField = Str::lower($field);

        foreach ($this->sensitiveResponseFields as $sensitiveField) {
            if ($normalizedField === $sensitiveField || Str::contains($normalizedField, $sensitiveField)) {
                return true;
            }
        }

        return false;
    }

    protected function handleException(Throwable $e, ?string $entity = null, ?string $dataUid = null)
    {
        [$status, $message, $errors] = match (true) {
            $e instanceof \InvalidArgumentException => [400, $e->getMessage(), null],
            $e instanceof UniqueConstraintViolationException,
            $e instanceof QueryException => $this->mapQueryException($e),
            $e instanceof \RuntimeException => [404, $e->getMessage(), null],
            default => [500, 'Something went wrong while processing entity data.', null],
        };

        if (! $e instanceof \InvalidArgumentException
            && ! $e instanceof UniqueConstraintViolationException
            && ! $e instanceof QueryException
            && ! $e instanceof \RuntimeException) {
            $this->logError('Entity Data API Error: ' . $e->getMessage() . ' ' . json_encode([
                'entity' => $entity ?? 'unknown',
                'data_uid' => $dataUid,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'timestamp' => now()->toDateTimeString(),
            ]));
        }

        $this->logInfo(sprintf(
            'Dynamic entity exception mapped | file=%s | entity=%s | data_uid=%s | exception_class=%s | mapped_status=%s | mapped_message=%s | has_errors=%s | timestamp=%s',
            __FILE__,
            $entity ?? 'null',
            $dataUid ?? 'null',
            get_class($e),
            (string) $status,
            $message,
            ! empty($errors) ? 'true' : 'false',
            now()->toDateTimeString()
        ));

        return ApiResponse::error($message, $status, $errors);
    }

    protected function mapQueryException(QueryException $e): array
    {
        $errorInfo = $e->errorInfo ?? [];
        $sqlState = $errorInfo[0] ?? null;
        $driverCode = (int) ($errorInfo[1] ?? 0);
        $driverMessage = $errorInfo[2] ?? $e->getMessage();

        $this->logError(sprintf(
            'Entity Data DB Error | sql_state=%s | driver_code=%s | file=%s | timestamp=%s | message=%s',
            $sqlState ?? 'null',
            (string) $driverCode,
            __FILE__,
            now()->toDateTimeString(),
            $driverMessage
        ));

        switch (true) {
            case $sqlState === '23000' && $driverCode === 1062:
                $field = $this->extractFieldFromDuplicateKeyMessage($driverMessage);
                $message = $field ? ucfirst($field) . ' already exists.' : 'Duplicate value already exists.';
                $errors = $field ? [$field => ["The {$field} has already been taken."]] : null;

                return [409, $message, $errors];

            // Surface common relational integrity failures as client errors instead of leaking SQL details.
            case $sqlState === '23000' && in_array($driverCode, [1451, 1452], true):
                return [409, 'Related record does not exist or cannot be modified because it is in use.', null];

            case $sqlState === '23000' && $driverCode === 1048:
                $field = $this->extractFieldFromNotNullMessage($driverMessage);
                $message = $field ? ucfirst($field) . ' is required.' : 'A required field is missing.';
                $errors = $field ? [$field => ["The {$field} field is required."]] : null;

                return [422, $message, $errors];
        }

        return [500, 'Unable to save the record due to a database constraint.', null];
    }

    protected function extractFieldFromDuplicateKeyMessage(string $message): ?string
    {
        if (preg_match("/for key '([^']+)'/i", $message, $matches) !== 1) {
            return null;
        }

        $indexName = $matches[1];

        if (str_ends_with($indexName, '_unique')) {
            $indexName = substr($indexName, 0, -7);
        }

        $parts = explode('_', $indexName);

        return count($parts) > 1 ? end($parts) : $indexName;
    }

    protected function extractFieldFromNotNullMessage(string $message): ?string
    {
        if (preg_match("/Column '([^']+)' cannot be null/i", $message, $matches) === 1) {
            return $matches[1];
        }

        return null;
    }
}
