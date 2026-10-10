---
name: "sdlc"
description: "Orchestrator: detect the current SDLC step for a User Story from Jira state and run it automatically."
argument-hint: "PP-US-01"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

1. **Parse args:** `US_ID` from `$ARGUMENTS`.

2. **Load context:** search `specs/*/sdlc.yaml` for the file whose `stories` map contains `{US_ID}`. Read it. Extract: `EPIC`, `JIRA_STORY`, `FEATURE_FOLDER`.
   - `EPIC` = the Jira Story's own parent Epic (`getJiraIssue(JIRA_STORY)` → `parent`). Epics may be split per team phase, so one feature can span several and the step Tasks live under the Story's Epic. Use `jira_epic` from sdlc.yaml only when the Story has no parent.
   - No match → STOP: "Run `/sdlc-init` for this feature, or add `{US_ID}` to its `stories` map."
   - `JIRA_STORY` empty → STOP: "Add the Jira Story key for `{US_ID}` to sdlc.yaml."
   - Jira unavailable → STOP: "`/sdlc` reads progress from Jira; connect the Atlassian connector, or run the step skill directly."

3. **Query Jira state for all 6 steps** (in order):

   | Step | Jira Task summary to look up |
   |---|---|
   | 1 Spec | `{US_ID}: Spec Step` |
   | 2 Design | `{US_ID}: Design Step` |
   | 3 Quality | `{US_ID}: Quality Step` |
   | 4 Implementation | `{US_ID}: Implementation Step` |
   | 5 Deployment | `{US_ID}: Deployment Step` |
   | 6 Verification | via `JIRA_STORY` status (not a Task ticket) |

   For steps 1–5: JQL `project = OBMS AND issuetype = Task AND summary ~ "{summary}"`. Look the Task up project-wide, not under the Epic: a Story may move to another phase Epic after its Tasks exist. Older tickets may carry an `OBMS-` prefix (`OBMS-CO-US-03: Spec Step`); Jira's `~` text match finds both forms.
   For step 6: `getJiraIssue(JIRA_STORY)` → Story `Done` → `Done`; Story `Ready For Review` or `In Review` → `Awaiting QC` (verified, QC still has to close it); Story `Rework` / `Blocked` / `Dismissed` → that status; any other Story status (e.g. `In Progress` while earlier steps run) → `Missing` (Verification not started).

   OBMS Jira workflow (Tasks and Stories): `To Do` →(Start)→ `In Progress` →(Ready For Review)→ `Ready For Review` →(Review)→ `In Review` →(Done)→ `Done`; `In Review` →(Rework)→ `Rework`; `Blocked` and `Dismissed` from anywhere.

   Classify each step from its Task status:
   - `Done` — reviewed and accepted.
   - `In review` — Task is `Ready For Review` or `In Review`: the step's work is done and its Review gate is waiting for the user's confirmation.
   - `Rework` — the reviewer sent it back; the step must be run again.
   - `In Progress`, `To Do`, `Blocked`, `Dismissed` — as named.
   - `Missing` — no Task found.

4. **Print current state** as a one-line summary:
   ```
   PP-US-01: Spec ✓  Design ✓  Quality →  Impl –  Deploy –  Verify –
   ```

5. **Determine next action:**

   - **All steps Done:** "All 6 steps complete for `{US_ID}`. Story is closed." STOP.
   - **Steps 1–5 Done and Verification `Awaiting QC`:** "Verification is done for `{US_ID}`; waiting for QC to close {JIRA_STORY}." STOP.
   - **Any step `Blocked` or `Dismissed`:** STOP — "Step N ({step name}) is {status} ({key}); resolve it in Jira first."
   - **Any step `In review`:** ask — "Step N ({step name}) is waiting for your review ({key} is {Jira status}). Resume its Review gate? [y/N]". If confirmed, run that step skill; it resumes at the Review gate and moves the Task to Done once you confirm.
   - **Any step `Rework`:** ask — "Step N ({step name}) was sent back for rework ({key}). Run it again? [y/N]". If confirmed, go to step 6 with that step.
   - **Any step `In Progress`:** ask user to confirm before resuming — "Step N ({step name}) is already In Progress (TASK_ID = {key}). Resume it? [y/N]". If confirmed, go to step 6 with that step.
   - **Otherwise:** `NEXT_STEP` = first step with state `Missing` or `To Do`.

6. **Pre-flight gate — enforce sequence:**
   - All steps *before* `NEXT_STEP` must be `Done` (the step skill also checks that their output is on the latest `develop`).
   - If any prior step is not Done: STOP — "Complete Step N ({step name}) first: run `/sdlc-{step-slug} {US_ID}`."

7. **Map step → skill and execute:**

   | Step | Skill |
   |---|---|
   | 1 Spec | `/sdlc-spec` *(requires user to provide title/actor/goal/reason/ac — prompt for them first)* |
   | 2 Design | `/sdlc-design` |
   | 3 Quality | `/sdlc-quality` |
   | 4 Implementation | `/sdlc-implement` |
   | 5 Deployment | `/sdlc-deploy` |
   | 6 Verification | `/sdlc-verify` |

   For Step 1 (Spec): before executing, prompt the user for `title`, `actor`, `goal`, `reason`, and `ac` if not already in `sdlc.yaml` or `$ARGUMENTS`.

   Execute the skill with `US_ID` (and any extra args for Spec step).

8. **After the skill completes:** re-query Jira for `{US_ID}` and print the updated status row:
   ```
   PP-US-01: Spec ✓  Design ✓  Quality ✓  Impl –  Deploy –  Verify –
   Next: /sdlc-implement PP-US-01
   ```
