# Tasks: System Security — SS-US-01 Login

**Input**: Design documents from `specs/001-system-security/` (plan.md, spec.md, research.md, data-model.md, contracts/auth-login.md, quickstart.md) and `tests/001-system-security/` (test_cases.md, test_ss.spec.ts)

**Tests**: Included — constitution.md DOD-05 requires at least one `APITestCase` per new/formalized endpoint; e2e Playwright automation for TC-02/TC-04/TC-08 already exists in `tests/001-system-security/test_ss.spec.ts` from the Quality Step and is referenced, not duplicated.

**Organization**: Single user story (SS-US-01) — no Setup/Foundational work is needed beyond confirming existing wiring, since `djangorestframework-simplejwt` is already installed and the endpoint already exists (plan.md's Summary).

## Phase 1: Setup

**Purpose**: Confirm the existing dependency/wiring this US relies on — no new dependency or route is introduced.

- [x] T001 Confirm `djangorestframework-simplejwt` is in `backend/requirements.txt` and `POST /api/v1/auth/login/` / `POST /api/v1/auth/refresh/` are wired to `TokenObtainPairView`/`TokenRefreshView` in `backend/config/api_router.py` (should require no change — flags drift if it does)

---

## Phase 2: Foundational

**Purpose**: N/A — SS-US-01 is the only story in this feature and needs no shared infrastructure beyond T001. Nothing blocks Phase 3.

---

## Phase 3: User Story 1 - SS-US-01 Login (Priority: P1) 🎯 MVP

**Goal**: An ADMIN or USER logs in with email + password and reaches their account; a login rejects bad/deactivated credentials with one generic message and requires no separate step per role.

**Independent Test**: Follow `specs/001-system-security/quickstart.md` — `curl` the login endpoint for the valid/invalid/deactivated cases (AC-01..03), then open `http://localhost:3000/login` in a browser and confirm the redirect and inline-error behavior (AC-01, AC-02, EC-01) without needing any other Feature implemented.

### Tests for User Story 1

> Characterization tests for already-existing backend behavior (`TokenObtainPairView` + Django's `ModelBackend`) — expected to PASS immediately once written, since no backend code changes. They exist to close constitution DOD-05's test-coverage requirement and to catch future regressions. Maps to `tests/001-system-security/test_cases.md`.

- [x] T002 [P] [US1] TC-01: `APITestCase` for successful login (active user, correct credentials → `200` with non-empty `access`/`refresh`) in `backend/users/tests.py`
- [x] T003 [P] [US1] TC-03: `APITestCase` for wrong password (correct email, wrong password → `401`, single generic error body) in `backend/users/tests.py`
- [x] T004 [P] [US1] TC-05: `APITestCase` for deactivated account (`is_active=False`, correct credentials → `401`, same generic error body as TC-03) in `backend/users/tests.py`
- [x] T005 [P] [US1] TC-06: `APITestCase` for an account with elevated Django permissions (`is_staff=True, is_superuser=True` — closest existing analog to "holds both roles" until `Role` is scaffolded per constitution's documented open drift) logging in once and getting the same one-token-pair response shape as a plain user, with no extra role-specific field or step, in `backend/users/tests.py`
- [x] T006 [P] [US1] TC-07: `APITestCase` for missing password (`email` present, `password` omitted → `400`, field-level validation error) in `backend/users/tests.py`
- [x] T007 [P] [US1] TC-09: `APITestCase` for 3 consecutive wrong-password attempts, asserting each independently returns `401` with the same generic error (no lockout/rate-limit) in `backend/users/tests.py`

### Implementation for User Story 1

- [x] T008 [US1] Run `cd backend && python manage.py test users` and confirm T002–T007 all pass with zero backend code changes (depends on T001–T007); if any fail, that's new information — stop and reconcile with plan.md before touching the view
- [x] T009 [P] [US1] Create the login page shell in `frontend/src/app/login/page.tsx`: a form with `#login-email` and `#login-password` inputs, a `#btn-submit-login` submit button, and an empty `#message-error` container (NC-04 element ID contract, matches `tests/001-system-security/test_ss.spec.ts`'s selectors)
- [x] T010 [US1] In `frontend/src/app/login/page.tsx`, add a pre-submit check: if either field is empty, show exactly `"Email and password are required."` in `#message-error` and do not call the API (EC-01, TC-07/TC-08) — depends on T009
- [x] T011 [US1] In `frontend/src/app/login/page.tsx`, `POST` `email`/`password` to `` `${apiOrigin}/api/v1/auth/login/` `` where `apiOrigin` is `NEXT_PUBLIC_API_URL` (bare origin, matching the existing home page's `/health/` call convention) (FE-08 direct fetch, no proxy); on a `400`/`401` response show exactly `"Invalid email or password."` in `#message-error` and keep the User on the page (AC-02, AC-03, TC-03/TC-04/TC-05) — depends on T009
- [x] T012 [US1] In `frontend/src/app/login/page.tsx`, on a `200` response store the returned `access`/`refresh` tokens and redirect off `/login` (AC-01, TC-01/TC-02) — depends on T011
- [x] T013 [US1] In `frontend/src/app/login/page.tsx`, disable `#btn-submit-login` and show a loading state while the request is in flight, per constitution FE-06 Form Feedback Standards — depends on T009

**Checkpoint**: SS-US-01 is fully functional — backend behavior characterized by T002–T008, frontend login page built and wired by T009–T013, confirmed end-to-end by `tests/001-system-security/test_ss.spec.ts` (TC-02, TC-04, TC-08) via the Playwright runner added in T017.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [x] T014 [P] Add `POST /auth/login/` and `POST /auth/refresh/` entries to SDS.md §6.3 API Index and §6.4 API Specification (main flow, success response, error responses) — closes the DOD-02 gap flagged in plan.md's Constitution Check
- [x] T015 [P] Correct SDS.md §4.3.3's BR-16 row to name Django's `ModelBackend.user_can_authenticate()` mechanism (invoked by `TokenObtainPairSerializer.validate()`) instead of the nonexistent `AuthenticationService` — closes the Cross-Document Consistency gap flagged in plan.md's Constitution Check
- [x] T016 Run `cd backend && python manage.py test` (full suite) to confirm no regressions elsewhere
- [x] T017 Added a Playwright runner (`playwright.config.ts` + `@playwright/test` devDependency in a `package.json`, `testDir: .`) under `tests/` so `tests/001-system-security/test_ss.spec.ts` can execute — done ahead of schedule to unblock T018's real browser verification; also needed before the Verification Step can run this US's e2e cases. (Originally added at the repo root; later moved into `tests/` to keep test tooling self-contained.)
- [x] T018 Validated `frontend/src/app/login/page.tsx` against live dev servers by running `tests/001-system-security/test_ss.spec.ts` for real (not just manually) — caught and fixed a real bug: the login page built `${NEXT_PUBLIC_API_URL}/auth/login/` assuming the env var already included `/api/v1`, but the actual convention (matching the existing home page's `/health/` call) is a bare origin, so requests 404'd and always showed the generic error even for valid credentials. Fixed in `frontend/src/app/login/page.tsx` to build `${apiOrigin}/api/v1/auth/login/`; all 3 e2e cases (TC-02, TC-04, TC-08) pass after the fix

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Empty — nothing blocks Phase 3
- **User Story 1 (Phase 3)**: Depends on T001
- **Polish (Phase 4)**: T014/T015 are independent of Phase 3; T016/T018 depend on Phase 3 completing

### Within User Story 1

- T002–T007 (tests) can be written in any order/parallel — different test methods, same file, but no shared state
- T008 depends on T002–T007 existing
- T009 has no dependency on the backend tests (different stack) and can start immediately
- T010, T011 depend on T009 (need the form shell first); T010 and T011 touch the same file so are NOT parallel with each other
- T012 depends on T011 (needs the fetch call in place)
- T013 depends on T009 only, but touches the same file as T010–T012 — sequence after them to avoid merge conflicts within one file

### Parallel Opportunities

- T002–T007 [P] — same file (`backend/users/tests.py`) but independent test methods; treat as logically parallelizable, apply sequentially if editing one file causes conflicts in your tooling
- T009 [P] can run alongside T002–T008 (different stack, different files)
- T014 [P] and T015 [P] can run in parallel with each other and with Phase 3 (pure documentation, no code dependency)

---

## Parallel Example: User Story 1

```bash
# Backend characterization tests (can be authored together):
Task: "TC-01 APITestCase for successful login in backend/users/tests.py"
Task: "TC-03 APITestCase for wrong password in backend/users/tests.py"
Task: "TC-05 APITestCase for deactivated account in backend/users/tests.py"

# Frontend shell, independent of backend test-writing:
Task: "Create login page shell in frontend/src/app/login/page.tsx"
```

---

## Implementation Strategy

### MVP First (and only) — this feature has one story

1. T001 (confirm existing wiring)
2. T002–T008 (backend characterization tests)
3. T009–T013 (frontend login page)
4. **STOP and VALIDATE**: run `specs/001-system-security/quickstart.md` manually
5. T014–T018 (doc sync, full regression, e2e infra note, manual browser check)

No incremental multi-story delivery applies — SS-US-01 is this feature's only story so far (SS-US-02 Logout will be a future pass through this same workflow).

---

## Notes

- [P] tasks touch different files, or the same file with no ordering dependency between them
- [US1] labels all Phase 3 tasks — Phase 1/2/4 are unlabeled per the task-generation convention (setup/foundational/polish are not story-specific)
- Commit after each task or logical group, per aif-sdlc.md's Implementation Step
- Stop at the Phase 3 checkpoint to validate SS-US-01 independently before touching Phase 4 documentation tasks
