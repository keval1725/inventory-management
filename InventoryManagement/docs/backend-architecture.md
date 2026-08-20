# Backend Architecture — Inventory Management System

Enterprise-grade Clean Architecture reference for the ASP.NET Core backend.
This is the conventions document — every future backend task should conform
to what's written here unless we explicitly discuss and change it.

**Locked decisions:** SQL Server · hand-rolled JWT auth · xUnit + FluentAssertions + Moq · VS Code

---

## 1. Principles

- **Dependency Rule**: dependencies point inward only. `Domain` depends on
  nothing. `Application` depends on `Domain` only. `Infrastructure` and
  `Persistence` depend on `Application` (they implement its interfaces).
  `API` depends on `Application` and wires concrete implementations in
  `Program.cs` only.
- **Modular monolith, not a layered mess**: within `Application`, `Domain`,
  and `Persistence`, code is organized **by module first, by layer second**
  (`Application/Modules/Warehouse/Commands/...`, not
  `Application/Commands/Warehouse...`). A module's internals are never
  referenced directly by another module — only via MediatR requests or a
  small published interface. This is what makes the Phase 8 microservices
  split a move, not a rewrite.
- **No shortcuts**: no business logic in controllers, no direct `DbContext`
  usage outside `Persistence`, no static helper classes holding business
  rules.

---

## 2. Solution Structure

```
src/backend/
  Inventory.Domain/
    Common/                    # BaseEntity, IAuditable, ISoftDeletable
    Modules/
      Identity/Entities/  Product/Entities/  Warehouse/Entities/  Stock/Entities/
    Exceptions/                # DomainException and subtypes

  Inventory.Application/
    Common/
      Behaviors/                # ValidationBehavior, LoggingBehavior, TransactionBehavior
      Interfaces/                # ICurrentUser, IDateTimeProvider
      Models/                     # Result<T>, PagedResult<T>
    Modules/
      Identity/   Commands/  Queries/  DTOs/  Validators/  Interfaces/
      Product/    Commands/  Queries/  DTOs/  Validators/  Interfaces/
      Warehouse/  Commands/  Queries/  DTOs/  Validators/  Interfaces/
      Stock/      Commands/  Queries/  DTOs/  Validators/  Interfaces/

  Inventory.Infrastructure/
    Auth/                       # JwtTokenService, PasswordHasher
    DateTime/                   # SystemDateTimeProvider

  Inventory.Persistence/
    InventoryDbContext.cs
    Configurations/             # IEntityTypeConfiguration<T> per entity, grouped by module
    Repositories/                # per-module repository implementations
    Migrations/

  Inventory.API/
    Controllers/                # one folder per module
    Middleware/                  # ExceptionHandlingMiddleware
    Program.cs

  Inventory.Shared/               # Cross-cutting kernel: Result, error codes, constants
                                     # Kept deliberately thin — a dumping ground here defeats the point
```

**Project reference rules** (enforce with `dotnet` project references, not
just convention):

| Project | May reference |
|---|---|
| `Inventory.Domain` | `Inventory.Shared` only |
| `Inventory.Application` | `Inventory.Domain`, `Inventory.Shared` |
| `Inventory.Infrastructure` | `Inventory.Application`, `Inventory.Shared` |
| `Inventory.Persistence` | `Inventory.Application`, `Inventory.Domain`, `Inventory.Shared` |
| `Inventory.API` | all of the above (composition root) |

---

## 3. Module Organization (Phase 1)

| Module | Owns | Depends on (via interfaces only) |
|---|---|---|
| Identity | User, Role | — |
| Product | Product, Category | — |
| Warehouse | Warehouse | — |
| Stock | StockLevel | Product, Warehouse (by Id reference only, never navigation property across modules) |

**Rule**: `StockLevel` holds `ProductId` and `WarehouseId` as plain foreign
keys — it never has an EF Core navigation property into the `Product` or
`Warehouse` module's entities. Cross-module reads happen through a query
(MediatR), not a joined navigation. This feels like overhead in a monolith;
it's exactly what prevents a rewrite at Phase 8.

---

## 4. CQRS & MediatR Conventions

- One folder per use case: `Commands/CreateWarehouse/CreateWarehouseCommand.cs`,
  `CreateWarehouseHandler.cs`, `CreateWarehouseValidator.cs` sit together.
- Commands mutate, return `Result<Guid>` or `Result` — never return entities
  directly to the API layer; map to a DTO in the handler.
- Queries never mutate. Query handlers may use **Dapper** instead of EF Core
  when a read is complex/reporting-style — this is deliberate: it's on our
  learning list, and query performance is where Dapper earns its place over
  EF Core's tracking overhead.
- **Pipeline behaviors** (registered once, apply to every request):
  1. `ValidationBehavior` — runs FluentValidation before the handler executes at all
  2. `LoggingBehavior` — logs request name + duration
  3. `TransactionBehavior` — wraps commands (not queries) in a DB transaction

```csharp
public record CreateWarehouseCommand(string Name, string Address) : IRequest<Result<Guid>>;
```

