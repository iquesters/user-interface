<?php

use Illuminate\Support\Facades\Route;
use Iquesters\UserInterface\Http\Controllers\Meta\FormController;

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
});
