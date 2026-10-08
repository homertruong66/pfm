# Test Cases: System Security (SS)

> **Spec:** [spec.md](spec.md) | **Plan:** [plan.md](plan.md)  
> **Created:** 2026-07-21 | **Updated:** 2026-10-08 — restructured to the template (per-story heading, Severity, Coverage Matrix order); TC-06 rewritten with real roles; added TC-10, TC-11

## SS-US-01: Login (ADMIN, USER)

### AC Classification

| AC | Classification | Rationale |
|----|-----------------|-----------|
| AC-03 — Deactivated account rejected | API | Same generic UI error text as AC-02 (see the UI-copy assumption below) — no new UI behavior to cover at e2e level; only the API-level rejection is distinct |
| AC-04 — Single login for dual roles | API | Role outcome of the token, verified against the API; no Role-gated screen exists to exercise at e2e level |
| EC-02 — Repeated failed attempts | API | No lockout/rate-limit specified — confirms no unintended state change, auth-only |
| EC-03 — Credential expiry | *(out of scope)* | Explicitly deferred (spec Out of Scope) — no test case written here |

**Assumption (UI copy, binding on implementation):** the login page shows exactly one generic message, **"Invalid email or password."**, for both AC-02 and AC-03 — the two cases are indistinguishable to the User by design. For EC-01 it shows **"Email and password are required."** Any non-credential failure (a `5xx`, or the server being unreachable) shows a different, neutral message. These exact strings are asserted in the e2e tests below; Implementation must use this copy (or update spec/tests together if it changes).

### Coverage Matrix

