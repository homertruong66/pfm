---
name: "sdlc-quality"
description: "Run Step 3 (Quality) of the AIF-SDLC: test_cases.md and Playwright automation generation."
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

2. **Load context:** search `specs/*/sdlc.yaml` for the file whose `stories` map contains `{US_ID}`. Read it. Extract: `EPIC`, `JIRA_STORY`, `FEATURE_FOLDER`, `FEATURE_ID`, `SLUG`, `TESTING_FOLDER`.
   - `EPIC` = the Jira Story's own parent Epic (`getJiraIssue(JIRA_STORY)` → `parent`). Epics may be split per team phase, so one feature can span several and the step Tasks live under the Story's Epic. Use `jira_epic` from sdlc.yaml only when the Story has no parent.
   - No match → STOP: "Run `/sdlc-init` for this feature, or add `{US_ID}` to its `stories` map."
   - `JIRA_STORY` empty → STOP: "Add the Jira Story key for `{US_ID}` to sdlc.yaml."

3. **Pre-flight:**
   - The **Design Step Task is Done** (reviewed and accepted): JQL `project = OBMS AND issuetype = Task AND summary ~ "{US_ID}: Design Step"`. `Ready For Review` / `In Review` → STOP: "The Design Step is still in review; finish it with `/sdlc-design {US_ID}` (confirm its review gate)." Other status or not found → STOP: "Run `/sdlc-design {US_ID}` first." If Jira is unavailable, warn and continue.
   - Both exist on the latest `develop`:
   - `{feature_folder}/spec.md` containing `{US_ID}`
   - `{feature_folder}/plan.md` containing a `{US_ID}` section
   - Missing either → STOP, name the step to run first, and remind the user to merge its branch into `develop`.
   - If `{testing_folder}` does not exist yet, create it.

4. **Jira & Git:** run `/sdlc-jira-task step="Quality Step" us={US_ID} epic={EPIC} story={JIRA_STORY} branch_slug=quality-step`. Capture `TASK_ID` (`unknown` if Jira is unavailable) and the branch name.

5. **Quality work** (follow `aif-sdlc.md` §Step 3 rules in full, including the Testing-Code-Rule):
   - Read `spec.md` and `plan.md`
   - Classify each AC: `[API]`, `[UI]`, or `[BOTH]`
   - Write test cases per `.specify/templates/testcase-template.md` **Part 1** — that
     template is the single source of truth for TC structure, Coverage Matrix format,
     the Per-facet depth match rule, the coverage-matrix defect condition, and the full
     Coverage-required-per-US checklist. Follow it in full; do not diverge from it here.
   - **If `test_cases.md` does NOT exist:** create it + create `{testing_folder}/test_{feature_id}-{slug}.spec.ts`
     (i.e. `test_` + the `{testing_folder}` basename; do not use the bare numeric `feature_id` alone)
   - Wrap this US's Playwright tests in `test.describe('{US_ID} — {title}', …)` so `/sdlc-verify` can run them alone with `-g "{US_ID}"`.
   - **If `test_cases.md` exists:** append new TCs (continue TC numbering) + append to existing
     `.spec.ts`. Do not modify or remove existing test cases. If a stray copy of the `.spec.ts`
     exists under the feature folder, delete it — the testing folder is the single source of
     truth for Playwright scripts.
   - Self-verify against the Coverage checklist and Testing-Code-Rule — confirm each item or state N/A

6. **Review gate:** self-check against [`aif-review-checklist.md` §Step 3](../../../aif-review-checklist.md#step-3--quality-step--qc-reviews): go through every item and mark it pass, fail (with the fix applied or proposed) or N/A, fixing what you can first. Then show the checked list, the new TCs in `test_cases.md`, the Coverage Matrix and the Playwright changes, and ask the user to review. Apply requested changes.
   Before showing the review, run `/sdlc-jira-done {TASK_ID} to=ready` (Task → Ready For Review while you review; skip if `TASK_ID` is unknown).

7. **Jira:** once the user approves (skip if `TASK_ID` is unknown):
   - `addCommentToJiraIssue(TASK_ID)` with the Coverage Matrix.
   - Run `/sdlc-jira-done {TASK_ID}` (Ready For Review → In Review → Done). Implementation starts only after the Task is Done.
   - If the user asks for changes, apply them and repeat the review; the Task stays in Ready For Review.

8. **Report:** `TASK_ID`, branch, `test_cases.md` path, `.spec.ts` path, a reminder to commit, and the next step:
   ```
   /sdlc-implement {US_ID}
   ```
