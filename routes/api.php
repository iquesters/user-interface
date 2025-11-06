<?php

use Illuminate\Support\Facades\Route;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\FormController;
use Iquesters\UserInterface\Http\Controllers\Api\Meta\TableController;
use Iquesters\UserInterface\Http\Controllers\DynamicEntityController;

// Public API routes with security middleware
Route::middleware(['api'])->prefix('api')->group(function () {
    Route::get('/noauth/form/{slug}', [FormController::class, 'getNoAuthFormSchema'])->name('noauth.form');
});

// Protected API routes - Sanctum tokens ONLY
Route::prefix('api')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/auth/table/{slug}', [TableController::class, 'getAuthTableSchema'])->name('auth.table');
    Route::get('/form/{slug}', [FormController::class, 'getFormSchema'])->name('auth.form');
    Route::post('/form/save-form/{uid}', [FormController::class, 'saveformdata']);
    
    Route::get('/entity/{entity}/{entity_uid?}', [DynamicEntityController::class, 'getEntityData']);
    
});