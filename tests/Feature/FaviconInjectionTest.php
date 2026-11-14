<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Iquesters\UserInterface\Support\SetupLinkInjector;
use Iquesters\UserInterface\Tests\TestCase;

class FaviconInjectionTest extends TestCase
{
    private string $view;
    private ?string $original = null;
    private string $flag;

    protected function setUp(): void
    {
        parent::setUp();

        $this->view = resource_path('views/welcome.blade.php');
        $this->flag = storage_path('app/iquesters_ui_favicon.flag');
        $this->original = File::exists($this->view) ? File::get($this->view) : null;

        File::ensureDirectoryExists(dirname($this->view));
        File::put($this->view, "<!DOCTYPE html>\n<html>\n    <head>\n        <title>App</title>\n    </head>\n    <body>Home</body>\n</html>\n");
        File::delete($this->flag);

        Route::get('/', fn () => view('welcome'));
    }

    protected function tearDown(): void
    {
        $this->original === null ? File::delete($this->view) : File::put($this->view, $this->original);
        File::delete($this->flag);

        parent::tearDown();
    }

    public function test_home_page_gets_the_module_favicon_once(): void
    {
        $method = new \ReflectionMethod(SetupLinkInjector::class, 'injectFavicon');

        $method->invoke(null);
        $method->invoke(null);
        File::delete($this->flag);
        $method->invoke(null); // marker present -> still injected only once

        $content = File::get($this->view);
        $this->assertSame(2, substr_count($content, '<!-- IQUESTERS-FAVICON -->'));
        $this->assertMatchesRegularExpression('/<head>\s*<!-- IQUESTERS-FAVICON -->/', $content);

        $this->get('/')->assertOk()->assertSee('rel="icon"', false)->assertSee('img/favicon.png', false);
    }
}
