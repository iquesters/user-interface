<?php

/*
| DEPRECATED: unversioned aliases of the v1 API in routes/api.v1.php
| (/api/user-interface/v1/...). Kept for existing callers; the module's own JS
| uses the versioned URLs. Will be removed in a later release.
*/

use Illuminate\Support\Facades\Route;
use Iquesters\Foundation\Http\Controllers\DynamicEntityController;
use Iquesters\Foundation\System\Http\Middleware\RequestMiddleware;
use Iquesters\Foundation\System\Http\Middleware\ResponseMiddleware;
use Iquesters\UserInterface\Http\Controllers\Api\ComponentTemplateController;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\FormController;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\TableController;

/*
|--------------------------------------------------------------------------
| Public / No-Auth APIs
|--------------------------------------------------------------------------
| Accessible without authentication
*/

Route::get('ping', function () {
    return response()->json([
        'success' => true,
        'message' => 'API is alive',
    ]);
});

/*
|--------------------------------------------------------------------------
| Protected APIs - Sanctum tokens ONLY
|--------------------------------------------------------------------------
*/
Route::prefix('api')
    ->middleware([
        'api',
        RequestMiddleware::class,
        ResponseMiddleware::class,
    ])
    ->group(function () {
        // Public API (No Sanctum)
        Route::get('noauth/form/{slug}', [FormController::class, 'getNoAuthFormSchema'])
            ->name('noauth.form');

        // Protected APIs (Require Sanctum)
        Route::middleware('auth:sanctum')->group(function () {

            Route::get('auth/table/{slug}', [TableController::class, 'getAuthTableSchema'])
                ->name('auth.table');
        });

        // Deprecated: the entity API moved to foundation (/api/foundation/v1/entity/...).
        // Each action checks entity.{table}.{view|create|update|delete} (admins always pass).
        Route::middleware(['auth:sanctum'])->group(function () {

            Route::get('entity/list/{entity_name}', [DynamicEntityController::class, 'list'])
                ->name('api.entity.list');

            Route::post('entity/store/{entity_name}', [DynamicEntityController::class, 'store'])
                ->name('api.entity.store');

            Route::put('entity/update/{entity_name}/{data_uid}', [DynamicEntityController::class, 'update'])
                ->name('api.entity.update');

            Route::delete('entity/delete/{entity_name}/{data_uid}', [DynamicEntityController::class, 'delete'])
                ->name('api.entity.delete');

            Route::get('entity/show/{entity_name}/{data_uid}', [DynamicEntityController::class, 'show'])
                ->name('api.entity.show');
        });
    });

Route::prefix('api')
    ->middleware([
        'api',
        RequestMiddleware::class,
        ResponseMiddleware::class,
        'auth:sanctum',
    ])
    ->group(function () {
        Route::get('form/{slug}', [FormController::class, 'getFormSchema'])
            ->name('auth.form');

        Route::get('components/templates/{component}', [ComponentTemplateController::class, 'show'])
            ->name('api.components.template');

    });
