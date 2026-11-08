# AI Usage Log

Running notes for the README's "How I used AI tools" section: which tools, what worked, and what had to be corrected.

## Tools

- **Claude Code** (Claude Opus 5.5) in VS Code.
- **Matt Pocock's skills plugin** for Claude Code:
  - `grill-with-docs` ran the design interview: the agent asks numbered questions about the brief, suggests approaches, records domain terms in `GLOSSARY.md`, and records decisions as they're made.

## Log

### 2026-11-07 / 08: Design session (before any code)

- **Worked:** The agent read the take-home brief and began recording decisions needed to build
- **Worked:** The agent checked my machine before recommending a setup.
  - It found **Node 20.0.0**, which is end-of-life and too old for current Vite, so we chose Node 24 via nvm.
  - It found a **local Postgres 12 already on port 5432**, so the Docker database uses 5433.
- **Corrected (by me):** I asked why Description would be sortable. The agent explained that noun-first descriptions (commonly used in SAP) make alphabetical sorting group similar items, and I kept it.
- **Improved (by me):** Agent suggested a silent default filter for Active status, I said make an "Active only" checkbox as a shortcut so it stays explicit. 
- **Corrected (by me):** I asked what `--count` on the seed script actually does for us. It only matters for the optional speed test, so the agent agreed it was premature to build now.
- **Corrected (by me):** I asked whether the plant foreign key was the plant code. The agent had put the code in the URL design without deciding the database key, which was a gap in its plan. That led to the primary key and `ON UPDATE CASCADE` decisions.
- **Corrected (by me):** The agent offered to write a formal Architecture Decision Record (ADR) for the plant key. I declined: too much process for a take-home.
- **Corrected (by me):** Removed jargon ("batteries-included", "vendored UI") from README for sake of readability / conciseness. Added rule to context file.

### 2026-11-08: Build

- **Worked:** The agent built and checked each layer before moving on: ran the migration and showed the generated SQL, ran the seed twice to confirm identical data, tested the API with curl (search, sort, bad input), then took headless-browser screenshots of the page, including a bad URL and the empty states.
- **Caught (by the agent):** `npm install typescript` pulled in TypeScript 7, a brand-new rewrite. The agent pinned 5.9 so React Router's tooling wouldn't break.
- **Caught (by the agent):** Docker was pointed at Docker Desktop, which wasn't running. The agent used the normal Docker engine for its commands instead of changing my settings. I ran 'docker context use default' in terminal for later
- **Caught (by the agent):** The agent first put the shared status/type lists in the database schema file, which would have pulled database code into the browser bundle. It moved them into the zod schemas file.
- **Agent mistake, self-corrected:** React Router's `typegen` command quietly added a package (`isbot`) and ran its own install inside `web/`, which removed packages from the shared install. The agent noticed the failure and repaired it with a clean root install.
- **Agent mistake, self-corrected:** The agent started the dev servers on the old Node 20 (its shell doesn't load nvm) and got a misleading "DATABASE_URL is not set" error; restarted on Node 24.
- **Corrected (by me):** Removed the "Active only" checkbox because it was duplicative / confusing.