<?php

namespace Iquesters\UserInterface\Http\Controllers\Api\Meta;

use Iquesters\UserInterface\Constants\EntityStatus;
use Illuminate\Routing\Controller;
use Iquesters\UserInterface\Models\TableSchema;
use Illuminate\Support\Facades\Log;
use stdClass;

class TableController extends Controller
{
    public function getNoAuthTableSchema($slug)
    {
        Log::info("No Auth: Fetching table schema for slug: " . $slug);
        return $this->getTableSchemaBySlug($slug);
    }

    private function getTableSchemaBySlug($slug)
    {
        Log::info("Fetching table schema for slug: " . $slug);

        $response = new stdClass();
        $response->message = 'Schema is empty';
        $response->data = null;

        try {
            if ($slug) {
                $table = TableSchema::where([
                    'slug' => $slug,
                    'status' => EntityStatus::ACTIVE
                ])->first();

                if ($table) {
                    $response->message = "Table schema found";

                    // ✅ Handle both string or array cases safely
                    $schema = $table->schema;
                    if (is_string($schema)) {
                        $schema = json_decode($schema, true);
                    }

                    // ✅ Decode dt-options if it's a string
                    if (isset($schema['dt-options']) && is_string($schema['dt-options'])) {
                        $schema['dt-options'] = json_decode($schema['dt-options'], true);
                    }

                    $response->data = $schema;
                } else {
                    $response->message = "Table schema not found";
                }
            } else {
                $response->message = "Table slug not provided";
            }

            return response()->json($response);

        } catch (\Throwable $e) {
            Log::error('Error fetching table schema', [
                'slug' => $slug,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}