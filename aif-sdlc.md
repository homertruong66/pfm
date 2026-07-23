# AI-First Software Development Life Cycle (AIF-SDLC)

> Structured prompts for each role at each stage of the development cycle.
> Claude performs the task automatically — **you only review the artifact produced.**
> This is a solo/personal project — one person plays BA, SE, and QC. No ticket
> tracker (Jira or otherwise) is used; git branches and the SRS/SDS documents
> are the only source of truth for what's in progress.
>
> Role colours:
> <span style="color:#3b82f6;font-weight:700">■ BA</span> &nbsp;
> <span style="color:#0d9488;font-weight:700">■ SE</span> &nbsp;
> <span style="color:#d97706;font-weight:700">■ QC</span>

---

## Table of Contents

- [Quick Reference — Cheat Sheet](#quick-reference--cheat-sheet)
- [Step 1 — Spec Step](#step-1--spec-step)
  - [BA Spec Prompt](#ba-spec-prompt)
- [Step 2 — Design Step](#step-2--design-step)
  - [SE Design Prompt](#se-design-prompt)
- [Step 3 — Quality Step](#step-3--quality-step)
  - [QC Quality Prompt](#qc-quality-prompt)
- [Step 4 — Implementation Step](#step-4--implementation-step)
  - [SE Implementation Prompt](#se-implementation-prompt)
- [Step 5 — Deployment Step](#step-5--deployment-step)
  - [SE Deployment Prompt](#se-deployment-prompt)
- [Step 6 — Verification Step](#step-6--verification-step)
  - [QC Verification Prompt](#qc-verification-prompt)

---

## Quick Reference — Cheat Sheet

| Step | Role | Prompt | Artifact Produced |
|------|------|--------|-------------------|
| **1** | <span style="color:#3b82f6;font-weight:700">BA</span> | Spec Prompt | `spec.md` + SRS feature-header link |
| **2** | <span style="color:#0d9488;font-weight:700">SE</span> | Design Prompt | `plan.md` + SDS feature-header link |
| **3** | <span style="color:#d97706;font-weight:700">QC</span> | Quality Prompt | `test_cases.md` + Playwright automation code |
| **4** | <span style="color:#0d9488;font-weight:700">SE</span> | Implementation Prompt | `tasks.md` + implemented code (analyze → implement → analyze) |
| **5** | <span style="color:#0d9488;font-weight:700">SE</span> | Deployment Prompt | US deployed to the home-LAN host (RUNBOOK.md) |
| **6** | <span style="color:#d97706;font-weight:700">QC</span> | Verification Prompt | Verification report (automated + manual) |

> **Sequence rule:** Each step starts only after the previous artifact is produced and reviewed.
> **Token Saving Tool (ex: rtk):** Do not use such tool for step 4 which can create non-quality code.
> **Branching rule:** `develop` is the parent branch for every step branch below. Each `--- Git ---`
> section checks out `develop` (pulling latest first) before creating its `feature/...` branch —
> never branch off another step's branch (e.g. Design Step must not branch off the Spec Step branch).
> Each step branch is merged back into `develop` before the next step's branch is created.

---

## Step 1 — Spec Step

### <span style="color:#3b82f6">BA</span> Spec Prompt

> **When to use:** You have a new User Story to specify — either the first US for a brand-new Feature, or an additional US for an existing Feature.
> **You provide:** Feature details and story details in the placeholders below.
> **You review:** The `spec.md` in `specs/[feature-id]-[slug]/` and the SRS entry under the feature section.

```
Spec Prompt

Feature group:  [e.g. 7.2 Wallet Management]
Feature code:   [e.g. WM]
Feature folder: [e.g. specs/002-wallet-management — leave blank if new feature, Claude will create it]
Story number:   [e.g. WM-US-01 — leave blank to auto-assign next number from SRS]
Story title:    [e.g. Create a Wallet]
Actor(s):       [ADMIN | USER]
Goal:           [one sentence — what the actor wants to do]
Reason:         [one sentence — business value]
Acceptance criteria (for spec only — NOT written into SRS):
- [AC 1]
- [AC 2]
- [AC 3]

--- Git ---

1. Check out and update the parent branch, then branch from it:
   git checkout develop
   git pull origin develop
   git checkout -b feature/[story-number-lowercase]-spec-step
   (e.g. feature/wm-us-01-spec-step)

--- Spec Step ---

=== IF Feature folder does NOT exist yet (new Feature / first US) ===

2. In SRS.md, add a spec link immediately under the feature section header (§7.x),
   before any US entries. Format:
   > Spec: [[Feature folder]/spec.md]([Feature folder]/spec.md)

   The spec link appears ONCE at the feature (§7.x) level — never under individual US entries.

3. Add the US entry to SRS.md under the feature section. Format:
   #### [§7.x.N] [Story number]: [Story Title] ([ACTOR])
   **As a/an** [actor], **I want to** [goal] **so that** [reason].

4. Run /speckit-specify with the story statement and ACs above.
   This creates [Feature folder] and generates spec.md.

=== IF Feature folder already exists (adding a new US to an existing Feature) ===

2. The spec link already exists on the feature section header — do NOT add it again.

3. Add the new US entry to SRS.md under the existing feature section. Format:
   #### [§7.x.N] [Story number]: [Story Title] ([ACTOR])
   **As a/an** [actor], **I want to** [goal] **so that** [reason].

4. Run /speckit-specify with the story statement and ACs above.
   This appends the new US to the existing spec.md.

=== Always — regardless of which case applies ===

• Remove any existing AC block from the SRS entry for this US. Only the story
  statement belongs in SRS.md. ACs live in spec.md only.
• Never add a spec link under a US entry (§7.x.N level) — the link belongs on
  the feature header (§7.x level) only, added once for the whole Feature.
```

---

## Step 2 — Design Step

### <span style="color:#0d9488">SE</span> Design Prompt

> **When to use:** After Step 1 spec is produced and reviewed.
> **You provide:** The feature folder path and the US ID.
> **You review:** Any spec gaps Claude flags, then `plan.md` — architecture decisions, sequence diagrams, complexity tracking, constitution compliance check.

```
Design Prompt

Feature folder:    specs/[feature-id]-[slug]/
US being designed: [XX-US-NN]
Story title:       [Story title confirmed in Step 1]

--- Pre-flight ---

1. Verify [Feature folder]/spec.md exists and contains [US being designed].
   If not found: STOP — run the Spec Prompt for this US first.

--- Git ---

2. Check out and update the parent branch, then branch from it:
   git checkout develop
   git pull origin develop
   git checkout -b feature/[us-id-lowercase]-design-step
   (e.g. feature/wm-us-01-design-step)

--- Design Step ---

3. Read [Feature folder]/spec.md and flag any ambiguities, missing
   domain objects, or API gaps before proceeding.

=== IF plan.md does NOT exist yet (first US of this Feature) ===

4. Run /speckit-plan for this spec. This creates plan.md.
5. In SDS.md, add a plan link immediately under the feature section header,
   before any sub-section entries. Format:
   > Plan: [[Feature folder]/plan.md]([Feature folder]/plan.md)

   The plan link appears ONCE at the feature (§5.x) level — never under individual
   US sub-sections.

6. In SDS.md, create the US sub-section (§5.x.N) with ONLY the Purpose field.
   Format:
   #### [§5.x.N] [US being designed]: [Story Title]
   **Purpose**
   [one-paragraph summary of what the US delivers and why]

=== IF plan.md already exists (2nd+ US of this Feature) ===

4. Run /speckit-plan for this spec. This updates the existing plan.md to cover
   the new US — existing sections are preserved and extended as needed.
5. The plan link already exists in SDS.md — do NOT add it again.
6. In SDS.md, for the US sub-section (§5.x.N):
   - If §5.x.N does NOT exist yet: create it with ONLY the Purpose field.
   - If §5.x.N already exists with extra content (Scope, Preconditions, Functional Design,
     Main Flow, Alternative/Error Flows): trim it down to ONLY the Purpose field.
   These sections are covered by spec.md (ACs) and plan.md (sequence diagrams, architecture).
```

---

## Step 3 — Quality Step

### <span style="color:#d97706">QC</span> Quality Prompt

> **When to use:** After `plan.md` is produced. Can run in parallel with Step 4.
> **You provide:** The feature folder path and the US ID.
> **You review:** `test_cases.md` for coverage completeness and the generated Playwright automation code.

```
Quality Prompt

Feature folder:  specs/[feature-id]-[slug]/
US being tested: [XX-US-NN]

--- Pre-flight ---

1. Verify both of the following exist:
   - [Feature folder]/spec.md  (contains [US being tested])
   - [Feature folder]/plan.md
   If either is missing: STOP — complete the Spec and Design steps first.

--- Git ---

2. Check out and update the parent branch, then branch from it:
   git checkout develop
   git pull origin develop
   git checkout -b feature/[us-id-lowercase]-quality-step
   (e.g. feature/wm-us-01-quality-step)

--- Quality Step ---

Read:
- [Feature folder]/spec.md
- [Feature folder]/plan.md

Classify each AC before writing:
  [API]  — HTTP only (auth, persistence, status codes, audit logs)
  [UI]   — browser only (reactive state, error text, auto-populate, button state)
  [BOTH] — requires both integration and e2e

Write test cases
   Structure for each test case:

   ### TC-NN: [Test Name]
   - **US:** [US being tested]
   - **Given:** [precondition]
   - **When:** [action]
   - **Then:** [expected result]
   - **AC:** [links to AC in spec.md]
   - **Type:** [unit | integration | e2e]

   Coverage required per US:
   - Happy path: one test per AC
   - Validation [BOTH]: integration (API error code) + e2e (inline error message text)
   - Optional fields: (a) omit → success  (b) provide → verify persisted on GET
   - Audit-log and auth-only ACs: [API] — no e2e needed

   Produce coverage matrix before finalising test_cases.md:
      | AC | Label | Integration TC(s) | E2E TC(s) | [BOTH] or [UI] AC with empty E2E column = defect, resolve before proceeding.

=== IF test_cases.md does NOT exist yet (first US of this Feature) ===

3. Create test_cases.md in [Feature folder] with test cases for [US being tested].
4. Create test_[feature-id].spec.ts with Playwright automation for all e2e test cases. Following Testing-Code-Rule

=== IF test_cases.md already exists (2nd+ US of this Feature) ===

3. Append new test cases for [US being tested] to the existing test_cases.md.
   Number new cases continuing from the last TC-NN in the file.
4. Append new Playwright tests for [US being tested] e2e cases to the existing
   test_[feature-id].spec.ts. Do not modify or remove existing test cases.

=== Always — Testing-Code-Rule ===

Before writing code: read *.spec.ts (reuse helpers); read frontend component (confirm IDs).

Integration:
- ID from POST response directly — never GET list to find ID
- Seed missing reference data via helper at test start — never skip for missing data
- Naming for new data created: TestQC-[entity]-${Date.now()}

E2E:
- Selectors: #id → text → role
- Custom dropdowns: click trigger → `[role="option"]:has-text("Label")`
- Filter panel: do NOT click toggle — use #search-* and #btn-search directly
- After API-creating, filter by name before clicking row actions (item may be paginated)
- Scope text locators to table: `page.locator('#table-x').locator('span:has-text("x")')`
- RoleGuard shows inline message (no redirect) — waitFor({ state: 'visible' })
- Fill ALL required fields before testing an invalid field (client validation runs first)
- Verify error CONTENT: toContainText("exact text"), not just visibility
- Screenshots: testInfo.attach(); label "TC-XX [before/after/step N] — description"; skip for integration

```

---

## Step 4 — Implementation Step

### <span style="color:#0d9488">SE</span> Implementation Prompt

> **When to use:** After Step 3 is complete (test cases exist).
> **You provide:** The feature folder path and the US ID being implemented.
> **You review:** The pre-implementation `/speckit-analyze` report, the implementation diff, and the post-implementation `/speckit-analyze` report.

```
Implementation Prompt

Feature folder:        specs/[feature-id]-[slug]/
US being implemented:  [XX-US-NN]

--- Pre-flight ---

1. Verify both of the following exist:
   - [Feature folder]/spec.md  (contains [US being implemented])
   - [Feature folder]/plan.md
   If either is missing: STOP — complete the Spec and Design steps first.

--- Git ---

2. Check out and update the parent branch, then branch from it:
   git checkout develop
   git pull origin develop
   git checkout -b feature/[us-id-lowercase]-implementation-step
   (e.g. feature/wm-us-01-implementation-step)

--- Implementation Step ---

3. Generate the task list for this US:
   Run /speckit-tasks
   This produces tasks.md — the ordered, dependency-aware work breakdown for [US being implemented].

4. Pre-implementation alignment check:
   Run /speckit-analyze
   Review any consistency gaps flagged between spec.md, plan.md, and tasks.md.
   Resolve all Critical and High findings before proceeding.

5. Implement:
   Artifacts at:
     [Feature folder]/spec.md
     [Feature folder]/plan.md
     [Feature folder]/tasks.md
     [Feature folder]/test_cases.md

   Run /speckit-implement for this feature.

5.1. UI Element ID Contract

Every newly introduced interactive frontend element MUST have a stable `id` attribute,
per constitution.md NC-04 / FE-01.

Since Steps 3 (Quality) and 4 (Implementation) run in parallel, IDs must be assigned proactively from `plan.md`, not added reactively from `test_cases.md`.

#### Naming Convention

Base pattern:

`[prefix]-[entity]-[field-name]`

| Element              | Pattern                 | Example                         |
| -------------------- | ----------------------- | ------------------------------- |
| Form field           | `[entity]-[field-name]` | `wallet-name`, `transaction-amount` |
| Submit button        | `btn-submit-[entity]`   | `btn-submit-wallet`             |
| Open create form btn | `btn-add-[entity]`      | `btn-add-wallet`                |
| Edit row button      | `btn-edit-[entity]-{id}`| `btn-edit-wallet-3`             |
| Delete row button    | `btn-delete-[entity]-{id}`| `btn-delete-wallet-3`         |
| Table container      | `table-[entity]`        | `table-wallets`                 |
| Search input         | `search-[field-name]`   | `search-name`, `search-status`  |
| Search button        | `btn-search`            | `btn-search`                    |
| Reset filter button  | `btn-reset-filter`      | `btn-reset-filter`              |
| Modal wrapper        | `modal-[entity]`        | `modal-wallet`                  |
| Success message      | `message-success`       | `message-success`               |
| Error message        | `message-error`         | `message-error`                 |

#### Rules

* Role-gated elements must still retain their assigned IDs; authorization logic controls visibility, not ID assignment
* `table-[entity]` must be applied to the table wrapper or table element, not to rows or cells
* IDs must remain stable across rerenders and UI state changes
* If multiple elements of the same type exist within a list/table row, append a stable identifier where necessary
* If `test_cases.md` already exists during implementation, cross-check all IDs against the test cases before closing the task

6. Post-implementation alignment check:
   Run /speckit-analyze again.
   Confirm the final codebase state still aligns with spec.md and plan.md.
   If new gaps are flagged, resolve them before handing off to the Deployment Step.
```

---

## Step 5 — Deployment Step

### <span style="color:#0d9488">SE</span> Deployment Prompt

> **When to use:** After Step 4 implementation is complete and reviewed.
> **You provide:** The US ID.
> **You review:** Deployment confirmation and the LAN URLs before handing off to QC.
> **Context:** PFM is a single-machine home-LAN deployment (see RUNBOOK.md) — there is no
> separate remote Test Environment, no Docker, and no SSH. "Deploying" means running the
> app's own tests, then (re)starting the two long-running dev servers on the host machine,
> bound to the LAN per RUNBOOK.md §6.

```
Deployment Prompt

Feature folder:    specs/[feature-id]-[slug]/
US being deployed: [XX-US-NN]
Host LAN IP:        [<HOST_IP> — from RUNBOOK.md §2]

--- Pre-flight ---

1. Verify both of the following exist:
   - [Feature folder]/spec.md
   - [Feature folder]/plan.md
   If missing: STOP — complete earlier steps first.

2. Confirm the Implementation Step branch for [US being deployed] is merged into
   develop. If not merged: STOP — merge first.

--- Deployment Step ---

3. Run the full test suite to confirm there are no regressions:
   cd backend && python manage.py test
   cd frontend && npm run lint && npm run build

4. Pull/merge the latest code on the host machine (skip if already the same checkout):
   git pull origin develop

5. (Re)start both servers bound to the LAN, per RUNBOOK.md §6:
   cd backend && .venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000
   cd frontend && npm run dev -- -H 0.0.0.0

6. Verify the service is healthy:
   curl -s http://<HOST_IP>:8000/health/

7. Confirm the following are reachable on the LAN:
   - Frontend: http://<HOST_IP>:3000
   - Backend:  http://<HOST_IP>:8000/api/v1/

--- Done ---

8. Report: deployment status, any failed tests, and confirm the app is
   ready for QC to run the Verification Prompt against.
```

---

## Step 6 — Verification Step

### <span style="color:#d97706">QC</span> Verification Prompt

> **When to use:** After SE confirms deployment (Step 5).
> **You provide:** The US ID and feature folder path.
> **You review:** The verification report — Playwright results and manual test outcomes.

```
Verification Prompt

Feature folder:   specs/[feature-id]-[slug]/
US to verify:     [XX-US-NN]
App URL:          [http://<HOST_IP>:3000 — confirmed by SE in Step 5]

--- Pre-flight ---

1. Confirm SE's Step 5 report shows the deployment succeeded with no failing tests.
   If not: STOP — deployment must be completed first.

--- Git ---

2. Check out and update the parent branch, then branch from it:
   git checkout develop
   git pull origin develop
   git checkout -b feature/[us-id-lowercase]-verification-step

--- Verification Step ---

3. Run the Playwright automation tests for this US against the app:
   BASE_URL=[App URL] npx playwright test \
     [Feature folder]/test_[feature-id].spec.ts --project=chromium
   Filter to test cases tagged US: [US to verify].

4. For any test cases marked Type: integration or e2e that are NOT covered by
   Playwright automation, perform manual verification against the app.
   Document results inline.

5. Create a Playwright report after finishing testing as testing/[Feature folder]/[xx-us-nn-keyword]
   with result screenshots for e2e cases.

6. Produce a verification report:

   | TC-NN | Test Name | AC | Type | Result | Notes |
   |-------|-----------|----|------|--------|-------|
   | TC-01 | ...       | AC1 | e2e  | PASS / FAIL / BLOCKED | ... |

7. If ALL automated ACs pass:
   - Report verification results.
   - This US is Done per constitution.md's Definition of Done (DOD-01..05) — no
     further ticket transition needed.

8. If any AC fails or is blocked:
   - List each failure in the verification report: test case ID, AC reference,
     observed vs expected behaviour.
   - Do NOT mark the US Done. Hand the failing report back to the Implementation
     Step (Step 4) to fix, then re-run this Verification Step.
```

---

*Reference: [Development Workflow](constitution.md#development-workflow) · [PFM Constitution](constitution.md)*
