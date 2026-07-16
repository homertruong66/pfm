# AI-First Software Development Life Cycle (AIF-SDLC)

> Structured prompts for each role at each stage of the development cycle.
> Claude performs the task automatically — **you only review the artifact produced.**
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
| **5** | <span style="color:#0d9488;font-weight:700">SE</span> | Deployment Prompt | US deployed to Test Environment |
| **6** | <span style="color:#d97706;font-weight:700">QC</span> | Verification Prompt | Verification report (automated + manual) |

> **Sequence rule:** Each step starts only after the previous artifact is produced and reviewed.
> **Token Saving Tool (ex: rtk):** Do not use such tool for step 4 which can create non-quality code.

---

## Step 1 — Spec Step

### <span style="color:#3b82f6">BA</span> Spec Prompt

> **When to use:** You have a new User Story to specify — either the first US for a brand-new Feature, or an additional US for an existing Feature.
> **You provide:** Feature details and story details in the placeholders below.
> **You review:** The `spec.md` in `specs/[feature-id]-[slug]/` and the SRS entry under the feature section.

```
Spec Prompt

Feature group:  [e.g. 7.2 Business Unit]
Feature code:   [e.g. BU]
Feature folder: [e.g. specs/002-business-unit — leave blank if new feature, Claude will create it]
Story number:   [e.g. BU-US-01 — leave blank to auto-assign next number from SRS]
Jira Epic:      [BEE-EEE — the Epic ticket for this Feature]
Jira Story:     [BEE-NNN — the Story ticket for this US]
Story title:    [e.g. Create a Business Unit]
Actor(s):       [ADMIN | RETAILER | CUSTOMER | SYSTEM | HUMAN REVIEWER]
Goal:           [one sentence — what the actor wants to do]
Reason:         [one sentence — business value]
Acceptance criteria (for spec only — NOT written into SRS):
- [AC 1]
- [AC 2]
- [AC 3]

--- Jira & Git ---

1. Using the Atlassian MCP, look up an existing Spec Step ticket to avoid duplicates:
   searchJiraIssuesUsingJql: summary ~ "[Story number]: Spec Step" AND parent = [Jira Epic] AND issuetype = Task
   - If found: set TASK_ID = that ticket's key. Skip steps 2–3.
   - If not found:
       a. Get the current user's account ID:
            atlassianUserInfo() → extract accountId as CURRENT_USER_ACCOUNT_ID
       b. Create a Jira Task ticket:
            summary:  [Story number]: Spec Step
            type:     Task
            parent:   [Jira Epic]
            assignee: CURRENT_USER_ACCOUNT_ID
          Save the new ticket ID as TASK_ID.
       c. Add TASK_ID to the active sprint:
            searchJiraIssuesUsingJql: project = BEE AND sprint in openSprints() (fields: ["customfield_10020"])
            Extract sprint ID from the first result's customfield_10020.
            editJiraIssue(TASK_ID, customfield_10020: sprint_id)

2. Transition TASK_ID to In Progress:
   - getTransitionsForJiraIssue(TASK_ID) → find "In Progress" transition ID
   - transitionJiraIssue(TASK_ID, transition_id)

3. Link TASK_ID to block the US Story [Jira Story]:
   - getIssueLinkTypes() → find the "Blocks" link type ID
   - createIssueLink(inwardIssue: [Jira Story], outwardIssue: TASK_ID, linkType: "Blocks")

4. Create and switch to a git feature branch:
   git checkout -b feature/[task-id-lowercase]-[story-number-lowercase]-spec-step
   (e.g. feature/bee-234-pp-us-01-spec-step)

--- Spec Step ---

=== IF Feature folder does NOT exist yet (new Epic / first US) ===

5. In SRS.md, add a spec link immediately under the feature section header (§7.x),
   before any US entries. Format:
   > Spec: [[Feature folder]/spec.md]([Feature folder]/spec.md)

   The spec link appears ONCE at the feature (§7.x) level — never under individual US entries.

6. Add the US entry to SRS.md under the feature section. Format:
   #### [§7.x.N] [Jira Story]: [Story Title] ([ACTOR])
   **As a/an** [actor], **I want to** [goal] **so that** [reason].

7. Run /speckit.specify with the story statement and ACs above.
   This creates [Feature folder] and generates spec.md.

=== IF Feature folder already exists (adding a new US to an existing Epic) ===

5. The spec link already exists on the feature section header — do NOT add it again.

6. Add the new US entry to SRS.md under the existing feature section. Format:
   #### [§7.x.N] [Jira Story]: [Story Title] ([ACTOR])
   **As a/an** [actor], **I want to** [goal] **so that** [reason].

7. Run /speckit.specify with the story statement and ACs above.
   This appends the new US to the existing spec.md.

=== Always — regardless of which case applies ===

• Remove any existing AC block from the SRS entry for this US. Only the story
  statement belongs in SRS.md. ACs live in spec.md only.
• Never add a spec link under a US entry (§7.x.N level) — the link belongs on
  the feature header (§7.x level) only, added once for the whole Epic.
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
Jira Epic:         [BEE-EEE]
Jira Story:        [BEE-NNN]
Story title:       [Story title confirmed in Step 1]

--- Pre-flight ---

1. Verify [Feature folder]/spec.md exists and contains [US being designed].
   If not found: STOP — run the Spec Prompt for this US first.

--- Jira & Git ---

2. Using the Atlassian MCP, look up an existing Design Step ticket to avoid duplicates:
   searchJiraIssuesUsingJql: summary ~ "[US being designed]: Design Step" AND parent = [Jira Epic] AND issuetype = Task
   - If found: set TASK_ID = that ticket's key. Skip steps 3–4.
   - If not found:
       a. Get the current user's account ID:
            atlassianUserInfo() → extract accountId as CURRENT_USER_ACCOUNT_ID
       b. Create a Jira Task ticket:
            summary:  [US being designed]: Design Step
            type:     Task
            parent:   [Jira Epic]
            assignee: CURRENT_USER_ACCOUNT_ID
          Save the new ticket ID as TASK_ID.
       c. Add TASK_ID to the active sprint:
            searchJiraIssuesUsingJql: project = BEE AND sprint in openSprints() (fields: ["customfield_10020"])
            Extract sprint ID from the first result's customfield_10020.
            editJiraIssue(TASK_ID, customfield_10020: sprint_id)

3. Transition TASK_ID to In Progress:
   - getTransitionsForJiraIssue(TASK_ID) → find "In Progress" transition ID
   - transitionJiraIssue(TASK_ID, transition_id)

4. Link TASK_ID to block the US Story [Jira Story]:
   - getIssueLinkTypes() → find the "Blocks" link type ID
   - createIssueLink(inwardIssue: [Jira Story], outwardIssue: TASK_ID, linkType: "Blocks")

5. Create and switch to a git feature branch:
   git checkout -b feature/[task-id-lowercase]-[us-id-lowercase]-design-step
   (e.g. feature/bee-235-pp-us-01-design-step)

--- Design Step ---

6. Read [Feature folder]/spec.md and flag any ambiguities, missing
   domain objects, or API gaps before proceeding.

=== IF plan.md does NOT exist yet (first US of this Feature) ===

7. Run /speckit.plan for this spec. This creates plan.md.
8. In SDS.md, add a plan link immediately under the feature section header,
   before any sub-section entries. Format:
   > Plan: [[Feature folder]/plan.md]([Feature folder]/plan.md)

   The plan link appears ONCE at the feature (§5.x) level — never under individual
   US sub-sections.

9. In SDS.md, create the US sub-section (§5.x.N) with ONLY the Purpose field.
   Format:
   #### [§5.x.N] [US being designed]: [Story Title]
   **Purpose**
   [one-paragraph summary of what the US delivers and why]

=== IF plan.md already exists (2nd+ US of this Feature) ===

7. Run /speckit.plan for this spec. This updates the existing plan.md to cover
   the new US — existing sections are preserved and extended as needed.
8. The plan link already exists in SDS.md — do NOT add it again.
9. In SDS.md, for the US sub-section (§5.x.N):
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
Jira Epic:       [BEE-EEE]
Jira Story:      [BEE-NNN]

--- Pre-flight ---

1. Verify both of the following exist:
   - [Feature folder]/spec.md  (contains [US being tested])
   - [Feature folder]/plan.md
   If either is missing: STOP — complete the Spec and Design steps first.

--- Jira & Git ---

2. Using the Atlassian MCP, look up an existing Quality Step ticket to avoid duplicates:
   searchJiraIssuesUsingJql: summary ~ "[US being tested]: Quality Step" AND parent = [Jira Epic] AND issuetype = Task
   - If found: set TASK_ID = that ticket's key. Skip steps 3–4.
   - If not found:
       a. Get the current user's account ID:
            atlassianUserInfo() → extract accountId as CURRENT_USER_ACCOUNT_ID
       b. Create a Jira Task ticket:
            summary:  [US being tested]: Quality Step
            type:     Task
            parent:   [Jira Epic]
            assignee: CURRENT_USER_ACCOUNT_ID
          Save the new ticket ID as TASK_ID.
       c. Add TASK_ID to the active sprint:
            searchJiraIssuesUsingJql: project = BEE AND sprint in openSprints() (fields: ["customfield_10020"])
            Extract sprint ID from the first result's customfield_10020.
            editJiraIssue(TASK_ID, customfield_10020: sprint_id)

3. Transition TASK_ID to In Progress:
   - getTransitionsForJiraIssue(TASK_ID) → find "In Progress" transition ID
   - transitionJiraIssue(TASK_ID, transition_id)

4. Link TASK_ID to block the US Story:
   - getIssueLinkTypes() → find the "Blocks" link type ID
   - createIssueLink(inwardIssue: [Jira Story], outwardIssue: TASK_ID, linkType: "Blocks")

5. Create and switch to a git feature branch:
   git checkout -b feature/[task-id-lowercase]-[us-id-lowercase]-quality-step
   (e.g. feature/bee-236-pp-us-01-quality-step)

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

6. Create test_cases.md in [Feature folder] with test cases for [US being tested].
7. Create test_[feature-id].spec.ts with Playwright automation for all e2e test cases. Following Testing-Code-Rule

=== IF test_cases.md already exists (2nd+ US of this Feature) ===

6. Append new test cases for [US being tested] to the existing test_cases.md.
   Number new cases continuing from the last TC-NN in the file.
7. Append new Playwright tests for [US being tested] e2e cases to the existing
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
> **You review:** The pre-implementation `/speckit.analyze` report, the implementation diff, and the post-implementation `/speckit.analyze` report.

```
Implementation Prompt

