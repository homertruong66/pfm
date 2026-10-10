---
name: "sdlc-verify"
description: "Run Step 6 (Verification, QC) of the PFM AIF-SDLC: run the backend and Playwright tests against the deployed app, write the per-story verification report and Playwright HTML report, and decide Done per the Definition of Done."
argument-hint: "WM-US-01"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Overview: `aif-sdlc.md` § Step 6. There is no tracker: a story is **Done** when its verification report says so per `constitution.md` § Definition of Done (DOD-01..05). This skill never commits.

1. **Parse args:** `US_ID` from `$ARGUMENTS`.

2. **Load context:** find the `specs/*/sdlc.yaml` whose `stories` map has `US_ID`; extract `FEATURE_FOLDER`, `TESTING_FOLDER`, `FEATURE_ID`, `SLUG`, `TEST_ABBR`, `TEST_ENV_URL`, `API_URL`. None → STOP: "Run `/sdlc-init` first."

3. **Pre-flight:** read `.specify/memory/constitution.md` § Definition of Done (DOD-01–05) — it is not auto-loaded and the verdict is judged against it. `/sdlc-deploy {US_ID}` reported success (servers up at `TEST_ENV_URL` / `API_URL`; `curl {API_URL}/health/` answers). Not deployed → STOP: "Run `/sdlc-deploy {US_ID}` first." The Playwright suites need an existing ADMIN: ask for `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` if they are not set (never invent or store credentials; `RUNBOOK.md` §9).

4. **Branch:** uncommitted changes → STOP. `git checkout develop`, `git pull origin develop` (skip offline), `git checkout -b feature/{us-lower}-verification-step` (switch if it exists).

5. **Verification work** (follow `aif-sdlc.md` § Step 6):
   - **Backend/integration TCs:** `cd backend && python manage.py test` — every integration TC of this story must be covered by a named `APITestCase` (`test_tcNN_…`) that passes.
   - **Playwright (e2e) TCs**, from `testing/` (where `playwright.config.ts` and the `chromium` project live), against the deployed app:
     ```
     cd testing && BASE_URL={TEST_ENV_URL} API_BASE_URL={API_URL}/api/v1 npx playwright test \
       {TESTING_FOLDER basename}/test_{TEST_ABBR}.spec.ts --project=chromium -g "{US_ID}" --reporter=html
     ```
     with `PLAYWRIGHT_HTML_REPORT` set to `{TESTING_FOLDER}/{us-lower}-{keyword}` (`{keyword}` = a short slug from the story title, e.g. `um-us-01-create-user`). Check that the run reports a non-zero test count. Playwright's HTML reporter **empties its output folder** — so write `verification-report.md` *after* the run, never before (a re-run deletes it; restore it from git if that happens).
   - **Manual checks:** TCs of type integration/e2e not covered by automation, plus a short live spot check with `curl` against the running app for the key rejection paths; record what was exercised and what was restored.
   - Remove disposable output: `rm -rf testing/test-results` (it is git-ignored).
   - **`{TESTING_FOLDER}/{us-lower}-{keyword}/verification-report.md`** per `.specify/templates/testcase-template.md` **Part 2** (Date, App URL, HTML report link, Results table with every TC-NN / name / AC / type / result / notes, the pass-count line, optional manual spot check, Verdict). State plainly any deviation: a run against `localhost` instead of the LAN host, proxy-based tests, flaky first runs. A PASS is recorded only for what the test actually proves.

6. **Review gate:** go through [`aif-review-checklist.md` § Step 6](../../../aif-review-checklist.md#step-6--verification-step--qc-reviews) item by item. Show the checked list, the test results and the report, and ask the user to review. Apply changes and repeat.

7. **If every check passes:** the Verdict states the story **is Done** and walks DOD-01..05 one line each (DOD-03 may be N/A for a public endpoint — say why). Also update the status in `plan.md`'s story table. No ticket transition exists.

8. **If any TC fails or is blocked:** list each failure — TC-ID, AC/EC, observed vs expected. Do **not** mark the story Done. Hand it back to Step 4 (`/sdlc-implement {US_ID}`), then `/sdlc-deploy` and `/sdlc-verify` again.

9. **Report:** pass/fail counts, the verdict, any deviation, the report paths, a reminder to commit the branch and merge it into `develop`. A richer single-file report is optional: `/sdlc-test-report`.
