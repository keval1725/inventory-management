# Inventory & Warehouse Management System — Build Roadmap

**Purpose of this document:** this is the working brief for an AI coding agent
building this project alongside me. I'm using this project to learn .NET,
Angular, Docker, Redis, RabbitMQ, Kafka, microservices patterns, and Azure —
one topic at a time, in a real codebase. This is not a "generate the whole
thing" project. Read Section 0 before writing any code.

---

## 0. How We Work Together (read this first, every session)

1. **Discuss before implementing.** For every phase — and for any non-trivial
   design decision within a phase (a new service boundary, a schema change, a
   messaging pattern, an Azure resource) — first explain the options, trade-offs,
   and your recommendation. Wait for my explicit approval ("approved", "go
   ahead", "yes do that") before writing code. Don't implement on the same turn
   you propose something.
2. **Stay inside the current phase's scope.** Don't jump ahead and add Kafka
   while we're still on Phase 1, even if it would be "more correct." The
   point is to build understanding one layer at a time, not to reach the
   end state fastest.
3. **Small, reviewable increments.** One endpoint, one service, one migration
   at a time — not a whole service generated in one shot. I need to read and
   understand every diff.
4. **Explain as you go**, especially for anything new to me — Redis, RabbitMQ,
   Kafka, and Azure services should come with a short "why this, not the
   alternative" explanation the first time each is introduced.
5. **Write a short ADR** (Architecture Decision Record) in `docs/adr/` after
   each significant decision — 10-15 lines: context, decision, alternatives
   considered, consequences.
6. **Always include tests** for new logic, especially anything involving
   concurrency, stock quantities, or event ordering — these are the areas
   most likely to have subtle bugs.
7. **Flag assumptions explicitly** rather than silently picking one when
   requirements are ambiguous.
8. **If you're unsure why I want something a certain way, ask** — don't guess
   silently on architecture-level decisions.

---

## 1. Project Overview

**Domain:** multi-warehouse inventory and purchasing system. A company tracks
stock across several warehouses, receives goods from suppliers via purchase
orders, moves stock between locations, and needs to know when to reorder.

**Core entities:** Product/SKU, Warehouse, Bin/Location, Stock Level, Stock
Movement, Supplier, Purchase Order, Purchase Order Line, Reorder Rule.

**Why this domain for learning:** stock movements are naturally an
append-only, ordered event stream — this makes Kafka click faster than in
most tutorial domains, and purchase order approval is a natural multi-step
workflow for RabbitMQ + Saga practice.

---

## 2. Service / Bounded Context Map

Target end state — **we will not build these all at once**, we get here via
the phased plan in Section 4.

| Service | Responsibility | Primary data store |
|---|---|---|
| Product Service | SKU catalog, categories, barcodes | SQL (own DB) |
| Warehouse Service | Warehouses, bins, capacity | SQL (own DB) |
| Stock Service | Current stock level per SKU per location | SQL + Redis cache |
| Stock Movement Service | Immutable log of every goods-in/out/transfer | Kafka + SQL projection |
| Supplier Service | Vendor master data | SQL (own DB) |
| Purchase Order Service | PO lifecycle: draft → approved → sent → received | SQL, RabbitMQ events |
| Alerting Service | Low-stock/reorder-point notifications | RabbitMQ consumer |
| Forecasting Service (AI) | Reorder point suggestions, demand anomaly flags | Calls LLM/stats over Stock Movement data |
| Identity Service | Users, roles (warehouse staff, purchasing, admin) | SQL |
| API Gateway | Single entry point for Angular | YARP |

---

## 3. Prerequisites & Tooling

| Tool | Version | Notes |
|---|---|---|
| .NET SDK | .NET 10 (LTS, supported to Nov 2028) | |
| Angular CLI | Angular 22 | `npm install -g @angular/cli` |
| Docker Desktop | latest | |
| VS Code or Visual Studio 2026 | either | |
| Git + GitHub | | |
| Azure CLI | latest, for Phase 7+ | |
| Azure free/student account | | |
| Anthropic or OpenAI API key | for Phase 9 (Forecasting Service) | store in Key Vault, never in code |

Before Phase 0 starts, confirm with me: SQL Server vs. PostgreSQL, and
whether I want Visual Studio or VS Code as primary editor — this affects
some of the scaffolding you'll generate.

---

## 4. Phased Build Plan

Each phase below has: **Goal**, **Discuss before starting** (questions you
should raise with me and get answered before writing code), and **Definition
of done**.

### Phase 0 — Monolith Foundation
**Goal:** one ASP.NET Core Web API containing Product, Warehouse, and Stock
Level as a single project with EF Core, plus a matching Angular app with
basic list/detail views. No microservices yet — we build this as a monolith
on purpose, to feel the coupling before we split it later.

**Discuss before starting:**
- SQL Server or PostgreSQL, and why
- Solution/project naming convention
- REST conventions (resource naming, versioning approach from day one)
- Do we want a shared "BuildingBlocks" project yet, or is that premature?

**Definition of done:** CRUD for Products and Warehouses, Stock Level records
with quantity per product per warehouse, Angular app can list/view/edit
through these APIs, basic auth (even if just a hardcoded dev user for now).

### Phase 1 — Containerize
**Goal:** Dockerfiles for API and Angular (multi-stage, Nginx for the
Angular build output), `docker-compose.yml` wiring API + Angular + database.

**Discuss before starting:** how we handle EF Core migrations in a
containerized flow (run on startup vs. explicit migration step — trade-offs
of each).

**Definition of done:** `docker compose up` gives a fully working app with
no manual steps.

### Phase 2 — Redis Caching
**Goal:** cache-aside layer in front of Stock Level reads (highest-read,
most latency-sensitive data in this domain).

**Discuss before starting:** cache invalidation strategy — do we invalidate
on every stock movement, or use a short TTL? What's the actual staleness
tolerance for stock counts in this domain (this is a real business
decision, not just a technical one)?

**Definition of done:** measurable latency difference demonstrated, with
correct invalidation on writes.

### Phase 3 — Split into Microservices
**Goal:** extract Product, Warehouse, Stock into separate services, each
with its own database. Add an API Gateway (YARP) in front of them.

**Discuss before starting:** exact service boundaries (is Stock its own
service or part of Product?), how services will call each other for now
(sync HTTP, to be replaced with messaging in Phase 4), how we handle
cross-service data that used to be a simple SQL join.

**Definition of done:** three independently deployable services + gateway,
Angular unaffected (still talks to one endpoint).

### Phase 4 — RabbitMQ: Purchase Order Workflow
**Goal:** build Purchase Order and Supplier services. PO approval and
receiving is a multi-step async workflow: `POCreated` → `POApproved` →
`POSent` → `GoodsReceived` → Stock Service updates quantities.

**Discuss before starting:** orchestration (a dedicated saga/process
manager) vs. choreography (services react to each other's events) for this
specific workflow — trade-offs for a 4-step process like this one. Outbox
pattern implementation approach.

**Definition of done:** a PO can be created, approved, and received through
Angular, with Stock Service correctly updated via async messages, and the
flow survives a service restart mid-way without losing an event.

### Phase 5 — Kafka: Stock Movement Event Stream
**Goal:** every stock change (receiving, picking, transfer, adjustment)
becomes an event on a Kafka topic. Stock Movement Service consumes this
stream to build an immutable audit log and feed the Forecasting Service.

**Discuss before starting:** topic design (one topic per movement type vs.
one topic with an event-type field), partitioning key (by SKU? by
warehouse?), retention policy.

**Definition of done:** full movement history queryable and replayable;
you can rebuild current stock levels purely by replaying the event log
(this is the "aha" moment for event sourcing).

### Phase 6 — Resilience & Observability
**Goal:** Polly for retries/circuit breakers on inter-service calls, health
checks on every service, Serilog + Seq (or ELK) for structured logs,
OpenTelemetry for distributed tracing.

**Discuss before starting:** which failure scenarios we specifically want
to simulate and test (e.g., Stock Service down during PO receiving — what
should happen?).

**Definition of done:** you can kill any one service, watch the system
degrade gracefully rather than cascade-fail, and see the failure clearly
in logs/traces.

### Phase 7 — Azure Deployment
**Goal:** move from Docker Compose to Azure.

| Local | Azure |
|---|---|
| Docker Compose | Azure Container Apps (or AKS if we want K8s practice) |
| SQL Server container | Azure SQL Database |
| Redis container | Azure Cache for Redis |
| RabbitMQ container | Azure Service Bus |
| Kafka container | Azure Event Hubs (Kafka-protocol compatible) |
| Local secrets | Azure Key Vault |
| Local logs | Application Insights |

**Discuss before starting:** Container Apps vs. AKS — I want your honest
recommendation given this is a learning project, not production; budget
constraints on the free/student credit.

**Definition of done:** the full system runs on Azure, reachable over the
internet, with secrets out of source control entirely.

### Phase 8 — CI/CD
**Goal:** GitHub Actions per service — build, test, containerize, push,
deploy — triggered independently per service.

**Discuss before starting:** branching strategy, whether we gate deploys on
manual approval initially.

### Phase 9 — Forecasting Service (AI)
**Goal:** a service that looks at Stock Movement history and suggests
reorder points, and flags anomalies (e.g., unusual consumption spike).

**Discuss before starting:** simple statistical approach (moving average,
reorder-point formula) vs. LLM-based reasoning over recent movement
summaries — I want to understand the trade-off, not just get a black box.
How the service accesses Stock Movement data (own read model vs. querying
Kafka directly). Rate limiting and cost control on the LLM calls.

**Definition of done:** the service produces a reorder suggestion per SKU
that I can see is grounded in actual movement data, not hallucinated.

---

## 5. Project Structure

```
inventory-platform/
├── src/
│   ├── services/
│   │   ├── Product.Api/
│   │   ├── Warehouse.Api/
│   │   ├── Stock.Api/
│   │   ├── StockMovement.Api/
│   │   ├── Supplier.Api/
│   │   ├── PurchaseOrder.Api/
│   │   ├── Alerting.Api/
│   │   ├── Forecasting.Api/
│   │   └── Identity.Api/
│   ├── gateway/
│   │   └── ApiGateway/
│   └── shared/
│       └── BuildingBlocks/        # keep thin: shared event contracts only
├── frontend/
│   └── inventory-app/             # Angular workspace
├── infra/
│   ├── docker-compose.yml
│   └── bicep/                     # added in Phase 7
├── .github/workflows/
├── CLAUDE.md                      # this file, or a pointer to it
└── docs/
    └── adr/
```

---

## 6. Ground Rules Recap for the Agent

- Propose → I approve → you implement. Every phase, every major decision.
- One phase at a time. No scope creep ahead of where we are.
- Small commits, explained as you go, tested.
- ADR after each significant decision.
- If something in this doc conflicts with what I ask for in chat, ask me
  which should win rather than silently picking one.

---

## 7. Realistic Expectations

This is a multi-month project done properly — don't compress phases just to
reach a working demo faster. The goal is that by the end I can explain, from
firsthand experience, why each piece (Redis, RabbitMQ, Kafka, each
resilience pattern, each Azure service) exists and what breaks without it.
