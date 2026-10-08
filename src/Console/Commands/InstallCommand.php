<?php

namespace Iquesters\UserInterface\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Foundation\Application as LaravelApplication;
use Illuminate\Support\Facades\Schema;

class InstallCommand extends Command
{
    protected $signature = 'iquesters:install';
    protected $description = 'Install Iquesters ecosystem';

    public function handle(): int
    {
        $installedUserManagement = $this->isPackageInstalled('iquesters/user-management');

        if (!$installedUserManagement) {
            $this->info('Requiring user-management package...');

            passthru(
                'composer require iquesters/user-management:"*"'
                . ' --prefer-dist'
                . ' --no-interaction'
                . ' --no-progress'
                . ' --no-scripts',
                $exitCode
            );

            if ($exitCode !== 0) {
                $this->error('Failed to require user-management. Aborting.');
                return self::FAILURE;
            }

            $this->newLine();
        } else {
            $this->info('user-management already installed. Skipping composer require.');
        }

        $this->refreshAutoload([
            'Iquesters\\UserManagement\\',
            'Iquesters\\UserManagement\\Database\\Seeders\\',
            'Spatie\\Permission\\',
        ]);

        if (!$installedUserManagement || !$this->isPackageDiscovered('iquesters/user-management') || !$this->isPackageDiscovered('spatie/laravel-permission')) {
            $this->info('Refreshing Laravel package discovery...');
            $this->call('package:discover');
            $this->newLine();
        }

        $this->registerProvider('Spatie\Permission\PermissionServiceProvider');
        $this->registerProvider('Iquesters\UserManagement\UserManagementServiceProvider');

        $this->info('Publishing Spatie Permission migrations...');

        $this->call('vendor:publish', [
            '--provider' => 'Spatie\Permission\PermissionServiceProvider',
            '--tag' => 'permission-migrations',
            '--force' => true,
        ]);

        if (!$this->hasPermissionMigration() && !$this->hasPermissionTables()) {
            $this->error('Spatie Permission migration was not published. Run composer dump-autoload and retry.');
            return self::FAILURE;
        }

        $this->info('Running migrations...');
        $this->call('migrate', ['--force' => true]);
        $this->newLine();

        if (!$this->hasPermissionTables()) {
            $this->error('The permissions table is missing after migration. Aborting before seeders.');
            return self::FAILURE;
        }

        $this->info('Running seeders...');
        foreach ([
            ['user-interface:seed', 'Iquesters\UserInterface\Database\Seeders\UserInterfaceSeeder', 'User Interface'],
            ['user-management:seed', 'Iquesters\UserManagement\Database\Seeders\UserManagementSeeder', 'User Management'],
            ['foundation:seed', 'Iquesters\Foundation\Database\Seeders\FoundationSeeder', 'Foundation'],
        ] as [$command, $seeder, $label]) {
            $this->runSeeder($command, $seeder, $label);
        }
        $this->newLine();

        $this->info('Iquesters installation completed successfully.');
        return self::SUCCESS;
    }

    /**
     * Check if a Composer package is already installed
     * by looking it up in the installed.json manifest.
     */
    private function isPackageInstalled(string $package): bool
    {
        $installedJson = base_path('vendor/composer/installed.json');

        if (!file_exists($installedJson)) {
            return false;
        }

        $installed = json_decode(file_get_contents($installedJson), true);

        // Composer 2.x wraps packages under a "packages" key
        $packages = $installed['packages'] ?? $installed;

        foreach ($packages as $pkg) {
            if (($pkg['name'] ?? '') === $package) {
                return true;
            }
        }

        return false;
    }

    private function isPackageDiscovered(string $package): bool
    {
        $packages = base_path('bootstrap/cache/packages.php');

        if (!file_exists($packages)) {
            return false;
        }

        $manifest = require $packages;

        return isset($manifest[$package]);
    }

    private function registerProvider(string $provider): void
    {
        if (!class_exists($provider)) {
            return;
        }

        if ($this->laravel instanceof LaravelApplication && $this->laravel->providerIsLoaded($provider)) {
            return;
        }

        $this->laravel->register($provider);
    }

    private function refreshAutoload(array $namespaces): void
    {
        $autoload = base_path('vendor/autoload.php');
        $prefixesFile = base_path('vendor/composer/autoload_psr4.php');

        if (!file_exists($autoload) || !file_exists($prefixesFile)) {
            return;
        }

        $loader = require $autoload;
        $prefixes = require $prefixesFile;

        foreach ($namespaces as $namespace) {
            if (isset($prefixes[$namespace])) {
                $loader->addPsr4($namespace, $prefixes[$namespace]);
            }
        }
    }

    private function hasPermissionMigration(): bool
    {
        return !empty(glob(database_path('migrations/*_create_permission_tables.php')));
    }

    private function hasPermissionTables(): bool
    {
        try {
            return Schema::hasTable('permissions') && Schema::hasTable('roles');
        } catch (\Throwable) {
            return false;
        }
    }

    private function runSeeder(string $command, string $seederClass, string $label): void
    {
        if ($this->getApplication()?->has($command)) {
            $this->call($command);
            return;
        }

        if (!class_exists($seederClass)) {
            throw new \RuntimeException("{$label} seeder class is not available.");
        }

        $this->info("Running {$label} Seeder...");

        $seeder = new $seederClass();

        if (method_exists($seeder, 'setCommand')) {
            $seeder->setCommand($this);
        }

        $seeder->run();
        $this->info("{$label} seeding completed!");
    }
}
