# ADR 0003: Identity Module — Hand-Rolled JWT Auth

**Status:** Accepted
**Date:** 2026-08-18

## Context

Phase 0's definition of done requires "basic auth (even if just a hardcoded
dev user for now)." The locked decision already rules out ASP.NET Core
Identity in favor of hand-rolled JWT. Built ahead of the Product/Stock
modules (reordered from the original task list) specifically so those
modules can get `[Authorize]` from the start instead of being retrofitted
like `WarehousesController` was.

## Decisions

- **Password hashing: PBKDF2 via `System.Security.Cryptography.Rfc2898DeriveBytes.Pbkdf2`**,
  100,000 iterations, SHA-256, 16-byte salt, 32-byte key, stored as
  `"{iterations}.{base64 salt}.{base64 hash}"`. This is "hand-rolled" in the
  sense the locked decision means (no ASP.NET Core Identity package), but
  still uses a standard vetted primitive rather than inventing a hash
  algorithm — the two aren't the same kind of "hand-rolled."
- **JWT claims**: `sub` (UserId), `email`, and `ClaimTypes.Role` — the last
  one specifically because ASP.NET Core's `[Authorize(Roles = ...)]`
  reads `ClaimTypes.Role` by default; using a different claim type would
  silently break role checks.
- **Generic "Invalid email or password" for both unknown-email and
  wrong-password cases** — prevents user enumeration via distinct error
  messages. Verified with a test asserting both paths produce the identical
  `Result.Error` string.
- **Dev-only seed admin user** (`admin@inventory.local` / `Admin123!`),
  inserted via EF Core `HasData` in `UserConfiguration` with a fixed Guid
  and a precomputed password hash (necessary because `HasData` seed values
  must be static at migration-generation time, not computed at runtime).
  There's no register/create-user endpoint yet — out of Phase 0 scope: the
  roadmap's feature list is "Login & Roles," not full user management.
- **JWT signing key lives in user secrets** (`dotnet user-secrets set
  Jwt:SigningKey`), not `appsettings.json` — it's an actual secret, unlike
  the Warehouse DB connection string (which uses Windows/trusted auth and
  has no credential to protect). `Issuer`/`Audience`/`ExpiryMinutes` are
  non-secret and live in `appsettings.json`.
- **Swagger's "Authorize" button (bearer token input UI) was dropped.**
  Swashbuckle 10.2.3 pulled in `Microsoft.OpenApi` 2.x, which restructured
  `OpenApiSecurityScheme`/`OpenApiReference` in a way that broke the
  standard security-scheme wiring snippet. Not worth chasing for a
  cosmetic dev-tool convenience — Swagger UI still lists and documents
  every endpoint, just without the token-input button. Can revisit once
  Swashbuckle publishes an OpenApi.NET-2.x-compatible example.

## Consequences

- `WarehousesController` now has `[Authorize]` at the class level and
  `[Authorize(Roles = "Admin,WarehouseStaff")]` on the two mutating actions
  — confirmed live (unauthenticated GET returns 401).
- Every future controller (Product, Stock) gets auth attributes from its
  first commit, not retrofitted.
- The seed admin's plaintext dev password is documented in
  `UserConfiguration.cs` and `CLAUDE.md` — acceptable for a local learning
  project pointed at a personal dev SQL Server instance; would need to
  change before this ever touches a shared or non-local database.
