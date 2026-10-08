# AIF-SDLC Review Checklist

> Use this after Claude produces an artifact at each step.
> Your job is to catch what Claude gets wrong (not follow `constitution.md`) — **not to redo the work**.
>
> PFM is a solo/personal project: one person plays BA, SE and QC, there is no ticket tracker, and the only deployment target is the home-LAN host ([RUNBOOK.md](RUNBOOK.md)). The step definitions live in [aif-sdlc.md](aif-sdlc.md); this checklist reviews their output.

- [Process Notes](#process-notes)
- [Step 1 — Spec Step · BA Reviews](#step-1--spec-step--ba-reviews)
- [Step 2 — Design Step · SE Reviews](#step-2--design-step--se-reviews)
- [Step 3 — Quality Step · QC Reviews](#step-3--quality-step--qc-reviews)
- [Step 4 — Implementation Step · SE Reviews](#step-4--implementation-step--se-reviews)
- [Step 5 — Deployment Step · SE Reviews](#step-5--deployment-step--se-reviews)
- [Step 6 — Verification Step · QC Reviews](#step-6--verification-step--qc-reviews)
- [Experience Sharing](#experience-sharing)
  - [Spec Step (BA)](#spec-step-ba)
  - [Quality Step (QC)](#quality-step-qc)

---

## Process Notes

- [ ] SDLC flow is followed in strict order: **Spec → Design → Quality → Implement → Deploy → Verification** — no step skipped or reordered (Quality may run in parallel with Implementation, per [aif-sdlc.md](aif-sdlc.md))
- [ ] If implementation diverges from `plan.md`, the plan is redefined first — never deviate silently and patch the plan afterward
- [ ] `spec.md` / `plan.md` are the artifacts under review here and do **not** need to match `SDS.md` / `SRS.md` verbatim — if `SDS.md` / `SRS.md` violate a constitution principle, that violation is not propagated into `spec.md` / `plan.md`
- [ ] Step 6 closes the User Story directly — no separate verification ticket, because no tracker is used; a US is Done when it meets the [Definition of Done](constitution.md#definition-of-done) (DOD-01..05)
- [ ] Cross-document inconsistency (SRS ↔ SDS ↔ code) is treated as a **defect, not a backlog item** ([constitution.md § Cross-Document Consistency](constitution.md#cross-document-consistency))
- [ ] Every step branch is created from an up-to-date `develop` (never from another step's branch) and merged back into `develop` before the next step's branch is created

---

## Step 1 — Spec Step · BA Reviews

**Artifacts:** `spec.md` in `specs/[feature-id]-[slug]/` (ex: `specs/002-wallet-management/`) + SRS §7 update

### Git
- [ ] Branch is checked out: `feature/[us-id-lowercase]-spec-step` (ex: `feature/wm-us-01-spec-step`)

### SRS §7 Entry
- [ ] Story statement is under the correct Feature section (`§7.x`)
- [ ] Story heading is `#### [§7.x.N] [XX-US-NN]: [Title] ([ACTOR])`
- [ ] Story format is correct: **As a/an** [actor], **I want to** [goal] **so that** [reason]
- [ ] Actor is one of the roles defined in [SRS §1.5 Roles and Actors](SRS.md#15-roles-and-actors): `ADMIN | USER` (a User may hold both)
- [ ] **No ACs in SRS** — only the story statement; the AC block lives in `spec.md`
- [ ] Spec link (`> Spec: [...]`) appears **once** on the Feature header (`§7.x`), not under the US entry
- [ ] SRS Table of Contents is updated to include the new US entry

### `spec.md` Content
- [ ] All acceptance criteria provided in the prompt are present in `spec.md`, cited as `AC-NN` / `EC-NN` (per `.specify/templates/testcase-template.md`) — not `FR-NNN`/`AS-N`/`SC-NNN`, which belong to the FR/Success-Criteria tables, not the AC citation shape
- [ ] Every AC describes a **testable, observable outcome** — not an implementation detail
- [ ] No technology names, endpoint paths, DB field/table names, serializer/model class names, or token formats leaked into ACs (those belong to `plan.md`) — per [constitution.md § Cross-Document Consistency](constitution.md#cross-document-consistency)
- [ ] No banned vague words from `spec-template.md` (e.g. "fast", "user-friendly", "appropriate", "seamless")
- [ ] The 7 mandatory Edge Case categories (empty/null, boundary, concurrency, access control, dependency timeout, multi-language/currency, AI error) were each scanned — any omitted category has an inline "N/A" justification
- [ ] No Domain Objects, no ERD, no sequence diagrams, no pre-defined table fields present — `spec.md` stays conceptual; those belong to the Design step
- [ ] Domain entities/terms match [SRS §2 CDM](SRS.md) and the [constitution's Business Terminology](constitution.md#business-terminology) verbatim — no synonyms (e.g. `Wallet`, not "account"; `FinancialGoal`, not "Financial Goal")
- [ ] `spec.md` contains exactly **one US** per block — heading includes the `(ACTOR)` suffix matching SRS §7 verbatim
- [ ] `Status` in the spec header reflects reality (not left at `Draft` once the story ships)

### Traceability
- [ ] This US can be traced to a CDM entity (SRS §2) or a Business Flow step (SRS §6) — per [constitution.md § Feature Derivation Method](constitution.md#feature-derivation-method)
- [ ] If a new Domain Entity is introduced, SRS §2 is updated, SDS §2.1 gets a traceability row in the same PR, and both "Last synced" dates are current
- [ ] Story prefix and numbering follow [constitution.md § User Story Conventions](constitution.md#user-story-conventions) — uppercase initials of the Feature name, sequential with no gaps

---

## Step 2 — Design Step · SE Reviews

**Artifacts:** `plan.md` in `specs/[feature-id]-[slug]/` + SDS §5 update

### Git
- [ ] Branch is checked out: `feature/[us-id-lowercase]-design-step` (ex: `feature/wm-us-01-design-step`)

### Pre-flight Gaps
- [ ] `plan.md` has a `### Pre-flight: Spec Review Findings` section for this US — gaps/ambiguities listed with a resolution, or an explicit "no gaps found" statement (never silently omitted)
- [ ] Claude flagged zero spec gaps — or flagged gaps were resolved before `plan.md` was reviewed
- [ ] If `plan.md` still has significant gaps or ambiguity after review, the work goes back to the Spec step rather than being patched forward
- [ ] Design scope matches the US being designed — no scope creep into unrelated stories

### SDS §5 Entry
- [ ] Plan link (`> Plan: [...]`) appears **once** on the Feature header (`§5.x`), not under a US sub-section
- [ ] The SDS US sub-section (`§5.x.N`) contains **only** the Purpose field — ACs live in `spec.md`, flows/diagrams in `plan.md`
- [ ] SDS Table of Contents is updated to include the new US sub-section, and stays 1:1 with the SRS §7 ToC (names and IDs identical, including any suffix such as `[MVP]`) per [constitution.md § User Story Conventions](constitution.md#user-story-conventions)

### `plan.md` — Layered Architecture ([constitution.md § Layered Architecture](constitution.md#layered-architecture))
- [ ] **AR-01** — Logic that spans more than one model, has a business rule beyond field validation, or has side effects is designed into a module-level service function (e.g. `transactions/services.py`); plain ownership-scoped CRUD stays in the View + Serializer
- [ ] **AR-02** — Views only do HTTP binding, permission checks, ownership-scoped `get_queryset()` and delegation — no business logic
- [ ] **AR-03** — No hand-written Repository class wrapping the Django ORM
- [ ] **AR-04** — Serializers are the DTOs; `fields`/`read_only_fields` are explicit and aligned with the SDS §6.2 DTO Registry (never `'__all__'`, never `password` or other internal-only fields)
- [ ] **AR-05** — Multi-model writes are wrapped in `transaction.atomic()` in the design
- [ ] New entity → new Django app (one app per entity, SDS §2.1), with `models.py` / `serializers.py` / `views.py` / `urls.py` / `tests.py`

### `plan.md` — API, Security & Observability
- [ ] Endpoints are versioned under `/api/v1/`, use plural lowercase (kebab-case for multi-word) resource names, and follow the API-02 DRF-native response shape (no custom envelope) and API-04 status mapping
- [ ] State transitions use explicit action endpoints (`POST …/{id}/close/`), never a generic `PATCH` (API-05)
- [ ] Every protected endpoint states its authentication (JWT, API-07), role check (ADMIN / USER / both) and ownership scoping (AC-02/AC-03); anything public is on the documented public list or has a documented reason
- [ ] Business-rule errors use SDS §6.6 catalogued codes (API-03); any new code is added to SDS §6.6 in the same change
- [ ] List endpoints are paginated (API-06)
- [ ] The Constitution Check table covers **Logging & Audit** (auth events and state-changing operations at `INFO`/`WARN`, no passwords/JWTs/financial data in logs) and Security Requirements (no secrets in source), not only the layering principles
- [ ] Decisions with security impact (e.g. where tokens are stored on the client) are recorded with a rationale in Decisions & Rationale — not deferred to implementation

### `plan.md` — Technology & Complexity
- [ ] No stack substitution outside [constitution.md § Technology Stack](constitution.md#technology-stack) (Django 6 / DRF / SimpleJWT / SQLite; Next.js 16 / React 19 / TypeScript / Tailwind v4) and no new core dependency without approval; no form/state/HTTP/icon/UI library added speculatively (FE-02, FE-04, FE-05)
- [ ] Any complexity beyond the current validated requirement (new abstraction, new dependency, speculative generality) is logged in the plan's Complexity Tracking table with rationale ([constitution.md § Simplicity Over Premature Scale](constitution.md#simplicity-over-premature-scale))
- [ ] Schema changes go through new Django migrations; no edit of a merged migration; additive changes preferred for SQLite (Technical Principle III)
- [ ] Sequence diagrams follow the conventions in [aif-sdlc.md § Sequence Diagram Conventions](aif-sdlc.md#sequence-diagram-conventions): Happy → Alternative → Negative order, no DB queries, status codes only (no bodies or UI copy)
- [ ] Technical Context and Project Structure describe the **current** repo (e.g. test tooling that already exists, files that already exist) — no stale "not yet created" notes

### Cross-Document Sync
- [ ] If a new Domain Entity is introduced: SDS §2.1 traceability table is updated in the same edit
- [ ] SRS §2 ↔ SDS §2.1 "Last synced" dates are current
- [ ] Every entity name in `plan.md` matches the SRS §2 domain language exactly — no synonyms

---

## Step 3 — Quality Step · QC Reviews

**Artifacts:** `test_cases.md` in `specs/[feature-id]-[slug]/` (next to `spec.md`/`plan.md`, ex: `specs/002-wallet-management/`) + `test_[abbr].spec.ts` in `e2e/[feature-id]-[slug]/`

### Git
- [ ] Branch is checked out: `feature/[us-id-lowercase]-quality-step` (ex: `feature/wm-us-01-quality-step`)

### `test_cases.md` — Coverage
- [ ] At least **one test case per acceptance criterion** in `spec.md`
- [ ] Unhappy paths covered: validation errors, rejected states, wrong role / not-owner (`403`/`404` per AC-03), unauthenticated (`401`)
- [ ] Edge cases covered: boundary values, empty/null inputs, concurrent or duplicate actions
- [ ] Business Rules (SRS §2.4 BR-xx) the US touches each have a test case
- [ ] `[BOTH]` ACs have **both** an integration TC (API error code) and an e2e TC (inline error message) — a `[BOTH]`/`[UI]` AC with an empty E2E column, or one whose e2e doesn't demonstrate every facet its integration TC(s) cover, is a defect (note as "e2e N/A: [reason]" if genuinely not applicable)
- [ ] Audit-log and auth-only ACs are `[API]`-only — no e2e case required
- [ ] A test case's **Given** describes a state the system can actually be put in today; where a proxy is used (e.g. a missing `Role` entity), the TC says so and the Coverage Matrix does not present the AC as fully covered

### `test_cases.md` — Structure
- [ ] Per-story heading `## [PREFIX]-US-NN: [Title] ([ACTOR])` is present and matches SRS §7 verbatim
- [ ] Every TC-NN has all six fields: **US, Given, When, Then, AC reference, Type**
- [ ] TC numbers are sequential with **no gaps**, continuing from the last TC-NN in the file
- [ ] New TCs are appended — existing TCs from prior USs are not modified or removed
- [ ] AC-IDs in the Coverage Matrix restart at `AC-01` per User Story — only unique within that US's own table, not globally
- [ ] `**AC:**` cites only `AC-NN`/`EC-NN` — if the linked `spec.md` still uses `FR-NNN`/`AS-N`/`SC-NNN`, that's a `spec.md` defect to flag upstream, not something to silently paper over in `test_cases.md`
- [ ] Links to `spec.md` and `plan.md` are relative, same-folder links

### Playwright Code — Integration Tests
- [ ] Entity ID extracted from **POST response directly** (`const { id } = await res.json()`) — never from a GET list
- [ ] Validation error assertions are exact enough to prove the right failure (field-level key for `400`, generic body for `401`) — and use `[400, 422]` only where the endpoint can legitimately return either
- [ ] Each test creates all required data **fresh inside the test** — missing reference data is seeded via a helper at test start, never skipped
- [ ] No bare `if (...) { assertion }` guard that lets a test pass without asserting — use `test.skip(cond, reason)` instead
- [ ] Seed data is created through endpoints/paths the SRS actually allows (see SRS §7.2: User accounts are created by an ADMIN, no self-service registration)

### Playwright Code — E2E Tests
- [ ] Selectors use **ID first** (`#id`), then text, then role; IDs follow NC-04 ([aif-sdlc.md § UI Element ID Contract](aif-sdlc.md#step-4--implementation-step))
- [ ] Custom dropdowns (once they exist) handled as: click trigger → `[role="option"]:has-text("Label")`
- [ ] Filter panels (once they exist) are not toggled manually — `#search-*` / `#btn-search` selectors used directly
- [ ] After API-creating an item: filter by name **before** clicking row action buttons (pagination)
- [ ] Text locators scoped to the table container (`#table-x`) to avoid matching hidden/mobile duplicates
- [ ] All required fields are filled before testing an invalid field (client-side validation runs first and would otherwise mask the case under test)
- [ ] Error assertions check **content** (`toContainText("exact text")`), not just visibility
- [ ] Access-denied messages (inline, no redirect) use `waitFor({ state: 'visible' })`
- [ ] Each test's assertions match its TC's **Then** — e.g. "lands on the Dashboard" and "token is stored" are asserted if the TC says so, not just "URL changed"
- [ ] Screenshots via `testInfo.attach()`, labelled `TC-XX [before/after/step N] — description`; none for integration TCs

### Playwright Code — General
- [ ] All test-created records are prefixed: `TestQC-[entity]-${Date.now()}`, and created in a way that can be cleaned up (or the leftover data is acknowledged in the report)
- [ ] Existing helpers are **reused**, not duplicated; unused parameters/return values are not left behind
- [ ] New Playwright tests are **appended** to the existing `.spec.ts` under `e2e/[feature-id]-[slug]/` — existing tests are untouched, and no `.spec.ts` copy exists under `specs/`
- [ ] Spec file name follows the convention in [aif-sdlc.md](aif-sdlc.md) (`test_[abbr].spec.ts`) and comments in the file/config describe where it actually lives

---

## Step 4 — Implementation Step · SE Reviews

**Artifacts:** `tasks.md`, code diff, pre- and post-`/speckit-analyze` reports

### Git
- [ ] Branch is checked out: `feature/[us-id-lowercase]-implementation-step` (ex: `feature/wm-us-01-implementation-step`)

### Pre-implementation (`/speckit-analyze` report)
- [ ] **All Critical and High findings resolved** before `/speckit-implement` was run
- [ ] `tasks.md` covers every AC in `spec.md` and every component in `plan.md`
- [ ] `tasks.md` phase order reflects real dependencies (e.g. test tooling needed to verify a checkpoint is set up before the checkpoint, not appended after)

### Code Diff — Backend (Django / DRF)
- [ ] Views are thin (AR-02); non-trivial logic lives in a service function (AR-01) wrapped in `transaction.atomic()` where it writes more than one model (AR-05); no hand-rolled Repository (AR-03)
- [ ] Every View's `get_queryset()` filters by the authenticated User, and role-restricted endpoints use a DRF permission class — `401` unauthenticated, `403` wrong role, `404` not-owned (AC-02/AC-03)
- [ ] Serializers list explicit `fields` / `read_only_fields`, validate required fields, uniqueness, referential ownership (VL-03), date ranges (VL-04) and positive amounts (VL-05)
- [ ] State transitions are explicit action endpoints, not generic `PATCH` (API-05); list endpoints paginate (API-06, `page_size` capped if exposed)
- [ ] Semantic business errors use catalogued SDS §6.6 codes (API-03)
- [ ] Models/tables follow NC-01/NC-03 (`db_table` set, snake_case, PascalCase singular model name); migrations are new files — no edit of a merged migration; no hand-edited `db.sqlite3`
- [ ] Log statements follow Logging & Audit: auth events and state-changing operations at `INFO`/`WARN`, `401`/`403` at `WARN` with User ID; **no** passwords, JWTs or raw financial data logged
- [ ] No secrets hard-coded; no new route added to the public set without a documented reason (Technical Principle V)

### Code Diff — Frontend (Next.js / React / TypeScript)
- [ ] TypeScript only, no `any` without a justifying comment, all props/state/API shapes typed (Technical Principle IV); API field names mirror DRF `snake_case`
- [ ] Interactive elements carry the `id`s listed in `plan.md`'s Element IDs table (NC-04 / FE-01); role-gated elements keep their IDs
- [ ] Forms use native HTML5 + React state (FE-02) and give inline validation feedback, a loading/disabled state while submitting, and a success/error confirmation (FE-06)
- [ ] Navigation/actions reflect the User's role(s) (FE-03) — and the backend still enforces the restriction independently
- [ ] Calls go directly to `NEXT_PUBLIC_API_URL` with the Bearer token (FE-08); unexpected failures (network, `5xx`) are not reported as a business error such as "Invalid credentials"
- [ ] No new dependency (state, form, HTTP, icon, UI library) was added without justification

### Test Coverage
- [ ] At least one `APITestCase` covers the happy path for every new endpoint (DOD-05), run against Django's real throwaway test database — no mocked models/querysets ([Integration Testing Over Mocking](constitution.md#integration-testing-over-mocking))
- [ ] Tests exist for key error cases: invalid input, unauthenticated (`401`), wrong role / not-owner (`403`/`404`), conflict, not found — and for state transitions where applicable
- [ ] Tests live in the app's own `tests.py` and name the TC they implement (e.g. `test_tc05_…`)
- [ ] `python manage.py test`, `npm run lint` and `npm run build` pass

### Post-implementation (`/speckit-analyze` report)
- [ ] No new Critical or High findings introduced by the implementation

### Document Sync (Definition of Done)
- [ ] SRS §7 ACs refined if the implementation revealed edge cases ([constitution.md § AIF-SDLC Workflow](constitution.md#aif-sdlc-workflow))
- [ ] SDS §5 design notes finalized — no "TBD"/"to be added" placeholders remaining; decisions made during implementation are written back into `plan.md`
- [ ] SDS §2.1 traceability table updated with actual class/table names
- [ ] SDS §4.3.3 DB schema updated with final column definitions
- [ ] SDS §6.2 DTO Registry, §6.3 API Index and §6.4 API Specification updated for every new/changed endpoint (DOD-02)
- [ ] SRS §2 / SDS §2 sync dates updated if any domain entity changed
- [ ] RUNBOOK.md updated if ports, env vars or setup steps changed

---

## Step 5 — Deployment Step · SE Reviews

**Artifact:** The app running on the home-LAN host ([RUNBOOK.md](RUNBOOK.md)) — backend `:8000`, frontend `:3000`, no Docker, no remote Test Environment

### Pre-deployment
- [ ] Implementation Step branch is confirmed merged into `develop` — not just into a feature branch
- [ ] `cd backend && python manage.py test` passes with **zero failures**
- [ ] `cd frontend && npm run lint && npm run build` pass
- [ ] No migration file already merged was edited — schema changes are in a new migration, and `python manage.py migrate` has been run on the host

### Deployment Health
- [ ] Both servers are (re)started bound to the LAN per RUNBOOK §6 (`runserver 0.0.0.0:8000`, `npm run dev -- -H 0.0.0.0`)
- [ ] `GET http://<HOST_IP>:8000/health/` returns `200`
- [ ] Frontend is reachable at `http://<HOST_IP>:3000` and backend at `http://<HOST_IP>:8000/api/v1/`
- [ ] `ALLOWED_HOSTS` / `CORS_ALLOWED_ORIGINS` / `NEXT_PUBLIC_API_URL` cover the host's LAN IP (RUNBOOK §4–5)

### Handoff
- [ ] SE's report states deployment status, any failed tests, and the confirmed App URL so QC can begin Step 6 (a verification run against `localhost` instead of the LAN host is noted as a deviation, not silently accepted)

---

## Step 6 — Verification Step · QC Reviews

**Artifact:** Verification report (e.g. `verification-report.md`) + Playwright HTML report, in `e2e/[feature-id]-[slug]/[xx-us-nn-keyword]/` (ex: `e2e/001-system-security/ss-us-01-login/`)

### Pre-flight
- [ ] SE's Step 5 report shows deployment succeeded with no failing tests
- [ ] Branch is checked out: `feature/[us-id-lowercase]-verification-step`

### Playwright Run
- [ ] Test run targets the correct spec file (`e2e/[feature-id]-[slug]/test_[abbr].spec.ts`) against the confirmed App URL (`BASE_URL`) and covers the correct US
- [ ] Every **e2e test case** in `test_cases.md` for this US has a recorded result (PASS / FAIL / BLOCKED)
- [ ] Every **integration test case** not covered by Playwright is covered by an `APITestCase` run fresh, or manually verified and documented
- [ ] Disposable `test-results/` output is removed after the run (it is git-ignored and regenerated each run)

### Verification Report
- [ ] Report table includes every TC-NN with: Test Name, AC reference, Type, Result, Notes
- [ ] A PASS is only recorded for what the test actually proves — proxy-based or partially-asserted cases are noted in the Notes column, not reported as full coverage
- [ ] The Playwright HTML report (with `testInfo.attach()` screenshots) is saved in the story's own `[xx-us-nn-keyword]/` folder — no intermediate `reports/` wrapper

### On Failure
- [ ] Each failure is listed with test case ID, AC reference, and observed vs expected behaviour
- [ ] The US is **not** marked Done — it goes back to the Implementation Step, then Verification is re-run

### On Full Pass
- [ ] All automated and manual checks are PASS
- [ ] The US meets the Definition of Done (DOD-01..05): SRS/SDS traceability, API contract documented, authorization verified, validation implemented, tests present
- [ ] Spec `Status` and `plan.md`'s story status table are updated to reflect Done

---

## Experience Sharing

### Spec Step (BA)

1. **`spec.md` can drift from the template while still looking complete.**
   - Typical misses: banned vague words (e.g. "appropriate" slipped into an Independent Test), a `Status: Draft` left on a shipped story, and Edge Case categories dropped without an "N/A" note. Check these against `spec-template.md` rather than judging by eye.

2. **AC/EC-only citation is blocked by upstream `spec.md` drift.**
   - `.specify/templates/testcase-template.md` requires `**AC:**` to cite only `AC-NN`/`EC-NN`, but a `spec.md` may still use `FR-NNN`/`AS-N`/`SC-NNN`. If so, the root fix is migrating `spec.md` to the `AC-NN`/`EC-NN` shape first — don't ask QC to invent a citation format that doesn't exist yet in the spec.

3. **Actor tag and ToC drift between SRS and SDS/spec/plan.**
   - A story's name or actor can drift out of sync between SRS §7, the SDS §5 ToC, and `spec.md`/`plan.md`/`test_cases.md` headings (e.g. a `[MVP]` suffix present in one ToC only). Verify the `(ACTOR)` suffix against [SRS §1.5](SRS.md#15-roles-and-actors) and both ToCs every time, not just on first authoring.

### Design Step (SE)

1. **Constitution Check tables list the principles that pass, not the ones that don't.**
   - A plan can mark every row PASS while a constitution rule that the design never touched (e.g. Logging & Audit for the stock login view) is simply missing from the table. Scan the constitution's section list against the table instead of trusting the rows present.

2. **Deferred decisions never get written back.**
   - "An implementation-time detail" in `plan.md` (e.g. client-side token storage) is only safe if the implementation step records the outcome in the plan afterwards. Otherwise the shipped decision exists only in code.

### Quality Step (QC)

1. **`test_cases.md` and the automation can go stale relative to a shipped code change.**
   - Recurring pattern: a TC or its automation still asserts behaviour that was since changed. When reviewing a Coverage Matrix, check the TC's assertion against the **current** implementation, not just against `spec.md`'s wording — `spec.md` can itself be stale.

2. **A proxy test can look like coverage.**
   - If a precondition cannot yet be represented (e.g. holding both ADMIN and USER roles before a `Role` entity exists), a test seeded with a stand-in may pass for every account. Require the TC and the Coverage Matrix to say so, and re-test properly once the entity exists.

3. **Coverage Matrix label errors and missing "e2e N/A" notes are easy to miss on a quick pass.**
   - Confirm every `[BOTH]`/`[UI]` row actually has a non-empty, facet-matching E2E column.

4. **Automation can assert less than its TC promises.**
   - Compare each test's assertions line by line with the TC's **Then** (landing page, stored token, "no round trip") — a URL-changed check is not the same as "reaches the Dashboard".

5. **Review AI-generated test cases against `spec.md`, not from memory.**
   - Compare every generated test case against `spec.md` directly; if a scenario is unclear, ask the AI to explain its interpretation before approving, and instruct it to remove both the test case and its automation code together when a case turns out redundant or out of scope.

*Reference: [aif-sdlc.md](aif-sdlc.md) · [constitution.md](constitution.md) · [RUNBOOK.md](RUNBOOK.md) · [aif-artifact-audit.md](aif-artifact-audit.md)*
