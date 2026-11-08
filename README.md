# Material Register

A web app for searching and filtering a catalogue of industrial materials (spare parts, consumables, raw materials and tools). The table supports search, filters, sorting and pagination, all handled by a Postgres database behind a typed API.

**Stack:** React Router v7 (SPA mode) · Mantine · TanStack Table · tRPC · zod · Drizzle ORM · PostgreSQL 17 · Node 24 · TypeScript

## Setup

### Requirements

- **Node 24.** The repo includes an `.nvmrc`, so with [nvm](https://github.com/nvm-sh/nvm) you can run `nvm install && nvm use`.
- **Docker** with Docker Compose, to run Postgres.

### Run it

```bash
cp .env.example .env          # database connection settings
docker compose up -d          # start Postgres (on port 5433)
npm install                   # install server and web dependencies
npm run db:migrate            # create the tables
npm run db:seed               # load 5,000 sample materials
npm run dev                   # start the API and the web app
```

Then open **http://localhost:5173**.

The database runs on port **5433** instead of Postgres's default 5432, so it doesn't clash with a Postgres server you may already have installed.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the API server and the web app together, reloading on file changes |
| `npm run db:migrate` | Applies the SQL migrations in `server/drizzle/` |
| `npm run db:seed` | Clears the materials and reloads the same 5,000 sample records every time |
| `docker compose down` | Stops Postgres (add `-v` to also delete its data) |

## Architecture decisions and trade-offs

Every design decision, with the reason behind it and the alternatives considered, is recorded in [docs/decisions.md](docs/decisions.md). Domain terms (Material, Plant, MPN and so on) are defined in [GLOSSARY.md](GLOSSARY.md).

## What I'd do next

1. **Natural-language search, with voice input.** Let the user type or say something like "obsolete bearings in Brisbane" and have an LLM turn it into the existing filters (Status = Obsolete, search = "bearings", Plant = 1000 · Brisbane). A microphone button would make this useful for people on the go or on a phone, who don't want to type out a query. Because the LLM would only fill in the filters, the results still come from the same database query, and the user can see and adjust what it picked.
2. **Saved and recent searches.** Since the whole table state is already in the URL, saving a search is just saving that URL with a name. A "recent searches" list could keep the last few automatically, so a planner can get back to a view they use often in one click.
3. **Faster search with trigram indexes.** Search uses "contains" matching (`ILIKE '%bearing%'`), which a normal index can't speed up, so Postgres reads every row. At 5,000 rows that takes about a millisecond, so it doesn't matter yet. For a much larger catalogue, I'd add Postgres trigram (`pg_trgm`) indexes on the three search columns and measure the difference with `EXPLAIN ANALYZE` on a seed of around 500,000 rows.

## How I used AI tools

The tools I used, what worked, and what I had to correct are logged in [docs/ai-usage.md](docs/ai-usage.md). The agent context file is [CLAUDE.md](CLAUDE.md).
