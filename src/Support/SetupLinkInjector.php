<?php

namespace Iquesters\UserInterface\Support;

use Iquesters\Foundation\System\Traits\Loggable;
use Illuminate\Support\Facades\Route;

class SetupLinkInjector
{
    use Loggable;

    public static function inject(): void
    {
        static::injectFavicon();

        $flagPath = storage_path('app/iquesters_ui_installed.flag');
        $marker = '<!-- IQUESTERS-SETUP-LINK -->';
        // Log::info('[UserInterface] SetupLinkInjector::inject() called.');

        if (file_exists($flagPath)) {
            // Log::info('[UserInterface] Injection already done — skipping.');
            return;
        }

        $viewName = static::detectRootView();
        $viewPath = resource_path("views/{$viewName}.blade.php");

        if (!file_exists($viewPath)) {
            static::logWarning("[UserInterface] View {$viewName}.blade.php not found. Creating one...");
            static::createDefaultWelcomeView($viewPath);
            static::createDefaultRoute();
        }

        $content = file_get_contents($viewPath);

        if (strpos($content, $marker) !== false) {
            static::logInfo('[UserInterface] Marker already exists — skipping injection.');
            return;
        }

        $insert = <<<BLADE
        $marker
        {{-- iQuesters Setup Link --}}
        @if(View::exists('userinterface::components.setup-link'))
            @include('userinterface::components.setup-link')
        @endif
        $marker

        BLADE;

        if (preg_match('/<body[^>]*>/i', $content)) {
            $newContent = preg_replace('/(<body[^>]*>)/i', "$1\n$insert", $content, 1);
        } else {
            $newContent = $insert . $content;
        }

        file_put_contents($viewPath, $newContent);
        file_put_contents($flagPath, 'done');

        static::logInfo("[UserInterface] Setup link successfully injected into {$viewName}.blade.php");
    }

    /**
     * Point the host app's home page favicon at the module's favicon (once).
     * Separate marker + flag, so installs that already got the setup link get it too.
     */
    protected static function injectFavicon(): void
    {
        $flagPath = storage_path('app/iquesters_ui_favicon.flag');
        $marker = '<!-- IQUESTERS-FAVICON -->';

        if (file_exists($flagPath)) {
            return;
        }

        $viewPath = resource_path('views/' . static::detectRootView() . '.blade.php');

        if (! file_exists($viewPath)) {
            return; // created by inject() below; picked up on the next request
        }

        $content = file_get_contents($viewPath);

        if (str_contains($content, $marker)) {
            file_put_contents($flagPath, 'done');
            return;
        }

        if (! preg_match('/<head[^>]*>/i', $content)) {
            return;
        }

        $link = <<<'BLADE'
        <!-- IQUESTERS-FAVICON -->
        @if (class_exists(\Iquesters\UserInterface\UserInterfaceServiceProvider::class))
            <link rel="icon" type="image/png" href="{{ \Iquesters\UserInterface\UserInterfaceServiceProvider::getJsUrl('img/favicon.png') }}">
        @endif
        <!-- IQUESTERS-FAVICON -->
        BLADE;

        file_put_contents($viewPath, preg_replace('/(<head[^>]*>)/i', '$1' . "\n" . $link, $content, 1));
        file_put_contents($flagPath, 'done');

        static::logInfo('[UserInterface] Favicon link injected into the home page.');
    }

    protected static function detectRootView(): string
    {
        foreach (Route::getRoutes() as $route) {
            if ($route->uri() === '/') {
                try {
                    $action = $route->getAction('uses');
                    if (is_callable($action)) {
                        $response = call_user_func($action);
                        if ($response instanceof \Illuminate\View\View) {
                            return $response->getName();
                        }
                    }
                } catch (\Throwable $e) {
                    static::logWarning('[UserInterface] Failed to detect root view: ' . $e->getMessage());
                }
            }
        }

        return 'welcome'; // fallback
    }

    protected static function createDefaultRoute(): void
    {
        $webPath = base_path('routes/web.php');
        $content = file_exists($webPath) ? file_get_contents($webPath) : '';

        if (strpos($content, "Route::get('/',") === false) {
            file_put_contents($webPath, $content . "\nRoute::get('/', fn() => view('welcome'));\n");
            static::logInfo('[UserInterface] Default "/" route created.');
        }
    }

    protected static function createDefaultWelcomeView(string $path): void
    {
        $html = <<<HTML
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Welcome</title>
        </head>
        <body>
            <h1>Welcome to Laravel</h1>
        </body>
        </html>
        HTML;

        @mkdir(dirname($path), 0755, true);
        file_put_contents($path, $html);
        static::logInfo('[UserInterface] Default welcome view created.');
    }
}