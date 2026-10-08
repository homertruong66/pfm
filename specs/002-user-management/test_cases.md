# Test Cases: User Management (UM)

> **Spec:** [spec.md](spec.md) | **Plan:** [plan.md](plan.md)  
> **Created:** 2026-10-08 | **Updated:** 2026-10-08 — added TC-22 (email stored in lower case); TC-20 (no account-by-id endpoint) and TC-21 (database-level duplicate); TC-07 now also asserts the new User reaches its own data; TC-10 asserts the 403 is logged

## UM-US-01: Create a User (ADMIN)

### AC Classification

| AC | Classification | Rationale |
|----|-----------------|-----------|
| AC-04 — New account is a USER only | API | Role/permission outcome; no UI is offered to a USER for this action (the page is not linked anywhere — plan G9) |
| AC-05 — Initial password never shown | API | A property of the response body; the page never echoes the password field |
| EC-01 — Not logged in | API | Pure auth rejection; the page redirects to the Login page, already covered by SS-US-01's flow |
| EC-04 — Invalid email format | API | The page renders the API's field message through the same path TC-04 exercises for AC-02 — no new UI behavior |
| EC-05 — Initial password too short | API | Same as EC-04 |
| EC-06 — Full name too long | API | Same as EC-04 |
| EC-07 — Same email, different capitalization | API | Same rejection path as AC-03; the capitalization rule lives in the API |
| EC-08 — Non-English full name | API | Persistence/round-trip behavior of the API |
| EC-09 — Creation fails part-way | API | Atomicity of the write; cannot be triggered from the browser |

### Coverage Matrix

| AC/EC | Label | Integration TC(s) | E2E TC(s) |
|---|---|---|---|
| AC-01 — Account created | BOTH | TC-01 | TC-02 |
| AC-02 — Email required | BOTH | TC-03 | TC-04 |
| AC-03 — Existing account rejected | BOTH | TC-05, TC-21 | TC-06 |
| AC-04 — New account is a USER only | API | TC-07 | — *(auth/role outcome, no UI to exercise)* |
| AC-05 — Initial password never shown | API | TC-08 | — *(response property, no UI to exercise)* |
| EC-01 — Not logged in | API | TC-09 | — *(pure auth rejection)* |
| EC-02 — Caller is a USER, not an ADMIN | BOTH | TC-10, TC-20 | TC-11 |
| EC-03 — Full name or password missing | BOTH | TC-12 | TC-13 |
| EC-04 — Invalid email format | API | TC-14 | — *(same inline path as TC-04)* |
| EC-05 — Initial password too short | API | TC-15 | — *(same inline path as TC-04)* |
| EC-06 — Full name too long | API | TC-16 | — *(same inline path as TC-04)* |
| EC-07 — Same email, different capitalization | API | TC-17 | — *(same rejection path as TC-06)* |
| EC-08 — Non-English full name | API | TC-18 | — *(API round-trip)* |
| EC-09 — Creation fails part-way | API | TC-19 | — *(atomicity, not triggerable from the browser)* |
| EC-10 — Email stored in lower case | API | TC-22 | — *(storage rule of the API)* |

