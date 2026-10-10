# Security Requirements Checklist: User Management

**Purpose**: Check the *requirements* (spec.md and plan.md) of each User Story for security quality — completeness, clarity, consistency. It does not test the implementation.
**Created**: 2026-10-10
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md)

**Note**: Generated for `/sdlc-design`. `- [x]` means spec.md or plan.md already states the requirement; every other item is tagged `[Gap]`, `[Ambiguity]` or `[Conflict]`. `- [~]` means **Deferred** — acknowledged, fix postponed.

## UM-US-01: Create a User (ADMIN)

### Authentication

- [x] CHK001 Is it stated that account creation requires a valid JWT, and that a request without one is rejected with no side effect? [Spec EC-01, Plan API Contracts `401`]
- [x] CHK002 Is it stated that `POST /api/v1/users/` is *not* a public route (no self-service registration)? [Spec Out of Scope, Plan G8]
- [x] CHK003 Is the behaviour for an expired token stated for the screen (redirect to the Login page)? [Plan D7]

### Authorization

- [x] CHK004 Is the role allowed to create accounts (`ADMIN`) stated, and is the backend named as the enforcing layer? [Plan D4, Constitution AC-02]
- [x] CHK005 Is the rejection of an authenticated caller who holds only `USER` stated, with its status and no side effect? [Spec EC-02, Plan `403`]
- [x] CHK006 Is it stated which role the new account receives and that the caller cannot choose a higher one (no role escalation)? [Spec Out of Scope, AC-04]
- [x] CHK007 Is it stated that no other account operation (read, change, deactivate, delete by id) is reachable through this feature? [Plan G8, TC-20]
- [x] CHK008 Is it stated that UI visibility is not the enforcement, and that hiding the screen from non-ADMINs is deferred? [Plan G9, Spec Out of Scope]
- [x] CHK009 Is it stated that an ADMIN gains no access to another User's financial data through this story? [Plan API Contracts — response fields are account fields only]

### Input validation

- [x] CHK010 Are the required fields and their exact rejection messages specified? [Spec AC-02, EC-03]
- [x] CHK011 Are the email format and maximum length specified? [Spec EC-04]
- [x] CHK012 Are the password minimum length and the exclusion of further password rules stated? [Spec EC-05, Out of Scope]
- [ ] CHK013 Is a maximum password length (or a hashing-cost limit for very long passwords) specified? [Gap]
- [x] CHK014 Is the full-name maximum length specified, and are non-English characters accepted? [Spec EC-06, EC-08]
- [ ] CHK015 Is it stated how a full name that is only whitespace, or that contains markup or control characters, is treated and later displayed? [Gap]
- [x] CHK016 Is the capitalization of the email specified (stored lower case, duplicates compared case-insensitively)? [Spec EC-07, EC-10]

### Sensitive data

- [x] CHK017 Is it stated that the initial password is never displayed or returned? [Spec AC-05]
- [x] CHK018 Is it stated that the password is stored only as a hash? [Plan Constitution Check, Domain Objects]
- [x] CHK019 Is it stated that the password travels only in the request body, never in a URL or query string? [Plan API Contracts]
- [x] CHK020 Is it stated that logs never contain a password or token? [Plan Constitution Check — Logging & Audit]
- [ ] CHK021 Is it stated whether the email address (personal data) may appear in logs? [Ambiguity]
- [ ] CHK022 Is it stated that the password field is cleared and not retained in client state after submission? [Gap]
- [~] CHK023 Is a forced password change on first login, or another way to hand the initial password to the new User safely, specified? [Deferred — Spec Out of Scope; ADMIN shares the password out of band]

### Error disclosure

- [x] CHK024 Is it stated that revealing "Account already exists" is deliberate and limited to an authenticated ADMIN? [Spec AC-03, Plan G8]
- [x] CHK025 Is the response to an unexpected failure specified as generic, with nothing partly saved? [Spec EC-09, Plan sequence diagram]
- [ ] CHK026 Is it stated that debug output and stack traces must not reach a client? [Gap — `DEBUG = True` is only noted in the constitution for non-LAN deployments]

### Audit and abuse

- [x] CHK027 Are successful creations logged with the acting ADMIN's id? [Plan Constitution Check]
- [x] CHK028 Are rejected attempts (`401`, `403`, duplicate) logged with the acting User id if any? [Plan Constitution Check]
- [ ] CHK029 Is it stated that the creator of an account is recorded durably (not only in logs)? [Gap]
- [ ] CHK030 Is it stated whether the number of accounts one ADMIN can create in a period is limited? [Ambiguity]
- [x] CHK031 Is a simultaneous submission of the same email specified as producing one account? [Plan D5, Spec comment on concurrency]

### Secrets and sessions

- [x] CHK032 Is it stated that the first ADMIN is created without credentials in source or in a migration? [Plan D3]
- [x] CHK033 Is the client-side token storage (and its known risk) stated? [Plan D7 → SS-US-01 plan "Known risk"]

## Notes

- Open items: CHK013, CHK015, CHK021, CHK022, CHK026, CHK029, CHK030 are real requirements gaps for a later pass; none blocks UM-US-01, which is already implemented and verified.
- Created retroactively (2026-10-10): this story was designed before `/sdlc-design` required a security checklist.
