# Inventory Management System

Learning project — modular monolith .NET 10 backend + Angular 22/Nx frontend.
See `CLAUDE.md`'s "Current status" section for what's built and what's next;
`docs/backend-architecture.md` and `docs/frontend-architecture.md` for the
authoritative conventions; `docs/adr/` for the significant decisions made
along the way.

## Quickest path: Docker Compose

```bash
cp .env.example .env   # fill in a real SA password + JWT signing key
docker compose up --build
```

Frontend at `http://localhost:8080`, API at `http://localhost:5299`. Zero
other manual steps — migrations apply automatically on API startup in this
setup (see `docs/adr/0006-docker-containerization.md`). Seed dev login:
`admin@inventory.local` / `Admin123!`.

## Running without Docker

### Backend — `src/backend/`

Six projects wired together with the dependency rule from
`backend-architecture.md` section 2, enforced via project references:

```
Inventory.Domain          → Inventory.Shared
Inventory.Application     → Inventory.Domain, Inventory.Shared
Inventory.Infrastructure  → Inventory.Application, Inventory.Shared
Inventory.Persistence     → Inventory.Application, Inventory.Domain, Inventory.Shared
Inventory.API             → all of the above (composition root)
Inventory.Shared          → (nothing)
```

Four modules built out: Warehouse, Identity (hand-rolled JWT), Product, Stock.

```bash
dotnet restore
dotnet build
dotnet test tests/Inventory.UnitTests/Inventory.UnitTests.csproj
```

Needs a real SQL Server reachable at the connection string in
`src/backend/Inventory.API/appsettings.Development.json` (see
`docs/adr/0001-warehouse-persistence-setup.md`), then:

```bash
dotnet ef database update --project src/backend/Inventory.Persistence
dotnet run --project src/backend/Inventory.API/Inventory.API.csproj
```

### Frontend — `frontend/inventory-workspace/`

Nx workspace, Angular 22 (standalone components, SPA — no SSR), NgRx,
Tailwind CSS. Warehouse/Product/Stock list-create-deactivate pages, a login
page, and the shared auth/error interceptors + route guard.

```bash
cd frontend/inventory-workspace
npm install
npx nx serve inventory-ui
```

The API's dev CORS policy defaults to allowing `http://localhost:4200` — see
`Program.cs`.
