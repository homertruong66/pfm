# Security Requirements Checklist: System Security

**Purpose**: Check the *requirements* (spec.md and plan.md) of each User Story for security quality — completeness, clarity, consistency. It does not test the implementation.
**Created**: 2026-10-10
**Feature**: [spec.md](../spec.md) · [plan.md](../plan.md)

**Note**: Generated for `/sdlc-design`. `- [x]` means spec.md or plan.md already states the requirement; every other item is tagged `[Gap]`, `[Ambiguity]` or `[Conflict]`. `- [~]` means **Deferred** — acknowledged, fix postponed.

## SS-US-01: Login (ADMIN, USER)

### Authentication

- [x] CHK001 Is it stated that login is the System's public, unauthenticated entry point and that every other route requires the issued credential? [Spec comment on access control, Plan Constitution Check API-07]
- [x] CHK002 Is a single generic error specified for wrong credentials, with no hint of which field was wrong? [Spec AC-02]
- [x] CHK003 Is it specified that an unregistered email gets the same response as a wrong password (no account enumeration)? [Spec AC-02, TC-10]
- [x] CHK004 Is a deactivated account rejected indistinguishably from wrong credentials? [Spec AC-03]
- [x] CHK005 Is the email's capitalization specified so that it cannot be used to evade or confuse a match? [Spec EC-04]
- [x] CHK006 Are the credential lifetimes (access / refresh) stated? [Plan Technical Context — 1 hour / 7 days]
- [x] CHK007 Is the absence of lockout and rate limiting stated explicitly? [Spec EC-02, Out of Scope]
- [ ] CHK008 Is the residual brute-force risk of having no lockout recorded as an accepted risk for the home LAN? [Gap]
- [ ] CHK009 Is a maximum length for the email and password fields at login specified? [Gap]

### Authorization

- [x] CHK010 Is it specified that one login serves an account holding both roles, with no per-role step? [Spec AC-04]
- [x] CHK011 Is it stated that the issued token carries no role claim and that roles are evaluated per request by the backend? [Plan Pre-flight G1, Constitution Check]
- [x] CHK012 Is it stated that the backend, not the screen, decides what a logged-in account may do? [Plan Constitution Check AC-01/AC-02]

### Sensitive data

- [x] CHK013 Is it stated that no password or other sensitive field appears in any response? [Plan API Design checklist]
- [x] CHK014 Is it stated that passwords are stored hashed? [Plan Domain Objects]
- [x] CHK015 Is it stated that no log line contains the email, the password or a token? [Plan Pre-flight G3, TC-11]
- [x] CHK016 Is the client-side token storage specified, with its risk (script-readable `localStorage`) accepted and a revisit point named? [Plan Decisions — token storage, "Known risk"]
- [x] CHK017 Is the choice of an `Authorization: Bearer` header over cookies (so no CSRF surface) stated? [Plan Decisions — token storage alternatives]
- [ ] CHK018 Is it stated that login must be served over HTTPS, or that sending credentials in clear over the LAN is an accepted risk? [Gap — the home-LAN deployment uses plain HTTP]
- [~] CHK019 Is token invalidation (refresh-token revocation) on logout specified? [Deferred — SS-US-02 Logout]

### Error disclosure

- [x] CHK020 Is the login failure body specified so that it does not distinguish the cases? [Plan API Contracts `401`]
- [x] CHK021 Is a non-credential failure (server error, unreachable server) specified to look different from a credential error? [Plan Pre-flight A3]
- [ ] CHK022 Is it stated that debug output and stack traces must not reach a client? [Gap — `DEBUG = True` is only noted in the constitution for non-LAN deployments]

### Audit

- [x] CHK023 Are successful logins logged at `INFO` and failures at `WARN` without credentials? [Plan Constitution Check — Logging & Audit]
- [x] CHK024 Is the acting User id recorded for `401`/`403` where one exists? [Plan Constitution Check — Logging & Audit]
- [ ] CHK025 Is a durable (not log-only) record of login events or of the last login specified? [Gap — `last_login` is not updated; no audit table]

## Notes

- Open items: CHK008, CHK009, CHK018, CHK022, CHK025 are real requirements gaps for a later pass; none blocks SS-US-01, which is implemented and verified. CHK019 belongs to SS-US-02.
- Created retroactively (2026-10-10): this story was designed before `/sdlc-design` required a security checklist.
