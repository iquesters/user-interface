<?php

namespace Iquesters\UserInterface\Support;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Iquesters\Foundation\Constants\EntityStatus;
use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Models\MasterData;
use Iquesters\Foundation\Support\ConfProvider;
use Iquesters\Foundation\Support\ModuleAssets;
use Iquesters\Foundation\System\Traits\Loggable;

/**
 * This module's public/ files: route and URLs (see foundation ModuleAssets),
 * plus the theme and the CSS/JS file lists the layouts include.
 */
final class Assets extends ModuleAssets
{
    use Loggable;

    protected static function slug(): string
    {
        return 'userinterface';
    }

    /** Logo from the user-interface conf (set by first-run setup); may be a file in the app's public/. */
    public static function logoUrl(): string
    {
        return static::resolveUrl((string) ConfProvider::from(Module::USER_INFE)->logo);
    }

    /**
     * Theme: the user's own (user-management user meta "theme"), else the
     * global MasterData "current_theme", else null.
     */
    public static function currentTheme(): ?string
    {
        try {
            $user = Auth::user();
            $userMetaModel = 'Iquesters\\UserManagement\\Models\\UserMeta';

            if ($user && class_exists($userMetaModel)) {
                $theme = $userMetaModel::where('ref_parent', $user->id)
                    ->where('meta_key', 'theme')
                    ->where('status', 'active')
                    ->value('meta_value');

                if (!empty($theme)) {
                    return $theme;
                }
            }

            return MasterData::where('key', 'current_theme')
                ->where('status', EntityStatus::ACTIVE)
                ->value('value');
        } catch (\Throwable $e) {
            static::logError('Failed to get user theme', ['error' => $e->getMessage()]);

            return 'default';
        }
    }

    /** @return array<int, array{type: string, path: string, media: string|null}> */
    public static function cssAssets(): array
    {
        $theme = self::currentTheme() ?? 'default';

        return array_merge(
            [['type' => 'css', 'path' => "css/theme/{$theme}/bootstrap.min.css", 'media' => 'screen']],
            self::discover('css', 'theme')
        );
    }

    /** @return array<int, array{type: string, path: string, media: string|null}> */
    public static function jsAssets(): array
    {
        return self::discover('js');
    }

    /** All public/{type} files of that type, sorted, optionally excluding a sub-folder. */
    private static function discover(string $type, ?string $excludePrefix = null): array
    {
        $basePath = self::publicPath() . '/' . $type;

        if (!File::exists($basePath)) {
            return [];
        }

        return collect(File::allFiles($basePath))
            ->filter(fn ($file) => $file->getExtension() === $type)
            ->reject(fn ($file) => $excludePrefix && str_starts_with($file->getRelativePathname(), $excludePrefix))
            ->sortBy(fn ($file) => $file->getRelativePathname())
            ->map(fn ($file) => [
                'type' => $type,
                'path' => $type . '/' . str_replace(DIRECTORY_SEPARATOR, '/', $file->getRelativePathname()),
                'media' => $type === 'css' ? self::cssMedia($file->getFilename()) : null,
            ])
            ->values()
            ->all();
    }

    /** Breakpoint-specific CSS (e.g. 4-userinterface-lg.css) only applies from that width. */
    private static function cssMedia(string $filename): string
    {
        return match (true) {
            str_contains($filename, '-sm.css') => 'screen and (min-width: 576px)',
            str_contains($filename, '-md.css') => 'screen and (min-width: 768px)',
            str_contains($filename, '-lg.css') => 'screen and (min-width: 992px)',
            str_contains($filename, '-xl.css') => 'screen and (min-width: 1200px)',
            str_contains($filename, '-xxl.css') => 'screen and (min-width: 1400px)',
            str_contains($filename, 'print.css') => 'print',
            default => 'screen',
        };
    }
}
