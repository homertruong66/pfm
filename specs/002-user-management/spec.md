# Feature: User Management

> **Prefix:** `UM`
> **SRS:** [SRS.md §7.2](../../SRS.md#72-user-management-um)
> **Created:** 2026-10-08 · **Updated:** 2026-10-08

---

## Overview

User Management gives the household's `ADMIN` control over who can use the PFM application. There is no self-service sign-up: a family member can only get an account because the `ADMIN` creates it, and each `USER` then keeps their own finances private within the shared application. This first story covers creating that account; reviewing, updating, deactivating and deleting accounts are separate stories of the same feature.

### Business Flows

- `6.1` — [Main Business Flow — End-to-End User Journey](../../SRS.md#61-main-business-flow--end-to-end-user-journey) (step 1: the ADMIN creates a new User account for a family member)

---

## UM-US-01: Create a User (ADMIN)

> **Feature group:** 7.2 User Management

**As an** `ADMIN`, **I want to** create a new User account for a family member **so that** they can log in and use the PFM application.

### Acceptance Criteria

- **AC-01 — Account created:**  
  **Given** the `ADMIN` is on the Create User screen,  
  **When** they enter a full name, an email and an initial password that no existing account uses, and confirm the creation,  
  **Then** the System creates the new User account,  
    &nbsp;&nbsp;**and** the System shows the message "User account created",  
    &nbsp;&nbsp;**and** the new User can log in with the assigned email and initial password.
- **AC-02 — Email required:**  
  **Given** the `ADMIN` is on the Create User screen,  
  **When** they confirm the creation without entering an email,  
  **Then** the System does not create a User account,  
    &nbsp;&nbsp;**and** the System shows the validation error "Email is required".
- **AC-03 — Existing account rejected:**  
  **Given** a User account with a given email already exists,  
  **When** the `ADMIN` enters a full name, that same email and an initial password, and confirms the creation,  
  **Then** the System does not create a User account,  
    &nbsp;&nbsp;**and** the System shows the error "Account already exists".
- **AC-04 — New account is a USER only:**  
  **Given** the `ADMIN` has just created a User account,  
  **When** the new User logs in,  
  **Then** they can reach their own account and the actions a `USER` is permitted,  
    &nbsp;&nbsp;**and** they are not permitted any `ADMIN` action, such as creating another User account.
- **AC-05 — Initial password never shown:**  
  **Given** the `ADMIN` has just created a User account,  
  **When** the System confirms the creation,  
  **Then** the confirmation does not display or return the initial password.

### Edge Cases

- **EC-01 — Not logged in:**  
  **Given** a caller who is not logged in,  
  **When** they attempt to create a User account,  
  **Then** the System rejects the attempt as unauthenticated,  
    &nbsp;&nbsp;**and** no User account is created.
- **EC-02 — Caller is a USER, not an ADMIN:**  
  **Given** a logged-in account that holds the `USER` role but not the `ADMIN` role,  
  **When** it attempts to create a User account,  
  **Then** the System rejects the attempt as not permitted,  
    &nbsp;&nbsp;**and** no User account is created.
- **EC-03 — Full name or password missing:**  
  **Given** the `ADMIN` is on the Create User screen,  
  **When** they confirm the creation with the full name or the initial password left empty,  
  **Then** the System does not create a User account,  
    &nbsp;&nbsp;**and** the System shows "Full name is required" or "Password is required" for the empty field.
- **EC-04 — Invalid email format:**  
  **Given** the `ADMIN` is on the Create User screen,  
  **When** they enter an email that is not a valid email address, or is longer than 150 characters, and confirm the creation,  
  **Then** the System does not create a User account,  
    &nbsp;&nbsp;**and** the System shows the validation error "Enter a valid email address".
- **EC-05 — Initial password too short:**  
  **Given** the `ADMIN` is on the Create User screen,  
  **When** they enter an initial password shorter than 8 characters and confirm the creation,  
  **Then** the System does not create a User account,  
    &nbsp;&nbsp;**and** the System shows the validation error "Password must be at least 8 characters".
- **EC-06 — Full name too long:**  
  **Given** the `ADMIN` is on the Create User screen,  
  **When** they enter a full name longer than 150 characters and confirm the creation,  
  **Then** the System does not create a User account,  
    &nbsp;&nbsp;**and** the System shows the validation error "Full name must be at most 150 characters".
- **EC-07 — Same email, different capitalization:**  
  **Given** a User account with the email "homer@example.com" already exists,  
  **When** the `ADMIN` confirms the creation of an account with the email "Homer@Example.com",  
  **Then** the System treats it as the same email and rejects it as in AC-03.
- **EC-08 — Non-English full name:**  
  **Given** the `ADMIN` is on the Create User screen,  
  **When** they enter a full name containing non-English characters, such as "Trương Văn Hòa", and confirm the creation,  
  **Then** the System creates the account,  
    &nbsp;&nbsp;**and** the full name is stored and shown exactly as entered.
- **EC-09 — Creation fails part-way:**  
  **Given** the System cannot complete the account creation, for example because storage fails after the account is partly saved,  
  **When** the `ADMIN` confirms the creation,  
  **Then** the System shows an error,  
    &nbsp;&nbsp;**and** no User account is left behind, so no email is blocked by an account that cannot log in.
- **EC-10 — Email stored in lower case:**
  **Given** the `ADMIN` is on the Create User screen,
  **When** they enter the email "Homer@Example.com" and confirm the creation,
  **Then** the System creates the account with the email "homer@example.com",
    &nbsp;&nbsp;**and** the new User can log in with the email in any capitalization.

<!-- Edge Case categories not listed above and why:
     - Concurrency: a household has a single ADMIN creating accounts, and two near-simultaneous submissions of the same email can only end as in AC-03 (one account, one rejection), so no separate behavior is specified.
     - Dependency timeout/partial failure: creation depends on no external service; the only failure mode is the storage failure covered by EC-09.
     - AI service error: no AI service is involved in creating a User. -->

---

## Scope Boundary

### Out of Scope

- Self-service sign-up by a family member (SRS §1.6) — accounts exist only because an `ADMIN` created them.
- Choosing a role for the new account: every account created by this story is a `USER`; granting the `ADMIN` role is not part of this story.
- Updating, viewing, listing, deactivating and deleting User accounts — UM-US-02 to UM-US-06.
- Password rules beyond the minimum length, forced password change on first login, and password reset (SRS §1.6).
- Offering the Create User screen in the application's navigation only to an `ADMIN` — needs the logged-in User's role to be known to the screen, which no story provides yet.

### Dependencies

| Type | Name | Nature | Risk if unavailable |
|---|---|---|---|
| Upstream | SS-US-01 Login | The `ADMIN` must be logged in to reach the Create User screen; the new User logs in through it | `ADMIN` cannot reach the screen; the new User cannot start using the app |
| Upstream | First `ADMIN` account | An `ADMIN` account has to exist before any account can be created through this story | No account can ever be created |
| Downstream | UM-US-02 .. UM-US-06 | Manage the accounts this story creates | None — those stories simply have no accounts to act on |
| Downstream | Every `USER` feature | Relies on a `USER` account existing | No family member can use the app |
