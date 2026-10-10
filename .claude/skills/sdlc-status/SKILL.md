---
name: "sdlc-status"
description: "Show the SDLC step completion status for all User Stories in a feature (or all features)."
argument-hint: "[feature_folder=specs/NNN-slug] — omit to show all features"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

1. **Determine scope:**
   - If `$ARGUMENTS` provides `feature_folder=...`: read only that `sdlc.yaml`
   - If `$ARGUMENTS` is a bare path like `specs/003-personalisation-plan`: read that `sdlc.yaml`
   - If `$ARGUMENTS` is empty: find all `specs/*/sdlc.yaml` files
   - Jira unavailable → STOP: "The status table is built from Jira; connect the Atlassian connector first."

2. **For each `sdlc.yaml` found, for each story in the `stories` map:**

   Each Story's step Tasks live under the Story's own parent Epic, which may differ from `jira_epic` in sdlc.yaml (Epics can be split per team phase). Use two queries per feature:
   1. Stories and their Epics: `key in ({all non-empty jira_story keys})` with fields `["parent", "status"]` → `EPICS` = the distinct parent keys plus `jira_epic`. Stories with an empty `jira_story` are listed with `?` in every column and a note to add the key.
   2. Step Tasks: `parent in ({EPICS}) AND issuetype = Task AND summary ~ "Step"`, then match each ticket to a story and step by its summary `{US_ID}: {Step} Step`. Page through all results (`nextPageToken`) — a large feature has 50+ Tasks.
   Steps (in order): Spec, Design, Quality, Implementation, Deployment. Older tickets may carry an `OBMS-` prefix (`OBMS-CO-US-03: Spec Step`); match both forms.

   Verification has no task ticket — it is tracked on the US Story itself (from query 1): Story `Done` → Verify `✓`; Story `Ready For Review` or `In Review` → Verify `◐`; Story `Rework` → `↺`; `Blocked` → `⊘`; `Dismissed` → `✗`; anything else → Verify `–`.

   Map each Task status to a symbol (OBMS workflow: To Do → In Progress → Ready For Review → In Review → Done, with Rework, Blocked, Dismissed):
   - `✓` = Done (reviewed and accepted)
   - `◐` = Ready For Review or In Review — work done, waiting for the user to confirm the step's review (for Verify: waiting for QC to close the Story)
   - `→` = In Progress
   - `↺` = Rework — sent back by the reviewer
   - `⊘` = Blocked
   - `✗` = Dismissed
   - `○` = To Do
   - `–` = ticket not found (step not started)

3. **Render the status table** for each feature:

   ```
   Feature: 003-personalisation-plan  (OBMS-100)  deploy: develop
   ─────────────────────────────────────────────────────────────────────────
   Story       │ Spec  │ Design │ Quality │ Impl  │ Deploy │ Verify │ Story
   ─────────────────────────────────────────────────────────────────────────
   PP-US-01    │ ✓     │ ✓      │ ✓       │ ✓     │ ✓      │ ✓      │ Done
   PP-US-02    │ ✓     │ ✓      │ ✓       │ ✓     │ ✓      │ ◐      │ Ready For Review
   PP-US-03    │ ✓     │ ◐      │ –       │ –     │ –      │ –      │ In Progress
   PP-US-04    │ ↺     │ –      │ –       │ –     │ –      │ –      │ In Progress
   ─────────────────────────────────────────────────────────────────────────
   Legend: ✓ Done  ◐ Ready For Review / In Review  → In Progress  ↺ Rework  ⊘ Blocked  ✗ Dismissed  ○ To Do  – Not created  ? no Jira key
   ```

   The rightmost column shows the Jira Story ticket status (not a task).

4. **For any story with an In Progress or Rework step:** print the `TASK_ID` and the skill to run, e.g.:
   ```
   PP-US-04 → Spec Step sent back for rework (OBMS-240). Run again: /sdlc-spec PP-US-04
   ```

5. **For any story waiting on someone else:** say who, e.g.:
   ```
   PP-US-03 → Design Step waiting for review confirmation (OBMS-236 is Ready For Review). Finish it: /sdlc-design PP-US-03
   PP-US-02 → Verification done, waiting for QC to close OBMS-107.
   PP-US-05 → Implementation Step Blocked (OBMS-250). Resolve it in Jira.
   ```

6. **For any story whose previous step is Done and next step is not started:** suggest the command to run:
   ```
   PP-US-01 next step: Design. Run: /sdlc-design PP-US-01
   ```

7. **Summary line:**
   ```
   3 features · 8 stories · 3 fully verified · 2 waiting for review · 2 in progress · 1 not started
   ```
