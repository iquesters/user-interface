# Changelog

All notable changes to this package are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Added
- **Breadcrumbs on every page**, built from navigation: `Module › Item › Tab › page`. A page adds its last crumb with `@section('breadcrumb', …)`. On phones they show as a "‹ back" link. Diglactic definitions still win where they exist.
  - The module crumb links to the module's dashboard; on the dashboard it is the only crumb.
- **Tabs from navigation:** a page shows the tabs (child items) of its sidebar item, so no `$tabs` array is needed. The sidebar reads `navigation_items` when foundation has them, and falls back to the old menu JSON.
  - A sidebar item's own page is shown where its "own page" tab sits in the order, not always first.
  - Clicking a module opens its dashboard, wherever the dashboard is in the sidebar order (it opened the first item).

### Changed
- **Tabs:**
  - one scrollable line on phones, with icon and label side by side and the active tab in view;
  - labels are printed as text (they were raw HTML);
  - the placeholder "history" tab is removed;
  - a view's own `$tabs` array is deprecated;
  - the list page no longer repeats its title as a tab.
- **Business entities in tables and forms:** a schema `"entity": "business-entity/{slug}"` lists, loads, saves and deletes its records through foundation's business entity API.
- JS: `entityApiUrl(path)` and `entityRecordUrl(action, entity, uid)` in `api-client.js` build entity and business entity API URLs (base `window.ENTITY_API_BASE`, default `/api/foundation/v1`).
- **Record components by key** (`Support\RecordComponents`, `docs/record-components.md`):
  - table schemas name their list and right-panel components by key, e.g. `"details_component": "user.details"`;
  - modules keep them in `resources/views/records/{type}/` and register them in their provider;
  - `Contracts\RecordComponentSource` (tag `record-component-sources`) lets stored components override files later.
- **Right panel components read the full record:** the row merged with the record from `details_source` or, by default, the table's form's `dataEndpoint`.
- New binding type `badges`, e.g. a user's roles from `labels.roles`.
- Bindings: `"prefix"` puts a path before a bare stored file name, e.g. a profile picture's `/profile-picture/`. Full URLs are left as they are.
- **The right panel shows a record-shaped skeleton** (picture, title, rows) while a component loads. It used to show the form's skeleton.
- **Form fields: `"type": "repeater"`**, a repeatable group of rows with the same `fields` (`public/js/form/repeater-field.js`):
  - the value is the whole list `[{uid?, field, meta: {}}]`;
  - edit mode shows a card per row with remove and add buttons; view mode shows a small table.
  - Business entity forms use it for has-many parts.
