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
