<?php

namespace Iquesters\UserInterface\Install;

use Illuminate\Support\Facades\Artisan;
use Iquesters\Foundation\Support\InstallPublisher;
use Iquesters\UserInterface\Support\InfoPages;
use Laravel\Sanctum\SanctumServiceProvider;

/**
 * One-time setup run on `package:discover` (composer install/update).
 * Idempotent, so running it on each update is safe.
 */
final class InstallSteps
{
    public static function run(): void
    {
        $messages = [self::publishInfoPages()];

        // The entity/form APIs authenticate with Sanctum tokens.
        if (class_exists(SanctumServiceProvider::class)) {
            $messages[] = InstallPublisher::migration('sanctum-migrations', '_create_personal_access_tokens_table.php', 'personal_access_tokens');
            $messages[] = InstallPublisher::config('sanctum-config', 'sanctum.php');
        } else {
            $messages[] = 'laravel/sanctum is not installed: composer require laravel/sanctum';
        }

        foreach (array_filter($messages) as $message) {
            echo "🧩 user-interface: {$message}".PHP_EOL;
        }
    }

    /**
     * Help / Privacy / Terms templates go to the app once; after that they are the
     * app's files (never overwritten, so edits are kept).
     */
    private static function publishInfoPages(): ?string
    {
        if (is_dir(resource_path('views/vendor/userinterface/pages'))) {
            return null;
        }

        Artisan::call('vendor:publish', ['--tag' => InfoPages::PUBLISH_TAG]);

        return 'Published Help, Privacy and Terms templates to resources/views/vendor/userinterface/pages. Edit them for your app.';
    }
}
