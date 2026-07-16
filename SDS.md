# Personal Finance Management (PFM) - Software Design Specification (SDS)


| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 15-Jul-2026 | Homer Truong | Initial draft |

---

## Table of Contents

- [1. Introduction](#1-introduction)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Scope](#12-scope)
  - [1.3 Assumptions and Constraints](#13-assumptions-and-constraints)
    - [1.3.1 Assumptions](#131-assumptions)
    - [1.3.2 Constraints](#132-constraints)
  - [1.4 Definitions and Acronyms](#14-definitions-and-acronyms)
  - [1.5 Related Documents](#15-related-documents)
- [2. Technical Domain Model](#2-technical-domain-model)
  - [2.1 Domain Layer Traceability](#21-domain-layer-traceability)
  - [2.2 Domain Object](#22-domain-object)
    - [2.2.1 User](#221-user)
    - [2.2.2 Wallet](#222-wallet)
    - [2.2.3 Category](#223-category)
    - [2.2.4 Budget](#224-budget)
    - [2.2.5 Transaction](#225-transaction)
    - [2.2.6 FinancialGoal](#226-financialgoal)
    - [2.2.7 InvestmentPortfolio](#227-investmentportfolio)
    - [2.2.8 Asset](#228-asset)
    - [2.2.9 Holding](#229-holding)
    - [2.2.10 Notification](#2210-notification)
  - [2.3 Domain Object Relationships](#23-domain-object-relationships)
  - [2.4 Domain Object State Transition Diagram (STD)](#24-domain-object-state-transition-diagram-std)
- [3. UI Design](#3-ui-design)
  - [3.1 UI / UX Principles](#31-ui--ux-principles)
  - [3.2 Wireframes — UI / UX](#32-wireframes--ui--ux)
- [4. Architecture Design](#4-architecture-design)
  - [4.1 System Context](#41-system-context)
  - [4.2 Logical View](#42-logical-view)
  - [4.3 Development View](#43-development-view)
    - [4.3.1 Frontend Architecture](#431-frontend-architecture)
    - [4.3.2 Backend Architecture (Service Layer)](#432-backend-architecture-service-layer)
    - [4.3.3 Data Design](#433-data-design)
  - [4.4 Process View](#44-process-view)
    - [4.4.1 Sequence Diagrams](#441-sequence-diagrams)
  - [4.5 Physical View](#45-physical-view)
  - [4.6 Key Scenarios](#46-key-scenarios)
  - [4.7 Architecture Principles](#47-architecture-principles)
- [5. Product Features and User Story Specification](#5-product-features-and-user-story-specification)
  - [5.1 Feature-01: User Management](#51-feature-01-user-management)
    - [5.1.1 US-01-01: Register a User](#511-us-01-01-register-a-user)
  - [5.2 Feature-02: System Security](#52-feature-02-system-security)
    - [5.2.1 US-02-01: Login](#521-us-02-01-login)
    - [5.2.2 US-02-02: Logout](#522-us-02-02-logout)
  - [5.3 Feature-03: Wallet Management](#53-feature-03-wallet-management)
    - [5.3.1 US-03-01: Create a Wallet](#531-us-03-01-create-a-wallet)
  - [5.4 Feature-04: Category Management](#54-feature-04-category-management)
    - [5.4.1 US-04-01: Create a Category](#541-us-04-01-create-a-category)
  - [5.5 Feature-05: Budget Management](#55-feature-05-budget-management)
    - [5.5.1 US-05-01: Create a Budget for a Wallet](#551-us-05-01-create-a-budget-for-a-wallet)
  - [5.6 Feature-06: Transaction Management](#56-feature-06-transaction-management)
    - [5.6.1 US-06-01: Create a Transaction for a Wallet](#561-us-06-01-create-a-transaction-for-a-wallet)
  - [5.7 Feature-07: Financial Reporting](#57-feature-07-financial-reporting)
  - [5.8 Feature-08: Financial Goal](#58-feature-08-financial-goal)
  - [5.9 Feature-09: Investment Portfolio](#59-feature-09-investment-portfolio)
  - [5.10 Feature-10: Notification Handling](#510-feature-10-notification-handling)
  - [5.11 Feature-11: Data Overview Dashboard](#511-feature-11-data-overview-dashboard)
- [6. API Design](#6-api-design)
  - [6.1 API Design Standards](#61-api-design-standards)
  - [6.2 Data Transfer Objects (DTOs) & Domain Mapping](#62-data-transfer-objects-dtos--domain-mapping)
    - [6.2.1 DTO Registry](#621-dto-registry)
    - [6.2.2 Field-Level Mapping](#622-field-level-mapping)
  - [6.3 API Index](#63-api-index)
  - [6.4 API Specification](#64-api-specification)
    - [6.4.1 POST /wallets](#641-post-wallets)
    - [6.4.2 GET /wallets](#642-get-wallets)
    - [6.4.3 GET /wallets/{id}](#643-get-wallets-id)
    - [6.4.4 POST /categories](#644-post-categories)
    - [6.4.5 POST /budgets](#645-post-budgets)
    - [6.4.6 POST /transactions](#646-post-transactions)
  - [6.5 API → User Story Traceability](#65-api--user-story-traceability)
  - [6.6 Error Response Catalog](#66-error-response-catalog)
- [7. Security Design](#7-security-design)
  - [7.1 User Authentication](#71-user-authentication)
  - [7.2 User Authorization](#72-user-authorization)
  - [7.3 Threat Modeling](#73-threat-modeling)
  - [7.4 Data Protection](#74-data-protection)
  - [7.5 Secret Management](#75-secret-management)
- [8. Non-Functional Requirements (NFR)](#8-non-functional-requirements-nfr)
- [9. Design Decisions and Tradeoffs (ADRs)](#9-design-decisions-and-tradeoffs-adrs)
  - [9.1 Technology Stack Selection](#91-technology-stack-selection)
  - [9.2 Authentication Mechanism Selection](#92-authentication-mechanism-selection)
- [10. Product Metrics](#10-product-metrics)
  - [10.1 Purpose](#101-purpose)
  - [10.2 Metric Categories](#102-metric-categories)
  - [10.3 Core Metrics for PFM](#103-core-metrics-for-pfm)
    - [10.3.1 Adoption and Engagement Metrics](#1031-adoption-and-engagement-metrics)
    - [10.3.2 Financial Behavior Improvement Metrics](#1032-financial-behavior-improvement-metrics)
    - [10.3.3 Operational Quality Metrics](#1033-operational-quality-metrics)
    - [10.3.4 Notification and Awareness Metrics](#1034-notification-and-awareness-metrics)
  - [10.4 MVP Metric Measurement Scope](#104-mvp-metric-measurement-scope)
  - [10.5 Privacy and Ethics Considerations](#105-privacy-and-ethics-considerations)
  - [10.6 Technical Observability](#106-technical-observability)
- [11. Future Enhancements](#11-future-enhancements)
- [12. Appendix](#12-appendix)
- [13. External Integrations](#13-external-integrations)

---

## 1. Introduction

### 1.1 Purpose

This document defines the Software Design Specification (SDS) for the Personal Finance Management (PFM) system.
The purpose of this document is to describe how the PFM product is designed to satisfy the requirements defined in the SRS, following structures and practices commonly used in real-world software projects.

### 1.2 Scope

This SDS describes the design of the PFM product as a whole, independent of a specific release. The design is intended to evolve across multiple releases.
Within the KPITAI course, learners will implement an MVP subset of this design for learning purposes, while the SDS remains the reference design for future extensions.

### 1.3 Assumptions and Constraints

#### 1.3.1 Assumptions

- Users manually input personal financial data.
- The system is initially implemented as a Monolith.
- The design supports incremental growth across releases.

#### 1.3.2 Constraints

- External banking integrations are not required in early releases.
- Implementation code is not included in this document.

### 1.4 Definitions and Acronyms

| Term | Definition |
|------|------------|
| SDS | Software Design Specification |
| SRS | Software Requirements Specification |
| PFM | Personal Finance Management |
| US | User Story |
| API | Application Programming Interface |

### 1.5 Related Documents


| Document | Location | Purpose |
|----------|----------|---------|
| SRS | {path or URL} | Software Requirements Specification |
| RUNBOOK | {path or URL} | Operational guide — setup, deployment, troubleshooting |

---

## 2. Technical Domain Model

> This section is the **technical implementation** of the Conceptual Domain Model in **SRS §2**.
> Every entity in SRS §2.2 MUST have a corresponding Domain Object here. Any class introduced
> for purely technical reasons (e.g., audit records, session tokens) must be marked
> "Technical-Only" in §2.0 and has no SRS counterpart.
>
> **Primary Keys, column types, indexes, and FK constraints belong in §4.3.3, not here.**
> Domain Object describe the in-memory shape; the Physical Schema describes storage.
>
> **Sync obligation:** when SRS §2 is amended, this section MUST be updated in the same PR.
> **Last synced with SRS §2:** {YYYY-MM-DD}

This section describes the core business concepts of the PFM domain and their relationships, independent of technical implementation.

### 2.1 Domain Layer Traceability

> Single table that keeps the three representations in sync: conceptual (SRS) → code (here) →
> storage (§4.3.3). A reviewer should be able to verify all three columns in one glance.
> Any mismatch between this table and the actual codebase is a spec violation.

| SRS §2.2 Entity | SDS §2.1 Domain Object | SDS §4.3.3 DB Table / Collection | Notes |
|-----------------|------------------------|----------------------------------|-------|
| User | `User` | `users` | Aggregate Root |
| Wallet | `Wallet` | `wallets` | Aggregate Root; FK → `users` |
| Transaction | `Transaction` | `transactions` | FK → `wallets`, optional FK → `categories`, optional FK → `financial_goals` |
| Category | `Category` | `categories` | Aggregate Root; nullable self-referencing FK → `categories.id` (parent) |
| Budget | `Budget` | `budgets` | FK → `wallets`; many-to-many with `categories` via join table |
| FinancialGoal | `FinancialGoal` | `financial_goals` | Aggregate Root; FK → `users` |
| InvestmentPortfolio | `InvestmentPortfolio` | `investment_portfolios` | 1:1 with `users`; FK → `users` |
| Holding | `Holding` | `holdings` | FK → `investment_portfolios`, FK → `assets` |
| Asset | `Asset` | `assets` | Shared reference; no FK to user-owned entities |
| Notification | `Notification` | `notifications` | FK → `users` |
| — | — | `budget_categories` | Technical-only join table for Budget ↔ Category many-to-many (SRS §2.3) |

### 2.2 Domain Object

> Anemic domain objects — data shape only. Business logic lives in the Service Layer (§4.3.2).
> Use language-agnostic types: `string`, `int`, `bool`, `datetime`, `uuid`, `enum`, `list[T]`.
> Do **not** include DB types (`VARCHAR`, `BIGINT`), PKs, or indexes here.

#### 2.2.1 User

> **SRS Entity:** User
> **Type:** Aggregate Root

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

#### 2.2.2 Wallet

> **SRS Entity:** Wallet
> **Type:** Aggregate Root

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

#### 2.2.3 Category

> **SRS Entity:** Category
> **Type:** Entity

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

#### 2.2.4 Budget

> **SRS Entity:** Budget
> **Type:** Entity

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

#### 2.2.5 Transaction

> **SRS Entity:** Transaction
> **Type:** Entity

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

#### 2.2.6 FinancialGoal

> **SRS Entity:** FinancialGoal
> **Type:** Entity

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

#### 2.2.7 InvestmentPortfolio

> **SRS Entity:** InvestmentPortfolio
> **Type:** Aggregate Root

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

#### 2.2.8 Asset

> **SRS Entity:** Asset
> **Type:** Entity

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

#### 2.2.9 Holding

> **SRS Entity:** Holding
> **Type:** Entity

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

#### 2.2.10 Notification

> **SRS Entity:** Notification
> **Type:** Entity

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |

### 2.3 Domain Object Relationships

> Documentation of how objects reference each other in memory/code.

#### 2.3.1 {Object Name} – {Object Name}
- **Relationship Type:** {Composition (Owner) | Aggregation (Reference)}
- **Cardinality:** {0..n, 1..n, 0..1, 1..1, n..n}
- **Navigation:** {Bidirectional | Unidirectional}
- **Implementation:** {e.g., List<Entity> vs Foreign Key ID only}

### 2.4 Domain Object State Transition Diagram (STD)
> Document transitions for objects with a `status` field.

#### {Object Name} State Transition Diagram

```text
{INITIAL} ──────────────────► {STATE_A} ──► {TERMINAL_1}
                                    └──────► {TERMINAL_2}
```


| State | Meaning | Transitions to |
|-------|---------|----------------|
| {STATE} | {System implication of this state} | {comma-separated next states} |

---

## 3. UI Design

### 3.1 UI / UX Principles

*(To be defined)*

### 3.2 Wireframes — UI / UX

*(Wireframe diagrams to be inserted here)*

---

## 4. Architecture Design

This chapter describes the system architecture using multiple architectural views, a common industry practice to ensure different stakeholders can understand the system from different perspectives.

This SDS explicitly uses:
- **C4 Model** to visualize system structure at different levels
- **"4+1 Views" Model** to organize architectural views

The following tools are recommended to create and maintain architectural diagrams:
- **draw.io (diagrams.net)** – supports all "4+1 Views" and C4 diagrams using free-form notation
- **PlantUML** – for text-based diagrams and version control

### 4.1 System Context

*(C4 Model – System Context Diagram)*

The PFM provides personal finance management capabilities to individual users.
- **Primary actors:** End Users
- **External systems:** None (initially)

This view defines the system boundary and its interaction with external actors.

### 4.2 Logical View

*("4+1 Views" Model – Logical View)*

At a logical level, the PFM system consists of the following major functional areas:
1. User Management
2. System Security
3. Wallet Management
4. Category Management
5. Budget Management
6. Transaction Management
7. Financial Reporting
8. Notification Handling

This view focuses on responsibilities and separation of concerns, not implementation details.

### 4.3 Development View

*("4+1 Views" Model – Development View)*

#### 4.3.1 Frontend Architecture

**Technology Stack**

| Phase | Stack |
|-------|-------|
| POC | Flet/PyQt6|
| MVP | React, Next.js |
| Releases | TBD |

#### 4.3.2 Backend Architecture (Service Layer)

The system is organized using a **3-Layer Architecture**: Controller → Service → Repository (DAO)

**Technology Stack**

| Phase | Stack |
|-------|-------|
| POC | Python - CSV |
| MVP | DRF - Django ORM - SQLite |
| Releases | TBD |

**Suggested code organization:**
- `controller`
- `service`
- `repository`
- `model`
- `dto`
- `security`
- `common`

This view supports maintainability and team collaboration.

> Define the **Transaction Scripts** (Service Classes) that manipulate the Anemic Domain Model.

| Service Name | Responsibility | Managed Entities |
|--------------|----------------|------------------|
| `{Name}Service` | {Business logic description} | {Entities modified} |

#### 4.3.3 Data Design

##### Storage Choices

| Store | Technology | Rationale |
|-------|-----------|-----------|
| {Relational} | {e.g., PostgreSQL} | {ACID, complex joins, etc.} |
| {Cache} | {e.g., Redis} | {Low-latency, TTL} |

##### Physical Data Schema (ERD Mapping)

**Data Integrity Rules**

This section defines business rules and constraints derived from the domain model.

**Database Design**

This section maps the Domain Model to the physical Database Structure.

> Maps storage to the Domain Object defined in §2.1 and the traceability table in §2.0.
> Every table here MUST have a corresponding row in §2.0. Column names may differ from
> Domain Object attribute names — document the delta in the Notes column.

| Table / Collection | Domain Object (§2.1) | Key columns / fields | Notes |
|-------------------|----------------------|---------------------|-------|
| `{table_name}` | `{ClassName}` | `id UUID PK`, `{col} {type} {constraints}` | {FK refs, indexes, column renames vs domain object} |

##### Migration Strategy

### 4.4 Process View

*("4+1 Views" Model – Process View)*

Typical runtime behavior:
1. Controller receives request
2. Service applies business rules
3. Repository accesses data
4. Response is returned to the UI

Concurrency and performance optimizations may be introduced in later releases.

#### 4.4.1 Sequence Diagrams
> Showing how the Service Layer coordinates Domain Object.

```text
{Actor} -> {Service}: {method_call}
{Service} -> {Repository}: find(id)
{Repository} --> {Service}: {DomainObject}
{Service} -> {Service}: execute_business_logic({DomainObject})
{Service} -> {Repository}: save({DomainObject})
```

### 4.5 Physical View

*("4+1 Views" Model – Physical View)*

Initial deployment:
- Single application instance
- Single database
- Separate development and production environments

This view may evolve as scalability requirements grow.

### 4.6 Key Scenarios

Key scenarios are used to validate that the system architecture can support real business needs.
Each scenario corresponds to a User Story defined in Chapter 5.
These scenarios represent the Scenarios (+1 View) of the "4+1 Views" Model.

**Scenario Index**

| Scenario ID | Feature | User Story | MVP | Notes |
|-------------|---------|------------|-----|-------|
| S-URM-01 | Feature-01: User Management | US-01-01 Register a User | ✔ | Entry point for new users |
| S-SEC-01 | Feature-02: System Security | US-02-01 Login | ✔ | Required before protected actions |
| S-WAL-01 | Feature-03: Wallet Management | US-03-01 Create a Wallet | ✔ | Core financial container |
| S-CAT-01 | Feature-04: Category Management | US-04-01 Create a Category | ✔ | Used by transactions |
| S-BUD-01 | Feature-05: Budget Management | US-05-01 Create a Budget for a Wallet | ✔ | Spending control |
| S-TRX-01 | Feature-06: Transaction Management | US-06-01 Create a Transaction for a Wallet | ✔ | Primary core scenario |
| S-RPT-01 | Feature-07: Financial Reporting | US-07-01 View the Summary Report | ✔ | Insight & feedback loop |
| S-NOT-01 | Feature-10: Notification Handling | US-10-01 View the list of Notifications | ✔ | User awareness |

### 4.7 Architecture Principles

- Keep domain pure
- Secure by default
- API-first
- Data consistency first
- Fail-safe
- Idempotency for finance ops
- Observability ready
- Logs are first-class signals

---

## 5. Product Features and User Story Specification

This chapter provides build-ready design details per Feature and User Story, aligned with the SRS.

### 5.1 Feature-01: User Management

#### 5.1.1 US-01-01: Register a User

*(Details to be defined)*

### 5.2 Feature-02: System Security

#### 5.2.1 US-02-01: Login

*(Details to be defined)*

#### 5.2.2 US-02-02: Logout

*(Details to be defined)*

### 5.3 Feature-03: Wallet Management

#### 5.3.1 US-03-01: Create a Wallet

*(Details to be defined)*

### 5.4 Feature-04: Category Management

#### 5.4.1 US-04-01: Create a Category

*(Details to be defined)*

### 5.5 Feature-05: Budget Management

#### 5.5.1 US-05-01: Create a Budget for a Wallet

*(Details to be defined)*

### 5.6 Feature-06: Transaction Management

#### 5.6.1 US-06-01: Create a Transaction for a Wallet

**Goal:** Allow an authenticated User to create an income or expense Transaction for a Wallet they own.

**Preconditions:**
- User is authenticated.
- Wallet exists and belongs to the user.

**Layers Involved:**
- TransactionController
- TransactionService
- TransactionRepository
- WalletRepository
- CategoryRepository (optional)
- Budget / Notification logic (optional)

**APIs Involved:**
- Endpoint: `POST /transactions`

**Success Response**
- `transaction_id`
- `status`
- `message`

**Error Responses**
- `400 INVALID_INPUT`
- `403 WALLET_ACCESS_DENIED`
- `404 WALLET_NOT_FOUND`

**Main Flow**
1. Controller receives request and validates input.
2. Service validates wallet ownership.
3. Service creates a Transaction.
4. Repository persists data transactionally.
5. Optional: budget update and notification trigger.
6. Controller returns a response.

### 5.7 Feature-07: Financial Reporting

*(Details to be defined)*

### 5.8 Feature-08: Financial Goal

*(Details to be defined)*

### 5.9 Feature-09: Investment Portfolio

*(Details to be defined)*

### 5.10 Feature-10: Notification Handling

*(Details to be defined)*

### 5.11 Feature-11: Data Overview Dashboard

*(Details to be defined)*

---

## 6. API Design

### 6.1 API Design Standards

- **Protocol:** REST-style APIs
- **Naming convention:** {To be defined}
- **Authentication style:** {To be defined}
- **Versioning:** URL-based (`/api/v1`)
- **Pagination:** {To be defined}
- **Payload Format:** JSON request/response

**Standard error structure:**
- `error_code`
- `message`
- `details` (optional)

### 6.2 Data Transfer Objects (DTOs) & Domain Mapping

> This section is the **Anti-Corruption Layer contract** between the external API surface and the
> internal Technical Domain Model (§2.1). Its purpose: internal model changes (renames, refactors,
> DB normalisations) must never silently break the API contract.
>
> Every DTO MUST have a 1:1 corresponding Pydantic model in code (Request/Response class).
> A PR that renames a Domain Object attribute MUST update both this table and the Pydantic model.

#### 6.2.1 DTO Registry

| DTO Name | Direction | Source Domain Object(s) | Structural Pattern | Breaking Change Risk |
|----------|-----------|-------------------------|--------------------|----------------------|
| `{Resource}Response` | Out (API → Client) | `{DomainObject}` | Direct Map \| Projected Subset \| Flattened Join \| Composed | Low \| Medium \| High |
| `{Resource}Request` | In (Client → API) | `{DomainObject}` | Direct Map \| Subset | Low \| Medium \| High |

#### 6.2.2 Field-Level Mapping

*(To be defined)*

### 6.3 API Index

> **Idempotency:** Endpoints marked `✓` produce the same result if retried.

| API ID | Method | Path | Feature | Idempotency |
|--------|--------|------|---------|-------------|
| API-WAL-01 | `POST` | `/wallets` | Wallet Management | ✗ |
| API-WAL-02 | `GET` | `/wallets` | Wallet Management | ✓ |
| API-WAL-03 | `GET` | `/wallets/{id}` | Wallet Management | ✓ |
| API-TRX-01 | `POST` | `/transactions` | Transaction Management | ✗ |
| API-TRX-02 | `GET` | `/transactions` | Transaction Management | ✓ |
| API-TRX-03 | `GET` | `/transactions/{id}` | Transaction Management | ✓ |

### 6.4 API Specification

> **OpenAPI / Swagger:** {Link to Swagger UI / Redoc}

#### 6.4.1 POST /wallets

*(To be defined)*

#### 6.4.2 GET /wallets

*(To be defined)*

#### 6.4.3 GET /wallets/{id}

*(To be defined)*

#### 6.4.4 POST /categories

*(To be defined)*

#### 6.4.5 POST /budgets

*(To be defined)*

#### 6.4.6 POST /transactions

**Main Flow**
1. Controller receives request and validates input.
2. Service validates wallet ownership.
3. Service creates a Transaction.
4. Repository persists data transactionally.
5. Optional: budget update and notification trigger.
6. Controller returns a response.

**Success Response**
- `transaction_id`
- `status`
- `message`

**Error Responses**
- `400 INVALID_INPUT`
- `403 WALLET_ACCESS_DENIED`
- `404 WALLET_NOT_FOUND`

### 6.5 API → User Story Traceability

> Ensures every endpoint exists to fulfill a specific requirement from the SRS.

| API | Endpoint | Feature | User Story |
|-----|----------|---------|------------|
| API-WAL-01 | `POST /wallets` | Wallet Management | US-03-01 |
| API-TRX-01 | `POST /transactions` | Transaction Management | US-06-01 |

### 6.6 Error Response Catalog

> Global error codes shared across all endpoints.

| HTTP | Error Code | Domain/Business Reason | Resolution |
|------|------------|-------------------------|------------|
| 400 | `INVALID_INPUT` | Request payload fails validation | Check required fields and formats. |
| 403 | `WALLET_ACCESS_DENIED` | User does not own the referenced Wallet | Verify wallet ownership. |
| 404 | `WALLET_NOT_FOUND` | Provided wallet ID does not exist | Verify ID and retry. |

---

## 7. Security Design

### 7.1 User Authentication

All protected APIs require authenticated user context.

### 7.2 User Authorization

Users can only access data they own (e.g., Wallet, Transaction, Category).

### 7.3 Threat Modeling

*(To be defined)*

### 7.4 Data Protection

*(To be defined)*

### 7.5 Secret Management

*(To be defined)*

---

## 8. Non-Functional Requirements (NFR)

> Architectural fulfillment of SRS Section 4.

| No. | NFR | Design Approach |
|-----|-----|-----------------|
| 1 | Performance | Indexed queries |
| 2 | Availability | Single-instance initially |
| 3 | Scalability | Clean layering |
| 4 | Security | Auth + ownership checks |
| 5 | Privacy | User data isolation |
| 6 | Reliability | Transactional writes |

---

## 9. Design Decisions and Tradeoffs (ADRs)

- Monolith chosen for early simplicity and clarity.
- Design allows future evolution without rewriting fundamentals.

### 9.1 Technology Stack Selection

*(To be defined)*

### 9.2 Authentication Mechanism Selection

*(To be defined)*

---

## 10. Product Metrics

### 10.1 Purpose

Product Metrics define how the success and effectiveness of the PFM product are measured during real-world usage.
These metrics help stakeholders evaluate whether the product is delivering user value, supporting financial behavior change, and operating reliably over time.
Metrics are collected and monitored across releases to support data-driven product decisions and continuous improvement.
Metrics are non-functional outcomes and are independent of any specific feature implementation.

### 10.2 Metric Categories

The PFM product adopts four main categories of product metrics:

1. **Adoption & Engagement Metrics** — Measure how users adopt and actively use the system.
2. **Financial Behavior Metrics** — Measure whether users achieve better financial management outcomes through the product.
3. **Operational Quality Metrics** — Measure reliability and stability of the system.
4. **Notification & Awareness Metrics** — Measure whether system signals effectively reach the user.

Each metric includes a definition and a measurement scope.

### 10.3 Core Metrics for PFM

#### 10.3.1 Adoption and Engagement Metrics

| Metric | Description |
|--------|-------------|
| MAU – Monthly Active Users | Number of distinct users performing at least one meaningful financial action per month (e.g., add transaction, create wallet, edit budget). |
| DAU/MAU Ratio | Measures product stickiness and recurring behavior. |
| Retention Rate (D30) | Percentage of users still active 30 days after registration. |
| Average Transactions per Active User per Month | Indicates depth of usage. |
| Report Views per User | Measures engagement with insight-driven features. |

#### 10.3.2 Financial Behavior Improvement Metrics

| Metric | Description |
|--------|-------------|
| Budget Compliance Rate | % of months where spending stays within configured budgets. |
| Savings Goal Success Rate | % of users achieving at least one Financial Goal. |
| Recurring Expense Capture Rate | % of recurring expenses logged in the system. |
| Expense Categorization Coverage | % of transactions categorized. |
| Net Savings Change Trend | Average increase/decrease in net savings over time (self-reported). |

> These metrics reflect behavioral outcome, not financial advice.

#### 10.3.3 Operational Quality Metrics

| Metric | Description |
|--------|-------------|
| System Availability | % uptime measured monthly. |
| Failed Transaction Write Rate | % API requests to `/transactions` resulting in error. |
| Average API Response Time | End-to-end latency for core operations. |
| Data Consistency Incidents | Number of cases where balance or totals are incorrect. |
| Backup Success Rate | % successful backup cycles. |

#### 10.3.4 Notification and Awareness Metrics

| Metric | Description |
|--------|-------------|
| Notification Delivery Success Rate | % notifications successfully delivered. |
| Notification Open/Interaction Rate | % users opening or viewing notifications. |
| Critical Alert Acknowledgement Rate | % of high-priority alerts acknowledged. |

### 10.4 MVP Metric Measurement Scope

During MVP, only lightweight metrics may be collected, such as:
- Active user counts
- Transaction activity volume
- Report view counts
- System availability

Advanced financial-behavior metrics may be introduced in later releases.

### 10.5 Privacy and Ethics Considerations

- Metrics are stored and processed anonymously or pseudonymously.
- No financial advice inference is performed.
- Users maintain full ownership of financial data.
- Metrics collection follows applicable privacy policies.

### 10.6 Technical Observability

**Logging | Tracing | Alerting**

*(To be defined)*

---

## 11. Future Enhancements

- Recurring transactions
- Advanced analytics
- Migration to microservices when required

---

## 12. Appendix

- Architecture diagrams (draw.io)
- Optional PlantUML definitions

---

## 13. External Integrations
