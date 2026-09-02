# Test Cases & Verification Template

<!--
  ACTION REQUIRED: This is a reference template only — the title above is never copied into
  a real artifact. It documents the two QC-owned, SEPARATE files of the AIF-SDLC
  (aif-sdlc.md Step 3 — Quality Step, and Step 6 — Verification Step), each with its OWN
  file header shown at the start of its Part below:

    Part 1 — test_cases.md   lives in specs/[feature-id]-[slug]/, produced BEFORE Implementation.
    Part 2 — test_report.md  lives in testing/[feature-id]-[slug]/, produced AFTER Deployment.

  Copy only the part relevant to the step you are running, starting from that part's own
  "# Test Cases: ..." / "# Test Report: ..." header — never from this file's title, and
  never merge the two into one document or one heading. Both parts accumulate over the
  life of a Feature — every new User Story appends its own Coverage Matrix / Test Cases
  block (Part 1) or metadata / Results / Summary block (Part 2); never renumber or remove a
  previously written block for a different US.
-->

---

## Part 1 — test_cases.md (Quality Step)

<!--
  ACTION REQUIRED: file header — copy verbatim as the top of test_cases.md, once per
  feature (not once per US). [PREFIX] is the short feature code (e.g. DC, PM, BU).
-->

# Test Cases: [FEATURE NAME] ([PREFIX])

> **Spec:** [spec.md](spec.md)
> **Plan:** [plan.md](plan.md)

<!--
  ACTION REQUIRED: Classify every AC before writing any test case for it:
    [API]  — HTTP only (auth, persistence, status codes, audit logs)
    [UI]   — browser only (reactive state, error text, auto-populate, button state)
    [BOTH] — requires both integration AND e2e coverage
-->

### [PREFIX]-US-NN: [Story Title]

#### AC Classification *(optional — add when a label isn't self-evident)*

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

#### Coverage Matrix

<!--
  ACTION REQUIRED — produce this table BEFORE finalising the test cases below it.
  AC-IDs restart at AC-01 for every User Story and are only unique within this US's own
  table — never globally unique across the file. When referencing an AC outside this
  section (cross-US Note, PR description), prefix it with the US-ID, e.g.
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

#### Negative-scenario applicability *(optional — add when a required category is N/A)*

<!--
  OPTIONAL: add this list only when one of the Coverage-required-per-US negative categories
  below (auth, not found, business rule conflicts, invalid/missing/malformed/boundary input)
  does not apply to this US and that isn't obvious from the Test Cases alone — e.g. because
  the entry point is already covered by another US's TCs, or the surface genuinely has no
  such path. State which category and why; don't list categories that ARE covered below.
-->

- **[Category, e.g. Authentication (401) / Authorization (403)]:** [why N/A, or which other US/TC-NN already covers it]

#### Test Cases

<!--
  ACTION REQUIRED: TC-NN is numbered sequentially across the WHOLE file, never reset per
  US. When appending test cases for a new US to a file that already has some, continue
  numbering from the last TC-NN already used.
-->

### TC-NN: [Test Name]
- **US:** [PREFIX]-US-NN
- **Given:** xxx...
  - And yyy...
  - And zzz...
  - ...
- **When:** xxx...
  - And yyy...
  - And zzz...
  - ...
- **Then:** xxx...
  - And yyy...
  - And zzz...
  - ...
- **AC:** [link to the item this TC verifies — an Acceptance Scenario/Criterion, Edge
  Case, Functional Requirement, Success Criterion, or Assumption, whichever applies]
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

  Playwright automation for e2e cases follows the Testing-Code-Rule in aif-sdlc.md
  Step 3 (selector priority, seeding, step/screenshot conventions) — not duplicated here
  since it governs the .spec.ts code, not this document's structure.
-->

<!-- Repeat the "Coverage Matrix" + "Test Cases" sub-sections above once per User Story in this Feature. -->

---

## Part 2 — test_report.md (Verification Step)

<!--
  ACTION REQUIRED: file header — copy verbatim as the top of test_report.md, once per
  feature (not once per US). Unlike Part 1, the parenthetical uses the feature-id
  (e.g. 012-data-configuration), not the short [PREFIX] code.
-->

# Test Report: [FEATURE NAME] ([feature-id]-[slug])

> Verification results per User Story. Appended as each US is verified — do not modify or remove existing sections.

<!--
  ACTION REQUIRED: Produced after running the Quality Step's Playwright automation
  against the deployed Test Environment for a given US. Any TC marked
  Type: integration or e2e that automation does NOT cover must be verified manually
  against the Test Environment, with the result documented inline here.
-->

### [PREFIX]-US-NN: [Story Title]

> **Test Env:** [env URL]
> **Suite:** `[Testing folder]/test_[feature-id].spec.ts` ([describe-block name], N tests) | **HTML report:** `[Testing folder]/[xx-us-nn-keyword]/index.html`

<!--
  ACTION REQUIRED: this metadata block is mandatory, not decorative — every verified US
  carries it so a reader can re-run or re-locate the evidence without searching. Re-state
  Test Env/Suite/HTML report even when they repeat the previous US's values in this file —
  never write "same as above".
-->

#### Results

| TC-NN | Test Name | AC | Type | Result | Notes |
|-------|-----------|----|------|--------|-------|
| TC-01 | [short name] | [PREFIX]-US-NN/AC-01 | e2e | PASS / FAIL / BLOCKED | [only if not a plain PASS — the column stays even when every row is blank] |

#### Summary

<!--
  ACTION REQUIRED: one short paragraph — pass/fail count, plus any context worth keeping
  (an accepted known-bug FAIL with its reference, a re-verification date, a coverage
  caveat).
-->

[N/M PASS — one-line summary of scope and any accepted gaps, citing bug references for accepted FAILs.]

<!-- Append one such US block (metadata + Results + Summary) per User Story verified. Never modify or remove a previously appended block for a different US. -->

<!--
  ACTION REQUIRED — after producing the Results table for this US:

  If any AC fails or is blocked:
  - List each failure: test case ID, AC reference, observed vs expected behaviour.
  - Raise a bug record (description = Severity: [failing TC's Severity] / Pre-condition /
    Test data / Steps / Expected Result / Actual Result) and reference it from the Summary
    above.
-->
