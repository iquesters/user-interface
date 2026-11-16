<?php

/*
|--------------------------------------------------------------------------
| User Interface API v1  →  /api/user-interface/v1/...
|--------------------------------------------------------------------------
| Loaded by foundation's ModuleApi (declared in composer.json extra.platform.api),
| which adds the /api/user-interface/v1 prefix, the api + request/response
| middleware, the rate limit and the "api.user-interface.v1." name prefix.
|
| The unversioned /api/... routes in routes/api.php are deprecated aliases.
*/

use Illuminate\Support\Facades\Route;
use Iquesters\UserInterface\Http\Controllers\Api\ComponentTemplateController;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\FormController;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\TableController;
use Iquesters\UserInterface\Http\Controllers\DynamicEntityController;

// Public: form schemas used before login (login, register, setup).
Route::get('noauth/form/{slug}', [FormController::class, 'getNoAuthFormSchema'])->name('noauth.form');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('form/{slug}', [FormController::class, 'getFormSchema'])->name('form');
    Route::get('auth/table/{slug}', [TableController::class, 'getAuthTableSchema'])->name('table');
    Route::get('components/templates/{component}', [ComponentTemplateController::class, 'show'])->name('components.template');

    // Generic entity CRUD. Each action checks entity.{table}.{view|create|update|delete}
    // (admins always pass) inside DynamicEntityController.
    Route::prefix('entity')->name('entity.')->group(function () {
        Route::get('list/{entity_name}', [DynamicEntityController::class, 'list'])->name('list');
        Route::get('show/{entity_name}/{data_uid}', [DynamicEntityController::class, 'show'])->name('show');
        Route::post('store/{entity_name}', [DynamicEntityController::class, 'store'])->name('store');
        Route::put('update/{entity_name}/{data_uid}', [DynamicEntityController::class, 'update'])->name('update');
        Route::delete('delete/{entity_name}/{data_uid}', [DynamicEntityController::class, 'delete'])->name('delete');
    });
});
