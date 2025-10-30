<?php

namespace Iquesters\UserInterface\Support;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

class SetupLinkInjector
{
    public static function inject(): void
    {
        $flagPath = storage_path('app/iquesters_ui_installed.flag');
        $marker = '<!-- IQUESTERS-SETUP-LINK -->';
        Log::info('[UserInterface] SetupLinkInjector::inject() called.');

        if (file_exists($flagPath)) {
            Log::info('[UserInterface] Injection already done — skipping.');
            return;
        }

        $viewName = static::detectRootView();
        $viewPath = resource_path("views/{$viewName}.blade.php");

        if (!file_exists($viewPath)) {
            Log::warning("[UserInterface] View {$viewName}.blade.php not found. Creating one...");
            static::createDefaultWelcomeView($viewPath);
            static::createDefaultRoute();
        }

        $content = file_get_contents($viewPath);

        if (strpos($content, $marker) !== false) {
            Log::info('[UserInterface] Marker already exists — skipping injection.');
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

        Log::info("[UserInterface] Setup link successfully injected into {$viewName}.blade.php");
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
                    Log::warning('[UserInterface] Failed to detect root view: ' . $e->getMessage());
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
            Log::info('[UserInterface] Default "/" route created.');
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
        Log::info('[UserInterface] Default welcome view created.');
    }
}