Feature folder:        specs/[feature-id]-[slug]/
US being implemented:  [XX-US-NN]
Jira Epic:             [BEE-EEE]
Jira Story:            [BEE-NNN]

--- Pre-flight ---

1. Verify both of the following exist:
   - [Feature folder]/spec.md  (contains [US being implemented])
   - [Feature folder]/plan.md
   If either is missing: STOP — complete the Spec and Design steps first.

--- Jira & Git ---

2. Using the Atlassian MCP, look up an existing Implementation Step ticket to avoid duplicates:
   searchJiraIssuesUsingJql: summary ~ "[US being implemented]: Implementation Step" AND parent = [Jira Epic] AND issuetype = Task
   - If found: set TASK_ID = that ticket's key. Skip steps 3–4.
   - If not found:
       a. Get the current user's account ID:
            atlassianUserInfo() → extract accountId as CURRENT_USER_ACCOUNT_ID
       b. Create a Jira Task ticket:
            summary:  [US being implemented]: Implementation Step
            type:     Task
            parent:   [Jira Epic]
            assignee: CURRENT_USER_ACCOUNT_ID
          Save the new ticket ID as TASK_ID.
       c. Add TASK_ID to the active sprint:
            searchJiraIssuesUsingJql: project = BEE AND sprint in openSprints() (fields: ["customfield_10020"])
            Extract sprint ID from the first result's customfield_10020.
            editJiraIssue(TASK_ID, customfield_10020: sprint_id)

