# AIF-SDLC Artifact Audit — PFM

> Scan of every feature under `specs/` (`001-system-security`, `002-user-management`) for consistency between its AI-generated spec-kit artifacts (`spec.md`, `plan.md`, `tasks.md`, `checklists/requirements.md`, `test_cases.md`, the Playwright suite, the verification report) and this project's own templates (`.specify/templates/*.md`), review rubric (`aif-review-checklist.md`), process definition (`aif-sdlc.md`) and governing documents (`constitution.md`, `SRS.md`, `SDS.md`), plus spot-checks of the artifacts against the actual backend/frontend code.
>
> *First audited 2026-10-08 on the SS-US-01 artifacts; re-scanned the same day after UM-US-01 was taken through the six AIF-SDLC steps (develop @ `2dac9ff`), then updated after the `UserDetailView` fix and after `test_cases.md` moved from `e2e/` to `specs/`. This replaces the earlier version of this file, which audited a different project's 11 features (`grm`); none of its findings apply here.*

**Scope:** 2 feature folders, 2 User Stories designed and shipped — `SS-US-01: Login` and `UM-US-01: Create a User`; `SS-US-02: Logout` and `UM-US-02..06` are listed in SRS/SDS but not yet specified. The audit also covers the **project-level artifacts** every feature inherits (templates, rubric, process doc, cross-document links).

**Methodology:** every artifact was read in full and checked against: the metadata/formatting rules in `spec-template.md` and `spec-ac-ec-template.md` (AC/EC numbering, GWT, the 7 mandatory Edge Case categories, banned vague words); the structural rules in `plan-template.md` (Pre-flight Findings, Decisions, Domain Objects, API Contracts, Sequence Diagram, BR table, Element IDs, Quickstart, Open tasks, Constitution Check); `tasks-template.md`'s phase structure; `testcase-template.md` and the Quality/Verification rules in `aif-review-checklist.md` and `aif-sdlc.md`; and the constitution's rules (AR-*, API-*, FE-*, NC-04, Logging & Audit, DOD-*). Code spot-checks: `backend/config/{api_router,permissions}.py`, `backend/users/*`, `backend/roles/*`, `frontend/src/app/{page,login/page,users/new/page}.tsx`, SDS §2.1/§4.3.3/§5.1–5.2/§6, SRS §7.1–7.2. Severity: **Critical** = breaks traceability/correctness or hides a live bug; **Major** = a clear rule violation that isn't breaking anything today; **Minor** = cosmetic/formatting drift.

**Limits:** SS-US-01 results are quoted from its verification report, except that its backend tests (23-test suite) and e2e (3/3, after a flaky first run) were re-run during UM-US-01's verification. UM-US-01 was verified on `localhost` against a scratch database (see its report). Findings are from a single pass with no second independent check — and, importantly, **the same assistant authored and audited UM-US-01**, so its findings are self-review, not independent review.

---

## Executive summary

