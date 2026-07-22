# Feature Specification: System Security

**Feature Branch**: `001-system-security`

**Created**: 2026-07-21

**Status**: Draft

**Input**: User description: "SS-US-01: Login (ADMIN, USER) — As a/an ADMIN or USER, I want to log in to the System with my email and password so that I can securely access my own account and the data/actions permitted to my role(s)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - SS-US-01: Login (ADMIN, USER) (Priority: P1)

An ADMIN or a USER opens the System and signs in with their email and password so they can reach the account and the data/actions their role(s) permit. A single family member may hold both the ADMIN and USER roles at once and expects one login to unlock everything they're permitted to do — not a separate login per role.

**Why this priority**: Login is the entry point to every other capability in the System — no other feature is reachable without it. It is the first MVP story of the System Security feature.

**Independent Test**: Can be fully tested by submitting valid credentials for an active account and confirming the caller is authenticated and can subsequently reach a role-appropriate action, independent of any other feature.

**Acceptance Criteria**:

1. **AC-01: Successful login issues credentials** — **Given** an active account with valid email and password, **When** the User submits those credentials, **Then** the System authenticates the User and issues an access/refresh credential pair scoped to that account.
2. **AC-02: Invalid credentials rejected generically** — **Given** an email or password that does not match an active account, **When** the User submits those credentials, **Then** the System rejects the attempt with a single generic error that does not indicate whether the email or the password was the incorrect part.
3. **AC-03: Deactivated account login rejected** — **Given** an account that has been deactivated, **When** the account's owner submits their correct email and password, **Then** the System rejects the login attempt, even though the credentials themselves are valid.
4. **AC-04: Single login covers dual roles** — **Given** an account that holds both the ADMIN and the USER role at the same time, **When** that account's owner logs in once, **Then** the System grants access to every action permitted by either role, with no additional per-role login step.

---

### Edge Cases

- **EC-01: Missing email or password** — What happens when the email field or the password field is left empty? System rejects the submission with a field-level validation error before attempting authentication.
- **EC-02: Repeated failed attempts** — What happens when a User repeatedly submits incorrect credentials? System continues to reject each attempt with the same generic error (no lockout/rate-limiting behavior is specified by this story).
- **EC-03: Session/credential expiry** — What happens when a currently-logged-in User's session/credential expires? Treated as a distinct story (re-authentication is out of scope for SS-US-01; see SS-US-02 Logout for session termination).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an ADMIN or a USER to log in by submitting an email and a password.
- **FR-002**: System MUST, upon successful authentication of an active account, issue that account an access credential and a refresh credential.
- **FR-003**: System MUST reject a login attempt whose email or password does not match an active account, returning one generic failure indication that does not disclose which field was incorrect or whether the email is registered.
- **FR-004**: System MUST reject a login attempt for a deactivated account even when the submitted email and password are otherwise correct.
- **FR-005**: System MUST, for an account holding both the ADMIN and USER roles, grant access to all actions permitted by both roles from a single login — no role-specific login step.
- **FR-006**: System MUST validate that both email and password are provided before attempting authentication.

### Key Entities

- **User**: The account holder who authenticates; identified by a unique email and a password, has an active/deactivated status, and holds one or both of the ADMIN and USER roles simultaneously.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A User with valid, active credentials completes login in a single submission with no additional steps.
- **SC-002**: 100% of login attempts using incorrect credentials or a deactivated account are rejected, and none of those rejections reveal whether the email exists, which field was wrong, or the account's active/deactivated state.
- **SC-003**: A User holding both roles reaches every action permitted by either role after exactly one successful login, with zero additional login prompts.

## Assumptions

- Login is performed with email + password only; no third-party/social sign-in or multi-factor authentication is in scope (SRS §1.6 Out of Scope, §4.4.1).
- Self-service password reset/account recovery is out of scope for this story (SRS §1.6) — account issues are handled manually by the ADMIN.
- No account lockout or rate-limiting behavior after repeated failed attempts is specified by this story.
- A successful login's access/refresh credential pair is the sole mechanism by which the System authorizes all subsequent requests (see SS-US-02 Logout for how a session ends).