3. Transition TASK_ID to In Progress:
   - getTransitionsForJiraIssue(TASK_ID) → find "In Progress" transition ID
   - transitionJiraIssue(TASK_ID, transition_id)

4. Link TASK_ID to block the [Jira Story]:
   - getIssueLinkTypes() → find the "Blocks" link type ID
   - createIssueLink(inwardIssue: [Jira Story], outwardIssue: TASK_ID, linkType: "Blocks")

5. Create and switch to a git feature branch:
   git checkout -b feature/[task-id-lowercase]-[us-id-lowercase]-implementation-step
   (e.g. feature/bee-237-pp-us-01-implementation-step)

--- Implementation Step ---

6. Generate the task list for this US:
   Run /speckit.tasks
   This produces tasks.md — the ordered, dependency-aware work breakdown for [US being implemented].

7. Pre-implementation alignment check:
   Run /speckit.analyze
   Review any consistency gaps flagged between spec.md, plan.md, and tasks.md.
   Resolve all Critical and High findings before proceeding.

8. Implement:
   Artifacts at:
     [Feature folder]/spec.md
     [Feature folder]/plan.md
     [Feature folder]/tasks.md
     [Feature folder]/test_cases.md

   Run /speckit.implement for this feature.

8.1. UI Element ID Contract

