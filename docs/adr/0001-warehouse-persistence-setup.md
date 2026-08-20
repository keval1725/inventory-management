# ADR 0001: Warehouse Persistence Setup (RowVersion scope, migration tooling)

**Status:** Accepted
**Date:** 2026-08-18

## Context

Task B3 adds the first EF Core configuration and migration (`Warehouse`).
Two open questions needed a decision: whether `Warehouse` gets optimistic
concurrency (`RowVersion`) from day one, and how `dotnet ef migrations add`
can run before Task B6 wires up `Inventory.API`'s DI container.

## Decision

- **No `RowVersion` on `Warehouse` yet.** `backend-architecture.md` §6 only
  mandates it for entities "with concurrent writers," calling out
  `StockLevel` explicitly. `Warehouse` is low-frequency, admin-managed data.
  Adding it now would be speculative; it's cheap to add later via a new
  migration if contention ever shows up.
- **`InventoryDbContextFactory` (`IDesignTimeDbContextFactory<InventoryDbContext>`)
  lives in `Inventory.Persistence`**, with a hardcoded design-time-only
  connection string (`Server=DESKTOP-4HN10C4`, trusted connection). This lets
  `dotnet ef migrations add` run against `Inventory.Persistence` directly,
  without depending on `Inventory.API`'s runtime DI wiring, which is Task
  B6's scope per the scaffold's own comments. The real runtime connection
  string (appsettings + user secrets, actual `AddDbContext` registration)
  is a separate decision for B6.
- **`dotnet-ef` is a local tool** (`dotnet-tools.json` manifest), not assumed
  global — keeps the toolchain reproducible for anyone cloning the repo.
- Migration generated only (`InitialWarehouseSchema`); `dotnet ef database
  update` deliberately not run — no live SQL Server target confirmed for
  this environment yet.

## Alternatives Considered

- **`RowVersion` on every entity via `BaseEntity`**: rejected — makes the
  cross-cutting concern universal when the doc frames it as opt-in,
  and adds a column with no purpose on entities that don't need it.
- **Design-time factory reading from an `appsettings.json` in Persistence**:
  more "realistic," but adds a config file whose only consumer is a design-time
  tool, and duplicates work that B6 does properly. A hardcoded design-time
  string is honest about being migration-tooling-only.

## Consequences

- Adding `RowVersion` to `Warehouse` later means a new migration and an
  `[ConcurrencyCheck]`/`.IsRowVersion()` addition — not a breaking change.
- The design-time connection string will need to be revisited if the DB
  server name ever changes; it's isolated to one file.
