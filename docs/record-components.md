# Record components

A **record component** is what a table shows for a record:

| Kind | Table schema key | Where |
|---|---|---|
| `summary` | `summary_component` | each row of the list (left) |
| `details` | `details_component` | the right panel when a row is clicked |

```json
"summary_component": "user.summary",
"details_component": "user.details"
```

## Choosing what the right panel shows

1. the `details_component`, if set;
2. otherwise the table's form in view mode (`form_schema_uid`);
3. otherwise the default row view.

When a table has both a component and a form, the panel shows the component with an **Edit** button that opens the form.

## Where components live

The module that owns the data keeps them, one folder per record type:

```
{module}/resources/views/records/{type}/summary.blade.php
{module}/resources/views/records/{type}/details.blade.php
```

It registers them **by key** in its service provider (only when user-interface is installed):

```php
if (class_exists(\Iquesters\UserInterface\Support\RecordComponents::class)) {
    app(\Iquesters\UserInterface\Support\RecordComponents::class)
        ->register('user.details', 'usermanagement::records.user.details', 'details', 'User details with roles');
}
```

Schemas only store the key, so a file can move without breaking them. The template endpoint (`GET /api/user-interface/v1/components/templates/{key}`) serves registered keys only.

Before keys existed, schemas used a fully qualified view name (`userinterface::components.lab-user-details`). These still work but are **deprecated**: the response says `"deprecated": true`. user-management's seeder upgrades its own old values to keys.

## Format

A component is HTML with `__PLACEHOLDER__` tokens, plus a `<script type="application/json" data-component-bindings>` block that says how to fill each token from the record. The browser fills them in, and every value is inserted as text. Blade is only used to build the HTML once, never per record.

| Binding `type` | Fills the token with |
|---|---|
| `text` | the first non-empty value of `paths` (or `fallback`) |
| `template` | `template` with `__FIELD__` tokens from `fields` (or `fallback_template` when `condition` is empty) |
| `key_value_rows` | one `row_template` per row that has a value |
| `badges` | one badge per item of a value or list, e.g. role names, inside `template` (`__BADGES__`) |

**Paths:**
- `name` reads a field;
- `labels.roles` reads a nested value;
- `meta:phone` reads a meta value.

List several paths to fall back from one to the next.

## The record a component reads

- **Summary component:** the list row.
- **Details component:** the list row merged with the full record, so it can show what the list doesn't load. The record comes from:
  1. the table schema's `details_source`: an entity table, or `business-entity/{slug}`;
  2. otherwise the table's form's `dataEndpoint`, e.g. the Users form reads the `user-account` business entity;
  3. otherwise nothing: the row alone.

A business entity record carries readable names of its references in `labels`:

```json
"roles": ["3", "5"],
"labels": {"roles": ["Admin", "Editor"], "company": "Acme"}
```

So `{"type": "badges", "paths": ["labels.roles"]}` shows a user's roles. Nothing is specific to roles: any reference of any business entity is available the same way.

## Stored components (later)

`RecordComponents` first asks every `Contracts\RecordComponentSource` bound with the tag `record-component-sources`, then the registered files. A database-backed source would:
- store `{key, kind, html, bindings, status, version}`;
- be edited in an admin screen;
- override a module's file with the same key, with no schema change.

Rules for stored components: HTML and bindings only (never Blade or PHP), values inserted as text, edited by admins.
