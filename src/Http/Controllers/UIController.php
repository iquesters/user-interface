<?php

namespace Iquesters\UserInterface\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Iquesters\Foundation\Models\MasterData;
use Iquesters\Foundation\System\Traits\Loggable;
use Iquesters\UserInterface\Models\TableSchema;

class UIController extends Controller
{
    use Loggable;

    /**
     * Display a listing of the resource.
     *
     * @return FormSchema[]
     */
    public function list($table_schema_id)
    {
        try {
            $this->logMethodStart("table_schema_id={$table_schema_id}");
            Log::info('In UIController list method', [
                'table_schema_id' => $table_schema_id,
            ]);

            $table_schema = TableSchema::where('uid', $table_schema_id)->first();

            $this->logMethodEnd("table_schema_id={$table_schema_id}");
            return view('userinterface::ui.list', compact('table_schema'));
        } catch (\Throwable $th) {
            $this->logError('List failed: ' . $th->getMessage());
            Log::error('Error in list method', [
                'error' => $th->getMessage(),
            ]);

            return back()->with('error', 'Something went wrong.');
        }
    }

    public function view(Request $request, $form_schema_id, $entity_uid = null)
    {
        try {
            $this->logMethodStart("form_schema_id={$form_schema_id}, entity_uid={$entity_uid}");
            Log::info('In UIController view method', [
                'form_schema_id' => $form_schema_id,
                'entity_uid' => $entity_uid,
                'request' => $request->all(),
            ]);

            $this->logMethodEnd("form_schema_id={$form_schema_id}, entity_uid={$entity_uid}");
            return view('userinterface::ui.form.view', compact('form_schema_id', 'entity_uid'));
        } catch (\Throwable $th) {
            $this->logError('View failed: ' . $th->getMessage());
            Log::error('UIController@view failed', [
                'form_schema_id' => $form_schema_id,
                'entity_uid' => $entity_uid,
                'exception' => $th,
            ]);

            throw $th;
        }
    }

    // Currently, entity_uid is optional for View routes but will be used in the future.
    public function edit(Request $request, $form_schema_id, $entity_uid = null)
    {
        try {
            $this->logMethodStart("form_schema_id={$form_schema_id}, entity_uid={$entity_uid}");
            Log::info('In UIController edit method', [
                'form_schema_id' => $form_schema_id,
                'entity_uid' => $entity_uid,
            ]);
            Log::debug('Request', [
                'request' => $request->all(),
            ]);

            $this->logMethodEnd("form_schema_id={$form_schema_id}, entity_uid={$entity_uid}");
            return view('userinterface::ui.form.edit', compact('form_schema_id', 'entity_uid'));
        } catch (\Throwable $th) {
            $this->logError('Edit failed: ' . $th->getMessage());
            Log::error('UIController@edit failed', [
                'exception' => $th,
            ]);

            throw $th;
        }
    }

    public function getHtmlComponent(Request $request, string $component)
    {
        $payload = $request->input('payload', []);
        if (!is_array($payload)) {
            $payload = [];
        }

        if (empty($payload)) {
            $payload = $request->except(['_token']);
        }

        $schemaId = $payload['schema_id'] ?? $payload['id'] ?? $payload['form_schema_id'] ?? null;
        $entityUid = $payload['entity_uid'] ?? null;

        try {
            $this->logMethodStart("component={$component}, schema_id={$schemaId}, entity_uid={$entityUid}");
            Log::info('In UIController getHtmlComponent method', [
                'component' => $component,
                'payload' => $payload,
            ]);

            if (empty(trim($component))) {
                $this->logWarning('Component render requested without component key');

                return response()->json([
                    'success' => false,
                    'message' => 'The component key is required.',
                    'data' => null,
                ], 422);
            }

            $componentName = $this->resolveComponentView($component);

            Log::info("Rendering component: {$componentName}");

            if (!view()->exists($componentName)) {
                $this->logWarning("Component view not found: {$componentName}");
                Log::error("View does not exist: {$componentName}");

                return response()->json([
                    'success' => false,
                    'message' => "Component view '{$componentName}' not found",
                    'data' => null,
                ], 404);
            }

            $html = view($componentName, [
                'payload' => $payload,
                'id' => $schemaId,
                'schema_id' => $schemaId,
                'entity_uid' => $entityUid,
            ])->render();

            return response()->json([
                'success' => true,
                'message' => 'Component rendered successfully',
                'data' => [
                    'html' => $html,
                    'component' => $componentName,
                    'payload' => $payload,
                ],
            ]);
        } catch (\Throwable $th) {
            $this->logError('Component render failed: ' . $th->getMessage());
            Log::error('UIController@getHtmlComponent failed', [
                'component' => $component,
                'schema_id' => $schemaId,
                'entity_uid' => $entityUid,
                'payload' => $payload,
                'exception' => $th->getMessage(),
                'trace' => $th->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $th->getMessage(),
            ], 500);
        } finally {
            $this->logMethodEnd("component={$component}, schema_id={$schemaId}, entity_uid={$entityUid}");
        }
    }

    protected function resolveComponentView(?string $componentName): string
    {
        $componentName = trim((string) $componentName);

        if ($componentName === '') {
            return '';
        }

        if (!str_contains($componentName, '::')) {
            throw new \InvalidArgumentException('Component must be a fully qualified view name.');
        }

        return $componentName;
    }

    public function delete()
    {
        return view('userinterface::form-schemas.list', compact('forms'));
    }

    public function setTheme()
    {
        try {
            $this->logMethodStart();
            $themes = MasterData::where('parent_id', 4)
                ->where('status', 'active')
                ->get(['id', 'key', 'value']);

            $themeMasterData = MasterData::where('key', 'current_theme')->first();

            $this->logMethodEnd('theme selector loaded');
            return view('userinterface::ui.theme-selector', compact('themes', 'themeMasterData'));
        } catch (\Throwable $th) {
            $this->logError('Set theme failed: ' . $th->getMessage());
            throw $th;
        }
    }
}
