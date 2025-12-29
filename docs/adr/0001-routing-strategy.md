# ADR-0001: Routing Strategy for UI Tables

## Status
Accepted

## Context
The UI needs to expose a single route (`ui.list`) that can serve
list views for multiple tables using `table_schemas`    .

Using separate index pages and dedicated routes for each table would
introduce unnecessary duplication and make schema-driven UI behavior
harder to maintain.

## Decision
We decided to **not use individual index pages or their dedicated routes**.

Instead, a **single generic route (`ui.list`)** is used to render list views
for all tables, with behavior driven dynamically by records in
`table_schemas`.

- **Deprecated routes**
  - `form.list (Forms)`
  - `table.list (Tables)`
  - `navigations.index (Navigation)`
  - `entities.index (Entities)`