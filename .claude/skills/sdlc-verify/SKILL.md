---
name: "sdlc-verify"
description: "Run Step 6 (Verification) of the AIF-SDLC: Playwright tests and Jira comment, leaving the Story in Ready For Review for QC to close."
argument-hint: "PP-US-01"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

This skill never commits — the user reviews and commits.

1. **Parse args:** `US_ID` from `$ARGUMENTS`.

2. **Load context:** search `specs/*/sdlc.yaml` for the file whose `stories` map contains `{US_ID}`. Read it. Extract: `EPIC`, `JIRA_STORY`, `FEATURE_FOLDER`, `TESTING_FOLDER`, `FEATURE_ID`, `SLUG`, `TEST_ENV_URL`, `SSH_HOST`, `SSH_PORT`, `QC_SSH_USER`, `QC_SSH_KEY`.
   `QC_SSH_USER`/`QC_SSH_KEY` are QC's own SSH credentials for this Verification Step (Step 6) —
   distinct from the Deployment Step's `ssh_user`/`ssh_key`, which belong to SE/Dev. Never use
   `ssh_user`/`ssh_key` for Verification Step log checks; use `QC_SSH_USER`/`QC_SSH_KEY` instead.
   - `EPIC` = the Jira Story's own parent Epic (`getJiraIssue(JIRA_STORY)` → `parent`). Epics may be split per team phase, so one feature can span several and the step Tasks live under the Story's Epic. Use `jira_epic` from sdlc.yaml only when the Story has no parent.
   - No match → STOP: "Run `/sdlc-init` for this feature, or add `{US_ID}` to its `stories` map."
   - `JIRA_STORY` empty → STOP: "Add the Jira Story key for `{US_ID}` to sdlc.yaml."

3. **Pre-flight via Jira:** verify the Deployment Step Task ticket is Done:
   - JQL: `project = OBMS AND issuetype = Task AND summary ~ "{US_ID}: Deployment Step"`
   - `Ready For Review` / `In Review` → STOP: "The Deployment Step is still in review; finish it with `/sdlc-deploy {US_ID}` (confirm its review gate)." Other status or not found → STOP: "Run `/sdlc-deploy {US_ID}` and confirm it succeeded first."
   - Jira unavailable → warn, skip the Jira parts of this step (steps 3, 4, and the Jira comment/Bug in 8–9), and tell the user to update the Story and post results by hand.

4. **Jira:** move `JIRA_STORY` to **Ready For Review** (skip if it is already `Ready For Review`, `In Review` or `Done`):
   - `getTransitionsForJiraIssue(JIRA_STORY)` → pick the transition whose target status (`to.name`) is `Ready For Review` → `transitionJiraIssue`. If none: list the available transitions and STOP.

5. **Git branch:**
   - Create or switch to `feature/{jira-story-lowercase}-{us-lowercase}-verification-step` (e.g. `feature/obms-148-co-us-03-verification-step`), following `CLAUDE.md` → Branch naming. `{us-lowercase}` replaces `.` with `-`. Verification has no task ticket, so the Story key takes the task key's place.

6. **Verification work** (follow `aif-sdlc.md` §Step 6 rules):
   - Run Playwright tests filtered to `US_ID`, from `testing/` (where `playwright.config.ts` and the `chromium` project live):
     ```
     cd testing && BASE_URL={TEST_ENV_URL} npx playwright test \
       {feature_id}-{slug}/test_{feature_id}-{slug}.spec.ts --project=chromium -g "{US_ID}"
     ```
     `-g "{US_ID}"` matches `test.describe('{US_ID} — …')` blocks, so earlier USs' tests in the same file are not counted. Older files without per-US `describe` blocks (titles like `test('TC-01: …')`): filter by this US's TC IDs from `test_cases.md` instead, e.g. `-g "TC-(07|08|09):"`. Check the run reports a non-zero test count.
   - For TCs not covered by automation: manual verification, document results inline. For any
     TC requiring server-side log inspection (audit logs, error logs, etc.) — STOP if `QC_SSH_USER` is empty ("Set `qc_ssh_user` in sdlc.yaml") — SSH in as QC using
     `ssh -p {SSH_PORT} -i {QC_SSH_KEY} {QC_SSH_USER}@{SSH_HOST}` — not the Deployment Step's
     `ssh_user`/`ssh_key`.
   - Generate HTML report via `/sdlc-test-report` → `{testing_folder}/{us-id-lowercase}-{keyword}/index.html`
     (convention: US-id + a short keyword derived from the US title, e.g.
     `um-us-01-1-expiration-config` — see `.claude/skills/sdlc-test-report/SKILL.md` §1)
   - Produce/append the Results section in `{testing_folder}/test_report.md`, formatted per
     `.specify/templates/testcase-template.md` **Part 2** — the single source of truth for the
     metadata block, Results table, and Summary format. Create the file with its header on the
     first US of the feature; otherwise append this US's block without touching existing ones.

7. **Review gate:** self-check against [`aif-review-checklist.md` §Step 6](../../../aif-review-checklist.md#step-6--verification-step--qc-reviews): go through every item and mark it pass, fail (with the fix applied or proposed) or N/A, fixing what you can first. Then show the checked list, the test results and the `test_report.md` section, and ask the user to review. Apply requested changes. Do this **before** posting anything to Jira (comment or Bug). Verification has no Task, so `/sdlc-jira-done` is never called.

8. **If ALL ACs pass:**
   - `addCommentToJiraIssue(JIRA_STORY)` with:
     - One-line summary: pass count, e.g. `**14/14 PASS** (AC1, AC2, AC3 — integration + e2e)`
     - Compact results table (TC | short Test Name | AC | Type | Result)
     - Links: `{testing_folder}/test_report.md` and `{testing_folder}/{us-id-lowercase}-{keyword}/index.html`
     - Any accepted gaps called out by TC-ID with reason
   - Leave `JIRA_STORY` in Ready For Review — QC moves it on (Review → In Review → Done) once its manual/e2e checks are complete. Claude never moves the Story past Ready For Review.

9. **If any AC fails or is blocked:**
   - List each failure: TC-ID, AC reference, observed vs expected
   - `createJiraIssue(summary: "[BUG-DEV]{US_ID}: {short description}", type: Bug, parent: EPIC, description: "Severity: {failing TC's Severity} / Pre-condition, Test data, Steps, Expected Result, Actual Result")` → `BUG_ID`
   - Sprint JQL → `editJiraIssue(BUG_ID, customfield_10020: SPRINT_ID)`
   - `createIssueLink(inwardIssue: BUG_ID, outwardIssue: JIRA_STORY, linkType: "Bug")`
   - `addCommentToJiraIssue(JIRA_STORY)` linking to `BUG_ID`
   - Do NOT transition Story to Done

10. **Report:** pass/fail counts, Story final state (`Ready For Review`, pending QC), any Bug tickets raised, and a reminder to commit the reports.
