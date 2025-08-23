<?php

namespace Iquesters\userinterface;

use Illuminate\Support\ServiceProvider;

class UserInterfaceServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/userinterface.php', 'userinterface');
    }

    public function boot(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../routes/web.php');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'userinterface');

        $this->publishes([
            __DIR__ . '/../config/userinterface.php' => config_path('userinterface.php'),
        ], 'userinterface-config');
    }
}