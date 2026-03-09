# Viewport Height And Table JS

## Viewport Height

The shared viewport height behavior lives in `public/js/viewport-height.js`.

It is auto-loaded by the package asset discovery in `Iquesters\UserInterface\UserInterfaceServiceProvider::getJsAssets()`, so pages do not need a Blade include.

### How to use it

Add `data-auto-viewport-height` on the page wrapper.

```blade
<div
    class="d-flex flex-column"
    data-auto-viewport-height
    data-viewport-height-offset="8"
    data-viewport-height-min="360"
>
    ...
</div>
```

### Supported data attributes

- `data-auto-viewport-height`
  - Enables the behavior.
- `data-viewport-height-offset="8"`
  - Subtracts extra pixels from the available viewport height.
- `data-viewport-height-min="360"`
  - Sets the minimum computed height.
- `data-viewport-height-breakpoint="768"`
  - Applies the mobile rule below this width.
- `data-viewport-height-mobile="auto"`
  - Clears the fixed height on small screens.
- `data-viewport-height-watch="#chatView,.breadcrumbs"`
  - Recomputes height when those elements resize.

### What it watches by default

The helper already observes these common layout elements:

- `#super-admin-navbar`
- `header.sticky-top`
- `.entity-sticky-top`
- `.breadcrumbs`

### Current examples

- `resources/views/ui/list.blade.php`
- `smart-messenger/resources/views/messages/partials/chat.blade.php`

## Table JS

The main table behavior lives in `public/js/table/table.js`.

### What it does

- loads table schema from `/api/auth/table/{slug}`
- initializes a per-entity cache
- renders either standard table view or inbox view
- fetches row data from `/api/entity/{entity}`
- supports manual refresh through shared cache clearing
- supports fallback detail rendering in inbox view when no detail component is configured

### Main flow

1. On `DOMContentLoaded`, every `.lab-table` is initialized.
2. `initLabTable(tableElement)` loads the schema and creates the cache.
3. `ViewModeManager` decides whether the first render is `table` or `inbox`.
4. `renderLazyDataTable()` builds the standard DataTable.
5. `renderInboxView()` builds the split layout with left list, resizer, and right detail panel.
6. `handleAjaxFetch()` serves rows from cache or fetches from the API.
7. `prefetchNextBatch()` optionally warms the next page.

### Important functions

- `initLabTable(tableElement)`
  - Entry point for one table.
- `renderLazyDataTable(tableElement, cache, dtConfig, entityName)`
  - Standard table view.
- `renderInboxView(tableElement, cache, dtConfig, entityName, schema)`
  - Split inbox view.
- `loadDetailComponent(rightPanelEle, schema, data)`
  - Loads configured detail UI or fallback details.
- `renderFallbackDetailComponent(data)`
  - Renders all available record fields when no detail component exists.
- `handleAjaxFetch(params, callback, cache, entityName, tableElement)`
  - Cache-aware API fetch handler.
- `clearTableCache(tableElement)`
  - Clears the entity cache for refresh flows.

### Notes for future changes

- `.lab-table` is the selector used for automatic initialization.
- The list page skeleton is removed by `removeTableSkeleton(tableElement)` when initialization succeeds or fails.
- Inbox mode hides the original `.lab-table` and creates a separate `.inbox-list-table` for DataTables.
- Refresh flows should clear cache before calling DataTables reload.
- If a page needs full-height behavior, prefer the viewport data attributes instead of page-specific inline scripts.
