# {Product Name} - Software Design Specification (SDS)


| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | {YYYY-MM-DD} | {Name} | Initial draft |

---

## Table of Contents

*(fill in after writing)*

---

## 1. Introduction
### 1.1 Purpose
### 1.2 Scope
### 1.3 Assumptions and Constraints
#### 1.3.1 Assumptions
#### 1.3.2 Constraints
### 1.4 Definitions and Acronyms
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

### 2.1 Domain Layer Traceability

> Single table that keeps the three representations in sync: conceptual (SRS) → code (here) →
> storage (§4.3.3). A reviewer should be able to verify all three columns in one glance.
> Any mismatch between this table and the actual codebase is a spec violation.

| SRS §2.2 Entity | SDS §2.1 Domain Object | SDS §4.3.3 DB Table / Collection | Notes |
|-----------------|------------------------|----------------------------------|-------|
| {Conceptual entity name from SRS} | `{ClassName}` | `{table_name}` | {e.g., "Split into 2 tables for normalisation"} |
| — | `{TechnicalOnlyClass}` | `{table_name}` | Technical-only; no SRS counterpart |

### 2.2 Domain Object

> Anemic domain objects — data shape only. Business logic lives in the Service Layer (§4.3.2).
> Use language-agnostic types: `string`, `int`, `bool`, `datetime`, `uuid`, `enum`, `list[T]`.
> Do **not** include DB types (`VARCHAR`, `BIGINT`), PKs, or indexes here.

#### 2.2.1 {Object Name}

> **SRS Entity:** {SRS §2.2 entity this implements, or "Technical-Only"}
> **Type:** Entity | Value Object | Aggregate Root

| Attribute | Type | Nullable | Description |
|-----------|------|----------|-------------|
| `id` | `uuid` | No | Unique identifier |
| `{field_name}` | `{type}` | Yes \| No | {Business meaning — what does this field represent?} |
| `status` | `{EnumName}` | No | Lifecycle state — see §2.3 State Machine |

#### 2.2.2 ...etc...

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
### 3.2 Wireframes — UI / UX

---

## 4. Architecture Design
### 4.1 System Context
### 4.2 Logical View
### 4.3 Development View
#### 4.3.1 Frontend Architecture
#### 4.3.2 Backend Architecture (Service Layer)
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

> Maps storage to the Domain Object defined in §2.1 and the traceability table in §2.0.
> Every table here MUST have a corresponding row in §2.0. Column names may differ from
> Domain Object attribute names — document the delta in the Notes column.

| Table / Collection | Domain Object (§2.1) | Key columns / fields | Notes |
|-------------------|----------------------|---------------------|-------|
| `{table_name}` | `{ClassName}` | `id UUID PK`, `{col} {type} {constraints}` | {FK refs, indexes, column renames vs domain object} |

##### Migration Strategy

### 4.4 Process View
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
### 4.6 Key Scenarios
### 4.7 Architecture Principles

---

## 5. Product Features and User Story Specification
### 5.1 {Feature Name 1}
#### 5.1.1 FN1-US-01: Create a {Domain Object}

---

## 6. API Design

### 6.1 API Design Standards
- **Protocol:** REST over HTTPS | GraphQL | gRPC
- **Payload Format:** JSON (camelCase)
- **Versioning:** URL-based (e.g., `/v1/`)
- **Idempotency:** Implemented via `Idempotency-Key` header for all `POST` requests.

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

> **Breaking Change Risk:**
> - **Low** — DTO field name differs from domain attribute; internal rename has no API impact.
> - **Medium** — DTO field derives from a domain field whose type or semantics could change.
> - **High** — DTO field maps 1:1 to an internal field that may be removed, split, or renamed.

#### 6.2.2 Field-Level Mapping

> Document non-obvious field-level transformation rules for each DTO. Skip trivially direct
> mappings (same name, same type, no logic). The goal is to make every implicit rule explicit.

**`{Resource}Response`** ← `{DomainObject}`

