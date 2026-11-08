# Material Register: Design Decisions

Decisions made by me as a result of the design grilling session. Domain terms are defined in [GLOSSARY.md](../GLOSSARY.md).

## Decided

### Domain model

- **One Material, one Plant.** Each Material has a single Material Number and belongs to exactly one Plant. Quantity on Hand is the stock at that Plant.
  _Why:_ Follows the brief's suggested schema. SAP stores plant data separately per plant; the README will mention this simplification.
- **Plants and Manufacturers are their own tables.** Materials link to both by foreign key. The MPN is stored on the Material.
  _Why:_ The scenario filters by manufacturer ("bearings from SKF"), and a table avoids spelling variants like "SKF" vs "S.K.F.".
- **Material Type and Status are Postgres enums** (`pgEnum` in Drizzle).
  _Why:_ They are fixed lists. The database rejects bad values, and the same lists feed the zod schemas.

### Database

- **The Plant's code is its primary key** (stored as text), and `materials.plant_code` is the foreign key.
  _Why:_ SAP plant codes are short and stable, and they're how SAP data refers to a plant, so synced Materials insert without a lookup. The URL, the filter and the foreign key all use the same value. Text, not a number, because codes can contain letters or leading zeros (`0001`, `AU01`).
- **Foreign key rules:**
  - `materials.plant_code`: `ON UPDATE CASCADE ON DELETE RESTRICT`. A code change updates every Material that points at it automatically; deleting a Plant that still has Materials is refused.
  - `materials.manufacturer_id`: `ON DELETE RESTRICT` (an id never changes, so it doesn't need the update rule).
  _Why:_ This removes the main downside of using the code as the key, and Materials can't be left pointing at nothing.
- **Materials and Manufacturers keep an auto-numbered `id` primary key.** Material Number has its own unique index.
  _Why:_ Material numbers do sometimes get renumbered in catalogue clean-ups, nothing references a Material by foreign key, and `id` is the sort tie-breaker. Manufacturer names aren't reliable identifiers.
- **Unit Price is `numeric(12,2)`, in AUD.** Currency is fixed and not stored per row.
  _Why:_ Exact decimal values, with no floating-point rounding errors. Drizzle returns `numeric` as a string (`"12.50"`); the front end only formats it for display and never does maths on it.
- **Indexes:**
  - Unique index on Material Number (it's the identifier).
  - Indexes on the Plant and Manufacturer foreign key columns. Postgres doesn't create these automatically, and the Plant and Manufacturer filters use them.
  - No indexes on Status or Material Type: with only 3–4 values each, an index barely helps.
  - No indexes on sort columns: at 5k rows, sorting in memory takes about a millisecond.
  _Why:_ Index what the queries actually need. The README explains what was skipped and why.
- **Migrations: `drizzle-kit generate` + `drizzle-kit migrate`.** Generate writes SQL migration files that get committed; migrate applies them.
  _Why:_ Reviewers can read the actual SQL, and setup is reproducible. `drizzle-kit push` (sync with no files) was the alternative.

### Seed data

- **Realistic, repeatable seed data.**
  - Hand-written lists of real manufacturers (SKF, Timken, Siemens, ABB, Parker…) and about 6 Australian Plants.
  - Noun-first description templates per Material Type ("Bearing, deep groove ball, {n}mm bore").
  - `faker.seed(42)`, a fixed random seed, so every machine gets the identical 5,000 Materials and README examples match what reviewers see.
  - Last Updated dates are generated relative to a fixed date written in the script, not today, so they also match everywhere.
  _Why:_ Purely random faker text looks fake. Repeatable data makes the demo, README examples and any bugs predictable.
- **The seed always creates exactly 5,000 Materials.** No `--count` option unless the trigram speed test goes ahead.
  _Why:_ The option only matters for the speed test, so building it now would be code for a feature that may never exist.
- **`npm run db:seed` wipes and reloads** Materials, Plants and Manufacturers every time.
  _Why:_ Safe to run twice, and with the fixed random seed it always gives the same data. Refusing to run when data exists would matter for real data, not a local demo database.

### API

- **tRPC + zod.**
  _Why:_ The front end gets the server's types directly, so a changed field shows up as a compile error, not a runtime bug. zod validates input on the server (like Pydantic), and the same schema also validates the URL's search params.
- **Offset pagination** (`page` + `pageSize` + total count), with `id` as the last sort key.
  _Why:_ Numbered pages fit in a shareable URL and work with sorting on any column. At 5k rows, counting is cheap. The `id` tie-breaker stops rows with equal sort values from jumping between pages.
  _Next with more time:_ keyset pagination if the catalogue grew to millions of rows.
- **tRPC's standalone adapter for HTTP**, with Vite's dev server forwarding `/trpc` requests to it.
  _Why:_ The least code. The browser only talks to one address, so no CORS setup is needed.

### Search and filters

- **Search matches each word separately.** The input is split on spaces, every word must match, and each word can match Material Number, Description or MPN. Blank input is ignored.
  _Why:_ "bearing 25mm" should find "Bearing, deep groove ball, 25mm bore". Manufacturer and Plant aren't searched because they have their own filters.
- **Four filters:** Status and Material Type as multi-select; Plant and Manufacturer as single-select searchable dropdowns. Values within one filter combine with OR, and filters combine with AND. Each filter has its own clear (✕), and there's a "Clear all" button.
- **The default view shows every Material, including Obsolete.** There are no hidden filters, so the URL fully describes what's on screen.
- **No "Active only" checkbox.** One was built as a shortcut for the Status filter, then removed after using the app.
  _Why:_ It duplicated the Status filter, which already does the same thing in one click.
- **Sortable columns: Material Number, Description, Quantity on Hand, Unit Price, Last Updated.** The default sort is Material Number ascending. Clicking a column header cycles through ascending → descending → off.
- **Description is sortable.**
  _Why:_ Material descriptions are written noun first ("Bearing, deep groove ball, 25mm bore"), a common catalogue naming standard, so sorting alphabetically groups similar items together (all bearings, then belts, then gaskets).

### URL state

- **URL format:**
  ```
  /materials?q=bearing+25mm&status=active,pending_review&type=spare_part&plant=1000&manufacturer=12&sort=description.asc&page=2&pageSize=50
  ```
  - Multi-select filters are comma-separated.
  - Plant uses its code (`1000`); Manufacturer uses its id.
  - Sorting is one parameter: `sort=column.direction`.
  - Page size is 25, 50 or 100, defaulting to 25.
  - Default values are left out, so a fresh page is just `/materials`.
- **Bad or out-of-date URLs don't error.**
  - Each invalid value quietly falls back to its default, one field at a time: a bad `status` is dropped, but a valid `q` is kept (zod's `.catch()`).
  - A page past the end shows the empty state with a "Go to last page" button.
  _Why:_ Shared links still open something useful after data or code changes.

### Front end

- **React Router v7 framework mode with `ssr: false`** (React Router's official "SPA mode").
  _Why:_ Matches the brief's "React Router v7 SPA" wording; the build outputs static files.
- **Mantine for components, TanStack Table (manual mode) for table logic.**
  _Why:_ Mantine comes with the pieces the brief needs already built (debounced input, clearable dropdowns, pagination, loading states). shadcn/ui copies component source into the repo, which would mean extra code I didn't write and would need to explain. TanStack Table keeps columns in one list, so adding a column is a one-line change; "manual mode" means sorting and paging happen on the server.
- **Loading, empty and error states:**
  - First load: skeleton rows (grey placeholder bars).
  - Later loads (new search, filter, page or sort): the current rows stay on screen, dimmed, with a small spinner, instead of flashing to blank (TanStack Query's `keepPreviousData`).
  - Empty: "No materials match your search" with a "Clear all filters" button.
  - Error: a red alert with the message and a "Try again" button. Filters stay as they were.
  - Always shown: a result count such as "Showing 26–50 of 1,234".
- **Table columns (all 11):** Material Number · Description · Material Type · Manufacturer · MPN · Plant (`1000 · Brisbane`) · Status (coloured badge) · UoM · Quantity on Hand · Unit Price (`$12.50`) · Last Updated. Numbers are right-aligned, and the table scrolls sideways on narrow screens.
  _Why:_ Planners need MPN and stock at a glance.

### Tooling and repo

- **Node 24 (current LTS), installed with nvm**, and pinned with `.nvmrc` and `engines` in `package.json`.
  _Why:_ The installed Node 20.0.0 is end-of-life and too old for current Vite.
- **npm workspaces with two packages:** `server/` (Node + tRPC + Drizzle) and `web/` (React Router + Mantine). One root `npm run dev` starts both.
  _Why:_ The web app needs to import the server's router type. npm comes with Node, so reviewers don't need to install pnpm.
- **Docker Compose runs only Postgres.** The Node server and web app run directly on the machine.
  _Why:_ Faster reloads during development and the live interview change, and less to explain.
- **Postgres 17 in Docker, on host port 5433.**
  _Why:_ 5432 is Postgres's default port and is already used by a local Postgres 12 on this machine (reviewers may have the same). Docker maps host 5433 to the container's 5432.
- **Public GitHub repo**, created on the GitHub website and pushed with plain `git` (`gh` isn't installed). `git init` happens before any code is written.

## Dropped

- **Faster search with trigram indexes (`pg_trgm`).** Not doing it: the core comes first. With more time, add GIN trigram indexes on the three search columns and measure them with `EXPLAIN ANALYZE` on a ~500k-row seed (5k rows is too small to show a difference). The seed script would need a `--count` option for that.
- **No `/to-tickets` and no ADRs.** Build directly from this file.

## Open

None.
