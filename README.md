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
