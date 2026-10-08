# AIF-SDLC Artifact Audit — PFM

> Scan of the one feature under `specs/` (`001-system-security`) for consistency between its AI-generated spec-kit artifacts (`spec.md`, `plan.md`, `tasks.md`, `checklists/requirements.md`, `test_cases.md`, the Playwright suite, the verification report) and this project's own templates (`.specify/templates/*.md`), review rubric (`aif-review-checklist.md`), process definition (`aif-sdlc.md`) and governing documents (`constitution.md`, `SRS.md`, `SDS.md`), plus spot-checks of the artifacts against the actual backend/frontend code.
>
> *Audited 2026-10-08 (updated the same day after rewriting `aif-review-checklist.md`) against branch `develop` @ `5d53819` plus the uncommitted `docs/`/`e2e/` restructure. This replaces the earlier version of this file, which audited a different project's 11 features (`grm`); none of its findings apply here.*

**Scope:** 1 feature folder (`001-system-security`), 1 User Story designed and shipped (`SS-US-01: Login`); `SS-US-02: Logout` is listed in SRS/SDS/plan but not yet specified. Because only one feature exists, this audit also covers the **project-level artifacts** that every feature inherits (templates, rubric, process doc, cross-document links) — that is where most of the systemic defects were found.

**Methodology:** every artifact was read in full and checked against: the metadata/formatting rules in `spec-template.md` and `spec-ac-ec-template.md` (AC/EC numbering, GWT, the 7 mandatory Edge Case categories, banned vague words); the structural rules in `plan-template.md` (Pre-flight Findings, Decisions, Domain Objects, API Contracts, Sequence Diagram, BR table, Element IDs, Quickstart, Constitution Check); `tasks-template.md`'s phase structure; `testcase-template.md` and the Quality/Verification rules in `aif-review-checklist.md` and `aif-sdlc.md`; and the constitution's rules (AR-*, API-*, FE-*, NC-04, Logging & Audit, DOD-*). Code spot-checks: `backend/config/api_router.py`, `backend/users/tests.py`, `frontend/src/app/login/page.tsx`, `frontend/src/app/page.tsx`, SDS §5.1/§6.3/§6.4.7–8, SRS §7.1. Severity: **Critical** = breaks traceability/correctness or hides a live bug; **Major** = a clear rule violation that isn't breaking anything today; **Minor** = cosmetic/formatting drift.

**Limits:** nothing was executed — tests were not re-run and the dev servers were not started; the "PASS" results in the verification report were taken as reported. Findings are from a single pass with no second independent check.

---

## Executive summary

