# ADR 0005: Frontend Foundation — Nx/Angular Tooling, NgRx Version, CORS

**Status:** Accepted
**Date:** 2026-08-18

## Context

Scaffolding the Nx + Angular 22 workspace hit several real tooling issues
this session that needed a decision, not just a workaround.

## Decisions

**1. `create-nx-workspace@latest` (v23.1.1) was not used for the initial
scaffold — `create-nx-workspace@20` was, followed by `nx migrate latest`.**
The v23 CLI's `angular-monorepo` preset now maps to a fixed GitHub template
(`nrwl/angular-template`) that ignores `--appName`/`--style` and produces an
unrelated demo "shop" app — confirmed reproducible with `CLAUDECODE=0` set,
so it's the current tool's actual behavior, not an AI-agent-mode artifact.
Scaffolding with the last version that still honors the classic preset
system, then migrating forward with `nx migrate`, reliably lands on the
target versions (Angular 22.0.8, Nx 23.1.1) without inheriting demo content.

**2. SSR (Angular Universal) was removed from the generated app.** The
`angular-monorepo` preset defaults to SSR-enabled apps as of this Nx/Angular
version. Nothing in `frontend-architecture.md` or the roadmap calls for
SSR — this is a plain SPA calling a separately-hosted API. Removed
`main.server.ts`, `server.ts`, `app.config.server.ts`, `app.routes.server.ts`,
the `@angular/ssr`/`express` dependencies, and `provideClientHydration()`
from `app.config.ts`.

**3. NgRx pinned to `22.0.0-rc.0`** (store/effects/entity/store-devtools),
not the latest stable (21.1.1). NgRx's peer dependency on `@angular/core`
tracks Angular's major version tightly; 21.1.1 requires `^21.0.0`, which
doesn't satisfy Angular 22. The 22.0.0 release only exists as an RC at time
of writing. Flagging the prerelease-version tradeoff rather than silently
picking one — this should be revisited once NgRx ships a stable 22.x.

**4. CORS added to the API, dev-only, origins from config.** Found via a
live browser test: the Angular dev server (`:4200`) and API (`:5299`) are
different origins, so the browser blocked every request outright (`OPTIONS
→ 405`) until `AddCors`/`UseCors` was added to `Program.cs`, gated to
`Development` and reading allowed origins from `Cors:AllowedOrigins` config
(defaulting to `http://localhost:4200`) rather than hardcoding — so this
can't silently follow the app into a non-dev environment.

**5. Data-access libs generated via `@nx/js:library` needed
`jest-preset-angular`, not plain `ts-jest`.** They use `@ngrx/store`/`@angular/core`
(published as ESM `.mjs`), which plain `ts-jest` can't transform
(`SyntaxError: Cannot use import statement outside a module`). Fixed by
giving each affected lib (`shared-data-access`, `identity-data-access`,
`warehouse-data-access`, `product-data-access`, `stock-data-access`) the
same `jest-preset-angular` transform + `test-setup.ts` (zone.js) that
`@nx/angular:library`-generated libs get automatically.

**6. Module boundary lint rules implement `frontend-architecture.md` §3
literally**: `scope:X` libs may only depend on `scope:X` + `scope:shared`;
`type:feature` may depend on `type:feature/data-access/ui/util/types`;
`type:data-access` may depend on `type:data-access/util/types`; `type:ui`
may depend on `type:ui/util/types`. The app itself is tagged `scope:app`
with its own constraint (`type:feature` + `scope:shared` only) — Nx 23
requires every project to match at least one constraint or it can't depend
on anything, which caught `inventory-ui` being untagged and forced this to
be made explicit rather than left as an implicit "app can import anything."

**7. Component selector prefix (`inv-`) had to be fixed per-lib.** Each
`@nx/angular:library` generator run defaults its own `eslint.config.mjs` to
`prefix: 'lib'` regardless of the workspace-level `--prefix` passed at
`create-nx-workspace` time — a generator quirk, not a one-off typo. Fixed
in all five component-bearing libs (`identity-feature`, `warehouse-feature`,
`product-feature`, `stock-feature`, `shared-ui`).

## Verification

- `nx build inventory-ui`: succeeds, proper lazy-chunk splitting per feature route.
- `nx run-many --target=lint --all`: clean across all 12 projects (module
  boundaries, a11y, selector prefix all enforced and passing).
- `nx run-many --target=test --all`: passing (6 real assertions covering
  the warehouse reducer and the auth guard; most libs have no logic worth
  testing yet beyond what's build/lint-verified).
- Live browser test: unauthenticated access to `/warehouses` correctly
  redirects to `/login`; login form submits, CORS preflight succeeds,
  request reaches the API; API's DB-unreachable error surfaces correctly
  through the error interceptor into the UI. **Actual successful login is
  unverified** — no SQL Server was reachable at `DESKTOP-4HN10C4` from this
  sandbox. Once the backend migrations are applied to a live DB, log in
  with `admin@inventory.local` / `Admin123!` to confirm end-to-end.

## Consequences

- The NgRx RC pin should be revisited (bumped to stable) once NgRx ships
  a 22.x stable release — check before adding new NgRx-dependent code.
- Any new domain module added later (Supplier, Purchase Order) should
  scaffold its data-access lib the same way (either via `@nx/angular:library`
  to get the Jest config for free, or by copying the `jest.config.cts` +
  `test-setup.ts` pattern from this session's fix).
