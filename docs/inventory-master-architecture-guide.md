# AI-Powered Inventory & Warehouse Management System
## Master Architecture & Development Guide
Version: 1.0

---

# Project Vision

The purpose of this project is NOT only to build a software application.
The primary goal is to learn and implement modern enterprise software
engineering concepts through a real-world project.

This project will gradually evolve from:

Monolith → Modular Monolith → Distributed System → Microservices → Cloud Native Platform → AI Enabled Platform

The project should be treated as a long-term learning platform, not a
weekend build. Every phase exists to teach something specific — speed is
never the goal.

---

# Core Learning Objectives

The project must provide hands-on experience with:

## Backend
- ASP.NET Core Web API
- Clean Architecture
- SOLID Principles
- CQRS
- MediatR
- Entity Framework Core
- Dapper
- Repository Pattern
- Unit Of Work
- Background Services
- SignalR

## Frontend
- Angular
- Tailwind CSS
- Component Architecture
- State Management
- Authentication & Authorization

## Infrastructure
- Docker
- Docker Compose
- Redis
- RabbitMQ
- Kafka
- API Gateway
- Reverse Proxy

## Cloud
- Azure App Service / Azure Container Apps
- Azure SQL
- Azure Storage
- Azure Service Bus
- Azure Key Vault
- Azure Redis Cache
- Azure Event Hubs

## DevOps
- Git Flow
- CI/CD
- GitHub Actions
- Azure DevOps

## Observability
- Serilog
- Seq
- OpenTelemetry
- Prometheus
- Grafana

## AI Engineering
- LLM APIs (Anthropic / OpenAI)
- Agent frameworks (Semantic Kernel / Microsoft Agent Framework)
- RAG (Retrieval-Augmented Generation)
- Vector Databases
- AI Agents
- MCP (Model Context Protocol)
- Prompt Engineering

---

# Project Domain

## Inventory & Warehouse Management Platform

A platform that manages:

- Warehouses & Bin Locations
- Products / SKUs
- Stock Levels & Stock Movements
- Suppliers
- Purchase Orders
- Reorder Rules & Alerts
- Reports & Analytics
- AI Forecasting Assistant

Inspired by real systems like:
- Amazon Fulfillment / Warehouse Management
- SAP Extended Warehouse Management (EWM)
- Zoho Inventory
- Oracle Warehouse Management Cloud

---

# IMPORTANT DEVELOPMENT RULES

## Rule #1
DO NOT start with Microservices.
The system MUST begin as a modular monolith.

Reason: learning architecture properly matters more than creating
unnecessary complexity early. A modular monolith teaches boundary design
without the operational overhead of distributed systems from day one.

---

## Rule #2
Every feature must follow Clean Architecture principles.
No shortcuts. No business logic inside controllers. No direct database
calls from controllers.

---

## Rule #3
Every implementation must be approved before coding.

Process:
1. Requirement Discussion
2. Architecture Discussion
3. Design Approval
4. Database Approval
5. API Approval
6. Implementation
7. Review

Never skip steps.

---

## Rule #4
The agent must act as a Senior Software Architect.

Before implementation, the agent must explain:
- Why this approach?
- What are the alternatives?
- What are the trade-offs?
- How does this scale in the future?

Implementation should start only after explicit approval.

---

## Rule #5
Learning is more important than speed.

Every feature must include:
- Concept explanation
- Real-world usage
- Benefits
- Drawbacks
- Industry practices

---

# Agent Operating Instructions

Whenever a new feature is requested, the agent must follow this exact
workflow — no step skipped, no step combined with another.

---

## Step 1 — Understand Requirement
Ask questions if the requirement is unclear. Never assume.

---

## Step 2 — Create Feature Analysis
Provide:

### Business Goal
Why this feature exists in an inventory/warehouse context.

### Functional Requirements
What it should do.

### Non-Functional Requirements
Performance, Security, Scalability, Maintainability.

---

## Step 3 — Architecture Discussion
Before coding, explain:

### Design Options
Option A — Pros / Cons
Option B — Pros / Cons

### Recommended Option
With reasoning.

---

## Step 4 — Database Design Discussion
Before creating tables, explain:

### Entities
### Relationships
### Constraints
### Indexing Strategy
### Future Considerations (e.g. will this need to support multi-warehouse sharding later?)

---

## Step 5 — API Design Discussion
Before implementation, explain:

### Endpoints
### Request Models
### Response Models
### Error Handling
### Security

---

## Step 6 — Frontend Design Discussion
Explain:

### Pages
### Components
### User Flow
### Validation

---

## Step 7 — Implementation Plan
Break work into small tasks. Example:

- Task 1: Create Entity
- Task 2: Create Configuration
- Task 3: Create Migration
- Task 4: Create CQRS Commands/Queries
- Task 5: Create APIs
- Task 6: Create Angular UI

