---
name: "sdlc-implement"
description: "Run Step 4 (Implementation, SE) of the PFM AIF-SDLC: tasks, code via TDD against the test cases, analyze gates, document sync, and a review gate. The user commits and merges."
argument-hint: "WM-US-01"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Overview: `aif-sdlc.md` § Step 4. This skill never commits, pushes or merges.

1. **Parse args:** `US_ID` from `$ARGUMENTS`.

2. **Load context:** find the `specs/*/sdlc.yaml` whose `stories` map has `US_ID`; extract `FEATURE_FOLDER`, `TESTING_FOLDER`, `FEATURE_ID`, `SLUG`, story `TITLE`. None → STOP: "Run `/sdlc-init` first."

3. **Pre-flight (all on the latest `develop`):** `{FEATURE_FOLDER}/spec.md` and `plan.md` contain `{US_ID}`, and `{FEATURE_FOLDER}/test_cases.md` contains a `## {US_ID}:` section (TDD needs the test cases). Missing → STOP, name the step to run first and remind the user to merge its branch into `develop`.

4. **Branch:** uncommitted changes → STOP. `git checkout develop`, `git pull origin develop` (skip offline), `git checkout -b feature/{us-lower}-implementation-step` (switch if it exists).

5. **Implementation work** (follow `aif-sdlc.md` § Step 4):
   - Prefix every `.specify/scripts/bash/*.sh` command the speckit skills run with `SPECIFY_FEATURE={FEATURE_ID}-{SLUG} SPECIFY_FEATURE_DIRECTORY={FEATURE_FOLDER}` (PFM branches are `feature/…`, which spec-kit's branch check rejects; without the directory variable the scripts follow `.specify/feature.json`, which may point at another feature). Prefix every call.
   - The governing constitution is `.specify/memory/constitution.md`; tell `/speckit-analyze` and `/speckit-implement` to use it.
   - **Snapshot** `{FEATURE_FOLDER}/tasks.md` (if present) to the scratchpad.
   - `/speckit-tasks` for `{US_ID}` only: add a phase for this story to the existing `tasks.md` (create it if missing), leave every existing task unchanged, generate the test tasks first (from `test_cases.md`; TDD), continue numbering after the highest `T` ID, and name the exact files (plan.md's Open tasks are the source). **Verify against the snapshot** that earlier task lines are unchanged and IDs do not collide; restore and redo otherwise.
   - `/speckit-analyze` (pre-implementation) — resolve every Critical and High finding before coding, and **save the report** as `{FEATURE_FOLDER}/analysis-{us-lower}-pre.md` so the gate can be audited later (`aif-review-checklist.md` § Step 4).
   - `/speckit-implement` for the `{US_ID}` tasks only — tests first, then code. Pass this checklist-gate rule: in `checklists/*.md`, `- [~]` means **Deferred** (counted, reported in its own column, never blocking); only `- [ ]` is incomplete.
   - Code rules (constitution): Django app per entity; thin views, serializers as DTOs with explicit `fields`, service function only where AR-01 requires it, `transaction.atomic()` for multi-model writes; permission classes plus ownership-scoped `get_queryset()` (`401` / `403` / `404`); catalogued SDS §6.6 error codes; new migrations only (never edit a merged one, never touch `db.sqlite3`); frontend in TypeScript with native forms, NC-04 element IDs from `plan.md`, direct `fetch` with the Bearer token, no new dependency; logging per Logging & Audit (auth events and state changes, never passwords/JWTs/financial data).
   - Tests: Django `APITestCase`s in the app's `tests.py` for the integration TCs (happy path, `401`/`403`/`404`, validation, state transitions) against the real test database — no mocking of models/querysets; name each test after its TC (`test_tc05_…`).
   - `/speckit-analyze` again (post-implementation) — save `{FEATURE_FOLDER}/analysis-{us-lower}-post.md`; no new Critical/High findings.
   - Run `cd backend && python manage.py test`, `cd frontend && npm run lint && npm run build`, and `python manage.py makemigrations --check --dry-run` (clean after the migration was generated).
   - **Document sync (Definition of Done):** SRS §7 ACs refined if edge cases appeared; `plan.md` records every decision made while implementing; SDS §5.x.N finalised; SDS §2.1 traceability row(s) with the actual app/model/table; SDS §4.3.3 columns; SDS §6.2 DTO registry, §6.3 API index, §6.4 specification, §6.5 traceability, §6.6 error codes; "Last synced" dates; `RUNBOOK.md` / `CLAUDE.md` / `README.md` if ports, env vars, setup steps or the endpoint list changed. A story with stale documents is not done.

6. **Review gate:** go through [`aif-review-checklist.md` § Step 4](../../../aif-review-checklist.md#step-4--implementation-step--se-reviews) item by item. Show the checked list, a summary of changes (backend, frontend, migrations, tests, docs), both analyze reports and the test results, and ask the user to review. Apply changes and repeat.

7. **Report:** the branch, files changed, and the next actions: commit the branch, merge it into `develop` (`git merge --no-ff`; a PR is optional — the repo has an `origin` remote), then:
   ```
   /sdlc-deploy {US_ID}
   ```
