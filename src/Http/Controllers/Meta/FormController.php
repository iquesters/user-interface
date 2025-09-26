<?php

namespace Iquesters\UserInterface\Http\Controllers\Meta;

use Iquesters\UserInterface\Constants\EntityStatus;
use App\Http\Controllers\Controller;
use Iquesters\UserInterface\Http\Controllers\Utils\StringUtil;
use Iquesters\UserInterface\Models\FormSchema;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Iquesters\UserInterface\Http\Requests\DynamicFormRequest;
use Iquesters\UserInterface\Support\DynamicFormSchema;

class FormController extends Controller
{
    /**
     * Display a listing of the resource.
     * 
     * @return FormSchema[]
     */
    public function list()
    {
        $forms = FormSchema::where(['status' => EntityStatus::ACTIVE])->get();

        return view('userinterface::form-schemas.list', compact('forms'));
    }

    /**
     * This is the overview page for a single form
     * 
     * @param $id
     * @return FormSchema
     */
    public function overview($id)
    {
        $form = FormSchema::find($id);

        return view('userinterface::form-schemas.overview', compact('form'));
    }

    /**
     * Show the form for creating a new form.
     */
    public function create()
    {
        return view('userinterface::form-schemas.create');
    }

    /**
     * Store a newly created form resource in storage.
     * 
     * @param $request
     */
    public function store(Request $request)
    {
        // validate payload
        $errMsgs = [
            'name.required' => 'Please provide name',
            'schema.required' => 'Please provide schema',
        ];

        $validation_expression = [
            'name' => ['required', 'max:190'],
            'schema' => ['required'],
        ];
        $validator = Validator::make($request->all(), $validation_expression, $errMsgs);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors())->withInput();
        }

        // create slug
        $slug = isset($request['slug']) ? $request['slug'] : StringUtil::generateSlug($request['name']);

        // create form
        $result = FormSchema::create([
            // 'uid' => Str::ulid()->toString(),
            'uid' => (string) Str::ulid(),
            'name' => $request['name'],
            'slug' => $slug,
            'description' => $request['description'],
            'schema' => $request['schema'],
            'extra_info' => $request['extra_info'],
            'status' => EntityStatus::ACTIVE
        ]);

        if ($result) {
            return redirect()->route('form.overview', $result->id)->with('success', 'Successfully created a form!');
        } else {
            return redirect()->back()->with('error', 'Failed to create a form!')->withInput();
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update($id, Request $request)
    {
        // validate payload
        $errMsgs = [
            'name.required' => 'Please provide name',
            'schema.required' => 'Please provide schema',
        ];

        $validation_expression = [
            'name' => ['required', 'max:190'],
            'schema' => ['required'],
        ];
        $validator = Validator::make($request->all(), $validation_expression, $errMsgs);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors())->withInput();
        }

        // form updated data
        // $form_data = [
        //     'name' => $request['name'],
        //     'description' => $request['description'],
        //     'schema' => $request['schema'],
        //     'extra_info' => $request['extra_info']
        // ];

        // update slug in form data
        // if (isset($request['slug'])) {
        //     $form_data['slug'] = $request['slug'];
        // }

        Log::info('form id=' . json_encode($id));
        // Log::info('form_data=' . json_encode($form_data));
        // create form
        $result = FormSchema::where(['id' => $id])->update([
            'name' => $request['name'],
            'description' => $request['description'],
            'schema' => $request['schema'],
            'extra_info' => $request['extra_info']
        ]);

        if ($result) {
            return redirect()->route('form.overview', $id)->with('success', 'Successfully updated a form!');
        } else {
            return redirect()->back()->with('error', 'Failed to update a form!')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FormSchema $formSchema)
    {
        //
    }

    public function delete() {}




    public function formCreate($id)
    {
        $parent_id = $id;

        $data = (object) [
            'parent_id' => $parent_id
        ];

        $schema = null;

        if ($parent_id > 0) {
            $parent = FormSchema::where('id', $parent_id)->first();
            $data->parent = $parent;

            // assuming schema column holds your JSON
            $schema = $parent->schema ? json_decode($parent->schema, true) : null;
        }

        return view('userinterface::form-schemas.dynamic-form', compact('data', 'schema'));
    }


    public function formCreation($id = 0){
        $parent_id = $id;

        $data = (object)array(
            'parent_id' => $parent_id
        );

        if ($parent_id > 0) {
            $parent = FormSchema::where('id', $parent_id)->first();
            $data->parent = $parent;
        }
        Log::info('Form data: ' . json_encode($data));
        return view('userinterface::form-schemas.formcreation', compact('data'));
    }



    public function formsubmit(Request $request,$uid)
    {
        try {
            // Fetch schema record
            $schemaRecord = FormSchema::where('uid', $uid)->first();
            if (!$schemaRecord) {
                return back()->withErrors(['uid' => 'Invalid form UID']);
            }

            // Decode JSON schema
            $schema = json_decode($schemaRecord->schema, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON schema: ' . json_last_error_msg());
            }

            // Generate rules and messages dynamically
            $rules = DynamicFormSchema::toRules($schema);
            $messages = DynamicFormSchema::toMessages($schema);

            // Validate input
            $validator = Validator::make($request->all(), $rules, $messages);
            

            if ($validator->fails()) {
                return back()
                    ->withErrors($validator)
                    ->withInput();
            }


            $validatedData = $validator->validated();

            return back()->with('success', 'Form submitted successfully');

        } catch (\Exception $e) {
            Log::error('Form submission error: ' . $e->getMessage());
            return back()->withErrors(['form_error' => 'An error occurred: ' . $e->getMessage()])->withInput();
        }
    }


}