| # | Scope | Critical | Major | Minor | Headline issue |
|---|---|---|---|---|---|
| 1 | [001-system-security](#001-system-security-ss) | 0 | 6 | 13 | The shipped login performs none of the auth-event logging the constitution requires, and `plan.md`'s Constitution Check never mentions it; AC-04 (dual-role login) is reported PASS by a test that cannot distinguish dual-role from single-role |
| 2 | [Project-level (templates, rubric, docs)](#project-level-templates-rubric-docs) | 0 | 1 | 1 | Rubric, templates and file-location/naming conventions were fixed 2026-10-08 (P1, P2, P4, P5); what remains is the SRS-vs-constitution registration contradiction (P3) and a ToC naming drift (P6) |
| | **Total** | **0** | **7** | **14** | |

Unlike the previous project's audit there are **no Critical findings**: every "Done" claim spot-checked in `plan.md`, `tasks.md` and the verification report was true in code (endpoint wiring, error bodies, element IDs, SDS §6.4.7/§6.4.8, BR-16 mapping, 6 integration + 3 e2e test counts).

---

## Process-level patterns

Findings that affect every future feature — worth fixing once, in the templates/rubric, rather than per-feature.

1. **Previous-project carry-over in the rubric and templates.** *(Rubric part resolved 2026-10-08: `aif-review-checklist.md` was rewritten for Django/DRF/Next.js, the home-LAN workflow and `aif-sdlc.md`'s actual steps; the template part below is still open.)* The old `aif-review-checklist.md` contained rules for a different system: FastAPI/`backend/app/services|repositories|api` layering, `dependencies.py` wiring, LangGraph/PEV/HITL guardrails, Salesforce/DPS/MCP integration, Brand Config, "Classic vs Agentic" deploy tracks with ports `8091`/`8081`, Flyway/Alembic, Jira-driven branch names (`feature/obms-NNN-…`), Jira bug-ticket procedures, actors `CUSTOMER | SYSTEM | BRAND_ADMIN | ADMIN`, and an "Experience Sharing" section citing "29 headings across 6 features". It also links to `inconsistent-test-case-synthesis.md` (does not exist) and requires the `speckit-test-report` skill (not in `.claude/skills/`). `.specify/templates/spec-template.md:14` still says "GRM section numbers" and `testcase-template.md` is built around Jira Epic/Story/Quality-Task fields (`"OBMS-{us}: Quality Step"`), while `aif-sdlc.md` states plainly that no ticket tracker is used. A reviewer following the old rubric literally could not complete Steps 2, 4, 5 or 6 for this repo.

2. **Artifact locations and file names disagreed across five documents.** *(Resolved 2026-10-08 — table shows the state after the fix.)*

   | Artifact | `CLAUDE.md` | `aif-sdlc.md` | `testcase-template.md` | `aif-review-checklist.md` | Actual |
   |---|---|---|---|---|---|
   | `test_cases.md` folder | `e2e/` | `e2e/` | `e2e/` *(fixed)* | `e2e/` *(fixed)* | `e2e/001-system-security/` |
   | verification report | — | `[Test folder]/[xx-us-nn-keyword]/` (unnamed) | `verification-report.md` per US *(fixed)* | `verification-report.md` in that folder *(fixed)* | `e2e/…/ss-us-01-login/verification-report.md` |
   | Playwright file | `test_[abbr].spec.ts` *(fixed)* | `test_[abbr].spec.ts` *(fixed)* | `test_[abbr].spec.ts` *(fixed)* | `test_[abbr].spec.ts` *(fixed)* | `test_ss.spec.ts` ✔ |

   All five documents and the existing files now agree.

3. **Playwright rules in the rubric target another project's UI.** `[role="option"]` dropdowns, "filter panel not toggled manually — `#search-*`/`#btn-search`", `RoleGuard` inline access-denied messages, and pagination-before-row-actions have no counterpart in PFM's UI yet. They are harmless for the login story but will generate false failures (or be silently ignored) as soon as Wallet/Category CRUD screens are tested.

4. **Spec-kit analyze reports are not persisted.** Step 4 of the rubric requires pre- and post-implementation `/speckit.analyze` reports with zero Critical/High findings; none exist in the repo, so that gate cannot be audited after the fact.

5. **The test-seeding path contradicts the SRS** — see Project-level finding P3 below (still open).

---

## Priority findings (fix first)

None are Critical, but these five are live discrepancies between what is documented as correct and what the code or tests actually do:

1. **No auth-event logging on login.** `constitution.md` § Logging & Audit requires login success/failure at `INFO`/`WARN` and `401`/`403` at `WARN`. The shipped login is the stock `TokenObtainPairView`; `backend/config/settings.py` has no `LOGGING` and nothing in `users/` obtains a logger. `plan.md`'s Constitution Check marks every other principle PASS and never lists Logging & Audit, so the gap is undocumented. (If the stock view is kept per AR-01, a thin subclass or signal handler is the smallest fix; alternatively amend the constitution's interim rule explicitly.)
2. **AC-04 (dual-role single login) is not actually verified.** No `Role` entity exists, so TC-06 seeds `is_staff`/`is_superuser` and asserts the response is `{access, refresh}`. That assertion holds for every active account, including one with no elevated flags, so the test cannot fail for the reason AC-04 cares about. `test_cases.md` TC-06 still says "holds both the ADMIN and USER roles", and the verification report records AC-04 as PASS.
3. **Token storage was never decided in `plan.md`.** The plan defers it as "an implementation-time detail", `tasks.md` T012 says only "store tokens", and the shipped code writes both JWTs to `localStorage` (`pfm_access_token`, `pfm_refresh_token`) and the Dashboard guard (`frontend/src/app/page.tsx`) depends on that key. The decision is security-relevant (XSS exposure of a 7-day refresh token) and, per the Definition of Done, should have been written back into `plan.md`/SDS §5.1.1 with its rationale.
4. ~~**Review rubric is for a different project**~~ — **resolved 2026-10-08**: `aif-review-checklist.md` rewritten for PFM (Process pattern 1). The test-case/spec templates still carry Jira/GRM/OBMS wording (P4).
5. **Public registration is assumed by tests and docs but forbidden by the SRS** (P3).

---

## Per-feature findings

Each table lists every artifact checked. A row of `—` severity means the artifact was reviewed and no defect was found; the Finding column still carries a short note on what was verified.

### 001-system-security (SS)

| Artifact | Severity | Finding |
|---|---|---|
| spec.md | Minor | Boundary values, concurrency and dependency timeout (3 of the 7 mandatory Edge Case categories) are not specified; the spec's closing comment says so rather than justifying them as N/A, because login plausibly has behavior there (e.g. two simultaneous logins, database unavailable) that needs a decision before ACs can be written. *(Access control, multi-currency and AI error now carry an inline N/A justification.)* |
| spec.md | — | **Rewritten 2026-10-08 to follow `spec-template.md`** (H1 feature + metadata blockquote, Overview with Business Flow link, per-story block with `Feature group` and inline-code actor, bold hard-break GWT, Scope Boundary); previously used the stock spec-kit scaffold (Priority/Independent Test, FR/SC tables, Assumptions), which also removed the stale `Status: Draft`, the banned word "appropriate" and the missing §6 citation. AC-01..04 / EC-01..03 IDs and meanings are unchanged, so `plan.md`, `tasks.md`, `test_cases.md` and the tests still trace. Heading still carries `(ADMIN, USER)` to match SRS §7.1.1 verbatim. |
| checklists/requirements.md | — | All items ticked; the claim "no implementation details" holds apart from the one banned word above. |
| plan.md | Major | No `### Pre-flight: Spec Review Findings` section and no `### Open tasks` section, both required by `plan-template.md` and Step 2 of the rubric. The template says to state "no gaps found" explicitly rather than drop the section; here the Decisions section only says no `[NEEDS CLARIFICATION]` markers remained. Gaps that were clearly present (AC-04 unverifiable without `Role`; token storage; EC-03 deferral) are not recorded as findings. |
| plan.md | Major | Constitution Check omits Logging & Audit (see Priority #1). All 12 listed principles are PASS/N/A/RESOLVED, but the one the shipped code actually fails is not listed. |
| plan.md | Major | Decisions & Rationale defers token storage ("None evaluated at this phase"); the actual implementation (`localStorage`) was never written back (see Priority #3). |
| plan.md | Minor | Technical Context → Testing says "no frontend test runner is set up yet, so the login page is verified manually"; a Playwright runner and suite were added during the same story (tasks T017/T018). Stale since 2026-07. |
| plan.md | Minor | Project Structure: `tasks.md` is still annotated "Phase 2 output (/speckit-tasks — not created by this command)" though it exists; `checklists/requirements.md` is not listed; the `logout/` entry is mis-indented so it renders as a child of `login/`'s file tree. |
| plan.md | — | Verified accurate: API contract table matches the stock view's actual `200`/`400`/`401` bodies; sequence diagram covers AC-01/02/03 and EC-01; BR-16 row matches SDS §4.3.3; all four Element IDs (`login-email`, `login-password`, `btn-submit-login`, `message-error`) exist in `page.tsx` and follow NC-04. No file:line citations are used, so none can be stale. |
| tasks.md | Minor | T011 specifies the generic error "on a `400`/`401`"; the code shows it for every non-OK response and for any thrown network error (see Code-vs-plan drift). |
| tasks.md | Minor | T017 (add the Playwright runner) and T018 (validate in a real browser, with a bug narrative) were appended to Phase 4 after the fact; T017 is a prerequisite of the Phase 3 checkpoint's "confirmed end-to-end" claim, so the stated phase order no longer reflects the actual dependency order. |
| tasks.md | — | Phase 1→3→4 ordering matches the template, `[US1]` labels only on story tasks, every AC has at least one task, T014/T015 doc-sync tasks are checked and the SDS edits were confirmed present. |
| test_cases.md | Major | No per-story `## SS-US-01: Login (ADMIN, USER)` heading — the file is one H1 with a "Covers SS-US-01…" sentence and a `**US:**` field per TC. The rubric names the `(ACTOR)` heading suffix as the most frequently missed rule; here the whole heading is missing, which also leaves nothing for a second story to be appended under. |
| test_cases.md | Major | TC-06's Given ("holds both the ADMIN and USER roles") describes a state the system cannot represent yet, and its automation is a proxy that cannot fail (see Priority #2). The classification table is honest ("auth-only, no Role-gated UI"), but the TC itself and the Coverage Matrix present AC-04 as covered. |
| test_cases.md | Minor | Section order differs from the template (Classification → Coverage Matrix → Negative-scenario applicability → Test Cases): here the Coverage Matrix is last and there is no Negative-scenario applicability block. |
| test_cases.md | Minor | FR-003/SC-002 promise the response does not reveal whether an email is registered, but no TC covers the unregistered-email case; it is exercised only incidentally inside `test_tc05`'s comparison, not as a documented case. |
| test_cases.md | Minor | TC-07 expects exactly `400`; the rubric's validation-error pattern is `[400, 422]` (DRF does return 400 here, so this is stricter, not wrong). |
| test_cases.md | — | Verified: TC-01..09 sequential, all six fields present, every AC/EC has a TC, every `[BOTH]` AC has a non-empty E2E column, EC-03 correctly marked out of scope. |
| test_ss.spec.ts | Major | TC-02 and TC-08 assert less than `test_cases.md` promises. TC-02 only checks `not.toHaveURL(/\/login$/)` — it never confirms landing on the Dashboard or that tokens were stored (its "Then" says both). TC-08 claims validation happens "without a round trip" but does not intercept or count requests. |
| test_ss.spec.ts | Minor | `createTestUser()` accepts `is_active`/`username` overrides but ignores `is_active`, returns an unused `id`, and never cleans up — every run leaves `TestQC-user-*` accounts in whichever database the backend uses (the live `db.sqlite3` in the documented workflow). |
| test_ss.spec.ts | Minor | Misleading comment: TC-08 says "Fill every other required field first" but deliberately fills only the email. *(The inaccurate `playwright.config.ts` comment was corrected 2026-10-08.)* |
| verification-report.md | Minor | The run was against `localhost`, noting "no LAN `<HOST_IP>` was configured". `aif-sdlc.md` Step 5 requires deployment to the home-LAN host with a confirmed App URL before Step 6; here Step 5 was effectively skipped yet the Verdict is "Done". Disclosed, but not reconciled with the process. |
| verification-report.md | — | Spot-checks held: 6 integration tests in `backend/users/tests.py` map to TC-01/03/05/06/07/09, 3 e2e tests map to TC-02/04/08, SRS §7.1.1, SDS §5.1.1 and SDS §6.3/§6.4.7/§6.4.8 all exist. The only overstated row is AC-04 (above). |
| Code-vs-plan drift | Minor | `page.tsx` shows `"Invalid email or password."` for any non-OK response (including `500`) and for network failures in the `catch`. A backend outage is therefore reported as a credential error — spec/plan are silent, but it contradicts the story's honest-error spirit and `tasks.md` T011's `400`/`401` scope. |
| Code-vs-plan drift | Minor | FE-06 asks for inline *field-level* validation feedback; the form is `noValidate` with one form-level `#message-error`. Matches the TC-08 copy contract, but is a deliberate narrowing not noted in `plan.md`. |
| Code-vs-plan drift | — | Everything else spot-checked matches: `POST /api/v1/auth/login/` → `TokenObtainPairView` and `/auth/refresh/` → `TokenRefreshView` in `api_router.py`; Dashboard `/` redirects to `/login` when no token; loading state disables `#btn-submit-login` (FE-06). |

### Project-level (templates, rubric, docs)

| Artifact | Severity | Finding |
|---|---|---|
| P1 `aif-review-checklist.md` | ~~Major~~ **Resolved** | Was largely the previous project's rubric (Process pattern 1). Rewritten 2026-10-08: removed FastAPI/LangGraph/Salesforce/DPS/Classic-Agentic/Flyway/Jira content and the missing `speckit-test-report` skill and `inconsistent-test-case-synthesis.md` references; re-based on `aif-sdlc.md` steps, constitution AR-01..05/API-*/FE-*/Logging & Audit, the home-LAN deployment, `e2e/` paths and `ADMIN \| USER` actors; added checks for the gaps this audit found (Pre-flight section, Constitution Check coverage, deferred decisions, proxy tests, assertions vs TC "Then", localhost-vs-LAN verification). |
| P2 `.specify/templates/testcase-template.md`, `CLAUDE.md`, `aif-sdlc.md`, checklist | ~~Major~~ **Resolved** | Documents disagreed on where `test_cases.md` and the verification report live. Fixed 2026-10-08: all now say `e2e/[feature-id]-[slug]/test_cases.md` and a per-US `[xx-us-nn-keyword]/verification-report.md` (template Part 2 rewritten to match the real report's shape; Part 1's Spec/Plan links now climb to `specs/`). |
| P3 `SRS.md` §7.2/§6 vs `constitution.md` V / `CLAUDE.md` / test seeding | Major | The SRS states "There is no self-service registration (§1.6 Out of Scope) — a User account can only be created by the ADMIN", yet the constitution and `CLAUDE.md` list `POST /api/v1/users/` as a public registration route, and both the Django tests (`_register`) and the Playwright suite (`createTestUser`) create their accounts through it. Either the SRS or the constitution is wrong; until resolved, the Quality Step's seeding path depends on an endpoint the spec says should not be public. |
| P4 `.specify/templates/spec-template.md`, `testcase-template.md` | ~~Minor~~ **Resolved** | "GRM section numbers", `OBMS-{us}` Jira Quality-Task naming and mandatory Jira Epic/Story/Quality-Task/bug-ticket fields removed 2026-10-08 (also `HR`/skill/`EM-US` examples in `spec-template.md`, tenant wording in the Data Authorization EC group, `BRAND_ADMIN`/`(ALL)` actor guidance). The large worked example at the end of `spec-ac-ec-template.md` still uses a generic Workspace/Project world on purpose. |
| P5 Spec file naming | ~~Minor~~ **Resolved** | Convention chosen 2026-10-08: `test_[abbr].spec.ts`, `[abbr]` = lowercase story prefix (e.g. `test_ss.spec.ts`), matching the file that already exists. Updated in `aif-sdlc.md`, `CLAUDE.md`, `aif-review-checklist.md` and both templates. |
| P6 SRS §7 ↔ SDS §5 ToC | Minor | `constitution.md` § User Story Conventions requires story names to match exactly across the two ToCs. SRS shows `SS-US-01: Login (ADMIN, USER) [MVP]`; SDS shows `SS-US-01: Login (ADMIN, USER)` (no `[MVP]`). SRS §7.1.2 (Logout) has no story statement at all while SDS §5.1.2 is "(Details to be defined)" — acceptable as a placeholder, but SRS ToC and §7 already list it as a story. |
| `SRS.md` §7.1 spec link, `SDS.md` §5.1 plan link | — | Each appears once on the Feature header, as the rubric requires; `.specify/feature.json` correctly points at `specs/001-system-security`. |

---

## Stray, non-feature artifacts

- **None under `specs/` or `e2e/`.** The previous project's audit found leftover `report/` folders outside the per-story convention; this repo has none — `e2e/001-system-security/` contains only `test_cases.md`, `test_ss.spec.ts` and the single `ss-us-01-login/` report folder, and `specs/001-system-security/` contains only planning artifacts.
- **`aif-artifact-audit.md` sits in the repo root.** After the `docs/` restructure, supporting documents (`debug-guide.md`, `ss-us-01-What-AI-produces-and-How.md`) live in `docs/`; this audit is a candidate for `docs/` too (no other file links to it, so moving it is a no-op for references).
- **`aif-review-checklist.md` and `aif-sdlc.md` remain in the root** alongside `constitution.md`/`SRS.md`/`SDS.md`; they are process documents rather than governing specs. Optional, not a defect.

## Checks from the previous audit that came back clean here

For future audits, the recurring defects found in the previous project and their status in PFM: Jira-key drift (n/a — no tracker; only template wording remains, P4); `sdlc.yaml` files (none exist); stale `file:line` citations in `plan.md` (none — files are cited without line numbers); dot-vs-hyphen sub-story separators (no sub-stories yet); `testing/`-style stray report folders (none); `TestQC-` naming (followed for the username; email uses a lower-case variant); older suites lacking per-step instrumentation (not applicable — `aif-sdlc.md`'s Testing-Code-Rule requires only `testInfo.attach()` screenshots, which the suite has).

---

## How this audit was produced

One pass by Claude Code reading every file under `specs/001-system-security/` and `e2e/`, the seven `.specify/templates/*.md`, `aif-review-checklist.md`, `aif-sdlc.md`, `constitution.md`, and the relevant SRS/SDS sections, then checking 2–6 claims per artifact directly against `backend/` and `frontend/` source. Nothing was executed; verification-report results are quoted, not reproduced. A Critical/Major label reflects this single pass's own confidence, not a second independent check. Severity counts in the executive summary were tallied from the tags in the tables above.
