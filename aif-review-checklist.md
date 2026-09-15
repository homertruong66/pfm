# AIF-SDLC Review Checklist

> Use this after Claude produces an artifact at each step.
> Your job is to catch what Claude gets wrong (not follow `constitution.md`) — **not to redo the work**.

- [Process Notes](#process-notes)
- [Step 1 — Spec Step · BA Reviews](#step-1--spec-step--ba-reviews)
- [Step 2 — Design Step · SE Reviews](#step-2--design-step--se-reviews)
- [Step 3 — Quality Step · QC Reviews](#step-3--quality-step--qc-reviews)
- [Step 4 — Implementation Step · SE Reviews](#step-4--implementation-step--se-reviews)
- [Step 5 — Deployment Step · SE Reviews](#step-5--deployment-step--se-reviews)
- [Step 6 — Verification Step · QC Reviews](#step-6--verification-step--qc-reviews)
- [Presentation to PO](#presentation-to-po)
- [Experience Sharing](#experience-sharing)
  - [Spec Step (BA)](#spec-step-ba)
  - [Quality Step (QC)](#quality-step-qc)

---

## Process Notes

- [ ] SDLC flow is followed in strict order: **Spec → Design → Quality → Implement → Deploy → Verification** — no step skipped or reordered
- [ ] If implementation diverges from `plan.md`, the plan is redefined first — never deviate silently and patch the plan afterward
- [ ] `spec.md` / `plan.md` are the artifacts under review here and do **not** need to match `SDS.md` / `SRS.md` verbatim — if `SDS.md` / `SRS.md` violate a constitution principle, that violation is not propagated into `spec.md` / `plan.md`
- [ ] Step 6 Verification is carried out directly on the existing Jira Story/US ticket — no separate verification ticket is created
- [ ] Cross-document inconsistency (SRS ↔ SDS ↔ code) is treated as a **defect, not a backlog item** ([constitution.md § Cross-Document Consistency](constitution.md#cross-document-consistency))

---

## Step 1 — Spec Step · BA Reviews

**Artifacts:** `spec.md` in `specs/[feature-id]-[slug]/` (ex: `specs/003-signal-configuration/`) + SRS §7 update

### Git
- [ ] Branch is checked out: `feature/NNN-xx-us-NN-spec-step` (ex: `feature/234-pp-us-01-spec-step`)

### SRS §7 Entry
- [ ] Story statement is under the correct Feature section (`§7.x`)
- [ ] Story format is correct: **As a/an** [actor], **I want to** [goal] **so that** [reason]
- [ ] Actor matches one of the roles defined in [SRS §1.5 Roles and Actors](SRS.md#15-roles-and-actors): `CUSTOMER | SYSTEM | BRAND_ADMIN | ADMIN`
- [ ] **No ACs in SRS** — only the story statement; AC block is detailed in `spec.md`
- [ ] Spec link (`> Spec: [...]`) appears **once** on the Feature header (`§7.x`), not under the US entry
- [ ] SRS Table of Contents is updated to include the new US entry

### `spec.md` Content
- [ ] All acceptance criteria provided in the prompt are present in `spec.md`, cited as `AC-NN` / `EC-NN` (per `.specify/templates/testcase-template.md`) — not `FR-NNN`/`AS-N`/`SC-NNN`, which belong to the FR/Success-Criteria tables, not the AC citation shape
- [ ] Every AC describes a **testable, observable outcome** — not an implementation detail
- [ ] No technology names, endpoint paths, DB field/table names, or LangGraph/provider internals leaked into ACs (those belong to `plan.md`) — per [constitution.md § Cross-Document Consistency](constitution.md#cross-document-consistency)
- [ ] No Domain Objects, no ERD, no sequence diagrams, no pre-defined table fields present — `spec.md` stays conceptual; those belong to the Design step
- [ ] Domain entities/terms match [SRS §2 CDM](SRS.md) verbatim — no synonyms (e.g. `BusinessOutcome`, not "outcome record") per [constitution.md § Cross-Document Consistency](constitution.md#cross-document-consistency)
- [ ] `spec.md` contains exactly **one US** per block — heading includes the `(ACTOR)` suffix matching SRS §7 verbatim (see [Experience Sharing → Quality Step](#quality-step-qc) for the recurring drift here)

### Traceability
- [ ] This US can be traced to a CDM entity (SRS §2) or a Business Flow step (SRS §6) — per [constitution.md § Feature Derivation Method](constitution.md#feature-derivation-method)
- [ ] If a new Domain Entity is introduced, SRS §2 is updated and the "Last synced" date is current
- [ ] Story prefix and numbering follow [constitution.md § User Story Conventions](constitution.md#user-story-conventions) — uppercase initials of the Feature name, sequential with no gaps

---

## Step 2 — Design Step · SE Reviews

**Artifacts:** `plan.md` in `specs/[feature-id]-[slug]/` + SDS §5 update

### Git
- [ ] Branch is checked out: `feature/NNN-xx-us-NN-design-step` (ex: `feature/235-pp-us-01-design-step`)

### Pre-flight Gaps
- [ ] Claude flagged zero spec gaps — or flagged gaps were resolved before `plan.md` was reviewed
- [ ] If `plan.md` still has significant gaps or ambiguity after review, the work goes back to the Spec step rather than being patched forward
- [ ] Design scope matches the US being designed — no scope creep into unrelated stories

### SDS §5 Entry
- [ ] Plan link (`> Plan: [...]`) appears **once** on the Feature header (`§5.x`), not under a US sub-section
- [ ] SDS Table of Contents is updated to include the new US sub-section, and stays 1:1 with the SRS §7 ToC per [constitution.md § User Story Conventions](constitution.md#user-story-conventions)

### `plan.md` — Layer Architecture
- [ ] Business logic lives in the **Services** layer (`backend/app/services/`) — Routes stay thin (HTTP shape, DTO↔domain mapping, exception→`HTTPException`), Repositories stay pure SQL ([constitution.md § Layer Architecture](constitution.md#layer-architecture))
- [ ] Services accept/return domain value objects and read models only — **never** DTOs ([constitution.md § Layer Architecture](constitution.md#layer-architecture))
- [ ] New Postgres-owned tables get a **Repository**; external systems/infrastructure clients get a **Provider** — not conflated ([constitution.md § Layer Architecture](constitution.md#layer-architecture) — "Provider vs Repository rule")
- [ ] ORM rows (`backend/app/models/entities/`, `Row` suffix) never leak past the Repository boundary — Services/Routes/Agents use `backend/app/models/domain/` only
- [ ] Exception contract is followed: Repository raises `IntegrityError` → Service raises `ConflictError`/`NotFoundError`/`AuthError` → Route raises `HTTPException` ([constitution.md § Layer Architecture](constitution.md#layer-architecture))
- [ ] Any BusinessOutcome-pipeline design change respects stage order (signal capture → trigger detection → plan generation → plan evaluation → step execution → outcome evaluation) — no stage bypassed, reordered, or merged without an explicit SDS amendment ([constitution.md § Agentic Pipeline Integrity](constitution.md#agentic-pipeline-integrity))

### `plan.md` — Guardrails & Observability
- [ ] Any new PEV/guardrail check is designed at **both** plan-evaluation time and step-execution time — not one layer only ([constitution.md § Guardrails Are Non-Negotiable](constitution.md#guardrails-are-non-negotiable))
- [ ] HITL checkpoints use the `interrupt()`/`resume_graph()` cycle — no auto-approve or bypass path designed in ([constitution.md § Guardrails Are Non-Negotiable](constitution.md#guardrails-are-non-negotiable))
- [ ] New pipeline events are designed to emit a structured JSON log entry (`timestamp`, `level`, `event_slug`, `session_id`, `trace_id`, payload) ([constitution.md § Observability First](constitution.md#observability-first))
- [ ] Any Salesforce/CRM/SFMC data access is designed to go through DPS via MCP tool calls — no direct HTTP call to Salesforce APIs from OBMS code ([constitution.md § DPS as the Salesforce Integration Boundary](constitution.md#dps-as-the-salesforce-integration-boundary))

### `plan.md` — Technology & Complexity
- [ ] No stack substitution outside [constitution.md § Technology Stack Constraints](constitution.md#technology-stack-constraints) (FastAPI, LangGraph, PostgreSQL, Qdrant, Elasticsearch) without a documented SDS §9 ADR entry
- [ ] Any complexity beyond the current validated requirement (new infra, new abstraction before 3 similar call sites, multi-tenant groundwork) is logged in the plan's Complexity Tracking table with rationale ([constitution.md § Simplicity Over Premature Scale](constitution.md#simplicity-over-premature-scale))

### Cross-Document Sync
- [ ] If a new Domain Entity is introduced: SDS §2.1 traceability table is updated in the same edit
- [ ] SRS §2 ↔ SDS §2.1 "Last synced" dates are current
- [ ] Every entity name in `plan.md` matches the SRS §2 domain language exactly — no synonyms

---

## Step 3 — Quality Step · QC Reviews

**Artifacts:** `test_cases.md` + `test_[feature-id]-[slug].spec.ts` (ex: `test_003-signal-configuration.spec.ts`) in `specs/[feature-id]-[slug]/` and `testing/[feature-id]-[slug]/` respectively

### Git
- [ ] Branch is checked out: `feature/obms-NNN-xx-us-NN-quality-step` (ex: `feature/obms-236-pp-us-01-quality-step`)

### `test_cases.md` — Coverage
- [ ] At least **one test case per acceptance criterion** in `spec.md`
- [ ] Unhappy paths covered: validation errors, rejected states, guardrail violations
- [ ] Edge cases covered: boundary values, empty/null inputs, concurrent or duplicate actions
- [ ] `[BOTH]` ACs have **both** an integration TC (API error code) and an e2e TC (inline error message) — a `[BOTH]`/`[UI]` AC with an empty E2E column, or one whose e2e doesn't demonstrate every facet its integration TC(s) cover, is a defect (note as "e2e N/A: [reason]" if genuinely not applicable)
- [ ] Audit-log and auth-only ACs are `[API]`-only — no e2e case required

### `test_cases.md` — Structure
- [ ] Every TC-NN has all six fields: **US, Given, When, Then, AC reference, Type**
- [ ] TC numbers are sequential with **no gaps**, continuing from the last TC-NN in the file
- [ ] New TCs are appended — existing TCs from prior USs are not modified or removed
- [ ] AC-IDs in the Coverage Matrix restart at `AC-01` per User Story — only unique within that US's own table, not globally
- [ ] US heading carries the `(ACTOR)` suffix matching SRS §7 verbatim — this is the single most frequently missed rule in this repo's own history (29 headings across 6 features were found missing it in one pass; see [Experience Sharing → Quality Step](#quality-step-qc))
- [ ] `**AC:**` cites only `AC-NN`/`EC-NN` — if the linked `spec.md` still uses `FR-NNN`/`AS-N`/`SC-NNN`, that's a `spec.md` defect to flag upstream, not something to silently paper over in `test_cases.md`

### Playwright Code — Integration Tests
- [ ] Entity ID extracted from **POST response directly** (`const { id } = await res.json()`) — never from a GET list
- [ ] Validation error assertions use `expect([400, 422]).toContain(res.status)`
- [ ] Each test creates all required data **fresh inside the test** — missing reference data is seeded via a helper at test start, never skipped
- [ ] One `test.step()` per API call in the TC's flow (not just the final GET) — no bare `if (...) return` guard; use `test.skip(cond, reason)` inside the step instead

### Playwright Code — E2E Tests
- [ ] Selectors use **ID first** (`#id`), then text, then role
- [ ] Custom dropdowns handled as: click trigger → `[role="option"]:has-text("Label")`
- [ ] Filter panel not toggled manually — `#search-*` / `#btn-search` selectors used directly
- [ ] After API-creating an item: filter by name **before** clicking row action buttons (pagination)
- [ ] Text locators scoped to the table container (`#table-x`) to avoid matching hidden/mobile duplicates
- [ ] All required fields are filled before testing an invalid field (client-side validation runs first and would otherwise mask the case under test)
- [ ] Error assertions check **content** (`toContainText("exact text")`), not just visibility
- [ ] Access-denied messages use `waitFor({ state: 'visible' })` (RoleGuard shows inline, no redirect)
- [ ] Steps/screenshots present for `speckit-test-report`: one `test.step('<action> — Expected: <result>', ...)` per action, one screenshot via `testInfo.attach()`, asserted field scrolled into view first

### Playwright Code — General
- [ ] All test-created records are prefixed: `TestQC-[entity]-${Date.now()}`
- [ ] Existing helpers are **reused**, not duplicated
- [ ] New Playwright tests are **appended** to the existing `.spec.ts` under `testing/[feature-id]-[slug]/` — existing tests are untouched, and no stray copy exists under `specs/` (planning artifacts only)

---

## Step 4 — Implementation Step · SE Reviews

**Artifacts:** `tasks.md`, code diff, pre- and post-`/speckit.analyze` reports

### Git
- [ ] Branch is checked out: `feature/NNN-xx-us-NN-implementation-step` (ex: `feature/237-pp-us-01-implementation-step`)

### Pre-implementation (`/speckit.analyze` report)
- [ ] **All Critical and High findings resolved** before `/speckit.implement` was run
- [ ] `tasks.md` covers every AC in `spec.md` and every component in `plan.md`

### Code Diff — Layering & Boundaries
- [ ] Business logic lives in `backend/app/services/` only — Routes (`backend/app/api/`) contain only HTTP binding, validation delegation, service call, response formatting ([constitution.md § Layer Architecture](constitution.md#layer-architecture))
- [ ] Repositories (`backend/app/repositories/`) contain pure SQL via `AsyncSession`, one per owned table, no business logic
- [ ] Services never accept/return DTOs — only domain value objects (`CreateX`/`UpdateX`) and read models
- [ ] New wiring goes through `backend/app/dependencies.py` (`get_*_repo`, `get_*_service`) — Routes import services only, never repos directly
- [ ] No Salesforce-specific logic or credentials in OBMS core code — all such access goes through DPS/MCP tool calls in `tools.py`
- [ ] New API endpoints have a route in `api/routes.py`/`api/admin_routes.py`, Pydantic request/response models, and at least one integration test ([constitution.md § AI-First SDLC Workflow](constitution.md#aif-sdlc-workflow))
- [ ] Any `observe.py` guardrail change is accompanied by a SRS §6.4 update **before** merge ([constitution.md § AI-First SDLC Workflow](constitution.md#aif-sdlc-workflow))
- [ ] `plan_store`-style raw-psycopg2 access is not replicated for new tables — new tables use the standard Repository/`AsyncSession` pattern

### Code Diff — Agentic Pipeline (if touched)
- [ ] No ad-hoc async chain added outside LangGraph nodes ([constitution.md § Agentic Pipeline Integrity](constitution.md#agentic-pipeline-integrity))
- [ ] HUMAN-actor steps are intercepted via `interrupt()` before the executor — the executor is never called directly for a HUMAN step
- [ ] PEV/guardrail re-validation exists at **both** plan-evaluation and step-execution time — removing either is treated as a breaking change requiring a SRS §6.4 amendment
- [ ] Business-rule values (discount caps, frequency caps, scarcity thresholds, min score) are fetched from Brand Config, not hardcoded

### Test Coverage
- [ ] At least one integration test covers the happy path for every new endpoint
- [ ] Integration tests exist for key error cases: invalid input, wrong role/actor, conflict, not found
- [ ] `backend/tests/test_*.py` added/updated for new service or repository logic, following existing test file naming (`test_[feature].py`)

### Post-implementation (`/speckit.analyze` report)
- [ ] No new Critical or High findings introduced by the implementation

### Document Sync (Definition of Done)
- [ ] SRS §7 ACs refined if the implementation revealed edge cases ([constitution.md § AI-First SDLC Workflow](constitution.md#aif-sdlc-workflow))
- [ ] SDS §5 design notes finalized — no "TBD"/"to be added" placeholders remaining
- [ ] SDS §2.1 traceability table updated with actual class/table names
- [ ] SDS §4.3.3 DB schema updated with final column definitions
- [ ] SRS §2 / SDS §2 sync dates updated if any domain entity changed

---

## Step 5 — Deployment Step · SE Reviews

**Artifact:** Deployed Test Environment — **Classic** (`develop`, port `8091`, no LLM/agent pipeline) or **Agentic** (`agentic-ai`, port `8081`, full stack) depending on which track the US belongs to

### Pre-deployment
- [ ] Correct track chosen: admin/brand/site/signal-config CRUD-only work targets **Classic**; anything touching the LangGraph/agent pipeline targets **Agentic**
- [ ] Backend tests pass with **zero failures** before any deployment step
- [ ] No existing Flyway/Alembic-equivalent migration file was edited — schema changes go in a new migration
- [ ] Implementation Step PR is confirmed merged into the correct deploy target branch (`develop` for Classic) before deploying — not just into a feature branch

### Deployment Health
- [ ] Backend health endpoint returns 200 on the target environment's port (`8091` Classic / `8081` Agentic)
- [ ] Frontend/SPA is reachable on the target environment
- [ ] SDK hosting (`sdk/javascript/`) and Ecom Test Site containers are only checked/redeployed if those folders actually changed since the last deploy — they don't gate the main deploy otherwise

### Handoff
- [ ] Deployment Step task ticket is transitioned to **Done** in Jira
- [ ] Test Env URL is confirmed and communicated to QC so they can begin Step 6

---

## Step 6 — Verification Step · QC Reviews

**Artifact:** `test_report.md` + Playwright HTML report (via the `speckit-test-report` skill, not Playwright's built-in `--reporter=html`)

### Pre-flight
- [ ] Deployment Step ticket is **Done** in Jira before starting
- [ ] Jira Story transitioned to **In Review** — no separate verification ticket is created
- [ ] Branch is checked out: `feature/obms-NNN-xx-us-NN-verification-step` (ex: `feature/obms-236-pp-us-01-verification-step`)

### Playwright Run
- [ ] Test run targets the correct spec file (`testing/[feature-id]-[slug]/test_[feature-id]-[slug].spec.ts`) and filters to the correct US tag
- [ ] Every **e2e test case** in `test_cases.md` for this US has a recorded result (PASS / FAIL / BLOCKED)
- [ ] Every **integration test case** not covered by Playwright is manually verified and documented

### Verification Report
- [ ] Report table includes every TC-NN with: Test Name, AC reference, Type, Result, Notes
- [ ] HTML report is generated via the `speckit-test-report` skill and saved to `testing/[feature-id]-[slug]/[xx-us-nn-keyword]/index.html`

### On Failure
- [ ] A Bug ticket is raised with: summary `[BUG-DEV][US]: ...`, type=Bug, parent=Jira Epic, added to the active sprint
- [ ] Bug ticket linked to the Jira Story so the Story shows "has bug(s)" (`inwardIssue: BUG_ID, outwardIssue: [Jira Story], linkType: "Bug"`)
- [ ] A comment linking to the Bug ticket is added to the Jira Story
- [ ] Jira Story remains **In Review** until the bug is fixed and re-verified

### On Full Pass
- [ ] All automated and manual checks are PASS
- [ ] Jira Story stays **In Review** until every US in the Feature is verified — QC transitions to **Done** only then, not per-US

---

## Presentation to PO

- [ ] Recap the business flow from SRS before diving into details
- [ ] State clearly what has been completed and where the project currently stands
- [ ] Call out any open issues, risks, or blockers
- [ ] Structure the presentation with 5W1H — What it is, why it was done, who the audience is, when it's used, where it's used, how it was implemented

---

## Experience Sharing

### Spec Step (BA)

1. **Two incompatible `spec.md` structural conventions coexist.**
   - "Flat template" (shared `## User Scenarios & Testing` / `## Requirements` / `## Success Criteria` headers reused per story block, stories nested as `### User Story N`) and "per-story H2 block" (`## {ID}: Title` own H2 per story) are both in use across features, and some files (e.g. a trigger-point feature) mix both inside the same document via a stray mid-document H1.
   - Check which convention the rest of the feature folder already uses before adding a new story block, and don't introduce a third shape.

2. **AC/EC-only citation is blocked by upstream `spec.md` drift.**
   - `.specify/templates/testcase-template.md` requires `**AC:**` to cite only `AC-NN`/`EC-NN`, but `spec.md` files may still use `FR-NNN`/`AS-N`/`SC-NNN`. If so, the root fix is migrating `spec.md` to the `AC-NN`/`EC-NN` shape first — don't ask QC to invent a citation format that doesn't exist yet in the spec.

3. **Actor tag drift between SRS and spec/plan.**
   - A story's actor list can drift out of sync between SRS §7 and its `spec.md`/`plan.md`/`test_cases.md` headings over time (e.g. a role rename applied in one document but not propagated). Verify the `(ACTOR)` suffix against [SRS §1.5 Roles and Actors](SRS.md#15-roles-and-actors) every time, not just on first authoring.

### Quality Step (QC)

1. **`(ACTOR)` heading suffix is the single most frequently missed rule.**
   - A repo-wide audit found 29 US headings across 6 feature folders missing their SRS actor tag entirely. Check every `## [PREFIX]-US-NN: [Title] ([ACTOR])` heading against SRS §7 — don't assume it was carried over correctly from `spec.md`.

2. **`test_cases.md`/`test_report.md` can go stale relative to a shipped code change.**
   - Recurring pattern: a TC or its automation still asserts a behaviour, endpoint, or discount mechanism that was since renamed/retired by a same-week code change (e.g. a renamed intent-threshold endpoint, a retired discount mechanism, a superseded pixel threshold). When reviewing a Coverage Matrix, check the TC's assertion against the **current** implementation, not just against `spec.md`'s wording — `spec.md` can itself be stale.

3. **A US ID can silently collide across features when SRS is restructured.**
   - One feature's `test_cases.md` cited a US ID that SRS's own later restructure reassigned to a *different* story — the test artifacts were right and SRS was the stale side, but this is only caught by cross-checking the ID against the current SRS ToC, not by reading `test_cases.md` in isolation.

4. **Coverage Matrix label errors and missing "e2e N/A" notes are easy to miss on a quick pass.**
   - Confirm every `[BOTH]`/`[UI]` row actually has a non-empty, facet-matching E2E column — an invalid label or a silently-blank E2E cell has shipped before without being caught until a dedicated audit.

5. **Review AI-generated test cases against `spec.md`, not from memory.**
   - Compare every generated test case against `spec.md` directly; if a scenario is unclear, ask the AI to explain its interpretation before approving, and instruct it to remove both the test case and its automation code together when a case turns out redundant or out of scope.

*Reference: [aif-sdlc.md](aif-sdlc.md) · [constitution.md](constitution.md) · [inconsistent-test-case-synthesis.md](inconsistent-test-case-synthesis.md)*
