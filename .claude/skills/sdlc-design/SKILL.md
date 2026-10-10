---
name: "sdlc-design"
description: "Run Step 2 (Design, SE) of the AIF-SDLC for a User Story: Jira Task + branch, spec gap review, plan.md via /speckit-plan using the OBMS plan template, a requirements security checklist (checklists/security.md), SDS.md §5.x sync, and the plan.md self-check before handoff."
argument-hint: "PP-US-01"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Source of truth for Step 2 of the AIF-SDLC (overview: `aif-sdlc.md`). All paths are relative to the repo root. This skill never commits — the user reviews and commits.

1. **Parse args:** `US_ID` from the first token.

2. **Load context:** find the `specs/*/sdlc.yaml` whose `stories` map contains `US_ID`. Extract `EPIC`, `JIRA_STORY`, `FEATURE_FOLDER`, `FEATURE_ID`, `SLUG`, and the story `TITLE`.
   - `EPIC` = the Jira Story's own parent Epic (`getJiraIssue(JIRA_STORY)` → `parent`). Epics may be split per team phase, so one feature can span several and the step Tasks live under the Story's Epic. Use `jira_epic` from sdlc.yaml only when the Story has no parent.
   - `TITLE` (and the role) come from the US heading in `SRS.md` §7, the source of truth. If `stories.{US_ID}.title` in sdlc.yaml differs, use the SRS title and update sdlc.yaml in step 9 (not before the branch is created — the branch needs a clean tree).
   - Not found → STOP: "Run `/sdlc-init` first."
   - `JIRA_STORY` empty → STOP: "Add the Jira Story key for `{US_ID}` to sdlc.yaml."

3. **Pre-flight:**
   - The **Spec Step Task is Done** (reviewed and accepted): JQL `project = OBMS AND issuetype = Task AND summary ~ "{US_ID}: Spec Step"`. `Ready For Review` / `In Review` → STOP: "The Spec Step is still in review; finish it with `/sdlc-spec {US_ID}` (confirm its review gate)." Other status or not found → STOP: "Run `/sdlc-spec {US_ID}` first." If Jira is unavailable, warn and continue.
   - `{feature_folder}/spec.md` exists on the latest `develop` and contains `{US_ID}`.
   - Not found → STOP: "Run `/sdlc-spec {US_ID}` first and merge its branch into `develop`."

4. **Jira & Git:** run `/sdlc-jira-task step="Design Step" us={US_ID} epic={EPIC} story={JIRA_STORY} branch_slug=design-step`. Capture `TASK_ID` (`unknown` if Jira is unavailable).

