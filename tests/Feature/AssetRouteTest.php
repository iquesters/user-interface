<?php

namespace Iquesters\UserInterface\Tests\Feature;

use Iquesters\UserInterface\Tests\TestCase;
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
            ['/vendor/userinterface/..%2Fcomposer.json'],
            ['/vendor/userinterface/%2E%2E/composer.json'],
            ['/vendor/userinterface/js/..%2F..%2Fcomposer.json'],
            ['/vendor/userinterface/..%2F..%2F..%2F.env'],
            ['/vendor/userinterface/..%2Fsrc%2FUserInterfaceServiceProvider.php'],
        ];
    }

    #[DataProvider('traversal')]
    public function test_cannot_read_files_outside_public(string $uri): void
    {
        $this->get($uri)->assertNotFound();
    }
}
