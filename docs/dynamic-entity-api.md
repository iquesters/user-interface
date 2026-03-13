# Dynamic Entity API

## Scope
This document describes the generic dynamic entity API exposed by `DynamicEntityController`.

## Endpoints
- `GET /api/entity/list/{entity_name}`
- `GET /api/entity/show/{entity_name}/{data_uid}`
- `POST /api/entity/store/{entity_name}`
- `PUT /api/entity/update/{entity_name}/{data_uid}`
- `DELETE /api/entity/delete/{entity_name}/{data_uid}`

## Store Flow
1. Resolve the target table from `{entity_name}` and confirm it exists.
2. Resolve the matching entity definition from the `entities` table by looking up the entity meta `table_name`.
3. Build main-field definitions from `entities.fields` and meta-field definitions from `entities.meta_fields`.
4. Build a writable main-column allowlist from the entity table plus the entity field definition.
5. Split request data into:
   - main table payload using only declared, writable main fields
   - explicit `meta` payload using only declared meta fields
6. Validate required and nullable rules from the entity definition before writing.
7. Normalize values by field definition type before insert.
8. Apply system defaults such as `uid`, `status`, `created_by`, `updated_by`, `created_at`, and `updated_at` when those columns exist.
9. Insert the main row inside a transaction.
10. Insert meta rows linked by `ref_parent` when a related meta table exists.
11. Return the created record in the standardized API response format.

## Update Flow
1. Resolve the target table from `{entity_name}` and confirm it exists.
2. Resolve the incoming `{data_uid}` against the table `uid` column when present, otherwise `id`.
3. Resolve the matching entity definition from the `entities` table by looking up the entity meta `table_name`.
4. Build main-field definitions and meta-field definitions from the entity definition.
5. Build a writable main-column allowlist from the entity table plus the entity field definition.
6. Split request data into:
   - main table payload using only declared, writable main fields
   - explicit `meta` payload using only declared meta fields
7. Validate required and nullable rules from the entity definition before writing.
8. Normalize values by field definition type before update.
9. Apply update audit defaults such as `updated_by` and `updated_at` when those columns exist.
10. Update the main row inside a transaction.
11. Upsert meta rows linked by `ref_parent`.
12. Return the updated record in the standardized API response format.

## Delete Flow
1. Resolve the target table from `{entity_name}` and confirm it exists.
2. Resolve the incoming `{data_uid}` against the table `uid` column when present, otherwise `id`.
3. Require a `status` column to support soft delete semantics.
4. Update the record status to `deleted`.
5. Fill `updated_by`, `updated_at`, `deleted_by`, and `deleted_at` when those columns exist.
6. Return the soft-deleted record in the standardized API response format.

## Type Handling
- Main-field and meta-field types are resolved from the entity definition, not trusted from the frontend payload.
- Integer-like fields are cast to integers.
- Decimal and float fields are cast to numeric values.
- Boolean fields accept standard boolean-like inputs.
- JSON fields accept arrays or valid JSON strings.
- Date and time fields are normalized with Carbon.
- `password` fields are hashed before insert.

## Error Handling
- Duplicate unique constraint violations return `409 Conflict`.
- Foreign key constraint violations return `409 Conflict`.
- Not-null constraint violations return `422 Unprocessable Entity`.
- Invalid request values return `400 Bad Request`.
- Missing target tables return `404 Not Found`.

## Meta Handling
- Only meta keys declared in `entities.meta_fields` are accepted for persistence.
- Explicit `meta` payload is supported and is the expected form submit shape.
- Meta records are stored using `ref_parent`, `meta_key`, and `meta_value`.

## Form Submit Contract
- Generic rendered forms submit to the dynamic entity API using the entity table name, for example `POST /api/entity/store/test_entities`.
- The frontend payload shape is:

```json
{
  "title": "Example title",
  "summary": "Example summary",
  "meta": {
    "notes": "Example note"
  }
}
```

- Main table fields are sent as top-level keys.
- Meta fields are sent inside the `meta` object.
- The frontend uses the shared `apiClient` so submit requests follow the same auth and credential handling as dynamic table requests.

## Defense In Depth
- The controller keeps a separate writable main-column guard in addition to entity-definition validation.
- This extra check intentionally limits writes to declared main-table columns only.
- A code comment marks this guard as removable later if entity-definition resolution becomes the only trusted validation source.