| DTO Field | DTO Type | Source | Transformation Rule |
|-----------|----------|--------|---------------------|
| `{dtoField}` | `string` | `{DomainObject}.{field}` | Direct map |
| `{dtoField}` | `string` | `{DomainObject}.{enumField}` | Enum value → display label via `{EnumName}.label()` |
| `{dtoField}` | `string \| null` | `{DomainObject}.{a}` + `{DomainObject}.{b}` | Concatenated; `null` if both absent |
| `{dtoField}` | `string` | `{DomainObject}.{datetimeField}` | `datetime` → ISO-8601 UTC string; never expose raw epoch |
| `{dtoField}` | `int` | `len({DomainObject}.{listField})` | Computed — count of related items, not the list itself |
| *(omitted)* | — | `{DomainObject}.{internalField}` | **Excluded** — internal only, never serialised to client |

**`{Resource}Request`** → `{DomainObject}`

| DTO Field | DTO Type | Target | Validation / Transform Rule |
|-----------|----------|--------|-----------------------------|
| `{dtoField}` | `string` | `{DomainObject}.{field}` | Direct map; max length {N} |
| `{dtoField}` | `string` | `{DomainObject}.{enumField}` | Validated against `{EnumName}` values; 400 if invalid |
| *(ignored)* | — | `{DomainObject}.{systemField}` | **Server-set** — client must not supply; strip if present |

### 6.3 API Index
> **Idempotency:** Endpoints marked `✓` produce the same result if retried.


| Method | Path | Description | Related Domain Object | Idempotency |
|--------|------|-------------|-----------------------|-------------|
| `POST` | `/appointments` | Create new booking | `Appointment` | ✗ (Requires Key) |
| `GET` | `/appointments/{id}` | Fetch booking details | `Appointment` | ✓ |
| `PATCH` | `/patients/{id}` | Partial profile update | `Patient` | ✓ |

### 6.4 API Specification
> **OpenAPI / Swagger:** {Link to Swagger UI / Redoc}

#### 6.4.1 Sample Request/Response Mapping

> For each endpoint, annotate the response shape with the §6.2.2 mapping rules it applies.
> This makes the DTO contract visible at the API spec level, not just in a separate table.

**Endpoint:** `GET /{resource}/{id}`
**Status:** `200 OK`
```json
{
  "{resourceId}": "uuid",
  "status": "DISPLAY_LABEL",
  "{datetimeField}": "2026-01-01T00:00:00Z",
  "{computedField}": 3,
  "_links": { "self": "/{resource}/uuid" }
}
```
> - `status` — enum → display label (§6.2.2); valid values defined in §2.3 State Machine.
> - `{datetimeField}` — ISO-8601 UTC string, never raw epoch (§6.2.2).
> - `{computedField}` — count of related items; internal list not exposed (§6.2.2).
> - `_links` — HATEOAS self-link; always present.

### 6.5 API → User Story Traceability
> Ensures every endpoint exists to fulfill a specific requirement from the SRS.


| Endpoint | Requirement ID | User Story ID |
|----------|----------------|---------------|
| `POST /appointments` | FR 2.1 | [FN1-US-01] |

### 6.6 Error Response Catalog
> Global error codes shared across all endpoints.


| HTTP | Error Code | Domain/Business Reason | Resolution |
|------|------------|-------------------------|------------|
| 400 | `INVALID_STATE` | Attempting a transition not allowed by State Machine | Check current object status. |
| 404 | `ENTITY_NOT_FOUND` | Provided ID does not exist in Domain | Verify ID and retry. |
| 409 | `SLOT_ALREADY_TAKEN` | Business rule: Double booking | Choose a different time. |

---

## 7. Security Design
### 7.1 User Authentication
### 7.2 User Authorization
### 7.3 Threat Modeling
### 7.4 Data Protection
### 7.5 Secret Management

---

## 8. Non-Functional Requirements (NFR)
> Architectural fulfillment of SRS Section 4.

---

## 9. Design Decisions and Tradeoffs (ADRs)

### 9.1 Technology Stack Selection
### 9.2 Authentication Mechanism Selection

---

## 10. Product Metrics
### 10.6 Technical Observability
**Logging | Tracing | Alerting**

---

## 11. Future Enhancements

---

## 12. Appendix

---

## 13. External Integrations
