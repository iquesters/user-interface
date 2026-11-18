# Form schema data sources and info pages

## Field options from data

List options in the schema with `options: [{value, label}]`, or let the field load them.

**From master data** (filled in on the server when the schema is served):

```json
{
  "id": "theme",
  "type": "select",
  "optionsFrom": {
    "master_data": "theme",
    "exclude": ["current_theme"],
    "empty": "Application default"
  }
}
```

Options are the active children of the master data key: `value` is the child key, `label` the child value. `exclude` leaves keys out. `empty` adds a first option with value `""`.

**From an endpoint** (fetched by the browser with the user's session, so the endpoint's own auth applies):

```json
{ "id": "permissions", "type": "checkbox", "optionsFrom": { "url": "/admin/permission-options" } }
```

The endpoint returns `{"success": true, "data": [{"value": "...", "label": "..."}]}`. Use this for anything that should not be public: the schema endpoint (`/api/.../noauth/form/{slug}`) is public, so never put private data in the schema itself.

In view mode, a select or radio field shows the option label, not the stored value.

## Record from the schema's own endpoint

Entity forms load their record from the generic entity API (`entity/show/{entity}/{uid}`). When that is not enough (for example a role with its permissions), set a data endpoint:

```json
{ "entity": "roles", "dataEndpoint": "/admin/roles/{uid}/details" }
```

It returns `{"success": true, "data": {...}}`; field values are read from `data`. Point the edit mode `endpoint` at a matching route that saves the record.

## Fields per mode and view-mode display

| Key | Effect |
|---|---|
| `"showIn": ["edit"]` | The field exists only in those modes (rendered and submitted). Without it, every mode. |
| `"omitIfEmpty": true` | A blank value is left out of the submission ("new password: leave blank to keep"). |
| `"display": "status"` | View mode shows the same badge as `<x-userinterface::status>`: `badge text-bg-{value}` (colours in `public/css/bootstrap-override.css`), labelled with the option label. |
| `"display": "badge"` | View mode shows the value (or each item of a list) as a neutral badge, e.g. roles. |
| `"type": "image"` | View mode shows the value (a URL) as a square picture (`maxWidth`, `aspectRatio`). |
| `"type": "file", "crop": {"aspectRatio": 1, "maxSize": 1024}` | After choosing an image, a crop box (drag to move, corner to resize, mouse and touch) picks the area; the cropped image (PNG, at most `maxSize` px wide) is submitted instead of the original. Still validate and resize on the server. |
| `"actions": [{"label", "icon", "form", "title", "submitLabel", "danger"}]` | View mode buttons that open another form schema in a modal (on an image: a camera menu over the picture). |

View mode renders a details grid: small muted label above the value, no divider lines.

### Layout: `"defaultFieldSize": "auto"`

Set on the schema to size fields by type: one column on phones; from `md` up, short inputs (text, email, tel, select, password…) take half a row and wide content (textarea, file, image, radio and checkbox groups) the full row. A field's own `size` still wins. To end a row early, add a spacer: `{"id": "x_spacer", "type": "spacer", "size": {"xs": 12, "md": 6}}` (spacers are never submitted). Narrow single-column forms (auth pages) keep `"defaultFieldSize": 12`.

For forms that are not entity records, `modes.view.editUrl` shows the Edit icon and links it there (My Profile uses `/settings`).

## Read-only fields

`"readonly": true` shows the value as a disabled-looking input in edit mode (it is still sent; validate on the server). In view mode every field is read-only anyway.

## Help, Privacy and Terms pages

`/help`, `/privacy-policy` and `/terms-conditions` (route names `ui.help`, `ui.privacy`, `ui.terms`) are public. On install the templates are published to `resources/views/vendor/userinterface/pages`; Laravel uses the app's copy, and later installs never overwrite it.

1. Fill in the details at the top of each page (company name, email, address, governing law).
2. Review the text (with your legal adviser for privacy and terms).
3. Set `$isTemplate = false` to hide the "template page" note (shown only with APP_DEBUG on or to super-admins).

To publish them again: `php artisan vendor:publish --tag=userinterface-pages`.

To link pages hosted elsewhere, set `help_url`, `privacy_url` or `terms_url` in the user-interface settings. The user menu and page footers then open that URL in a new tab.
