---
name: "sdlc-jira-done"
description: "Move an SDLC step Task through review: `to=ready` puts it in Ready For Review while the user reviews the step; the default (`to=done`) walks it Ready For Review → In Review → Done once the user confirms. Called by the step skills (Spec/Design/Quality/Implementation/Deployment). NOT for the Verification Step, which has no Task."
argument-hint: "OBMS-236 [to=ready|done]"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

`$ARGUMENTS`: the step Task key (e.g. `OBMS-236`, the `TASK_ID` from `/sdlc-jira-task`) and an optional `to=ready|done` (default `done`).

OBMS Jira workflow (Tasks and Stories): `To Do` →(Start)→ `In Progress` →(Ready For Review)→ `Ready For Review` →(Review)→ `In Review` →(Done)→ `Done`; `In Review` →(Rework)→ `Rework`; `Blocked` and `Dismissed` from anywhere.

The user is the reviewer. A step skill calls this twice:
- `to=ready` — just before its Review gate: the Task shows **Ready For Review** while the user reviews.
- `to=done` — after the user confirms the review: the Task moves **Ready For Review → In Review → Done**.

If the Task key is missing or `TASK_ID` is unknown (Jira was unavailable), STOP — "Provide the TASK_ID, e.g. `/sdlc-jira-done OBMS-236`."

1. **Current status:** `getJiraIssue(TASK_ID)`.
   - Already at the target (`Ready For Review` for `to=ready`; `Done` for `to=done`) → print `{TASK_ID} already {status}` and return.
   - `Blocked` / `Dismissed` → STOP and report; do not change it.

2. **Walk the workflow** one transition at a time until the target status is reached:
   - `In Progress` or `Rework` → the transition whose target status (`to.name`) is `Ready For Review`.
   - `Ready For Review` → the transition whose target is `In Review` (named "Review") — only for `to=done`.
   - `In Review` → the transition whose target is `Done` — only for `to=done`.
   For each: `getTransitionsForJiraIssue(TASK_ID)` → pick by target status → `transitionJiraIssue`. If the needed transition is not available: list the available transitions with their target statuses and STOP — do not guess.

3. **Confirm:** print `{TASK_ID} → {final status}`.