- [x] Self-checked against [aif-review-checklist.md § `test_cases.md` — Coverage](../../aif-review-checklist.md#test_casesmd--coverage)

### Negative-scenario applicability

- **Authentication (401):** covered by TC-09.
- **Authorization (403):** covered by TC-10 and TC-11 (USER-only caller) and TC-07 (the new User cannot create accounts); TC-20 covers that no one can read, change or delete another account through this feature.
- **Not found:** N/A — creating a User references no existing record.
- **Business rule conflicts (409):** covered by TC-05, TC-17.
- **Invalid / missing / malformed / boundary input:** TC-03, TC-12, TC-14, TC-15, TC-16.

### Test Cases

### TC-01: ADMIN creates a User and the new User can log in
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in
- **When:** the ADMIN submits `POST /api/v1/users/` with a full name, a new email and an initial password
- **Then:** the response is `201` with the account's `id`, `full_name`, `email`, `is_active = true` and `created_at`
  - **And** a login request (`POST /api/v1/auth/login/`) with that email and password returns `200` with an `access` and a `refresh` token
- **AC:** AC-01
- **Type:** integration
- **Severity:** Critical

### TC-02: ADMIN creates a User through the Create User screen
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in and on the Create User screen
- **When:** the ADMIN fills in a full name, a new email and an initial password and clicks Create
- **Then:** the page shows "User account created"
  - **And** the new account can log in with that email and password
- **AC:** AC-01
- **Type:** e2e
- **Severity:** Critical

### TC-03: Missing email is rejected at the API
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in
- **When:** `POST /api/v1/users/` is submitted with a full name and password but no `email`
- **Then:** the response is `400` with the field error "Email is required" under `email`
  - **And** no account is created
- **AC:** AC-02
- **Type:** integration
- **Severity:** Major

### TC-04: Missing email shows "Email is required" on the screen
- **US:** UM-US-01
- **Given:** an `ADMIN` is on the Create User screen
- **When:** the ADMIN fills in only a full name and a password and clicks Create
- **Then:** the page shows "Email is required" next to the email field
  - **And** no success message appears
- **AC:** AC-02
- **Type:** e2e
- **Severity:** Major

### TC-05: An email already in use is rejected with "Account already exists"
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in and an account with a given email exists
- **When:** `POST /api/v1/users/` is submitted with that same email
- **Then:** the response is `409` with `detail` "Account already exists" and `code` `USER_ALREADY_EXISTS`
  - **And** only one account with that email exists
- **AC:** AC-03
- **Type:** integration
- **Severity:** Major

### TC-06: An email already in use shows "Account already exists" on the screen
- **US:** UM-US-01
- **Given:** an `ADMIN` is on the Create User screen and an account with a given email exists
- **When:** the ADMIN fills in a full name, that same email and a password and clicks Create
- **Then:** the page shows "Account already exists"
  - **And** no success message appears
- **AC:** AC-03
- **Type:** e2e
- **Severity:** Major

### TC-07: The new account is a USER and cannot create accounts
- **US:** UM-US-01
- **Given:** an `ADMIN` has created an account
- **When:** the new User logs in and submits `POST /api/v1/users/` with a different new email
- **Then:** the response is `403`
  - **And** the new User can still reach its own data (listing its own Wallets returns `200`)
  - **And** the new account holds the `USER` role and not the `ADMIN` role
  - **And** no account was created for the different email
- **AC:** AC-04
- **Type:** integration
- **Severity:** Critical

### TC-08: The creation response never contains the password
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in
- **When:** `POST /api/v1/users/` succeeds
- **Then:** the response body has no `password` key and does not contain the submitted password text
- **AC:** AC-05
- **Type:** integration
- **Severity:** Critical

### TC-09: A caller who is not logged in is rejected
- **US:** UM-US-01
- **Given:** a request carries no credentials
- **When:** `POST /api/v1/users/` is submitted with valid values
- **Then:** the response is `401`
  - **And** no account is created
- **AC:** EC-01
- **Type:** integration
- **Severity:** Major

### TC-10: A USER-only caller is rejected
- **US:** UM-US-01
- **Given:** a logged-in account that holds only the `USER` role
- **When:** it submits `POST /api/v1/users/` with valid values
- **Then:** the response is `403`
  - **And** no account is created
  - **And** the rejection is logged at `WARN` with the caller's User id
- **AC:** EC-02
- **Type:** integration
- **Severity:** Critical

### TC-11: A USER opening the Create User screen is shown an access-denied message
- **US:** UM-US-01
- **Given:** a `USER`-only account is logged in and on the Create User screen
- **When:** the User fills in valid values and clicks Create
- **Then:** the page shows "You do not have permission to create User accounts."
  - **And** no success message appears
  - **And** the account is not created (a login with those values returns `401`)
- **AC:** EC-02
- **Type:** e2e
- **Severity:** Critical

### TC-12: Missing full name or password is rejected at the API
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in
- **When:** `POST /api/v1/users/` is submitted once without `full_name` and once without `password`
- **Then:** each response is `400` with "Full name is required" under `full_name`, or "Password is required" under `password`, respectively
  - **And** no account is created
- **AC:** EC-03
- **Type:** integration
- **Severity:** Major

### TC-13: Missing full name and password show their messages on the screen
- **US:** UM-US-01
- **Given:** an `ADMIN` is on the Create User screen
- **When:** the ADMIN fills in only the email and clicks Create
- **Then:** the page shows "Full name is required" next to the full-name field and "Password is required" next to the password field
- **AC:** EC-03
- **Type:** e2e
- **Severity:** Major

### TC-14: An invalid or over-long email is rejected
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in
- **When:** `POST /api/v1/users/` is submitted once with `email` "not-an-email" and once with an email longer than 150 characters
- **Then:** each response is `400` with "Enter a valid email address" under `email`
  - **And** no account is created
- **AC:** EC-04
- **Type:** integration
- **Severity:** Minor

### TC-15: A password shorter than 8 characters is rejected
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in
- **When:** `POST /api/v1/users/` is submitted with a 7-character password
- **Then:** the response is `400` with "Password must be at least 8 characters" under `password`
  - **And** no account is created
  - **And** an 8-character password is accepted (`201`)
- **AC:** EC-05
- **Type:** integration
- **Severity:** Minor

### TC-16: A full name longer than 150 characters is rejected
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in
- **When:** `POST /api/v1/users/` is submitted with a 151-character `full_name`
- **Then:** the response is `400` with "Full name must be at most 150 characters" under `full_name`
  - **And** no account is created
  - **And** a 150-character `full_name` is accepted (`201`)
- **AC:** EC-06
- **Type:** integration
- **Severity:** Minor

### TC-17: The same email in a different capitalization is a duplicate
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in and an account with the email "homer@example.com" exists
- **When:** `POST /api/v1/users/` is submitted with the email "Homer@Example.com"
- **Then:** the response is `409` with code `USER_ALREADY_EXISTS`
  - **And** only one account exists for that email
- **AC:** EC-07
- **Type:** integration
- **Severity:** Major

### TC-18: A non-English full name is stored exactly as entered
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in
- **When:** `POST /api/v1/users/` is submitted with `full_name` "Trương Văn Hòa"
- **Then:** the response is `201` and its `full_name` equals "Trương Văn Hòa" exactly
  - **And** the stored account has the same `full_name`
- **AC:** EC-08
- **Type:** integration
- **Severity:** Minor

### TC-19: A failure part-way through creation leaves no account behind
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in and the `USER` role row cannot be found (an unexpected storage-level failure part-way through creation)
- **When:** `POST /api/v1/users/` is submitted with valid values
- **Then:** the response is an error (`500`), not `201`
  - **And** no account exists for that email afterwards
- **AC:** EC-09
- **Type:** integration
- **Severity:** Major
- **Note:** the failure is induced by removing the seeded `USER` role inside the test database — no model or queryset is mocked.

### TC-20: No endpoint exists to read, change or delete an account by id
- **US:** UM-US-01
- **Given:** an account `victim@example.com` exists, and the caller is either a `USER`-only account or an `ADMIN`
- **When:** the caller sends `GET`, `PUT`, `PATCH` and `DELETE` to `/api/v1/users/{victim id}/`
- **Then:** every request returns `404`
  - **And** the victim account still exists and its password still verifies unchanged
- **AC:** EC-02
- **Type:** integration
- **Severity:** Critical
- **Note:** regression for the security fix made after the UM-US-01 audit: a pre-existing `users/<id>/` endpoint let any logged-in User overwrite (with an unhashed password) or delete any account, including the ADMIN's. Reading, updating, deactivating and deleting accounts arrive with UM-US-02..06, each with its own permission checks; this case then changes with them.

### TC-21: A database-level collision is also reported as "Account already exists"
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in and an existing account has a *username* equal to the email about to be submitted (so the email pre-check finds no match, and only the database's uniqueness rule stops the creation — the same path a simultaneous duplicate submission takes)
- **When:** `POST /api/v1/users/` is submitted with that email
- **Then:** the response is `409` with code `USER_ALREADY_EXISTS`
  - **And** no account was created for that email
- **AC:** AC-03
- **Type:** integration
- **Severity:** Minor

### TC-22: The email is stored in lower case and the new User can log in with any capitalization
- **US:** UM-US-01
- **Given:** an `ADMIN` is logged in
- **When:** `POST /api/v1/users/` is submitted with the email "Homer.Mixed@Example.COM"
- **Then:** the response is `201` and its `email` is "homer.mixed@example.com"
  - **And** the stored account has that lower-case email
  - **And** a login with the lower-case email and a login with "Homer.Mixed@Example.COM" both return `200`
- **AC:** EC-10
- **Type:** integration
- **Severity:** Major

- [x] Self-checked against [aif-review-checklist.md § `test_cases.md` — Structure](../../aif-review-checklist.md#test_casesmd--structure)
- [x] Self-checked against [aif-review-checklist.md § Playwright Code — Integration Tests](../../aif-review-checklist.md#playwright-code--integration-tests)
- [x] Self-checked against [aif-review-checklist.md § Playwright Code — E2E Tests](../../aif-review-checklist.md#playwright-code--e2e-tests)
- [x] Self-checked against [aif-review-checklist.md § Playwright Code — General](../../aif-review-checklist.md#playwright-code--general)
