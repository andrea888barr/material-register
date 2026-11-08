# Material Register

A search/filter/sort/paginate table over ~5,000 material records. All table logic runs in Postgres, and the web app keeps its state in the URL.

## Stack

- `server/`: Node 24 + TypeScript, tRPC v11 (standalone HTTP adapter, port 3001), zod v4, Drizzle ORM, postgres.js
- `web/`: React Router v7 in SPA mode (`ssr: false`), Mantine v8, TanStack Table v8 (manual sorting and pagination), tRPC React Query client. Vite forwards `/trpc` to the server.
- Postgres 17 in Docker Compose, on host port **5433** (not 5432)

## Commands (run from the repo root)

- `npm run dev`: starts the API and the web app (http://localhost:5173)
- `npm run typecheck`: type checks both packages. Run it after every change.
- `npm run db:generate`: creates a SQL migration after editing `server/src/db/schema.ts`
- `npm run db:migrate` / `npm run db:seed`: apply migrations, or wipe and reload the deterministic seed data

## Where things live

- `server/src/materials/schemas.ts`: the zod `listMaterialsInput` (the full table state) plus the shared enum value lists. The web app imports this file, so it must only import zod.
- `server/src/materials/listMaterials.ts`: builds the WHERE / ORDER BY / LIMIT query
- `server/src/router.ts`: tRPC procedures (`materials.list`, `plants`, `manufacturers`)
- `web/app/materials/urlState.ts`: URL ⇄ table state. Invalid values fall back to defaults one field at a time, and defaults are left out of the URL.
- `web/app/materials/columns.tsx`: table columns. Column ids match the API's sort column names.
- `web/app/materials/Filters.tsx`: search box (debounced) and filters
- `web/app/routes/materials.tsx`: the page (table, pagination, loading/empty/error states)

## Making common changes

- **New column**: add the field to the `select` in `listMaterials.ts`, then add a `column.accessor` in `columns.tsx`. To make it sortable, also add it to `sortColumns` in `schemas.ts` and `sortableColumns` in `listMaterials.ts`, and set `enableSorting: true`.
- **New filter**: add the field to `listMaterialsInput`, add a condition in `buildWhere`, add parse and serialise lines in `urlState.ts`, add the control in `Filters.tsx`, and add it to `clearAll` and `hasFilters`.
- **Schema change**: edit `schema.ts`, run `npm run db:generate` and then `npm run db:migrate`, and update `seed.ts` if the column is required.

## Writing style

In the README, docs, commit messages and notes, use plain, descriptive language instead of developer slang or idioms. Say what something does ("comes with these features built in") rather than using a label ("batteries-included"). If you use a technical term, make sure it's the official one, not your own phrasing, and say which it is when it's unclear.

## Agent skills

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`. Use the glossary's terms (Material, Plant, Plant Code, Manufacturer, MPN, Quantity on Hand…).
