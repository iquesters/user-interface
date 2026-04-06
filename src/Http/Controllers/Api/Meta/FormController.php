<?php

namespace Iquesters\UserInterface\Http\Controllers\Api\Meta;

use Iquesters\UserInterface\Constants\EntityStatus;
use Illuminate\Routing\Controller;
use Iquesters\UserInterface\Models\FormSchema;
use Illuminate\Support\Facades\Log;
use Iquesters\Foundation\System\Http\ApiResponse;
use Symfony\Component\HttpFoundation\Response;

class FormController extends Controller
{
    private function buildSchemaErrorResponse(\Throwable $e)
    {
        return ApiResponse::error(
            $e->getMessage(),
            Response::HTTP_OK,
            $e->getMessage()
        );
    }

    private function normalizeSchema(mixed $schema): mixed
    {
        if (is_string($schema)) {
            return json_decode($schema);
        }

        return $schema;
    }

    /**
     * Get form schema without authentication
     */
    public function getNoAuthFormSchema($slug)
    {
        Log::info("No Auth: Fetching form schema for slug: " . $slug);
        // As application is not ready so we decided not to use uid
        // return $this->getFormSchema($slug);

        // Now we have decdided to use by slug
        return $this->getFormSchemaBySlug($slug);
    }

    /**
     * Get form schema with authentication
     */
    public function getAuthFormSchema($slug)
    {
        return $this->getFormSchemaBySlug($slug);
    }

    /**
     * Common method to fetch form schema by slug
     */
    public function getFormSchemaBySlug($slug)
    {
        try {
            Log::info("Fetching form schema for slug: " . $slug);

            if (!$slug) {
                throw new \Exception('Form schema slug not found');
            }

            $form = FormSchema::where(['slug' => $slug, 'status' => EntityStatus::ACTIVE])->first();
            Log::info("Form schema result: " . json_encode($form));

            if (!$form) {
                throw new \Exception('Form schema not found');
            }

            return ApiResponse::success(
                $this->normalizeSchema($form->schema),
                'Form schema found'
            );
        } catch (\Throwable $e) {
            return $this->buildSchemaErrorResponse($e);
        }
    }

    /**
     * Common method to fetch form schema by uid
     */
    public function getFormSchema($uid)
    {
        try {
            Log::info("Fetching form schema for uid: " . $uid);

            if (!$uid) {
                throw new \Exception('Form schema ID not found');
            }

            $form = FormSchema::where(['uid' => $uid, 'status' => EntityStatus::ACTIVE])->first();

            if (!$form) {
                throw new \Exception('Form schema not found');
            }

            return ApiResponse::success(
                $this->normalizeSchema($form->schema),
                'Form schema found'
            );
        } catch (\Throwable $e) {
            return $this->buildSchemaErrorResponse($e);
        }
    }

}
