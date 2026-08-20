# CLAUDE.md

This file is read automatically at the start of every Claude Code session in
this repo. Read it, and the docs it points to, before doing anything else.

## Project

Inventory & Warehouse Management System. Learning project — the goal is
understanding *why* each architectural piece exists, not shipping fast.
Backend: .NET 10, Clean Architecture, modular monolith (splits into
microservices in Phase 8). Frontend: Angular 22, Nx workspace, NgRx.

## Read these before starting any task

- `docs/inventory-master-architecture-guide.md` — full 12-phase roadmap and the working rules (read this in full first)
- `docs/backend-architecture.md` — authoritative backend conventions
- `docs/frontend-architecture.md` — authoritative frontend conventions
- `docs/inventory-project-ai-guide.md` — how to work with me effectively, and the Forecasting Service spec for Phase 12

## Non-negotiable working agreement

1. **Propose before implementing.** For every task — and any non-trivial
   decision within a task — explain the approach, options, and trade-offs.
   Wait for explicit approval ("approved", "go ahead", "yes") before
   writing code. Never implement in the same turn you propose.
2. **One task at a time, current phase only.** Don't jump ahead — check
   "Current status" below before starting anything.
3. **Small, reviewable diffs.** One entity, one endpoint, one component at a time.
4. **Explain new concepts** the first time they're introduced (Redis,
   RabbitMQ, Kafka, Azure services, NgRx patterns, etc.) — a few sentences,
   not a lecture.
5. **Write an ADR** in `docs/adr/` after each significant decision (10-15
   lines: context, decision, alternatives, consequences).
6. **Tests required** for new logic — concurrency and message-ordering
   cases especially, since those are where this domain's real bugs hide.
7. **Never assume silently on ambiguous requirements** — ask.
8. **Update "Current status" below** at the end of every session.

## Locked decisions (do not revisit without asking)

- Database: **SQL Server**
- Backend: .NET 10, Clean Architecture, modular monolith through Phase 7,
  MediatR CQRS, `Result<T>` pattern (not exceptions for expected failures),
  specific repositories per aggregate (no generic `IRepository<T>`),
  hand-rolled JWT (not ASP.NET Core Identity)
- Frontend: Angular 22, standalone components, Nx workspace with
  `@nx/enforce-module-boundaries` lint rules, NgRx (with `@ngrx/entity`),
  Tailwind CSS, component selector prefix `inv-`
- Testing: xUnit + FluentAssertions + Moq (backend), Jest (frontend)
- Editor: VS Code

## Current status

