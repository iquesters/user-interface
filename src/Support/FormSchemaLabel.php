<?php

namespace Iquesters\UserInterface\Support;

use Illuminate\Contracts\Auth\Authenticatable;
use Iquesters\Foundation\Enums\Module;
use Iquesters\Foundation\Support\ConfProvider;

/**
 * Whether the line "Form Rendered by Form Schema: slug" shows under forms for
 * this user. Settings (user-interface conf):
 *
 * - form_schema_label: debug (only with APP_DEBUG, the default) | always | never;
 * - form_schema_label_roles: roles that see it, comma separated (default
 *   super-admin); empty: everyone signed in.
 */
class FormSchemaLabel
{
    public const WHEN = ['debug', 'always', 'never'];

    public static function visibleTo(?Authenticatable $user): bool
    {
        $conf = ConfProvider::from(Module::USER_INFE);
        $when = (string) ($conf->form_schema_label ?? 'debug');

        if ($when === 'never' || ($when !== 'always' && ! config('app.debug'))) {
            return false;
        }
        if (! $user) {
            return false;
        }

        $roles = array_values(array_filter(array_map('trim', explode(',', (string) ($conf->form_schema_label_roles ?? 'super-admin')))));
        if ($roles === []) {
            return true;
        }

        return method_exists($user, 'hasAnyRole') && $user->hasAnyRole($roles);
    }
}
