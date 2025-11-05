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

    public function view()
    {
        
        return view('userinterface::ui.form.view', compact('uid'));
    }

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