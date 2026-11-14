<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Facades\File;
use Iquesters\UserInterface\Tests\TestCase;
use Iquesters\UserInterface\UserInterfaceServiceProvider;
use PHPUnit\Framework\Attributes\DataProvider;

class AssetRouteTest extends TestCase
{
    public function test_serves_module_assets(): void
    {
        $this->get('/vendor/userinterface/js/form/form.js')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/javascript');
    }

    public static function traversal(): array
    {
        return [
            ['/module-assets/userinterface/..%2Fcomposer.json'],
            ['/module-assets/userinterface/%2E%2E/composer.json'],
            ['/module-assets/userinterface/js/..%2F..%2Fcomposer.json'],
            ['/module-assets/userinterface/..%2F..%2F..%2F.env'],
            ['/module-assets/userinterface/..%2Fsrc%2FUserInterfaceServiceProvider.php'],
            ['/vendor/userinterface/..%2Fcomposer.json'],
            ['/vendor/userinterface/..%2F..%2F..%2F.env'],
        ];
    }

    public function test_url_uses_fallback_route_until_assets_are_published(): void
    {
        $publishedDir = public_path('vendor/userinterface');
        File::deleteDirectory($publishedDir);

        try {
            $url = UserInterfaceServiceProvider::getJsUrl('js/form/form.js');
            $this->assertStringContainsString('/module-assets/userinterface/js/form/form.js', $url);
            $this->get(parse_url($url, PHP_URL_PATH))->assertOk();

            // Published and current -> static URL served by the web server.
            File::ensureDirectoryExists("{$publishedDir}/js/form");
            $source = dirname(__DIR__, 2) . '/public/js/form/form.js';
            File::copy($source, "{$publishedDir}/js/form/form.js");
            touch("{$publishedDir}/js/form/form.js", filemtime($source) + 10);

            $url = UserInterfaceServiceProvider::getJsUrl('js/form/form.js');
            $this->assertStringContainsString('/vendor/userinterface/js/form/form.js?v=' . filemtime($source), $url);

            // Stale copy (module updated after publishing) -> fallback again.
            touch("{$publishedDir}/js/form/form.js", filemtime($source) - 10);
            $this->assertStringContainsString('/module-assets/', UserInterfaceServiceProvider::getJsUrl('js/form/form.js'));
        } finally {
            File::deleteDirectory($publishedDir);
        }
    }

    #[DataProvider('traversal')]
    public function test_cannot_read_files_outside_public(string $uri): void
    {
        $this->get($uri)->assertNotFound();
    }
}