- Phase: **1 — Foundation, done. build-roadmap.md Phase 1 (Containerize), done.**
  Next: pick a direction (see "Open decisions" — Supplier/PO module, or
  build-roadmap.md Phase 2/master-guide Phase 2's production-hardening topics).
- User granted autonomy to build through Phase 0 (2026-08-18) and then explicitly
  extended it through the Docker/containerization phase — ADRs and this status
  section were kept current throughout, per the standing working agreement, just
  without pausing to ask at each step. **That autonomy grant has not been
  re-extended past Docker** — next phase should go back to propose-then-approve
  unless told otherwise.

### Backend — done (Tasks B1–B6 + Identity, Product, Stock modules)

- **Warehouse module**: `Warehouse` entity (rich model, `IAuditable`/`ISoftDeletable`/
  `BaseEntity` in `Domain/Common`), EF config + migration, repository, full CQRS
  (MediatR + FluentValidation, `Result`/`ErrorCode` in Shared, `PagedResult<T>` in
  Application, `ICommand`/`IQuery` markers, Validation/Logging/Transaction pipeline
  behaviors), `WarehousesController` (`/api/v1/warehouses`). ADRs 0001, 0002.
- **Identity module**: hand-rolled JWT — `User` entity, PBKDF2 password hashing
  (`Rfc2898DeriveBytes`, not ASP.NET Core Identity), `JwtTokenService`,
  `LoginCommand`/Handler, `AuthController` at `/api/v1/auth/login`. Seed dev admin
  via migration: `admin@inventory.local` / `Admin123!` (dev-only, local DB). Built
  ahead of Product/Stock so those get `[Authorize]` from the start; retrofitted onto
  `WarehousesController` afterward. ADR 0003.
- **Product module**: `Product` entity (Name/Sku/Category, Sku unique, soft-delete),
  full CQRS, `ProductsController` (`[Authorize(Roles = "Admin,Purchasing")]` on mutations).
- **Stock module**: `StockLevel` entity (ProductId/WarehouseId as plain FKs, no
  navigation — backend-architecture.md §3), **RowVersion from day one as an EF
  shadow property**, optimistic concurrency conflicts translated to a 409 `Result`
  via `TransactionBehavior`, `StockLevelsController` (filter by warehouseId/productId,
  adjust-quantity endpoint). ADR 0004.
- CORS added (`Program.cs`, dev-only, origins from `Cors:AllowedOrigins` config) after
  a live browser test showed the Angular dev server blocked outright without it.
- **All 4 modules smoke-tested live**: 401 on unauthenticated requests, Swagger loads,
  validation short-circuits before touching the DB, DB-unreachable errors return
  proper ProblemDetails. **58/58 backend unit tests passing.**
- **Migrations verified against a real, live SQL Server** — via the Docker Compose
  stack (see below), not `DESKTOP-4HN10C4` (still unconfirmed reachable from a
  local `dotnet run`, but no longer blocking — Docker is the working path).

### Frontend — done (Nx workspace + Warehouse/Product/Stock/Login)

- `frontend/inventory-workspace/` — Nx 23.1.1 + Angular 22.0.8 (SPA, SSR removed —
  not called for anywhere in the docs), Tailwind CSS, NgRx `22.0.0-rc.0` (pinned —
  stable NgRx doesn't support Angular 22 yet). ADR 0005 covers several real tooling
  issues hit and fixed this session (Nx's newer `create-nx-workspace` demo-template
  behavior, SSR removal, the NgRx RC pin, CORS, a Jest/ESM transform fix needed on
  every data-access lib, and per-lib component-selector-prefix defaults).
- Module boundaries enforced via `@nx/enforce-module-boundaries` per
  frontend-architecture.md §3 (`scope:*`/`type:*` tags) — confirmed catching real
  violations during setup (an untagged app project, wrong selector prefixes).
- 4 domains scaffolded identically: `{domain}-data-access` (NgRx entity store +
  API service) + `{domain}-feature` (list/create/deactivate page, route-level
  lazy state registration), plus `shared-types`, `shared-data-access` (auth/error
  interceptors, `authGuard`, `TokenStorageService`), `shared-ui` (nav bar).
- **Build, lint, and test all green** (`nx build inventory-ui`, `nx run-many
  --target=lint --all`, `nx run-many --target=test --all`).
- **Fully live-verified through the Docker stack, including a real login**:
  seed admin login returns a real JWT, Warehouses page loads, create/deactivate
  both work end-to-end against the containerized SQL Server, Products page loads
  cleanly, zero console errors. This closed every "DB unreachable" verification
  gap noted earlier.

### Docker — done (build-roadmap.md Phase 1)

- `docker-compose.yml` (repo root) wires `sqlserver` + `api` + `frontend`, `.env`
  (gitignored, `.env.example` is the template) for `MSSQL_SA_PASSWORD`/`JWT_SIGNING_KEY`.
- API: migrate-on-startup gated by `Database:AutoMigrate` config (only `true` in
  Docker — see ADR 0006 for the multi-replica trade-off this doesn't hold up to later).
- Frontend: nginx reverse-proxies `/api/` and `/health` to the `api` service
  (same-origin, no CORS needed in Docker), Angular `docker` build configuration
  swaps in a relative `apiBaseUrl` via `environment.docker.ts`.
- `docker compose up --build` — **fully working, zero manual steps, confirmed live**
  (`http://localhost:8080` frontend, `http://localhost:5299` API direct).
- ADR 0006 covers several real issues hit and fixed: a host disk-space problem
  (Docker Desktop's WSL2 VM lives on `C:`, which was completely full — nothing to
  do with the project code, but looked like build failures until diagnosed), an
  `npm ci` vs `npm install` mismatch from host/container npm version differences,
  and a wrong static-file path (`@angular/build`'s esbuild output always nests
  under `browser/`, unrelated to SSR — got this wrong once, silently fell back to
  nginx's own default page instead of erroring).

## Open decisions — ask the user, don't decide silently

- Supplier + Purchase Order module timing: Phase 1/2 vs strictly Phase 5
  (Phase 5's RabbitMQ events need PO to exist before then)
- `Product.Category`: currently free-text by default (YAGNI) — revisit only
  if hierarchical categories become a real requirement
- NgRx is pinned to a prerelease (`22.0.0-rc.0`) — bump to stable once one ships (ADR 0005)
