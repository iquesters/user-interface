<?php

use Illuminate\Support\Facades\Route;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\FormController;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\TableController;
use Iquesters\UserInterface\Http\Controllers\DynamicEntityController;
use Iquesters\UserInterface\Http\Controllers\UIController;

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

Route::middleware(['api'])->group(function () {
    Route::get('noauth/form/{slug}', [FormController::class, 'getNoAuthFormSchema'])
    ->name('noauth.form');
});
/*
|--------------------------------------------------------------------------
| Protected APIs - Sanctum tokens ONLY
|--------------------------------------------------------------------------
*/

Route::middleware(['api','auth:sanctum'])->group(function () {
    Route::get('api/auth/table/{slug}', [TableController::class, 'getAuthTableSchema'])
        ->name('auth.table');

    Route::get('form/{slug}', [FormController::class, 'getFormSchema'])
        ->name('auth.form');

    Route::post('form/save-form/{uid}', [FormController::class, 'saveformdata']);

    Route::get('api/entity/{entity}/{entity_uid?}', [DynamicEntityController::class, 'getEntityData']);

    Route::get('api/hola/{form_schema_id}/{entity_uid?}', [UIController::class, 'getHtmlComponent']);
});


// Route::get('form/{slug}', [FormController::class, 'show']);

// ApiRouteRegistry::register(
//     'GET',
//     'form/{slug}',
//     'iquesters/user-interface'
// );