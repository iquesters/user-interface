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
    public function getEntityData(string $entity)
    {
        try {
            if (! $entity) {
                return response()->json(['error' => 'Entity name is required'], 400);
            }

            // ✅ Check if main table exists
            if (! Schema::hasTable($entity)) {
                Log::warning("Entity fetch failed: Table '{$entity}' not found");
                return response()->json(['error' => "Table {$entity} does not exist"], 404);
            }

            // ✅ Find matching meta table (smart detection)
            $possibleMetaTables = [
                "{$entity}_metas",
                "{$entity}_meta",
                Str::singular($entity) . "_meta",
                Str::singular($entity) . "_metas",
            ];

            $metaTable = collect($possibleMetaTables)
                ->first(fn($table) => Schema::hasTable($table));

            // ✅ Fetch main entity data
            $data = DB::table($entity)->get();

            // ✅ Fetch and attach meta data if exists
            if ($metaTable) {
                $metaData = DB::table($metaTable)->get();
                $groupedMeta = $metaData->groupBy('ref_parent');

                $data = $data->map(function ($item) use ($groupedMeta) {
                    $item->meta = $groupedMeta[$item->id] ?? [];
                    return $item;
                });
            }

            // ✅ Log success (you’ll see this in storage/logs/laravel.log)
            Log::info('Entity data retrieved successfully', [
                'entity' => $entity,
                'meta_table' => $metaTable ?? 'none',
                'record_count' => $data->count(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            // ✅ Return success JSON
            return response()->json([
                'success' => true,
                'entity' => $entity,
                'meta_table' => $metaTable ?? 'none',
                'count' => $data->count(),
                'data' => $data,
            ], 200);

        } catch (Throwable $e) {
            // ❌ Log errors with details
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