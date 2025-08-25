<?php

namespace Iquesters\UserInterface;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

class UserInterfaceServiceProvider extends ServiceProvider
{
    public function boot()
    {
        Log::info("✅ UserInterface package loaded from src/");

        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'userinterface');
        // allow config publish
        $this->mergeConfigFrom(__DIR__.'/../config/userinterface.php', 'userinterface');
    }

    public function register()
    {
        //
    }
}
