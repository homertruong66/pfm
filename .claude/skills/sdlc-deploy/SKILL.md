---
name: "sdlc-deploy"
description: "Run Step 5 (Deployment, SE) of the PFM AIF-SDLC: run the regression checks, migrate, and (re)start the backend and frontend on the home-LAN host per RUNBOOK.md, then health-check them for QC."
argument-hint: "WM-US-01 [host_ip=192.168.1.20]"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

## Outline

Overview: `aif-sdlc.md` § Step 5. PFM is a **single-machine home-LAN deployment** (`RUNBOOK.md`): no remote Test Environment, no Docker, no SSH — "deploying" means running the checks, migrating the database and (re)starting the two dev servers on this host, bound to the LAN. This skill never commits.

1. **Parse args:** `US_ID`; optional `host_ip` override.

2. **Load context:** find the `specs/*/sdlc.yaml` whose `stories` map has `US_ID`; extract `FEATURE_FOLDER`, `TEST_ENV_URL`, `API_URL`, `HOST_IP` (the argument overrides `sdlc.yaml`; if both are empty, deploy for `localhost` and say the run is local, not LAN). None → STOP: "Run `/sdlc-init` first."

3. **Pre-flight** (the constitution is not auto-loaded: skim `.specify/memory/constitution.md` § Development Workflow and § Security Requirements for the deploy rules — tests/lint/build must pass, `SECRET_KEY`/`DEBUG`/`ALLOWED_HOSTS` limits):
   - `{FEATURE_FOLDER}/spec.md` and `plan.md` exist and mention `{US_ID}`.
   - The Implementation Step branch for `{US_ID}` is **merged into `develop`**: `git branch --merged develop --list "feature/{us-lower}-implementation-step"` (or the merge commit in `git log develop --merges --grep "{us-lower}-implementation-step"`). Not merged → STOP: "Merge the Implementation branch into `develop` first."
   - The working tree is on `develop`, up to date (`git pull origin develop` if online).

4. **Run the regression checks** (all must pass before anything is restarted):
   ```
   cd backend && .venv\Scripts\activate && python manage.py test
   cd backend && python manage.py makemigrations --check --dry-run
   cd frontend && npm run lint && npm run build
   ```

5. **Migrate the host database** — ask the user first: this changes the real `backend/db.sqlite3` (`RUNBOOK.md` §6). If they agree: `cd backend && python manage.py migrate`. If a User-facing story needs an ADMIN that does not exist yet, remind them to run `python manage.py createsuperuser` (RUNBOOK §9; it also asks for a full name).

6. **(Re)start both servers bound to the LAN** (`RUNBOOK.md` §7). Check what already listens on `:8000` / `:3000`; if a server is running, ask before stopping it — never kill a process without the user's go-ahead. Then start them in the background:
   ```
   cd backend && .venv\Scripts\activate && python manage.py runserver 0.0.0.0:8000
   cd frontend && npm run dev -- -H 0.0.0.0
   ```
   `ALLOWED_HOSTS` (`backend/config/settings.py`), `CORS_ALLOWED_ORIGINS` and the frontend's `NEXT_PUBLIC_API_URL` must include the host's LAN IP (`RUNBOOK.md` §4–5); if they do not, say what to change — do not edit them silently.

7. **Health checks:**
   ```
   curl -s http://{HOST}:8000/health/        # expect {"status": "OK"}
   curl -s -o /dev/null -w "%{http_code}\n" http://{HOST}:3000/        # expect 200
   curl -s -o /dev/null -w "%{http_code}\n" http://{HOST}:8000/api/v1/auth/login/ -X POST -H "Content-Type: application/json" -d "{}"   # expect 400, not a connection error
   ```
   `{HOST}` = `HOST_IP` or `localhost`. If a check fails, show the relevant server output and STOP — the step is not complete.

8. **Review gate:** go through [`aif-review-checklist.md` § Step 5](../../../aif-review-checklist.md#step-5--deployment-step--se-reviews) item by item. Show the checked list, the test/lint/build results, the migration result and the health checks, and ask the user to review. If the run was local (no `HOST_IP`) say so plainly — Verification then records `localhost`, a deviation from the LAN requirement, in its report.

9. **Report:** deployment status, any failed check, the commit that is running (`git rev-parse --short HEAD`), the App URL for QC, and:
   ```
   /sdlc-verify {US_ID}
   ```
