# Configuration

## Source

All runtime settings come from the database, read through:

```php
ConfProvider::from(Module::USER_INFE)->app_layout;
```

- Defaults are defined in `src/Config/UserInterfaceConf.php` (`prepareDefault()`) and seeded into
  `master_data` / `master_data_metas`.
- A key missing from the DB falls back to its default.

There is no `config/userinterface.php` and no `.env` keys; the DB is the only source.

## Keys

| Key | Default | Purpose |
|---|---|---|
| `auth_layout` | `userinterface::layouts.auth` | Layout for auth pages |
| `app_layout` | `userinterface::layouts.app` | App shell layout |
| `logo` | `img/logo.png` | Brand logo (URL, path or package asset) |
| `app_name` | `Iquesters` | Set by first-run setup |
| `app_description` | `Iquesters Application` | Set by first-run setup |
| `large_screen_nav_style` | `minibar` | `minibar` (left sidebar) or `header` (module tabs) |
| `large_screen_module_tabs` | `7` | Modules shown before the rest go into a dropdown |
| `small_screen_bottom_tabs` | `4` | Mobile bottom tab count |
| `small_screen_featured_tab` | empty | Featured module on mobile (e.g. `dashboard`) |
| `small_screen_featured_position` | `center` | `center`, `left` or `right` |
| `snackbar_conf.*` | | Toast position, stacking and timing |
| `vendor_assets` | `local` | Third-party JS/CSS (jQuery, Bootstrap, Font Awesome, DataTables, JSON Editor): `local` = self-hosted copies shipped in `public/libs`, `cdn` = public CDNs. See [frontend-assets.md](frontend-assets.md) |

## Auth layout notes

- Card width: pages can set `@section('auth-card-class', '…')`; default is `col-md-8`.
- Flashed `status` / `success` / `error` session messages are shown as toasts (no inline alerts).
