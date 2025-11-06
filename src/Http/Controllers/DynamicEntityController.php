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

            // ✅ Ensure main table exists
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

            if ($entity_uid) {
                $hasUid = Schema::hasColumn($entity, 'uid');
                $hasId  = Schema::hasColumn($entity, 'id');

                // 🚫 If the table uses UID but user passed an ID-looking value
                if ($hasUid && is_numeric($entity_uid)) {
                    return response()->json([
                        'success' => false,
                        'error' => "This table uses 'uid' as the primary reference. Please pass a valid UID instead of an ID.",
                    ], 400);
                }

                // ✅ Choose correct column for filtering
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

            $data = $query->get();

            // ✅ Attach meta data if available
            if ($metaTable) {
                $metaData = DB::table($metaTable)->get();
                $groupedMeta = $metaData->groupBy('ref_parent');

                $data = $data->map(function ($item) use ($groupedMeta) {
                    $item->meta = $groupedMeta[$item->id] ?? [];
                    return $item;
                });
            }

            Log::info('Entity data retrieved successfully', [
                'entity' => $entity,
                'meta_table' => $metaTable ?? 'none',
                'record_count' => $data->count(),
                'entity_uid' => $entity_uid ?? 'none',
                'timestamp' => now()->toDateTimeString(),
            ]);

            return response()->json([
                'success' => true,
                'entity' => $entity,
                'meta_table' => $metaTable ?? 'none',
                'entity_uid' => $entity_uid ?? null,
                'count' => $data->count(),
                'data' => $data,
            ], 200);

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