---

## Step 8 — Wait For Approval
DO NOT CODE. Wait for explicit approval before writing anything.

---

## Step 9 — Implementation
Implement only the approved tasks. Nothing beyond scope.

---

## Step 10 — Code Review
After implementation, review for:
- SOLID
- Clean Architecture
- Security
- Performance
- Maintainability

Suggest improvements before moving to the next task.

---

# Project Evolution Plan

---

# Phase 1 — Foundation
Goal: build the Modular Monolith.

Topics:
- Clean Architecture
- CQRS
- MediatR
- EF Core
- Angular
- JWT Authentication

Features:
- Login & Roles
- Warehouses
- Products / SKUs
- Stock Levels

---

# Phase 2 — Production-Ready Monolith
Topics:
- Logging
- Global Exception Handling
- Validation (FluentValidation)
- Caching (in-memory first, Redis comes in Phase 4)
- Background Services

Features:
- Low-Stock Alerts
- Dashboard
- Basic Reports

---

# Phase 3 — Docker
Topics:
- Docker
- Multi-stage Build
- Docker Compose

Containerize:
- Angular
- API
- SQL Server / PostgreSQL

---

# Phase 4 — Redis
Topics:
- Distributed Cache
- Cache-Aside Pattern
- Rate Limiting

Implement:
- Stock Level Cache
- Dashboard Cache

---

# Phase 5 — RabbitMQ
Topics:
- Event-Driven Architecture
- Outbox Pattern

Events:
- Purchase Order Created
- Purchase Order Approved
- Stock Updated
- Notification Sent

---

# Phase 6 — SignalR
Topics:
- Real-Time Notifications
- Real-Time Dashboard

Use cases:
- Live low-stock alert push to purchasing team
- Live dashboard updates as stock moves

---

# Phase 7 — Kafka
Topics:
- Event Streaming
- Event Sourcing basics

Events:
- Stock Movement Recorded
- Reorder Point Reached
- Stock Anomaly Detected

---

# Phase 8 — Microservices
Split the modular monolith into:
- Identity Service
- Product Service
- Warehouse Service
- Stock Service
- Supplier Service
- Purchase Order Service
- Alerting Service

Rule: database-per-service. No shared database across services.

---

# Phase 9 — API Gateway
Topics:
- YARP
- JWT Propagation
- Request Aggregation

---

# Phase 10 — Observability
Topics:
- Serilog
- Seq
- OpenTelemetry
- Grafana
- Prometheus

---

# Phase 11 — Azure
Deploy to:
- Azure App Service / Azure Container Apps
- Azure SQL
- Azure Storage (for reports/exports)
- Azure Redis Cache
- Azure Service Bus (replaces RabbitMQ)
- Azure Event Hubs (replaces Kafka)
- Azure Key Vault

---

# Phase 12 — AI Enablement
Topics:
- LLM APIs
- Semantic Kernel / Agent Framework
- RAG
- Vector Database

Features:
- AI Forecasting Assistant (reorder point suggestions, anomaly explanations)
- Natural Language Stock Search ("show me all SKUs below reorder point in Warehouse 2")
- Automated Report Generation

---

# Initial Project Structure

```
src/
    backend/
        Inventory.API
        Inventory.Application
        Inventory.Domain
        Inventory.Infrastructure
        Inventory.Persistence
        Inventory.Shared
    frontend/
        inventory-ui
    tests/
        Inventory.UnitTests
        Inventory.IntegrationTests
    docker/
    docs/
    scripts/
    .ai/
```

---

# AI Folder Structure

```
.ai/
    agents/
        architect-agent.md
        planner-agent.md
        code-review-agent.md
        qa-agent.md
        devops-agent.md
        database-agent.md
    rules/
        coding-standards.md
        clean-architecture.md
        api-guidelines.md
        database-guidelines.md
        angular-guidelines.md
    prompts/
        create-feature.md
        review-feature.md
        bug-fix.md
        refactoring.md
```

---

# Coding Standards

Mandatory:
- SOLID
- DRY
- KISS
- YAGNI

Avoid:
- God Classes
- Fat Controllers
- Static Helpers
- Business Logic In Controllers
- Business Logic In Angular Components

---

# Definition Of Done

A feature is complete only if:
- Requirement Approved
- Architecture Approved
- Database Approved
- API Approved
- Unit Tests Written
- Integration Tests Written
- Code Review Completed
- Documentation Updated

---

# First Task

Before writing any code, create and discuss:

1. High-Level Architecture Diagram
2. Bounded Contexts (Product, Warehouse, Stock, Supplier, Purchase Order, Alerting)
3. Domain Model
4. Initial Database Design
5. Clean Architecture Structure
6. Angular Structure
7. Authentication Strategy
8. Development Standards

Wait for approval before implementation.
