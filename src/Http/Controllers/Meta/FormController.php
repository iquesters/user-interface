<?php

namespace Iquesters\UserInterface\Http\Controllers\Meta;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Iquesters\Foundation\System\Traits\Loggable;
use Iquesters\UserInterface\Constants\EntityStatus;
use Iquesters\UserInterface\Http\Controllers\Utils\StringUtil;
use Iquesters\UserInterface\Models\FormSchema;
use Iquesters\UserInterface\Support\DynamicFormSchema;

class FormController extends Controller
{
    use Loggable;

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
            'uid' => (string) Str::ulid(),
            'name' => $request['name'],
            'slug' => $slug,
            'description' => $request['description'],
            'schema' => $request['schema'],
            'extra_info' => $request['extra_info'],
            'status' => EntityStatus::ACTIVE,
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

        static::logInfo('form id='.json_encode($id));
        // Log::info('form_data=' . json_encode($form_data));
        // create form
        $result = FormSchema::where(['id' => $id])->update([
            'name' => $request['name'],
            'description' => $request['description'],
            'schema' => $request['schema'],
            'extra_info' => $request['extra_info'],
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

    public function formCreation($id = 0)
    {
        $parent_id = $id;

        $data = (object) [
            'parent_id' => $parent_id,
        ];

        if ($parent_id > 0) {
            $parent = FormSchema::where('uid', $parent_id)->first();
            $data->parent = $parent;
        }
        static::logInfo('Form data: '.json_encode($data));

        return view('userinterface::form-schemas.formcreation', compact('data'));
    }

    public function formCreation_new($id = 0)
    {
        $parent_id = $id;

        $data = (object) [
            'parent_id' => $parent_id,
        ];

        if ($parent_id > 0) {
            $parent = FormSchema::where('uid', $parent_id)->first();
            $data->parent = $parent;
        }
        static::logInfo('Form data: '.json_encode($data));

        return view('userinterface::form-schemas.formcreation_new', compact('data'));
    }

    /**
     * Validate a submission against the form schema (no save). Web form post.
     */
    public function formsubmit(Request $request, $uid)
    {
        try {
            $schemaRecord = FormSchema::where('uid', $uid)->first();
            if (! $schemaRecord) {
                return back()->withErrors(['uid' => 'Invalid form UID']);
            }

            $validator = $this->submissionValidator($request, $this->schemaArray($schemaRecord));

            if ($validator->fails()) {
                return back()->withErrors($validator)->withInput();
            }

            return back()->with('success', 'Form submitted successfully');
        } catch (\Throwable $e) {
            static::logError('Form submission error: '.$e->getMessage());

            return back()->withErrors(['form_error' => 'An error occurred while submitting the form.'])->withInput();
        }
    }

    /** The schema column is cast to an array; older rows may still hold a JSON string. */
    private function schemaArray(FormSchema $schemaRecord): array
    {
        $schema = $schemaRecord->schema;

        if (is_string($schema)) {
            $schema = json_decode($schema, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \RuntimeException('Invalid JSON schema: '.json_last_error_msg());
            }
        }

        return is_array($schema) ? $schema : [];
    }

    private function submissionValidator(Request $request, array $schema): \Illuminate\Validation\Validator
    {
        return Validator::make(
            $request->all(),
            DynamicFormSchema::toRules($schema),
            DynamicFormSchema::toMessages($schema)
        );
    }

    public function getNoAuthFormSchema($slug)
    {
        static::logInfo('No Auth: Fetching form schema for slug: '.$slug);

        return $this->getFormSchema($slug);
    }
}
