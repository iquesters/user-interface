<?php

namespace Iquesters\UserInterface\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Iquesters\Foundation\System\Traits\Loggable;
use Iquesters\UserInterface\Support\RecordComponents;

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

            // A registered record component key ("user.details"), or (deprecated) a view name.
            $template = app(RecordComponents::class)->template($componentName);

            if ($template === null) {
                return response()->json([
                    'success' => false,
                    'message' => "Component '{$componentName}' not found. Use a registered key such as \"user.details\".",
                    'data' => null,
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Component template loaded successfully',
                'data' => [
                    'html' => $template['html'],
                    'component' => $componentName,
                    'deprecated' => $template['deprecated'],
                ],
            ]);
        } catch (\Throwable $th) {
            $this->logError('Component template load failed: '.$th->getMessage());
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
