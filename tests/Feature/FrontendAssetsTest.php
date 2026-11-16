<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Support\ConfProvider;
use Iquesters\UserInterface\Support\Assets;
use Iquesters\UserInterface\Support\VendorLibraries;
use Iquesters\UserInterface\Tests\TestCase;

class FrontendAssetsTest extends TestCase
{
    private function setVendorAssets(string $source): void
    {
        ConfProvider::from(Module::USER_INFE)->vendor_assets = $source;
    }

    public function test_every_listed_library_is_shipped_locally(): void
    {
        foreach (VendorLibraries::all() as $lib) {
            $this->assertFileExists(Assets::publicPath() . '/libs/' . $lib['local'], "Run `npm run libs` ({$lib['name']}).");
        }
    }

    public function test_libraries_are_self_hosted_by_default(): void
    {
        $html = VendorLibraries::scripts()->toHtml() . VendorLibraries::styles()->toHtml();

        $this->assertStringContainsString('/libs/jquery/3.7.0/jquery.min.js', $html);
        $this->assertStringNotContainsString('https://code.jquery.com', $html);
        $this->assertStringContainsString('integrity="sha384-', $html);
    }

    public function test_cdn_source_uses_the_cdn_urls(): void
    {
        $this->setVendorAssets('cdn');

        $this->assertStringContainsString('https://code.jquery.com/jquery-3.7.0.min.js', VendorLibraries::scripts()->toHtml());
    }

    public function test_auth_pages_skip_table_and_json_editor_libraries(): void
    {
        $html = VendorLibraries::scripts(isAuthPage: true)->toHtml() . VendorLibraries::styles(isAuthPage: true)->toHtml();

        $this->assertStringNotContainsString('datatables', $html);
        $this->assertStringNotContainsString('jsoneditor', $html);
        $this->assertStringContainsString('bootstrap.bundle.min.js', $html);
    }

    public function test_bundle_is_used_only_when_debug_is_off(): void
    {
        config(['app.debug' => true]);
        $this->assertNull(Assets::jsBundleUrl());

        config(['app.debug' => false]);
        $this->assertStringContainsString('dist/userinterface.js', (string) Assets::jsBundleUrl());
    }

    public function test_bundle_contains_every_script_in_load_order(): void
    {
        $manifest = json_decode(file_get_contents(Assets::publicPath() . '/dist/manifest.json'), true);

        $this->assertSame(
            array_column(Assets::jsAssets(), 'path'),
            $manifest['sources'],
            'The bundle is out of date or its order differs from the layout: run `npm run build`.'
        );
    }
}
