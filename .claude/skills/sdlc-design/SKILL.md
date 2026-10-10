---
name: "sdlc-design"
description: "Run Step 2 (Design, SE) of the PFM AIF-SDLC for a User Story: step branch, spec gap review, plan.md via /speckit-plan with the project plan template, a requirements security checklist (checklists/security.md), SDS.md §5.x sync, and the plan self-check."
argument-hint: "WM-US-01"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Source of truth for Step 2 (overview: `aif-sdlc.md` § Step 2). Paths are relative to the repo root. This skill never commits or merges.

1. **Parse args:** `US_ID` from the first token.

2. **Load context:** find the `specs/*/sdlc.yaml` whose `stories` map contains `US_ID`; extract `FEATURE_FOLDER`, `FEATURE_ID`, `SLUG`. The story `TITLE` and actor come from its heading in `SRS.md` §7 (the source of truth); if `sdlc.yaml` differs, update it in step 9.
   - None → STOP: "Run `/sdlc-init` first."

3. **Pre-flight (Step 1 is done on `develop`):** `{FEATURE_FOLDER}/spec.md` has a `## {US_ID}:` section and `SRS.md` has the `{US_ID}` entry on the latest `develop`. Otherwise STOP: "Run `/sdlc-spec {US_ID}` and merge its branch into `develop` first."

4. **Branch:** uncommitted changes → STOP. `git checkout develop`, `git pull origin develop` (skip offline), `git checkout -b feature/{us-lower}-design-step` (switch to it if it exists).