Every newly introduced interactive frontend element MUST have a stable `id` attribute.

Since Steps 3 (Quality) and 4 (Implementation) run in parallel, IDs must be assigned proactively from `plan.md`, not added reactively from `test_cases.md`.

#### Naming Convention

Base pattern:

`[prefix]-[entity]-[field-name]`

| Element              | Pattern                 | Example                         |
| -------------------- | ----------------------- | ------------------------------- |
| Form field           | `[entity]-[field-name]` | `cost-name`, `cost-start-month` |
| Submit button        | `btn-submit-[entity]`   | `btn-submit-cost`               |
| Open create form btn | `btn-add-[entity]`      | `btn-add-cost`                  |
| Edit row button      | `btn-edit-[entity]`     | `btn-edit-cost`                 |
| Delete row button    | `btn-delete-[entity]`   | `btn-delete-cost`               |
| Save inline button   | `btn-save-[entity]`     | `btn-save-cost`                 |
| Table container      | `table-[entity]`        | `table-costs`                   |
| Search input         | `search-[field-name]`   | `search-name`, `search-status`  |
| Search button        | `btn-search`            | `btn-search`                    |
| Reset filter button  | `btn-reset-filter`      | `btn-reset-filter`              |
| Modal wrapper        | `modal-[entity]`        | `modal-cost`                    |
| Drawer wrapper       | `drawer-[entity]`       | `drawer-employee`               |
| Success message      | `message-success`       | `message-success`               |
| Error message        | `message-error`         | `message-error`                 |

#### Rules

* Role-gated elements must still retain their assigned IDs; authorization logic controls visibility, not ID assignment
* `table-[entity]` must be applied to the table wrapper or table element, not to rows or cells
* IDs must remain stable across rerenders and UI state changes
* If multiple elements of the same type exist within a list/table row, append a stable identifier where necessary
* If `test_cases.md` already exists during implementation, cross-check all IDs against the test cases before closing the task

9. Post-implementation alignment check:
   Run /speckit.analyze again.
   Confirm the final codebase state still aligns with spec.md and plan.md.
   If new gaps are flagged, resolve them before handing off to the Deployment Step.
```

---

## Step 5 — Deployment Step

### <span style="color:#0d9488">SE</span> Deployment Prompt

> **When to use:** After Step 4 implementation is complete and reviewed.
> **You provide:** The US ID and the Test Environment URL.
> **You review:** Deployment confirmation and Test Environment URL before handing off to QC.

```
Deployment Prompt

