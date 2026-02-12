<?php

namespace Iquesters\UserInterface\Http\Controllers;

use Illuminate\Support\Facades\Log;
use Illuminate\Routing\Controller;
use Iquesters\Foundation\Models\MasterData;
use Illuminate\Http\Request;
use Iquesters\UserInterface\Models\TableSchema;

class UIController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return FormSchema[]
     */
    public function list($table_schema_id)
    {
        try {
            Log::info("In UIController list method", [
                'table_schema_id' => $table_schema_id
            ]);
            $table_schema = TableSchema::where('uid', $table_schema_id)->first();
            return view('userinterface::ui.list', compact('table_schema'));
        } catch (\Throwable $th) {
            Log::error("Error in list method", [
                'error' => $th->getMessage()
            ]);

            return back()->with('error', 'Something went wrong.');
        }
    }

    public function view($form_schema_id, $entity_uid= null)
    {
        try {
            Log::info("In UIController view method", [
                'form_schema_id' => $form_schema_id,
                'entity_uid' => $entity_uid
            ]);
            return view('userinterface::ui.form.view', compact('form_schema_id', 'entity_uid'));
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    // Currently, entity_uid is optional for View routes but will be used in the future.
    public function edit(Request $request, $form_schema_id, $entity_uid= null)
    {
        try {
            Log::info("In UIController edit method", [
                'form_schema_id' => $form_schema_id,
                'entity_uid' => $entity_uid
            ]);
            Log::debug("Request", [
                'request' => $request->all()
            ]);
            if ($request->boolean('ajax')) {
            return response()->json([
                'html' => view('userinterface::components.form', [
                    'id' => $form_schema_id,
                    'entity_uid' => $entity_uid,
                ])->render()
            ]);
        }

            // if ($request->boolean('ajax')) {
            //     return view('userinterface::ui.form.edit-form-only', compact('form_schema_id', 'entity_uid'));
            // }
            return view('userinterface::ui.form.edit', compact('form_schema_id', 'entity_uid'));
        } catch (\Throwable $th) {
                Log::error('UIController@edit failed', [
                'exception' => $th,
            ]);

            throw $th;
        }
    }
    
    public function getHtmlComponent(Request $request, $form_schema_id, $entity_uid = null)
    {
        try {
            Log::info("In UIController getHtmlComponent method", [
                'form_schema_id' => $form_schema_id,
                'entity_uid' => $entity_uid,
                'request' => $request->all(),
                'component' => $request->input('component'), // ← Add this for debugging
            ]);
            
            // Get component name from request, default to form component
            $componentName = $request->input('component', 'userinterface::components.form');
            
            // Validate component name is not empty
            if (empty($componentName)) {
                Log::warning('Component name is empty, using default form component');
                $componentName = 'userinterface::components.form';
            }
            
            Log::info("Rendering component: {$componentName}");
            
            // Check if view exists before rendering
            if (!view()->exists($componentName)) {
                Log::error("View does not exist: {$componentName}");
                
                return response()->json([
                    'success' => false,
                    'error' => "Component view '{$componentName}' not found"
                ], 404);
            }
            
            // Render the view
            $html = view($componentName, [
                'id' => $form_schema_id,
                'entity_uid' => $entity_uid,
            ])->render();
            
            return response()->json([
                'success' => true,
                'html' => $html
            ]);
            
        } catch (\Throwable $th) {
            Log::error('UIController@getHtmlComponent failed', [
                'form_schema_id' => $form_schema_id,
                'entity_uid' => $entity_uid,
                'component' => $request->input('component'),
                'exception' => $th->getMessage(),
                'trace' => $th->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => $th->getMessage()
            ], 500);
        }
    }

    public function delete()
    {
        
        return view('userinterface::form-schemas.list', compact('forms'));
    }


    public function setTheme()
    {
        try {
            $themes = MasterData::where('parent_id', 4)
            ->where('status', 'active')
            ->get(['id', 'key', 'value']);

            // Fetch current active theme masterdata (assuming key='theme' or parent_id=4)
            $themeMasterData = MasterData::where('key', 'current_theme')->first();
           
            return view('userinterface::ui.theme-selector',compact('themes','themeMasterData'));
        } catch (\Throwable $th) {
            throw $th;
        }
    }


}