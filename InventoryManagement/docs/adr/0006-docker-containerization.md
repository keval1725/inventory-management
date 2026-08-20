# ADR 0006: Docker Containerization

**Status:** Accepted
**Date:** 2026-08-18

## Context

build-roadmap.md's Phase 1 goal: Dockerfiles for API + Angular, `docker
compose up` gives a fully working app with no manual steps. This finally
gave a reachable SQL Server, closing the DB-verification gap every prior
ADR flagged as unverified.

## Decisions

**1. Migrate-on-startup, gated by `Database:AutoMigrate` config** (default
`false`, set `true` only in `docker-compose.yml`). The "zero manual steps"
requirement forces this — there's no separate migration step a human runs.
The trade-off against an explicit migration step (the alternative
build-roadmap.md explicitly asks to weigh): auto-migrate-on-startup breaks
down once there's more than one API replica (concurrent `Database.MigrateAsync()`
calls racing) — fine for a single-instance learning-project Compose setup,
wrong for the eventual Phase 8 microservices/multi-replica world. Revisit
when that matters.

**2. nginx reverse-proxies `/api/` and `/health` to the `api` service** —
same-origin from the browser's perspective, so the Docker environment needs
no CORS at all (the dev-only CORS policy from ADR 0005 stays scoped to
`Development`+local `nx serve`, untouched). This is also more
production-realistic than exposing the API cross-origin.

**3. Angular environment split (`environment.ts` / `environment.docker.ts`)
via a `docker` build configuration's `fileReplacements`** — `apiBaseUrl`
is an absolute `http://localhost:5299` for local `nx serve` (needs the dev
CORS policy) and empty string (relative, proxied by nginx) for the Docker
build. This is the environment-swap ADR 0005 explicitly deferred as
"Phase 1+ concern" — Docker is that phase.

**4. SQL auth (`sa` + password), not Windows/trusted auth, inside
containers** — trusted auth has no meaning across the container network;
the password comes from `.env` (gitignored, `.env.example` committed as
the template), never hardcoded.

**5. `npm install`, not `npm ci`, in the frontend Dockerfile.** `npm ci`
requires the lockfile to exactly match what the *same npm version* would
produce. The lockfile is generated on the host (Windows, npm 11.8.0); the
build stage runs `node:22-alpine` (npm 10.9.8) — different majors resolve
dependency ranges slightly differently, so `npm ci` failed with a different
"missing from lock file" package on every attempt even though the lockfile
was freshly regenerated each time. `npm install` tolerates the drift.
Trades strict reproducibility for a build that actually works across the
host/container npm version gap — acceptable for a learning project without
a CI pipeline yet enforcing lockfile parity.

**6. `COPY --from=build .../dist/apps/inventory-ui/browser` into nginx, not
the parent `dist/apps/inventory-ui`.** The esbuild-based `@angular/build:application`
executor always nests client output under `browser/` — unrelated to SSR
(SSR was already removed per ADR 0005). This was gotten wrong once already
in this session (`serve-static`'s `staticFilePath` was pointed at the
non-existent flat path), which silently degraded to nginx's own default
"Welcome to nginx!" page instead of erroring — worth remembering as a
sharp edge: a missing/wrong static-file path doesn't fail the container,
it just serves whatever nginx shipped with. Fixed in both the Dockerfile
and `serve-static`.

**7. `docker-compose.yml` and `.env*` live at the repo root**, not in a
`docker/` folder (master-architecture-guide's suggestion) or `infra/`
(build-roadmap.md's suggestion) — the two docs disagree, and repo-root is
the most common/discoverable convention for `docker compose up` to just
work from the project root.

## Verification

Full end-to-end live test against a real containerized SQL Server (first
time this session a live DB was reachable):
- `POST /api/v1/auth/login` with the seed admin returns a real JWT (curl).
- Browser: login → Warehouses page renders → create a warehouse → appears
  in the list as Active → deactivate → status flips to Deactivated, button
  disappears. Products page navigates and loads cleanly. Zero console errors.

## Consequences

- A genuine host-environment issue surfaced during this work, unrelated to
  the project: Docker Desktop's WSL2 VM disk lives on `C:`, which was
  completely full (0 GB free), putting the VM's filesystem into a
  read-only state and causing `docker compose build` to fail with
  low-level "read-only file system" / "exec format error" symptoms that
  looked like build problems but weren't. Freeing host disk space and a
  full Docker Desktop + `wsl --shutdown` restart resolved it. Worth
  remembering if Docker acts up again on this machine — check `C:` free
  space before debugging Dockerfiles.
- The regenerated `package-lock.json` (from a clean `rm -rf node_modules
  package-lock.json && npm install`) is meaningfully larger than what was
  there before (1837 vs ~1769 packages) — the old one had drifted stale
  across several incremental `npm install` runs during lib generation.
