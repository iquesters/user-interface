<?php

namespace Iquesters\UserInterface;

use Diglactic\Breadcrumbs\Breadcrumbs;
use Illuminate\Support\Facades\View;
use Iquesters\Foundation\Contracts\SchemaModels;
use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Support\ConfProvider;
use Iquesters\Foundation\System\Providers\BaseServiceProvider;
use Iquesters\UserInterface\Install\InstallSteps;
use Iquesters\UserInterface\Models\FormSchema;
use Iquesters\UserInterface\Models\TableSchema;
use Iquesters\UserInterface\Support\Assets;
use Iquesters\UserInterface\Support\InfoPages;
use Iquesters\UserInterface\Support\NavigationMenu;
use Iquesters\UserInterface\Support\RecordComponents;
use Iquesters\UserInterface\Support\SetupLinkInjector;

/**
 * Migrations, views (userinterface::), routes/web.php (+ api.php), the
 * user-interface:seed command and the conf are loaded by BaseServiceProvider
 * via Package\UserInterfacePackageInfo. This class only adds what is specific
 * to the module.
 */
class UserInterfaceServiceProvider extends BaseServiceProvider
{
    public function register(): void
    {
        parent::register();

        // Module navigation is built once per request.
        $this->app->scoped(NavigationMenu::class);

        // Record components (table list / right panel), registered by key by the modules that own them.
        $this->app->singleton(RecordComponents::class);

        // Foundation's entity builder stores generated schemas in our models.
        $this->app->singleton(SchemaModels::class, fn () => new class implements SchemaModels
        {
            public function formSchemaModel(): string
            {
                return FormSchema::class;
            }

            public function tableSchemaModel(): string
            {
                return TableSchema::class;
            }
        });
    }

    public function boot(): void
    {
        parent::boot();

        if (class_exists(Breadcrumbs::class)) {
            require __DIR__.'/../routes/breadcrumbs.php';
        }

        Assets::registerRoutes();

        $this->app->instance('app.layout', ConfProvider::from(Module::USER_INFE)->app_layout);

        // Modules for the navigation, shared with every view (host-app views may
        // use it); loaded once per request by NavigationMenu.
        View::composer('*', fn ($view) => $view->with('installedModules', app(NavigationMenu::class)->modules()));

        // One-time: setup link + favicon in the app's home page (after routes exist).
        $this->app->booted(fn () => SetupLinkInjector::inject());

        // 'laravel-assets' is re-published by the app after every `composer update`.
        $this->publishes([
            __DIR__.'/../public' => public_path('vendor/userinterface'),
        ], ['laravel-assets', 'user-userinterface-assets']);

        // Help / Privacy / Terms templates, edited in the app (see Support\InfoPages).
        $this->publishes([
            __DIR__.'/../resources/views/pages' => resource_path('views/vendor/userinterface/pages'),
        ], InfoPages::PUBLISH_TAG);

        // composer install/update: publish Sanctum files and the page templates.
        $this->onPackageDiscover(fn () => InstallSteps::run());
    }

    /* Asset helpers, kept here because views call them on the provider. */

    public static function getLogoUrl(): string
    {
        return Assets::logoUrl();
    }

    public static function getCssUrl(string $file = 'css/app.css'): string
    {
        return Assets::url($file);
    }

    public static function getJsUrl(string $file = 'js/app.js'): string
    {
        return Assets::url($file);
    }

    public static function getCssAssets(): array
    {
        return Assets::cssAssets();
    }

    public static function getJsAssets(): array
    {
        return Assets::jsAssets();
    }

    public static function getCurrentTheme(): ?string
    {
        return Assets::currentTheme();
    }
}