| # | Scope | Critical | Major | Minor | Headline issue |
|---|---|---|---|---|---|
| 1 | [001-system-security](#001-system-security-ss) | 0 | 6 | 14 | The shipped login itself logs nothing (constitution § Logging & Audit); AC-04 (dual-role login) is reported PASS by a test that cannot distinguish dual-role from single-role — now fixable because `Role` exists |
| 2 | [002-user-management](#002-user-management-um) | 0 | 0 | 16 | ~~Critical~~ **Resolved 2026-10-08** — the pre-existing `UserDetailView` (any logged-in User could overwrite or delete any account, password stored unhashed) was removed and is covered by regression test TC-20; what remains are minor documentation/test-depth gaps |
| 3 | [Project-level (templates, rubric, docs)](#project-level-templates-rubric-docs) | 0 | 1 | 2 | The six steps for UM-US-01 were carried out by hand from the templates: no `/speckit-*` skill was run and no `/speckit-analyze` report exists |
| | **Total** | **0** | **7** | **32** | |

---

## Process-level patterns

Findings that affect every future feature — worth fixing once, in the templates/rubric, rather than per-feature.

1. **Previous-project carry-over in the rubric and templates — resolved 2026-10-08.** `aif-review-checklist.md` was rewritten for Django/DRF/Next.js, the home-LAN workflow and `aif-sdlc.md`'s actual steps; the Jira/GRM/OBMS wording and `testing/` paths were removed from the templates.

2. **Artifact locations and file names disagreed across five documents — resolved 2026-10-08.** `test_cases.md` lives in `specs/[feature-id]-[slug]/` next to `spec.md`/`plan.md`/`tasks.md` (moved from `e2e/` the same day, so `/speckit-tasks` and `/speckit-implement` read spec, plan and test cases from one folder); per-story `verification-report.md` beside the Playwright `index.html`, Playwright file `test_[abbr].spec.ts` (`[abbr]` = lowercase story prefix). UM-US-01 followed the new convention without friction (`e2e/002-user-management/test_um.spec.ts`, `…/um-us-01-create-user/verification-report.md`).

3. **Playwright rules in `aif-sdlc.md` target another project's UI.** `[role="option"]` dropdowns, "filter panel not toggled manually — `#search-*`/`#btn-search`", `RoleGuard` inline access-denied messages and pagination-before-row-actions still have no counterpart in PFM's UI. They were not needed for the login or Create User screens, but will matter once list/CRUD screens are tested.

4. **Spec-kit analyze reports are not persisted — now seen on two features.** Step 4 requires pre- and post-implementation `/speckit-analyze` reports with zero Critical/High findings; none exist in the repo for either feature, so that gate cannot be audited after the fact. (For UM-US-01 the cross-check was done by hand and is not recorded anywhere.)

5. **A self-review blind spot.** The assistant that implements a story also writes its test cases, runs its verification and (here) audits it. UM-US-01's "Done" verdict listed the `UserDetailView` risk but did not weigh it; only the live probe during this scan showed how serious it is. Independent review of the *Verdict* section is worth keeping as a human step.

---

## Priority findings (fix first)

1. ~~**`UserDetailView` (`/api/v1/users/<id>/`) is open to any authenticated caller — Critical**~~ — **Resolved 2026-10-08.** The pre-existing `RetrieveUpdateDestroyAPIView` over all users let a plain USER overwrite the ADMIN's account (confirmed live: `PUT /api/v1/users/1/` → `200`, password stored unhashed, ADMIN then locked out with `401`) and delete accounts. The view and its route were removed rather than patched — reading, updating, deactivating and deleting accounts have no story yet and UM-US-02..06 will each add a permission-checked endpoint. Regression test `test_tc20…` (TC-20) asserts `404` on `GET/PUT/PATCH/DELETE users/<id>/` for both a USER and an ADMIN and that the target's password and row are untouched. Backend suite: 24 tests OK. *Not re-run after the change:* the Playwright suites (they do not touch that route).
2. **The six steps were hand-run, with no recorded `/speckit-analyze` gate** (Process pattern 4, P7).
3. **No auth-event logging on login itself.** `constitution.md` § Logging & Audit requires login success/failure at `INFO`/`WARN`. UM-US-01 added a `LOGGING` configuration and log lines in `create_user`, but SS-US-01's login is still the stock `TokenObtainPairView` and logs nothing of its own (Django's `django.request` logger records the `401` but not who). SS `plan.md`'s Constitution Check still omits Logging & Audit.
4. **AC-04 (dual-role single login) is still not really verified.** `Role` now exists, so TC-06 can seed an account holding both roles; the test still uses `is_staff`/`is_superuser` and asserts only the `{access, refresh}` shape, which every account satisfies. Unblocked by UM-US-01 — update `test_cases.md` TC-06 and `backend/users/tests.py::test_tc06…` to use real roles.
5. **Token storage was never decided in SS `plan.md`.** Both JWTs live in `localStorage` (`pfm_access_token`, `pfm_refresh_token`), and the Dashboard guard and the Create User page now depend on it. Security-relevant (XSS exposure of a 7-day refresh token) and still absent from `plan.md`/SDS §5.1.1 as a decision.

---

## Per-feature findings

Each table lists every artifact checked. A row of `—` severity means the artifact was reviewed and no defect was found; the Finding column still carries a short note on what was verified.

### 001-system-security (SS)

| Artifact | Severity | Finding |
|---|---|---|
| spec.md | Minor | Boundary values, concurrency and dependency timeout (3 of the 7 mandatory Edge Case categories) are not specified; the spec's closing comment says so rather than justifying them as N/A, because login plausibly has behavior there (e.g. two simultaneous logins, database unavailable) that needs a decision before ACs can be written. *(Access control, multi-currency and AI error carry an inline N/A justification.)* |
| spec.md | — | Rewritten 2026-10-08 to follow `spec-template.md`; AC-01..04 / EC-01..03 IDs and meanings unchanged, so `plan.md`, `tasks.md`, `test_cases.md` and the tests still trace. Heading carries `(ADMIN, USER)` to match SRS §7.1.1 verbatim. |
| checklists/requirements.md | Minor | Still ticks "Success criteria are measurable" / "Feature meets measurable outcomes", but the rewritten spec (per the template) has no Success Criteria section — those items are now vacuous. Needs re-review against the new spec. |
| plan.md | Major | No `### Pre-flight: Spec Review Findings` section and no `### Open tasks` section, both required by `plan-template.md` and Step 2 of the rubric. Gaps that were clearly present (AC-04 unverifiable without `Role`; token storage; EC-03 deferral) are not recorded as findings. (`plan.md` for 002 shows the intended shape.) |
| plan.md | Major | Constitution Check omits Logging & Audit (Priority #3). All listed principles are PASS/N/A/RESOLVED, but the one the shipped code fails is not listed. |
| plan.md | Major | Decisions & Rationale defers token storage ("None evaluated at this phase"); the actual implementation (`localStorage`) was never written back (Priority #5). |
| plan.md | Minor | Technical Context → Testing says "no frontend test runner is set up yet, so the login page is verified manually"; a Playwright runner and suite were added during the same story (T017/T018). Stale. Its "No `Role` entity exists yet … AC-04 holds by the absence of any role-gated check" note is also stale since UM-US-01. |
| plan.md | Minor | Project Structure: `tasks.md` is still annotated "Phase 2 output (/speckit-tasks — not created by this command)" though it exists; `checklists/requirements.md` is not listed; the `logout/` entry is mis-indented so it renders as a child of `login/`'s file tree. |
| plan.md | — | Verified accurate: API contract table matches the stock view's actual `200`/`400`/`401` bodies; sequence diagram covers AC-01/02/03 and EC-01; BR-16 row matches SDS §4.3.3; all four Element IDs exist in `page.tsx` and follow NC-04. Its quickstart no longer offers the now ADMIN-only `POST /api/v1/users/` as a seeding option. |
| tasks.md | Minor | T011 specifies the generic error "on a `400`/`401`"; the code shows it for every non-OK response and for any thrown network error. |
| tasks.md | Minor | T017 (add the Playwright runner) and T018 (validate in a real browser, with a bug narrative) were appended to Phase 4 after the fact; T017 is a prerequisite of the Phase 3 checkpoint's "confirmed end-to-end" claim, so the stated phase order no longer reflects the actual dependency order. |
| tasks.md | — | Phase 1→3→4 ordering matches the template, `[US1]` labels only on story tasks, every AC has at least one task. |
| test_cases.md | Major | (Now at `specs/001-system-security/test_cases.md`.) No per-story `## SS-US-01: Login (ADMIN, USER)` heading — one H1 plus a "Covers SS-US-01…" sentence and a `**US:**` field per TC. The template requires the `(ACTOR)` heading; `002-user-management/test_cases.md` shows the intended shape. |
| test_cases.md | Major | TC-06's Given ("holds both the ADMIN and USER roles") describes a state its automation (an `is_staff`/`is_superuser` proxy) cannot represent; the Coverage Matrix presents AC-04 as covered (Priority #4). |
| test_cases.md | Minor | Section order differs from the template: Coverage Matrix last, no Negative-scenario applicability block, no per-TC `Severity`. |
| test_cases.md | Minor | The spec's promise that the response does not reveal whether an email is registered has no dedicated TC; it is exercised only incidentally inside `test_tc05`'s comparison. |
| test_cases.md | Minor | TC-07 expects exactly `400`; stricter than the rubric's `[400, 422]` (DRF returns 400 here, so not wrong). |
| test_cases.md | — | Verified: TC-01..09 sequential, all fields present, every AC/EC has a TC, every `[BOTH]` AC has a non-empty E2E column, EC-03 correctly marked out of scope. |
| test_ss.spec.ts | Major | TC-02 and TC-08 assert less than `test_cases.md` promises. TC-02 only checks `not.toHaveURL(/\/login$/)` — not that the Dashboard is reached or that tokens were stored. TC-08 claims validation happens "without a round trip" but does not intercept requests. |
| test_ss.spec.ts | Minor | Seeding now goes through the shared `createUserAsAdmin` helper (ADMIN-only endpoint) and needs `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`; there is still no cleanup, so every run leaves `TestQC-` accounts in the target database (no delete endpoint until UM-US-06). |
| test_ss.spec.ts | Minor | Misleading comment: TC-08 says "Fill every other required field first" but deliberately fills only the email. |
| verification-report.md | Minor | Run against `localhost`, noting "no LAN `<HOST_IP>` was configured"; `aif-sdlc.md` Step 5 requires deployment to the home-LAN host first. Disclosed, not reconciled. Its mention of seeding is unaffected, but it predates the ADMIN-only registration change. |
| verification-report.md | — | Spot-checks held: 6 integration tests map to TC-01/03/05/06/07/09, 3 e2e tests to TC-02/04/08, SRS §7.1.1, SDS §5.1.1 and SDS §6.3/§6.4.7/§6.4.8 exist. Re-run during UM-US-01: backend suite and e2e 3/3 pass. |
| Code-vs-plan drift | Minor | `login/page.tsx` shows "Invalid email or password." for any non-OK response (including `500`) and for network failures; a backend outage is reported as a credential error. |
| Code-vs-plan drift | Minor | FE-06 asks for inline *field-level* validation feedback; the login form has one form-level `#message-error` (a deliberate narrowing not noted in `plan.md`). |
| Code-vs-plan drift | — | Everything else spot-checked matches: `POST /api/v1/auth/login/` → `TokenObtainPairView`, `/auth/refresh/` → `TokenRefreshView`; Dashboard redirects to `/login` without a token; loading state disables the button. |

### 002-user-management (UM)

| Artifact | Severity | Finding |
|---|---|---|
| spec.md | Minor | EC-04 was reworded (email "longer than 150 characters") during the **Design** step after the spec was merged. Reasonable, but the rubric says gaps go back to the Spec step rather than being patched forward; the change was made without a separate spec branch/merge. |
| spec.md | — | Verified against `spec-template.md`: metadata blockquote, Overview with §6.1 link, per-story `Feature group`, inline-code actors, hard-break GWT, AC-01..05 / EC-01..09 sequential with 2–4-word names, no banned vague words, N/A justifications for concurrency / dependency timeout / AI error, Scope Boundary. SRS §7.2.1 keeps only the story statement; the spec link appears once on §7.2; SDS §5.2 has the plan link once and a Purpose-only §5.2.1. |
| checklists/requirements.md | Minor | Generated by copying `001`'s checklist with `sed`, not by reviewing this spec; every box is ticked, including "Success criteria are measurable", though this spec has no Success Criteria section. |
| plan.md | Minor | The Constitution Check marks Logging & Audit PASS partly on the claim that `401`/`403` "come from DRF defaults". Django's `django.request` logger does record them at `WARNING`, but without the acting User id the constitution asks for. |
| plan.md | Minor | Open tasks T1–T12 and `tasks.md` T001–T018 are two numbering schemes bridged only by "(plan Tn)" notes; T7 is struck out and has no counterpart. |
| plan.md | Minor | G8 originally classified `UserDetailView` as a "known open risk" without testing it; a probe during the audit showed a live account takeover. G8 is now marked resolved and says so; the lesson is that "known open risk" entries should be probed before a story is declared Done. |
| plan.md | — | Verified (re-checked after the move/fix): Pre-flight (9 gaps, 3 ambiguities, each resolved), Decisions D1–D7, Domain Objects, API Contracts (status/body table matches the live responses: `201`, `400` messages, `401`, `403`, `409 {"detail","code"}`), sequence diagram in Happy→Alternative→Negative order with no queries or bodies, Business Rules, all 8 Element IDs present in `page.tsx`, Quickstart steps reproduced by `curl` in the verification report, Complexity Tracking row for the `Role.code` casing exception. Flagged gaps G2 (first-ADMIN bootstrap), G8 (public endpoint) and G9 (role-aware nav) are real and were carried into SDS/RUNBOOK/constitution. |
| tasks.md | Minor | Lists the tests (T005–T007) before the implementation with "expected to FAIL until T008–T011", but in practice the service/serializer/view were written first and the tests after, so the red-then-green evidence the ordering implies does not exist. |
| tasks.md | — | Every AC/EC maps to a task; story labels, phases and dependencies follow the template; all tasks are checked and their outcomes verified (migrations apply on an empty DB; `makemigrations --check` clean). |
| test_cases.md | Minor | AC-04's first half ("can reach their own account and the actions a USER is permitted") is not asserted — TC-07 checks only `403` on creating accounts and the `USER`-only role. |
| test_cases.md | Minor | All four self-check boxes are ticked by the author, with no independent review of the rubric items behind them. |
| test_cases.md | — | Now at `specs/002-user-management/test_cases.md` (same-folder spec/plan links). Verified: per-story `## UM-US-01: Create a User (ADMIN)` heading, AC Classification table, Coverage Matrix with every `[BOTH]` AC having an e2e TC, Negative-scenario applicability, TC-01..20 sequential with US/Given/When/Then/AC/Type/Severity (TC-20 added with the security fix). |
| test_um.spec.ts | Minor | Each run leaves `TestQC-` accounts in the target database (no delete endpoint until UM-US-06) and needs ADMIN credentials in the environment. |
| test_um.spec.ts | Minor | TC-04 and TC-13 assert the message but not that no request was sent / no account was created; TC-02 proves the new User can log in via the API, not through the Login page. |
| verification-report.md | Minor | Run on `localhost` against a **scratch** SQLite database, not the LAN host or the developer's `db.sqlite3` (disclosed); the developer's database still needs `migrate` and a `createsuperuser` before UM-US-01 can be used there. |
| verification-report.md | Minor | Discloses that SS-US-01's e2e failed on a cold first run (TC-02/TC-04) and passed 3/3 on re-run, with the failure message not captured and the cause inferred, not diagnosed. |
| verification-report.md | — | Counts verified at the time: 14 integration + 5 e2e = 19 TCs (20 with TC-20, added by the security fix); full backend suite 23 tests (24 now); `npm run lint`/`build` clean; the manual `curl` spot check reproduces `401`/`201`/`409`/`200`. DOD-01..05 each substantiated. |
| Code-vs-plan | ~~Critical~~ **Resolved** | `UserDetailView` — see Priority #1. Verified live before the fix (a USER overwrote the ADMIN account, password stored unhashed); removed 2026-10-08, TC-20 guards it. |
| Code-vs-plan | Minor | Email is stored as typed (design D6) while login matches it exactly, so an account created as `Homer@Example.com` logs in only with that capitalization. Documented in the plan; not in the spec, and a likely surprise for a new User. |
| Code-vs-plan | Minor | `createsuperuser` accounts get an empty `full_name`, whereas SDS §2.2.1 treats `full_name` as non-null/meaningful and UM-US-01 requires it for every account created through the app. |
| Code-vs-plan | Minor | The `IntegrityError` → `409` branch in `create_user` (a simultaneous duplicate) has no test; the spec's concurrency case is justified as "same outcome as AC-03", but only the pre-check path is exercised. |
| Code-vs-plan | Minor | The Create User screen is reachable only by typing `/users/new` — no navigation entry and no role-aware hiding (FE-03; plan G9, spec Out of Scope). The ADMIN's primary way to use the story is therefore undiscoverable until UM-US-03 provides the caller's role. |
| Code-vs-plan | — | Verified (and re-run after the fix): `IsAdmin` returns `401` unauthenticated / `403` non-ADMIN; `create_user` is atomic, case-insensitive, and rolls back when the `USER` role is missing (TC-19); serializer exposes only `id`, `full_name`, `email`, `is_active`, `created_at` and never `password`; the public `GET /api/v1/users/` list and the `users/<id>/` route are gone; `makemigrations --check` clean; seed migration holds no credentials. |

### Project-level (templates, rubric, docs)

| Artifact | Severity | Finding |
|---|---|---|
| P1 `aif-review-checklist.md` | ~~Major~~ **Resolved** | Rewritten for PFM on 2026-10-08 (Process pattern 1). |
| P2 templates, `CLAUDE.md`, `aif-sdlc.md`, checklist | ~~Major~~ **Resolved** | Locations and names agree (Process pattern 2). |
| P3 `SRS.md` §7.2 vs constitution / `CLAUDE.md` / test seeding | ~~Major~~ **Resolved** by UM-US-01 | SRS was right: `POST /api/v1/users/` is now ADMIN-only; constitution §V, CLAUDE.md, README, RUNBOOK §9 and SDS §6 updated; SS tests/e2e seed through the ORM / the ADMIN endpoint. |
| P4 / P5 templates and spec file naming | ~~Minor~~ **Resolved** | Jira/GRM/OBMS wording removed; `test_[abbr].spec.ts` chosen. |
| P6 SRS §7 ↔ SDS §5 ToC | Minor | `constitution.md` requires story names to match exactly across the two ToCs. SRS shows `SS-US-01: Login (ADMIN, USER) [MVP]`; SDS shows `SS-US-01: Login (ADMIN, USER)`. The `[MVP]` tag is the only difference (same for SS-US-02). |
| P7 Process — `/speckit-*` and analyze gates | Major | UM-US-01's Spec, Design, Quality, Implementation and Verification artifacts were produced by hand from the templates and the AIF-SDLC prompts; none of `/speckit-specify|plan|tasks|analyze|implement` was invoked, no pre/post `/speckit-analyze` report was saved, and `.specify/feature.json` was edited manually. The outputs follow the templates, but the generated-artifact guarantees (hooks, consistency analysis) were not exercised, and Step 5 (deployment) was a local run, not a LAN deployment. |
| P8 Stale documentation after scaffolding `roles` | ~~Minor~~ **Resolved in this scan** | Fixed: constitution "Known open drift — Role" bullet, Package-by-Feature app list and the 409 example; CLAUDE.md `notifications/` comment; SRS §6.1 step 1 ("seeded via a migration"); `docs/debug-guide.md` (demo account via ADMIN); `docs/ss-us-01-What-AI-produces-and-How.md` (test seeding). |
| P9 Untracked `template/` folder | Minor | `template/{sds,srs}-template.md` sits untracked at the repo root, outside the `.specify/templates/` convention; not referenced by any document. |
| `SRS.md` §7.1/§7.2 spec links, `SDS.md` §5.1/§5.2 plan links | — | Each appears once on its Feature header; `.specify/feature.json` points at `specs/002-user-management`. |

---

## Stray, non-feature artifacts

- **`template/`** (untracked) — see P9.
- **`aif-artifact-audit.md` sits in the repo root.** Supporting documents live in `docs/`; this audit is a candidate for `docs/` too (nothing links to it except the review checklist's footer, which would need updating).
- **`e2e/node_modules/`** was reinstalled for the verification run — git-ignored, not a defect.
- Under `specs/` and `e2e/` there are no stray report folders (and no `.spec.ts` under `specs/`): `specs/<feature>/` now holds `spec.md`, `plan.md`, `test_cases.md`, `tasks.md`, `checklists/`; `e2e/001-system-security/` holds `test_ss.spec.ts` and `ss-us-01-login/`; `e2e/002-user-management/` holds `test_um.spec.ts` and `um-us-01-create-user/`; `e2e/support/api.ts` is the shared helper.

## Checks from the previous audit that came back clean here

Jira-key drift (n/a — no tracker); `sdlc.yaml` files (none); stale `file:line` citations in `plan.md` (none — files are cited without line numbers); dot-vs-hyphen sub-story separators (no sub-stories yet); stray `report/` folders (none); `TestQC-` naming (followed for users' full names; emails use a lower-case variant); per-step instrumentation in older suites (not applicable — `aif-sdlc.md` requires only `testInfo.attach()` screenshots, which both suites have).

---

## How this audit was produced

One pass by Claude Code reading every file under `specs/` and `e2e/`, the seven `.specify/templates/*.md`, `aif-review-checklist.md`, `aif-sdlc.md`, `constitution.md`, and the relevant SRS/SDS sections, then checking claims per artifact directly against `backend/` and `frontend/` source — including a live `curl` probe of `/api/v1/users/<id>/` against the scratch verification backend, which produced the Critical finding. The assistant that implemented UM-US-01 also performed this audit (Process pattern 5). A Critical/Major label reflects this single pass's own confidence, not a second independent check. Severity counts in the executive summary were tallied from the tags in the tables above.
