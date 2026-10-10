---
name: "sdlc-spec"
description: "Run Step 1 (Spec, BA) of the PFM AIF-SDLC for a User Story: step branch, SRS §7 entry and ToCs, spec.md and its requirements checklist via /speckit-specify, and a review gate."
argument-hint: "WM-US-01 title=\"Create a Wallet\" actor=USER goal=\"what the actor wants\" reason=\"business value\" ac=\"AC 1|AC 2|AC 3\""
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Source of truth for Step 1 of the AIF-SDLC (overview: `aif-sdlc.md` § Step 1). Paths are relative to the repo root. This skill never commits or merges — the user reviews, commits, and merges the step branch into `develop`.

1. **Parse args:** first token = `US_ID` (e.g. `WM-US-01`); then `title`, `actor`, `goal`, `reason`, `ac` (pipe-separated). `actor` is `ADMIN`, `USER`, or both (`SRS.md` §1.5). Ask for anything missing.

2. **Load context:** find `specs/*/sdlc.yaml` whose `story_prefix` matches the US prefix (or whose `stories` map has `US_ID`). Extract `FEATURE_FOLDER`, `FEATURE_ID`, `SLUG`.
   - None → STOP: "Run `/sdlc-init` first."

3. **Branch** (aif-sdlc branching rule — every step branches from an up-to-date `develop`):
   - Uncommitted changes → STOP: "Commit or stash your changes first."
   - `git checkout develop`, `git pull origin develop` (skip the pull if there is no network/remote), `git checkout -b feature/{us-lower}-spec-step` (`{us-lower}` = lower case, `.` → `-`, e.g. `feature/wm-us-01-spec-step`). If the branch exists, switch to it.

4. **sdlc.yaml:** add `stories.{US_ID}` with `title` and `actor` if missing.

5. **Spec work** — first read `.specify/memory/constitution.md` § User Story Conventions, § Feature Derivation Method and § Cross-Document Consistency (the constitution is **not** auto-loaded by `CLAUDE.md`; these hold the numbering, ToC and traceability rules):
   - **First US of the feature** (`{FEATURE_FOLDER}/spec.md` missing):
     - If `SRS.md` has no `### 7.x` section for the feature, create it (next free number, feature name with its `({PREFIX})`, one-line purpose) plus its SRS ToC entry, and the matching `### 5.x` section and ToC entry in `SDS.md`. The feature must trace to an SRS §2 entity or a §6 flow step — otherwise STOP and ask.
     - Add the spec link **once**, directly under the `### 7.x` header: `> Spec: [{FEATURE_FOLDER}/spec.md]({FEATURE_FOLDER}/spec.md)`.
   - **Later US:** the spec link already exists — do not add it again.
   - **Always:**
     - Add the US under the feature in `SRS.md`, matching the existing headings exactly, then update the SRS ToC **and** the SDS §5 ToC in the same edit (names and IDs identical in both, including a trailing ` [MVP]` when the story is MVP scope — ask if unsure):
       ```
       #### 7.x.N {US_ID}: {title} ({ACTOR}) [MVP]

       **As a/an** {ACTOR}, **I want to** {goal} **so that** {reason}.
       ```
       A sub-story (`XX-US-01.1`) uses `#####` and number `7.x.N.M`. If the entry already exists (re-running the step), update it in place.
     - **No ACs in `SRS.md`** — only the story statement; remove an existing AC block for this US (the ACs live in `spec.md`). Never put a spec link under a US entry.
   - **Snapshot before `/speckit-specify`:** copy `{FEATURE_FOLDER}/spec.md` and `{FEATURE_FOLDER}/checklists/requirements.md` (those that exist) to the scratchpad.
   - Run `/speckit-specify` with the story and ACs, plus this guidance:
     - `SPECIFY_FEATURE_DIRECTORY={FEATURE_FOLDER}`; the branch already exists — create no other.
     - Existing `spec.md`: append a `## {US_ID}: {title} ({ACTOR})` block (or update it in place); do not re-copy the template or touch other stories.
     - Follow `.specify/templates/spec-template.md` only — metadata blockquote, Overview, per-story block with `Feature group` and inline-code actor, bold hard-break Given/When/Then, the 7 mandatory Edge Case categories (omitted ones justified in a comment), Scope Boundary. **No** Functional Requirements, Success Criteria, Priority or Independent Test sections. Use `.specify/templates/spec-ac-ec-template.md` for CRUD-style ACs/ECs.
     - No technology names, endpoint paths, table/field names or token formats in ACs; no banned vague words (see the template).
     - Do not run auto-commit hooks.
     - `{FEATURE_FOLDER}/checklists/requirements.md`: create it if missing, otherwise review it against the spec as it now stands. Tick every item `[x]`; an item that does not apply is ticked with `N/A — reason` (`/speckit-implement` stops on unticked items).
   - **After `/speckit-specify`, verify against the snapshot** (not git, which would miss uncommitted work): other stories' sections are unchanged and no new file appeared in `{FEATURE_FOLDER}` besides `spec.md` and `checklists/requirements.md`. Otherwise restore from the snapshot and tell the user. Never use `git checkout` for this.

6. **Review gate:** go through [`aif-review-checklist.md` § Step 1](../../../aif-review-checklist.md#step-1--spec-step--ba-reviews) item by item (pass / fail with the fix applied / N/A), fixing what you can first. Show the checked list, the SRS entry, the `spec.md` section and the requirements checklist, and ask the user to review. Apply requested changes and repeat.

7. **Report:** the branch, the files changed (`SRS.md`, `SDS.md` ToC, `spec.md`, `checklists/requirements.md`, `sdlc.yaml`), a reminder to commit and merge the branch into `develop`, and the next step:
   ```
   /sdlc-design {US_ID}
   ```
