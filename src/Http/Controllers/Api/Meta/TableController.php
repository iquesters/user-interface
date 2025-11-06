<?php

namespace Iquesters\UserInterface\Http\Controllers\Api\Meta;

use Iquesters\UserInterface\Constants\EntityStatus;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Iquesters\UserInterface\Models\TableSchema;
use Illuminate\Support\Facades\Log;
use stdClass;

class TableController extends Controller
{
    /**
     * Fetch table schema by slug
     *
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function getAuthTableSchema($slug)
    {
        Log::info("Fetching table schema for slug: " . $slug);
        
         // Check if user is authenticated via Sanctum
        if (!Auth::check()) {
            return response()->json([
                'message' => 'Unauthenticated',
                'error' => 'Authentication required'
            ], 401);
        }
        Log::info("User accessing table schema: " . Auth::id());
        
        // As application is not ready so we decided not to use uid
        return $this->getTableSchema($slug);

        // Now we have decdided to use by slug
        // return $this->getTableSchemaBySlug($slug);
    }

    /**
     * Fetch table schema by unique identifier (UID)
     *
     * @param string $uid
     * @return \Illuminate\Http\JsonResponse
     */
    private function getTableSchema($uid)
    {
        Log::info("Fetching table schema for UID: " . $uid);

        $response = new stdClass();
        $response->message = 'Schema is empty';
        $response->data = null;

        try {
            if ($uid) {
                // ✅ Find table schema by UID and ensure it's active
                $table = TableSchema::where([
                    'uid' => $uid,
                    'status' => EntityStatus::ACTIVE
                ])->first();

                if ($table) {
                    $response->message = "Table schema found";

                    // ✅ Decode schema safely whether it's a JSON string or array
                    $schema = $table->schema;
                    if (is_string($schema)) {
                        $schema = json_decode($schema, true);
                    }

                    // ✅ Decode nested dt-options if present
                    if (isset($schema['dt-options']) && is_string($schema['dt-options'])) {
                        $schema['dt-options'] = json_decode($schema['dt-options'], true);
                    }

                    $response->data = $schema;
                } else {
                    $response->message = "Table schema not found";
                }
            } else {
                $response->message = "Table UID not provided";
            }

            return response()->json($response);

        } catch (\Throwable $e) {
            // Log and return a detailed internal server error
            Log::error('Error fetching table schema', [
                'uid' => $uid,
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

    /**
     * Fetch table schema by slug
     *
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    private function getTableSchemaBySlug($slug)
    {
        Log::info("Fetching table schema for slug: " . $slug);

        $response = new stdClass();
        $response->message = 'Schema is empty';
        $response->data = null;

        try {
            if ($slug) {
                // Find table schema by slug and ensure it's active
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