# AI-Related Project Documentation — Inventory & Warehouse Management System

Companion to `inventory-management-build-roadmap.md`. That file is the phase
plan; this file covers everything AI-specific in two separate senses:

- **Part A** — using an AI coding agent to build the project well
- **Part B** — the AI feature that lives *inside* the product (Forecasting Service)

Keep both files in `docs/ai/` or the repo root so the agent can reference
them every session.

---

## Part A — Working With the AI Coding Agent

### A.1 Persistent Project Context (paste/reference this every session)

Agents don't reliably carry context between sessions. Keep this block
up to date and give it to the agent at the start of each session, alongside
the roadmap doc.

```
PROJECT: Inventory & Warehouse Management System
STACK: .NET 10 (LTS), Angular 22, SQL Server/PostgreSQL, Redis,
       RabbitMQ, Kafka, Docker, Azure (Container Apps, Service Bus,
       Event Hubs, Cache for Redis, SQL DB, Key Vault, App Insights)
CURRENT PHASE: [update this every session — e.g. "Phase 2, Redis caching"]
COMPLETED PHASES: [list]
ARCHITECTURE STYLE: microservices, database-per-service, event-driven
                     between services from Phase 4 onward
TESTING: [xUnit / NUnit — decide in Phase 0 and record here]
BRANCHING: [convention — decide and record]
```

### A.2 Domain Glossary

Keep the agent (and future-you) speaking the same language as the domain:

| Term | Meaning |
|---|---|
| SKU | Stock Keeping Unit — a unique product identifier |
| Bin | A specific storage location within a warehouse |
| Stock Movement | Any event that changes quantity: receipt, pick, transfer, adjustment |
| Reorder Point | Stock level at which a new purchase order should be triggered |
| PO | Purchase Order |
| Reservation | Stock allocated to an order but not yet picked |
| Cycle Count | Periodic manual stock verification against system records |

Add to this as new domain concepts appear — an agent that doesn't share
your domain vocabulary will misname things, which compounds over a
multi-month project.

### A.3 Prompting Patterns That Work Well Here

**For architecture discussions (per the working agreement in the roadmap):**
> "Before implementing [X], give me 2–3 approaches with trade-offs and your
> recommendation. Don't write code yet."

**For implementation, keep scope explicit:**
> "Implement only the `POST /api/stock-movements` endpoint and its handler.
> Include a unit test for the concurrent-update case. Don't touch the
> Forecasting service."

**For learning explanations, ask separately from implementation:**
> "Before we build the Outbox pattern here, explain what problem it solves
> in this specific PO-receiving flow, in 5-6 sentences."

**For code review, be specific about what to check:**
> "Review this for: race conditions on stock quantity updates, whether the
> RabbitMQ consumer is idempotent, and missing input validation."

### A.4 Reviewing Generated Code — Checklist

For this domain specifically, watch for:
- **Concurrency**: two simultaneous stock movements on the same SKU — is
  there optimistic concurrency control (row version) or a race condition?
- **Idempotency**: if a RabbitMQ/Kafka message is delivered twice, does
  stock get double-counted?
- **Transaction boundaries**: does a partial failure (e.g. DB write
  succeeds, event publish fails) leave data inconsistent? (This is exactly
  what the Outbox pattern in Phase 4 fixes — check it's actually used once
  introduced.)
- **Auth checks**: does every endpoint that mutates stock check the caller
  has the right role?
- **Tests included**: not just "does it compile" but does it cover the
  concurrency/failure cases above?

### A.5 Session Hygiene

- Start each session: "We're on Phase X. Read the roadmap and this AI doc
  first, then summarize what we're doing today before writing anything."
- End each session: update `CURRENT PHASE` / `COMPLETED PHASES` in A.1, and
  ask the agent to draft the ADR entry for anything decided that session.
- If the agent proposes something outside the current phase's scope
  (per the roadmap's ground rules), say so explicitly and redirect — don't
  let scope creep slide because the suggestion happened to be good.

---

## Part B — The Forecasting Service (AI Feature, Phase 9)

### B.1 What It Does

Looks at Stock Movement history per SKU and:
1. Suggests a reorder point (when to trigger a new PO)
2. Flags anomalies — e.g. a sudden consumption spike or a SKU that's gone
   unusually quiet
3. (Stretch) Explains its reasoning in plain language for the purchasing
   team, grounded in actual movement data — not a black-box number

### B.2 Two-Layer Design (discuss with agent before building)

Don't reach for an LLM for the whole thing — decide this deliberately:

- **Layer 1 — statistical baseline**: moving average consumption rate +
  lead time + safety stock formula. This alone gives a defensible reorder
  point and needs no LLM at all. Build and validate this first.
- **Layer 2 — LLM reasoning on top**: once Layer 1 works, add an LLM call
  that takes the statistical output *plus* recent movement summaries and
  produces a plain-language explanation and flags qualitative anomalies
  a formula might miss (e.g. "this spike coincides with a promotion,
  probably not a trend"). The LLM explains and augments; it doesn't
  replace the math.

This matters for learning purposes: you want to see clearly what the
statistics buy you versus what the LLM adds, not one opaque "AI number."

### B.3 Data Access

- Forecasting Service should read from a **dedicated read model** built
  from the Stock Movement Kafka stream (Phase 5) — not query other
  services' databases directly (violates database-per-service).
- Only send the LLM **aggregated summaries** (e.g. "SKU-123: avg 40
  units/week, spiked to 210 units in week of [date]") — never raw
  customer/order data it doesn't need.

### B.4 API Contract (starting point — discuss and refine with agent)

```
GET /api/forecasting/reorder-suggestions?warehouseId={id}
  → list of { skuId, currentStock, suggestedReorderPoint, confidence }

GET /api/forecasting/anomalies?since={date}
  → list of { skuId, description, severity, detectedAt }

GET /api/forecasting/explain/{skuId}
  → { skuId, explanation, dataUsed: [...] }   # LLM-generated, Layer 2
```

### B.5 Cost, Rate Limiting, and Reliability

- Batch the LLM calls (e.g. nightly job producing explanations for
  flagged anomalies) rather than calling on every API request — real-time
  LLM calls here aren't necessary and get expensive fast.
- Cache explanations; don't regenerate if the underlying data hasn't
  changed.
- Rate-limit the `/explain` endpoint specifically.
- Circuit breaker + fallback: if the LLM API is unavailable, Layer 1
  (statistical) results still return — the feature degrades, it doesn't fail.

### B.6 Human-in-the-Loop (important for a real inventory system)

- The Forecasting Service **suggests**; it never auto-creates or
  auto-approves a Purchase Order. A human always approves before a PO is
  sent to a supplier. This is both a good real-world practice and keeps
  the AI's blast radius contained while you're still learning to trust it.
- Log every suggestion and whether it was accepted or overridden — this
  log is itself useful data for evaluating whether the forecasting is
  actually good.

### B.7 Security

- LLM API key lives in Azure Key Vault (Phase 7), never in appsettings or
  source control.
- Service-to-service calls into Forecasting Service go through the same
  auth as every other internal service call — no special bypass because
  "it's just the AI one."

---

## Suggested Folder Additions

```
docs/
└── ai/
    ├── project-context.md      # Part A.1, kept current every session
    ├── forecasting-spec.md     # Part B, refined as you build it
    └── prompts/                # save prompt templates that worked well
```
