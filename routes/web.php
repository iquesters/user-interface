<?php

use Illuminate\Support\Facades\Route;
use Iquesters\UserInterface\Http\Controllers\Meta\FormController;
use Iquesters\UserInterface\Http\Controllers\Meta\TableSchemaController;
use Iquesters\UserInterface\Http\Controllers\UIController;


Route::middleware(['web'])->group(function () {
    Route::middleware(['auth'])->group(function () {

        // domain/list/{table_schema_id}
        // domain/view/{form_schema_id}/{entity_uid}
        // domain/edit/{form_schema_id}/- this is create mode
        // domain/edit/{form_schema_id}/{entity_uid}
        // domain/delete/{form_schema_id}/{entity_uid}
        Route::prefix('')->name('ui')->group(function () {
            Route::get('/list/{table_schema_id}', [UIController::class, 'list'])->name('.list');
            Route::get('/view/{form_schema_id}/{entity_uid}', [UIController::class, 'view'])->name('.view');
            Route::get('/edit/{form_schema_id}/{entity_uid?}', [UIController::class, 'edit'])->name('.edit');
            Route::get('/delete/{form_schema_id}/{entity_uid}', [UIController::class, 'delete'])->name('.delete');
        });

        Route::get('/pkg-test', function () {
            return "✅ User Interface Package is working!";
        });

    Route::prefix('form')->name('form')->group(function () {
        Route::get('/list', [FormController::class, 'list'])->name('.list');
        Route::get('/create', [FormController::class, 'create'])->name('.create');
        Route::post('/store', [FormController::class, 'store'])->name('.store');
        Route::get('/{id}/overview', [FormController::class, 'overview'])->name('.overview');
        Route::get('/{id}/update', [FormController::class, 'update'])->name('.update');
        Route::post('/{id}/update', [FormController::class, 'update'])->name('.update.schema');
        Route::get('/{id}/delete', [FormController::class, 'delete'])->name('.delete');


        Route::get('/formCreation/{id}', [FormController::class, 'formCreation'])->name('.formCreation');
        Route::post('/formsubmit/{uid}', [FormController::class, 'formsubmit'])->name('.formsubmit');
        Route::get('/formCreation_new/{id}', [FormController::class, 'formCreation_new'])->name('.formCreation_new');

        Route::get('/submitAndSave/{uid}', [FormController::class, 'submitAndSave'])->name('.submitAndSave');
    });

    Route::prefix('table')->name('table')->group(function () {
        Route::get('/list', [TableSchemaController::class, 'list'])->name('.list');
        Route::get('/create', [TableSchemaController::class, 'create'])->name('.create');
        Route::post('/store', [TableSchemaController::class, 'store'])->name('.store');
        Route::get('/{id}/overview', [TableSchemaController::class, 'overview'])->name('.overview');
        Route::get('/{id}/update', [TableSchemaController::class, 'update'])->name('.update');
        Route::post('/{id}/update', [TableSchemaController::class, 'update'])->name('.update.schema');
        Route::get('/{id}/delete', [TableSchemaController::class, 'delete'])->name('.delete');
    });


    // Route::get('userinterface/assets/{path}', function ($path) {
    //     $file = __DIR__ . '/../public/' . $path;

    //     if (!File::exists($file)) {
    //         abort(404);
    //     }

    //     return response()->file($file);
    // })->where('path', '.*')->name('userinterface.asset');

    });
});

require __DIR__ . '/api.php';