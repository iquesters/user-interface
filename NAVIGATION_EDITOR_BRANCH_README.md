# Navigation Editor Branch Notes

This branch is a work-in-progress refactor of the Navigation Editor workflow.
The main goal is to stop loading the full navigation tree up front and instead
load children only when the user selects a parent node.

## What The Navigation Editor Is

The Navigation Editor is the internal admin tool used to inspect and edit the
application's navigation structure. It exists so the team can manage how
modules, sidebar entries, and tabs are connected without editing raw database
rows by hand.

It is especially useful because navigation in this app is not a single flat
list. A module can own sidebar items, and those sidebar items can own tabs.
This editor gives us a dedicated place to browse that hierarchy and update the
JSON payload attached to each navigation record.

## What This Branch Is Trying To Do

- Keep the navigation editor UI visually similar to the old version.
- Change the workflow so navigation children are fetched lazily.
- Use a temporary GET API to fetch only the immediate children of the currently selected node.
- Support the hierarchy:
  - minibar module -> sidebar items -> tabs
- Make the module dropdown drive the first child-load request.
- Keep the editor panel side-by-side with the navigation selector.

## Current Routes Added

These routes were added in `routes/web.php`:

- `GET /navigation-editor`
- `PUT /navigation-editor/update/{navigation_uid}`
- `GET /navigation-editor/children/{parent_uid}`
- `GET /navigation-editor/live/{module_uid}`
- `GET /navigation-editor/sidebar/{module_uid}`

## Key Files Changed

- `src/Http/Controllers/NavigationEditorController.php`
- `resources/views/navigation-editor/index.blade.php`
- `routes/web.php`

There are also related changes in:

- `resources/views/components/module-tabs.blade.php`
- `database/seeders/UserInterfaceSeeder.php`
- `public/js/navigation/navigation-renderer.js`
- `public/css/1-userinterface.css`
- `src/UserInterfaceServiceProvider.php`
- `resources/views/layouts/sidebar.blade.php`

Those other files were part of the broader navigation UI work and may be relevant
to the final behavior, but the navigation editor refactor itself is centered on
the three files above.

## Controller Behavior

### `index()`

- Loads the available modules.
- Builds the navigation tree.
- Does not auto-select a module on first load.
- Only restores a selected node when the request contains explicit selection
  query params such as:
  - `selected_uid`
  - `edit_uid`
  - `node_id`
  - `navigation_uid`

### `children($parent_uid)`

This endpoint is the temporary lazy-load API.

Current intent:

- If the request parent is a module:
  - return the module's immediate sidebar children
- If the request parent is a sidebar node:
  - return its tab children

The branch tried multiple strategies during development:

- `module_has_navigations`
- `ref_parent`
- reusing the built navigation tree
- using `module_uid` and `module_id` interchangeably

The current code tries to be tolerant of both `module_id` and `module_uid`
lookups, because the relationship data in this app is not fully consistent
across all places.

## Frontend Behavior

### Module dropdown

- The left panel has a module `<select>`.
- The dropdown is meant to trigger an AJAX GET call when the user changes
  selection.
- The selected module is then rendered as a card with:
  - title
  - description
  - edit button
- A second dropdown is meant to appear for that module's immediate children
  (sidebar items).

### Edit button

- The edit button should load the JSON editor for the selected navigation row.
- This was fixed at one point so that the editor stopped redirecting back to
  `user-interface`.
- The page currently preserves the side panel when the edit view reloads.

### Initial page state

- The page should start with no module selected by default.
- It should not auto-load the first module.
- If the page is opened from an explicit edit URL, it should rehydrate the
  selected module state.

## Data Model Assumptions

The navigation structure uses a few related concepts:

- `modules`
  - the actual module records
- `navigations`
  - navigation records for sidebar items and tabs
- `navigation_metas`
  - stores JSON payloads for individual navigation nodes
- `module_has_navigations`
  - bridge table linking modules to navigation rows

Important detail discovered during this work:

- `module_navigation` is a wrapper-style navigation record.
- The real module relationship is stored inside the navigation payload using:
  - `module_uid`
  - `target_module_uid`
- Sidebar items and tabs are not loaded as a single prebuilt tree in the UI
  anymore; they are meant to be fetched on demand.

## Important Files To Inspect Next

If you are continuing this work, start here:

1. `src/Http/Controllers/NavigationEditorController.php`
2. `resources/views/navigation-editor/index.blade.php`
3. `resources/views/components/module-tabs.blade.php`
4. `database/seeders/UserInterfaceSeeder.php`

## What Has Been Tried Already

The following approaches were attempted during this branch:

- rendering cards for all modules up front
- replacing cards with a module dropdown
- auto-loading children on page load
- loading module children from `ref_parent`
- loading module children from `module_has_navigations`
- loading module children from the built navigation tree
- using module ID and UID interchangeably
- rehydrating selection state from query params after edit

## Known Current Problem

The sidebar dropdown still does not populate reliably for the selected module.
The most likely cause is a mismatch between:

- the value being sent from the module dropdown
- the identifier expected by `module_has_navigations`
- the actual relationship data stored for the module wrapper record

In other words, the wiring is present, but the selected module ID/UID still does
not consistently resolve to the child navigation rows.

## Suggested Next Debug Step

If you continue from here, the most useful next step is:

1. Log the exact selected module value from the dropdown.
2. Inspect the response from `GET /navigation-editor/children/{parent_uid}`.
3. Compare that response against the rows in `module_has_navigations` and the
   corresponding navigation meta payload.

That should reveal whether the remaining issue is:

- a frontend value mismatch
- a backend lookup mismatch
- or an unexpected data shape in the relationship table
