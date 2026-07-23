# Demo: Debugging the Login Flow — UI → Frontend → Backend → Database

A walkthrough for setting real breakpoints across the stack and watching one login request pause on both sides of the network boundary.

Debug configs used below live in [.vscode/launch.json](.vscode/launch.json):
- **BE: Django (manage.py runserver)** — runs the backend under the debugger, `justMyCode: false` so breakpoints work inside installed library code too, not just this repo's own files.
- **FE: Chrome against localhost:3000/login** — opens a debuggable Chrome window at the login page.
- **Debug FE + BE together** — a compound that starts both at once.

---

## One-time setup (Windows / PowerShell)

1. Start the frontend dev server manually and leave it running (own terminal):
   ```powershell
   cd frontend
   npm run dev
   ```
   (The Chrome debug config only opens a browser tab at an existing URL — it doesn't start the Next.js server itself.)
2. In VSCode: **Run and Debug** panel → select **"Debug FE + BE together"** → press ▶.
   This starts the Django backend *under the debugger* (replacing a plain `manage.py runserver` terminal) and launches a debuggable Chrome window at `/login`.

   **Important — check the TERMINAL panel, not the DEBUG CONSOLE tab.** A compound launch runs two debug sessions at once, and the DEBUG CONSOLE tab only shows one of them (often whichever session is currently selected — usually Chrome's, showing HMR/source-map noise, not Django). `runserver`'s actual output goes to a separate integrated terminal the debugger opens automatically. Click the **TERMINAL** tab and look for the terminal named `Python Debugger: BE: Django (manage.py runserver)` (there'll be a dropdown at the top-right of the TERMINAL panel if more than one terminal is open — use it to switch). Wait there for `Starting development server at http://127.0.0.1:8000/` before continuing — registering the demo account (next step) needs the backend already listening.

   **If the server prints its startup banner then the terminal immediately returns to a `PS ...>` prompt (server has quit, no port listening, no Ctrl+Break pressed):** this was caused by `--noreload` in the launch config fighting debugpy's own process supervision — removed from `.vscode/launch.json` (added `"subProcess": true` instead, which is debugpy's own supported way to auto-attach to Django's autoreloader child process, so breakpoints still work correctly without needing to disable the reloader). If you still see it recur, try launching **just** the `BE: Django (manage.py runserver)` config on its own (not the compound) to rule out any interaction with the Chrome session.
3. Register one demo account, in a separate PowerShell terminal (not the Debug Console). Windows PowerShell aliases `curl` to `Invoke-WebRequest`, which doesn't take `-d`/`-X` the same way — use `Invoke-RestMethod` instead:
   ```powershell
   Invoke-RestMethod -Uri http://localhost:8000/api/v1/users/ -Method Post `
     -ContentType "application/json" `
     -Body '{"username":"demo","email":"demo@example.com","password":"Demo-Passw0rd!"}'
   ```
   (If real `curl.exe` is on PATH — check with `Get-Command curl.exe` — the original `curl -X POST ... -d '...'` form works too, just call it as `curl.exe` explicitly so PowerShell doesn't route it through the `Invoke-WebRequest` alias.)
   If this still fails with "Unable to connect to the remote server", the backend debug session in step 2 either hasn't finished starting yet or failed to start — check the Debug Console for errors before retrying.
4. Confirm the account actually landed in `db.sqlite3` — a good moment to show students the database layer directly, in a **third** terminal (don't reuse the one running `runserver`):
   ```powershell
   cd backend
   .venv\Scripts\python.exe manage.py shell
   ```
   ```python
   from users.models import User
   User.objects.all().values('id', 'email', 'password', 'is_active')
   ```
   You should see the `demo` account with `is_active: True`. Type `exit()` to leave the shell. This is the same technique used in Part 2/3 below (the `authenticate()` breakpoint), just without a breakpoint — a plain read of what's actually stored, to confirm the account exists before debugging the login request against it.

---

## Part 1 — Breakpoint in FE code (your own code)

1. Open `frontend/src/app/login/page.tsx`.
2. Click in the gutter at the `event.preventDefault();` line inside `handleSubmit` — a red dot appears.
3. In the Chrome window VSCode opened, type the demo credentials and click **Log in**.
4. VSCode jumps to the front, execution paused on that line. Show students:
   - Hover `email` / `password` to see their live values.
   - **Step Over** (`F10`) through the empty-field check.
   - Step into the `fetch(...)` line, then **Continue** (`F5`) — the request actually goes out now.

---

## Part 2 — Breakpoint in BE code

This login endpoint is a stock library view (`djangorestframework-simplejwt`'s `TokenObtainPairView`) with zero hand-written business logic in this repo — a deliberate design choice, worth calling out. So "backend code" here means stepping into the installed package itself:

1. In VSCode: `Ctrl+P` → paste `backend\.venv\Lib\site-packages\django\contrib\auth\backends.py` → open it.
2. Find `def authenticate(self, request, username=None, password=None, **kwargs):` (around line 59) — click the gutter to set a breakpoint.
3. Also set one a few lines down in `def user_can_authenticate(self, user):` (around line 91) — this is the exact line that enforces "deactivated accounts can't log in" (BR-16).
4. Back in the Chrome window, submit the login form again.
5. VSCode pauses inside `backends.py` this time. Step through, inspect `user.is_active`, and **Continue** to let it finish.

---

## Part 3 — The full round trip, both breakpoints armed

1. Keep both breakpoints active — the FE line in `page.tsx` and the BE line in `backends.py`.
2. Submit the form once.
3. VSCode stops at the **FE breakpoint** first (frontend paused, nothing sent yet).
4. **Continue** → the browser sends the request → VSCode now stops at the **BE breakpoint** (backend paused mid-authentication, browser tab looks frozen — good moment to point out *why* it's frozen: the whole HTTP request is blocked waiting on this exact line).
5. **Continue** → backend finishes, response flows back → browser redirects (or shows the error message, if the wrong password was typed).

That's the same request, paused twice, once on each side of the network boundary.

---

## Bonus — the invalid-password path

To show the *rejection* path instead of the happy path:

1. Set a breakpoint in `backend\.venv\Lib\site-packages\rest_framework_simplejwt\serializers.py`, inside `TokenObtainPairSerializer.validate` (around line 72) — right where `authenticate()` is called.
2. Submit the login form with the correct email but a wrong password.
3. Step over the `authenticate()` call — watch it return `None` instead of a `User` object.
4. Step further — the serializer raises `AuthenticationFailed`, which DRF turns into the `401` response with the generic `"No active account found with the given credentials"` body.
5. Point out to students: the *same* generic message is returned whether the password was wrong or the account was deactivated — that's intentional (an attacker probing logins can't tell which case they hit).