| AC/EC | Label | Integration TC(s) | E2E TC(s) |
|---|---|---|---|
| AC-01 — Successful login | BOTH | TC-01, TC-11 | TC-02 |
| AC-02 — Invalid credentials rejected | BOTH | TC-03, TC-10, TC-11 | TC-04 |
| AC-03 — Deactivated account rejected | API | TC-05 | — *(covered by TC-04's identical UI text — no new UI behavior)* |
| AC-04 — Single login for dual roles | API | TC-06 | — *(role outcome of the token, no UI to exercise)* |
| EC-01 — Empty email or password | BOTH | TC-07 | TC-08 |
| EC-02 — Repeated failed attempts | API | TC-09 | — *(auth-only, no UI to exercise)* |
| EC-03 — Credential expiry | *(out of scope)* | — | — *(deferred per spec Out of Scope)* |

- [x] Self-checked against [aif-review-checklist.md § `test_cases.md` — Coverage](../../aif-review-checklist.md#test_casesmd--coverage)

### Negative-scenario applicability

- **Authentication (401):** this story *is* the authentication entry point — covered by TC-03, TC-05, TC-10.
- **Authorization (403):** N/A for login itself; the role outcome of the issued token is covered by TC-06.
- **Not found:** an unregistered email is indistinguishable from a wrong password — TC-10.
- **Business rule conflicts:** N/A — login creates nothing.
- **Invalid / missing / malformed input:** TC-07, TC-08. Boundary values are not specified by the spec (see its closing comment).

### Test Cases

### TC-01: Successful login returns an access/refresh token pair
- **US:** SS-US-01
- **Given:** an active User account exists with a known email and password
- **When:** a `POST /api/v1/auth/login/` request is submitted with that email and password
- **Then:** the response is `200` and the body contains non-empty `access` and `refresh` tokens
- **AC:** AC-01
- **Type:** integration
- **Severity:** Critical

### TC-02: Valid credentials log the User in and reach the Dashboard
- **US:** SS-US-01
- **Given:** an active User account exists and the User is on the Login page
- **When:** the User fills in their email and password and submits the form
- **Then:** the User lands on the Dashboard (not the Login page)
  - **And** the access and refresh tokens are stored for subsequent requests
- **AC:** AC-01
- **Type:** e2e
- **Severity:** Critical

### TC-03: Wrong password is rejected with one generic error
- **US:** SS-US-01
- **Given:** an active User account exists
- **When:** a login request is submitted with the correct email but an incorrect password
- **Then:** the response is `401` with a single generic error that does not name the incorrect field
- **AC:** AC-02
- **Type:** integration
- **Severity:** Major

### TC-04: Invalid credentials show the generic inline error
- **US:** SS-US-01
- **Given:** an active User account exists and the User is on the Login page
- **When:** the User submits a wrong password for that account
- **Then:** the page shows the inline message "Invalid email or password." and the User remains on the Login page
- **AC:** AC-02
- **Type:** e2e
- **Severity:** Major

### TC-05: Deactivated account is rejected even with correct credentials
- **US:** SS-US-01
- **Given:** a User account exists with `is_active = false`
- **When:** a login request is submitted with that account's correct email and password
- **Then:** the response is `401` with the same generic error used for wrong credentials (no mention of deactivation)
- **AC:** AC-03
- **Type:** integration
- **Severity:** Major

### TC-06: An account holding both ADMIN and USER roles logs in once
- **US:** SS-US-01
- **Given:** an active User account holds both the ADMIN and USER roles simultaneously, and a second active account holds only the USER role
- **When:** a single login request is submitted with the dual-role account's correct credentials
- **Then:** the response is `200` with one token pair, with no additional per-role login step required or offered
  - **And** that one token is accepted for an ADMIN-only action (creating a User, `201`) and for a USER action (listing the account's own Wallets, `200`)
  - **And** the same ADMIN-only action with the USER-only account's token is refused (`403`) — the control that shows the dual-role result comes from the roles held
- **AC:** AC-04
- **Type:** integration
- **Severity:** Critical
- **Note:** previously proxied with `is_staff`/`is_superuser` and asserted only the response shape, which any account satisfies; rewritten once the `Role` entity existed (UM-US-01).

### TC-07: Missing password is rejected at the API
- **US:** SS-US-01
- **Given:** any request payload
- **When:** a `POST /api/v1/auth/login/` request is submitted with `email` present but `password` omitted
- **Then:** the response is `400` with a field-level validation error for `password`
- **AC:** EC-01
- **Type:** integration
- **Severity:** Major
- **Note:** asserts exactly `400` (what DRF returns for a missing field) rather than the rubric's `[400, 422]` — stricter, not looser.

### TC-08: Missing password is caught by inline validation before submit
- **US:** SS-US-01
- **Given:** the User is on the Login page
- **When:** the User fills in only the email field and submits the form
- **Then:** the page shows the inline message "Email and password are required." and the User remains on the Login page
  - **And** no login request was sent to the API
- **AC:** EC-01
- **Type:** e2e
- **Severity:** Major

### TC-09: Repeated failed attempts get the same generic rejection, no lockout
- **US:** SS-US-01
- **Given:** an active User account exists
- **When:** three consecutive login requests are submitted with the wrong password
- **Then:** every attempt independently returns `401` with the same generic error — no lockout, rate-limit, or escalating response
  - **And** a following login with the correct password still succeeds (`200`)
- **AC:** EC-02
- **Type:** integration
- **Severity:** Minor

### TC-10: An unregistered email gets the same generic rejection as a wrong password
- **US:** SS-US-01
- **Given:** an active User account exists, and a second email address has no account
- **When:** one login request uses the unregistered email and another uses the registered email with a wrong password
- **Then:** both return `401` with identical bodies, so the response never reveals whether an email is registered
- **AC:** AC-02
- **Type:** integration
- **Severity:** Major

### TC-11: Login events are logged without credentials
- **US:** SS-US-01
- **Given:** an active User account exists
- **When:** one login succeeds and one fails with a wrong password
- **Then:** the success is logged at `INFO` and the failure (`401`) at `WARN`
  - **And** no log line contains the email, the password or a token
- **AC:** AC-01, AC-02
- **Type:** integration
- **Severity:** Major
- **Note:** exists for constitution § Logging & Audit (log authentication events without sensitive data) rather than a spec AC; it is tied to AC-01/AC-02 because those are the events logged.

- [x] Self-checked against [aif-review-checklist.md § `test_cases.md` — Structure](../../aif-review-checklist.md#test_casesmd--structure)
- [x] Self-checked against [aif-review-checklist.md § Playwright Code — Integration Tests](../../aif-review-checklist.md#playwright-code--integration-tests)
- [x] Self-checked against [aif-review-checklist.md § Playwright Code — E2E Tests](../../aif-review-checklist.md#playwright-code--e2e-tests)
- [x] Self-checked against [aif-review-checklist.md § Playwright Code — General](../../aif-review-checklist.md#playwright-code--general)