---

## 5. Cross-Cutting Patterns

**Result pattern** — expected failures (validation, not-found, business rule
violations) return `Result<T>`, they don't throw. Exceptions are reserved for
truly unexpected failures. This keeps control flow readable and keeps the
API's error mapping centralized.

```csharp
public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public string? ErrorCode { get; }   // maps to HTTP status in the API layer
}
```

**Global exception handling** — `ExceptionHandlingMiddleware` catches anything
unhandled and returns RFC 7807 `ProblemDetails`. Every error response, success
or failure path, has the same shape.

**Auditing** — every entity implements `IAuditable`
(`CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`), set automatically via an
EF Core `SaveChanges` interceptor, not manually in every handler.

**Soft delete** — entities that matter historically (`Warehouse`, `Product`)
implement `ISoftDeletable` (`IsActive` flag) rather than hard delete. Enforced
via an EF Core global query filter, not a `WHERE IsActive = 1` repeated in
every query.

---

## 6. Database Conventions

- One database, **schema per module**: `identity.Users`, `product.Products`,
  `warehouse.Warehouses`, `stock.StockLevels`.
- Every table: `Id` (uniqueidentifier, not int identity — avoids merge/sync
  pain if services ever split databases later), audit columns, `RowVersion`
  (`rowversion` type) on anything with concurrent writers — `StockLevel` gets
  this from day one.
- Migrations live per-module-aware but in one `Inventory.Persistence`
  project for Phase 1 (splits naturally into per-service migration projects
  at Phase 8).
- Naming: `PascalCase` table/column names, singular table names
  (`Warehouse` not `Warehouses`) — pick one convention and never mix; this
  one because it matches the C# entity name 1:1.

---

## 7. Repository Pattern

**Specific repositories per aggregate root, not a generic
`IRepository<T>`.** A generic repository looks convenient early and becomes
a leaky abstraction the moment you need a query that's genuinely specific to
one aggregate (`IStockRepository.GetLowStockAsync(...)`). Each module defines
its own narrow repository interface in `Application/Modules/X/Interfaces`,
implemented in `Persistence/Repositories`.

No separate Unit of Work interface — `DbContext.SaveChangesAsync()` called
once per command handler (via the `TransactionBehavior`) **is** the unit of
work. Introducing a second abstraction on top of `DbContext` (which already
implements the pattern) just adds indirection without benefit here.

---

## 8. Authentication & Authorization

- Hand-rolled JWT issuance (per your decision) — `JwtTokenService` in
  `Infrastructure` generates the token; `Identity` module's
  `LoginCommandHandler` validates credentials and calls it.
- Claims: `sub` (UserId), `email`, `role`.
- Roles for Phase 1: `Admin`, `WarehouseStaff`, `Purchasing` — stored as a
  simple enum column on `User`, not a many-to-many role table (YAGNI until
  we need dynamic roles).
- `[Authorize(Roles = "Admin,WarehouseStaff")]` on controller actions;
  business-rule-level authorization (e.g. "can this user approve *this
  specific* PO") lives in the command handler, not the controller attribute.

---

## 9. API Conventions

- Versioned via URL segment: `/api/v1/...`
- REST resource naming: plural nouns (`/warehouses`, `/products`), no verbs
  in the URL.
- No hard `DELETE` on entities with historical significance — use a
  `PATCH .../deactivate` endpoint instead (see Warehouse example already
  discussed).
- Pagination: `?page=1&pageSize=20` query params, response wrapped in
  `PagedResult<T>` with `TotalCount`, `Page`, `PageSize`.
- Every error response: RFC 7807 `ProblemDetails`.

---

## 10. Testing Strategy

- **Unit tests**: one test class per command/query handler, mocking
  repository interfaces with Moq. Naming:
  `MethodName_Scenario_ExpectedResult`.
- **Integration tests**: `WebApplicationFactory<Program>` +
  **Testcontainers** spinning up a real SQL Server container per test run —
  no mocking the database at the integration level, since that's exactly
  where EF Core mapping bugs hide.
- Concurrency and idempotency get **explicit** test cases once we're past
  Phase 1 — these are the bug categories most likely to bite in this domain.

---

## 11. Coding Standards

- `.editorconfig` + `dotnet format` enforced in CI (added Phase 8's CI/CD
  step, but the file exists from commit one).
- SOLID, DRY, KISS, YAGNI.
- No god classes, no static helpers holding business logic, no business
  logic in controllers.
- Every public method on an `Application` interface has an XML doc comment
  — this project is for learning, and future-you rereading a handler in
  three months benefits from the same doc comments a teammate would.

---

## 12. Open Items (flagging per your instruction — not deciding silently)

- Supplier + Purchase Order module placement (Phase 1/2 vs strictly Phase 5)
  — still waiting on your call, noted in chat.
- Whether `Category` on `Product` is a free-text field or its own entity
  with a table — free-text is fine for Phase 1, but if you want hierarchical
  categories later that's a bigger decision worth flagging now rather than
  migrating later. Your call whenever we get to the Product module task.
