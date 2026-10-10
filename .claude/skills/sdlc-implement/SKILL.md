---
name: "sdlc-implement"
description: "Run Step 4 (Implementation) of the AIF-SDLC: tasks, code via TDD, and a review gate. The user commits and opens the PR."
argument-hint: "PP-US-01"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

This skill never commits, pushes, or opens the pull request — the user does.

1. **Parse args:** `US_ID` from `$ARGUMENTS`.

2. **Load context:** search `specs/*/sdlc.yaml` for the file whose `stories` map contains `{US_ID}`. Read it. Extract: `EPIC`, `JIRA_STORY`, `FEATURE_FOLDER`, `FEATURE_ID`, `SLUG`, story `TITLE`.
   - `EPIC` = the Jira Story's own parent Epic (`getJiraIssue(JIRA_STORY)` → `parent`). Epics may be split per team phase, so one feature can span several and the step Tasks live under the Story's Epic. Use `jira_epic` from sdlc.yaml only when the Story has no parent.
   - No match → STOP: "Run `/sdlc-init` for this feature, or add `{US_ID}` to its `stories` map."
   - `JIRA_STORY` empty → STOP: "Add the Jira Story key for `{US_ID}` to sdlc.yaml."

3. **Pre-flight:** verify all exist on the latest `develop`:
   - `{feature_folder}/spec.md` containing `{US_ID}`
   - `{feature_folder}/plan.md`
   - `{feature_folder}/test_cases.md` containing `{US_ID}` (Quality Step output — TDD needs the test cases)
   - Missing → STOP, name the step to run first, and remind the user to merge its branch into `develop`.
   - The **Quality Step Task is Done** (reviewed and accepted): JQL `project = OBMS AND issuetype = Task AND summary ~ "{US_ID}: Quality Step"`. `Ready For Review` / `In Review` → STOP: "The Quality Step is still in review; finish it with `/sdlc-quality {US_ID}` (confirm its review gate)." Other status or not found → STOP: "Run `/sdlc-quality {US_ID}` first." If Jira is unavailable, warn and continue.

4. **Jira & Git:** run `/sdlc-jira-task step="Implementation Step" us={US_ID} epic={EPIC} story={JIRA_STORY} branch_slug=implementation-step`. Capture `TASK_ID` (`unknown` if Jira is unavailable) and the branch name.

5. **Implementation work** (follow `aif-sdlc.md` §Step 4 rules):
   - spec-kit's scripts reject branches not named `NNN-name`, and OBMS branches are `feature/…`. Prefix every `.specify/scripts/bash/*.sh` command the speckit skills run with `SPECIFY_FEATURE={feature_id}-{slug} SPECIFY_FEATURE_DIRECTORY={feature_folder}` (e.g. `SPECIFY_FEATURE=013-customer-offer SPECIFY_FEATURE_DIRECTORY=specs/013-customer-offer .specify/scripts/bash/check-prerequisites.sh --json …`). Both are needed: without `SPECIFY_FEATURE_DIRECTORY` the scripts follow the local `.specify/feature.json` left by the last Spec Step, which may point at another feature. Each shell call starts fresh, so prefix every call.
   - The governing constitution is `.specify/memory/constitution.md` (not auto-loaded — read the sections relevant to this US first); tell `/speckit-analyze` and `/speckit-implement` to use it.
   - Snapshot `{feature_folder}/tasks.md` (if it exists) to a scratch folder.
   - Run `/speckit-tasks` for `{US_ID}` only, with this guidance: add a phase for `{US_ID}` to the existing `tasks.md` (create it if missing) and leave every existing task unchanged — the default skill would regenerate the whole file; TDD is requested, so generate the test tasks first (from `test_cases.md`); continue task numbering after the highest existing `T` ID.
   - Verify against the snapshot that every earlier task line is unchanged and the new IDs do not collide; restore and redo otherwise.
   - Run `/speckit-analyze` — resolve any CRITICAL gaps before proceeding
   - Run `/speckit-implement` for the `{US_ID}` tasks only (TDD: tests first, then code)
     - Pass this checklist-gate rule as guidance (the vendor skill is not edited): in `checklists/*.md`, `- [~]` means **Deferred** (gap acknowledged, fix postponed to the checklist backlog). Count it in the Total, report it in its own **Deferred** column, and never treat it as incomplete — only `- [ ]` is incomplete and blocks. The status table is `| Checklist | Total | Completed | Deferred | Incomplete | Status |`; PASS = 0 incomplete. If the gate stops on `- [ ]` items, ask the user as usual.
   - Run `/speckit-analyze` again — verify final implementation aligns with documentation

6. **Review gate:** self-check against [`aif-review-checklist.md` §Step 4](../../../aif-review-checklist.md#step-4--implementation-step--se-reviews): go through every item and mark it pass, fail (with the fix applied or proposed) or N/A, fixing what you can first. Then show the checked list, a summary of the changes (backend, frontend, migrations, tests), both `/speckit-analyze` reports and the test results, and ask the user to review. Apply requested changes.
   Before showing the review, run `/sdlc-jira-done {TASK_ID} to=ready` (Task → Ready For Review while you review; skip if `TASK_ID` is unknown).

7. **Jira Done:** once the user confirms the review, run `/sdlc-jira-done {TASK_ID}` (Ready For Review → In Review → Done). If the user asks for changes, apply them and repeat the review; the Task stays in Ready For Review. Skip if `TASK_ID` is unknown.

8. **Report:** `TASK_ID`, branch, files changed, and the next actions:
   - Commit, push, and open a pull request into `develop`. Title: `feat({TASK_ID}): {US_ID} {TITLE}` (e.g. `feat(OBMS-652): CO-US-03 Dismiss a CustomerOffer`; use `JIRA_STORY` if `TASK_ID` is unknown). The PR description includes a summary of changes, the constitution compliance check (`constitution.md`), and links to `spec.md` and `plan.md`.
   - After the PR is merged: `/sdlc-deploy {US_ID}`