5. **Spec review:** read `spec.md` and check it against [`aif-review-checklist.md` § Step 2](../../../aif-review-checklist.md#step-2--design-step--se-reviews) → *Pre-flight Gaps*. Record every gap/ambiguity for `plan.md`'s Pre-flight table. A gap too significant to design around → STOP; the fix belongs in `spec.md` (`/sdlc-spec {US_ID}`), not patched forward in the plan.

6. **UI Element IDs:** for every new interactive element in this US, design its `id` per NC-04 (`[entity]-[field-name]`, `btn-submit-[entity]`, `message-success` / `message-error`, `table-[entity]`, …) — Step 3 (tests) and Step 4 (code) both run from this table.

7. **Plan:** run `/speckit-plan` with this guidance:
   - Prefix every `.specify/scripts/bash/*.sh` call with `SPECIFY_FEATURE={FEATURE_ID}-{SLUG} SPECIFY_FEATURE_DIRECTORY={FEATURE_FOLDER}` (PFM branches are `feature/…`, which spec-kit's branch check rejects; each shell call starts fresh, so prefix every call).
   - `plan.md` follows `.specify/templates/plan-template.md`: per-story `## {US_ID}: {TITLE}` section with **Pre-flight: Spec Review Findings**, **Decisions & Rationale**, **Domain Objects**, **API Contracts**, **Sequence Diagram**, **Business Rules Enforced**, **Element IDs**, **Quickstart Validation**, **Open tasks**; then the feature-level **Technical Context**, **Constitution Check**, **Project Structure**, **Complexity Tracking**. No sibling `research.md`, `data-model.md`, `contracts/` or `quickstart.md`. Never re-copy or reformat an existing `plan.md`.
   - Governing rules — read `.specify/memory/constitution.md` § Layered Architecture (AR-01..05), Technology Stack, Simplicity Over Premature Scale, Access Control (AC-01..04), API Design Standards (API-01..07), Naming Conventions, Frontend Conventions, Validation Rules, Logging & Audit, Security Requirements, Definition of Done.
   - **First US of the feature:** fill the header (feature, spec link, SDS §5.x link) and then the story section. **Later US:** update an existing `## {US_ID}` section in place, or append a new one after the last story section and before `## Technical Context`; never touch other stories' sections.
   - Fill every subsection from real analysis of `spec.md` and the code — no template placeholders left:
     - Pre-flight gaps from step 5, each with its resolution.
     - Domain Objects mapped to Django apps/models/tables; entity and field names verbatim from SRS §2 (NC-01); respect the documented "Known open drift" (no `uuid` PK in one app only). A new entity → a new Django app and an SDS §2.1 row in the same edit.
     - API Contracts per endpoint (request fields, status/body table mapped to AC/EC) following API-01..07: DRF-native shapes, explicit action endpoints for transitions, catalogued SDS §6.6 error codes (a new code is added to §6.6 in the same change), paginated lists.
     - Service-layer decision per AR-01 (a plain `[app]/services.py` function only when the use case spans >1 model, has a rule beyond field validation, or side effects); `transaction.atomic()` for multi-model writes (AR-05); thin views (AR-02); no Repository class (AR-03); explicit serializer `fields` (AR-04).
     - One Mermaid `sequenceDiagram`: Happy → Alternative → Negative `alt` blocks, each tagged with its AC/EC; **no** queries, bodies or UI copy (`aif-sdlc.md` § Sequence Diagram Conventions).
     - Constitution Check rows for every principle the design touches — including **Logging & Audit** and **Security Requirements**, not only the layering ones.
     - Open tasks `T1, T2, …` in implementation order (model/migration → serializer → service/view → URL wiring → frontend → tests → doc sync), each naming the files.
   - A constitution violation → a row in `## Complexity Tracking`; never delete other stories' rows.
   - **Snapshot before:** copy `{FEATURE_FOLDER}/plan.md` (if present) and `CLAUDE.md` to the scratchpad. **Verify after:** no stray `research.md`/`data-model.md`/`quickstart.md`/`contracts/`; `CLAUDE.md` unchanged (remove only a `<!-- SPECKIT START -->…<!-- SPECKIT END -->` block the skill added); `plan.md` changed only in the header (first US) and the `{US_ID}` section. Restore from the snapshot otherwise — never `git checkout`.
   - Do not run auto-commit hooks.

8. **Security checklist:** run `/speckit-checklist security` for the feature. It checks the *requirements* (spec + plan), never the code. Prefix script calls as in step 7. Skip the clarifying questions and use: depth **Standard**, audience **Reviewer**, scope **`{US_ID}` only**. Focus: authentication (JWT, public vs protected route), role authorization (ADMIN / USER / both — AC-01/AC-02), ownership scoping and `404`-for-not-yours (AC-03), input validation (VL-01..05), sensitive data (passwords, JWTs, never in a response, a log or a URL — AC-04), logging of auth events and state changes (Logging & Audit), error disclosure (generic errors, no enumeration), abuse (rate limiting is out of scope unless the spec says otherwise — the item checks that this is stated), and the Security Requirements (no secrets in source).
   - Output `{FEATURE_FOLDER}/checklists/security.md` per `.specify/templates/checklist-template.md`: create it if missing, otherwise update this US's section in place or append `## {US_ID}: {TITLE}` (continue `CHK###` numbering; never touch other sections or `requirements.md`).
   - Tick `- [x]` an item only when `spec.md` or `plan.md` already states the requirement; tag every other item `[Gap]`, `[Ambiguity]` or `[Conflict]` and leave it unticked. A significant spec gap → STOP and send it to `/sdlc-spec {US_ID}`; a design gap → fix `plan.md` now and re-tick.

9. **SDS.md sync:** first US → ensure the `### 5.x` section and ToC entry exist (same number/name as SRS §7.x) and add the plan link **once** under the header: `> Plan: [{FEATURE_FOLDER}/plan.md]({FEATURE_FOLDER}/plan.md)`. Always → create `#### 5.x.N {US_ID}: {TITLE} ({ACTOR}) [MVP]` (identical to the SRS heading; sub-story `#####`/`5.x.N.M`) with **only** a one-paragraph **Purpose**; trim any existing extra content (Scope, Flows) — it is covered by `spec.md` and `plan.md`. Keep the SDS ToC 1:1 with the SRS ToC; update the "Last synced" line; update `sdlc.yaml` if the title changed.

10. **Self-check:** go through every checklist embedded in `plan.md` for `{US_ID}` and tick a box only after verifying it against what was written. Fix unresolved items now.

11. **Review gate:** go through [`aif-review-checklist.md` § Step 2](../../../aif-review-checklist.md#step-2--design-step--se-reviews) item by item. Show the checked list, the `plan.md` section, the `checklists/security.md` section (with open items) and the SDS change, and ask the user to review. Apply changes and repeat.

12. **Report:** the branch, `plan.md` and `checklists/security.md` paths (items ticked / open), a reminder to commit and merge into `develop`, and:
    ```
    /sdlc-quality {US_ID}
    ```
