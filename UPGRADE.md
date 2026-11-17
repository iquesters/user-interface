# Upgrading iquesters/user-interface

## 1.x → 2.0

Upgrade together with foundation, user-management and organisation; follow foundation's
`UPGRADE.md` first (requirements, migrations, admin roles).

### Breaking changes
- **API URLs are versioned:** `/api/user-interface/v1/...`
  (`entity/list|show|store|update|delete/...`, `noauth/form/{slug}`, `form/{slug}`,
  `auth/table/{slug}`, `components/templates/{component}`).
  The old unversioned `/api/...` URLs still work as **deprecated aliases** and will be removed in a
  later release; switch your own callers now. The module's JS already uses the new URLs
  (`uiApiUrl('entity/list/users')`).
- The generic entity API only serves tables that have an entity definition, checks per-entity
  permissions, caps `length` at 100 and hides soft-deleted rows.
- `config/userinterface.php` is removed: all settings are the DB-backed conf (`UserInterfaceConf`).
  Remove a published copy. See `docs/configuration.md`.
- The `form_values` table is dropped.
- `UserInterfaceServiceProvider::getAssetVersion()` is removed.

### Front-end
- `console.log` output only appears with `APP_DEBUG=true` (`window.uiDebug`).
- Form-level errors show as toasts; flashed session messages on auth pages show as toasts.
- If you serve the module's JS/CSS from `public/vendor/userinterface`, republish after updating:
  `php artisan vendor:publish --tag=laravel-assets --force` (Laravel apps do this on `composer update`).