- Form fields: `"optionsFrom": {"url": …, "empty": "…"}` adds a first "nothing" option. In view mode, a checkbox group shows the labels of the picked options, not their values.
- **Tables:** in table view, clicking a row switches to split view with that record's details on the right and the row selected; the details' close button returns to table view (Ctrl/Cmd/Shift-click on the name link still opens it in a new tab).
- **Tables:** table schema `"create": {"form": "<form schema>", "label": "Create user"}` adds a Create button to the list page's action row; it opens that form in create mode in a modal and reloads the table after saving. `showModal({formId, formMode: 'create'})` renders a schema's create mode.
- Form fields: `"requiredIn": ["create"]` (required only in those modes). Modal forms use the same responsive field widths as page forms.
- **Help, Privacy policy and Terms pages** (`/help`, `/privacy-policy`, `/terms-conditions`, public). Editable templates are published to the app (`resources/views/vendor/userinterface/pages`) on install and never overwritten. A "template page" note shows to developers (APP_DEBUG) and super-admins until `$isTemplate = false`. Settings `help_url`, `privacy_url`, `terms_url` link external pages instead. The user menu links point here (they were `#`).
- Form schema: a field can load its options with `"optionsFrom": {"master_data": "theme", "exclude": [...], "empty": "..."}` (filled in when the schema is served) or `"optionsFrom": {"url": "/..."}` (fetched by the browser with the user's session).
- Form schema: `"dataEndpoint"` (with `{uid}`) loads the record from the schema's own endpoint instead of the generic entity API.
- Form fields: `"readonly": true` shows a value in edit mode without letting it change.
- Form fields: `"showIn": ["edit"]` (only shown and submitted in those modes), `"omitIfEmpty": true` (a blank value is not sent, e.g. "new password"), `"display": "status"` (view mode: the same `badge text-bg-{status}` as the status component) and `"display": "badge"` (neutral badges), `"type": "image"` (view mode picture) and field `"actions"` that open another form schema in a modal.
- Form fields: `"type": "file"` with `"crop": {"aspectRatio": 1, "maxSize": 1024}` lets the user choose the area of an image before upload (drag / resize, mouse and touch; `public/js/form/image-crop-field.js`); the cropped image is what is submitted. Modal forms show a skeleton shaped like the form while loading.
- Form schema: `modes.view.editUrl` shows the Edit icon for forms that are not entity records (e.g. My Profile -> Settings).

### Changed (form layout)
- View mode is a details grid (small muted label above a medium-weight value, spacing instead of divider lines) instead of disabled-looking input boxes; the loading skeletons match.
- `"defaultFieldSize": "auto"`: one column on phones; from tablet width, short inputs sit two per row and wide content (textarea, file, image, option groups) keeps the full width. Used by the profile, settings and admin forms. The server-rendered skeleton now uses the same responsive column classes as the form (it used one fixed width).

### Changed
- **The entity data API moved to iquesters/foundation**: the controller, `Services\Entity\*`, `DynamicEntityListQuery`, `EntityListParams` and `EntityScopeResolver`. This module now keeps presentation only. Requires iquesters/foundation `^2.1`.
  - The JS uses `/api/foundation/v1/entity/...` (see foundation `docs/developer/entity-api.md`).
  - **Deprecated, removed in 3.0:**
    - component names given as view paths (`userinterface::components.lab-user-*`): use registered keys. The `lab-user-*` views moved to user-management (`user.summary`, `user.details`);
    - `/api/user-interface/v1/entity/...` and `/api/entity/...` (now served by foundation's controller);
    - the old `Iquesters\UserInterface\Services\Entity\*`, `Http\Controllers\DynamicEntityController`, `Http\Query\DynamicEntityListQuery`, `Constants\EntityListParams` and `Contracts\EntityScopeResolver` class names, which resolve to foundation's classes (`src/deprecated-aliases.php`).
- Flash messages in the app layout show as toasts (same as the auth pages), once.
- View mode shows a select's option label instead of its stored value; empty values show "—".
- Picture changer: script moved to `public/js/image-changer.js`; "Remove image" only when there is an uploaded picture; Save without pressing Crop crops the current selection (it uploaded a blank image); the default crop is the largest centred square.
- Phones: page content and toasts stay above the bottom module bar; upload buttons show their labels; the auth card uses less padding.

### Fixed
- **Table split view with a form that has its own `dataEndpoint`** (e.g. Users with roles): the panel showed "—" for most fields.
  - **Cause:** the table passed its list row to the form, and the form used that row as its record, but its fields have other keys (`user__name`).
  - **Fix:** such a form now loads its record from `dataEndpoint`; switching between view and edit reuses that record.
  - Forms without `dataEndpoint`, and the right panel's order (component → form in view mode → default row component), are unchanged.
- **Phones:** a table's page-size select and search box share one row, with the search on the right.
- **List page actions:** the **Create** button is outlined and sits on the right, before the table/split view switch.
- **List page skeleton:** keeps the same gap below the actions bar as the loaded table, so nothing moves when the table appears.
- **Right panel, no jump:** the Edit/Delete row of a component-backed record is added before loading, so the skeleton sits where the component will render.
- **Phones and tablets, split view:** one panel at a time.
  - The list fills the width; an opened record covers it, and its close button returns to the list. Deleting the record does the same.
  - The resizer is hidden; desktop is unchanged.
- **Phones and tablets:** after scrolling, page content (breadcrumb, headings) showed through a gap at the top of the open sidebar.
  - The sidebar now starts at the header's bottom edge, kept in place on scroll and resize (`--ui-sidebar-top`, `public/js/app.js`).
  - It fills the rest of the screen and scrolls its own menu; its last items stay above the bottom module bar.
- The user menu avatar used a relative path that broke on nested URLs.

## [2.0.0] – 2026-11-17

### Settings engine
- Validation rules for the UI and snackbar settings (`nav style`, tabs, `vendor_assets`, toast position…).

### Front-end assets
- **One bundled script:** `public/js` is built into `public/dist/userinterface.js` (`npm run build`, no npm
  dependencies). The layout loads the bundle when `APP_DEBUG` is off (1 request instead of ~37) and the individual
  files while debugging. CI checks the bundle is up to date.
- **Self-hosted libraries:** jQuery, Bootstrap JS, Font Awesome (+ webfonts), DataTables and JSON Editor ship in
  `public/libs` (downloaded and SRI-verified by `npm run libs`). New setting `vendor_assets` (`local` default, `cdn`).
  Removed the unused Google Font request. See `docs/frontend-assets.md`.

### Housekeeping
- `console.log` calls go through `window.uiDebug` (only with `APP_DEBUG`); removed the `/pkg-test` debug route and commented-out code; added Pint/Larastan, test CI, `.gitattributes`, `SECURITY.md`, `CONTRIBUTING.md`, `UPGRADE.md` and composer metadata.

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
