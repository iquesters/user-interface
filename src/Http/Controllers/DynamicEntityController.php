<?php

namespace Iquesters\UserInterface\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Iquesters\Foundation\System\Http\ApiResponse;
use Iquesters\Foundation\System\Traits\Loggable;
use Throwable;

class DynamicEntityController extends Controller
{
    use Loggable;

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

            return ApiResponse::success($record, 'Request successful');
        } catch (Throwable $e) {
            return $this->handleException($e, $entity, $data_uid);
        }
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

    protected function handleException(Throwable $e, ?string $entity = null, ?string $dataUid = null)
    {
        $status = 500;
        $message = 'Something went wrong while retrieving entity data.';
        $errors = null;

        if ($e instanceof \InvalidArgumentException) {
            $status = 400;
            $message = $e->getMessage();
        } elseif ($e instanceof \RuntimeException) {
            $status = 404;
            $message = $e->getMessage();
        } else {
            $this->logError('Entity Data API Error: ' . $e->getMessage() . ' ' . json_encode([
                'entity' => $entity ?? 'unknown',
                'data_uid' => $dataUid,
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'timestamp' => now()->toDateTimeString(),
            ]));
        }

        return ApiResponse::error($message, $status, $errors);
    }
}
