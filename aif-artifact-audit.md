# AIF-SDLC Artifact Audit — PFM (open findings only)

> Scan of every feature under `specs/` (`001-system-security`, `002-user-management`) for consistency between its AI-generated spec-kit artifacts and this project's templates (`.specify/templates/*.md`), review rubric (`aif-review-checklist.md`), process definition (`aif-sdlc.md`) and governing documents (`constitution.md`, `SRS.md`, `SDS.md`), plus spot-checks against the backend/frontend code.
>
> *Last updated 2026-10-08 (develop @ `1327844`). **Resolved findings and "verified clean" notes have been removed — this file lists only what is still open.** Resolved so far: rubric/template carry-over from the previous project, artifact location and file-name conflicts (`test_cases.md` now lives in `specs/`), the SRS-vs-constitution registration contradiction, documentation made stale by the `roles` app, and the Critical `users/<id>/` account-takeover endpoint (removed; regression test TC-20).*

**Severity:** **Critical** = breaks traceability/correctness or hides a live bug; **Major** = a clear rule violation that isn't breaking anything today; **Minor** = cosmetic/formatting drift.

**Limits:** nothing here was independently reviewed — the same assistant implemented UM-US-01 and audited it. SS-US-01 results are quoted from its verification report; UM-US-01 was verified on `localhost` against a scratch database.

---

## Executive summary

