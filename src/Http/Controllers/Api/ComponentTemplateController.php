<?php

namespace Iquesters\UserInterface\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Iquesters\Foundation\System\Traits\Loggable;

class ComponentTemplateController extends Controller
{
    use Loggable;

    public function show(Request $request, string $component)
    {
        $componentName = trim(urldecode($component));

        try {
            $this->logMethodStart("component={$componentName}");

            if ($componentName === '') {
                return response()->json([
                    'success' => false,
                    'message' => 'The component key is required.',
                    'data' => null,
                ], 422);
            }

            if (! str_contains($componentName, '::')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Component must be a fully qualified view name.',
                    'data' => null,
                ], 422);
            }

            if (! view()->exists($componentName)) {
                return response()->json([
                    'success' => false,
                    'message' => "Component view '{$componentName}' not found.",
                    'data' => null,
                ], 404);
            }

            $html = view($componentName)->render();

            return response()->json([
                'success' => true,
                'message' => 'Component template loaded successfully',
                'data' => [
                    'html' => $html,
                    'component' => $componentName,
                ],
            ]);
        } catch (\Throwable $th) {
            $this->logError('Component template load failed: ' . $th->getMessage());
            Log::error('ComponentTemplateController@show failed', [
                'component' => $componentName,
                'exception' => $th->getMessage(),
                'trace' => $th->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load component template.',
                'error' => $th->getMessage(),
            ], 500);
        } finally {
            $this->logMethodEnd("component={$componentName}");
        }
    }

}
