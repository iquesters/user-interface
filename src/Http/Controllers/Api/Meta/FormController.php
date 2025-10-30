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
}
