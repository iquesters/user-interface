<?php

namespace Iquesters\UserInterface\Http\Controllers\Api\Meta;

use Iquesters\UserInterface\Constants\EntityStatus;
use Illuminate\Routing\Controller;
use Iquesters\UserInterface\Models\FormSchema;
use stdClass;
use Illuminate\Support\Facades\Log;

class FormController extends Controller
{
    public function getFormSchema($slug)
    {
        Log::info("Fetching form schema for slug: " . $slug);
        $response = new stdClass([
            'message' => 'Schema is empty',
            'data' => null
        ]);

        if ($slug) {
            $form = FormSchema::where(['uid' => $slug, 'status' => EntityStatus::ACTIVE])->first();
            if (isset($form)) {
                $response->{'message'} = "Form schema found";
                $response->{'data'} = json_decode($form->schema);
            } else {
                $response->{'message'} = "Form schema not found";
            }
        } else {
            $response->{'message'} = "Form schema ID not found";
        }

        return json_encode($response);
    }

    public function getNoAuthFormSchema($slug)
    {
        Log::info("No Auth: Fetching form schema for slug: " . $slug);
        return $this->getFormSchema($slug);
    }

    public function getAuthFormSchema($slug)
    {
        return $this->getFormSchema($slug);
    }



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
}
