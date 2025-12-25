<?php

namespace Iquesters\UserInterface;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Console\Command;
use Iquesters\UserInterface\Database\Seeders\UserInterfaceSeeder;
use Iquesters\Foundation\Support\ConfProvider;
use Iquesters\Foundation\Enums\Module as ModuleEnum;
use Iquesters\UserManagement\Config\UserManagementConf;
use Iquesters\UserInterface\Config\UserInterfaceConf;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Schema;
use Iquesters\Foundation\Models\Module;
use Iquesters\Foundation\Models\Navigation;
use Iquesters\UserManagement\UserManagementServiceProvider;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;
use Iquesters\UserManagement\Models\UserMeta;
use Illuminate\Support\Facades\Log;

class UserInterfaceServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Register User Interface configuration
        ConfProvider::register(ModuleEnum::USER_INFE, UserInterfaceConf::class);

        // Register seeder command
        $this->registerSeedCommand();

        //  Conditionally register UserManagement package if available
        if (class_exists(UserManagementServiceProvider::class)) {
            ConfProvider::register(ModuleEnum::USER_MGMT, UserManagementConf::class);
        }
    }

    public function boot()
    {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        $this->loadMigrationsFrom(__DIR__ . '/../database/migrations');
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'userinterface');
        
        // allow config publish
        $this->mergeConfigFrom(__DIR__.'/../config/userinterface.php', 'userinterface');
        $this->registerAssetRoute();

        $uiConf = ConfProvider::from(ModuleEnum::USER_INFE);
        if (method_exists($uiConf, 'loadConfigOnce')) {
            $uiConf->ensureLoaded();
        }

        // Now safely access the auth_layout property
        $layout = $uiConf->app_layout;

        $this->app->instance('app.layout', $layout);
        
        if ($this->app->runningInConsole()) {
            $this->commands([
                'command.user-interface.seed'
            ]);
            
            // Auto-publish Sanctum files during package discovery
            $this->autoPublishSanctumFiles();
        }

        // Defer until routes are ready
        $this->app->booted(function () {
            \Iquesters\UserInterface\Support\SetupLinkInjector::inject();
        });

        // Share installed modules globally
        $this->shareInstalledModules();

        $this->publishes([
            __DIR__ . '/../public' => public_path('vendor/userinterface'),
        ], 'user-userinterface-assets');
    }

    /**
     * Auto-publish Sanctum migrations AND config
     */
    protected function autoPublishSanctumFiles(): void
    {
        // Only run during package discovery
        if (!$this->isDuringPackageDiscovery()) {
            return;
        }

        // Use deferred execution
        $this->app->booted(function () {
            $this->publishSanctumFilesNow();
        });
    }

    /**
     * Check if we're during package discovery
     */
    protected function isDuringPackageDiscovery(): bool
    {
        return isset($_SERVER['argv'][1]) && $_SERVER['argv'][1] === 'package:discover';
    }

    /**
     * Actually publish the Sanctum migrations AND config
     */
    protected function publishSanctumFilesNow(): void
    {
        // Check if Sanctum is available
        if (!class_exists(\Laravel\Sanctum\SanctumServiceProvider::class)) {
            echo "⚠️  Laravel Sanctum package is not installed." . PHP_EOL;
            echo "📝 Please install it via: composer require laravel/sanctum" . PHP_EOL . PHP_EOL;
            return;
        }

        $migrationPath = database_path('migrations');
        $configPath = config_path('sanctum.php');

        // Check if Sanctum migrations are already published
        $sanctumFiles = glob($migrationPath . '/*_create_personal_access_tokens_table.php');
        $configExists = file_exists($configPath);

        // Check if tables already exist in database
        $tablesExist = false;
        try {
            $tablesExist = Schema::hasTable('personal_access_tokens');
        } catch (\Exception $e) {
            // Database might not be available
        }

        if ($tablesExist) {
            echo " Sanctum tables already exist in database." . PHP_EOL;
            return;
        }

        if (!empty($sanctumFiles) && $configExists) {
            echo " Sanctum migrations and config already published." . PHP_EOL;
            echo "📋 You can now run 'php artisan migrate' to create the Sanctum tables." . PHP_EOL . PHP_EOL;
            return;
        }

        // Use Artisan command to publish Sanctum
        try {
            Artisan::call('vendor:publish', [
                '--provider' => 'Laravel\Sanctum\SanctumServiceProvider',
                '--force' => true
            ]);

            echo " Sanctum files published successfully!" . PHP_EOL;
            echo "📋 You can now run 'php artisan migrate' to create the Sanctum tables." . PHP_EOL . PHP_EOL;
            
        } catch (\Exception $e) {
            echo "⚠️  Could not automatically publish Sanctum files: " . $e->getMessage() . PHP_EOL;
            echo "📝 Please run manually:" . PHP_EOL;
            echo "   php artisan vendor:publish --provider=\"Laravel\Sanctum\SanctumServiceProvider\"" . PHP_EOL;
            echo "   php artisan migrate" . PHP_EOL . PHP_EOL;
        }
    }

    protected function registerSeedCommand(): void
    {
        $this->app->singleton('command.user-interface.seed', function ($app) {
            return new class extends Command {
                protected $signature = 'user-interface:seed';
                protected $description = 'Seed User Interface module data';

                public function handle()
                {
                    $this->info('Running User Interface Seeder...');
                    $seeder = new UserInterfaceSeeder();
                    $seeder->setCommand($this);
                    $seeder->run();
                    $this->info('User Interface seeding completed!');
                    return 0;
                }
            };
        });
    }
    
    protected function registerAssetRoute(): void
    {
        Route::get('/vendor/userinterface/{path}', function ($path) {
            $filePath = __DIR__ . '/../public/' . $path;

            if (!file_exists($filePath)) {
                abort(404);
            }

            $mimeTypes = [
                'css' => 'text/css',
                'js' => 'application/javascript',
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'svg' => 'image/svg+xml',
                'ico' => 'image/x-icon',
                'woff' => 'font/woff',
                'woff2' => 'font/woff2',
                'ttf' => 'font/ttf',
                'eot' => 'application/vnd.ms-fontobject',
            ];

            $extension = pathinfo($filePath, PATHINFO_EXTENSION);
            $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

            $cacheControl = in_array($extension, ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'eot'])
                ? 'public, max-age=31536000'
                : 'no-cache';

            return response()->file($filePath, [
                'Content-Type' => $mimeType,
                'Cache-Control' => $cacheControl,
            ]);
        })->where('path', '.*')->name('userinterface.asset');
    }
    
    /**
     * Share installed modules with all views.
     */
    // protected function shareInstalledModules(): void
    // {
    //     View::composer('*', function ($view) {
    //         $modules = collect();
            
    //         if (Schema::hasTable('modules') && Auth::check()) {
    //             $user = Auth::user();
    //             $modules = Module::getForUser($user);
    //         }

    //         $view->with('installedModules', $modules);
    //     });
    // }
    protected function shareInstalledModules(): void
    {
        View::composer('*', function ($view) {

            $modules = collect();

            /**
             * Safety checks
             */
            if (
                !Auth::check() ||
                !Schema::hasTable('modules') ||
                !Schema::hasTable('navigations') ||
                !Schema::hasTable('navigation_metas')
            ) {
                $view->with('installedModules', $modules);
                return;
            }

            try {
                $user = Auth::user();

                /**
                 * Fully-qualified package models
                 */
                $moduleModel = Module::class;
                $navigationModel = Navigation::class;

                /**
                 * STEP 1: Get user-accessible modules
                 */
                $modules = $moduleModel::getForUser($user)->values();

                if ($modules->isEmpty()) {
                    $view->with('installedModules', collect());
                    return;
                }

                $moduleIds = $modules->pluck('id')->toArray();

                /**
                 * STEP 2: Fetch primary navigation order
                 */
                $navigation = $navigationModel::where(
                    'name',
                    'primary_navigation'
                )->first();

                $savedOrder = [];

                if ($navigation) {
                    $savedOrder = json_decode(
                        $navigation->getMeta('navigation_order') ?? '[]',
                        true
                    );
                }

                $savedOrder = is_array($savedOrder) ? $savedOrder : [];

                /**
                 * STEP 3: Clean invalid / old module IDs
                 */
                $savedOrder = array_values(
                    array_intersect($savedOrder, $moduleIds)
                );

                /**
                 * STEP 4: Append new modules
                 */
                $newModules = array_diff($moduleIds, $savedOrder);
                $finalOrder = array_merge($savedOrder, $newModules);

                /**
                 * STEP 5: Build ordered module collection
                 */
                $orderedModules = collect($finalOrder)
                    ->map(fn ($id) => $modules->firstWhere('id', $id))
                    ->filter()
                    ->values();

                /**
                 * STEP 6: Share globally
                 */
                $view->with('installedModules', $orderedModules);

            } catch (\Throwable $e) {
                /**
                 * Fail silently to avoid breaking views
                 */
                logger()->warning('Navigation shareInstalledModules failed', [
                    'error' => $e->getMessage(),
                ]);

                $view->with('installedModules', collect());
            }
        });
    }
    
    /**
     * Get the logo URL - works with both package assets and custom paths
     */
    public static function getLogoUrl(): string
    {
        $customLogo = ConfProvider::from(ModuleEnum::USER_INFE)->logo;

        // If it's a full URL, return as is
        if (filter_var($customLogo, FILTER_VALIDATE_URL)) {
            return $customLogo;
        }

        // If it's an absolute path (starts with /), return as is
        if (str_starts_with($customLogo, '/')) {
            return $customLogo;
        }
        
        // Check if file actually exists in public/
        $publicPath = public_path($customLogo);
        if (file_exists($publicPath)) {
            return asset($customLogo);
        }

        // If it contains "::" format, convert to path
        if (str_contains($customLogo, '::')) {
            $path = str_replace('::', '/', $customLogo);
            return route('userinterface.asset', ['path' => $path]);
        }

        // For regular relative paths, use the asset route
        return route('userinterface.asset', ['path' => ltrim($customLogo, '/')]);
    }


    /**
     * Get version string for cache-busting
     */
    public static function getAssetVersion(string $file): string
    {
        $path = base_path('packages/Iquesters/UserInterface/public/' . $file);

        if (file_exists($path)) {
            return (string) filemtime($path);
        }

        // fallback version if file not found
        return (string) time();
    }


    /**
     * Get the CSS URL for the package
     */
    public static function getCssUrl(string $file = 'css/app.css',bool $defaultcache = true): string
    {
        return route('userinterface.asset', ['path' => $file]);
        // $params = ['path' => $file];

        // if ($defaultcache) {
        //     $params['v'] = self::getAssetVersion($file);
        // }

        // return route('userinterface.asset', $params);
    }
    
    /**
     * Get the JS URL for the package
     */
    public static function getJsUrl(string $file = 'js/app.js',bool $defaultcache = true): string
    {
        return route('userinterface.asset', ['path' => $file]);
        // $params = ['path' => $file];

        // if ($defaultcache) {
        //     $params['v'] = self::getAssetVersion($file);
        // }

        // return route('userinterface.asset', $params);
    }


    /**
     * Get the current theme from MasterData
     */
    public static function getCurrentTheme(): ?string
    {
        try {
            $user = Auth::user();

            $userTheme = null;
            // Check user-specific theme
            if ($user) {
                $userTheme = UserMeta::where('ref_parent', $user->id)
                    ->where('meta_key', 'theme')
                    ->where('status', 'active')
                    ->first(); 

                if (!empty($userTheme)) {
                    return $userTheme->meta_value;
                }
            }

            // Check MasterData global theme
            $themeData = \Iquesters\Foundation\Models\MasterData::where([
                ['key', '=', 'current_theme'],
                ['status', '=', \Iquesters\Foundation\Constants\EntityStatus::ACTIVE],
            ])->first();

            if (!empty($themeData)) {
                return $themeData->value;
            }
            return $userTheme;
        } catch (\Exception $e) {
            Log::error('Failed to get user theme', ['error' => $e->getMessage()]);
            return 'default';
        }
    }

}