# ADR 0004: Stock Module — RowVersion as a Shadow Property, Pipeline-Level Concurrency Handling

**Status:** Accepted
**Date:** 2026-08-18

## Context

`StockLevel` is the entity `backend-architecture.md` explicitly calls out as
needing `RowVersion` "from day one" (§6), and the AI guide's review checklist
leads with concurrency: "two simultaneous stock movements on the same SKU —
is there optimistic concurrency control?" This needed an actual answer, not
just a column.

## Decisions

- **`RowVersion` is an EF Core shadow property**, configured in
  `StockLevelConfiguration` via `builder.Property<byte[]>("RowVersion").IsRowVersion()`,
  not a property on the `StockLevel` domain entity itself. Optimistic
  concurrency is a persistence concern; the domain entity has no reason to
  carry a `byte[]` it never reads or writes. Keeps `Domain` genuinely
  ignorant of EF Core, per the Dependency Rule.
- **`DbUpdateConcurrencyException` is translated at the `InventoryDbContext`
  boundary** into an `Inventory.Application.Common.Exceptions.ConcurrencyConflictException`
  (via an overridden `SaveChangesAsync`), so `Application` — specifically
  `TransactionBehavior` — never references an EF Core type directly.
- **`TransactionBehavior` catches that exception and returns
  `Result.FailureAs<TResponse>(..., ErrorCode.Conflict)`** instead of letting
  it reach `ExceptionHandlingMiddleware` as a generic 500. A concurrent
  stock update losing a race is an expected outcome in this domain, not a
  bug — the caller gets a 409 they can sensibly retry on, not an opaque
  server error.
- **Extracted `Result.FailureAs<TResponse>` onto the `Result` base class**
  (moved out of `ValidationBehavior`'s private helper) since `TransactionBehavior`
  needed the identical "build a failure of whichever concrete Result type
  TResponse is" logic. Both behaviors now share one reflection-based
  implementation instead of two copies.
- **`StockLevel.AdjustQuantity`'s `DomainException` (would-go-negative) is
  caught in `AdjustStockQuantityHandler` and converted to `Result.Failure(...,
  ErrorCode.Validation)`**, not left to bubble to the exception middleware.
  This refines the ADR 0001-era assumption that `DomainException` always
  means "unexpected" — here it's a normal, state-dependent business outcome
  (like `Result.Failure` for a duplicate SKU), so it gets the same treatment.
  The exception middleware's `DomainException → 400` mapping remains the
  fallback for genuine invariant violations that reach it uncaught.
- **Stock module's `Application` layer depends on `IProductRepository` and
  `IWarehouseRepository`** (existence checks in `CreateStockLevelHandler`) —
  explicitly sanctioned by `backend-architecture.md` §3's dependency table
  ("Depends on (via interfaces only): Product, Warehouse"). The `StockLevel`
  entity itself still only holds `ProductId`/`WarehouseId` as plain Guids —
  no navigation property, no join.

## Consequences

- A concurrency test (`TransactionBehaviorTests`) verifies the translation
  end-to-end using a mocked `IUnitOfWork` that throws
  `ConcurrencyConflictException` — confirms `TransactionBehavior` returns a
  `Conflict` `Result` rather than propagating the exception.
- Any future entity needing optimistic concurrency follows the same shadow-property
  pattern; the pipeline-level translation already handles it with no
  per-handler code needed.
