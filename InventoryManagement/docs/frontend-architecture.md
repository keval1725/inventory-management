# Frontend Architecture — Inventory Management System

Enterprise-grade Nx + Angular reference. Conventions document — every future
frontend task should conform to this unless we explicitly discuss and change it.

**Locked decisions:** Nx workspace · NgRx · Angular 22 (standalone components) · VS Code

---

## 1. Principles

- **Nx mono-repo, boundaries enforced by lint rules, not by convention
  alone.** Nothing stops a developer from importing across module
  boundaries except a rule that actually fails the build — so we set that
  up from commit one, not "later once it matters."
- **Library types over one giant `app`**: the Angular app itself stays
  almost empty — routing shell and layout only. Actual feature code lives
  in `libs/`, split by *domain* (matches backend modules: identity,
  product, warehouse, stock) and by *type* within each domain.
- **Feature-based, not layer-based, top-level organization** — mirrors the
  backend's "module first" principle from `backend-architecture.md`.

---

## 2. Workspace Structure

```
frontend/inventory-workspace/
  apps/
    inventory-ui/                    # thin shell: layout, root routing, app shell only
      inventory-ui-e2e/              # Playwright/Cypress, added later phases

  libs/
    identity/
      feature/       # smart components, routed pages, containers
      data-access/   # NgRx store (actions/reducer/effects/selectors) + HTTP service
      ui/            # presentational/dumb components, reusable within this domain
      util/          # pure functions, domain-specific pipes/validators

    product/
      feature/  data-access/  ui/  util/
    warehouse/
      feature/  data-access/  ui/  util/
    stock/
      feature/  data-access/  ui/  util/

    shared/
      ui/            # cross-domain reusable components (buttons, tables, modals)
      util/          # cross-domain pure utilities
      data-access/   # HTTP interceptors (auth, error), base API config
      types/         # shared TypeScript interfaces/DTOs that genuinely cross domains
```

**Library type meaning** (standard Nx convention — worth learning properly,
it's used broadly in enterprise Angular):

| Type | Contains | May import |
|---|---|---|
| `feature` | Routed/smart components, orchestrates a use case | `data-access`, `ui`, `util` within its own domain, plus anything in `shared` |
| `data-access` | NgRx store, HTTP services, DTOs | `util` within its own domain, `shared/data-access`, `shared/types` |
| `ui` | Presentational components, no store access | `util` within its own domain, `shared/ui` |
| `util` | Pure functions, pipes, validators | nothing domain-specific |

---

## 3. Module Boundaries (Nx enforced)

Tag every library in `project.json`:
```json
{ "tags": ["scope:warehouse", "type:feature"] }
```

Then in `.eslintrc.json`'s `@nx/enforce-module-boundaries` rule:
- `scope:warehouse` may depend on `scope:warehouse` and `scope:shared` — never `scope:stock` directly
- `type:ui` may not depend on `type:feature` or `type:data-access` (a dumb component never reaches into the store)
- `type:util` may not depend on anything domain-scoped

This is what makes "modular monolith" real on the frontend rather than
aspirational — a pull request that violates a boundary fails lint, not code
review discipline alone.

Cross-domain communication (e.g. the Stock feature needing Product names)
goes through `shared/types` DTOs and each domain's own `data-access` layer
querying its own backend endpoint — never one domain's store reaching into
another's.

---

## 4. State Management — NgRx

Standard structure per `data-access` lib:
```
warehouse/data-access/
  warehouse.actions.ts
  warehouse.reducer.ts
  warehouse.effects.ts
  warehouse.selectors.ts
  warehouse.models.ts        # DTOs matching backend response shape
  warehouse-api.service.ts   # thin HTTP client, no business logic
  index.ts                   # public API — only what's exported here is importable
```

- **Entity Adapter** (`@ngrx/entity`) for all collections (`WarehouseState`
  holds normalized entities, not arrays to `find()` through) — this is
  worth learning properly now since Stock will have the highest-volume
  collection in the app.
- **Feature state registration**: `provideState(warehouseFeature)` in the
  domain's routing config — each feature's store is lazy-loaded with its
  route, not eagerly registered in the root store. This matters for bundle
  size once we have 7+ modules.
- Effects handle all HTTP calls; components never call the API service
  directly — they dispatch an action and select from the store.
- Selectors are memoized (`createSelector`) — no derived/computed values
  recalculated in the component template.

**Only exception**: transient UI-only state (a form's "is this drawer open"
flag) does **not** go into NgRx — that's local component state via a
signal. NgRx is for state that's shared, server-derived, or needs to
survive navigation. Putting everything in NgRx "because that's the
pattern" is the most common overuse mistake — worth avoiding deliberately.

---

## 5. Routing & Lazy Loading

- Every domain's `feature` lib exports its own `routes` (standalone
  route config, no NgModules).
