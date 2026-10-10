---
name: "sdlc-spec"
description: "Run Step 1 (Spec, BA) of the AIF-SDLC for a User Story: Jira Task + branch, SRS §7 entry and ToCs, spec.md and its requirements checklist via /speckit-specify, and a review gate before closing the Task."
argument-hint: "PP-US-01 title=\"Story Title\" actor=ADMIN goal=\"what actor wants\" reason=\"business value\" ac=\"AC1|AC2|AC3\""
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Source of truth for Step 1 of the AIF-SDLC (overview: `aif-sdlc.md`). All paths are relative to the repo root. This skill never commits — the user reviews and commits.

1. **Parse args:** first token = `US_ID` (e.g. `PP-US-01`). Remaining key=value pairs: `title`, `actor`, `goal`, `reason`, `ac` (pipe-separated ACs).
   - `actor` is one or more of the roles defined in `SRS.md` / `constitution.md` (e.g. `ADMIN`, `BRAND_ADMIN`).
   - If any field is missing, ask for it before proceeding.

2. **Load context:** find the `specs/*/sdlc.yaml` whose `story_prefix` matches the prefix of `US_ID` (or whose `stories` map contains `US_ID`). Extract `EPIC`, `JIRA_STORY` (`stories.{US_ID}.jira_story`), `FEATURE_FOLDER`, `FEATURE_ID`, `SLUG`.
   - `EPIC` = the Jira Story's own parent Epic (`getJiraIssue(JIRA_STORY)` → `parent`). Epics may be split per team phase, so one feature can span several and the step Tasks live under the Story's Epic. Use `jira_epic` from sdlc.yaml only when the Story has no parent.
   - No sdlc.yaml found → STOP: "Run `/sdlc-init` first."
   - `JIRA_STORY` missing → STOP: "Add the story with `/sdlc-init feature_folder={feature_folder} epic={EPIC} prefix={prefix} stories={US_ID}:OBMS-NNN`."

3. **Jira & Git:** run `/sdlc-jira-task step="Spec Step" us={US_ID} epic={EPIC} story={JIRA_STORY} branch_slug=spec-step`. Capture `TASK_ID` (`unknown` if Jira is unavailable).

4. **Update sdlc.yaml** (after the branch exists, so the step starts from a clean tree): set `stories.{US_ID}.title` from `title` if not already set.

5. **Spec work** (`SRS.md` §7; read `.specify/memory/constitution.md` §User Story Conventions and §Feature Derivation Method first — it is not auto-loaded):
   - **If `{feature_folder}/spec.md` does NOT exist yet** (first US of the feature):
     - If the feature has no `### 7.x` section in `SRS.md` yet, create it (next free number, feature name, one-line purpose) and its SRS ToC entry, plus the matching `### 5.x` section and ToC entry in `SDS.md`. Check that the feature traces to an SRS §2 entity or a §6 flow step (constitution → Feature Derivation Method); STOP and ask if it does not.
     - Add the spec link once, directly under the §7.x feature header, before any US entry: `> Spec: [{feature_folder}/spec.md]({feature_folder}/spec.md)`
   - **If `spec.md` already exists:** the spec link is already on the feature header — do not add it again.
   - **Always:**
     - If the US entry already exists in `SRS.md` (re-running the step), update it in place instead of adding a second one; same for its ToC rows.
     - Otherwise add the US entry under the feature section, matching the existing headings exactly (Jira link, US ID, title, colour-coded role spans, anchor):
       ```
       #### 7.x.N [{JIRA_STORY}](https://globee-software-ecommerce.atlassian.net/browse/{JIRA_STORY}): {US_ID}: {title} ({actor spans}) <a id="7xn-{us-id-lowercase}-{title-slug}-{actor-slug}"></a>

       **As a/an** {actor}, **I want to** {goal} **so that** {reason}.
       ```
       A sub-story (e.g. `XX-US-01.1`) uses `#####` and number `7.x.N.M`.
     - Update the SRS §7 Table of Contents and the SDS §5 Table of Contents in the same edit.
     - Do not put an AC block in `SRS.md` — ACs live in `spec.md` only. Never put a spec link under a US entry.
   - **Before running speckit, snapshot** the files it may touch: copy `{feature_folder}/spec.md`, `{feature_folder}/checklists/requirements.md` (those that exist) to a scratch folder, and note `git status --porcelain -- {feature_folder}`.
   - Run `/speckit-specify` with the story statement and ACs, plus this guidance:
     - `SPECIFY_FEATURE_DIRECTORY={feature_folder}`
     - The git branch was already created in step 4 — do not create another one.
     - If `spec.md` already exists, append this US as a `## {US_ID}: {title} ({actor})` section — or update that section in place if it already exists; do not re-copy the template or touch other USs.
     - Follow the `.specify/templates/spec-template.md` structure only: do not add Functional Requirements or Success Criteria sections; mark checklist items about them N/A.
     - Use `.specify/templates/spec-ac-ec-template.md` for CRUD-style ACs and edge cases.
     - Do not run the optional auto-commit hooks.
     - Spec quality checklist `{feature_folder}/checklists/requirements.md`: create it if missing; if it exists, append (or update) a `## {US_ID}: {title}` section for this US and leave earlier sections untouched. Tick every item `[x]`; an item that does not apply is ticked with `(N/A — reason)`, since `/speckit-implement` stops on unticked items. Do not create per-US checklist files.
   - **After `/speckit-specify`, verify against the snapshot** (not against git, which misses uncommitted and untracked work): other USs' sections in `spec.md` and earlier sections of `checklists/requirements.md` are unchanged, and `git status --porcelain -- {feature_folder}` shows no new file other than `spec.md` and `checklists/requirements.md`. If not, restore the lost content from the snapshot, redo the append, and tell the user. Never use `git checkout` for this — it would discard the user's uncommitted work.

6. **Review gate:** self-check against [`aif-review-checklist.md` §Step 1](../../../aif-review-checklist.md#step-1--spec-step--ba-reviews): go through every item and mark it pass, fail (with the fix applied or proposed) or N/A, fixing what you can first. Then show the checked list, the SRS entry, the `spec.md` section and this US's section of `checklists/requirements.md`, and ask the user to review. Apply requested changes.
   Before showing the review, run `/sdlc-jira-done {TASK_ID} to=ready` (Task → Ready For Review while you review; skip if `TASK_ID` is unknown).

7. **Jira Done:** once the user confirms the review, run `/sdlc-jira-done {TASK_ID}` (Ready For Review → In Review → Done). If the user asks for changes, apply them and repeat the review; the Task stays in Ready For Review. Skip if `TASK_ID` is unknown.

8. **Report:** `TASK_ID`, branch, `spec.md` and `checklists/requirements.md` paths, a reminder to commit both, and the next step:
   ```
   /sdlc-design {US_ID}
   ```
