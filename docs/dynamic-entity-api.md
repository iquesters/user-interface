# Dynamic Entity API

## Scope
This document describes the generic dynamic entity API exposed by `DynamicEntityController`.

## Endpoints
- `GET /api/entity/list/{entity_name}`
- `GET /api/entity/show/{entity_name}/{data_uid}`
- `POST /api/entity/store/{entity_name}`

## Store Flow
1. Resolve the target table from `{entity_name}` and confirm it exists.
2. Read the table columns and column types dynamically from the schema.
3. Split request data into:
   - main table columns
   - meta payload for the related `_meta` or `_metas` table
4. Normalize values by detected column type before insert.
5. Apply system defaults such as `uid`, `status`, `created_by`, `updated_by`, `created_at`, and `updated_at` when those columns exist.
6. Insert the main row inside a transaction.
7. Insert meta rows linked by `ref_parent` when a related meta table exists.
8. Return the created record in the standardized API response format.

## Type Handling
- Integer-like columns are cast to integers.
- Decimal and float columns are cast to numeric values.
- Boolean columns accept standard boolean-like inputs.
- JSON columns accept arrays or valid JSON strings.
- Date and time columns are normalized with Carbon.
- `password` columns are hashed before insert.

## Error Handling
- Duplicate unique constraint violations return `409 Conflict`.
- Foreign key constraint violations return `409 Conflict`.
- Not-null constraint violations return `422 Unprocessable Entity`.
- Invalid request values return `400 Bad Request`.
- Missing target tables return `404 Not Found`.

## Meta Handling
- Unknown request keys are treated as meta data when a related meta table exists.
- Explicit `meta` payload is also supported.
- Meta records are stored using `ref_parent`, `meta_key`, and `meta_value`.