- `app.routes.ts` in `apps/inventory-ui` only lists top-level lazy imports:
```typescript
export const routes: Routes = [
  { path: 'warehouses', loadChildren: () => import('@inventory/warehouse/feature').then(m => m.warehouseRoutes) },
  { path: 'products', loadChildren: () => import('@inventory/product/feature').then(m => m.productRoutes) },
];
```
- Auth guard (`canActivate`) lives in `shared/data-access`, applied per-route.

---

## 6. Styling — Tailwind CSS

- Tailwind configured at the workspace root, shared across all apps/libs.
- Component-specific styling stays utility-first in templates; genuinely
  reusable visual patterns (a "card" look, consistent spacing) become a
  `shared/ui` component, not a repeated class string copy-pasted across
  five features.
- No component-level custom CSS files unless Tailwind genuinely can't
  express something — that's the exception, not the default.

---

## 7. Data-Access Layer Conventions

- One typed HTTP service per domain, matching backend DTOs 1:1
  (`WarehouseDto`, `CreateWarehouseRequest`) — no `any`, no untyped
  `HttpClient.get()` calls anywhere in the codebase.
- **HTTP interceptors** in `shared/data-access`:
  - `authInterceptor` — attaches JWT to outgoing requests
  - `errorInterceptor` — catches non-2xx responses, maps backend
    `ProblemDetails` shape into a consistent app-level error, dispatches a
    generic "show toast" action so error handling isn't repeated per effect
- Backend and frontend error shapes are the same `ProblemDetails` object —
  intentional, so the interceptor never has to guess at a schema.

---

## 8. Testing Strategy

- **Jest** for unit tests (components, reducers, selectors, effects) —
  Nx's default and faster than Karma for this workspace size.
- Reducers and selectors: pure function tests, no TestBed needed.
- Effects: `provideMockActions` + marble testing for the async flows.
- Components: shallow render, assert on dispatched actions and displayed
  state — not implementation details.
- E2E (Playwright) comes later, once there's enough of the app to make
  end-to-end flows worth automating — not Phase 1.

---

## 9. Coding Standards

- ESLint (Nx's `@nx/angular` config) + Prettier, enforced pre-commit.
- File naming: `kebab-case.ts`, component selectors prefixed `app-`
  (or a project-specific prefix, e.g. `inv-`) — pick one now, stay
  consistent everywhere.
- One component per file, no barrel-file re-exports beyond each lib's own
  `index.ts` public API (deep imports into another lib's internals are
  exactly what the module boundary lint rule blocks).
- Standalone components throughout — no `NgModule` declarations anywhere
  in new code.

---

## 10. Open Items

- Component selector prefix — pick one (`inv-`, `wms-`, etc.) before Task 1
  scaffolds the first component; trivial to decide, easy to regret leaving
  unset and getting inconsistent prefixes across early components.
- Whether `shared/types` DTOs are hand-written or generated from the
  backend's OpenAPI spec (`openapi-typescript` or NSwag) — codegen keeps
  frontend/backend contracts in sync automatically but adds a build step;
  worth deciding once Phase 1's first few endpoints exist and we can feel
  whether manual drift is actually a problem.
