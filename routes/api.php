<?php

use Illuminate\Support\Facades\Route;
use Iquesters\UserInterface\Http\Controllers\Meta\FormController;

Route::post('/form/save-form/{uid}', [FormController::class, 'saveformdata']);
