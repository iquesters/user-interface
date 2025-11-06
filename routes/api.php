<?php

use Illuminate\Support\Facades\Route;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\FormController;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\TableController;

Route::middleware(['api'])->prefix('api')->group(function () {
    Route::get('/noauth/form/{slug}', [FormController::class, 'getNoAuthFormSchema'])->name('noauth.form');
    Route::get('/noauth/table/{slug}', [TableController::class, 'getNoAuthTableSchema'])->name('noauth.table');

    Route::middleware(['auth'])->group(function () {
        Route::get('/form/{slug}', [FormController::class, 'getFormSchema'])->name('auth.form');
        Route::post('/form/save-form/{uid}', [FormController::class, 'saveformdata']);
    });
});