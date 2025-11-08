<?php

namespace Iquesters\UserInterface\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Throwable;

class DynamicEntityController extends Controller
{
    public function getEntityData(string $entity, ?string $entity_uid = null)
    {
        try {
            if (! $entity) {
                return response()->json(['error' => 'Entity name is required'], 400);
            }

            if (! Schema::hasTable($entity)) {
                Log::warning("Entity fetch failed: Table '{$entity}' not found");
                return response()->json(['error' => "Table {$entity} does not exist"], 404);
            }

            // ✅ Detect meta table
            $possibleMetaTables = [
                "{$entity}_metas",
                "{$entity}_meta",
                Str::singular($entity) . "_meta",
                Str::singular($entity) . "_metas",
            ];

            $metaTable = collect($possibleMetaTables)
                ->first(fn($table) => Schema::hasTable($table));

            // ✅ Build query
            $query = DB::table($entity);

            // ✅ Handle filtering by entity_uid
            if ($entity_uid) {
                $hasUid = Schema::hasColumn($entity, 'uid');
                $hasId  = Schema::hasColumn($entity, 'id');

                if ($hasUid && is_numeric($entity_uid)) {
                    return response()->json([
                        'success' => false,
                        'error' => "This table uses 'uid' as the primary reference. Please pass a valid UID instead of an ID.",
                    ], 400);
                }

                if ($hasUid) {
                    $query->where('uid', $entity_uid);
                } elseif ($hasId) {
                    $query->where('id', $entity_uid);
                } else {
                    return response()->json([
                        'success' => false,
                        'error' => "Table {$entity} has no 'uid' or 'id' column to filter by.",
                    ], 400);
                }
            }

            // ✅ Add pagination / lazy loading parameters
            $offset = request()->get('offset', 0);
            $length = request()->get('length', 50);

            $totalCount = $query->count(); // before limit

            $data = $query->offset($offset)->limit($length)->get();

            // ✅ Attach meta data if available
            if ($metaTable) {
                $metaData = DB::table($metaTable)->get();
                $groupedMeta = $metaData->groupBy('ref_parent');

                $data = $data->map(function ($item) use ($groupedMeta) {
                    $item->meta = $groupedMeta[$item->id] ?? [];
                    return $item;
                });
            }

            return response()->json([
                'success' => true,
                'entity' => $entity,
                'meta_table' => $metaTable ?? 'none',
                'offset' => (int)$offset,
                'length' => (int)$length,
                'total' => $totalCount,
                'count' => $data->count(),
                'data' => $data,
            ]);

        } catch (Throwable $e) {
            Log::error('Entity Data API Error', [
                'entity' => $entity ?? 'unknown',
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Internal Server Error',
                'message' => 'Something went wrong while retrieving entity data.',
            ], 500);
        }
    }
}