Feature folder:    specs/[feature-id]-[slug]/
US being deployed: [XX-US-NN]
Jira Epic:         [BEE-EEE]
Jira Story:        [BEE-NNN]
Test Env URL:      [e.g. https://test.obms.internal or http://10.0.0.x]
user:              [user]

--- Pre-flight ---

1. Verify both of the following exist:
   - [Feature folder]/spec.md
   - [Feature folder]/plan.md
   If missing: STOP — complete earlier steps first.

2. Using the Atlassian MCP, verify the Implementation Step ticket is Done:
   JQL: summary ~ "[US being deployed]: Implementation Step" AND parent = [Jira Epic]
   If ticket is not Done: STOP — implementation must be completed and merged first.

--- Jira & Git ---

3. Using the Atlassian MCP, look up an existing Deployment Step ticket to avoid duplicates:
   searchJiraIssuesUsingJql: summary ~ "[US being deployed]: Deployment Step" AND parent = [Jira Epic] AND issuetype = Task
   - If found: set TASK_ID = that ticket's key. Skip steps 4–5.
   - If not found:
       a. Get the current user's account ID:
            atlassianUserInfo() → extract accountId as CURRENT_USER_ACCOUNT_ID
       b. Create a Jira Task ticket:
            summary:  [US being deployed]: Deployment Step
            type:     Task
            parent:   [Jira Epic]
            assignee: CURRENT_USER_ACCOUNT_ID
          Save the new ticket ID as TASK_ID.
       c. Add TASK_ID to the active sprint:
            searchJiraIssuesUsingJql: project = BEE AND sprint in openSprints() (fields: ["customfield_10020"])
            Extract sprint ID from the first result's customfield_10020.
            editJiraIssue(TASK_ID, customfield_10020: sprint_id)

4. Transition TASK_ID to In Progress:
   - getTransitionsForJiraIssue(TASK_ID) → find "In Progress" transition ID
   - transitionJiraIssue(TASK_ID, transition_id)

5. Link TASK_ID to block the US Story:
   - getIssueLinkTypes() → find the "Blocks" link type ID
   - createIssueLink(inwardIssue: [Jira Story], outwardIssue: TASK_ID, linkType: "Blocks")

--- Deployment Step ---

6. Run the tests related to the [US being deployed] functionality before deployment to confirm there are no regressions:
   cd backend && ./mvnw test

7. Access remote host and deploy to Test Environment:
   ssh -p 2222 -i ~/.ssh/id_ed25519 [user]@[Test Env URL without http://]
   cd ../../app/grm
   git pull origin develop

8. Build and deploy app to the Test environment:
   docker compose -f docker-compose-dev.yml up -d --build

9. Verify the service is healthy:
   curl -s [Test Env URL]:9090/health
   curl -s [Test Env URL]:9090/actuator/health

10. Confirm the following are reachable in the Test Environment:
    - Frontend:   [Test Env URL]:3001
    - Health:     [Test Env URL]:9090/health

--- Done ---

11. Transition TASK_ID to Done:
    - getTransitionsForJiraIssue(TASK_ID) → find "Done" transition ID
    - transitionJiraIssue(TASK_ID, transition_id)

12. Report: deployment status, any failed tests, and confirm [Test Env URL] is
    ready for QC to run the Verification Prompt against.
```

---

## Step 6 — Verification Step

### <span style="color:#d97706">QC</span> Verification Prompt

> **When to use:** After SE confirms deployment to Test Environment (Step 5).
> **You provide:** The US ID and feature folder path.
> **You review:** The verification report — Playwright results and manual test outcomes.

```
Verification Prompt

Feature folder:   specs/[feature-id]-[slug]/
US to verify:     [XX-US-NN]
Jira Epic:        [BEE-EEE]
Jira Story:       [BEE-NNN]
Test Env URL:     [URL confirmed by SE in Step 5]

--- Pre-flight ---

1. Using the Atlassian MCP, verify the Deployment Step ticket is Done:
   JQL: summary ~ "[US to verify]: Deployment Step" AND parent = [Jira Epic]
   If ticket is not Done: STOP — deployment must be completed first.

--- Jira ---

2. Transition the US Story [Jira Story] to In Review:
   - getTransitionsForJiraIssue([Jira Story]) → find "In Review" transition ID
   - transitionJiraIssue([Jira Story], transition_id)
   QC uses [Jira Story] directly to track verification progress — no separate Task ticket is created.

3. Create and switch to a git feature branch:
   git checkout -b feature/[task-id-lowercase]-[us-id-lowercase]-verification-step
   (e.g. feature/bee-236-pp-us-01-verification-step)

--- Verification Step ---

4. Run the Playwright automation tests for this US against the Test Environment:
   BASE_URL=[Test Env URL] npx playwright test \
     [Feature folder]/test_[feature-id].spec.ts --project=chromium
   Filter to test cases tagged US: [US to verify].

5. For any test cases marked Type: integration or e2e that are NOT covered by
   Playwright automation, perform manual verification against the Test Environment.
   Document results inline.

6. Create Playwright report after finished testing as testing/[Feature folder]/[xx-us-nn-keyword] with result screenshot for e2e cases

7. Produce a verification report:

   | TC-NN | Test Name | AC | Type | Result | Notes |
   |-------|-----------|----|------|--------|-------|
   | TC-01 | ...       | AC1 | e2e  | PASS / FAIL / BLOCKED | ... |

8. If ALL automated ACs pass:
   - Report verification results.
   - Leave [Jira Story] In Review — QC transitions it to Done once all manual / e2e checks are complete.

9. If any AC fails or is blocked:
   - List each failure: test case ID, AC reference, observed vs expected behaviour.
   - Raise a new Bug ticket via Atlassian MCP:
       a. createJiraIssue:
            summary: [BUG-DEV][US to verify]: [short description of failure]
            type:    Bug
            parent:  [Jira Epic]
            description: Pre-condition, Test data, Steps, Expected Result, Actual Result
          Save the new ticket ID as BUG_ID.
       b. Add BUG_ID to the active sprint:
            searchJiraIssuesUsingJql: project = BEE AND sprint in openSprints() (fields: ["customfield_10020"])
            Extract sprint ID from the first result's customfield_10020.
            editJiraIssue(BUG_ID, customfield_10020: sprint_id)
   - Add a comment to [Jira Story] linking to the new Bug ticket.

```

---

*Reference: [Development Workflow](constitution.md#development-workflow) · [GRM Constitution](constitution.md)*