| # | Scope | Critical | Major | Minor | Headline open issue |
|---|---|---|---|---|---|
| 1 | [001-system-security](#001-system-security-ss) | 0 | 6 | 14 | Login itself logs nothing (constitution § Logging & Audit); AC-04 (dual-role login) is reported PASS by a test that cannot distinguish dual-role from single-role — now fixable because `Role` exists |
| 2 | [002-user-management](#002-user-management-um) | 0 | 0 | 16 | Minor documentation and test-depth gaps; verified on localhost against a scratch database |
| 3 | [Project-level](#project-level) | 0 | 1 | 2 | UM-US-01's steps were carried out by hand: no `/speckit-*` skill run and no `/speckit-analyze` report |
| | **Total** | **0** | **7** | **32** | |

---

## Open process-level patterns

1. **Playwright rules in `aif-sdlc.md` target another project's UI.** `[role="option"]` dropdowns, "filter panel not toggled manually — `#search-*`/`#btn-search`", `RoleGuard` inline access-denied messages and pagination-before-row-actions have no counterpart in PFM's UI yet. Not needed for the login or Create User screens; they will matter once list/CRUD screens are tested.
2. **Spec-kit analyze reports are not persisted (two features).** Step 4 requires pre- and post-implementation `/speckit-analyze` reports with zero Critical/High findings; none exist for either feature, so the gate cannot be audited after the fact.
3. **Self-review blind spot.** The assistant that implements a story also writes its test cases, runs its verification and audits it. A "known open risk" in a Verdict was not probed until the audit (it turned out to be an account takeover). Keep a human review of each Verdict section.

---

## Priority findings (fix first)

1. **The six steps were hand-run, with no recorded `/speckit-analyze` gate** (process pattern 2, P7).
2. **No auth-event logging on login itself.** `constitution.md` § Logging & Audit requires login success/failure at `INFO`/`WARN`. `create_user` logs and a `LOGGING` config exists, but SS-US-01's login is the stock `TokenObtainPairView` and logs nothing of its own (Django's `django.request` logs the `401`, not who). SS `plan.md`'s Constitution Check still omits Logging & Audit.
3. **AC-04 (dual-role single login) is still not really verified.** `Role` now exists, so TC-06 can seed an account holding both roles; the test still uses `is_staff`/`is_superuser` and asserts only the `{access, refresh}` shape, which every account satisfies. Update `specs/001-system-security/test_cases.md` TC-06 and `backend/users/tests.py::test_tc06…`.
4. **Token storage was never decided in SS `plan.md`.** Both JWTs live in `localStorage` (`pfm_access_token`, `pfm_refresh_token`); the Dashboard guard and the Create User page depend on it. Security-relevant (XSS exposure of a 7-day refresh token) and absent from `plan.md`/SDS §5.1.1 as a decision.

---

## Open findings per feature

### 001-system-security (SS)

| Artifact | Severity | Finding |
|---|---|---|
| spec.md | Minor | Boundary values, concurrency and dependency timeout (3 of the 7 mandatory Edge Case categories) are not specified; the spec's closing comment says so rather than justifying them as N/A, because login plausibly has behavior there (e.g. two simultaneous logins, database unavailable) that needs a decision first. |
| checklists/requirements.md | Minor | Still ticks "Success criteria are measurable" / "Feature meets measurable outcomes", but the rewritten spec (per the template) has no Success Criteria section — those items are vacuous. Re-review against the new spec. |
| plan.md | Major | No `### Pre-flight: Spec Review Findings` section and no `### Open tasks` section, both required by `plan-template.md` and Step 2 of the rubric. Gaps that were clearly present (AC-04 unverifiable without `Role`; token storage; EC-03 deferral) are not recorded as findings. |
| plan.md | Major | Constitution Check omits Logging & Audit (Priority #2). |
| plan.md | Major | Decisions & Rationale defers token storage ("None evaluated at this phase"); the actual implementation (`localStorage`) was never written back (Priority #4). |
| plan.md | Minor | Technical Context → Testing says "no frontend test runner is set up yet, so the login page is verified manually"; a Playwright runner and suite were added in the same story. Its "No `Role` entity exists yet … AC-04 holds by the absence of any role-gated check" note is also stale since UM-US-01. |
| plan.md | Minor | Project Structure: `tasks.md` is still annotated "Phase 2 output (/speckit-tasks — not created by this command)" though it exists; `checklists/requirements.md` and `test_cases.md` are not listed; the `logout/` entry is mis-indented. |
| tasks.md | Minor | T011 specifies the generic error "on a `400`/`401`"; the code shows it for every non-OK response and for any thrown network error. |
| tasks.md | Minor | T017 (add the Playwright runner) and T018 (validate in a real browser) were appended to Phase 4 after the fact; T017 is a prerequisite of the Phase 3 checkpoint's "confirmed end-to-end" claim, so the stated phase order no longer reflects the dependency order. |
| test_cases.md | Major | No per-story `## SS-US-01: Login (ADMIN, USER)` heading — one H1 plus a "Covers SS-US-01…" sentence and a `**US:**` field per TC. The template requires the `(ACTOR)` heading (`specs/002-user-management/test_cases.md` shows the intended shape). |
| test_cases.md | Major | TC-06's Given ("holds both the ADMIN and USER roles") describes a state its automation (an `is_staff`/`is_superuser` proxy) cannot represent; the Coverage Matrix presents AC-04 as covered (Priority #3). |
| test_cases.md | Minor | Section order differs from the template: Coverage Matrix last, no Negative-scenario applicability block, no per-TC `Severity`. |
| test_cases.md | Minor | The spec's promise that the response does not reveal whether an email is registered has no dedicated TC; it is exercised only incidentally inside `test_tc05`'s comparison. |
| test_cases.md | Minor | TC-07 expects exactly `400`; stricter than the rubric's `[400, 422]` (DRF returns 400 here, so not wrong). |
| test_ss.spec.ts | Major | TC-02 and TC-08 assert less than `test_cases.md` promises. TC-02 only checks `not.toHaveURL(/\/login$/)` — not that the Dashboard is reached or that tokens were stored. TC-08 claims validation happens "without a round trip" but does not intercept requests. |
| test_ss.spec.ts | Minor | Seeding goes through the shared `createUserAsAdmin` helper and needs `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`; there is no cleanup, so every run leaves `TestQC-` accounts in the target database (no delete endpoint until UM-US-06). |
| test_ss.spec.ts | Minor | Misleading comment: TC-08 says "Fill every other required field first" but deliberately fills only the email. |
| verification-report.md | Minor | Run against `localhost`, noting "no LAN `<HOST_IP>` was configured"; `aif-sdlc.md` Step 5 requires deployment to the home-LAN host first. Disclosed, not reconciled. |
| Code-vs-plan drift | Minor | `login/page.tsx` shows "Invalid email or password." for any non-OK response (including `500`) and for network failures; a backend outage is reported as a credential error. |
| Code-vs-plan drift | Minor | FE-06 asks for inline *field-level* validation feedback; the login form has one form-level `#message-error` (a deliberate narrowing not noted in `plan.md`). |

### 002-user-management (UM)

| Artifact | Severity | Finding |
|---|---|---|
| spec.md | Minor | EC-04 was reworded (email "longer than 150 characters") during the **Design** step after the spec was merged. Reasonable, but the rubric says gaps go back to the Spec step rather than being patched forward. |
| checklists/requirements.md | Minor | Generated by copying `001`'s checklist with `sed`, not by reviewing this spec; every box is ticked, including "Success criteria are measurable", though this spec has no Success Criteria section. |
| plan.md | Minor | The Constitution Check marks Logging & Audit PASS partly on the claim that `401`/`403` "come from DRF defaults". Django's `django.request` logger records them at `WARNING`, but without the acting User id the constitution asks for. |
| plan.md | Minor | Open tasks T1–T12 and `tasks.md` T001–T018 are two numbering schemes bridged only by "(plan Tn)" notes; T7 is struck out and has no counterpart. |
| plan.md | Minor | G8 originally classified `UserDetailView` as a "known open risk" without testing it; a probe later showed a live account takeover (since fixed). Lesson: probe "known open risk" entries before declaring a story Done. |
| tasks.md | Minor | Lists the tests (T005–T007) before the implementation with "expected to FAIL until T008–T011", but the service/serializer/view were written first and the tests after, so the red-then-green evidence the ordering implies does not exist. |
| test_cases.md | Minor | AC-04's first half ("can reach their own account and the actions a USER is permitted") is not asserted — TC-07 checks only `403` on creating accounts and the `USER`-only role. |
| test_cases.md | Minor | All four self-check boxes are ticked by the author, with no independent review of the rubric items behind them. |
| test_um.spec.ts | Minor | Each run leaves `TestQC-` accounts in the target database (no delete endpoint until UM-US-06) and needs ADMIN credentials in the environment. |
| test_um.spec.ts | Minor | TC-04 and TC-13 assert the message but not that no request was sent / no account was created; TC-02 proves the new User can log in via the API, not through the Login page. |
| verification-report.md | Minor | Run on `localhost` against a **scratch** SQLite database, not the LAN host or the developer's `db.sqlite3`; the developer's database still needs `migrate` and a `createsuperuser` before UM-US-01 can be used there. |
| verification-report.md | Minor | SS-US-01's e2e failed on a cold first run (TC-02/TC-04) and passed 3/3 on re-run; the failure message was not captured and the cause was inferred, not diagnosed. The UM e2e suite was also not re-run after the `users/<id>/` removal (it does not touch that route). |
| Code-vs-plan | Minor | Email is stored as typed (design D6) while login matches it exactly, so an account created as `Homer@Example.com` logs in only with that capitalization. Documented in the plan; not in the spec, and a likely surprise for a new User. |
| Code-vs-plan | Minor | `createsuperuser` accounts get an empty `full_name`, whereas SDS §2.2.1 treats `full_name` as non-null/meaningful and UM-US-01 requires it for every account created through the app. |
| Code-vs-plan | Minor | The `IntegrityError` → `409` branch in `create_user` (a simultaneous duplicate) has no test; the spec's concurrency case is justified as "same outcome as AC-03", but only the pre-check path is exercised. |
| Code-vs-plan | Minor | The Create User screen is reachable only by typing `/users/new` — no navigation entry and no role-aware hiding (FE-03; plan G9, spec Out of Scope). The ADMIN's primary way to use the story is undiscoverable until UM-US-03 provides the caller's role. |

### Project-level

| Artifact | Severity | Finding |
|---|---|---|
| P6 SRS §7 ↔ SDS §5 ToC | Minor | `constitution.md` requires story names to match exactly across the two ToCs. SRS shows `SS-US-01: Login (ADMIN, USER) [MVP]`; SDS shows `SS-US-01: Login (ADMIN, USER)`. The `[MVP]` tag is the only difference (same for SS-US-02). |
| P7 Process — `/speckit-*` and analyze gates | Major | UM-US-01's Spec, Design, Quality, Implementation and Verification artifacts were produced by hand from the templates and the AIF-SDLC prompts; none of `/speckit-specify|plan|tasks|analyze|implement` was invoked, no pre/post `/speckit-analyze` report was saved, and `.specify/feature.json` was edited manually. The outputs follow the templates, but the generated-artifact guarantees were not exercised, and Step 5 (deployment) was a local run, not a LAN deployment. |
| P9 Untracked `template/` folder | Minor | `template/{sds,srs}-template.md` sits untracked at the repo root, outside the `.specify/templates/` convention; not referenced by any document. |

---

## Other housekeeping

- `aif-artifact-audit.md` sits in the repo root; supporting documents live in `docs/`. Moving it needs the review checklist footer link updated.

---

*Produced by one pass of Claude Code over `specs/`, `e2e/`, the templates, rubric, process and governing documents, with claims spot-checked against `backend/` and `frontend/`. Counts in the executive summary were tallied from the tables above (Critical 0, Major 6+0+1, Minor 14+16+2).*
