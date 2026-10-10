---
name: "sdlc-jira-task"
description: "Reusable Jira task setup for any SDLC step: get-or-create task ticket, assign to current user, add to active sprint, transition to In Progress, link to block the US Story, and (with `branch_slug`) create the step's git branch. Call this at the start of any SDLC step that has a task ticket."
argument-hint: "step=\"Spec Step\" us=PP-US-01 epic=OBMS-100 story=OBMS-101 [branch_slug=spec-step]"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Parse the following key=value fields from `$ARGUMENTS`:

| Field | Required | Example |
|---|---|---|
| `step` | yes | `Spec Step` |
| `us` | yes | `PP-US-01` |
| `epic` | yes | `OBMS-100` |
| `story` | yes | `OBMS-101` |
| `branch_slug` | no | `spec-step` — when given, step 7 creates the git branch |

If any required field other than `branch_slug` is missing, STOP and list the missing fields.

If the Atlassian tools are unavailable (not connected or not authorised), skip steps 1–6, warn the user that the Jira ticket must be updated by hand, set `TASK_ID = unknown`, and continue with step 7 so the calling step skill can carry on.

1. **Get current user:**
   - `atlassianUserInfo()` → extract `accountId` as `CURRENT_USER_ACCOUNT_ID`

2. **Get active sprint:**
   - `searchJiraIssuesUsingJql: project = OBMS AND sprint in openSprints() (fields: ["customfield_10020"])`
   - From the first result's `customfield_10020`, take the sprint whose `state` is `active` as `SPRINT_ID` (the field also lists closed sprints).
   - No open sprint → leave `SPRINT_ID` empty, skip the sprint part of step 4, and warn the user.

3. **Get or create task ticket:**
   - JQL: `project = OBMS AND issuetype = Task AND summary ~ "{us}: {step}"`. Look the Task up project-wide, not under the Epic: a Story may move to another phase Epic after its Tasks exist. Older tickets may carry an `OBMS-` prefix (`OBMS-CO-US-03: Spec Step`); Jira's `~` text match finds both forms.
   - **Found:** `TASK_ID` = existing ticket key
   - **Not found:** `createJiraIssue(summary: "{us}: {step}", type: Task, parent: {epic}, assignee: CURRENT_USER_ACCOUNT_ID)` → `TASK_ID`

4. **Ensure assignee and sprint** *(idempotent — safe even if ticket already existed):*
   - `editJiraIssue(TASK_ID, assignee: CURRENT_USER_ACCOUNT_ID, customfield_10020: SPRINT_ID)`

5. **Transition to In Progress:** OBMS Jira workflow (Tasks and Stories): `To Do` →(Start)→ `In Progress` →(Ready For Review)→ `Ready For Review` →(Review)→ `In Review` →(Done)→ `Done`; `In Review` →(Rework)→ `Rework`; `Blocked` and `Dismissed` from anywhere.
   - Already `In Progress` → skip this step (re-running or resuming a step).
   - `Ready For Review` / `In Review` → the step stopped during its review: skip this step and tell the calling skill to resume at its Review gate.
   - `Done` → STOP: "{TASK_ID} is already Done: this step is finished."
   - `Blocked` / `Dismissed` → STOP and report the status; do not change it.
   - Otherwise (`To Do`, `Rework`): `getTransitionsForJiraIssue(TASK_ID)` → pick the transition whose target status (`to.name`) is `In Progress` (from `To Do` it is named "Start"). If none: list the available transitions with their target statuses and STOP — do not guess.
   - `transitionJiraIssue(TASK_ID, transition_id)`

6. **Link to block the US Story:**
   - `getIssueLinkTypes()` → find "Blocks" link type ID
   - `createIssueLink(inwardIssue: {story}, outwardIssue: TASK_ID, linkType: "Blocks")`
   - Skip if this link already exists (re-running a step must not create a duplicate link).

7. **Create the git branch** (only when `branch_slug` is given), following `CLAUDE.md` → Branch naming. Every step branch starts from the latest `develop`, after the previous step's branch has been merged:
   - Uncommitted changes in the working tree → STOP: "Commit or stash your changes first."
   - `git fetch origin develop`
   - `git checkout -b feature/{task-id-lowercase}-{us-lowercase}-{branch_slug} origin/develop`
     - `{us-lowercase}` replaces `.` with `-` (e.g. `PP-US-12.1` → `pp-us-12-1`)
     - Example: `feature/obms-235-pp-us-01-design-step`
   - If `TASK_ID` is unknown (Jira unavailable), use `{story-lowercase}` in place of `{task-id-lowercase}`.
   - If the branch already exists, switch to it instead: `git checkout feature/...`

8. **Confirm:** print `TASK_ID = {TASK_ID}` (or `unknown`) and the branch name (if created) before returning.
