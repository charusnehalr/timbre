# Timbre Backend

Next.js 14 API server — orchestration, auth, DB, queue.

## Dev

```bash
npm install
npm run dev   # port 4000
```

## DB

```bash
npm run db:generate   # generate migrations from schema changes
npm run db:migrate    # apply to Supabase
```

After migrating, run `src/db/rls.sql` in the Supabase SQL editor to apply RLS policies.

## Tests

```bash
npm run test
```
