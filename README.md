# Personal Finance Management (PFM)

A full-stack personal finance management app built with **Next.js** (frontend) and **Django REST Framework** (backend).

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | **3.12+** | [python.org](https://python.org) |
| npm | 9+ | Bundled with Node.js |

> **Check your Python version before continuing:** run `python --version`. If it's below 3.12, install 3.12+ from [python.org](https://python.org) (or `winget install Python.Python.3.12` on Windows) — `pip install -r requirements.txt` will fail with a confusing "no version satisfies Django==..." error otherwise, since Django requires 3.12+.
>
> **If you have more than one Python version installed**, `python`/`python3` may not point at 3.12. Use the version-specific command when creating the virtual environment below:
> - Windows: `py -3.12 -m venv .venv` (check available versions with `py -0`)
> - macOS/Linux: `python3.12 -m venv .venv`

---

## Project Structure

```
pfm/
├── frontend/   # Next.js · React · TypeScript · Tailwind CSS
└── backend/    # Django · Django REST Framework · SQLite
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create and activate virtual environment (first time only)
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Apply migrations (first time only)
python manage.py migrate

# Start dev server → http://localhost:8000
python manage.py runserver
```

### 2. Frontend

Open a **separate terminal**:

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start dev server → http://localhost:3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **No default login exists.** Either register a new account through the app's sign-up flow (`POST /api/v1/users/`), or create the first ADMIN account yourself with `python manage.py createsuperuser` (see [Useful Commands](#useful-commands)).

---

## Troubleshooting First-Time Setup

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `pip install -r requirements.txt` fails with `Could not find a version that satisfies the requirement Django==...` | Your `.venv` was created with Python < 3.12 | Delete `.venv`, re-check `python --version`, then recreate it with 3.12+ (see the Prerequisites note above) |
| `pip install` fails with `CERTIFICATE_VERIFY_FAILED` / SSL errors | A broken or incomplete Python install (missing CA bundle) | Reinstall Python from the official [python.org](https://python.org) installer (or `winget install Python.Python.3.12`) rather than a minimal/embedded distribution |
| `python`/`pip` not recognized | Python not added to PATH during install | Re-run the Python installer and check "Add python.exe to PATH", or use the `py` launcher on Windows instead |
| Frontend loads but API calls fail | Backend server isn't running, or is running on a different port | Confirm `python manage.py runserver` is running in its own terminal on port 8000 |

---

## API Base URL

All backend API routes are prefixed with `/api/v1/`.

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/v1/auth/login/` | POST | Obtain JWT access + refresh tokens | Public |
| `/api/v1/auth/refresh/` | POST | Refresh access token | Public |
| `/api/v1/users/` | POST | Register a new user | Public |
| `/api/v1/wallets/` | GET, POST | List / create wallets | Required |
| `/api/v1/categories/` | GET, POST | List / create categories | Required |
| `/api/v1/budgets/` | GET, POST | List / create budgets | Required |
| `/api/v1/transactions/` | GET, POST | List / create transactions | Required |
| `/api/v1/notifications/` | GET | List notifications | Required |

Include the JWT token in requests as:
```
Authorization: Bearer <access_token>
```

---

## Useful Commands

### Backend

```bash
# Create a superuser for the Django admin panel
python manage.py createsuperuser

# Open Django admin → http://localhost:8000/admin
```

### Frontend

```bash
# Type-check
npm run build

# Lint
npm run lint
```
