<?php

namespace Iquesters\UserInterface\Http\Controllers\Meta;

use Iquesters\UserInterface\Constants\EntityStatus;
use App\Http\Controllers\Controller;
use Iquesters\UserInterface\Http\Controllers\Utils\StringUtil;
use Iquesters\UserInterface\Models\FormSchema;
use Iquesters\UserInterface\Models\FormValue;
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


    public function formCreation($id = 0){
        $parent_id = $id;

        $data = (object)array(
            'parent_id' => $parent_id
        );

        if ($parent_id > 0) {
            $parent = FormSchema::where('uid', $parent_id)->first();
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


    // public function saveformdata(Request $request,$uid){
    //     try {

    //          // Define keys to skip
    //         $excludedKeys = ['_token', 'formId', 'form_uid'];

    //         // Loop through and insert key-value pairs
    //         foreach ($request->except($excludedKeys) as $key => $value) {
    //             FormValue::create([
    //                 'form_uid' => $uid,
    //                 'field_key' => $key,
    //                 'field_value' => is_array($value) ? json_encode($value) : $value,
    //             ]);
    //         }

    //         return response()->json([
    //             'status' => 'success',
    //             'message' => 'Form data saved successfully',
    //             'form_uid' => $uid
    //         ], 200);

    //     } catch (\Exception $e) {
    //         Log::error('Error saving form data: ' . $e->getMessage());

    //         return response()->json([
    //             'status' => 'error',
    //             'message' => 'An error occurred while saving form data',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    public function saveformdata(Request $request, $uid)
    {
        Log::info('Saving form data for UID: ' . $uid);
        try {
            // 1️⃣ Validate the UID against your form schema table
            $schemaRecord = FormSchema::where('uid', $uid)->first();
            if (!$schemaRecord) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid form UID'
                ], 400);
            }

            // 2️⃣ Decode JSON schema
            $schema = json_decode($schemaRecord->schema, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON schema: ' . json_last_error_msg());
            }

            // 3️⃣ Generate dynamic validation rules & messages
            $rules = DynamicFormSchema::toRules($schema);
            $messages = DynamicFormSchema::toMessages($schema);

            // 4️⃣ Validate input
            $validator = Validator::make($request->all(), $rules, $messages);

            if ($validator->fails()) {
                // ❌ Return errors as JSON
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            

            $validatedData = $validator->validated();

            // 5️⃣ Define keys to skip
            $excludedKeys = ['_token', 'formId', 'form_uid'];

            // 6️⃣ Save each field into the database
            foreach ($validatedData as $key => $value) {
                if (in_array($key, $excludedKeys)) continue;

                FormValue::create([
                    'form_uid' => $uid, // ✅ Use trusted UID from route
                    'field_key' => $key,
                    'field_value' => is_array($value) ? json_encode($value) : $value,
                ]);
            }

            // 7️⃣ Return success response
            return response()->json([
                'status' => 'success',
                'message' => 'Form data saved successfully',
                'form_uid' => $uid
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error saving form data: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while saving form data',
                'error' => $e->getMessage()
            ], 500);
        }
    }



    public function submitAndSave(Request $request, $uid){
        try {
            // 1️⃣ Fetch schema record
            $schemaRecord = FormSchema::where('uid', $uid)->first();
            if (!$schemaRecord) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid form UID'
                ], 400);
            }

            // 2️⃣ Decode JSON schema
            $schema = json_decode($schemaRecord->schema, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception('Invalid JSON schema: ' . json_last_error_msg());
            }

            // 3️⃣ Generate dynamic validation rules and messages
            $rules = DynamicFormSchema::toRules($schema);
            $messages = DynamicFormSchema::toMessages($schema);

            // 4️⃣ Validate input
            $validator = Validator::make($request->all(), $rules, $messages);

            // if ($validator->fails()) {
            //     return response()->json([
            //         'status' => 'error',
            //         'message' => 'Validation failed',
            //         'errors' => $validator->errors()
            //     ], 422);
            // }

            if ($validator->fails()) {
                return back()
                    ->withErrors($validator)
                    ->withInput();
            }

            $validatedData = $validator->validated();

            // 5️⃣ Save form data
            $formUid = $request->input('form_uid', (string) Str::ulid());

            foreach ($validatedData as $key => $value) {
                FormValue::create([
                    'form_uid' => $formUid,
                    'field_key' => $key,
                    'field_value' => is_array($value) ? json_encode($value) : $value,
                ]);
            }

            // 6️⃣ Return success response
            // return response()->json([
            //     'status' => 'success',
            //     'message' => 'Form submitted and saved successfully',
            //     'form_uid' => $formUid
            // ], 200);

            return back()->with('success', 'Form submitted successfully');

        } catch (\Exception $e) {
            Log::error('Form submission error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred: ' . $e->getMessage()
            ], 500);
        }
    }



    public function getNoAuthFormSchema($slug)
    {
        Log::info("No Auth: Fetching form schema for slug: " . $slug);
        return $this->getFormSchema($slug);
    }




}
