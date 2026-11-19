# Dynamic Entity API (moved)

The entity API and the business entity API are served by **iquesters/foundation** since 2.1:

- `/api/foundation/v1/entity/{list|show|store|update|delete}/...`: foundation `docs/developer/entity-api.md`
- `/api/foundation/v1/business-entity/{list|show|store|update|delete}/...`: foundation `docs/developer/business-entity-api.md`

The old `/api/entity/...` and `/api/user-interface/v1/entity/...` URLs and the old `Iquesters\UserInterface\Services\Entity\*` class names still work as deprecated aliases until 3.0.

This module's JS builds the URLs with `entityApiUrl()` / `entityRecordUrl()` in `public/js/api-client.js`. Set `window.ENTITY_API_BASE` before that file loads to point elsewhere.
