<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;
use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Support\ConfProvider;
use Iquesters\UserInterface\Install\InstallSteps;
use Iquesters\UserInterface\Support\InfoPages;
use Iquesters\UserInterface\Tests\TestCase;
use PHPUnit\Framework\Attributes\DataProvider;

class InfoPagesTest extends TestCase
{
    public static function pages(): array
    {
        return [
            'help' => ['/help', 'Help'],
            'privacy' => ['/privacy-policy', 'Privacy Policy'],
            'terms' => ['/terms-conditions', 'Terms &amp; Conditions'],
        ];
    }

    #[DataProvider('pages')]
    public function test_pages_are_public(string $uri, string $heading): void
    {
        $this->get($uri)->assertOk()->assertSee($heading, false);
    }

    public function test_template_notice_is_hidden_from_visitors_of_a_live_site(): void
    {
        config(['app.debug' => false]);
        $this->get('/privacy-policy')->assertOk()->assertDontSee('Template page.');

        config(['app.debug' => true]);
        $this->get('/privacy-policy')->assertOk()->assertSee('Template page.');

        config(['app.debug' => false]);
        $this->actingAs($this->makeUser('super-admin'));
        $this->get('/privacy-policy')->assertOk()->assertSee('Template page.');
    }

    public function test_links_use_the_app_pages_unless_an_external_url_is_set(): void
    {
        $this->assertSame(route('ui.terms'), InfoPages::url('terms'));
        $this->assertFalse(InfoPages::isExternal('terms'));

        ConfProvider::from(Module::USER_INFE)->update(['terms_url' => 'https://example.com/terms']);

        $this->assertSame('https://example.com/terms', InfoPages::url('terms'));
        $this->assertTrue(InfoPages::isExternal('terms'));
        $this->get('/help')->assertSee('href="https://example.com/terms"', false);
    }

    public function test_external_urls_must_be_http_links(): void
    {
        $this->expectException(ValidationException::class);

        ConfProvider::from(Module::USER_INFE)->update(['privacy_url' => 'javascript:alert(1)']);
    }

    public function test_install_publishes_the_templates_once_and_keeps_edits(): void
    {
        $dir = resource_path('views/vendor/userinterface/pages');
        File::deleteDirectory($dir);

        try {
            ob_start();
            InstallSteps::run();
            ob_end_clean();
            $this->assertFileExists($dir.'/privacy.blade.php');

            // An edited copy is never overwritten.
            File::put($dir.'/privacy.blade.php', 'edited');
            ob_start();
            InstallSteps::run();
            ob_end_clean();
            $this->assertSame('edited', File::get($dir.'/privacy.blade.php'));
        } finally {
            File::deleteDirectory($dir);
        }
    }
}
