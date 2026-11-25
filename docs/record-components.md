# Record components

A **record component** is what a list shows for a record:

| Kind | Where it is set | Where it shows |
|---|---|---|
| `summary` | table schema `row_component` | each row of the split view's list |
| `details` | form schema `modes.view.component` | the record in view mode: the split view's right panel, the full width record in table view, `/view/{form}/{uid}` |

```json
// table schema
"row_component": "user.summary"

// form schema (the table's form, e.g. user-details)
"modes": {"view": {"component": "user.details"}}
```

The record's component belongs to the form, so it shows wherever that form shows a record in view mode. **Edit** switches to the form's fields; Save or Cancel returns to the component. Without a component, view mode shows the fields.

**Deprecated, still read:**
- `summary_component` (now `row_component`);
- the table's `details_component`, used when the form has no view component;
- `details_source` (the form's `dataEndpoint` is the record source).

user-management's seeder moves its own old values.

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

- **Row component:** the list row.
- **View component:** the full record (merged with the list row in a table), so it can show what the list doesn't load. The record comes from:
  1. the form's `dataEndpoint`, e.g. the Users form reads the `user-account` business entity;
  2. otherwise the entity API (`show`) of the form's entity;
  3. in a table, the deprecated `details_source` still wins when set.

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

## List page URLs

The list page keeps its state in the URL, without reloading the page. The path says which record and what is done with it (the form mode); the query says how the page is laid out:

| URL | Shows |
|---|---|
| `/list/{table}` | the list |
| `/list/{table}/view/form/{form}/data/{uid}` | a record in view mode |
| `/list/{table}/edit/form/{form}/data/{uid}` | a record in edit mode |
| `/list/{table}/create/form/{form}` | the create form (modal) |

`{form}` is the form schema's **uid** and `{uid}` the record's. The form API (`noauth/form/{slug or uid}`) accepts either and returns the form's `schemaUid` and `schemaSlug` with its schema.

**Query parameters:**
- `?mode=table|split` decides how a record shows: **split** in the right panel, **table** full width in place of the table. It is left out when it is the table's `default_view_mode`.
- `?q=`, `?sort=` and `&dir=asc|desc`, `?page=`, `?per_page=`: the search, sort and paging.

**History:**
- Opening, closing or switching a record or the view mode adds a history entry, so Back undoes it.
- Search, sort and paging replace the current entry.
- A reload or a shared link opens the same state.
- `/view/{form}/{uid}` stays as the standalone record page, for links from outside a table.
