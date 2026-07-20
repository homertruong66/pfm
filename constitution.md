# PFM Constitution

## Table of Contents

- [Part 1: Common Engineering Principles](#part-1-common-engineering-principles)
  - [Spec-Driven Development (SDD)](#spec-driven-development-sdd)
  - [Simplicity Over Premature Scale](#simplicity-over-premature-scale)
  - [Cross-Document Consistency](#cross-document-consistency)
  - [Governance](#governance)
  - [AIF-SDLC Workflow](#aif-sdlc-workflow)
  - [Feature Derivation Method](#feature-derivation-method)
  - [User Story Conventions](#user-story-conventions)
  - [Layered Architecture](#layered-architecture)
  - [Integration Testing Over Mocking](#integration-testing-over-mocking)
- [Part 2: Project-Specific Rules](#part-2-project-specific-rules)
  - [Business Terminology](#business-terminology)
  - [Business Rules](#business-rules)
  - [Technical Principles](#technical-principles)
  - [Access Control](#access-control)
  - [API Design Standards](#api-design-standards)
  - [Naming Conventions](#naming-conventions)
  - [Frontend Conventions](#frontend-conventions)
  - [Validation Rules](#validation-rules)
  - [Logging & Audit](#logging--audit)
  - [Performance Standards](#performance-standards)
  - [Definition of Done](#definition-of-done)
  - [Technology Stack](#technology-stack)
  - [Development Workflow](#development-workflow)
  - [Security Requirements](#security-requirements)

---

## Part 1: Common Engineering Principles

### Spec-Driven Development (SDD)

Every functionality MUST have a corresponding user story in `SRS.md` before any code is written.
- The **SRS** is the single source of truth for **what** the system does and **why**.
- The **SDS** is the single source of truth for **how** it is designed.
- Implementation that diverges from either document MUST amend the spec first — **code does not lead, specs do**.

Each speckit feature folder (`specs/{feature-id}-{name}/`) maps 1:1 to a Feature in SRS §7 / SDS §5.
- All User Stories belonging to the same Feature share one `spec.md` and one `plan.md`.
- Spec files (`spec.md`, `plan.md`) must be committed before implementation begins.

### Simplicity Over Premature Scale

Do not add abstractions, patterns, or dependencies beyond what the current task requires. No speculative generality.

Three similar lines are better than a premature abstraction. If a library can be replaced with a few lines of standard library code, prefer the standard library. Every new dependency must be justified.

### Cross-Document Consistency

SRS, SDS, and code are three views of the same system. Any change to one that affects the others is incomplete until all three are updated.
**Inconsistency between documents is treated as a defect, not a backlog item**.

**SRS is the source of truth for domain language.** Any entity, relationship, or term defined in SRS §2 MUST be used verbatim in SDS §2.1, user stories, acceptance criteria, and code identifiers. Synonyms are forbidden — if SRS says `FinancialGoal`, the SDS, tests, and code say `FinancialGoal` (or its direct technical mapping documented in SDS §2.1).

**SRS §2 amendments require same-PR SDS §2.1 updates.** Adding, renaming, or removing a domain entity in SRS §2.2 or §2.3 MUST be accompanied by a corresponding update to the SDS §2.1 Domain Layer Traceability table in the same pull request. No entity may exist in SRS without a traceability row in SDS §2.1.

**SRS must not contain design decisions.** The SRS describes WHAT the system does and WHY; the SDS describes HOW. Technology names (frameworks, protocols, database engines, provider class names, API endpoint paths), implementation mechanisms (retry algorithms, caching strategies, memory tiers), and schema-level detail (field names, table names, token formats) belong exclusively in the SDS. Any such detail found in the SRS is a spec violation and must be removed in the same PR that introduces it.

**Heading renames cascade to all references.** Renaming a section heading in any spec document (SRS, SDS) requires updating every cross-reference to that heading in the same document (ToC, internal links) and in sibling documents in the same PR.

**Sync obligation dates must be kept current.** The "Last synced" timestamps in SRS §2 and SDS §2 MUST be updated whenever those sections change. A stale sync date is a signal that the obligation was not met.

**SRS sections are internally consistent.** §2 (CDM), §6 (Business Flows), §7 (Features/USs), and the SRS ToC are four views of the same domain. A change to any one that affects another is incomplete until all affected sections are updated in the same PR:
- Adding or renaming a domain entity in §2 requires reviewing §6 flow steps and §7 acceptance criteria for stale references.
- Adding, changing, or removing a flow step in §6 requires either a matching story in §7 or an explicit traceability note explaining the gap.
- Adding, renaming, or removing a feature or story in §7 requires updating the SRS ToC in the same edit.

**Known open drift (fix opportunistically, not blocking):** the code written so far predates several SDS §2/§4.3.3 decisions. When touching any of the following, reconcile the divergence in the same PR rather than deepening it:
- Primary keys — SDS §2.2/§4.3.3 specify `uuid`; the current Django models use the default integer `BigAutoField`.
- Enum values — SDS §2.2 documents upper-case values (e.g. `INCOME`/`EXPENSE`); the current code's `TextChoices` use lower-case values (e.g. `'income'`).
- `Budget` shape — SDS §2.2.4/§2.3.12 model a many-to-many `Budget ↔ Category` with a `period` enum; the current `Budget` model has a single nullable `category` FK and an explicit `period_start`/`period_end` date range.
- `Role` — SDS §2.2.11/§2.3.14 model `Role` as its own entity in a many-to-many with `User`; no `Role`/`user_roles` table exists in code yet (`users.User` is a plain `AbstractUser`).

### Governance

This constitution supersedes all other practices, preferences, and ad-hoc decisions. Any amendment requires:
1. A documented reason for the change
2. Team review and approval
3. An update to this file with a new version and amendment date

All code reviews must verify compliance with this constitution. Complexity and exceptions must be justified in the PR description, not in code comments.

### AIF-SDLC Workflow

1. **AIF-SDLC steps**: see [aif-sdlc.md](aif-sdlc.md)
   - **1. Spec Step** — Spec Prompt: writes US in SRS → `/speckit-specify` → `spec.md` → spec link on SRS feature header
   - **2. Design Step** — Design Prompt: reviews spec → `/speckit-plan` → `plan.md` → plan link on SDS feature header
   - **3. Quality Step** — Quality Prompt: generates `test_cases.md` + automation code (covers all USs in feature)
   - **4. Implementation Step** — Implementation Prompt: `/speckit-implement` → code
   - **5. Deployment Step** — Deployment Prompt: deploys US to the home-LAN host for QC verification
   - **6. Verification Step** — Verification Prompt: runs automated tests + manual E2E/integration → mark the User Story Done per Definition of Done
2. **Constitution compliance check** is required on every pull request before merge.
3. **Spec-kit feature folders** live under `specs/{feature-id}-{name}/` and are
   committed alongside the implementation PR.
4. **AIF-SDLC completion requires full document sync.** A User Story is not done until all documents affected by that US are updated in the same PR as the implementation:
   - SRS §7 — acceptance criteria refined if implementation revealed edge cases
   - SDS §5 — design notes finalised with actual implementation decisions
   - SDS §2.1 traceability table — "implementation class/table" transition notes removed; "Columns TBD" and "to be added" placeholders replaced with actual names and column definitions
   - SDS §4.3.3 DB schema — table columns finalised
   - SRS §2 / SDS §2 sync dates — updated if any domain entity or relationship changed

### Feature Derivation Method

When designing or reviewing Features and User Stories in SRS.md §7, apply this method in order:

1. **Start with §2 CDM.** For every Domain Entity, consider whether CRUD operations are required by an actor. If yes, write one User Story per operation that makes sense (Create, List, Update, Delete). Not every entity needs all four — derive only what the system and its actors genuinely need.

2. **Enrich from §6 Business Flows.** After CDM-derived stories are written, trace each step in each named flow (§6.1–6.9). If a step has no corresponding User Story yet, add one. Flow steps that are already covered by a CDM-derived story do not need a duplicate.

3. **Traceability is mandatory.** Every Feature MUST trace to a CDM entity (§2.2) or a Business Flow step (§6). Features that cannot be traced to either are spec violations — update §2 or §6 first.

4. **One story, one actor, one outcome.** A User Story describes what a single role wants to do and why, follows the format: **As a/an** [actor], **I want to** [goal] **so that** [reason]. If two roles want to do the same thing for different reasons, write two stories.

### User Story Conventions

These rules apply every time a Feature or User Story is created, renamed, renumbered, or removed in SRS §7 or SDS §5. Violations are treated as spec defects.

**1. Prefix derivation.**
Every story prefix (the code before `-US-`) is the uppercase initials of the Feature name's significant words, in order. Examples:

| Feature name | Prefix |
|---|---|
| System Security | `SS` |
| Notification Handling | `NH` |

When a Feature is renamed, its prefix follows the new name. All story IDs must be updated in SRS §7, SDS §5, §4.6 Key Scenarios, and the SDS §6.5 API traceability table — with a version bump to both documents.

**2. Sequential numbering, no gaps.**
Story numbers within a Feature start at `01` and increment with no gaps: `{PREFIX}-US-01`, `{PREFIX}-US-02`, etc. When a story is removed, all higher-numbered stories in the same Feature are renumbered to close the gap. Renumbering requires updating every reference in SRS §7, SDS §5, §4.6, and SDS §6.5.

**3. ToC synchronisation is mandatory and immediate.**
Whenever a Feature or story is added, renamed, renumbered, or removed:
- The SRS §7 ToC entry must be updated in the same edit.
- The SDS §5 ToC entry must be updated in the same edit.
- The two ToCs must remain identical in feature names/prefixes, story IDs, and story names.

A spec change that touches §7 or §5 body without updating both ToCs is incomplete.

**4. SRS §7 ↔ SDS §5 are always 1:1.**
Feature names, story IDs, and story names must match exactly across both documents at all times. The "Last synced" date at the top of SDS §5 (or §2, whichever governs) must be updated whenever the section changes.

### Layered Architecture

The backend is Django + Django REST Framework (DRF), not a Java Controller/Service/Repository stack — these rules map the same separation-of-concerns intent onto Django's idioms.

**AR-01: Service Layer for Non-Trivial Business Logic**
Straightforward CRUD (list/retrieve/create/update/delete scoped only by ownership) may stay directly in the DRF View + Serializer — no service module required (see Simplicity principle). Once a use case spans more than one model, has a business rule beyond field validation, or has side effects (e.g. creating a Transaction that also updates a Budget's derived spend or fires a Notification — TM-US-01), that logic MUST move into a plain module-level service function (e.g. `transactions/services.py`), not live inline in the View or `Serializer.create()`.

**AR-02: Thin Views**
DRF Views (generic or `APIView`) handle HTTP binding, permission checks, ownership-scoped `get_queryset()`, and delegate everything else to a serializer or service function. Views must not contain business logic beyond straightforward ownership filtering.

**AR-03: Django ORM Is the Repository — No Extra Abstraction Layer**
Django's ORM (`Model.objects` / `QuerySet`) is the persistence layer. Do not introduce a hand-written Repository class wrapping the ORM — SDS §9 fixes Django ORM + SQLite (MVP) / PostgreSQL (later Releases) as the stack; there is no pending requirement to swap persistence engines that would justify the extra indirection.

**AR-04: DTO Anti-Corruption Layer**
DRF Serializers are the DTOs — the contract between the API and its clients. Keep each serializer's `fields` (and `read_only_fields`) aligned with the SDS §6.2 DTO Registry; never expose internal-only model fields (e.g. `password`) through a serializer without an explicit, reviewed field list.

**AR-05: Transactional Atomicity**
Operations that modify multiple models in one request (e.g. a Transaction write that also updates Budget spend or creates a Notification) must be wrapped in `django.db.transaction.atomic()`. If any step fails, the entire operation rolls back — no partial state changes are persisted.

### Integration Testing Over Mocking

Do not mock Django models or querysets in tests that exercise a View/endpoint.
Backend tests must run against Django's real (throwaway) test database, created automatically by `python manage.py test` — no Testcontainers or external DB needed given SQLite.
Unit tests are permitted for pure business logic with no DB/I/O (e.g. a pure calculation function extracted from a service module).
New API endpoints require at least one `APITestCase` covering the happy path before the PR is merged.

---

## Part 2: Project-Specific Rules

<!-- PFM business domain rules, technical choices, naming, and operational standards -->

### Business Terminology

Use these terms consistently across code, API contracts, database, and UI — they are the SRS §2.2 Domain Entity names verbatim:

| Term | Not |
|---|---|
| User | Account, Member (a User's login/permission is its `Role`, not a separate concept) |
| Role | Permission, Group |
| Wallet | Account (ambiguous with the User's own account) |
| Category | Tag, Label |
| Budget | Limit, Cap |
| Transaction | Entry, Record |
| FinancialGoal | Goal alone — always qualify as "Financial Goal" in user-facing text |
| InvestmentPortfolio | Portfolio alone — always qualify as "Investment Portfolio" |
| Holding | Position, Investment alone |
| Asset | Instrument, Security |
| Notification | Alert, Message (in code/API identifiers — "alert" is fine in casual UI copy) |

**Field naming:** Django, DRF, and SQLite/PostgreSQL all use `snake_case` natively — there is no camelCase translation layer between backend and database (unlike a typical Java/JS split). Frontend TypeScript types should mirror the API's `snake_case` field names as returned by DRF unless the team explicitly adds a mapping layer — don't mix `snake_case` and `camelCase` for the same field across frontend/backend.

---

### Business Rules

Business Rules (BR-01 through BR-13) are owned by **SRS §2.4** — this constitution does not duplicate them, to avoid the two documents drifting apart. Their DB-level enforcement mapping (constraints, cascade behavior, or "enforced in service layer") is documented in **SDS §4.3.3 Data Integrity Rules**. When a PR touches a Business Rule, update SRS §2.4 and, if enforcement changes, SDS §4.3.3 in the same PR.

---

### Technical Principles

**I. Monorepo Boundaries**
Backend and frontend are separate top-level folders in a single repository. Backend code must not be placed in `frontend/` and vice versa. Each module owns its own dependencies (`requirements.txt` / `package.json`) and build tooling.

**II. Backend Package-by-Feature Structure**
Backend code is organized package-by-feature (one Django app per Aggregate Root / major entity), not package-by-layer — this mirrors the SDS §2.1 Domain Layer Traceability table 1:1. Current apps: `users`, `wallets`, `categories`, `budgets`, `transactions`, `notifications`. `financial_goals`, `investment_portfolios` (with `holdings`/`assets`), and `roles` are designed in SDS §2.2 but not yet scaffolded — when added, follow the same one-app-per-entity pattern with `models.py` / `serializers.py` / `views.py` / `urls.py` / `tests.py`. Shared/cross-cutting code (e.g. custom permissions, base serializers) lives in `config/` or a new `common/` app — do not duplicate it per-app.

**III. Django Migrations Are the Schema Source of Truth**
All schema changes go through `python manage.py makemigrations` + `migrate`; never hand-edit `db.sqlite3` or bypass migrations with raw DDL. Migration files under `<app>/migrations/` are immutable once merged — create a new migration to amend a previous one, never edit a merged one in place. SQLite has limited `ALTER TABLE` support; prefer additive changes (new nullable columns/tables) and be aware some changes require Django's migration to rebuild the table under the hood.

**IV. Strict TypeScript (NON-NEGOTIABLE)**
The frontend is TypeScript-only. No `.js`/`.jsx` files in `frontend/src/`. No `any` types without an explicit comment justifying the exception. All props, state shapes, and API response shapes must be typed.

**V. Authentication and Authorization**
All API routes require JWT Bearer authentication (`djangorestframework-simplejwt`) unless explicitly public (`POST /api/v1/auth/login/`, `POST /api/v1/auth/refresh/`, `POST /api/v1/users/` for registration, `GET /health/`). Obtain a token via login, send it as `Authorization: Bearer <access_token>` on every subsequent request. Never add a route to the implicit public set without a documented reason. Secrets (`SECRET_KEY`, JWT signing config) must never be hard-coded in committed source — use environment variables (see Security Requirements; `config/settings.py` currently has a hard-coded dev `SECRET_KEY` that must move to an env var before any non-LAN deployment).

**VI. Observability**
Use Django's standard logging. Log state-changing operations and their outcome at `INFO` (success) / `WARN` (failure); log unexpected errors at `ERROR`. Never log passwords, JWTs, or personal financial data at any level. The `/health/` endpoint must remain functional. No structured-logging or metrics stack (equivalent to Logstash/Prometheus) is adopted yet — revisit if operational needs grow; do not add one unilaterally without updating this section.

---

### Access Control

**AC-01: Role-Based Feature Access**
PFM has exactly two roles (SRS §1.5), and — unlike a typical fixed-role system — **one User may hold both simultaneously** (SDS §2.3.14):

| Role | Scope |
|---|---|
| `ADMIN` | Create new User accounts (UM-US-01) only. No visibility into any User's Wallets, Transactions, Budgets, Goals, Portfolio, or Notifications — including their own, unless they also hold `USER` |
| `USER` | Full access to their own Wallets, Categories, Budgets, Transactions, Financial Goals, Investment Portfolio, and Notifications only |

**AC-02: Backend Enforces All Authorization**
Authorization decisions must be enforced in the backend (DRF permission classes + `get_queryset()` ownership filtering), never only in the frontend. Frontend controls are for UX only. The backend must return `401` for unauthenticated requests and `403` for authenticated-but-disallowed actions (e.g. a `USER`-only account calling an `ADMIN`-only endpoint).

**AC-03: Ownership Validation via Queryset Scoping**
Every list/detail/update/delete View filters its queryset by the authenticated User (already the pattern in every existing View, e.g. `Wallet.objects.filter(user=self.request.user)`). Under this pattern, a Wallet/Transaction/Category/Budget that belongs to another User is indistinguishable from one that doesn't exist — both return `404`. This is simpler and avoids ID-enumeration, but note it currently diverges from SDS §6.6's documented `403 WALLET_ACCESS_DENIED` code; reconcile explicitly (pick one behavior and update the other document) before relying on that distinction anywhere.

**AC-04: Field-Level Response Filtering**
Sensitive fields (e.g. `password`, any future payment/credential fields) must never be included in a serializer's output fields, regardless of role.

---

### API Design Standards

**API-01: Base Path and Versioning**
All business APIs are versioned under `/api/v1/` (already configured in `config/urls.py`). Endpoint paths use plural lowercase resource names matching the Django app (e.g. `/api/v1/wallets/`, `/api/v1/transactions/`); multi-word resources not yet added (e.g. Financial Goals) use kebab-case (`/api/v1/financial-goals/`). Do not bump the version without an explicit decision to break the contract.

**API-02: Response Shape — DRF-Native (No Custom Envelope)**
Responses follow DRF's default conventions — there is no custom `{success, message, data}` wrapper:
- List endpoints: DRF `PageNumberPagination` envelope `{count, next, previous, results}` (already configured, `PAGE_SIZE = 20`).
- Detail / create / update endpoints: the serialized object directly, no wrapper.
- Validation errors: DRF's default `{field: [messages], ...}` shape; non-field errors use the `errors` key (`NON_FIELD_ERRORS_KEY = 'errors'`, already configured).

**API-03: Business-Rule Errors Use SDS §6.6's Error Catalog**
For the semantic error codes already catalogued in SDS §6.6 (e.g. `WALLET_ACCESS_DENIED`, `WALLET_NOT_FOUND`), raise a DRF `APIException` subclass carrying that code (surfaced as `{"detail": "...", "code": "WALLET_ACCESS_DENIED"}` or similar) rather than a bare `403`/`404`. Do not invent new ad hoc business error codes without adding them to SDS §6.6 in the same PR.

**API-04: HTTP Status Mapping**

| Code | Meaning |
|---|---|
| 200 | Successful read / update / action |
| 201 | Successful creation |
| 400 | Malformed input / validation failure |
| 401 | Unauthenticated (missing/expired/invalid JWT) |
| 403 | Authenticated but forbidden (wrong role, or a documented ownership-denial code per API-03) |
| 404 | Resource not found (including "exists but you don't own it," per AC-03, unless API-03 applies) |
| 409 | Business conflict (e.g. duplicate email on registration) |
| 500 | Unexpected server error |

**API-05: Explicit Action Endpoints for State Transitions**
Never use a generic `PATCH /resource/{id}` to change a lifecycle state. Implement one explicit action endpoint per transition, e.g.:
- `POST /api/v1/financial-goals/{id}/close/` (OPEN → CLOSED, SDS §2.4)
- `POST /api/v1/notifications/{id}/read/` (UNREAD → READ, SDS §2.4)

**API-06: Pagination on List Endpoints**
All list endpoints use DRF `PageNumberPagination`. Default page size is 20 (already configured); if a `page_size` query param is exposed, cap it (e.g. 100) to prevent unbounded responses.

**API-07: Authentication**
JWT Bearer via `djangorestframework-simplejwt`. Obtain a token pair via `POST /api/v1/auth/login/`, refresh via `POST /api/v1/auth/refresh/`. Send `Authorization: Bearer <access_token>` on every authenticated request. Access tokens expire in 1 hour, refresh tokens in 7 days (`SIMPLE_JWT` in `config/settings.py`).

---

### Naming Conventions

**NC-01: Model and Serializer Naming**
- Django models: PascalCase singular, matching SRS §2.2 exactly (`User`, `Wallet`, `Category`, `Budget`, `Transaction`, `FinancialGoal`, `InvestmentPortfolio`, `Holding`, `Asset`, `Notification`, `Role`).
- Serializers: PascalCase model name + `Serializer` suffix (e.g. `WalletSerializer`) — matches existing code. Introduce a second serializer for the same model only when request and response shapes genuinely diverge; don't create parallel `Request`/`Response` classes by default.
- Serializer/model fields: `snake_case` (e.g. `current_balance`, `is_default`).

**NC-02: API Path Naming**
- Resource paths: plural lowercase, kebab-case for multi-word resources (e.g. `/api/v1/wallets/`, `/api/v1/financial-goals/`).
- Action endpoints: `POST` with a trailing verb path (e.g. `POST /api/v1/financial-goals/{id}/close/`).

**NC-03: Database Naming**
- Table names: `snake_case` plural, set explicitly via `class Meta: db_table = '...'` (already the pattern: `users`, `wallets`, `categories`, `budgets`, `transactions`, `notifications`).
- Column names: `snake_case` (Django default).
- Primary keys: currently Django's default integer `BigAutoField` — **note this diverges from SDS §2.2/§4.3.3's documented `uuid` PKs** (see Cross-Document Consistency's "Known open drift"); do not introduce UUID PKs in one new app while leaving the rest integer-keyed without a team decision to migrate all of them.
- Foreign keys: `<entity>_id` (Django default, e.g. `wallet_id`, `user_id`).

**NC-04: Frontend Element ID Naming**
No E2E test tooling exists yet, but name interactive elements for future automation:

| Element | Pattern | Example |
|---|---|---|
| Form field | `[entity]-[field-name]` | `wallet-name`, `transaction-amount` |
| Submit button | `btn-submit-[entity]` | `btn-submit-wallet` |
| Open create form button | `btn-add-[entity]` | `btn-add-wallet` |
| Edit row button | `btn-edit-[entity]-{id}` | `btn-edit-wallet-3` |
| Delete row button | `btn-delete-[entity]-{id}` | `btn-delete-wallet-3` |
| Table container | `table-[entity]` | `table-wallets` |
| Success / error message | `message-success` / `message-error` | — |

**NC-05: Enum Serialization**
Django `TextChoices` use lower-case values with a capitalized label (already the pattern, e.g. `TransactionType.INCOME = 'income', 'Income'`). **Note this diverges from SDS §2.2's documented upper-case enum values** (e.g. `INCOME`) — reconcile by updating SDS to lower-case rather than changing already-migrated data.

---

### Frontend Conventions

No state-management, form, HTTP-client, icon, or component library is installed yet (`frontend/package.json` has only Next.js, React, TypeScript, Tailwind, ESLint) — keep it that way until a real need justifies a new dependency (Simplicity principle).

**FE-01: Frontend Element ID Required**
Interactive/testable elements should carry a stable `id` per `NC-04`, so they're ready for automated testing whenever an E2E suite is introduced.

**FE-02: Native Form Handling for Now**
Use HTML5 form validation + React state for forms; do not add React Hook Form, Formik, Zod, or similar until a form's complexity genuinely warrants it. Backend DRF serializer validation remains the source of truth regardless (see Validation Rules).

**FE-03: Role-Aware Navigation**
Navigation and action visibility must reflect whether the authenticated User holds `ADMIN`, `USER`, or both (SDS §2.3.14). If a role cannot perform an action, hide the control — the backend must still enforce the restriction independently (AC-02).

**FE-04: No Component Library Mandated**
Build with Tailwind CSS v4 utility classes and hand-written components under `frontend/src/app/`. Revisit shadcn/ui (or similar) only if repeated ad hoc component duplication becomes a real maintenance cost.

**FE-05: No Icon Library Mandated**
Use inline SVGs or a small hand-picked set; don't add an icon library speculatively.

**FE-06: Form Feedback Standards**
Every form should provide (per SDS §3.1 UI/UX Principles): inline field-level validation feedback, a loading state during submission, and a success/error confirmation on completion.

**FE-07: Table Standards**
Data tables with growing datasets (Transactions, Notifications) should support pagination, matching the backend's `PageNumberPagination`; add sorting/filtering per-screen as the SDS §3.2 wireframes require (e.g. Transaction Management's Wallet/date filters).

**FE-08: Direct API Calls**
The frontend currently calls the backend directly at `NEXT_PUBLIC_API_URL` (`frontend/.env.local`, see RUNBOOK §4) using `fetch`, attaching the JWT bearer token. There is no Next.js API-proxy route today — introduce one only if there's a concrete reason to hide the backend origin from the browser.

---

### Validation Rules

**VL-01: Backend Is the Source of Truth**
DRF serializer validation is authoritative. Any frontend validation (HTML5, manual checks) is for user feedback only and must never be relied upon as a security or integrity gate.

**VL-02: Uniqueness Validation**
Fields that must be unique (e.g. `User.email`) are validated at the database level (`unique=True`) and surfaced as a serializer validation error — return a clear per-field error, not a generic 500.

**VL-03: Referential Integrity**
When a request references another entity (e.g. a Transaction's `category_id`), that entity must exist and belong to the same User (BR-04, BR-06 in SRS §2.4). Return `400`/`404` per API-04 if not found or not owned.

**VL-04: Date Range Validation**
Fields with date ranges (e.g. `Budget.period_start`/`period_end` in the current model) must validate `period_start <= period_end` at the serializer level.

**VL-05: Numeric Constraints**
Monetary fields (`amount`, `limit_amount`, `target_amount`, etc.) must reject zero/negative values where the business rule requires positivity (e.g. `Transaction.amount > 0`, SRS §2.4 BR-03), enforced in the serializer, not just the database.

---

### Logging & Audit

A full structured audit-log specification is deferred until SRS/SDS §7 Security Design is actually filled in (currently "To be defined"). Until then:

- Log authentication events (login success/failure) and state-changing operations (create/update/delete/close/mark-read) at `INFO` on success, `WARN` on failure.
- Never log passwords, JWTs, or raw financial data contents at any level.
- `401`/`403` responses should be logged at `WARN` with the acting User ID (if authenticated) and the endpoint/action attempted.

Revisit this section with a concrete log-line format once SDS §7 defines the actual security/audit requirements — don't invent one speculatively.

---

### Performance Standards

**PF-01: Indexed Queries**
Columns used in `filter()`/`order_by()` (e.g. `wallet_id`, `user_id`, `date`) should be indexed — add `db_index=True` or a composite `Meta.indexes` entry when a query pattern is established.

**PF-02: Narrow Serializer Fields**
Serializers must not expose fields the client doesn't need; use `fields = [...]` explicitly (already the pattern) rather than `fields = '__all__'`.

**PF-03: NFR Targets Come from SRS §4**
Do not invent stricter numeric latency/availability/concurrency targets here. SRS §4 (Performance, Availability, Scalability) is the source of truth — several of its targets are still placeholders (`{X%}`, `{N}`); fill those in SRS §4 first if a concrete target is needed, rather than picking a number in this file.

**PF-04: Pagination Enforced on Large Collections**
List endpoints for Wallets, Transactions, Categories, Budgets, and Notifications always return paginated results (API-06). Never return an unbounded queryset.

---

### Definition of Done

A feature is not done until all of the following are true:

**DOD-01: SRS/SDS Traceability**
Every implemented feature is traceable to an SRS `{ABBR}-US-{NN}` story (e.g. `WM-US-01`) and an SDS §5 design entry and API endpoint.

**DOD-02: API Contract Documented**
The endpoint is listed in the SDS API Index (§6.3) and specified in the SDS API Specification (§6.4) with main flow, success response, and error responses. The SDS §6.2 DTO Registry is updated if the schema changed.

**DOD-03: Authorization Verified**
Every protected endpoint has: JWT authentication enforced (default, per API-07), role/ownership checks (AC-02/AC-03), and tests confirming `401` for unauthenticated and `403`/`404` for disallowed requests as applicable.

**DOD-04: Validation Implemented**
Serializers validate required fields, business rules (BR-xx from SRS §2.4), uniqueness constraints, and referential integrity (VL-01 through VL-05).

**DOD-05: Test Coverage**
New features include: at least one `APITestCase` for the happy path, tests for key error cases (invalid input, wrong role/ownership, not found), and tests for state transitions where applicable (API-05).

---

### Technology Stack

Approved stack — do not upgrade major versions or introduce new core dependencies without explicit team approval.

**Backend**
- Python 3.12
- Django 6.0.7
- Django REST Framework 3.17.1
- djangorestframework-simplejwt 5.5.1 (JWT auth)
- django-cors-headers 4.9.0
- SQLite (MVP) → PostgreSQL (later Releases, per SDS §4.3.2/§9)

**Frontend**
- Node.js 18+
- Next.js 16.2.10
- React 19.2.4
- TypeScript 5
- Tailwind CSS v4
- ESLint 9

No state management, form/validation, HTTP client, icon, or UI component library is adopted yet (Frontend Conventions).

**Infrastructure**
- No containerization currently — local dev runs directly via Python venv (`backend/.venv`) and `npm`.
- Single-machine home-LAN deployment (RUNBOOK.md) — not a multi-instance/cloud production setup.

---

### Development Workflow

- Local development runs two plain processes, no Docker: `python manage.py runserver` (backend, port 8000) and `npm run dev` (frontend, port 3000) — see RUNBOOK.md for full first-time setup.
- Schema changes: `python manage.py makemigrations` then `python manage.py migrate`; commit the generated migration file(s).
- Branching: see [aif-sdlc.md](aif-sdlc.md)
- PRs must not merge if tests (`python manage.py test`, `npm run lint`, `npm run build`) are failing.
- RUNBOOK.md is the authoritative operational reference (deployment, backup/restore, troubleshooting) — keep it in sync with any change to ports, env vars, or setup steps.

---

### Security Requirements

- No secrets, credentials, or tokens in source files or committed `.env`/`.env.local` files.
- `config/settings.py` currently hard-codes `SECRET_KEY` and defaults `DEBUG = True` — both must move to environment variables (and `DEBUG = False`) before any deployment beyond a trusted home LAN.
- `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` must be reviewed whenever the deployment target changes (see RUNBOOK §3–4 for the home-LAN case).
- JWT access/refresh token lifetimes are configured via `SIMPLE_JWT` in `config/settings.py` (currently 1 hour / 7 days) — don't lengthen without a documented reason.
- The Django admin panel (`/admin/`) must remain restricted to superuser accounts created via `python manage.py createsuperuser` (RUNBOOK §8), not exposed as a general User-facing feature.
