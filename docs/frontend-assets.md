# Front-end assets

## Third-party libraries (self-hosted by default)

The layouts load jQuery, Bootstrap JS, Font Awesome, DataTables and JSON Editor. They are listed,
with their CDN URL and SRI hash, in `resources/vendor-libraries.json`, and rendered by
`Support\VendorLibraries`:

| `vendor_assets` (user-interface conf) | Loaded from |
|---|---|
| `local` (default) | `public/libs/...`, shipped with the package (no third-party requests) |
| `cdn` | the public CDNs |

Local files are byte-identical to the CDN files (`npm run libs` verifies each against its SRI hash),
so both modes use the same `integrity` attribute. A local file that is missing falls back to its CDN URL.
DataTables and JSON Editor are not loaded on auth pages.

reCAPTCHA is loaded from Google when it is enabled (it is a Google service and can't be self-hosted).

### Updating a library

1. Change the entry in `resources/vendor-libraries.json` (CDN URL, SRI hash from the CDN, `local` path
   with the new version).
2. `npm run libs` downloads it (plus fonts/images its CSS references) and checks the hash.
3. Commit `public/libs` and remove the old version's folder.

## The module's own scripts (one bundled file)

`public/js/**/*.js` are classic scripts sharing globals. `npm run build` concatenates them, in exactly
the order the layout loads them one by one, into **`public/dist/userinterface.js`** (+ `manifest.json`
with a content hash).

| `APP_DEBUG` | The layout loads |
|---|---|
| `false` (production) | the bundle: 1 request |
| `true` (development) | the ~37 individual files, so edits show up without rebuilding |

**After changing anything in `public/js`, run `npm run build` and commit `public/dist`.** CI fails
(`npm run build:check`) when the bundle is out of date.

The URLs carry a version (`?v=` from the file's modification time) and point at the published copy
in `public/vendor/userinterface` when it is current, otherwise at `/module-assets/userinterface/...`.

## Tooling

Node 18+, no npm dependencies:

```bash
npm run build         # bundle public/js → public/dist/userinterface.js
npm run build:check   # CI: fail if the bundle is out of date
npm run libs          # download + verify third-party libraries into public/libs
```
