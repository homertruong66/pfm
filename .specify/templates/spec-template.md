<!--
STRUCTURE
H1 feature → H2 "Overview" (optional sub-sections) → H2 per User Story (### Acceptance
Criteria, ### Edge Cases) → H2 "Scope Boundary" (optional). No wrapper heading like
"## User Scenarios & Testing".

PLACEHOLDER SYNTAX: always use square brackets, e.g. `[Feature Name]`, `[ROLE]`,
`[YYYY-MM-DD]` — never bare angle brackets `<Feature Name>`. Angle-bracket text
outside of inline code gets parsed as an HTML tag by GitHub, Bitbucket, and most
markdown previewers and silently disappears on render.

METADATA (document level) — blockquote, in this order:
  Prefix, SRS, Created, Updated
GRM section numbers: feature specs live in SRS §7 (Features and User Stories),
Business Flows in SRS §6. `N` is a placeholder for the subsection number — fill it in
(e.g. `§7.5`, `§6.3`) and match the link anchor to it. Same for the `Feature group`
value.

METADATA (per User Story) — blockquote, in this order:
  Feature group, and Enhancement to (sub-stories only)
No `Actor` field — actor lives ONLY in the `As a` statement, written as inline code
(`ADMIN`, `HR`, ...) so it stays grep-able. The statement is the single source of
truth for actor — list every actor that triggers this behavior, never "etc." or
"and others".

MACHINE ACTOR (`SYSTEM`, `EXTERNAL SYSTEM`): allowed only when no human triggers the
behavior. `so that` must still name the human beneficiary.

OVERVIEW SUB-SECTIONS — all optional except Feature Summary. Include a sub-section
only when the trigger condition is met; delete the heading entirely otherwise (do not
leave it empty):
  - Feature Summary (always present, 2-4 sentences, WHAT only — no HOW)
  - Key Domain Entities: only if the feature introduces >=1 business noun that isn't
    self-explanatory or not already defined in the shared SRS glossary
  - Business Flows: only if this feature is linked to >=1 named Business Flow already
    defined in SRS §6 Business Flows. List only the Business Flow ID, name, and SRS
    link — the actual flowchart/diagram lives in SRS, not in spec.md. Do not embed a
    mermaid diagram here.

EDGE CASE DEFAULT LABELS: the 7 EC rows below the template's EC-01..EC-07 (empty/null,
boundary values, concurrency, access control, dependency timeout, multi-language/
currency, AI error) are the MANDATORY categories to scan for every US — do not skip a
category. The wording of each short desc IS adaptable to the feature's context (e.g.
"Empty skill list" instead of "Empty/null state" reads better for Skill Management) as
long as it still maps to that category. Don't feel locked into the literal default text.

ACCEPTANCE CRITERIA / EDGE CASES
  - Bullet `-`, never numbered list or checkbox
  - Stable ID per US: `AC-01`, `EC-01` — 2 digits, no gaps
  - 2-4 word short desc, unique within the US, used as the test case name in test_cases.md
  - Bold **Given / When / Then** with a capital first letter; the continuation
    keyword is bold lowercase **and**. Sentence ends with a period.
  - ALWAYS multi-line — every AC/EC puts Given, When, and Then each on its own
    line, even when each clause has only one condition. Never write them inline
    on a single line. The ID+short desc line stays separate from Given — Given
    starts its own new line below it. Base shape (one condition per clause):
      - **AC-01 — [short desc]:**  
        **Given** [cond],  
        **When** [action],  
        **Then** [testable outcome].
    Note: the ID+short desc line and the Given line are two separate bold spans
    on two separate lines (joined by a hard break, not a bare space) — this is
    safe. What breaks rendering is putting two bold spans on the SAME line with
    only a single space between them (e.g. "**...:** **Given**" inline) — some
    markdown viewers swallow the second span in that case, so don't merge them
    back onto one line.
  - When any clause — Given, When, or Then — needs >=2 conditions, add each
    extra condition as an indented bold lowercase **and** line beneath that
    clause (2-space indent). "and" is not exclusive to Given — all three clauses
    take it, and a single AC can use it under more than one clause at once.
    AC-02 in the body below demonstrates the full shape ("and" under Given,
    When, and Then together). Every unfinished line (Given/and/When/and) must
    end with 2 trailing spaces (markdown hard break) — without them,
    GitHub/Bitbucket will collapse the lines back into one paragraph on render.
    Only the final line (ending in a period) skips the trailing spaces. Example
    with a multi-condition clause:
      - **AC-01 — Duplicate code with active dependents:**  
        **Given** an existing skill `code` that is referenced by at least one employee record,  
          **and** the skill status is `Active`,  
        **When** an `ADMIN` attempts to delete the skill,  
          **and** confirms the deletion warning,  
        **Then** deletion is blocked and an error listing the reference count is shown,  
          **and** the skill remains in the catalog unchanged.
  - AC states WHAT only — no table names, column names, API paths, cache names,
    function names, or config enum names. Those belong in plan.md.
  - Banned vague words: fast, user-friendly, appropriate, relevant, seamless,
    optimal, as needed, if possible
  - No verify checkbox in spec.md — verification status lives in test_cases.md only
  - Cross-references always use the full, zero-padded ID: `EM-US-01.1 AC-02`,
    never `US5` or `AC2`

