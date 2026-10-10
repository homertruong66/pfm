# Feature: System Security

> **Prefix:** `SS`
> **SRS:** [SRS.md §7.1](../../SRS.md#71-system-security-ss)
> **Created:** 2026-07-21 · **Updated:** 2026-10-08

---

## Overview

System Security controls who can enter the System and what they can reach once inside. It starts with login: an `ADMIN` or a `USER` proves who they are with an email and a password, so each family member sees only their own account and the data and actions their role(s) permit. Login is the entry point to every other capability in the System.

### Business Flows

- `6.1` — [Main Business Flow — End-to-End User Journey](../../SRS.md#61-main-business-flow--end-to-end-user-journey) (step 2: the User logs into the System)

---

## SS-US-01: Login (ADMIN, USER)

> **Feature group:** 7.1 System Security

**As an** `ADMIN` or `USER`, **I want to** log in to the System with my email and password **so that** I can securely access my own account and the data and actions permitted to my role(s).

### Acceptance Criteria

- **AC-01 — Successful login:**  
  **Given** an active account with a valid email and password,  
  **When** the account holder submits those credentials,  
  **Then** the System authenticates them and issues an access and a refresh credential scoped to that account.
- **AC-02 — Invalid credentials rejected:**  
  **Given** an email or password that does not match an active account,  
  **When** the account holder submits those credentials,  
  **Then** the System rejects the attempt with one generic error,  
    &nbsp;&nbsp;**and** the error does not reveal whether the email or the password was incorrect,  
    &nbsp;&nbsp;**and** the error does not reveal whether the email is registered.
- **AC-03 — Deactivated account rejected:**  
  **Given** an account that has been deactivated,  
  **When** its owner submits their correct email and password,  
  **Then** the System rejects the login attempt with the same generic error as AC-02,  
    &nbsp;&nbsp;**and** the error does not reveal that the account is deactivated.
- **AC-04 — Single login for dual roles:**  
  **Given** an account that holds both the `ADMIN` and the `USER` role,  
  **When** its owner logs in once,  
  **Then** the System grants access to every action permitted by either role,  
    &nbsp;&nbsp;**and** no additional per-role login step is required.

### Edge Cases

- **EC-01 — Empty email or password:**  
  **Given** the account holder leaves the email field or the password field empty,  
  **When** they submit the login form,  
  **Then** a field-level validation error is shown,  
    &nbsp;&nbsp;**and** no authentication is attempted.
- **EC-02 — Repeated failed attempts:**  
  **Given** the account holder has submitted incorrect credentials three or more times in a row,  
  **When** they submit incorrect credentials again,  
  **Then** the attempt is rejected with the same generic error as AC-02,  
    &nbsp;&nbsp;**and** no lockout or rate limiting is applied.
- **EC-03 — Credential expiry:**  
  **Given** a logged-in User's credential has expired,  
  **When** they attempt an action,  
  **Then** the outcome is not defined by this story, because re-authentication after expiry is out of scope here.
- **EC-04 — Email capitalization ignored:**
  **Given** an active account whose email is "homer@example.com",
  **When** its owner logs in with the email typed as "Homer@Example.com" and the correct password,
  **Then** the System logs them in exactly as in AC-01,
    &nbsp;&nbsp;**and** the same capitalization-insensitive match applies to every rejection in AC-02 and AC-03.

<!-- Edge Case categories not listed above and why:
     - Access control: login is the System's public, unauthenticated entry point, so there is no caller to authorize or scope; role-based access is covered by AC-04 and by the features that follow login.
     - Multi-language/multi-currency data: login handles no monetary or translated data.
     - AI service error: no AI service is involved in login.
     Boundary values, concurrency and dependency timeout are not yet specified for this story. -->

---

## Scope Boundary

### Out of Scope

- Third-party or social sign-in and multi-factor authentication (SRS §1.6, §4.4.1).
- Self-service password reset and account recovery — account issues are handled manually by the `ADMIN` (SRS §1.6).
- Account lockout or rate limiting after repeated failed attempts (EC-02).
- Handling of an expired credential and re-authentication (EC-03).
- Ending a session — covered by SS-US-02 Logout.

### Dependencies

| Type | Name | Nature | Risk if unavailable |
|---|---|---|---|
| Upstream | User account provisioning and deactivation by the `ADMIN` (UM-US-01, UM-US-05) | Login can only succeed for an account that exists and is active | No account can ever log in |
| Downstream | Every protected feature of the System | Relies on the credential issued at login to authorize each request | No protected feature is reachable |
