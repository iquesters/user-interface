<?php

namespace Iquesters\UserInterface\Http\Controllers;




use Illuminate\Support\Facades\Log;
use Illuminate\Routing\Controller;

class UIController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return FormSchema[]
     */
    public function list()
    {
        
        return view('userinterface::form-schemas.list', compact('forms'));
    }

    public function view($form_schema_id, $entity_uid= null)
    {
        Log::info("In UIController view method", [
            'form_schema_id' => $form_schema_id,
            'entity_uid' => $entity_uid
        ]);
        return view('userinterface::ui.form.view', compact('form_schema_id', 'entity_uid'));
    }

    // Currently, entity_uid is optional for View routes but will be used in the future.
    public function edit($form_schema_id, $entity_uid= null)
    {
        Log::info("In UIController edit method", [
            'form_schema_id' => $form_schema_id,
            'entity_uid' => $entity_uid
        ]);
        return view('userinterface::ui.form.edit', compact('form_schema_id', 'entity_uid'));
    }

    public function delete()
    {
        
        return view('userinterface::form-schemas.list', compact('forms'));
    }


}