5. **Spec review:** read `spec.md` and check it against [`aif-review-checklist.md` §Step 2](../../../aif-review-checklist.md#step-2--design-step--se-reviews) → *Pre-flight Gaps*; flag any ambiguities, missing domain objects, or API gaps.
   - If a gap is significant enough that the design cannot proceed safely, STOP — the fix belongs in `spec.md` first (`/sdlc-spec {US_ID}`), not patched forward in `plan.md`.

6. **UI Element ID check:** for every new interactive frontend element in this US, design its `id` following the existing element-ID convention in `SDS.md`/`plan.md` (e.g. `btn-action-entity`) so Playwright can target it reliably.

7. **Plan:** run `/speckit-plan` with this guidance as its user input:
   - Prefix every `.specify/scripts/bash/*.sh` call with `SPECIFY_FEATURE={feature_id}-{slug} SPECIFY_FEATURE_DIRECTORY={feature_folder}` (OBMS branches are `feature/…`, which spec-kit's branch check rejects). Each shell call starts fresh, so prefix every call.
   - `plan.md` follows `.specify/templates/plan-template.md`. The setup script seeds `plan.md` from it only when `plan.md` is missing; never re-copy or reformat an existing `plan.md`.
   - Governing rules — read these sections of `.specify/memory/constitution.md` first (it is not auto-loaded): Layer Architecture, Technology Stack Constraints, Simplicity Over Premature Scale, Guardrails and Observability; and the `CLAUDE.md` Layer Architecture / Critical Constraints sections.
   - **First US of the feature:** fill the feature header block (Feature name, `[CODE]`, Jira Epic, Spec link, SDS §5.x link) once, then fill the `## {US_ID}: {TITLE}` section.
   - **Later US:** if a section for `{US_ID}` already exists, update it in place; otherwise append a new `## {US_ID}: {TITLE}` section after the last US section, immediately before `## Complexity Tracking`. Do not touch, reformat, or renumber other US sections.
   - Fill every subsection from real analysis of `spec.md` and the codebase — no template placeholders left:
     - *Pre-flight: Spec Review Findings* — findings from step 5.
     - *Package layout* — only files new/modified for this US, each annotated `# new:` / `# modify:`, following the Layer Architecture (Routes → Services → Repositories → `AsyncSession`; Agents only for BusinessOutcome pipeline work; Providers for external/infra singletons).
     - *Domain objects* (mapped to `backend/app/models/domain/`) and *Business rules enforced in service layer* (`[CODE]-BR-NN`, each traced to an AC).
     - One Mermaid `sequenceDiagram` per distinct flow: happy path first, then one `alt` block per error/edge case. No AC/EC tags on the diagrams — traceability lives in the business rules table.
     - *Error flows*, *Constitution notes* (Satisfied / Required / Note), element IDs from step 6, *Open tasks* `T1, T2, …` in implementation order (repository → domain model → service → dependency wiring → route → frontend), each naming the files touched.
   - Every entity, relationship and term must match SRS §2 domain language verbatim. If a new Domain Entity is introduced, update the SDS §2.1 traceability table in the same edit.
   - If a constitution gate (e.g. Simplicity Over Premature Scale) is violated, add a row to the feature-level `## Complexity Tracking` table; never delete rows of other USs.
   - `plan.md` is self-contained: do not create `research.md`, `data-model.md`, `contracts/`, or `quickstart.md`, and do not edit `CLAUDE.md`.
   - Do not run the optional auto-commit hooks.
   - **Before running `/speckit-plan`, snapshot** `{feature_folder}/plan.md` (if it exists) and `CLAUDE.md` to a scratch folder.
   - **After `/speckit-plan`, verify against the snapshot:** no `research.md`, `data-model.md`, `quickstart.md` or `contracts/` exists in `{feature_folder}` (delete any that were created); `CLAUDE.md` matches the snapshot — if spec-kit added or changed a `<!-- SPECKIT START -->…<!-- SPECKIT END -->` block, remove only that block; `plan.md` changed only in the header block (first US) and the `{US_ID}` section. If anything else changed, restore it from the snapshot and tell the user. Never use `git checkout` for this — it would discard the user's uncommitted work.

8. **Security checklist:** right after `plan.md` is written and verified, run `/speckit-checklist security` for the feature. It checks the *requirements* (spec + plan) for security quality, never the implementation.
   - Prefix every `.specify/scripts/bash/*.sh` call with `SPECIFY_FEATURE={feature_id}-{slug} SPECIFY_FEATURE_DIRECTORY={feature_folder}`, as in step 7.
   - Do not ask the clarifying questions; apply these defaults: depth **Standard**, audience **Reviewer (PR)**, scope **`{US_ID}` only** (read only its `spec.md` and `plan.md` sections plus `SRS.md` §2/§6.4 where referenced). Focus areas: authentication, role authorization and data authorization (Brand / Site scope, ownership), input validation, sensitive data (credentials, tokens, PII, secrets and their redaction), audit logging, error disclosure, abuse and rate limiting, and the constitution gates that apply (DPS boundary, two-layer guardrails, HITL). Where the story is intentionally anonymous or has no login (e.g. storefront signals), the items check that this and the compensating controls are stated, not that a login exists.
   - **Output:** `{feature_folder}/checklists/security.md`, following `.specify/templates/checklist-template.md`. Create it if missing. If it exists, update this US's section in place; otherwise append a new `## {US_ID}: {TITLE}` section, continuing the `CHK###` numbering and leaving other US sections untouched. Never delete or reformat other content. `checklists/requirements.md` is not touched.
   - Tick `- [x]` an item only when `spec.md` or `plan.md` already states the requirement. Leave every other item unticked and tag it `[Gap]`, `[Ambiguity]` or `[Conflict]`. A significant gap in `spec.md` → STOP and send it back to `/sdlc-spec {US_ID}` (see step 5); a gap in the design → fix `plan.md` now and re-tick.
   - Do not run the optional auto-commit hooks. Create no other files (no `research.md`, `contracts/`, etc.).

9. **SDS.md sync:**
   - **First US of the feature:** if `SDS.md` has no `### 5.x` section for the feature yet, create it and its ToC entry (same number and name as SRS §7.x). Then add the plan link once, directly under the §5.x feature header, before any sub-section: `> Plan: [{feature_folder}/plan.md]({feature_folder}/plan.md)`
   - **Later US:** the plan link already exists — do not add it again.
   - If the SRS title differed from sdlc.yaml (step 2), update `stories.{US_ID}.title` now.
   - **Always:** create the US sub-section `#### 5.x.N {US_ID}: {TITLE} ({role spans})` (ID, title and role identical to the SRS entry; a sub-story uses `#####` and `5.x.N.M`) with ONLY a single-paragraph **Purpose** (what the US delivers and why). If it already exists with extra content (Scope, Preconditions, Functional Design, Main Flow, Alternative/Error Flows), trim it to the Purpose only — those are covered by `spec.md` and `plan.md`. Update the SDS "Last synced with SRS §7" line.

10. **Self-check:** go through every checklist embedded in `plan.md` for `{US_ID}` (Pre-flight Gaps, Technical Design, Data Modeling, Sequence Diagrams, API Design, Naming & Security, Cross-Document Sync). Tick a box only after verifying it against the content written in that section — never because the section merely exists. Fix any unresolved item now; the step is not complete while a box is unresolved.

11. **Review gate:** self-check against [`aif-review-checklist.md` §Step 2](../../../aif-review-checklist.md#step-2--design-step--se-reviews): go through every item and mark it pass, fail (with the fix applied or proposed) or N/A, fixing what you can first. Then show the checked list, the `plan.md` section, the `checklists/security.md` section (with any open items) and the SDS change, and ask the user to review. Apply requested changes.
   Before showing the review, run `/sdlc-jira-done {TASK_ID} to=ready` (Task → Ready For Review while you review; skip if `TASK_ID` is unknown).

12. **Jira Done:** once the user confirms the review, run `/sdlc-jira-done {TASK_ID}` (Ready For Review → In Review → Done). If the user asks for changes, apply them and repeat the review; the Task stays in Ready For Review. Skip if `TASK_ID` is unknown.

13. **Report:** `TASK_ID`, branch, `plan.md` and `checklists/security.md` paths (items ticked / open), confirmation that every checklist box is resolved, a reminder to commit, and the next step:
    ```
    /sdlc-quality {US_ID}
    ```
