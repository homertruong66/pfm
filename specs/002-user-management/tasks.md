# Tasks: User Management — UM-US-01 Create a User

**Input**: Design documents from `specs/002-user-management/` (spec.md, plan.md — including its UM-US-01 Open tasks T1–T12 — and test_cases.md) and `testing/002-user-management/` (test_um.spec.ts)

**Tests**: Included — constitution.md DOD-05 requires at least one `APITestCase` for the happy path plus key error cases. The Playwright suite for TC-02/04/06/11/13 already exists from the Quality Step and is referenced, not duplicated.

**Organization**: One user story (UM-US-01). Phase 1 sets up the new `roles` app, Phase 2 the shared pieces every later User Management/ADMIN story reuses, Phase 3 the story itself, Phase 4 re-bases the SS-US-01 tests and syncs the documents.

**Plan ↔ task mapping**: plan.md's *Open tasks* T1–T13 correspond to these tasks as follows — T13 → T019, T1 → T001–T002, T2 → T003, T3 → T004, T4 → T008–T009, T5 → T010, T6 → T011, T7 → *(skipped)*, T8 → T005–T007 + T012, T9 → T014, T10 → T013, T11 → T015, T12 → T016–T017.

**Order note**: the tests below are listed before the implementation, but in practice the service, serializer and view were written first and the tests after, so there is no red-then-green record for T005–T007.

## Phase 1: Setup

- [x] T001 [P] Create the `roles` app: `Role` model (`code` unique, `ADMIN`/`USER`, `db_table = 'roles'`) in `backend/roles/models.py`, `backend/roles/apps.py`, register `'roles'` in `INSTALLED_APPS` in `backend/config/settings.py` (plan T1)
- [x] T002 Generate `backend/roles/migrations/0001_initial.py` (`makemigrations roles`) and add the data migration `backend/roles/migrations/0002_seed_roles.py` inserting the `ADMIN` and `USER` rows (reversible) — depends on T001

---

## Phase 2: Foundational

**Purpose**: model/permission pieces the story and later stories depend on. Blocks Phase 3.

- [x] T003 In `backend/users/models.py` add `full_name` (`CharField(150)`), `roles` (`ManyToManyField('roles.Role', related_name='users', db_table='user_roles')`), a `UserManager` whose `create_superuser` also grants the `ADMIN` role, and `User.has_role(code)`; generate `backend/users/migrations/0002_*.py` (existing rows get `full_name = ''`) — depends on T002 (plan T2)
- [x] T004 [P] Add the `IsAdmin` permission class (authenticated and holds `ADMIN`) in `backend/config/permissions.py` (plan T3)

**Checkpoint**: `python manage.py makemigrations --check` is clean and `python manage.py migrate` applies on an empty database.

---

## Phase 3: User Story 1 — UM-US-01 Create a User (Priority: P1) 🎯 MVP

**Goal**: An ADMIN creates a family member's account (full name, email, initial password); the account is active, holds only the `USER` role, can log in, and a duplicate email is rejected.

**Independent Test**: Follow plan.md's UM-US-01 Quickstart Validation — the `curl` calls for AC-01..05/EC-01..09, then the browser steps at `http://localhost:3000/users/new`.

### Tests for User Story 1

> Written against `specs/002-user-management/test_cases.md` (the integration cases are TC-01, 03, 05, 07, 08, 09, 10, 12, 14..22). Expected to FAIL until T008–T010 land.

- [x] T005 [P] [US1] TC-01, TC-08, TC-18: success path — `201` body shape, no `password` key, new User can log in, non-English full name round-trips — in `backend/users/tests.py` (`CreateUserTests`)
- [x] T006 [P] [US1] TC-03, TC-12, TC-14, TC-15, TC-16: validation — `400` with the spec's exact messages, boundary values accepted at 8-character password / 150-character name — in `backend/users/tests.py`
- [x] T007 [P] [US1] TC-05, TC-17, TC-21, TC-07, TC-09, TC-10, TC-19, TC-20: `409` duplicate (and its database-level variant) (exact and different capitalization), `401`, `403` for USER-only and for the freshly created User, atomic rollback when the `USER` role row is missing — in `backend/users/tests.py`; plus `backend/roles/tests.py` for the seeded roles and `createsuperuser` granting `ADMIN`

### Implementation for User Story 1