CRUD / LIFECYCLE
  - Split by entity: Create / List / Search / View / Update / Delete, plus one
    User Story per lifecycle transition
  - Delete always carries the rule: only deletable with zero references and only
    for records created in error; records in use are deactivated via the Update
    User Story instead

SUB-STORY
  - ID: `PREFIX-US-NN.M`
  - Always gets its own H2 block with an `Enhancement to` metadata field pointing
    to the parent US

DIVIDER
  - `---` between every User Story, including the last one and any sub-story

SIBLING FILES (same spec folder): spec.md, plan.md, tasks.md, test_cases.md

SCOPE BOUNDARY — optional, same pattern as the Overview sub-sections. Include the
"## Scope Boundary" H2 only when there is >=1 real Out of Scope item or >=1 real
Dependency worth naming. If the feature is fully self-contained — nothing
meaningfully excluded, no upstream/downstream/external dependency — omit the
whole H2 rather than leaving empty sub-sections.
-->

# Feature: [Feature Name]

> **Prefix:** `[ABBR]`
> **SRS:** [SRS.md §7.N](../../SRS.md#7n-feature-slug)
> **Created:** [YYYY-MM-DD] · **Updated:** [YYYY-MM-DD]

---

## Overview

[2-4 sentences: problem this feature solves, primary actor(s), why it matters now.
WHAT only — no implementation detail.]

<!-- ACTION REQUIRED: keep only the sub-sections below whose trigger condition is met -->

### Key Domain Entities

| Domain Entity | Definition |
|---|---|
| `[Entity]` | [definition] |

### Business Flows

- `[BF-xx]` — [Business Flow name] ([SRS.md §6.N](../../SRS.md#6n-flow-slug))

---

## [ABBR]-US-01: [Verb + Object]

> **Feature group:** 7.N [Feature name]

**As a** `[ROLE]`, **I want to** [action] **so that** [value].

### Acceptance Criteria

- **AC-01 — [short desc]:**  
  **Given** [precondition],  
  **When** [action],  
  **Then** [testable outcome].
- **AC-02 — [short desc]:**  
  **Given** [precondition],  
    **and** [additional precondition],  
  **When** [action],  
    **and** [additional action],  
  **Then** [testable outcome],  
    **and** [additional testable outcome].

### Edge Cases

- **EC-01 — Empty/null state:**  
  **Given** [...],  
  **When** [...],  
  **Then** [...].
- **EC-02 — Boundary values:**  
  **Given** [min/max/limit],  
  **When** [...],  
  **Then** [...].
- **EC-03 — Concurrency (2 users):**  
  **Given** [...],  
  **When** [...],  
  **Then** [...].
- **EC-04 — Access control:**  
  **Given** [unauthorized actor],  
  **When** [...],  
  **Then** [...].
- **EC-05 — Dependency timeout/partial failure:**  
  **Given** [dependency X is slow/down],  
  **When** [...],  
  **Then** [...].
- **EC-06 — Multi-language/multi-currency data:**  
  **Given** [...],  
  **When** [...],  
  **Then** [...].
- **EC-07 — AI service error or garbage output:**  
  **Given** [...],  
  **When** [...],  
  **Then** [...].

<!-- ACTION REQUIRED: AC-02 above is a kept-in-body illustration of the full
     multi-condition shape — "and" under Given, When, and Then at once. Unlike the
     top comment block, do NOT delete it when cleaning up ACTION REQUIRED comments;
     it is real template body. Replace its placeholder text with your actual AC,
     and drop any "and" line whose clause only needs one condition.
     Remove any EC row genuinely not applicable, don't leave it blank.
     Repeat the full block above (### [ABBR]-US-NN + Feature group
     + statement + AC + EC) for every additional User Story. -->

---

## [ABBR]-US-01.1: [Verb + Object, enhancement]

> **Feature group:** 7.N [Feature name]
> **Enhancement to:** [ABBR]-US-01

**As a** `[ROLE]`, **I want to** [action] **so that** [value].

### Acceptance Criteria

- **AC-01 — [short desc]:**  
  **Given** [precondition],  
  **When** [action],  
  **Then** [testable outcome].

### Edge Cases

- **EC-01 — [short desc]:**  
  **Given** [precondition],  
  **When** [action],  
  **Then** [testable outcome].

---

<!-- ACTION REQUIRED: keep this entire "## Scope Boundary" section only if it has
     >=1 Out of Scope item or >=1 Dependencies row. Delete the whole heading otherwise. -->

## Scope Boundary

### Out of Scope

- [Explicitly excluded capability — one line]

### Dependencies

| Type | Name | Nature | Risk if unavailable |
|---|---|---|---|
| Upstream | [...] | [...] | [...] |
| Downstream | [...] | [...] | [...] |
| External/AI service | [...] | [...] | [...] |
