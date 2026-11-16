# Changelog

All notable changes to this package are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased] – 2.0.0

### Breaking
- Requires PHP 8.3, Laravel 12/13 and spatie/laravel-permission 8.
- `config/userinterface.php` removed; all settings come from the DB conf (`UserInterfaceConf`). See [docs/configuration.md](docs/configuration.md).
- `form_values` table removed.
- user-management is optional; no hard dependency on the host app.

### Added
- Schema forms: file uploads (multipart), action `align` (start|center|end), reCAPTCHA v3 token via `recaptchaAction`.
- Generic entity API: payload validation from field definitions, per-entity permissions.
- Onboarding-aware home banner and module favicon.
- Auth layout: `@section('auth-card-class')` to size the card.
- Testbench test suite.

### Changed
- Auth layout shows flashed `status` / `success` / `error` messages as toasts instead of inline alerts.
- Form loading skeleton matches the real form (textarea rows, label height, spacing, button alignment and size).
- Assets served statically when published; DataTables/JSON editor skipped on auth pages.
- `DynamicEntityController` split into entity services.
- Logging uses foundation's `Loggable`.

### Performance
- App pages: about 1,200 → 45 queries per page (dashboard ~1 s → ~0.25 s locally). Module navigation is built
  once per request by the scoped `Support\NavigationMenu` instead of per view composed and per tab include.

### Changed (API)
- API served at `/api/user-interface/v1/...` (`routes/api.v1.php`, declared in `composer.json`), rate-limited
  to 300 requests/min. The module's JS uses it via `uiApiUrl()` (base in `window.UI_API_BASE`).
- The unversioned `/api/entity/...`, `/api/noauth/form/...`, `/api/form/...`, `/api/auth/table/...` and
  `/api/components/templates/...` URLs are **deprecated aliases**, removed in a later release.

### Fixed
- Duplicate `master-data.update` route (also defined by foundation) broke `php artisan route:cache`.

### Changed
- `Support\Assets` extends foundation's `ModuleAssets` (shared asset route/URL logic).
- `UserInterfaceServiceProvider` (407 → ~110 lines) extends foundation's `BaseServiceProvider`, configured by
  `Package\UserInterfacePackageInfo`. Asset route/URLs, theme and CSS/JS discovery moved to `Support\Assets`, the
  Sanctum install step to `Install\InstallSteps`. The static helpers views use stay on the provider.
- Form-level errors (not tied to a field) show as an error toast instead of a red box in the form; error toasts stay ~8 s.

### Removed
- Unused `getAssetVersion()` and the unused `$defaultcache` parameter of `getCssUrl()` / `getJsUrl()`.

### Security
- Toast messages are inserted as text, not HTML (server messages could inject markup).

### Added
- Entity list API: free-text `?search=` across text columns and meta values (LIKE wildcards matched literally, 100-char cap).

### Fixed
- Table search and column sorting did nothing: the table now sends the search term (debounced 400 ms) and the
  sorted column to the API, and resets its row cache when either changes. Only columns the server can sort are sortable.
- Table split view: the detail panel shows a form-shaped skeleton instead of a spinner followed by a generic
  skeleton. It uses the form schema (prefetched on click) so header, field grid, value boxes and buttons match the
  real form; the edit/view switch uses the same skeleton.
- Sidebar is rendered on the server: no "Loading menu…" flash after page load, and the current page's module
  tab and menu item are highlighted. Pages not in any menu still reopen the last-used module.
- Entity API hides soft-deleted records.
- Sanctum auto-publish created duplicate migrations.
- Blade echoes inside HTML comments broke `/form/list`.
- Database: timestamped migrations, audit FKs on schema tables.

### Security
- Generic entity API allowlist, page-size cap, admin-only routes.
- Path traversal in `/vendor/userinterface/{path}`.
