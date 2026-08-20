# ADR 0002: CQRS Infrastructure (Result/PagedResult placement, validator location, transaction wrapping)

**Status:** Accepted
**Date:** 2026-08-18

## Context

Task B5 wires up MediatR + FluentValidation and the first real command/query
handlers for `Warehouse`. Three points in `backend-architecture.md` were
ambiguous or self-contradictory and needed a resolved decision.

## Decisions

**1. `Result<T>` lives in `Inventory.Shared`, `PagedResult<T>` lives in
`Inventory.Application/Common/Models`.**
The doc's Solution Structure diagram lists `Result<T>, PagedResult<T>` under
`Application/Common/Models`, but the `Inventory.Shared` entry in the same
diagram explicitly calls out "Result, error codes, constants" as its
purpose. Split the difference: `Result`/`Result<T>`/`ErrorCode` (the
cross-cutting kernel piece, usable from anywhere that references `Shared`)
go in `Shared`; `PagedResult<T>` (a query-shaping concern specific to
list-query responses) goes in `Application`.

**2. Validators are co-located with their command/query, not in a
module-level `Validators/` folder.**
The Solution Structure diagram shows a `Validators/` folder per module, but
§4 (CQRS & MediatR Conventions) explicitly states: "One folder per use case:
`Commands/CreateWarehouse/CreateWarehouseCommand.cs`,
`CreateWarehouseHandler.cs`, `CreateWarehouseValidator.cs` sit together."
These two parts of the doc contradict each other. §4 is more specific and
gives a literal example, so it wins — the scaffolded `Modules/Warehouse/
Validators/` folder (empty, from Task B1) was removed as dead weight.

**3. Commands and queries are distinguished by marker interfaces
(`ICommand<TResponse>`, `IQuery<TResponse>`), and `TransactionBehavior` is
generically constrained to `ICommand<TResponse>`.**
The doc says `TransactionBehavior` wraps commands, not queries, but doesn't
say how the behavior tells them apart. A marker-interface constraint
(`where TRequest : ICommand<TResponse>`) means MediatR/DI simply never
constructs `TransactionBehavior<,>` for a query — no runtime type-checking
needed, the constraint does it at the DI-resolution level.

**4. `TransactionBehavior` only calls `SaveChangesAsync` when the handler
result is a success.**
Prevents a business-rule failure (e.g. `Result.Failure`) from persisting a
partial/inconsistent state — the whole point of `Result<T>` not throwing is
that failure is a normal return value, and normal return values shouldn't
silently commit.

## Alternatives Considered

- **Reflection-based command/query detection** (e.g. namespace or naming
  convention `*Command`/`*Query`): rejected — implicit, breaks silently on
  a rename, no compiler enforcement.
- **`PagedResult<T>` in `Shared`** alongside `Result<T>`: rejected — pagination
  is a read-model/API-shaping concern, not a cross-cutting kernel type: Domain
  and Infrastructure have no reason to know about it.

## Consequences

- Any future module (Product, Stock, Identity) follows the same layout:
  validator next to its command/query, not in a separate folder.
- `ICommand<TResponse>`/`IQuery<TResponse>` become the standard base for all
  future MediatR requests in this codebase, not just Warehouse's.
