<?php

namespace Iquesters\userinterface;

use Illuminate\Support\ServiceProvider;

class UserInterfaceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/masterdata.php', 'masterdata');
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'masterdata');

        $this->publishes([
            __DIR__ . '/../config/masterdata.php' => config_path('masterdata.php'),
        ], 'masterdata-config');
    }
}