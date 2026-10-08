# Test Cases: System Security

Covers SS-US-01: Login (ADMIN, USER). Acceptance Criteria / Edge Cases refer to [../../specs/001-system-security/spec.md](../../specs/001-system-security/spec.md).

## AC/EC Classification

| ID | Description | Label | Reason |
|----|---|---|---|
| AC-01 | Successful login issues credentials | [BOTH] | Persistence/status-code behavior (API) + visible redirect and stored session (UI) |
| AC-02 | Invalid credentials rejected generically | [BOTH] | API status/body (API) + inline error text the User actually sees (UI) |
| AC-03 | Deactivated account login rejected | [API] | Same generic UI error text as AC-02 (see Assumption below) — no new UI behavior to cover at e2e level; API-level rejection is the only thing distinct about this case |
| AC-04 | Single login covers dual roles | [API] | Auth-only concern — no Role-gated UI exists yet to exercise at e2e level (constitution's documented "known open drift") |
| EC-01 | Missing email or password | [BOTH] | Field-level validation is API-enforced (400) and User-visible (inline message) |
| EC-02 | Repeated failed attempts | [API] | No lockout/rate-limit behavior specified — confirms no unintended state change, auth-only |
| EC-03 | Session/credential expiry | *(out of scope)* | Explicitly deferred to SS-US-02 Logout per spec.md — no test case written here |

**Assumption (UI copy, binding on implementation):** the login page shows exactly one generic message, **"Invalid email or password."**, for both AC-02 and AC-03 — the two cases are indistinguishable to the User by design. For EC-01 it shows **"Email and password are required."** These exact strings are asserted in the e2e tests below; Implementation must use this copy (or update spec/tests together if it changes).

## Test Cases

### TC-01: Successful login returns an access/refresh token pair

- **US:** SS-US-01
- **Given:** an active User account exists with a known email and password
- **When:** a `POST /api/v1/auth/login/` request is submitted with that email and password
- **Then:** the response is `200` and the body contains non-empty `access` and `refresh` tokens
- **AC:** AC-01
- **Type:** integration

### TC-02: Valid credentials log the User in and reach the Dashboard

- **US:** SS-US-01
- **Given:** an active User account exists and the User is on the Login page
- **When:** the User fills in their email and password and submits the form
- **Then:** the User is redirected away from the Login page (to the Dashboard) and a token is stored for subsequent requests
- **AC:** AC-01
- **Type:** e2e

### TC-03: Wrong password is rejected with one generic error

- **US:** SS-US-01
- **Given:** an active User account exists
- **When:** a login request is submitted with the correct email but an incorrect password
- **Then:** the response is `401` with a single generic error that does not name the incorrect field
- **AC:** AC-02
- **Type:** integration

### TC-04: Invalid credentials show the generic inline error

- **US:** SS-US-01
- **Given:** an active User account exists and the User is on the Login page
- **When:** the User submits a wrong password for that account
- **Then:** the page shows the inline message "Invalid email or password." and the User remains on the Login page
- **AC:** AC-02
- **Type:** e2e

### TC-05: Deactivated account is rejected even with correct credentials

- **US:** SS-US-01
- **Given:** a User account exists with `is_active = false`
- **When:** a login request is submitted with that account's correct email and password
- **Then:** the response is `401` with the same generic error used for wrong credentials (no mention of deactivation)
- **AC:** AC-03
- **Type:** integration

### TC-06: An account holding both ADMIN and USER roles logs in once

- **US:** SS-US-01
- **Given:** an active User account holds both the ADMIN and USER roles simultaneously
- **When:** a single login request is submitted with that account's correct credentials
- **Then:** the response is `200` with one token pair, with no additional per-role login step required or offered
- **AC:** AC-04
- **Type:** integration

### TC-07: Missing password is rejected at the API

- **US:** SS-US-01
- **Given:** any request payload
- **When:** a `POST /api/v1/auth/login/` request is submitted with `email` present but `password` omitted
- **Then:** the response is `400` with a field-level validation error for `password`
- **AC:** EC-01
- **Type:** integration

### TC-08: Missing password is caught by inline validation before submit

- **US:** SS-US-01
- **Given:** the User is on the Login page
- **When:** the User fills in only the email field and submits the form
- **Then:** the page shows the inline message "Email and password are required." without a round trip needed to reveal it, and the User remains on the Login page
- **AC:** EC-01
- **Type:** e2e

### TC-09: Repeated failed attempts get the same generic rejection, no lockout

- **US:** SS-US-01
- **Given:** an active User account exists
- **When:** three consecutive login requests are submitted with the wrong password
- **Then:** every attempt independently returns `401` with the same generic error — no lockout, rate-limit, or escalating response
- **AC:** EC-02
- **Type:** integration

## Coverage Matrix

| AC/EC | Label | Integration TC(s) | E2E TC(s) |
|---|---|---|---|
| AC-01 | BOTH | TC-01 | TC-02 |
| AC-02 | BOTH | TC-03 | TC-04 |
| AC-03 | API | TC-05 | — *(covered by TC-04's identical UI text — no new UI behavior)* |
| AC-04 | API | TC-06 | — *(auth-only, no UI to exercise)* |
| EC-01 | BOTH | TC-07 | TC-08 |
| EC-02 | API | TC-09 | — *(auth-only, no UI to exercise)* |
| EC-03 | *(out of scope)* | — | — *(explicitly deferred to SS-US-02 Logout per spec.md)* |

No `[BOTH]`/`[UI]` item has an empty E2E column, so there is no outstanding defect per the coverage rule.
