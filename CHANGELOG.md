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

### Fixed
- Entity API hides soft-deleted records.
- Sanctum auto-publish created duplicate migrations.
- Blade echoes inside HTML comments broke `/form/list`.
- Database: timestamped migrations, audit FKs on schema tables.

### Security
- Generic entity API allowlist, page-size cap, admin-only routes.
- Path traversal in `/vendor/userinterface/{path}`.
