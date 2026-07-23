# Research: SS-US-01 Login

No `[NEEDS CLARIFICATION]` markers remained in plan.md's Technical Context, so this phase confirms existing decisions already fixed by the constitution rather than evaluating new alternatives.

## Decision: Reuse `djangorestframework-simplejwt`'s stock `TokenObtainPairView`, no custom login view/serializer

**Rationale**: `POST /api/v1/auth/login/` is already wired to `TokenObtainPairView` in `backend/config/api_router.py`. It authenticates via Django's `authenticate()`, which delegates to `ModelBackend.user_can_authenticate()` — this already rejects `is_active=False` accounts (AC-03/BR-16) and returns one generic error message for both wrong-credentials and deactivated-account cases (AC-02), with no per-field detail leaked. Constitution AR-01 reserves a dedicated service module for logic spanning more than one model or with side effects (e.g. budget recompute, notification fan-out) — login has neither, so introducing an `AuthenticationService` would violate Simplicity Over Premature Scale.

**Alternatives considered**:
- Custom login `APIView` + service function — rejected: duplicates behavior the stock view already provides correctly, adds a class with no behavioral difference.
- Session-based auth — rejected: constitution API-07 already fixes JWT Bearer as the auth mechanism project-wide.

## Decision: Frontend login page uses native `fetch` + React state, no form library

**Rationale**: Constitution FE-02 forbids adding React Hook Form/Formik/Zod until complexity genuinely warrants it. A 2-field (email, password) login form with HTML5 `required` validation is well within native handling. FE-08 fixes direct `fetch` calls to `NEXT_PUBLIC_API_URL` — no API-proxy route.

**Alternatives considered**:
- React Hook Form — rejected: no repeated ad hoc duplication problem yet to justify the dependency (FE-04 same reasoning).

## Decision: Token storage — client-side, no cookie/session mechanism specified

**Rationale**: No existing frontend auth pattern exists in this codebase yet to follow (`frontend/src/app/` has no auth-related files). The simplest mechanism consistent with FE-08 (direct fetch, `Authorization: Bearer <token>` header per API-07) is storing the returned `access`/`refresh` tokens in the browser and attaching `access` as a Bearer header on subsequent requests. This plan does not introduce a specific storage mechanism decision beyond "client-side, attached as a header" — the concrete choice (e.g. in-memory vs. persisted) is an implementation-time detail for `tasks.md`, not a spec-level or business-rule concern.

**Alternatives considered**: None evaluated at this phase — deferred to implementation, since no AC in spec.md constrains storage mechanism.

## Open items carried to implementation / document-sync — resolved

- SDS §6.3 API Index / §6.4 API Specification now list `POST /auth/login/` (API-SS-01) and `POST /auth/refresh/` (API-SS-02) — added in the Implementation Step (tasks.md T014).
- SDS §4.3.3's BR-16 row now references the actual Django `ModelBackend` mechanism instead of the nonexistent `AuthenticationService` — corrected in the Implementation Step (tasks.md T015).
