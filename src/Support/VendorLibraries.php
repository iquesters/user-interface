<?php

namespace Iquesters\UserInterface\Support;

use Illuminate\Support\HtmlString;
use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Support\ConfProvider;

/**
 * Third-party libraries the layouts load (jQuery, Bootstrap JS, Font Awesome,
 * DataTables, JSON Editor), listed in resources/vendor-libraries.json.
 *
 * Source per the user-interface conf setting `vendor_assets`:
 *  - local (default): the copies in public/libs (downloaded and SRI-verified by
 *    `npm run libs`, shipped with the package); a file that is missing falls
 *    back to its CDN URL;
 *  - cdn: the public CDNs.
 * Both use the same SRI hash, since the files are byte-identical.
 */
final class VendorLibraries
{
    public const SOURCE_LOCAL = 'local';

    public const SOURCE_CDN = 'cdn';

    private static ?array $libraries = null;

    /** <link> tags for the stylesheets of this page type. */
    public static function styles(bool $isAuthPage = false): HtmlString
    {
        $tags = array_map(
            fn ($lib) => sprintf(
                '<link rel="stylesheet" href="%s" integrity="%s" crossorigin="anonymous" referrerpolicy="no-referrer">',
                e(self::url($lib)),
                e($lib['integrity'])
            ),
            self::forPage('css', $isAuthPage)
        );

        return new HtmlString(implode("\n", $tags));
    }

    /** <script> tags for the scripts of this page type, in manifest order. */
    public static function scripts(bool $isAuthPage = false): HtmlString
    {
        $tags = array_map(
            fn ($lib) => sprintf(
                '<script src="%s" integrity="%s" crossorigin="anonymous" referrerpolicy="no-referrer"></script>',
                e(self::url($lib)),
                e($lib['integrity'])
            ),
            self::forPage('js', $isAuthPage)
        );

        return new HtmlString(implode("\n", $tags));
    }

    public static function source(): string
    {
        try {
            $source = strtolower(trim((string) ConfProvider::from(Module::USER_INFE)->vendor_assets));
        } catch (\Throwable) {
            $source = '';
        }

        return $source === self::SOURCE_CDN ? self::SOURCE_CDN : self::SOURCE_LOCAL;
    }

    /** @param array{cdn: string, local: string} $lib */
    public static function url(array $lib): string
    {
        if (self::source() === self::SOURCE_LOCAL && file_exists(Assets::publicPath().'/libs/'.$lib['local'])) {
            return Assets::url('libs/'.$lib['local']);
        }

        return $lib['cdn'];
    }

    /** Libraries of a type for a page; auth pages skip the "app" ones (tables, JSON editor). */
    private static function forPage(string $type, bool $isAuthPage): array
    {
        return array_values(array_filter(
            self::all(),
            fn ($lib) => $lib['type'] === $type && (! $isAuthPage || $lib['scope'] === 'all')
        ));
    }

    /** @return array<int, array{name: string, type: string, scope: string, cdn: string, integrity: string, local: string}> */
    public static function all(): array
    {
        if (self::$libraries === null) {
            $manifest = json_decode((string) file_get_contents(dirname(__DIR__, 2).'/resources/vendor-libraries.json'), true);
            self::$libraries = $manifest['libraries'] ?? [];
        }

        return self::$libraries;
    }
}
