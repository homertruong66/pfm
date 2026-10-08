# AIF-SDLC Artifact Audit — PFM (open findings only)

> Scan of every feature under `specs/` (`001-system-security`, `002-user-management`) for consistency between its AI-generated spec-kit artifacts and this project's templates (`.specify/templates/*.md`), review rubric (`aif-review-checklist.md`), process definition (`aif-sdlc.md`) and governing documents (`constitution.md`, `SRS.md`, `SDS.md`), plus spot-checks against the backend/frontend code.
>
> *Last updated 2026-10-08. **This file lists only what is still open.** Everything else found so far has been fixed, including: the rubric/template carry-over from the previous project; artifact location and naming conflicts; the SRS-vs-constitution registration contradiction; the open `users/<id>/` account-takeover endpoint (removed, TC-20); SS-US-01's AC-04 test (real roles, USER-only control); login/401/403 logging; the SS plan's missing Pre-flight, Logging and token-storage decisions; SS `test_cases.md` restructure plus the unregistered-email and logging cases; the weak TC-02/TC-08 e2e assertions; the login page showing a credential error for non-credential failures; `createsuperuser` now requiring a full name; the `IntegrityError` path test; both feature checklists; the SRS↔SDS `[MVP]` ToC drift.*

**Severity:** **Critical** = breaks traceability/correctness or hides a live bug; **Major** = a clear rule violation that isn't breaking anything today; **Minor** = cosmetic/formatting drift.

**Limits:** nothing here was independently reviewed — the same assistant implemented UM-US-01, fixed these findings and re-audited them. SS-US-01's original verification results are quoted from its report (its backend and e2e suites were re-run during later work); UM-US-01 was verified on `localhost` against a scratch database.

---

## Executive summary

| # | Scope | Critical | Major | Minor | Headline open issue |
|---|---|---|---|---|---|
| 1 | [001-system-security](#001-system-security-ss) | 0 | 0 | 3 | Three Edge Case categories unspecified; e2e leaves test accounts behind; verified on localhost only |
| 2 | [002-user-management](#002-user-management-um) | 0 | 0 | 7 | Mostly process-history and discoverability items; the Create User screen is only reachable by typing its URL |
| 3 | [Project-level](#project-level) | 0 | 1 | 1 | UM-US-01's steps were carried out by hand: no `/speckit-*` skill run and no `/speckit-analyze` report |
| | **Total** | **0** | **1** | **11** | |

---

## Open process-level patterns

1. **Playwright rules in `aif-sdlc.md` target another project's UI.** `[role="option"]` dropdowns, "filter panel not toggled manually — `#search-*`/`#btn-search`", `RoleGuard` inline access-denied messages and pagination-before-row-actions have no counterpart in PFM's UI yet. Not needed for the login or Create User screens; they will matter once list/CRUD screens are tested.
2. **Spec-kit analyze reports are not persisted (two features).** Step 4 requires pre- and post-implementation `/speckit-analyze` reports with zero Critical/High findings; none exist for either feature, so the gate cannot be audited after the fact.
3. **Self-review blind spot.** The assistant that implements a story also writes its test cases, runs its verification and audits it. A "known open risk" in a Verdict was not probed until the audit (it turned out to be an account takeover). Keep a human review of each Verdict section.

---

## Priority findings

1. **The six steps were hand-run, with no recorded `/speckit-analyze` gate** (process pattern 2, P7). The only Major finding left.
2. **Accepted risk, not a finding:** both JWTs are kept in `localStorage` (documented in SS `plan.md`, "Known risk"); revisit with SS-US-02 Logout.

---

## Open findings per feature

### 001-system-security (SS)

| Artifact | Severity | Finding |
|---|---|---|
| spec.md | Minor | Boundary values, concurrency and dependency timeout (3 of the 7 mandatory Edge Case categories) are not specified; the spec's closing comment says so rather than justifying them as N/A, because login plausibly has behavior there (e.g. two simultaneous logins, database unavailable) that needs a decision first. |
| test_ss.spec.ts | Minor | Seeding goes through the shared `createUserAsAdmin` helper and needs `E2E_ADMIN_EMAIL`/`E2E_ADMIN_PASSWORD`; there is no cleanup, so every run leaves `TestQC-` accounts in the target database (no delete endpoint until UM-US-06). |
| verification-report.md | Minor | Run against `localhost` ("no LAN `<HOST_IP>` was configured"); `aif-sdlc.md` Step 5 requires deployment to the home-LAN host first. Disclosed, not reconciled. |

### 002-user-management (UM)

| Artifact | Severity | Finding |
|---|---|---|
| spec.md | Minor | EC-04 was reworded (email "longer than 150 characters") during the **Design** step after the spec was merged. Reasonable, but the rubric says gaps go back to the Spec step rather than being patched forward. Historical; cannot be undone. |
| test_cases.md | Minor | All four self-check boxes are ticked by the author, with no independent review of the rubric items behind them. |
| test_um.spec.ts | Minor | Each run leaves `TestQC-` accounts in the target database (no delete endpoint until UM-US-06) and needs ADMIN credentials in the environment. |
| verification-report.md | Minor | Run on `localhost` against a **scratch** SQLite database, not the LAN host or the developer's `db.sqlite3`; the developer's database still needs `migrate` (now through `users` 0003) and a `createsuperuser` (which now asks for a full name) before UM-US-01 can be used there. |
| verification-report.md | Minor | SS-US-01's e2e failed twice on one cold first run (before the e2e/doc fixes) and passed 3/3 on every later run, including a fresh cold start of both servers; the original failure message was never captured and the cause could not be reproduced or diagnosed. |
| Code-vs-plan | Minor | Email is stored as typed (design D6) while login matches it exactly, so an account created as `Homer@Example.com` logs in only with that capitalization. Documented in the plan; not in the spec, and a likely surprise for a new User. Fixing it means changing the authentication backend — a design decision. |
| Code-vs-plan | Minor | The Create User screen is reachable only by typing `/users/new` — no navigation entry and no role-aware hiding (FE-03; plan G9, spec Out of Scope). The ADMIN's primary way to use the story is undiscoverable until UM-US-03 provides the caller's role. |

### Project-level

| Artifact | Severity | Finding |
|---|---|---|
| P7 Process — `/speckit-*` and analyze gates | Major | UM-US-01's Spec, Design, Quality, Implementation and Verification artifacts were produced by hand from the templates and the AIF-SDLC prompts; none of `/speckit-specify|plan|tasks|analyze|implement` was invoked, no pre/post `/speckit-analyze` report was saved, and `.specify/feature.json` was edited manually. The outputs follow the templates, but the generated-artifact guarantees were not exercised, and Step 5 (deployment) was a local run, not a LAN deployment. |
| P9 Untracked `template/` folder | Minor | `template/{sds,srs}-template.md` sits untracked at the repo root, outside the `.specify/templates/` convention; not referenced by any document. |

---

## Other housekeeping

- `aif-artifact-audit.md` sits in the repo root; supporting documents live in `docs/`. Moving it needs the review checklist footer link updated.

---

*Produced by Claude Code over `specs/`, `e2e/`, the templates, rubric, process and governing documents, with claims spot-checked against `backend/` and `frontend/`. Counts in the executive summary were tallied from the tables above (Critical 0, Major 0+0+1, Minor 3+7+1).*
