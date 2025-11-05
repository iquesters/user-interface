<?php

namespace Iquesters\UserInterface\Http\Controllers\Api\Meta;

use Iquesters\UserInterface\Constants\EntityStatus;
use Illuminate\Routing\Controller;
use Iquesters\UserInterface\Models\FormSchema;
use stdClass;
use Illuminate\Support\Facades\Log;

class FormController extends Controller
{
    /**
     * Get form schema without authentication
     */
    public function getNoAuthFormSchema($slug)
    {
        Log::info("No Auth: Fetching form schema for slug: " . $slug);
        // As application is not ready so we decided not to use uid
        return $this->getFormSchema($slug);

        // Now we have decdided to use by slug
        // return $this->getFormSchemaBySlug($slug);
    }

    /**
     * Get form schema with authentication
     */
    public function getAuthFormSchema($slug)
    {
        return $this->getFormSchema($slug);
    }

    /**
     * Common method to fetch form schema by slug
     */
    public function getFormSchemaBySlug($slug)
    {
        Log::info("Fetching form schema for slug: " . $slug);
        $response = new stdClass([
            'message' => 'Schema is empty',
            'data' => null
        ]);

        if ($slug) {
            $form = FormSchema::where(['slug' => $slug, 'status' => EntityStatus::ACTIVE])->first();
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

    /**
     * Common method to fetch form schema by uid
     */
    public function getFormSchema($uid)
    {
        Log::info("Fetching form schema for uid: " . $uid);
        $response = new stdClass([
            'message' => 'Schema is empty',
            'data' => null
        ]);

        if ($uid) {
            $form = FormSchema::where(['uid' => $uid, 'status' => EntityStatus::ACTIVE])->first();
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

}
