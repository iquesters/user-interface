# Changelog

All notable changes to this package are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Fixed (number fields)
### Added (tables on any page)
- **`userinterface::components.table`**: the list page's actions bar and table as a partial, so a module page can show a generic table (e.g. an event's attendees under its totals). `dataUrl` gives that table its own rows: `<table class="lab-table" data-data-url="…">` replaces the schema's `data_url` for the page.

- **`"min": 0` was ignored** (0 was treated as "not set"), so amounts could go negative. `min`, `max` and `step` of 0 now apply, also in repeater rows (which had no number limits at all).
- **A number field that can't go below 0 blocks the minus sign** (and `e`); a pasted negative becomes positive.

### Fixed (saving in a table's side panel)
- **Row clicks only open rows of the list itself**: a click inside an open record or form (an edit form's field, a table inside a record or cell) no longer reaches the list's row handler, which opened the record again in view mode (table mode: an edit switched to the split view).
- **The side panel's title** uses a record's `reference` (or `label`) before its uid: a payment or an order shows *ORD-0001*, not its id.
- **Editing a record in a list's side panel** (e.g. a product): after *Save*, the panel stayed in edit mode. It now shows the saved record (read-only) and updates its row in the list.

### Added (modern forms)
- **Repeater rows as cards** (`"rowLabel": "Guest"`): each row is a card titled *Guest 1*, *Guest 2*… (renumbered on remove) with a *Remove* link, its fields in a wrapping grid, and a checkbox as a question with **Yes / No** buttons on its own line (with its `helperText`). Adding or removing a row fires `change` on the form. Without `rowLabel`, rows are compact lines as before.
- **Repeater sub-field `default`**: a new row starts with it (e.g. *Adult*, *+91*).
- **Repeater select options with `showWhen`**: an option is offered only while another field in the row has a value (e.g. *Child* only while *Joining as a member?* is No); if the chosen option goes away, the first one still offered is chosen.
- **Short radio groups on one row** (up to 3 options with short labels, e.g. *Veg / Non-veg*); `"inline": true|false` decides it.
- **Sections carry `data-section-id`** (their schema id), so a page can fill a section (e.g. a live total).
- Styles: `.lab-repeater-card`, `.lab-order-summary`.

### Added (repeater rows)
- **`showWhen` inside a repeater row** (e.g. a guest's school fields only when *Alumnus?* is ticked): hidden fields aren't required or sent, and a field also hides when the one it depends on is hidden.

### Fixed (forms)
- **Sections in modal forms**: a form opened in a modal (e.g. New event) drew each section heading ("Event", "When and where"…) as a text box. Modals now show sections as on a page: a heading panel with the fields after it inside.
- **Forms of only a button** (e.g. Cancel my registration, Pay membership): setting them up read `APP_ENV`, which only the form builder page defines, so they broke and their button didn't work. Fixed.

### Added (forms)
- **`showWhen` follows chains and hidden fields aren't required**: a field also hides when the field it depends on is hidden (e.g. *Valid from* needs *Valid*, hidden for a physical item); a hidden field's `required` waits until it shows, so hidden fields never block saving.
- **Required radio groups** are checked by the browser (one option must be chosen).
- **A field's `default`** fills it in create and edit when there's no value yet (e.g. *Where: In person*). Before, only hidden fields used it.
- **Repeaters**: a `hidden` sub-field is kept in its row and sent, without a column (e.g. a ticket's product id); in view mode a select whose options come from an address shows the option's label, not its value.
- **Fields that show only when another field has a value**: `"showWhen": {"field": "is_paid", "equals": true}` (a checkbox compares ticked / not ticked; `equals` may be a list). In create and edit they appear (with a short fade) and hide as the user ticks or changes the other field; in view mode they follow the record's value. Used by the event form's paid fields.

### Changed (the form schema line)
- **"Form Rendered by Form Schema: slug" is a setting**: `form_schema_label` = `debug` (default: only while APP_DEBUG is on), `always` or `never`; `form_schema_label_roles` = the roles that see it, comma separated (default `super-admin`; empty: everyone signed in). Members and org-admins no longer see it. Test: `FormSchemaLabelTest`.

### Changed (submitting a form)
- **The button shows what is happening at once**, before image crops and reCAPTCHA: *Verifying…* (log in, OTP), *Saving…*, *Recording…*, *Deleting…*, *Cancelling…*, *Uploading…*, *Sending…*, *Registering…*, *Processing…* (pay), else *Submitting…*. The word comes from the button's text, or from the method (PUT: Saving, DELETE: Deleting); a schema (or one of its modes) may set its own with `"submittingLabel"`. It keeps that word, disabled, until the next page opens. Pressing Enter again doesn't send twice.
- **After a successful submit the form always goes somewhere**: to the server's `redirect_url`, else for a form on its own page (not in a modal, a table record or an inbox detail, which refresh themselves) the page reloads, showing the saved state. A schema may set `"successRedirect"`: `"reload"`, `"none"` (stay), or a URL (`{uid}` is the record's uid).
- **Edit on a form standing on its own page now keeps the values** (e.g. Payment settings, school records): Edit switches the same form to edit mode in place with the values the page gave it (`formData`); Cancel shows them read-only again. Before, Edit opened the generic `/…/edit/{uid}` page, which loads the record from the entity API and opened empty for forms without an entity.
- **The success message survives the redirect**: it shows as a snackbar on the next page (unless the schema has `disableSnackbar`).

### Added (repeaters)
- **A repeater's select can load its options from a module endpoint** (`"optionsFrom": {"url"}`, loaded once per address and shared by every row), e.g. the products of a bundle. Required selects in a repeater are now required in the browser too.

### Fixed
- **Submit buttons in modals showed no "Submitting…"** and could be pressed twice (the form engine didn't find the modal's button), so forms looked like they did nothing. The button now shows **Submitting…** and stays disabled until the answer (and the redirect) comes. Rebuild the bundle.
- **A single checkbox lost its value in edit mode**: it was drawn unticked although the record had it on (it is named `{id}[]` with the id `{id}-1`, so filling the form never found it), and saving switched the setting off (e.g. an event's "Registration open"). It is now ticked from its value (true / 1 / "1" / "true"); checkbox and radio groups compare values as text. Rebuild the bundle.
- **Lists of rows sent with a file were split one field per row** (e.g. the membership application with a proof file: "Choose what you completed…" for every row). Multipart arrays are now indexed (`rows[0][level]`), not `rows[][level]`. Rebuild the bundle.
- **The form component accepts `formData` / `meta` as arrays** (JSON-encodes them) instead of crashing with "htmlspecialchars(): Argument #1 must be of type string, array given" when an including view passes or leaks an array.

### Fixed (test round 2)
- **Create in a modal did nothing when the same form was open in the record panel** (e.g. New organisation while an organisation was open): the footer button found its form by id and got the read-only one. It now submits its own form.
- **Two Cancel rows** under some forms: an empty `actions` list also built a second footer.
- **Edit on a record:** a read-only form without a heading had no header row, so no Edit / Delete. The row is drawn whenever the record can be edited or deleted.
- **One failing record section no longer replaces the whole panel** with the raw "Record Information" list; the console names the section.
- **"Form Rendered by Form Schema: slug"** (debug) is added by the form engine, so forms in modals and record sections show it too.
- **List pages show the table's name and description** ("People and roles") instead of "List view of {entity}". Bulk actions read the entity from `data-entity`.

### Added
- **Per-record Edit / Delete:** a row's `_can: {edit, delete}` hides the buttons for records the user may not change (the endpoints still check).

### Fixed (test round 1)
- **The browser tab shows the app's name** (entered at setup, conf `app_name`) instead of `APP_NAME` from `.env` ("Laravel"). `Assets::appName()`; footers too.
- **Browser tab icon:** new conf `favicon` (path in the app's `public/` or a URL). Empty: the app's logo (once setup set one), else the default icon. `Assets::faviconUrl()`.
- **Minibar labels stay on one line** and end with "…"; the full name is the tab's tooltip (was: wrapped onto two lines).

### Added
- **Required fields show a red `*`** after their label in schema forms (text, select, radio and checkbox groups, floating labels, and a single required checkbox such as "I agree…", which is now also required in the browser).
- **A single checkbox can carry links** (`"links": [{"label", "url"}]`), shown after its label and opened in a new tab (e.g. the Terms someone agrees to).
- **Table "create" can name a `permission`:** the Create button shows only to users who have it (the endpoint still checks).
- While debugging, the line under every schema form names its form schema: "Form Rendered by Form Schema: `slug`" (a form without it is hand-written).
- Rebuild the bundle (`npm run build`) for installs that run with `APP_DEBUG` off.

### Fixed
- **Sidebar and minibar looked different (and broken) for some users:** sidebar items showed as white boxes on the tinted sidebar. Items now sit on the sidebar background as rounded rows (tinted on hover, filled for the current page), and the minibar tabs are rounded tiles with only the current module filled. The minibar's unclosed `<div>` and its white border line are gone. One set of styles for every user and role.

### Added
- **Modern forms** (edit and create mode, `public/css/7-form-modern.css`): labels above larger rounded inputs with a soft focus ring, wrapping helper text, and a **sticky action bar** (Save / Cancel stay visible at the bottom of long forms). Phones: 16px inputs (no iOS zoom), taller touch targets, buttons sharing the full width, room for the home indicator.
- **`"type": "section"` fields:** a titled group with an optional description (`{"id", "type": "section", "label", "description"}`). The fields after it, up to the next section, sit inside a soft rounded panel with the title on top (edit and view mode). Never submitted or validated (`isLayoutField`).
- **Table schema `data_url`:** rows come from the module's own endpoint instead of foundation's entity API: same parameters (`offset`, `length`, `search`, `sort`) and response (`response_schema.data` + `meta.pagination.total`), plus the page's own query parameters (e.g. `?status=` from a navigation tab). A record opens from `{data_url}/{uid}`. Lets a module decide which rows a user sees (e.g. an organisation admin's own organisations). Table mode, split mode, search, sort, paging and list URLs work as before.
- **Record sections** (table schema `record`): a record shows as several parts, one under another, in the split panel and the full-width record: `{"form": slug, "mode": "view"|"edit"}`, `{"component": key}`, `{"html": url}` (HTML the module renders for the record, `{uid}` replaced; for lists such as files or history), each optionally `"when": {field: [values]}` and `"title"`. A form's `{uid}` is the record's. After a section's form saves, the record reloads in place and the list refreshes.
- **`{uid}` in a field's `optionsFrom.url`** is replaced with the form's record uid (`data-entity-uid`), like the form's endpoint, so options can depend on the record (e.g. community's matching records for an application).
- **Header widgets from other modules:** the header shows every service tagged `header-widgets` (`render(?Authenticatable $user): ?string`), e.g. organisation's switcher. user-interface doesn't depend on those modules.
- **Breadcrumbs on every page**, built from navigation: `Module › Item › Tab › page`. A page adds its last crumb with `@section('breadcrumb', …)`. On phones they show as a "‹ back" link. Diglactic definitions still win where they exist.
  - The module crumb links to the module's dashboard; on the dashboard it is the only crumb.
- **Tabs from navigation:** a page shows the tabs (child items) of its sidebar item, so no `$tabs` array is needed. The sidebar reads `navigation_items` when foundation has them, and falls back to the old menu JSON.
  - A sidebar item's own page is shown where its "own page" tab sits in the order, not always first.
  - Clicking a module opens its dashboard, wherever the dashboard is in the sidebar order (it opened the first item).

- **List page URLs** (`docs/record-components.md`): the address bar follows the list without reloading the page.
  - `/list/{table}/view|edit/form/{form}/data/{uid}` opens a record, and `/list/{table}/create/form/{form}` the create form.
  - `{form}` is the form schema's uid. The form API now finds a form by slug or uid, and returns its `schemaUid` and `schemaSlug` with the schema.
  - `?mode=table|split` sets the view mode, and `?q`, `sort`/`dir`, `page`, `per_page` set the search, sort and paging.
  - Back and Forward work, and a reload or shared link opens the same state (`public/js/table/table-url-state.js`).
- **Table view:** a row click opens the record **full width in place of the table**; it used to switch to split view. Its close button brings the table back, and split view still opens records in the right panel.
- **List page loading placeholders for each view mode:**
  - the page-load skeleton matches what will show: the table in table view, or the list and the record panel in split view, with the record full width or on the right when the URL names one (one panel at a time on small screens);
  - the mode comes from `?mode`, the browser's saved mode or the default;
  - rows that load show placeholder rows (columns, or a picture and two lines in split view) instead of a "Loading…" spinner;
  - a record opened from the URL shows its placeholder instead of "Select an item".
- **Form schema `modes.view.component`:** the component a form shows in view mode, in the table's right panel, the full width record and the standalone `/view/{form}/{uid}` page. Edit shows the fields.

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
    - table schema `summary_component` (now `row_component`), `details_component` (now the form's `modes.view.component`) and `details_source` (the form's `dataEndpoint`); still read;
    - component names given as view paths (`userinterface::components.lab-user-*`): use registered keys. The `lab-user-*` views moved to user-management (`user.summary`, `user.details`);
    - `/api/user-interface/v1/entity/...` and `/api/entity/...` (now served by foundation's controller);
    - the old `Iquesters\UserInterface\Services\Entity\*`, `Http\Controllers\DynamicEntityController`, `Http\Query\DynamicEntityListQuery`, `Constants\EntityListParams` and `Contracts\EntityScopeResolver` class names, which resolve to foundation's classes (`src/deprecated-aliases.php`).
- Flash messages in the app layout show as toasts (same as the auth pages), once.
- View mode shows a select's option label instead of its stored value; empty values show "—".
- Picture changer: script moved to `public/js/image-changer.js`; "Remove image" only when there is an uploaded picture; Save without pressing Crop crops the current selection (it uploaded a blank image); the default crop is the largest centred square.
- Phones: page content and toasts stay above the bottom module bar; upload buttons show their labels; the auth card uses less padding.

### Fixed
- **Minibar labels were cut off** ("oundation"): a vertical tab was 80px wide in the 70px minibar. Tabs now fill the bar and labels wrap to two lines. Module names read as words ("User Interface"; a module can set the `module_label` meta).
- **The Organisations page opened user-interface's sidebar** (Dashboard, Forms, Tables, Navigation): user-interface's seeder still declared an "All Organisations" item, which belongs to the organisation module. Removed; `user-interface:seed` hides it. User-interface's own "Navigation" item (the module order table) is now "Module order", apart from foundation's Navigation editor.
- **Tabs that differ only by query string** (e.g. `?status=approved`): such a tab is active when the page has its values (other parameters such as `?mode=table` may be there too). Before, every tab of the page matched its path and the last one was highlighted.
- Merged Track B (user-interface#55): its updated entity API test expectations apply to the copies in foundation (`tests/Feature/EntityApiTest.php`, `EntityPermissionTest.php`), which moved there with the entity API.
- **Form errors in a modal showed up to three times** (e.g. "The given data was invalid." twice plus the field message). The modal repeated the form's messages, once for `lab-form:*` and again for the old `shoz-form:*` alias. Now the form alone shows them: under each field, or one toast for errors not tied to a field. The modal only closes on success.
- **Errors for meta fields** (sent by the entity API as `meta.batch`) now show under the field instead of in a toast.
- **Form buttons above the fields** (e.g. "Continue" above "Email address" on `/auth/unified`): the fields wait for the record and remote options, but the form added its default buttons without waiting for them. The buttons now come after the fields.
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
