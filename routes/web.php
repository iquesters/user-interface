<?php

use Illuminate\Support\Facades\Route;
use Iquesters\UserInterface\Http\Controllers\InfoPageController;
use Iquesters\UserInterface\Http\Controllers\Meta\FormController;
use Iquesters\UserInterface\Http\Controllers\Meta\TableSchemaController;
use Iquesters\UserInterface\Http\Controllers\UIController;

Route::middleware(['web'])->group(function () {
    // Public info pages; templates are published to the app (see Support\InfoPages).
    Route::get('/help', [InfoPageController::class, 'help'])->name('ui.help');
    Route::get('/privacy-policy', [InfoPageController::class, 'privacy'])->name('ui.privacy');
    Route::get('/terms-conditions', [InfoPageController::class, 'terms'])->name('ui.terms');

    Route::middleware(['auth'])->group(function () {

        // domain/list/{table_schema_id}
        // domain/view/{form_schema_id}/{entity_uid}
        // domain/edit/{form_schema_id}/- this is create mode
        // domain/edit/{form_schema_id}/{entity_uid}
        // domain/delete/{form_schema_id}/{entity_uid}
        // Generic entity screens are shells; their data comes from the entity API,
        // which enforces per-entity permissions.
        Route::prefix('')->name('ui')->group(function () {
            Route::get('/list/{default_table_schema_uid}', [UIController::class, 'list'])->name('.list');
            // The same list page with a record (or the create form) open:
            // /list/{table}/{view|edit}/form/{form}/data/{uid} or /create/form/{form};
            // the view mode is ?mode=table|split. The page's JS opens it, and
            // keeps the URL in step without reloads.
            Route::get('/list/{default_table_schema_uid}/{record}', [UIController::class, 'list'])
                ->where('record', '(view|edit)/form/[^/]+/data/[^/]+|create/form/[^/]+')
                ->name('.list.record');
            // Currently, entity_uid is optional for View routes but will be used in the future.
            Route::get('/view/{form_schema_id}/{entity_uid?}', [UIController::class, 'view'])->name('.view');
            Route::get('/edit/{form_schema_id}/{entity_uid?}', [UIController::class, 'edit'])->name('.edit');
            Route::get('/delete/{form_schema_id}/{entity_uid}', [UIController::class, 'delete'])->name('.delete');
        });

        Route::get('/theme', [UIController::class, 'setTheme'])->name('ui.theme');

        Route::prefix('form')->name('form')->middleware('ensure.admin')->group(function () {
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
        });

        Route::prefix('table')->name('table')->middleware('ensure.admin')->group(function () {
            Route::get('/list', [TableSchemaController::class, 'list'])->name('.list');
            Route::get('/create', [TableSchemaController::class, 'create'])->name('.create');
            Route::post('/store', [TableSchemaController::class, 'store'])->name('.store');
            Route::get('/{id}/overview', [TableSchemaController::class, 'overview'])->name('.overview');
            Route::get('/{id}/update', [TableSchemaController::class, 'update'])->name('.update');
            Route::post('/{id}/update', [TableSchemaController::class, 'update'])->name('.update.schema');
            Route::get('/{id}/delete', [TableSchemaController::class, 'delete'])->name('.delete');
        });

    });
});

require __DIR__.'/api.php';
