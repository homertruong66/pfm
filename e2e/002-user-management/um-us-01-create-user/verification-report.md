# Verification Report: UM-US-01 Create a User

**Date**: 2026-10-08
**App URL**: http://localhost:3000 (backend http://127.0.0.1:8000) — local verification, not the LAN host: no `<HOST_IP>` was configured for this pass. The backend ran against a **scratch SQLite database** created with `migrate` + `createsuperuser` (not the developer's `backend/db.sqlite3`), with the e2e ADMIN supplied through `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`.
**Playwright HTML report**: [index.html](index.html)

## Results

| TC-NN | Test Name | AC/EC | Type | Result | Notes |
|-------|-----------|-------|------|--------|-------|
| TC-01 | ADMIN creates a User and the new User can log in | AC-01 | integration | PASS | `backend/users/tests.py::test_tc01…`, re-run fresh |
| TC-02 | ADMIN creates a User through the Create User screen | AC-01 | e2e | PASS | Playwright, screenshots in HTML report |
| TC-03 | Missing email rejected at the API | AC-02 | integration | PASS | `test_tc03…` |
| TC-04 | Missing email shows "Email is required" | AC-02 | e2e | PASS | Playwright |
| TC-05 | Existing email rejected with "Account already exists" | AC-03 | integration | PASS | `test_tc05…` |
| TC-06 | Existing email shows "Account already exists" on the screen | AC-03 | e2e | PASS | Playwright |
| TC-07 | New account is a USER and cannot create accounts | AC-04 | integration | PASS | `test_tc07…` |
| TC-08 | Creation response never contains the password | AC-05 | integration | PASS | `test_tc08…` |
| TC-09 | Caller who is not logged in is rejected | EC-01 | integration | PASS | `test_tc09…` |
| TC-10 | USER-only caller rejected | EC-02 | integration | PASS | `test_tc10…` |
| TC-11 | USER on the Create User screen sees the access-denied message | EC-02 | e2e | PASS | Playwright; also confirms the account was not created |
| TC-12 | Missing full name or password rejected | EC-03 | integration | PASS | `test_tc12…` |
| TC-13 | Missing full name and password show their messages | EC-03 | e2e | PASS | Playwright |
| TC-14 | Invalid or over-long email rejected | EC-04 | integration | PASS | `test_tc14…` |
| TC-15 | Password shorter than 8 characters rejected | EC-05 | integration | PASS | `test_tc15…`, boundary 7 vs 8 |
| TC-16 | Full name longer than 150 characters rejected | EC-06 | integration | PASS | `test_tc16…`, boundary 151 vs 150 |
| TC-17 | Same email in a different capitalization is a duplicate | EC-07 | integration | PASS | `test_tc17…` |
| TC-18 | Non-English full name stored exactly as entered | EC-08 | integration | PASS | `test_tc18…` |
| TC-19 | Failure part-way leaves no account behind | EC-09 | integration | PASS | `test_tc19…`; failure induced by deleting the seeded `USER` role in the test database (no mocking) |

**19/19 test cases PASS** (14 integration via `python manage.py test`, 5 e2e via Playwright). 0 FAIL, 0 BLOCKED. Full backend suite: 23 tests OK (UM-US-01's 14 + SS-US-01's 6 + 3 role tests). `npm run lint` and `npm run build` pass.

**SS-US-01 regression (its e2e seeding was re-based on the ADMIN-only endpoint):** 3/3 pass. The *first* run on a cold dev server failed TC-02 and TC-04 (the failure message was not captured); immediately re-running TC-04 alone and then the whole suite passed 3/3. The cause was not investigated further and is most likely the Next dev server compiling `/login` on first use, but that is an inference, not a confirmed diagnosis.

## Manual spot check (beyond automation)

Run with `curl` against the live scratch-DB backend:
- `createsuperuser` granted the `ADMIN` role (`['ADMIN']`), confirming RUNBOOK §9.
- Anonymous `GET /api/v1/users/` → `401` (was a public list before this story); anonymous `POST /api/v1/users/` → `401`.
- ADMIN `POST` → `201` with `id`, `full_name`, `email`, `is_active`, `created_at` and no password; repeating it as `HOMER-manual@example.com` → `409 {"detail":"Account already exists","code":"USER_ALREADY_EXISTS"}`; the new account logged in with `200`.

The developer's own `backend/db.sqlite3` was **not** touched: it still needs `python manage.py migrate` (applies `roles` 0001–0002 and `users` 0002) and a `createsuperuser` run for an account that holds the `ADMIN` role before UM-US-01 can be used there.

## Verdict

All automated and manual checks pass. Per constitution.md's Definition of Done:
- DOD-01 (SRS/SDS traceability): SRS §7.2.1 + spec link on §7.2, SDS §5.2 plan link and §5.2.1, `API-UM-01` in §6.3/§6.5 — present
- DOD-02 (API contract documented): SDS §6.2.1, §6.3, §6.4.9, §6.6 (`USER_ALREADY_EXISTS`) — present
- DOD-03 (authorization verified): `401` (TC-09) and `403` (TC-10, TC-07, TC-11) tested
- DOD-04 (validation implemented): TC-03/12/14/15/16/17 — messages match the spec exactly
- DOD-05 (test coverage): happy path, error cases and the rollback case covered

**UM-US-01: Create a User is Done**, with these open points recorded rather than hidden: verification ran on localhost against a scratch database (no LAN deployment); the Create User screen is not linked from the navigation and is not hidden from non-ADMINs (FE-03 — plan G9, needs a role source such as UM-US-03); and `UserDetailView` (`users/<id>/`) is unchanged and still lets any authenticated caller read, update (including writing a plaintext password) or delete any account — to be fixed by UM-US-02/03/05/06 (plan G8).
