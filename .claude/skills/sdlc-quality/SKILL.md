---
name: "sdlc-quality"
description: "Run Step 3 (Quality, QC) of the PFM AIF-SDLC: test_cases.md (in specs/<feature>/) and the Playwright suite (in testing/<feature>/) for a User Story."
argument-hint: "WM-US-01"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Overview: `aif-sdlc.md` § Step 3. This skill never commits or merges.

1. **Parse args:** `US_ID` from `$ARGUMENTS`.

2. **Load context:** find the `specs/*/sdlc.yaml` whose `stories` map has `US_ID`; extract `FEATURE_FOLDER`, `TESTING_FOLDER`, `FEATURE_ID`, `SLUG`, `TEST_ABBR`. None → STOP: "Run `/sdlc-init` first."

3. **Pre-flight (on `develop`):** `{FEATURE_FOLDER}/spec.md` contains a `## {US_ID}:` section and `{FEATURE_FOLDER}/plan.md` contains a `## {US_ID}:` section. Missing → STOP, name the step to run (`/sdlc-spec` / `/sdlc-design`) and remind the user to merge its branch into `develop`.

4. **Branch:** uncommitted changes → STOP. `git checkout develop`, `git pull origin develop` (skip offline), `git checkout -b feature/{us-lower}-quality-step` (switch if it exists).

5. **Quality work** (follow `aif-sdlc.md` § Step 3 and its Testing-Code-Rule in full). First read `.specify/memory/constitution.md` § Integration Testing Over Mocking, § Definition of Done (DOD-03, DOD-05) and Naming Conventions NC-04 — it is not auto-loaded:
   - Read `spec.md` and `plan.md` (its Element IDs table is the selector contract; its API Contracts give the status/body assertions).
   - Classify every AC/EC `[API]`, `[UI]` or `[BOTH]`.
   - Write the test cases per `.specify/templates/testcase-template.md` **Part 1** — the single source of truth for the TC structure (US / Given / When / Then / AC / Type / Severity / Note), the AC Classification table, the Coverage Matrix and its defect rule (a `[BOTH]`/`[UI]` AC with an empty E2E column, or an e2e that does not match its integration TC's facets, is a defect — say "e2e N/A: reason" instead), Negative-scenario applicability and the coverage checklist. Do not diverge from it.
   - **`{FEATURE_FOLDER}/test_cases.md`** (next to `spec.md`/`plan.md`): create it with the file header if missing, otherwise append this US's `## {US_ID}: {title} ({ACTOR})` block, continuing TC numbering and leaving other stories' blocks untouched. Links to `spec.md`/`plan.md` are same-folder links.
   - **`{TESTING_FOLDER}/test_{TEST_ABBR}.spec.ts`:** create it if missing (reuse helpers from `testing/support/api.ts` — never duplicate `createUserAsAdmin`/`login`), otherwise append to it; never modify existing tests. Wrap this US's tests in `test.describe('{US_ID}: {title}', …)` so `/sdlc-verify` can run them with `-g "{US_ID}"`. Integration TCs are **Django `APITestCase`s** (`backend/<app>/tests.py`, written in Step 4), not Playwright — only `[UI]`/`[BOTH]` e2e TCs and the API-level checks that need a live server go here.
   - Playwright rules: ID selectors first (`#id`), error assertions check text (`toContainText`), fill every required field before testing an invalid one, `waitFor({state:'visible'})` for inline messages, screenshots via `testInfo.attach()` labelled `TC-XX [before/after/step N] — description`, test data prefixed `TestQC-[entity]-${Date.now()}`, seed users through the ADMIN-only endpoint (`createUserAsAdmin`) — never through a public registration route (there is none).
   - Self-verify against the coverage checklist and Testing-Code-Rule; confirm each item or state N/A.

6. **Review gate:** go through [`aif-review-checklist.md` § Step 3](../../../aif-review-checklist.md#step-3--quality-step--qc-reviews) item by item. Show the checked list, the new TCs, the Coverage Matrix and the Playwright changes, and ask the user to review. Apply changes and repeat.

7. **Report:** the branch, `test_cases.md` and `.spec.ts` paths, a reminder to commit and merge into `develop`, and:
   ```
   /sdlc-implement {US_ID}
   ```
