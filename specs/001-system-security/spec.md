# Feature: System Security

> **Prefix:** `SS`
> **SRS:** [SRS.md §7.1](../../SRS.md#71-system-security-ss)
> **Created:** 2026-10-10 · **Updated:** 2026-10-10

---

## Overview

System Security keeps each User's financial data private on the shared family instance. Every `ADMIN` and `USER` proves who they are with an email and password before the System shows any screen or action, and then sees only what their role(s) permit. This feature starts with Login, the entry point to every protected part of the System.

### Business Flows

- Main Business Flow — End-to-End User Journey, step 2 "The User logs into the System" ([SRS.md §6.1](../../SRS.md#61-main-business-flow--end-to-end-user-journey))

---

## SS-US-01: Login (ADMIN, USER)

> **Feature group:** 7.1 System Security

**As a** `ADMIN` or `USER`, **I want to** log in to the System with my email and password **so that** I can securely access my own account and the data/actions permitted to my role(s).

### Acceptance Criteria

- **AC-01 — Successful login:**  
  **Given** an active User account with a registered email and password,  
  **When** the User submits the correct email and password,  
  **Then** the System signs the User in and takes the User to their home screen.
- **AC-02 — Role-limited access:**  
  **Given** an active User account that holds only one role (`ADMIN` or `USER`),  
  **When** the User logs in,  
  **Then** the User can reach only the screens and actions permitted to that role,  
    &nbsp;&nbsp;**and** an `ADMIN`-only account sees no member's personal finances,  
    &nbsp;&nbsp;**and** a `USER`-only account sees no account administration.
- **AC-03 — Dual-role account:**  
  **Given** an active User account that holds both the `ADMIN` and `USER` roles,  
  **When** the User logs in once,  
  **Then** that single sign-in gives access to the screens and actions of both roles.
- **AC-04 — Wrong password rejected:**  
  **Given** an active User account,  
  **When** the User submits the registered email with an incorrect password,  
  **Then** the System does not sign the User in and shows the error "Email or password is incorrect",  
    &nbsp;&nbsp;**and** the form keeps the email entered and clears the password.
- **AC-05 — Unknown email rejected:**  
  **Given** no User account exists for the entered email,  
  **When** the visitor submits that email with any password,  
  **Then** the System does not sign the visitor in and shows the same error "Email or password is incorrect" as AC-04, so the two cases cannot be told apart.
- **AC-06 — Deactivated account rejected:**  
  **Given** a User account that has been deactivated,  
  **When** the User submits the correct email and password,  
  **Then** the System does not sign the User in and shows the error "Account is deactivated" (consistent with [SRS.md §7.2](../../SRS.md#72-user-management-um) UM-US-05 and BR-16),  
    &nbsp;&nbsp;**and** all of that User's existing data remains unchanged.
- **AC-07 — Protected screens need login:**  
  **Given** a person who is not signed in,  
  **When** the person tries to open any screen other than the login screen,  
  **Then** the System shows the login screen instead,  
    &nbsp;&nbsp;**and** no financial data is revealed.

### Edge Cases

- **EC-01 — Empty/null state:**  
  **Given** the login form,  
  **When** the User submits it with the email blank (or only spaces), or the password blank,  
  **Then** no sign-in is attempted,  
    &nbsp;&nbsp;**and** the form shows "Email is required" and/or "Password is required" next to each missing field.
- **EC-02 — Email capitalization and spaces:**  
  **Given** a User account registered with the email `homer@example.com`,  
  **When** the User submits `  HOMER@Example.com  ` (different capitalization, surrounding spaces) with the correct password,  
  **Then** the User is signed in.
- **EC-03 — Password compared exactly:**  
  **Given** a User account whose password is `Secret123`,  
  **When** the User submits the password `secret123` or ` Secret123 ` (different capitalization, added leading/trailing spaces),  
  **Then** the System does not sign the User in and shows the error "Email or password is incorrect".
- **EC-04 — Concurrency (2 devices):**  
  **Given** one active User account,  
  **When** the same User logs in from two devices at the same time with the correct credentials,  
  **Then** both sign-ins succeed independently,  
    &nbsp;&nbsp;**and** neither sign-in ends the other.
- **EC-05 — Access control:**  
  **Given** a visitor who has no User account,  
  **When** the visitor looks for a way to register on the login screen,  
  **Then** no self-registration option is offered, because User accounts are created only by an `ADMIN` ([SRS.md §1.6](../../SRS.md#16-out-of-scope)).
- **EC-06 — Dependency timeout/partial failure:**  
  **Given** the System cannot read its stored User accounts (slow or unavailable),  
  **When** the User submits the correct credentials,  
  **Then** no sign-in happens and the message "Sign-in is temporarily unavailable. Please try again." is shown,  
    &nbsp;&nbsp;**and** the form stays usable for a retry.
- **EC-07 — Non-English password:**  
  **Given** a User account whose password contains non-English characters (for example Vietnamese diacritics),  
  **When** the User submits that exact password with the correct email,  
  **Then** the User is signed in.
- **EC-08 — Repeated failed attempts:**  
  **Given** an active User account,  
  **When** the User submits wrong credentials several times in a row and then submits the correct ones,  
  **Then** the User is signed in, because no lockout applies in this release (assumption — see Scope Boundary).

<!-- Edge Case category scan (7 mandatory categories):
     empty/null → EC-01; boundary values → EC-02, EC-03; concurrency → EC-04; access control → EC-05;
     dependency timeout → EC-06; multi-language/currency → EC-07 (language only: Login handles no
     monetary amounts, so the currency half is N/A); AI service error → N/A: Login uses no AI service,
     so there is nothing to fail or return garbage. -->

---

## Scope Boundary

### Out of Scope

- Logout — covered by SS-US-02.
- Creating User accounts — covered by UM-US-01.
- Changing or resetting a password, multi-factor sign-in and social sign-in — not required by the SRS.
- Account lockout after repeated failed attempts — the SRS has no lockout rule, so none is assumed (**assumption to confirm with the BA**; EC-08 would change if lockout is added).

### Dependencies

| Type | Name | Nature | Risk if unavailable |
|---|---|---|---|
| Upstream | UM-US-01 Create a User; first ADMIN created at first-time setup (RUNBOOK §9) | User accounts must exist before anyone can log in | No one can sign in |
| Upstream | UM-US-05 Deactivate a User (BR-16) | Sets the deactivated state that AC-06 relies on | Deactivated Users could not be told apart from active ones |
| Downstream | Every protected feature | Each requires a signed-in User | Protected screens stay unreachable |
