# Cloudflare letters storage

## Decision

Store letter records in Cloudflare D1 and stamp image files in Cloudflare R2. Serve both through the `we-bsite-api` Worker.

The application previously used the Supabase Data API directly from the browser. It did not use Supabase Auth, Storage, or Realtime. Replacing the client with a narrow Worker API removes the Supabase dependency without recreating unused platform features.

## Why D1 and R2

The Supabase backup contains 269 active letters and 112 archived letters. The structured records occupy 0.54 MB after migration.

Stamp images were the dominant storage and transfer cost. The backup contained 88 unique inline stamp images totaling 20.8 MB. One sender record was larger than 3 MB because it included a base64 stamp. D1 limits rows and strings to 2 MB, so storing the backup unchanged was not possible.

The migration extracts inline stamps into content-addressed R2 objects. D1 stores the Worker URL for each object. This reduces database size and lets Cloudflare cache immutable stamp responses.

Cloudflare's free allowances are shared at the account level where noted:

- D1 allows 500 MB per database and 5 GB total storage on the free account. Free row-read and row-write quotas are account-level daily allowances.
- R2 includes 10 GB-month of storage, 1 million Class A operations, and 10 million Class B operations per month for the account. R2 does not charge egress.

The migrated data uses about 0.01% of the D1 account storage allowance and 0.2% of the R2 storage allowance. An index on `(should_hide, id)` keeps public list requests from scanning hidden rows.

## API surface

The Worker exposes:

- `GET /letters?from=0&to=499` to list visible letters.
- `POST /letters` to validate and create a letter. Inline PNG and JPEG stamps move to R2 before insertion.
- `PUT /letters/:id/interactions` to replace validated interaction counters.
- `GET /stamps/:key` to serve immutable stamp objects.
- `GET /health` to report Worker and D1 availability.

The API does not expose database credentials or generic table operations. It remains publicly writable because public letter submission and anonymous interaction tracking are product requirements. Input validation limits the writable shapes and payload sizes.

## Migration

`scripts/prepare-d1-import.mjs` reads a gzipped PostgreSQL cluster dump, extracts the `public.letters` and `public.letters_archive` COPY sections, converts PostgreSQL values to SQLite values, and writes D1 SQL plus R2 stamp files.

The import preserves active and archived rows. It replaces inline PNG, JPEG, SVG, and HEIC stamps with content-addressed Worker URLs. New submissions remain limited to PNG and JPEG.

All production Wrangler commands must include `--remote`. Wrangler uses local emulator storage when the flag is omitted from D1 and R2 commands.

## Verification

The migration restored:

- 269 active rows: 209 visible and 60 hidden.
- 112 archived rows.
- 88 unique R2 stamp objects.

The production D1 database reported zero invalid JSON rows. Live Worker reads returned all 209 visible rows. Live stamp requests succeeded for PNG, JPEG, SVG, and HEIC. A remotely downloaded R2 sample matched the source file's SHA-256 hash.

The integration test runs the Worker against local D1 and R2 implementations. It covers health, validation, insertion, listing, stamp storage, interaction updates, missing records, and CORS.

## Rollback

The Supabase cluster backup remains the source rollback artifact. The application cutover occurs only when this branch is merged and deployed. Until then, the production site still uses Supabase while the Cloudflare data and Worker remain ready.
