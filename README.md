# we-bsite

a (we)bsite for us

## Setup

The Next.js site reads and writes letters through a Cloudflare Worker. The Worker stores letter records in D1 and stamp images in R2.

1. Run `npm install`.
2. Copy `.env.template` to `.env.local` if you need to point the site at a different Worker.
3. Run `npm run dev`.

## Database

Apply D1 migrations with `npm run db:migrate`. Deploy the API with `npm run worker:deploy`.

To convert a Supabase cluster backup, run:

```sh
npm run db:prepare-import -- \
  /path/to/db.backup.gz \
  .context/d1-import \
  https://we-bsite-api.spencerc99.workers.dev
```

The command writes D1-compatible SQL and content-addressed stamp files under `.context/d1-import`. The generated SQL deletes the current contents of `letters` and `letters_archive` before restoring the backup.

Apply the schema, upload stamps, import the records, and deploy the Worker:

```sh
npm run db:migrate
npm run db:upload-stamps -- .context/d1-import/stamps
npx wrangler d1 execute we-bsite \
  --remote \
  --config worker/wrangler.jsonc \
  --file .context/d1-import/letters.sql
npm run worker:deploy
```

The upload and database commands use explicit remote flags. Without them, Wrangler writes to local emulator storage.
