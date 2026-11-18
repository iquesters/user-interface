<?php

namespace Iquesters\UserInterface\Support;

use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Support\ConfProvider;

/**
 * Help, Privacy policy and Terms pages: the URL each link points to, and the
 * publish tag for their templates.
 *
 * The module ships editable templates (resources/views/pages). On install they
 * are published to the app's resources/views/vendor/userinterface/pages, where
 * Laravel prefers them over the package copies, so the developer edits the
 * app's copy. An admin can instead point a link at an external page with the
 * help_url / privacy_url / terms_url settings.
 */
final class InfoPages
{
    public const PUBLISH_TAG = 'userinterface-pages';

    /** page key => [setting, route name] */
    private const PAGES = [
        'help' => ['help_url', 'ui.help'],
        'privacy' => ['privacy_url', 'ui.privacy'],
        'terms' => ['terms_url', 'ui.terms'],
    ];

    public static function url(string $page): string
    {
        [$setting, $route] = self::PAGES[$page];

        $external = trim((string) ConfProvider::from(Module::USER_INFE)->{$setting});

        return $external !== '' ? $external : route($route);
    }

    /** True when the link leaves the app (open it in a new tab). */
    public static function isExternal(string $page): bool
    {
        return trim((string) ConfProvider::from(Module::USER_INFE)->{self::PAGES[$page][0]}) !== '';
    }
}
