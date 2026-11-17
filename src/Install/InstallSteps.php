<?php

namespace Iquesters\UserInterface\Install;

use Iquesters\Foundation\Support\InstallPublisher;
use Laravel\Sanctum\SanctumServiceProvider;

/**
 * One-time setup run on `package:discover` (composer install/update).
 * Idempotent, so running it on each update is safe.
 */
final class InstallSteps
{
    public static function run(): void
    {
        // The entity/form APIs authenticate with Sanctum tokens.
        if (! class_exists(SanctumServiceProvider::class)) {
            echo '🧩 user-interface: laravel/sanctum is not installed: composer require laravel/sanctum'.PHP_EOL;

            return;
        }

        $messages = [
            InstallPublisher::migration('sanctum-migrations', '_create_personal_access_tokens_table.php', 'personal_access_tokens'),
            InstallPublisher::config('sanctum-config', 'sanctum.php'),
        ];

        foreach (array_filter($messages) as $message) {
            echo "🧩 user-interface: {$message}".PHP_EOL;
        }
    }
}
