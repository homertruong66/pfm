# Verification Report: SS-US-01 Login

**Date**: 2026-07-23
**App URL**: http://localhost:3000 (local verification — no LAN `<HOST_IP>` was configured for this pass)
**Playwright HTML report**: [index.html](index.html)

## Results

| TC-NN | Test Name | AC/EC | Type | Result | Notes |
|-------|-----------|-------|------|--------|-------|
| TC-01 | Successful login returns access/refresh pair | AC-01 | integration | PASS | `backend/users/tests.py`, re-run fresh |
| TC-02 | Valid credentials log the User in, reach Dashboard | AC-01 | e2e | PASS | Playwright, screenshots in HTML report |
| TC-03 | Wrong password rejected with one generic error | AC-02 | integration | PASS | `backend/users/tests.py`, re-run fresh |
| TC-04 | Invalid credentials show generic inline error | AC-02 | e2e | PASS | Playwright, screenshots in HTML report |
| TC-05 | Deactivated account rejected, same generic error | AC-03 | integration | PASS | `backend/users/tests.py`, re-run fresh; also manually reproduced against the live `db.sqlite3` (not just the throwaway test DB) |
| TC-06 | Dual-role account, single login, one token pair | AC-04 | integration | PASS | `backend/users/tests.py`, re-run fresh |
| TC-07 | Missing password rejected with 400 | EC-01 | integration | PASS | `backend/users/tests.py`, re-run fresh; also manually reproduced against live app |
| TC-08 | Missing password caught by inline validation before submit | EC-01 | e2e | PASS | Playwright, screenshots in HTML report |
| TC-09 | Repeated failed attempts, no lockout | EC-02 | integration | PASS | `backend/users/tests.py`, re-run fresh |
| — | EC-03 (session/credential expiry) | EC-03 | *(out of scope)* | N/A | Explicitly deferred to SS-US-02 Logout per spec.md — no test case |

**9/9 in-scope test cases PASS.** 0 FAIL, 0 BLOCKED.

## Manual live-app spot check (beyond automation)

Automated integration tests run against Django's throwaway test database. To confirm the actual deployed app (`backend/db.sqlite3`) behaves identically, the following were additionally exercised live:
- Valid login → `200` with token pair
- Wrong password → `401`, `{"detail":"No active account found with the given credentials"}`
- Missing password → `400`
- Deactivating the test account then logging in with correct credentials → same `401`/generic body as wrong password, confirming AC-03/BR-16 live, not just in the test DB

All matched expected behavior; test account was reactivated afterward.

## Verdict

All automated ACs pass. Per constitution.md's Definition of Done (DOD-01..05):
- DOD-01 (SRS/SDS traceability): SRS §7.1.1, SDS §5.1.1, spec link, plan link — all present
- DOD-02 (API contract documented): SDS §6.3/§6.4.7/§6.4.8 — present
- DOD-03 (authorization verified): N/A — login is the public/unauthenticated endpoint itself
- DOD-04 (validation implemented): confirmed via TC-07/TC-08/EC-01
- DOD-05 (test coverage): 6 integration + 3 e2e, happy path + error cases covered

**SS-US-01: Login is Done.** No further ticket transition needed.
