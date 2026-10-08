# Test Cases & Verification Report Template

<!--
  ACTION REQUIRED: This is a reference template only — the title above is never copied into
  a real artifact. It documents the two QC-owned, SEPARATE files of the AIF-SDLC
  (aif-sdlc.md Step 3 — Quality Step, and Step 6 — Verification Step), each with its OWN
  file header shown at the start of its Part below:

    Part 1 — test_cases.md          specs/[feature-id]-[slug]/test_cases.md
             one file per Feature, next to spec.md / plan.md / tasks.md so the spec-kit commands
             find spec, plan and test cases in one folder; produced BEFORE Implementation.
    Part 2 — verification-report.md e2e/[feature-id]-[slug]/[xx-us-nn-keyword]/verification-report.md
             one file per User Story (next to that US's Playwright index.html), produced AFTER
             Deployment.

  Copy only the part relevant to the step you are running, starting from that part's own
  "# Test Cases: ..." / "# Verification Report: ..." header — never from this file's title,
  and never merge the two into one document or one heading. Part 1 accumulates over the
  life of a Feature — every new User Story appends its own Coverage Matrix / Test Cases
  block; never renumber or remove a previously written block for a different US. Part 2 is
  a fresh file per US; a re-verification of the same US overwrites that US's report with the
  latest run (state the date) rather than creating a second file.

  PFM has no ticket tracker (aif-sdlc.md) — there are no Jira fields; git branches and the
  SRS/SDS documents are the only source of truth for status.
-->

---

## Part 1 — test_cases.md (Quality Step)

<!--
  ACTION REQUIRED: file header — copy verbatim as the top of test_cases.md, once per
  feature (not once per US). [PREFIX] is the short feature code (e.g. SS, WM, TM).
  Spec/Plan links are same-folder links (this file sits next to spec.md and plan.md).
  Created is written once, on first creation of this file, using today's date. Updated is
  overwritten every time this file changes (new US appended, or existing content revised) —
  today's date plus a one-line summary of what changed in this edit; it always reflects only
  the MOST RECENT change, not a running log of every past edit.
-->

# Test Cases: [FEATURE NAME] ([PREFIX])

> **Spec:** [spec.md](spec.md) | **Plan:** [plan.md](plan.md)  
> **Created:** [YYYY-MM-DD] | **Updated:** [YYYY-MM-DD] — [one-line summary of the most recent change]

<!--
  ACTION REQUIRED: Classify every AC before writing any test case for it:
    [API]  — HTTP only (auth, persistence, status codes, audit logs)
    [UI]   — browser only (reactive state, error text, auto-populate, button state)
    [BOTH] — requires both integration AND e2e coverage
-->

## [PREFIX]-US-NN: [Story Title] ([ACTOR])

<!--
  ACTION REQUIRED: (ACTOR) must match the actor tag on this US's SRS §7 header verbatim —
  a single actor (e.g. `(USER)`) or a comma-separated list (e.g. `(ADMIN, USER)`), using
  only the roles defined in SRS §1.5 (ADMIN, USER; one User may hold both). The heading is
  per US — never omit it, and never reuse another US's heading.
-->

### AC Classification *(optional — add when a label isn't self-evident)*

<!--
  OPTIONAL: add this table only when an AC's [API]/[UI]/[BOTH] label needs justification —
  e.g. a [BOTH] AC that's temporarily [API]-only because its UI doesn't exist yet, an AC
  reachable only via direct API per its own wording, or a label that will change once a
  named dependency ships. Skip this table entirely when every AC's label is obvious from
  its text — the Coverage Matrix's Label column is enough on its own in that case.
-->

| AC | Classification | Rationale |
|----|-----------------|-----------|
| AC-01 — [short title] | [API \| UI \| BOTH] | [why this label — cite the AC's own wording, a missing dependency, or a deferred surface] |

### Coverage Matrix

<!--
  ACTION REQUIRED — produce this table BEFORE finalising the test cases below it.
  AC-IDs restart at AC-01 for every User Story and are only unique within this US's own
  table — never globally unique across the file. When referencing an AC outside this
  section (cross-US Note, PR description, commit message), prefix it with the US-ID, e.g.
  `[PREFIX]-US-NN/AC-01`.

  Defect condition — resolve before proceeding, do not finalise with either open:
  - A [BOTH]/[UI] AC with an empty E2E column, OR
  - A [BOTH]/[UI] AC whose E2E column doesn't demonstrate every facet its Integration
    TC(s) cover (see "Per-facet depth match" below) — note the gap as "e2e N/A: [reason]"
    in the E2E column instead of leaving it silently under-covered.
-->

| AC | Label | Integration TC(s) | E2E TC(s) |
|---|---|---|---|
| AC-01 — [short title] | [API \| UI \| BOTH] | TC-01, TC-02 | TC-05 |
| Error path — [condition] → [status] | [API \| UI \| BOTH] | TC-NN | — |

- [ ] Self-checked against [aif-review-checklist.md § `test_cases.md` — Coverage](../../aif-review-checklist.md#test_casesmd--coverage)

### Negative-scenario applicability *(optional — add when a required category is N/A)*

<!--
  OPTIONAL: add this list only when one of the Coverage-required-per-US negative categories
  below (auth, not found, business rule conflicts, invalid/missing/malformed/boundary input)
  does not apply to this US and that isn't obvious from the Test Cases alone — e.g. because
  the entry point is already covered by another US's TCs, or the surface genuinely has no
  such path. State which category and why; don't list categories that ARE covered below.
-->

- **[Category, e.g. Authentication (401) / Authorization (403)]:** [why N/A, or which other US/TC-NN already covers it]

### Test Cases

<!--
  ACTION REQUIRED: TC-NN is numbered sequentially across the WHOLE file, never reset per
  US. When appending test cases for a new US to a file that already has some, continue
  numbering from the last TC-NN already used.
-->

### TC-NN: [Test Name]
- **US:** [PREFIX]-US-NN
- **Given:** xxx...
  - **And** yyy...
  - **And** zzz...
  - ...
- **When:** xxx...
  - **And** yyy...
  - **And** zzz...
  - ...
- **Then:** xxx...
  - **And** yyy...
  - **And** zzz...
  - ...
- **AC:** [link to the item this TC verifies — AC-NN (Acceptance Criteria) or EC-NN
  (Edge Case) only, per spec.md's own numbering]
- **Type:** [unit | integration | e2e]
- **Severity:** [Critical | Major | Minor — Critical for main flow (happy path), Major for
  alternative flow (validation errors, rejected states, guardrail violations), Minor for
  edge cases (boundary values, empty/null inputs, concurrent actions)]
- **Note:** [optional — only for something non-obvious: a spec/code mismatch, an "e2e N/A" reason, a merge/dedup rationale, a test-design workaround, or an assumption flagged for confirmation. Omit entirely if the test speaks for itself.]

<!--
  OPTIONAL: add `And:` sub-lines under Given/When/Then only when that clause genuinely has
  more than one condition/step/assertion — e.g. Given needs two preconditions true at once,
  When is a short sequence of UI actions, or Then must check more than one outcome of the
  same action. Omit every `And:` line (keep the plain single-line Given/When/Then above)
  when one sentence already says it all — don't split a single condition into a 1-item
  Given plus a redundant And just to match this shape.
-->

<!--
  ACTION REQUIRED — Coverage required per User Story (self-verify against this list
  item by item before finalising; confirm each or state explicitly why it's N/A — don't
  rely on a later reviewer to catch gaps):
  - Happy path: one test per AC.
  - Validation [BOTH]: integration (API error code) + e2e (inline error message text).
  - Optional fields: (a) omit → success  (b) provide → verify persisted on GET.
  - Audit-log and auth-only ACs: [API] only — no e2e needed.
  - Every AC: cover all applicable negative scenarios across all impacted functionality —
    not just the primary feature — including authentication, authorization, not found,
    business rule conflicts, and invalid/missing/malformed/boundary inputs; state
    explicitly when a category is not applicable.
  - Per-facet depth match: if a [BOTH] AC's integration TCs cover distinct facets
    (different fields/computed values/sub-rules, not just negative variants), each facet
    needs its own e2e case, or an explicit "e2e N/A: [reason]" Note on the one covering
    it — one generic e2e per AC does not cover facets it doesn't itself demonstrate.

  Playwright automation for e2e cases goes in e2e/[feature-id]-[slug]/test_[abbr].spec.ts (not in this folder)
  ([abbr] = the lowercase story prefix, e.g. test_ss.spec.ts) and follows the
  Testing-Code-Rule in aif-sdlc.md Step 3 (selector priority, seeding, screenshot
  conventions) — not duplicated here since it governs the .spec.ts code, not this
  document's structure. Integration TCs are implemented as Django APITestCase tests in the
  owning app's tests.py (constitution.md § Integration Testing Over Mocking), not in
  Playwright.
-->

- [ ] Self-checked against [aif-review-checklist.md § `test_cases.md` — Structure](../../aif-review-checklist.md#test_casesmd--structure)
- [ ] Self-checked against [aif-review-checklist.md § Playwright Code — Integration Tests](../../aif-review-checklist.md#playwright-code--integration-tests)
- [ ] Self-checked against [aif-review-checklist.md § Playwright Code — E2E Tests](../../aif-review-checklist.md#playwright-code--e2e-tests)
- [ ] Self-checked against [aif-review-checklist.md § Playwright Code — General](../../aif-review-checklist.md#playwright-code--general)

<!-- Repeat the "Coverage Matrix" + "Test Cases" sub-sections above once per User Story in this Feature. -->

---

## Part 2 — verification-report.md (Verification Step)

<!--
  ACTION REQUIRED: one file per User Story, saved next to that US's Playwright HTML report:
  e2e/[feature-id]-[slug]/[xx-us-nn-keyword]/verification-report.md (e.g.
  e2e/001-system-security/ss-us-01-login/verification-report.md). Produced after running the
  Quality Step's Playwright automation (and the backend `python manage.py test`) against the
  deployed app from aif-sdlc.md Step 5. Any TC marked Type: integration or e2e that
  automation does NOT cover must be verified manually against the app, with the result
  documented inline here.
-->

# Verification Report: [PREFIX]-US-NN [Story Title]

**Date**: [YYYY-MM-DD]
**App URL**: [http://<HOST_IP>:3000 — as confirmed by the Deployment Step; if the run used localhost instead, say so and why]
**Playwright HTML report**: [index.html](index.html)

## Results

| TC-NN | Test Name | AC/EC | Type | Result | Notes |
|-------|-----------|-------|------|--------|-------|
| TC-01 | [short name] | AC-01 | integration | PASS / FAIL / BLOCKED | [only if not a plain PASS — e.g. a proxy-based test, a manual check, or a known gap; the column stays even when every row is blank] |

[N/M in-scope test cases PASS. State FAIL / BLOCKED counts and cite which TC-NN each belongs to. List any AC/EC deliberately out of scope with the reason.]

- [ ] Self-checked against [aif-review-checklist.md § Playwright Run](../../../aif-review-checklist.md#playwright-run)
- [ ] Self-checked against [aif-review-checklist.md § Verification Report](../../../aif-review-checklist.md#verification-report)

## Manual spot check *(optional — only for checks beyond automation)*

<!--
  OPTIONAL: record anything exercised by hand against the live app (e.g. the real
  db.sqlite3 rather than the throwaway test database), and what was restored afterwards.
-->

## Verdict

<!--
  ACTION REQUIRED — per aif-sdlc.md Step 6:

  If ALL automated and manual checks pass: state that the US is Done per constitution.md's
  Definition of Done and walk DOD-01..05 one line each (DOD-03 may be N/A for a public
  endpoint — say why). No ticket transition exists to perform.

  If any AC/EC fails or is blocked: list each failure — TC-NN, AC/EC reference, observed vs
  expected behaviour. Do NOT mark the US Done; hand the report back to the Implementation
  Step (Step 4) and re-run this Verification Step.
-->

[Verdict and DOD-01..05 summary.]