- [x] T008 [US1] `UserAlreadyExists` (`409`, body `{"detail": "Account already exists", "code": "USER_ALREADY_EXISTS"}`) in `backend/users/exceptions.py`
- [x] T009 [US1] `create_user(full_name, email, password)` in `backend/users/services.py`: `transaction.atomic()`, case-insensitive duplicate check, `IntegrityError` mapped to `UserAlreadyExists`, `username` = email, assigns the `USER` role, logs success at `INFO` and a rejected duplicate at `WARN` — never the password — depends on T003, T008
- [x] T010 [US1] Rewrite `UserSerializer` in `backend/users/serializers.py`: explicit `fields` (`id`, `full_name`, `email`, `is_active`, `created_at`, write-only `password`), the spec's required/invalid/length messages, no `UniqueValidator`, `create()` delegates to the service — depends on T009
- [x] T011 [US1] Replace `UserListCreateView` with `UserCreateView` (`CreateAPIView`, `permission_classes = [IsAdmin]`), route name `user-create`; remove `UserDetailView` and the `users/<id>/` route — in `backend/users/views.py`, `backend/users/urls.py` — depends on T004, T010
- [x] T012 [US1] Run `cd backend && python manage.py test` — T005–T007 pass (depends on T011)
- [x] T013 [P] [US1] Create the Create User page `frontend/src/app/users/new/page.tsx` with the Element IDs from plan.md (`user-full-name`, `user-email`, `user-password`, `*-error`, `btn-submit-user`, `message-success`, `message-error`, `message-access-denied`): required-field checks before submit (AC-02, EC-03), Bearer fetch to `${NEXT_PUBLIC_API_URL}/api/v1/users/`, API field messages shown inline, `409` → `#message-error`, `403` → `#message-access-denied`, `401` → redirect to `/login`, loading state on the button (FE-06), no token → redirect to `/login`

**Checkpoint**: UM-US-01 works end to end against the dev servers; `npm run lint` and `npm run build` pass.

---

## Phase 4: Polish & Cross-Cutting Concerns

- [x] T014 Re-base SS-US-01 backend tests: fixtures via `User.objects.create_user` instead of the now ADMIN-only endpoint, in `backend/users/tests.py` (plan T9)
- [x] T015 Re-base SS-US-01 e2e seeding on `testing/support/api.ts` (`createUserAsAdmin`) in `testing/001-system-security/test_ss.spec.ts` (plan T11); document `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` in RUNBOOK.md
- [x] T016 [P] SDS sync (plan T12): §2.1 traceability rows for `User` / `Role` / `user_roles`, §4.3.3 `users` columns and Migration Strategy (first-ADMIN wording), §6.2.1 DTO Registry, §6.3 API Index (`API-UM-01`), §6.4 API Specification, §6.5 traceability, §6.6 error code `USER_ALREADY_EXISTS`, "Last synced" dates
- [x] T017 [P] constitution.md §V and CLAUDE.md: drop `POST /api/v1/users/` from the public routes and the "register a USER via POST /api/v1/users/" hint; RUNBOOK.md §9 rewritten (ADMIN via `createsuperuser`, family accounts created through the app); `specs/001-system-security/plan.md` quickstart no longer offers `POST /api/v1/users/` as a seeding option
- [x] T018 Run the full suites: `python manage.py test`, `npm run lint`, `npm run build`

- [x] T019 *(added 2026-10-08)* EC-10: store the email in lower case in `create_user`, migration `backend/users/migrations/0004_lowercase_emails.py` for existing accounts, TC-22 in `backend/users/tests.py`

---

## Dependencies & Execution Order

- T001 → T002 → T003 → T009 → T010 → T011 → T012; T004 and T008 are independent of each other and feed T011/T009
- T005–T007 can be written in parallel with T008–T011 (same file, independent test methods)
- T013 depends only on the API contract in plan.md and can run alongside the backend work
- T014/T015 depend on T011 (the endpoint is locked down); T016/T017 are documentation and independent

## Implementation Strategy

1. T001–T004 (roles app, model, permission) → checkpoint
2. T005–T012 (tests first, then service/serializer/view) → backend green
3. T013 (frontend page) → lint/build
4. T014–T018 (re-base SS tests, doc sync, full regression)

## Notes

- [P] tasks touch different files, or the same file with no ordering dependency between them
- `UserDetailView` (`users/<id>/`) was **removed** after a live probe showed it let any logged-in User overwrite/delete any account — see plan.md G8 and TC-20; UM-US-02/03/05/06 add their own endpoints
- The plan's Constitution Check commits to logging in `create_user` (T009); verify it exists before closing the story
